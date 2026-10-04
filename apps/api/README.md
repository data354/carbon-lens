# CarbonLens API

REST API backend for the **CarbonLens** application — a platform for exploring, visualizing, and analyzing high-resolution carbon stock maps of Senegal, generated from multi-source satellite imagery (Sentinel-1, Sentinel-2, DEM) and Artificial Intelligence combined with field observations.


## Table of Contents

* [Overview](#overview)
* [Tech Stack](#tech-stack)
* [Project Structure](#project-structure)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Run with Docker](#run-with-docker)
  * [Run locally (without Docker)](#run-locally-without-docker)
* [Configuration](#configuration)
* [API Endpoints](#api-endpoints)
* [Data Source](#data-source)
* [Carbon Stock Classes](#carbon-stock-classes)
* [CORS](#cors)


## Overview

CarbonLens API exposes geospatial endpoints to interact with carbon stock prediction maps at multiple administrative levels (regions, departments, communes, protected areas) for Senegal. It serves map tiles, GeoJSON boundaries, carbon statistics, file exports, and more.


## Tech Stack

| Layer | Technology |
|----|----|
| Framework | FastAPI |
| Server | Uvicorn |
| Runtime | Python |
| Geospatial | Rasterio, GeoPandas, Shapely, PyProj |
| Tile serving | TiTiler Core |
| Cloud storage | Google Cloud Storage (public bucket) |
| Containerization | Docker (multi-stage build) |


## Project Structure

```
carbonlens_api/
├── core/
│   ├── config.py          # Configuration loader (config.yml)
│   └── dependencies.py    # Dependencies to handle colormaps
├── data/                  # Local files
├── factories/             # GeoJSON response factory
│   ├── geo_factory.py     
│   └── geo_stats_factory.py
├── routers/
│   ├── catalog.py         # Available map dates
│   ├── geo.py             # Boundaries (regions, departments, communes, protected areas)
│   ├── geo_stats.py       # Per-zone carbon statistics
│   ├── carbon_stats.py    # National & custom geometry statistics
│   ├── tiles.py           # Map tile serving (TileJSON)
│   ├── files.py           # CSV exports
│   └── legend.py          # Carbon class legend
├── utils/
│   ├── date_utils.py
│   ├── gcs_utils.py       # Google Cloud Storage helpers
│   ├── geo_utils.py
│   └── raster_utils.py
├── main.py                # App entry point & router registration
├── models.py              # Pydantic request/response models
├── config.yml             # Environment & app configuration
├── requirements.txt
└── Dockerfile
```


## Getting Started

### Prerequisites

* [Docker](https://docs.docker.com/get-docker/) *(recommended)*
* Use a virtual environment (recommended)
* Or Python 3.12 + GDAL system libraries installed locally

### Run with Docker

```bash
# Build the image
docker build -t carbonlens-api .

# Run the container
docker run -p 8080:8080 carbonlens-api
```

The API will be available at `http://localhost:8080`.

### Run locally (without Docker)

```bash
# Install system dependencies (Ubuntu/Debian)
sudo apt-get install gdal-bin libgdal-dev

# Create and activate a virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate       # Linux / macOS
# venv\Scripts\activate        # Windows

# Install Python dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```


## Configuration

All configuration is managed via `config.yml` at the root of the project.

| Key | Description |
|----|----|
| `env` | Active environment (`local`, `staging`, `production`) |
| `cors` | Allowed origins per environment |
| `router_prefixes` | URL prefix for each router group |
| `data_index_path` | URL to the GCS data index CSV |
| `gcs.bucket` | GCS bucket name |
| `gcs.prefix` | Path prefix inside the bucket |
| `scale.vmin / vmax` | Raster value range for tile rendering |
| `zoom.min / max` | Tile zoom level bounds |
| `nodata` | No-data value used in rasters (`-9999`) |

No `.env` file is required — the app reads `config.yml` directly via `core/config.py`.


## API Endpoints

Once running, interactive documentation is available at:

* **Swagger UI** → `http://localhost:8080/docs`
* **ReDoc** → `http://localhost:8080/redoc`


### Monitoring

| Method | Path | Description |
|----|----|----|
| `GET` | `/` | Health check — returns API status and registered route prefixes |


### Catalog

Base prefix: `/catalog`

| Method | Path | Description |
|----|----|----|
| `GET` | `/catalog/dates` | List all available prediction dates (format `YYYY-MM`) |
| `GET` | `/catalog/cog?date={date}` | Get the COG file URL for a given date |


### Geo — Boundaries

Base prefix: `/geo`

Each administrative level exposes two endpoints: one to list all available names, one to retrieve the GeoJSON boundary for a specific name and date.

| Method | Path | Description |
|----|----|----|
| `GET` | `/geo/regions` | List all region names |
| `GET` | `/geo/regions/{name}?date={date}` | Get GeoJSON boundary for a specific region and date |
| `GET` | `/geo/departments` | List all department names |
| `GET` | `/geo/departments/{name}?date={date}` | Get GeoJSON boundary for a specific department and date |
| `GET` | `/geo/communes` | List all commune names |
| `GET` | `/geo/communes/{name}?date={date}` | Get GeoJSON boundary for a specific commune and date |
| `GET` | `/geo/protected_areas` | List all protected area names |
| `GET` | `/geo/protected_areas/{name}?date={date}` | Get GeoJSON boundary for a specific protected area and date |


### Geo — Search

Base prefix: `/geo`

| Method | Path | Description |
|----|----|----|
| `GET` | `/geo/search?q={query}` | Search across all administrative levels (regions, departments, communes, protected areas). Matching is case-insensitive, accent-insensitive, and substring-based. Results are ranked: names starting with the query appear first. |


### Geo — Statistics

Base prefix: `/geo`

Each administrative level exposes a statistics endpoint returning carbon stock metrics for a specific zone and date.

| Method | Path | Description |
|----|----|----|
| `GET` | `/geo/regions/{name}/stats?date={date}` | Carbon statistics for a region |
| `GET` | `/geo/departments/{name}/stats?date={date}` | Carbon statistics for a department |
| `GET` | `/geo/communes/{name}/stats?date={date}` | Carbon statistics for a commune |
| `GET` | `/geo/protected_areas/{name}/stats?date={date}` | Carbon statistics for a protected area |


### Tiles

Base prefix: `/tiles`

| Method | Path | Description |
|----|----|----|
| `GET` | `/tiles/tilejson/{date}` | TileJSON descriptor with a linear colormap for the given date |
| `GET` | `/tiles/preview/{date}` | PNG preview URL with colormap for the given date |
| `GET` | `/tiles/stats/{date}` | Global raster statistics URL for the given date |
| `GET` | `/tiles/watercourses` | Tile configuration for the watercourses layer (BWR colormap) |
| `*` | `/tiles/cog/*` | TiTiler COG endpoints (tiles, statistics, info, etc.) |


### Carbon Statistics

Base prefix: `/tiles`

| Method | Path | Description |
|----|----|----|
| `GET` | `/tiles/national-stats/{date}` | National carbon statistics (mean, land area) for the two closest dates around the given date. Returns `current` and `previous` periods. |
| `POST` | `/tiles/stats/geometry?date={date}` | Extract carbon statistics (mean, min, max, std, count) for an uploaded GeoJSON file. The geometry must be in **EPSG:4326 (WGS84)** or include an explicit `crs` member. |

`POST /tiles/stats/geometry` — Request

| Parameter | Type | Description |
|----|----|----|
| `file` | `multipart/form-data` | GeoJSON file (`.geojson` or `.json`) |
| `date` | `query` | Date in `YYYY-MM` format (e.g. `2024-01`) |


### Exports

Base prefix: `/files`

| Method | Path | Description |
|----|----|----|
| `GET` | `/files/download?zone={zone}&date={date}` | Stream a CSV file from GCS for the given zone type and date |

**Query parameters:**

| Parameter | Values | Description |
|----|----|----|
| `zone` | `regions`, `departments`, `communes`, `protected_areas` | Administrative level |
| `date` | `YYYY-MM` | Prediction date (e.g. `2024-05`) |


### Legend

Base prefix: `/legend`

| Method | Path | Description |
|----|----|----|
| `GET` | `/legend/carbon-classes` | List all carbon stock classes with their color, range, short name, and description |


## Data Source

All geospatial data and raster files are served from a **public Google Cloud Storage bucket**:

```
https://storage.googleapis.com/carbonlens-bucket/v1/senegal/
```

The `data_index.csv` file at that location indexes all available prediction dates and file paths. Local files in `data/` serve as fallback seed data.


## Carbon Stock Classes

The API uses the following carbon stock classification:

| Class | Name | Range (Mg C/ha) | Meaning |
|----|----|----|----|
| OL | Open Land | 0 – 3 | Cleared land, very little woody vegetation |
| S | Scrub | 3 – 6 | Former forest dominated by shrubs |
| YRF | Young Regenerating Forest | 6 – 9 | Disturbed forest in regeneration |
| LDF | Low Density Forest | 9 – 12 | Open canopy, lower biomass |
| MDF | Medium Density Forest | 12 – 15 | Partially open canopy, intermediate biomass |
| HDF | High Density Forest | > 15 | Closed canopy, high biomass, mature trees |


## CORS

Allowed origins are defined per environment in `config.yml`. In `staging` and `production`, only specific frontend URLs are whitelisted. In `local`, all origins (`*`) are permitted.

To add a new allowed origin, edit the relevant environment block in `config.yml`:

```yaml
cors:
  production:
    - "https://your-frontend-domain.com"
```


