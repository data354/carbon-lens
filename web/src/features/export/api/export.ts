import { MapArea } from "@/features/map/types/areas";
import { geoKyClient } from "@/lib/ky";

export async function getCSVDownloadUrl(
  area: MapArea,
  date: string,
) {
  const res = await geoKyClient.get("files/download", {
    searchParams: {
      zone: area,
      date,
    },
  });

  if (!res.ok) {
    throw new Error(
      `Failed to export data: ${res.statusText}`,
    );
  }

  const filename =
    res.headers
      .get("Content-Disposition")
      ?.split("filename=")
      .at(-1) || `${area}_${date}.csv`;

  return {
    blob: await res.blob(),
    filename,
  };
}
