"""Utility functions for geospatial data handling."""
import json
import geopandas as gpd

def load_geojson_wgs84(geo_path: str) -> gpd.GeoDataFrame:
    """ Load a GeoJSON file and ensure it is in WGS84 (EPSG:4326) coordinate reference system. """
    gdf = gpd.read_file(geo_path)

    if gdf.crs is None:
        gdf.set_crs(4326, inplace=True)
    elif gdf.crs.to_epsg() != 4326:
        gdf = gdf.to_crs(4326)
    return gdf


def gdf_to_geojson(gdf: gpd.GeoDataFrame) -> dict:
    """ Convert a GeoDataFrame to a GeoJSON-like dictionary. """
    return {"type": "FeatureCollection", "features": json.loads(gdf.to_json())["features"]}
