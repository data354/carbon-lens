""" Main module for the CarbonLens API. """
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import API_DESCRIPTION, ORIGINS, ROUTER_PREFIXES
import models as models
from routers import (
    carbon_stats, catalog, files,
    geo, geo_stats, legend, tiles
)


# FastAPI app initialization
app = FastAPI(
    title="CarbonLens API",
    description=API_DESCRIPTION,
    version="0.1"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get(
    "/",
    summary="Health Check of the API",
    description="Checks if the API is running properly.",
    response_description="API Status",
    operation_id="health_check_carbonlens_api",
    tags=["Monitoring"],
    response_model=models.RootResponse
)
async def root():
    """ Health Check of the API. """
    return {
        "status": "ok",
        "message": "Welcome to the CarbonLens API! Visit /docs or /redoc for API documentation.",
        "routes": list(ROUTER_PREFIXES.values()),
    }

app.include_router(catalog.router, prefix=ROUTER_PREFIXES["catalog"], tags=["Catalog"])
app.include_router(geo.regions_router, prefix=ROUTER_PREFIXES["geo"], tags=["Regions"])
app.include_router(
    geo_stats.regions_stats_router, prefix=ROUTER_PREFIXES["geo"], tags=["Regions"])
app.include_router(geo.departments_router, prefix=ROUTER_PREFIXES["geo"], tags=["Departments"])
app.include_router(
    geo_stats.departments_stats_router, prefix=ROUTER_PREFIXES["geo"], tags=["Departments"])
app.include_router(geo.communes_router, prefix=ROUTER_PREFIXES["geo"], tags=["Communes"])
app.include_router(
    geo_stats.communes_stats_router, prefix=ROUTER_PREFIXES["geo"], tags=["Communes"])
app.include_router(
    geo.protected_areas_router, prefix=ROUTER_PREFIXES["geo"], tags=["Protected Areas"])
app.include_router(
    geo_stats.protected_areas_stats_router, prefix=ROUTER_PREFIXES["geo"], tags=["Protected Areas"])
app.include_router(geo.search_router, prefix=ROUTER_PREFIXES["geo"], tags=["Geo Search"])
app.include_router(tiles.router, prefix=ROUTER_PREFIXES["tiles"], tags=["Tiles"])
app.include_router(carbon_stats.router, prefix=ROUTER_PREFIXES["tiles"], tags=["Carbon Statistics"])
app.include_router(files.router, prefix=ROUTER_PREFIXES["files"], tags=["Exports"])
app.include_router(legend.router, prefix=ROUTER_PREFIXES["legend"], tags=["Legend"])
