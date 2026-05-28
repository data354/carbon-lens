""" Utility functions for handling raster data and 
extracting carbon statistics based on GeoJSON geometries. """
import logging
from fastapi import HTTPException
import geopandas as gpd
import numpy as np
import pandas as pd
from pyproj import Transformer, CRS
from pyproj.exceptions import CRSError
import rasterio
from rasterio.coords import BoundingBox as Box
from rasterio.mask import mask
from shapely.coordinates import get_coordinates
from shapely.geometry import shape
from shapely.ops import transform as shapely_transform

from core.config import DATA_INDEX_PATH, NODATA

logger = logging.getLogger(__name__)

logger.info("Loading data index from %s", DATA_INDEX_PATH)
DATA_INDEX = pd.read_csv(DATA_INDEX_PATH)


def url_for_date(date: str) -> str:
    """Return the raster URL for a given date."""
    row = DATA_INDEX.loc[DATA_INDEX["date"] == date]
    if row.empty:
        raise HTTPException(status_code=404, detail="Unknown date")
    return row.iloc[0]["url"]

class AmbiguousCRSError(ValueError):
    """
    Raised when a GeoJSON has no CRS declaration but its coordinates
    are outside WGS84 bounds, suggesting a projected system (e.g. UTM).
    """

def sample_coordinates(geojson_data: dict) -> list[tuple[float, float]]:
    """
    Extract a flat sample of (x, y) coordinate pairs from a GeoJSON object,
    capped at 10 pairs to keep the check lightweight.
    """
    gdf = gpd.GeoDataFrame.from_features(
        geojson_data.get("features", [geojson_data])
    )

    all_coords = get_coordinates(gdf.geometry.values)

    return [(float(x), float(y)) for x, y in all_coords[:10]]

def assert_not_projected_coordinates(geojson_data: dict) -> None:
    """
    Raise AmbiguousCRSError if any sampled coordinate falls outside
    WGS84 bounds.

    This guards against GeoJSON files exported in a projected CRS
    (e.g. UTM) without a 'crs' member, which would otherwise be
    silently misinterpreted as EPSG:4326 and produce wrong statistics.
    """
    coords = sample_coordinates(geojson_data)
    if not coords:
        return

    for x, y in coords:
        if abs(x) > 180 or abs(y) > 90:
            raise AmbiguousCRSError(
                "The uploaded GeoJSON contains coordinates that exceed WGS84 bounds "
                f"(found x={x:.2f}, y={y:.2f}), which strongly suggests a projected "
                "coordinate system (e.g. UTM). However, no 'crs' member was found in "
                "the file, so the projection cannot be determined automatically. "
                "Please re-export your file with an explicit CRS declaration, or "
                "reproject it to EPSG:4326 (WGS84) before uploading. "
                "For Senegal, the likely CRS is EPSG:32628 (UTM zone 28N) or "
                "EPSG:32629 (UTM zone 29N)."
            )

def detect_geojson_crs(geojson_data: dict) -> CRS:
    """ Detect the CRS of a GeoJSON object. """
    crs_node = geojson_data.get("crs")

    if not crs_node:
        assert_not_projected_coordinates(geojson_data)
        return CRS.from_epsg(4326)

    crs_type = crs_node.get("type", "").lower()
    props = crs_node.get("properties", {})

    if crs_type == "name":
        name = props.get("name", "")
        try:
            return CRS.from_user_input(name)
        except CRSError:
            logger.warning("Unrecognised CRS name: %s, falling back to EPSG:4326", name)
            return CRS.from_epsg(4326)

    if crs_type == "link":
        href = props.get("href", "")
        try:
            return CRS.from_user_input(href)
        except CRSError:
            logger.warning("Unrecognised CRS link: %s, falling back to EPSG:4326", href)
            return CRS.from_epsg(4326)

    logger.warning("Unknown CRS type: %s, falling back to EPSG:4326", crs_type)
    return CRS.from_epsg(4326)

def to_wgs84(geometries: list, source_crs: CRS) -> list:
    """
    Reproject geometries to EPSG:4326 if they are not already in that CRS.
    Returns the original list unchanged when the source CRS is already WGS84.
    """
    wgs84 = CRS.from_epsg(4326)
    if source_crs == wgs84:
        return geometries

    transformer = Transformer.from_crs(source_crs, wgs84, always_xy=True)
    return [shapely_transform(transformer.transform, geom) for geom in geometries]

def flatten_and_check_geometry_inside_bounds(geometry: object, bounds: Box) -> list:
    """
    Flatten a geometry into simple parts and check that at least one part is
    within the raster bounds.
    """
    if hasattr(geometry, "geoms"):
        parts = list(geometry.geoms)
    else:
        parts = [geometry]

    for part in parts:
        if part.bounds[2] >= bounds.left and part.bounds[0] <= bounds.right and \
           part.bounds[3] >= bounds.bottom and part.bounds[1] <= bounds.top:
            return parts

    raise ValueError("No part of the geometry is within the raster bounds")

