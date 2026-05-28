import { toFeaturePropsStats } from "../helpers/stats";
import { UploadedAreaStats } from "../types/uploaded-area-stats";
import { ulid } from "ulid";

export async function appendStatsToGeoJson(
  geoJsonFile: File,
  areaName: string,
  stats: UploadedAreaStats,
) {
  const fileContent = await geoJsonFile.text();
  const geoJson = JSON.parse(
    fileContent,
  ) as GeoJSON.Feature;

  // TODO: handle FeatureCollection and other types

  geoJson.id = ulid();
  geoJson.properties = {
    ...geoJson.properties,
    ...toFeaturePropsStats(stats),
    NAME: areaName,
  };

  return geoJson;
}
