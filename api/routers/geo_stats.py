""" Geo stats router for multi-date carbon statistics. """
from core.config import (
    REGIONS_TEMPLATE, DEPARTMENTS_TEMPLATE, COMMUNES_TEMPLATE,
    PROTECTED_AREAS_TEMPLATE,
    REGION_PROPERTY, DEPARTMENT_PROPERTY, COMMUNE_PROPERTY, PROTECTED_AREA_PROPERTY,
)
from models import (
    RegionStatsResponse,
    DepartmentStatsResponse,
    CommuneStatsResponse,
    ProtectedAreaStatsResponse,
)
from factories.geo_stats_factory import make_geo_stats_router


# Create stats routers for each administrative level
regions_stats_router = make_geo_stats_router(
    base="regions",
    geojson_template=REGIONS_TEMPLATE,
    property_name=REGION_PROPERTY,
    response_model=RegionStatsResponse,
)

departments_stats_router = make_geo_stats_router(
    base="departments",
    geojson_template=DEPARTMENTS_TEMPLATE,
    property_name=DEPARTMENT_PROPERTY,
    response_model=DepartmentStatsResponse,
)

communes_stats_router = make_geo_stats_router(
    base="communes",
    geojson_template=COMMUNES_TEMPLATE,
    property_name=COMMUNE_PROPERTY,
    response_model=CommuneStatsResponse,
)

protected_areas_stats_router = make_geo_stats_router(
    base="protected_areas",
    geojson_template=PROTECTED_AREAS_TEMPLATE,
    property_name=PROTECTED_AREA_PROPERTY,
    response_model=ProtectedAreaStatsResponse,
)
