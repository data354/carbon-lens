""" Configuration module for the CarbonLens API. """
import json
import logging
import os
from pathlib import Path
import urllib.parse

import yaml

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

PATH = Path(__file__).resolve().parents[1]/ "config.yml"

if not PATH.exists():
    logger.warning("Configuration file not found: %s", PATH)
else:
    logger.info("Loading configuration from %s", PATH)

config = {}
if PATH.exists():
    with PATH.open("r", encoding="utf-8") as f:
        config = yaml.safe_load(f) or {}

# Allow environment variable override
ENV = os.getenv("ENV", config.get("env", "local"))

API_DESCRIPTION = config.get("api_description", "")
cors = config.get("cors", {})

# Origins for CORS
ORIGINS = cors.get(ENV) or cors.get("local") or ["*"]

# Router prefixes
ROUTER_PREFIXES = config.get("router_prefixes", {
    "catalog": "/catalog",
    "geo": "/geo",
    "tiles": "/tiles",
    "files": "/files",
    "watercourses": "/watercourses"
})

# Data index path
DATA_INDEX_PATH = config.get("data_index_path", "data_index.csv")
if DATA_INDEX_PATH == "data_index.csv":
    DATA_INDEX_PATH = Path(__file__).resolve().parents[1] / "data" / DATA_INDEX_PATH

# GEO
geo_config = config.get("geo", {})

# Store templates
REGIONS_TEMPLATE = geo_config.get("regions_file", "data/senegal_regions_preds_{date}.geojson")
DEPARTMENTS_TEMPLATE = geo_config.get(
    "departments_file", "data/senegal_departments_preds_{date}.geojson")
COMMUNES_TEMPLATE = geo_config.get(
    "communes_file", "data/senegal_communes_preds_{date}.geojson")
PROTECTED_AREAS_TEMPLATE = geo_config.get(
    "protected_areas_file", "data/senegal_protected_areas_preds_{date}.geojson")

REGION_PROPERTY = geo_config.get("region_property", "NAME_1")
DEPARTMENT_PROPERTY = geo_config.get("department_property", "NAME_2")
COMMUNE_PROPERTY = geo_config.get("commune_property", "NAME_4")
PROTECTED_AREA_PROPERTY = geo_config.get("protected_area_property", "NAME")

REGIONS_BASE = geo_config.get("regions_base", "regions")
DEPARTMENTS_BASE = geo_config.get("departments_base", "departments")
COMMUNES_BASE = geo_config.get("communes_base", "communes")
PROTECTED_AREAS_BASE = geo_config.get("protected_areas_base", "protected_areas")

REGIONS_FILE = "senegal_regions_preds_2024-05.geojson"
DEPARTMENTS_FILE = "senegal_departments_preds_2024-05.geojson"
COMMUNES_FILE = "senegal_communes_preds_2024-05.geojson"
PROTECTED_AREAS_FILE = "senegal_protected_areas_preds_2024-05.geojson"

# Scale
SCALE_CONFIG = config.get("scale", {})
VMIN = SCALE_CONFIG.get("vmin", 0)
VMAX = SCALE_CONFIG.get("vmax", 200)

# Zoom
ZOOM_CONFIG = config.get("zoom", {})
ZOOM_MIN = ZOOM_CONFIG.get("min", 0)
ZOOM_MAX = ZOOM_CONFIG.get("max", 21)

# NoData
NODATA = config.get("nodata", -9999)

# GCS
GCS_CONFIG = config.get("gcs", {})
GCS_BUCKET = GCS_CONFIG.get("bucket", "carbonlens-bucket")
GCS_PREFIX = GCS_CONFIG.get("prefix", "v1/senegal/")

# WATERCOURSES
WATERCOURSES_TIF = config.get("watercourses", "data/watercourses.tif")

# Carbon classes
CARBON_CLASSES = config.get("carbon_classes", {})

# Colormap
colormap_dict = {c["min"]: c["color"] for c in CARBON_CLASSES}
colormap_dict[255] = CARBON_CLASSES[-1]["color"]  # HDF
colormap_json = json.dumps(colormap_dict, separators=(",", ":"))
colormap = urllib.parse.quote(colormap_json)
WATERCOURSES_COLORMAP = '{"1":[210,231,234,255]}'

# Pixel size and area conversions
PIXEL_SIZE_M = float(config.get("pixel_size_m", 10))
M2_TO_HA = float(config.get("m2_to_ha", 1e-4))
HA_TO_KM2 = float(config.get("ha_to_km2", 1e-2))
PIXEL_AREA_HA = (PIXEL_SIZE_M ** 2) * M2_TO_HA
