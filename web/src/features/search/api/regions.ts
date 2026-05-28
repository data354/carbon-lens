import { geoKyClient } from "@/lib/ky";

export async function getRegions(date: string) {
  const res = await geoKyClient
    .get(`geo/regions/${date}/all`)
    .json<{ regions: string[] }>()
    .catch((err) => {
      console.log("❌ Error fetching regions:", err);
      throw err;
    });

  if ("detail" in res) {
    console.log(
      "❌ Error response fetching regions:",
      res.detail,
    );

    throw Error("Error response fetching regions");
  }

  return res.regions;
}
