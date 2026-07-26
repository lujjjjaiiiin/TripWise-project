"""TripWise AI — data loading and model fitting.

Loaded once at server startup; all components are reused across requests.
"""
from __future__ import annotations

import logging
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────────────
# Feature configuration (per spec — no lat/lon)
# ──────────────────────────────────────────────────────────────────────────────

RECOMMENDATION_FEATURES: list[str] = [
    "culture", "adventure", "nature", "beaches", "nightlife",
    "cuisine", "wellness", "urban", "seclusion",
    "has_airport", "is_short_trip", "is_one_week",
    "temp_avg_yearly", "budget_level_encoded", "HotelRating_encoded",
    "rating_was_unknown",
    "region_africa", "region_asia", "region_europe", "region_middle_east",
    "region_north_america", "region_oceania", "region_south_america",
]

TASTE_KEYS: list[str] = [
    "culture", "adventure", "nature", "beaches", "nightlife",
    "cuisine", "wellness", "urban", "seclusion",
]

TASTE_LABELS: dict[str, str] = {
    "culture": "Culture",
    "adventure": "Adventure",
    "nature": "Nature",
    "beaches": "Beaches",
    "nightlife": "Nightlife",
    "cuisine": "Cuisine",
    "wellness": "Wellness",
    "urban": "City Life",
    "seclusion": "Quiet",
}

TASTE_LABELS_AR: dict[str, str] = {
    "culture": "الثقافة",
    "adventure": "المغامرة",
    "nature": "الطبيعة",
    "beaches": "الشواطئ",
    "nightlife": "الحياة الليلية",
    "cuisine": "المأكولات",
    "wellness": "الاستجمام",
    "urban": "حياة المدينة",
    "seclusion": "العزلة",
}

BUDGET_LABEL: dict[int, str] = {1: "budget", 2: "mid-range", 3: "luxury"}
BUDGET_LABEL_AR: dict[int, str] = {1: "اقتصادية", 2: "متوسطة", 3: "فاخرة"}

RANDOM_STATE = 42
KMEANS_MIN_K, KMEANS_MAX_K = 3, 8
KMEANS_ROWS_PER_CLUSTER = 14
MAX_PER_CLUSTER = 2

# ──────────────────────────────────────────────────────────────────────────────
# Dataset discovery
# ──────────────────────────────────────────────────────────────────────────────

def find_dataset() -> Path:
    """Locate the dataset CSV; try several candidate paths."""
    here = Path(__file__).parent
    workspace_root = here.parent.parent  # artifacts/api-server → workspace root
    candidates = [
        here / "data" / "tripwise_data.csv",
        here / "tripwise_data.csv",
        workspace_root / "attached_assets" / "0_tripwise_data_1785033927688.csv",
    ]
    for p in candidates:
        if p.exists():
            logger.info("Dataset found at %s", p)
            return p
    raise FileNotFoundError(
        f"Dataset not found. Tried: {[str(c) for c in candidates]}"
    )


# ──────────────────────────────────────────────────────────────────────────────
# Data cleaning
# ──────────────────────────────────────────────────────────────────────────────

_NULL_TOKENS = frozenset({"", "unknown", "not specified", "nan", "none", "n/a", "na", "-", "null", r"\N"})


def _clean_str(v) -> str | None:
    if v is None:
        return None
    try:
        if pd.isna(v):
            return None
    except (TypeError, ValueError):
        pass
    s = str(v).strip()
    return None if s.lower() in _NULL_TOKENS else s


def load_and_clean_data(path: Path) -> pd.DataFrame:
    """Load, coerce, and deduplicate the travel catalogue."""
    df = pd.read_csv(path, low_memory=False)
    logger.info("Raw CSV: %d rows, %d columns", len(df), len(df.columns))

    # Coerce boolean-like region columns (True/False strings → 0/1)
    region_cols = [c for c in RECOMMENDATION_FEATURES if c.startswith("region_")]
    for col in region_cols:
        if col in df.columns:
            df[col] = df[col].apply(
                lambda x: 1 if str(x).strip().lower() in ("true", "1") else 0
            )

    # Coerce all feature columns to numeric, fill NaN with 0
    for feat in RECOMMENDATION_FEATURES:
        if feat in df.columns:
            df[feat] = pd.to_numeric(df[feat], errors="coerce").fillna(0)
        else:
            df[feat] = 0.0

    # Deduplicate by city+country, one row per destination
    df = df.drop_duplicates(subset=["city", "country"], keep="first")
    df = df.reset_index(drop=True)

    logger.info("Clean catalogue: %d destinations", len(df))
    return df


# ──────────────────────────────────────────────────────────────────────────────
# Model bundle — fitted once, reused per request
# ──────────────────────────────────────────────────────────────────────────────