def stats_for_single_geometry(
        src: rasterio.DatasetReader, geometry: object, max_pixels: int = 660_000_000) -> dict:
    """
    Compute carbon statistics for a single geometry from a COG.
    The geometry must already be in the raster's CRS.
    """
    geometry_parts = flatten_and_check_geometry_inside_bounds(geometry, src.bounds)

    total_bounds = geometry_parts[0].bounds
    for part in geometry_parts[1:]:
        total_bounds = (
            min(total_bounds[0], part.bounds[0]),
            min(total_bounds[1], part.bounds[1]),
            max(total_bounds[2], part.bounds[2]),
            max(total_bounds[3], part.bounds[3])
        )

    transform = src.transform
    col_min = max(0, int((total_bounds[0] - transform[2]) / transform[0]))
    col_max = min(src.width, int((total_bounds[2] - transform[2]) / transform[0]) + 1)
    row_min = max(0, int((total_bounds[3] - transform[5]) / transform[4]))
    row_max = min(src.height, int((total_bounds[1] - transform[5]) / transform[4]) + 1)
    num_pixels = (col_max - col_min) * (row_max - row_min)

    if num_pixels > max_pixels:
        raise ValueError(
            f"Requested area is too large ({num_pixels} pixels > {max_pixels} max). "
            "Please use a smaller geometry."
        )

    try:
        out_image, _ = mask(src, geometry_parts, crop=True, nodata=NODATA)
    except ValueError as e:
        logger.warning("Mask operation failed (%s), retrying with buffer…", e)
        buffered = [p.buffer(10) for p in geometry_parts]
        out_image, _ = mask(src, buffered, crop=True, nodata=NODATA)

    data = out_image[0]
    raster_nodata = src.nodata

    valid_mask = (
        ~np.isnan(data)
        & (data >= 0)
        & (data != NODATA)
    )
    if raster_nodata is not None:
        valid_mask &= data != raster_nodata

    valid_data = data[valid_mask]

    if len(valid_data) == 0:
        raise ValueError("No valid data found in the specified geometry")

    return {
        "mean":  float(np.mean(valid_data)),
        "min":   float(np.min(valid_data)),
        "max":   float(np.max(valid_data)),
        "std":   float(np.std(valid_data)),
        "count": int(len(valid_data)),
        "unit":  "tC/ha",
    }

def extract_carbon_stats(raster_url: str, geojson_data: dict) -> dict:
    """ Extract carbon statistics from a COG raster using a GeoJSON geometry. """
    try:
        geojson_type = geojson_data.get("type")
        geojson_name = geojson_data.get("name", "Feature")

        # Parse features and names
        if geojson_type == "FeatureCollection":
            raw_features = geojson_data.get("features", [])
            if not raw_features:
                raise ValueError("FeatureCollection is empty")

            named_geometries: list[tuple[str, object]] = []
            for i, f in enumerate(raw_features):
                geom = f.get("geometry")
                if not geom:
                    continue
                props = f.get("properties") or {}
                name = (
                    props.get("name")
                    or props.get("id")
                    or props.get("label")
                    or f"{geojson_name} {i + 1}"
                )
                named_geometries.append((str(name), shape(geom)))

            if not named_geometries:
                raise ValueError("No valid geometries found in FeatureCollection")

            multi = True

        elif geojson_type == "Feature":
            geom = geojson_data.get("geometry")
            if not geom:
                raise ValueError("No geometry found in Feature")
            props = geojson_data.get("properties") or {}
            name = props.get("name") or props.get("id") or props.get("label") or f"{geojson_name} 1"
            named_geometries = [(str(name), shape(geom))]
            multi = False

        else:
            # Bare geometry (Point, Polygon, …)
            named_geometries = [("geometry", shape(geojson_data))]
            multi = False

        # CRS handling
        source_crs = detect_geojson_crs(geojson_data)
        logger.info("Detected GeoJSON CRS: %s", source_crs.to_string())

        geometries_only = [g for _, g in named_geometries]
        geometries_4326 = to_wgs84(geometries_only, source_crs)
        named_geometries_4326 = [
            (name, geom) for (name, _), geom in zip(named_geometries, geometries_4326)
        ]

        # Open raster once, iterate features
        with rasterio.open(raster_url) as src:
            raster_crs = src.crs
            logger.info("Raster CRS: %s, bounds: %s", raster_crs, src.bounds)

            wgs84 = CRS.from_epsg(4326)

            if raster_crs and raster_crs.to_epsg() != 4326:
                logger.info("Reprojecting geometries: from EPSG:4326 to %s", raster_crs)
                transformer = Transformer.from_crs(wgs84, raster_crs, always_xy=True)
                final_named = [
                    (name, shapely_transform(transformer.transform, geom))
                    for name, geom in named_geometries_4326
                ]
            else:
                final_named = named_geometries_4326

            if multi:
                results = []
                for name, geom in final_named:
                    try:
                        stats = stats_for_single_geometry(src, geom)
                        results.append({"name": name, "stats": stats})
                    except ValueError as e:
                        # Include the feature in the response but flag it
                        results.append({"name": name, "error": str(e)})

                return {"type": "collection", "features": results}

            _, geom = final_named[0]
            stats = stats_for_single_geometry(src, geom)
            return {"type": "single", "stats": stats}

    except AmbiguousCRSError:
        raise
    except ValueError as e:
        raise ValueError(f"Error extracting carbon stats: {e}") from e
    except Exception as e:
        logger.exception("Unexpected error in extract_carbon_stats: %s", e)
        raise ValueError(f"Error extracting carbon stats: {e}") from e
