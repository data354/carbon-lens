export const MAX_FILE_COUNT = 1;

export const MAX_GEOJSON_FILE_SIZE_MO = 10;

export const ACCEPTED_GEOJSON_FILES = [
  {
    name: "GeoJSON",
    mimes: [
      "application/json",
      "application/geo+json",
      "application/octet-stream",
    ],
    extensions: [".json", ".geojson"],
  },
];
