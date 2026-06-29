""" Carbon statistics endpoints. """
import json
import logging
from typing import Annotated, Union

from fastapi import APIRouter, HTTPException, File, UploadFile, Query
import models as models
from utils.date_utils import DATA_INDEX, get_two_closest_dates
from utils.raster_utils import (
    AmbiguousCRSError, extract_carbon_stats, url_for_date, build_carbon_classes
)

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get(
    "/national-stats/{date}",
    response_model=models.NationalStatsResponse,
    summary="Get national carbon statistics for two dates",
    description=(
        "Returns national-level carbon statistics (mean, land area) for two dates, "
        "with 'current' being the most recent and 'previous' the one before (or null)."
    ),
    response_description="National statistics as current and previous",
    operation_id="get_national_stats",
    responses={
        200: {"description": "National statistics retrieved successfully"},
        404: {"description": "No data found for the specified date(s)"},
        500: {"description": "Internal server error while retrieving statistics"},
    },
)
def get_national_stats(date: str):
    """ Get national carbon statistics for two dates. """
    try:
        closest_dates = get_two_closest_dates(date)
        if not closest_dates:
            raise HTTPException(status_code=404, detail=f"No dates found around {date}")

        def build_stat(d: str) -> models.NationalStats:
            row = DATA_INDEX.loc[DATA_INDEX["date"] == d]
            if row.empty:
                raise HTTPException(status_code=404, detail=f"No data found for date {d}")
            row0 = row.iloc[0]
            return models.NationalStats(
                biomass_mean=float(row0["biomass_mean"]),
                carbon_mean=float(row0["carbon_mean"]),
                tco2e_mean=float(row0["tco2e_mean"]),
                land_area=float(row0["land_area"]),
                date=d,
                carbon_classes=build_carbon_classes(row0),
            )

        current = build_stat(closest_dates[-1])
        previous = build_stat(closest_dates[-2]) if len(closest_dates) >= 2 else None

        return models.NationalStatsResponse(
            stats=models.NationalStatsPair(
                current=current,
                previous=previous
            )
        )

    except KeyError as e:
        raise HTTPException(
            status_code=500,
            detail=f"Missing required column in data index: {str(e)}"
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving national statistics: {str(e)}"
        ) from e

@router.post(
    "/stats/geometry",
    summary="Carbon statistics for an uploaded GeoJSON",
    description=(
        "Upload a GeoJSON file and specify a date to extract carbon statistics "
        "(mean, min, max, std) for that zone from the COG raster. "
        "The GeoJSON must either be in EPSG:4326 (WGS84) or include an explicit "
        "'crs' member. Files in a projected CRS (e.g. UTM) without a 'crs' member "
        "will be rejected to prevent returning incorrect statistics."
    ),
    response_description="Carbon statistics (single or per-feature)",
    operation_id="get_carbon_stats_upload",
    response_model=Union[
        models.SingleCarbonStatsResponse,
        models.CollectionCarbonStatsResponse,
    ],
    responses={
        200: {"description": "Carbon statistics extracted successfully"},
        400: {"description": "Invalid GeoJSON file or parameters"},
        404: {"description": "No COG available for the specified date"},
        422: {"description": "CRS ambiguity or geometry issues"},
        500: {"description": "Internal server error while processing the request"},
    },
)
async def get_carbon_stats_upload(
    file: Annotated[UploadFile, File(description="GeoJSON file (.geojson or .json)")],
    date: Annotated[str, Query(description="Date in YYYY-MM format, e.g. 2024-01")],
):
    """Extract carbon stock statistics for a user-uploaded GeoJSON geometry."""
    try:
        content = await file.read()
        geojson_data = json.loads(content)
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=400,
            detail="Invalid GeoJSON file: the file could not be parsed as JSON.",
        ) from e

    try:
        cog_url = url_for_date(date)
    except HTTPException as e:
        raise HTTPException(
            status_code=404,
            detail=f"No COG available for date {date}.",
        ) from e

    try:
        result = extract_carbon_stats(cog_url, geojson_data)
    except AmbiguousCRSError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        logger.exception("Error processing uploaded geometry: %s", e, exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred while processing the geometry.",
        ) from e

    # Shape the raw dict into the right Pydantic model
    if result["type"] == "collection":
        features = [
            models.FeatureStatsItem(
                name=f["name"],
                stats=models.CarbonStats(**f["stats"]) if "stats" in f else None,
                error=f.get("error"),
            )
            for f in result["features"]
        ]
        return models.CollectionCarbonStatsResponse(features=features)

    # single
    return models.SingleCarbonStatsResponse(
        stats=models.CarbonStats(**result["stats"])
    )
