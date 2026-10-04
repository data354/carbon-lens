"""" Tile endpoints for serving COG tiles with colormap for different dates. """
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from titiler.core.factory import TilerFactory

from core.config import (
    colormap, VMIN, VMAX, ZOOM_MIN, ZOOM_MAX, WATERCOURSES_TIF, WATERCOURSES_COLORMAP
)
from core.dependencies import color_map_params
import models as models
from utils.raster_utils import url_for_date

router = APIRouter()
tiler = TilerFactory(colormap_dependency=color_map_params)


@router.get("/tilejson/{date}", response_model=models.TileJSONResponse)
def tilejson(date: str):
    """TileJSON with linear colormap for a given date."""

    url = url_for_date(date)
    tile_url = (
        f"/tiles/cog/tiles/WebMercatorQuad/{{z}}/{{x}}/{{y}}@1x"
        f"?url={url}&colormap={colormap}&colormap_type=linear"
        f"&resampling=nearest"
    )

    return {
        "tilejson": "2.2.0",
        "name": f"predicted_cagb_{date}",
        "tiles": [tile_url],
        "minzoom": ZOOM_MIN,
        "maxzoom": ZOOM_MAX,
        "attribution": "CarbonLens",
        "style": "linear_cagb",
        "rescale": [VMIN, VMAX],
    }


@router.get("/preview/{date}", response_model=models.PreviewResponse)
def preview(date: str):
    """PNG preview with linear colormap for a given date."""
    url = url_for_date(date)

    return {
        "preview": (
            f"/tiles/cog/preview.png?url={url}"
            f"&colormap={colormap}&colormap_type=linear&rescale={VMIN}%2C{VMAX}"
        )
    }


@router.get("/stats/{date}", response_model=models.StatsResponse)
def stats(date: str):
    """Global stats for a given date."""
    url = url_for_date(date)

    return {"stats": f"/tiles/cog/statistics?url={url}&rescale={VMIN}%2C{VMAX}&nodata=-9999"}

@router.get("/watercourses")
async def get_watercourses_tiles() -> JSONResponse:
    """Get tile configuration for watercourses layer in Blues."""

    tiles_url = (
        f'/tiles/cog/tiles/WebMercatorQuad/{{z}}/{{x}}/{{y}}.png'
        f'?url={WATERCOURSES_TIF}'
        f'&colormap={WATERCOURSES_COLORMAP}&colormap_type=explicit'
    )

    return JSONResponse({
        "tiles_url": tiles_url,
        "source": {
            "type": "raster",
            "tiles": [tiles_url],
            "tileSize": 256,
            "attribution": "CarbonLens",
            "minzoom": 0,
            "maxzoom": 18,
        },
        "layer": {
            "id": "watercourses-layer",
            "type": "raster",
            "source": "watercourses",
            "paint": {"raster-opacity": 0.85},
        },
    })

router.include_router(tiler.router, prefix="/cog")
