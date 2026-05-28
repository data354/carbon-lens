import { MapArea } from "@/features/map/types/areas";
import { geoKyClient } from "@/lib/ky";

export async function searchAreas(q: string) {
  return await geoKyClient
    .get("geo/search", { searchParams: { q } })
    .json<Record<MapArea, string[]>>()
    .catch((err) => {
      console.log("❌ Error searching areas:", err);
      throw err;
    });
}
