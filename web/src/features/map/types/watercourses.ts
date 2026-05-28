export interface WatercoursesResponse {
  title_url: string;
  source: {
    type: "raster";
    tiles: string[];
    tileSize: number;
    attribution: string;
    minzoom: number;
    maxzoom: number;
  };
  layer: {
    id: string;
    type: "raster";
    source: string;
    paint: {
      "raster-opacity": number;
    };
  };
}
