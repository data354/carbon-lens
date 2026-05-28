import { geoKyClient } from "@/lib/ky";

export async function getProtectedAreas(date: string) {
  const res = await geoKyClient
    .get(`geo/protected_areas/${date}/all`)
    .json<{ protected_areas: string[] }>()
    .catch((err) => {
      console.log(
        "❌ Error fetching protected areas:",
        err,
      );
      throw err;
    });

  if ("detail" in res) {
    console.log(
      "❌ Error response fetching protected areas:",
      res.detail,
    );

    throw Error("Error response fetching protected areas");
  }

  return res.protected_areas;
}