def _choose_k(n_rows: int) -> int:
    if n_rows < KMEANS_MIN_K * 2:
        return max(1, min(KMEANS_MIN_K, n_rows))
    return int(np.clip(n_rows // KMEANS_ROWS_PER_CLUSTER, KMEANS_MIN_K, KMEANS_MAX_K))


class ModelBundle:
    """All fitted ML components for one catalogue — loaded once at startup."""

    def __init__(self, df: pd.DataFrame) -> None:
        self.df = df
        self.feature_cols: list[str] = [
            c for c in RECOMMENDATION_FEATURES if c in df.columns
        ]

        X = df[self.feature_cols].to_numpy(dtype=float)

        # Fit StandardScaler and transform
        self.scaler = StandardScaler()
        self.X_scaled: np.ndarray = self.scaler.fit_transform(X)

        # Precompute row norms for fast cosine similarity
        self.norms: np.ndarray = np.linalg.norm(self.X_scaled, axis=1)
        self.norms[self.norms == 0] = 1e-9

        # Fit K-Means clustering
        k = _choose_k(len(df))
        self.kmeans = KMeans(n_clusters=k, random_state=RANDOM_STATE, n_init=10)
        self.labels: np.ndarray = self.kmeans.fit_predict(self.X_scaled)

        # Characterise each cluster by its top taste dimensions
        catalogue_mean = {
            c: float(df[c].mean()) for c in TASTE_KEYS if c in df.columns
        }
        self.cluster_profiles: dict[int, list[str]] = {}
        for cid in range(k):
            members = df.loc[self.labels == cid]
            if members.empty:
                self.cluster_profiles[cid] = []
                continue
            profile = {c: float(members[c].mean()) for c in TASTE_KEYS if c in members.columns}
            lifts = sorted(
                ((key, profile[key] - catalogue_mean.get(key, 3.0)) for key in TASTE_KEYS),
                key=lambda kv: -kv[1],
            )
            self.cluster_profiles[cid] = [key for key, lift in lifts[:2] if lift > 0.35]

        # Compute evaluation metrics
        self.silhouette: float = (
            float(silhouette_score(self.X_scaled, self.labels)) if k > 1 else 0.0
        )
        self.precision_at_10: float = self._precision_at_10()
        self.intra_list_diversity: float = self._intra_list_diversity()

        logger.info(
            "Models ready — features: %d, clusters: %d | "
            "Silhouette=%.3f, P@10=%.3f, ILD=%.3f",
            len(self.feature_cols), k,
            self.silhouette, self.precision_at_10, self.intra_list_diversity,
        )

    # ── Evaluation helpers ────────────────────────────────────────────────────

    def _precision_at_10(self, threshold: float = 0.5) -> float:
        """Threshold-based proxy evaluation — NOT ground-truth accuracy.

        Uses cosine similarity ≥ 0.5 as a relevance proxy because we have no
        historical user feedback or booking labels to define true relevance.
        """
        sims = cosine_similarity(self.X_scaled)
        precisions: list[float] = []
        for i in range(min(50, len(self.df))):
            row_sims = sims[i].copy()
            row_sims[i] = -1.0  # exclude self
            top10 = np.argsort(-row_sims)[:10]
            relevant = sum(1 for j in top10 if sims[i][j] >= threshold)
            precisions.append(relevant / 10)
        return float(np.mean(precisions)) if precisions else 0.0

    def _intra_list_diversity(self) -> float:
        """Average pairwise cosine distance within top-10 recommendation lists."""
        sims = cosine_similarity(self.X_scaled)
        diversities: list[float] = []
        for i in range(min(50, len(self.df))):
            row_sims = sims[i].copy()
            row_sims[i] = -1.0
            top10 = np.argsort(-row_sims)[:10]
            if len(top10) < 2:
                continue
            pairs = [
                max(0.0, 1 - sims[top10[a]][top10[b]])
                for a in range(len(top10))
                for b in range(a + 1, len(top10))
            ]
            diversities.append(float(np.mean(pairs)))
        return float(np.mean(diversities)) if diversities else 0.0

    # ── Inference helpers ─────────────────────────────────────────────────────

    def transform_user(self, prefs: dict) -> np.ndarray:
        """Scale a user preference dict into the same space as the catalogue."""
        row = np.array([prefs.get(c, 0.0) for c in self.feature_cols], dtype=float)
        return self.scaler.transform(row.reshape(1, -1))

    def cluster_name(self, row_idx: int) -> str:
        cid = int(self.labels[row_idx])
        keys = self.cluster_profiles.get(cid, [])
        if not keys:
            return "All-rounder"
        return " & ".join(TASTE_LABELS.get(k, k) for k in keys)

    def get_cluster_info(self) -> list[dict]:
        k = len(set(self.labels.tolist()))
        result = []
        for cid in range(k):
            mask = self.labels == cid
            cities = self.df.loc[mask, "city"].tolist()[:5]
            top_tastes = [TASTE_LABELS.get(t, t) for t in self.cluster_profiles.get(cid, [])]
            result.append({
                "id": cid,
                "size": int(mask.sum()),
                "top_tastes": top_tastes,
                "cities": cities,
            })
        return result
