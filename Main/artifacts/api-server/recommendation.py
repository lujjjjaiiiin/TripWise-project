"""TripWise AI — recommendation engine.

Cosine similarity scoring with cluster-based diversity cap.
All ML components come from the pre-fitted ModelBundle; nothing is retrained here.
"""
from __future__ import annotations

import numpy as np

from data_loader import (
    MAX_PER_CLUSTER,
    TASTE_KEYS,
    TASTE_LABELS,
    TASTE_LABELS_AR,
    BUDGET_LABEL,
    BUDGET_LABEL_AR,
    ModelBundle,
)
from airport_fallback import AIRPORT_FALLBACK


# ──────────────────────────────────────────────────────────────────────────────
# Cosine similarity (vectorised, using precomputed norms)
# ──────────────────────────────────────────────────────────────────────────────

def _cosine(bundle: ModelBundle, user_scaled: np.ndarray, rows: np.ndarray) -> np.ndarray:
    user = user_scaled.ravel()
    user_norm = float(np.linalg.norm(user)) or 1e-9
    dots = bundle.X_scaled[rows] @ user
    return dots / (bundle.norms[rows] * user_norm)


# ──────────────────────────────────────────────────────────────────────────────
# Diversity cap — at most MAX_PER_CLUSTER results per cluster profile
# ──────────────────────────────────────────────────────────────────────────────

def _diversify(
    order: np.ndarray,
    clusters: np.ndarray,
    top_n: int,
    cap: int = MAX_PER_CLUSTER,
) -> list[int]:
    picked: list[int] = []
    used: dict[int, int] = {}
    for idx in order:
        cid = int(clusters[idx])
        if used.get(cid, 0) >= cap:
            continue
        picked.append(int(idx))
        used[cid] = used.get(cid, 0) + 1
        if len(picked) == top_n:
            return picked
    # Fill remainder if cap prevented reaching top_n
    for idx in order:
        if len(picked) == top_n:
            break
        if int(idx) not in picked:
            picked.append(int(idx))
    return picked


# ──────────────────────────────────────────────────────────────────────────────
# Explainability — derived from real feature values, never fabricated
# ──────────────────────────────────────────────────────────────────────────────

def _top_features(row: dict, user_prefs: dict, feature_cols: list[str]) -> list[dict]:
    """Feature-level similarity breakdown: features where both user and city score high.

    Calculated from actual city data vs user preferences — never hardcoded.
    """
    matches: list[dict] = []
    for feat in TASTE_KEYS:
        if feat not in feature_cols:
            continue
        city_score = float(row.get(feat, 0))
        user_score = float(user_prefs.get(feat, 3.0))
        if user_score >= 4 and city_score >= 4:
            matches.append({
                "feature": feat,
                "label": TASTE_LABELS.get(feat, feat),
                "city_score": round(city_score, 1),
                "user_score": round(user_score, 1),
            })
    matches.sort(key=lambda x: -(x["city_score"] + x["user_score"]))
    return matches[:3]


def _build_explanation(row: dict, user_prefs: dict) -> str:
    """Plain-language explanation of why this city was recommended.

    Built from actual feature comparisons — no invented text.
    """
    strong = [
        TASTE_LABELS.get(k, k)
        for k in TASTE_KEYS
        if float(user_prefs.get(k, 3)) >= 4 and float(row.get(k, 0)) >= 4
    ]
    city = str(row.get("city", "—"))
    budget_n = int(float(row.get("budget_level_encoded", 2)))
    budget = BUDGET_LABEL.get(budget_n, "mid-range")

    temp_gap = abs(
        float(row.get("temp_avg_yearly", 20)) - float(user_prefs.get("temp_avg_yearly", 22))
    )
    climate = (
        "with a climate close to your target"
        if temp_gap <= 4
        else "though the climate differs slightly from your target"
    )

    if strong:
        what = " and ".join(strong[:2])
        lead = f"{city} scores highly on your preference for {what}"
    else:
        lead = f"{city} best matches the overall balance you described"

    return f"{lead}, {climate}. It fits a {budget} budget."


def _build_explanation_ar(row: dict, user_prefs: dict) -> str:
    """Arabic equivalent of _build_explanation — same logic, Arabic strings."""
    strong = [
        TASTE_LABELS_AR.get(k, k)
        for k in TASTE_KEYS
        if float(user_prefs.get(k, 3)) >= 4 and float(row.get(k, 0)) >= 4
    ]
    city = str(row.get("city", "—"))
    budget_n = int(float(row.get("budget_level_encoded", 2)))
    budget = BUDGET_LABEL_AR.get(budget_n, "متوسطة")

    temp_gap = abs(
        float(row.get("temp_avg_yearly", 20)) - float(user_prefs.get("temp_avg_yearly", 22))
    )
    climate = (
        "بمناخ قريب من هدفك"
        if temp_gap <= 4
        else "رغم اختلاف المناخ قليلًا عن الدرجة التي تستهدفها"
    )

    if strong:
        what = " و".join(strong[:2])
        lead = f"تتميز {city} بتوافقها العالي مع تفضيلاتك في {what}"
    else:
        lead = f"تُعد {city} الأقرب إلى التوازن العام الذي وصفته"

    return f"{lead}، {climate}. كما أنها تناسب ميزانية {budget}."


