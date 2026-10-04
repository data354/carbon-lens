import { geoKyServer } from "@/lib/ky/geo-api/server";
import { GeoApiResponse } from "../types/helpers";
import { mapAreas } from "../constants/areas";

export async function getAreaFeaturesServer(
  area = mapAreas.departments.value,
  date: string,
) {
  const res = await geoKyServer
    .get(`geo/${area}/${date}`)
    .json<GeoApiResponse<GeoJSON.FeatureCollection>>()
    .catch((err) => {
      console.log(
        `❌ Error fetching ${area} features:`,
        err,
      );
      throw err;
    });

  if ("detail" in res) {
    console.log(
      `❌ Error response fetching ${area} geo data:`,
      res.detail,
    );

    throw Error(
      `Erreur lors du chargement des données géographiques des ${area}`,
    );
  }

  return res;
}
