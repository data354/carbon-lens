""" Geo routers for regions, departments, communes, protected areas, and search. """
from pathlib import Path
from typing import Annotated, List
import unicodedata

from fastapi import APIRouter, Query

from core.config import (
    REGIONS_BASE, DEPARTMENTS_BASE, COMMUNES_BASE, PROTECTED_AREAS_BASE,
    REGIONS_TEMPLATE, DEPARTMENTS_TEMPLATE, COMMUNES_TEMPLATE,
    PROTECTED_AREAS_TEMPLATE,
    REGION_PROPERTY, DEPARTMENT_PROPERTY, COMMUNE_PROPERTY, PROTECTED_AREA_PROPERTY,
    REGIONS_FILE, DEPARTMENTS_FILE, COMMUNES_FILE, PROTECTED_AREAS_FILE
)
from factories.geo_factory import make_geo_router
from models import (
    RegionsResponse,
    DepartmentsResponse,
    CommunesResponse,
    ProtectedAreasResponse,
    FeatureCollectionResponse,
    GeoSearchResponse
)
from utils.geo_utils import load_geojson_wgs84


def resolve_geo_path(geojson_filename: str):
    """Resolve local file path or keep remote URL unchanged."""
    if geojson_filename.startswith("https://"):
        return geojson_filename
    return Path(__file__).resolve().parents[1] / "data" / geojson_filename

def normalize_text(value: str) -> str:
    """Normalize text for case-insensitive and accent-insensitive matching."""
    value = value.strip().lower()
    value = unicodedata.normalize("NFD", value)
    value = "".join(char for char in value if unicodedata.category(char) != "Mn")
    return value

def extract_unique_names(geojson_filename: str, property_name: str) -> List[str]:
    """Load unique non-empty names from a GeoJSON file."""
    gdf = load_geojson_wgs84(resolve_geo_path(geojson_filename))

    if property_name not in gdf.columns:
        return []

    series = gdf[property_name].dropna().astype(str).str.strip()
    series = series[series != ""]
    return sorted(series.unique().tolist(), key=normalize_text)

def search_names(names: List[str], query: str) -> List[str]:
    """Search names by substring with ranking: startswith first, then contains."""
    normalized_query = normalize_text(query)
    if not normalized_query:
        return []

    starts_with_matches = []
    contains_matches = []

    for name in names:
        normalized_name = normalize_text(name)

        if normalized_query not in normalized_name:
            continue

        if normalized_name.startswith(normalized_query):
            starts_with_matches.append(name)
        else:
            contains_matches.append(name)

    starts_with_matches.sort(key=normalize_text)
    contains_matches.sort(key=normalize_text)

    return starts_with_matches + contains_matches


# Preload search lists once
REGION_NAMES = extract_unique_names(REGIONS_FILE, REGION_PROPERTY)
DEPARTMENT_NAMES = extract_unique_names(DEPARTMENTS_FILE, DEPARTMENT_PROPERTY)
COMMUNE_NAMES = extract_unique_names(COMMUNES_FILE, COMMUNE_PROPERTY)
PROTECTED_AREA_NAMES = extract_unique_names(PROTECTED_AREAS_FILE, PROTECTED_AREA_PROPERTY)

# Create and expose the router for regions
regions_router: APIRouter = make_geo_router(
    base=REGIONS_BASE,
    geojson_template=REGIONS_TEMPLATE,
    property_name=REGION_PROPERTY,
    list_response_model=RegionsResponse,
    feature_response_model=FeatureCollectionResponse,
)

# Create and expose the router for departments
departments_router: APIRouter = make_geo_router(
    base=DEPARTMENTS_BASE,
    geojson_template=DEPARTMENTS_TEMPLATE,
    property_name=DEPARTMENT_PROPERTY,
    list_response_model=DepartmentsResponse,
    feature_response_model=FeatureCollectionResponse,
)

# Create and expose the router for communes
communes_router: APIRouter = make_geo_router(
    base=COMMUNES_BASE,
    geojson_template=COMMUNES_TEMPLATE,
    property_name=COMMUNE_PROPERTY,
    list_response_model=CommunesResponse,
    feature_response_model=FeatureCollectionResponse,
)

# Create and expose the router for protected areas
protected_areas_router: APIRouter = make_geo_router(
    base=PROTECTED_AREAS_BASE,
    geojson_template=PROTECTED_AREAS_TEMPLATE,
    property_name=PROTECTED_AREA_PROPERTY,
    list_response_model=ProtectedAreasResponse,
    feature_response_model=FeatureCollectionResponse,
)

# Search router
search_router = APIRouter()

@search_router.get(
    "/search",
    response_model=GeoSearchResponse,
    summary="Search across all geo levels",
    description=(
        "Searches a text query across regions, departments, communes, and protected areas. "
        "Matching is case-insensitive, accent-insensitive, and works for text at the beginning, "
        "middle, or end of a name."
    ),
    response_description="Matching names by geo level",
    operation_id="search_geo_entities",
)
def search_geo(
    q: Annotated[str, Query(min_length=1, description="Search text")]
):
    """Search across all geo levels with substring matching."""
    return GeoSearchResponse(
        regions=search_names(REGION_NAMES, q),
        departments=search_names(DEPARTMENT_NAMES, q),
        communes=search_names(COMMUNE_NAMES, q),
        protected_areas=search_names(PROTECTED_AREA_NAMES, q),
    )