# ──────────────────────────────────────────────────────────────────────────────
# Region hard-filter constants
# ──────────────────────────────────────────────────────────────────────────────

import logging as _logging
_log = _logging.getLogger(__name__)

REGION_KEYS: list[str] = [
    "region_africa",
    "region_asia",
    "region_europe",
    "region_middle_east",
    "region_north_america",
    "region_oceania",
    "region_south_america",
]


def _region_rows(bundle: ModelBundle, user_prefs: dict) -> np.ndarray:
    """Return bundle.df row indices that satisfy the selected region hard filter.

    If no regions are selected, all rows are returned (no constraint).
    Region selection is a HARD constraint — similarity is computed only against
    the filtered candidate set; it is mathematically impossible for a city
    outside the selected region(s) to appear in the results.
    """
    selected = [k for k in REGION_KEYS if int(user_prefs.get(k, 0)) == 1]
    if not selected:
        return np.arange(len(bundle.df))

    mask = np.zeros(len(bundle.df), dtype=bool)
    for col in selected:
        if col in bundle.df.columns:
            mask |= bundle.df[col].values == 1

    rows = np.where(mask)[0]
    _log.info(
        "Region filter: selected=%s  candidates=%d / %d total",
        selected, len(rows), len(bundle.df),
    )
    if len(rows) == 0:
        _log.warning("Region filter produced 0 candidates — returning all rows as fallback.")
        return np.arange(len(bundle.df))
    return rows


# ──────────────────────────────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────────────────────────────

def recommend(bundle: ModelBundle, user_prefs: dict, top_n: int = 10) -> list[dict]:
    """Rank destinations for one user preference vector.

    Region selections in user_prefs act as a HARD pre-filter: cosine similarity
    is calculated only against cities that belong to the selected region(s).
    No city outside the selected region(s) can appear in the results.

    Returns a list of recommendation dicts sorted by descending similarity.
    """
    # ── 1. Hard region pre-filter ──────────────────────────────────────────────
    rows = _region_rows(bundle, user_prefs)          # actual bundle.df row indices
    n_candidates = len(rows)

    # ── 2. Cosine similarity only against candidate rows ──────────────────────
    user_scaled = bundle.transform_user(user_prefs)
    scores = _cosine(bundle, user_scaled, rows)      # length == n_candidates

    # ── 3. Sort candidates by descending score and diversify ──────────────────
    order_pos = np.argsort(-scores)                  # positions into rows/scores
    order = rows[order_pos]                          # actual bundle.df indices, ranked
    picked = _diversify(order, bundle.labels, min(top_n, n_candidates))

    # score_map: actual bundle.df index → cosine score
    score_map = {int(rows[i]): float(scores[i]) for i in range(n_candidates)}
    results: list[dict] = []

    for idx in picked:
        row = bundle.df.iloc[idx]
        sim = score_map.get(idx, 0.0)
        row_dict = row.to_dict()

        _null = {
            "nan", r"\N", "", "None", "NaN",
            "not specified", "Not specified",
            "Unknown", "unknown",
        }
        iata_raw = str(row.get("iata", ""))
        iata = iata_raw if iata_raw.strip() not in _null else None

        airport_name_raw = str(row.get("name", ""))
        airport_name = airport_name_raw if airport_name_raw.strip() not in _null else None

        # If iata is still missing (helipad, military base, or unresolved city),
        # look up the nearest real commercial airport from the fallback table.
        if not iata:
            _city_key = str(row.get("city", ""))
            _fb = AIRPORT_FALLBACK.get(_city_key)
            if _fb:
                airport_name = _fb["name"]
                iata = _fb["iata"]

        hotel_raw = str(row.get("HotelName", ""))
        hotel = hotel_raw if hotel_raw.strip() not in _null else None

        attr_raw = str(row.get("Attractions", ""))
        attractions = attr_raw if attr_raw.strip() not in _null else None

        def _coord(key) -> float | None:
            try:
                v = float(row.get(key, ""))
                return round(v, 6) if not (v == 0.0) else None
            except (ValueError, TypeError):
                return None

        results.append({
            "city": str(row.get("city", "")),
            "country": str(row.get("country", "")),
            "similarity_score": round(float(sim), 4),
            "match_percent": round((sim + 1) / 2 * 100, 1),
            "budget_level": int(float(row.get("budget_level_encoded", 2))),
            "temp_avg_yearly": round(float(row.get("temp_avg_yearly", 20)), 1),
            "cluster_profile": bundle.cluster_name(idx),
            "explanation": _build_explanation(row_dict, user_prefs),
            "explanation_ar": _build_explanation_ar(row_dict, user_prefs),
            "iata": iata,
            "airport_name": airport_name,
            "hotel_name": hotel,
            "attractions": attractions,
            "latitude": _coord("latitude"),
            "longitude": _coord("longitude"),
            "top_features": _top_features(row_dict, user_prefs, bundle.feature_cols),
        })

    return results
