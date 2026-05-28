import { geoKyClient } from "@/lib/ky";

export async function getCommunes(date: string) {
  const res = await geoKyClient
    .get(`geo/communes/${date}/all`)
    .json<{ communes: string[] }>()
    .catch((err) => {
      console.log("❌ Error fetching communes:", err);
      throw err;
    });

  if ("detail" in res) {
    console.log(
      "❌ Error response fetching communes:",
      res.detail,
    );

    throw Error("Error response fetching communes");
  }

  return res.communes;
}
