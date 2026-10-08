""" Dependency module for handling colormap parameters for TiTiler (Titiler Docs). """
import json
from typing import Annotated, Dict, Literal, Optional
from fastapi import HTTPException, Query
import matplotlib.colors
import numpy
from rio_tiler.colormap import parse_color, cmap as default_cmap

from core.config import WATERCOURSES_TIF
from utils.raster_utils import DATA_INDEX

# Rasters served by the tiler: the dated carbon maps and the watercourses layer
ALLOWED_DATASET_URLS = frozenset(DATA_INDEX["url"]) | {WATERCOURSES_TIF}


def dataset_path_params(url: Annotated[str, Query(description="Dataset URL")]) -> str:
    """
    Only allow the project rasters, so that the tiler cannot be used
    to fetch arbitrary URLs or local files.
    """
    if url not in ALLOWED_DATASET_URLS:
        raise HTTPException(status_code=400, detail="Dataset URL not allowed.")
    return url


def color_map_params(
    colormap_name: Optional[str] = Query(None, description="Predefined colormap name"),
    colormap: Optional[str] = Query(None, description="Custom colormap as JSON string"),
    colormap_type: Literal["explicit", "linear"] = Query("explicit", description="Colormap type"),
) -> Optional[Dict[int, tuple]]:
    """
    Handle custom and predefined colormaps.
    """
    # Predefined colormap case
    if colormap_name:
        return default_cmap.get(colormap_name)

    # Custom colormap case
    if colormap:
        try:
            cm = json.loads(
                colormap,
                object_hook=lambda x: {int(k): parse_color(v) for k, v in x.items()}
            )
            print(cm)
        except json.JSONDecodeError as err:
            raise HTTPException(
                status_code=400, detail="Parsing colormap JSON string failed."
            ) from err

        if colormap_type == "linear":
            cmap_obj = matplotlib.colors.LinearSegmentedColormap.from_list(
                "custom",
                [
            (k / 255, matplotlib.colors.to_hex([v / 255 for v in rgba])) for (k, rgba) in cm.items()
                ],
                256,
            )
            x = numpy.linspace(0, 1, 256)
            cmap_vals = cmap_obj(x)[:, :]
            cmap_uint8 = (cmap_vals * 255).astype("uint8")
            cm = {idx: value.tolist() for idx, value in enumerate(cmap_uint8)}

        return cm

    return None
