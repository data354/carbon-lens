export type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

export type Optional<T> = {
  [K in keyof T]?: T[K];
};

export type GeoApiResponse<T = any> =
  | T
  | { detail: string };
