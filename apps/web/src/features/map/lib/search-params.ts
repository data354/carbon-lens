import { parseAsString, createLoader } from "nuqs/server";
import { mapAreas } from "../constants/areas";

export const mapSearchParams = {
  date: parseAsString,
  area: parseAsString.withDefault(
    mapAreas.departments.value,
  ),
};

export const loadMapSearchParams =
  createLoader(mapSearchParams);
