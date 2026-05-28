"use client";

import { MapArea } from "@/features/map/types/areas";
import { createContext, use, useState } from "react";

interface MapSearchParams {
  area: MapArea | undefined;
  name: string;
}

interface MapSearchParamsContext {
  mapSearchParams: MapSearchParams;
  setMapSearchParams: (params: MapSearchParams) => void;
  reset: () => void;
}

const MapSearchParamsContext =
  createContext<MapSearchParamsContext | null>(null);

export function MapSearchParamsProvider({
  children,
}: React.PropsWithChildren) {
  const [mapSearchParams, setMapSearchParams] =
    useState<MapSearchParams>({
      area: undefined,
      name: "",
    });

  const reset = () => {
    setMapSearchParams({
      area: undefined,
      name: "",
    });
  };

  return (
    <MapSearchParamsContext
      value={{ mapSearchParams, setMapSearchParams, reset }}
    >
      {children}
    </MapSearchParamsContext>
  );
}

export function useMapSearchParams() {
  const ctx = use(MapSearchParamsContext);

  if (!ctx) {
    throw new Error(
      "useMapSearchParams must be used within a MapSearchParamsProvider",
    );
  }

  return ctx;
}
