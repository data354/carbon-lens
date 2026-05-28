import { geoKyClient } from "@/lib/ky";
import { GeoApiResponse } from "../types/helpers";
import { mapAreas } from "../constants/areas";
import { MapArea } from "../types/areas";

export async function getAreaFeatures(
  area = mapAreas.departments.value,
  date: string,
) {
  const res = await geoKyClient
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

export async function getAreaFeatureByName(
  area: MapArea,
  date: string,
  name: string,
) {
  const res = await geoKyClient
    .get(`geo/${area}/${date}/${encodeURIComponent(name)}`)
    .json<GeoApiResponse<GeoJSON.FeatureCollection>>()
    .catch((err) => {
      console.log(
        `❌ Error fetching feature ${name}:`,
        err,
      );
      throw err;
    });

  if ("detail" in res) {
    console.log(
      `❌ Error response fetching feature ${name}:`,
      res.detail,
    );

    throw Error(
      `Erreur lors du chargement des données géographiques de ${name}`,
    );
  }

  return res;
}

export async function getAreaStatsByDate(
  date: string,
  feature: GeoJSON.Feature,
) {
  const res = await geoKyClient
    .get(`tiles/stats/${date}`)
    .json<
      GeoApiResponse<{
        stats: string;
      }>
    >()
    .then(async (statsRes) => {
      if ("detail" in statsRes) {
        console.log(
          "❌ Error response fetching department stats:",
          statsRes.detail,
        );

        throw Error(
          "Erreur lors du chargement des statistiques des départements",
        );
      }

      return await geoKyClient
        .post(statsRes.stats.slice(1), {
          json: {
            type: "FeatureCollection",
            features: [feature],
          },
        })
        .json<GeoApiResponse<GeoJSON.FeatureCollection>>();
    })
    .catch((err) => {
      console.log("❌ Error fetching stats:", err);

      throw err;
    });

  if ("detail" in res) {
    console.log(
      "❌ Error response fetching stats",
      res.detail,
    );

    throw Error(
      "Erreur lors du chargement des données géographiques",
    );
  }

  return res;
}
