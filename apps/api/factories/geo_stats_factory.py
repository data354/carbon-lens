""" Factory to create geo stats APIRouters for multi-date carbon statistics. """
from pathlib import Path
from typing import Any, Type, List
import logging

from fastapi import APIRouter, HTTPException

from utils.geo_utils import load_geojson_wgs84, gdf_to_geojson
from utils.date_utils import get_balanced_five_dates, DATA_INDEX

logger = logging.getLogger(__name__)


def make_geo_stats_router(
    base: str,
    geojson_template: str,
    property_name: str,
    response_model: Type[Any],
) -> APIRouter:
    """
    Create an APIRouter exposing multi-date carbon statistics.
    Exposes:
      - GET /<base>/{date}/{name}/stats -> carbon stats across 5 balanced dates
    """
    router = APIRouter()

    def resolve_path(date: str) -> str:
        """Resolve geojson path for a given date."""
        resolved = geojson_template.format(date=date)
        if resolved.startswith(("https://", "http://")):
            return resolved
        p = Path(resolved)
        if p.is_absolute():
            return str(p.resolve())
        return str((Path(__file__).resolve().parents[1] / p).resolve())

    def extract_carbon_mean_from_geojson(geojson_data: dict) -> float:
        """Extract average carbon_mean from GeoJSON features properties."""
        features = geojson_data.get("features", [])
        carbon_values = []

        for feature in features:
            props = feature.get("properties", {})
            if "carbon_mean" in props and props["carbon_mean"] is not None:
                carbon_values.append(float(props["carbon_mean"]))

        return sum(carbon_values) / len(carbon_values) if carbon_values else None

    def get_geo_stats(name: str, dates: List[str]) -> dict:
        """ Extract carbon stats for a named entity across multiple dates. """
        stats_dict = {}
        for date in dates:
            try:
                path = resolve_path(date)
                gdf = load_geojson_wgs84(path)
                subset = gdf[gdf[property_name].str.lower() == name.lower()]
                if subset.empty:
                    logger.warning("No entity found for %s in %s", name, date)
                    continue
                geojson = gdf_to_geojson(subset)
                carbon_mean = extract_carbon_mean_from_geojson(geojson)
                if carbon_mean is not None:
                    stats_dict[date] = {"carbon_mean": carbon_mean}
            except (FileNotFoundError, KeyError, ValueError) as e:
                logger.warning("Skipping %s for %s: %s", date, name, e)
        return stats_dict

    def get_available_dates() -> List[str]:
        """Get sorted list of available dates from DATA_INDEX."""
        return sorted(DATA_INDEX["date"].unique().tolist())

    @router.get(
        f"/{base}/{{date}}/{{name}}/stats",
        response_model=response_model,
        summary=f"Get {base} carbon statistics across multiple dates",
        description=f"Get carbon statistics for a {base[:-1]} \
            across 5 balanced dates centered on the chosen date.",
        operation_id=f"get_{base}_stats_multi_date",
        responses={
            200: {"description": "Carbon statistics retrieved successfully"},
            404: {"description": "No data found for the specified name or date"},
            500: {"description": "Internal server error while retrieving statistics"},
        },
    )
    def get_stats(date: str, name: str):
        """Get carbon statistics across 5 balanced dates."""
        try:
            available_dates = get_available_dates()
            if not available_dates:
                raise HTTPException(status_code=500, detail="No dates available")

            balanced_dates = get_balanced_five_dates(available_dates, date)

            if not balanced_dates:
                raise HTTPException(status_code=404, detail=f"Date {date} not found in catalog")

            stats_dict = get_geo_stats(name, balanced_dates)
            print(stats_dict)

            if not stats_dict:
                entity_type = base[:-1] if base.endswith('s') else base
                raise HTTPException(
                    status_code=404, detail=f"No data found for {entity_type} {name}")

            # Return response with appropriate key based on entity type
            return response_model(**{base[:-1]: name, "stats": stats_dict})

        except HTTPException:
            raise
        except Exception as e:
            entity_type = base[:-1] if base.endswith('s') else base
            logger.exception("Error fetching %s stats for %s: %s", entity_type, name, e)
            raise HTTPException(
                status_code=500, detail=f"Error fetching {entity_type} stats"
            ) from e

    return router
