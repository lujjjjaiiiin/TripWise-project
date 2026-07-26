"""TripWise AI — FastAPI backend."""
from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from data_loader import (
    BUDGET_LABEL,
    ModelBundle,
    TASTE_KEYS,
    find_dataset,
    load_and_clean_data,
)
from recommendation import recommend

logging.basicConfig(level=logging.INFO, format="%(levelname)s %(name)s — %(message)s")
logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────────────
# Startup / shutdown
# ──────────────────────────────────────────────────────────────────────────────

_bundle: ModelBundle | None = None


@asynccontextmanager
async def lifespan(_app: FastAPI):
    global _bundle
    try:
        path = find_dataset()
        df = load_and_clean_data(path)
        _bundle = ModelBundle(df)
        logger.info("ML models ready — %d destinations loaded.", len(df))
    except Exception as exc:
        logger.error("STARTUP FAILED: %s", exc)
        raise
    yield
    _bundle = None


app = FastAPI(
    title="TripWise AI API",
    description="Travel recommendation engine — cosine similarity + K-Means clustering.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _require_bundle() -> ModelBundle:
    if _bundle is None:
        raise HTTPException(status_code=503, detail="Models not yet loaded — try again shortly.")
    return _bundle


# ──────────────────────────────────────────────────────────────────────────────
# Request / response schemas
# ──────────────────────────────────────────────────────────────────────────────

class PreferenceInput(BaseModel):
    # Taste dimensions (1–5 scale)
    culture: float = Field(3.0, ge=1, le=5)
    adventure: float = Field(3.0, ge=1, le=5)
    nature: float = Field(3.0, ge=1, le=5)
    beaches: float = Field(3.0, ge=1, le=5)
    nightlife: float = Field(3.0, ge=1, le=5)
    cuisine: float = Field(3.0, ge=1, le=5)
    wellness: float = Field(3.0, ge=1, le=5)
    urban: float = Field(3.0, ge=1, le=5)
    seclusion: float = Field(3.0, ge=1, le=5)
    # Trip parameters
    has_airport: int = Field(1, ge=0, le=1)
    is_short_trip: int = Field(0, ge=0, le=1)
    is_one_week: int = Field(1, ge=0, le=1)
    temp_avg_yearly: float = Field(22.0, ge=-10, le=50)
    budget_level_encoded: int = Field(2, ge=1, le=3)
    HotelRating_encoded: float = Field(4.0, ge=0, le=5)
    rating_was_unknown: int = Field(0, ge=0, le=1)
    # Region preferences (0/1)
    region_africa: int = Field(0, ge=0, le=1)
    region_asia: int = Field(0, ge=0, le=1)
    region_europe: int = Field(0, ge=0, le=1)
    region_middle_east: int = Field(0, ge=0, le=1)
    region_north_america: int = Field(0, ge=0, le=1)
    region_oceania: int = Field(0, ge=0, le=1)
    region_south_america: int = Field(0, ge=0, le=1)
    # How many results to return
    top_n: int = Field(10, ge=1, le=50)


class TopFeature(BaseModel):
    feature: str
    label: str
    city_score: float
    user_score: float


class CityRecommendation(BaseModel):
    city: str
    country: str
    similarity_score: float
    match_percent: float
    budget_level: int
    budget_label: str
    temp_avg_yearly: float
    cluster_profile: str
    explanation: str
    explanation_ar: str = ""
    iata: str | None = None
    airport_name: str | None = None
    hotel_name: str | None = None
    attractions: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    top_features: list[TopFeature] = []


class RecommendationResponse(BaseModel):
    count: int
    recommendations: list[CityRecommendation]
    metrics: dict[str, Any]


class CityInfo(BaseModel):
    city: str
    country: str
    budget_level: int
    budget_label: str
    temp_avg_yearly: float
    cluster_profile: str
    iata: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class CitiesResponse(BaseModel):
    count: int
    cities: list[CityInfo]


class ClusterInfo(BaseModel):
    id: int
    size: int
    top_tastes: list[str]
    cities: list[str]


class ClustersResponse(BaseModel):
    count: int
    clusters: list[ClusterInfo]


class HealthStatus(BaseModel):
    status: str
    destinations_loaded: int
    n_clusters: int
    silhouette_score: float


# ──────────────────────────────────────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────────────────────────────────────

@app.get("/api/healthz", response_model=HealthStatus, tags=["status"])
def health():
    bundle = _require_bundle()
    return HealthStatus(
        status="ok",
        destinations_loaded=len(bundle.df),
        n_clusters=int(bundle.labels.max()) + 1,
        silhouette_score=round(bundle.silhouette, 4),
    )


@app.get("/api/cities", response_model=CitiesResponse, tags=["catalogue"])
def cities(
    region: str | None = Query(None, description="Filter by region column name"),
    budget: int | None = Query(None, ge=1, le=3, description="Filter by budget level (1–3)"),
):
    bundle = _require_bundle()
    df = bundle.df.copy()

    if region:
        col = f"region_{region.lower()}" if not region.startswith("region_") else region.lower()
        if col in df.columns:
            df = df[df[col] == 1]

    if budget is not None:
        df = df[df["budget_level_encoded"].astype(int) == budget]

    results: list[CityInfo] = []
    for idx, row in df.iterrows():
        _null = {"nan", "", "None", "NaN", r"\N"}
        iata_raw = str(row.get("iata", ""))
        iata = iata_raw if iata_raw not in _null else None
        budget_n = int(float(row.get("budget_level_encoded", 2)))

        def _coord(key) -> float | None:
            try:
                v = float(row.get(key, ""))
                return round(v, 6) if v != 0.0 else None
            except (ValueError, TypeError):
                return None

        results.append(CityInfo(
            city=str(row.get("city", "")),
            country=str(row.get("country", "")),
            budget_level=budget_n,
            budget_label=BUDGET_LABEL.get(budget_n, "mid-range"),
            temp_avg_yearly=round(float(row.get("temp_avg_yearly", 20)), 1),
            cluster_profile=bundle.cluster_name(int(idx)),  # type: ignore[arg-type]
            iata=iata,
            latitude=_coord("latitude"),
            longitude=_coord("longitude"),
        ))

    return CitiesResponse(count=len(results), cities=results)


@app.post("/api/recommend", response_model=RecommendationResponse, tags=["recommendation"])
def get_recommendations(body: PreferenceInput):
    bundle = _require_bundle()
    prefs = body.model_dump()
    top_n = prefs.pop("top_n", 10)

    raw = recommend(bundle, prefs, top_n=top_n)

    recs: list[CityRecommendation] = []
    for r in raw:
        recs.append(CityRecommendation(
            city=r["city"],
            country=r["country"],
            similarity_score=r["similarity_score"],
            match_percent=r["match_percent"],
            budget_level=r["budget_level"],
            budget_label=BUDGET_LABEL.get(r["budget_level"], "mid-range"),
            temp_avg_yearly=r["temp_avg_yearly"],
            cluster_profile=r["cluster_profile"],
            explanation=r["explanation"],
            explanation_ar=r.get("explanation_ar", ""),
            iata=r.get("iata"),
            airport_name=r.get("airport_name"),
            hotel_name=r.get("hotel_name"),
            attractions=r.get("attractions"),
            latitude=r.get("latitude"),
            longitude=r.get("longitude"),
            top_features=[TopFeature(**f) for f in r.get("top_features", [])],
        ))

    return RecommendationResponse(
        count=len(recs),
        recommendations=recs,
        metrics={
            "silhouette_score": round(bundle.silhouette, 4),
            "precision_at_10": round(bundle.precision_at_10, 4),
            "intra_list_diversity": round(bundle.intra_list_diversity, 4),
        },
    )


@app.get("/api/clusters", response_model=ClustersResponse, tags=["catalogue"])
def clusters():
    bundle = _require_bundle()
    raw = bundle.get_cluster_info()
    return ClustersResponse(
        count=len(raw),
        clusters=[ClusterInfo(**c) for c in raw],
    )
