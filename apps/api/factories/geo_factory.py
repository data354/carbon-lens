""" Factory to create geo APIRouters for different administrative levels. """
from pathlib import Path
from typing import Any, Type

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from utils.geo_utils import load_geojson_wgs84, gdf_to_geojson


def make_geo_router(
    base: str,
    geojson_template: str,
    property_name: str,
    list_response_model: Type[Any],
    feature_response_model: Type[Any],
) -> APIRouter:
    """
    Create an APIRouter exposing:
      - GET /<base>/{date} -> all features for a given date (GeoJSON)
      - GET /<base>/{date}/all -> list of names for a given date
      - GET /<base>/{date}/{name} -> single feature for a given date (GeoJSON)
    """
    router = APIRouter()

    def resolve_path(date: str) -> Path:
        """Resolve geojson path for a given date."""
        resolved = geojson_template.format(date=date)
        if resolved.startswith("https://"):
            return resolved
        p = Path(resolved)
        if p.is_absolute():
            return p.resolve()
        return (Path(__file__).resolve().parents[1] / p).resolve()

    @router.get(
        f"/{base}/{{date}}",
        response_model=feature_response_model,
        responses={
            200: {"description": "GeoJSON features retrieved successfully"},
            404: {"description": "No data available for the specified date"},
        },
    )
    def all_items(date: str):
        """Get all features for a given date."""
        path = resolve_path(date)
        try:
            gdf = load_geojson_wgs84(path)
            geojson = gdf_to_geojson(gdf)
            return JSONResponse(content=geojson)
        except FileNotFoundError as exc:
            raise HTTPException(
                status_code=404,
                detail=f"No data available for date {date}"
            ) from exc

    @router.get(
        f"/{base}/{{date}}/all",
        response_model=list_response_model,
        responses={
            200: {"description": "List of names retrieved successfully"},
            404: {"description": "No data available for the specified date"},
        },
    )
    def list_items(date: str):
        """Get list of names for a given date."""
        path = resolve_path(date)
        try:
            gdf = load_geojson_wgs84(path)
            geojson = gdf_to_geojson(gdf)
            names = sorted({
                f["properties"].get(property_name)
                for f in geojson["features"]
                if f["properties"].get(property_name)
            })
            return {base: names}
        except FileNotFoundError as exc:
            raise HTTPException(
                status_code=404,
                detail=f"No data available for date {date}"
            ) from exc

    @router.get(
        f"/{base}/{{date}}/{{name}}",
        response_model=feature_response_model,
        responses={
            200: {"description": "GeoJSON feature retrieved successfully"},
            404: {
                "description": (
                    "No data available for the specified date or "
                    f"unknown {base[:-1] if base.endswith('s') else base}"
                )
            },
        },
    )
    def single_item(date: str, name: str):
        """Get a single feature for a given date and name."""
        path = resolve_path(date)
        try:
            gdf = load_geojson_wgs84(path)
            subset = gdf[gdf[property_name].str.lower() == name.lower()]
            if subset.empty:
                raise HTTPException(
                    status_code=404,
                    detail=f"Unknown {base[:-1] if base.endswith('s') else base}"
                )
            return JSONResponse(content=gdf_to_geojson(subset))
        except FileNotFoundError as exc:
            raise HTTPException(
                status_code=404,
                detail=f"No data available for date {date}"
            ) from exc

    return router
