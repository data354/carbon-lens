""" This module contains the Pydantic models for the API. """
import re
from typing import Literal, List, Dict, Any, Union, Optional
from pydantic import BaseModel, Field, field_validator, HttpUrl


class RootResponse(BaseModel):
    """ Root response model. """
    status: str
    message: str
    routes: List[str]

class DatesResponse(BaseModel):
    """ Dates response model. """
    dates: List[str]

class CatalogItemResponse(BaseModel):
    """ Catalog item response model. """
    date: str
    res: str
    country: str
    url: HttpUrl

class RegionsResponse(BaseModel):
    """ Regions response model. """
    regions: List[str]

class DepartmentsResponse(BaseModel):
    """ Departments response model. """
    departments: List[str]

class CommunesResponse(BaseModel):
    """ Communes response model. """
    communes: List[str]

class ProtectedAreasResponse(BaseModel):
    """ Protected areas response model. """
    protected_areas: List[str]

class GeoSearchResponse(BaseModel):
    """ Geo search response model. """
    regions: List[str]
    departments: List[str]
    communes: List[str]
    protected_areas: List[str]

class Geometry(BaseModel):
    """ Geometry model. """
    type: str
    coordinates: Any

class Feature(BaseModel):
    """ Feature model. """
    id: str
    type: str
    properties: Dict[str, Union[str, float, None]]
    geometry: Geometry

class FeatureCollectionResponse(BaseModel):
    """ Feature Collection response model. """
    type: str
    features: List[Feature]

class TileJSONResponse(BaseModel):
    """ TileJSON response model. """
    tilejson: str
    name: str
    tiles: List[str]
    minzoom: int
    maxzoom: int
    attribution: str
    style: str
    rescale: List[Union[float, int]]

class PreviewResponse(BaseModel):
    """ Preview response model. """
    preview: str

class StatsResponse(BaseModel):
    """ Stats response model. """
    stats: str

class CarbonStats(BaseModel):
    """ Carbon statistics response for any geometry. """
    mean: float
    min: float
    max: float
    std: float
    count: int
    unit: str

class SingleCarbonStatsResponse(BaseModel):
    """ Carbon statistics response for a single geometry. """
    type: Literal["single"] = "single"
    stats: CarbonStats

class FeatureStatsItem(BaseModel):
    """ Feature stats item model. """
    name: str = Field(..., description="Feature name or identifier")
    stats: CarbonStats | None = Field(None, description="Stats (null when an error occurred)")
    error: str | None = Field(None, description="Error message if stats could not be computed")

class CollectionCarbonStatsResponse(BaseModel):
    """ Carbon statistics response for a collection of geometries. """
    type: Literal["collection"] = "collection"
    features: list[FeatureStatsItem]

CarbonStatsResponse = Union[SingleCarbonStatsResponse, CollectionCarbonStatsResponse]

class GeometryInput(BaseModel):
    """ GeoJSON geometry input (drawn on map). """
    type: str
    coordinates: List[List[List[float]]]


class CarbonStatsRequest(BaseModel):
    """ Request body for carbon stats with drawn geometry. """
    geometry: GeometryInput
    date: str

class CarbonClassDetail(BaseModel):
    """ Details for a carbon density class. """
    count: int
    ha: float
    squareKm: float
    pct: float

class CarbonClasses(BaseModel):
    """ Carbon density classes breakdown. """
    ol: CarbonClassDetail
    s: CarbonClassDetail
    yrf: CarbonClassDetail
    ldf: CarbonClassDetail
    mdf: CarbonClassDetail
    hdf: CarbonClassDetail

class NationalStats(BaseModel):
    """ National statistics for a specific date. """
    biomass_mean: float
    carbon_mean: float
    tco2e_mean: float
    land_area: float
    date: str
    carbon_classes: CarbonClasses

class NationalStatsPair(BaseModel):
    """ Pair of national statistics for current and previous periods. """
    current: NationalStats
    previous: Optional[NationalStats] = None

class NationalStatsResponse(BaseModel):
    """ Response with national statistics for current and previous periods. """
    stats: NationalStatsPair

class GeoStatsResponse(BaseModel):
    """ Geo stats response model. """
    stats: dict[str, dict[str, float]]

class RegionStatsResponse(GeoStatsResponse):
    """ Region stats response model. """
    region: str

class DepartmentStatsResponse(GeoStatsResponse):
    """ Department stats response model. """
    department: str

class CommuneStatsResponse(GeoStatsResponse):
    """ Commune stats response model. """
    commune: str

class ProtectedAreaStatsResponse(GeoStatsResponse):
    """ Protected area stats response model. """
    protected_area: str

class FileQuery(BaseModel):
    """ Query parameters for file export. """
    zone: Literal["regions", "departments", "communes", "protected_areas"] = Field(
        ..., description="Administrative level")
    date: str = Field(..., description="Format YYYY-MM, e.g. 2024-01")

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: str):
        """Validate date format."""
        if not re.match(r"^\d{4}-(0[1-9]|1[0-2])$", v):
            raise ValueError("date must be in format YYYY-MM")
        return v

class CarbonClass(BaseModel):
    """ Carbon class model. """
    order: int
    min: float
    max: float | str
    color: str
    name: str
    meaning: str
    description: str
