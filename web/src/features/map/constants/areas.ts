import { MapArea } from "../types/areas";

type MapAreaKey =
  | "regions"
  | "departments"
  | "communes"
  | "protectedAreas"
  | "custom";

export const mapAreas: Record<
  MapAreaKey,
  {
    label: string;
    value: MapArea;
  }
> = {
  regions: {
    label: "Régions",
    value: "regions",
  },
  departments: {
    label: "Départements",
    value: "departments",
  },
  communes: {
    label: "Communes",
    value: "communes",
  },
  protectedAreas: {
    label: "Zones protégées",
    value: "protected_areas",
  },
  custom: {
    label: "Mes zones",
    value: "custom",
  },
};
