import { z } from "zod";
import { ACCEPTED_GEOJSON_FILES } from "../constants/file";

export const MIN_NAME_LENGTH = 2;

export const UploadGeoJsonSchema = z.object({
  name: z
    .string()
    .min(MIN_NAME_LENGTH, "Le nom de la zone est requis"),
  date: z.string().nonempty("La date est requise"),
  file: z.file("Le fichier est requis").refine(
    (file) => {
      const mimeMatch = ACCEPTED_GEOJSON_FILES.some(
        (accepted) => accepted.mimes.includes(file.type),
      );

      if (mimeMatch) return true;

      const fileName = file.name.toLowerCase();
      return ACCEPTED_GEOJSON_FILES.some((accepted) =>
        accepted.extensions.some((ext) =>
          fileName.endsWith(ext),
        ),
      );
    },
    {
      message:
        "Le fichier doit être au format GeoJSON (.json ou .geojson)",
    },
  ),
});
