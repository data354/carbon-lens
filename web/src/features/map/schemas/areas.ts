import { z } from "zod";
import { mapAreas } from "@/features/map/constants/areas";

export const MapAreaSchema = z
  .string()
  .refine(
    (val) =>
      val === mapAreas.regions.value ||
      val === mapAreas.departments.value ||
      val === mapAreas.communes.value ||
      val === mapAreas.protectedAreas.value ||
      val === mapAreas.custom.value,
    {
      message: "Invalid area value",
    },
  );
