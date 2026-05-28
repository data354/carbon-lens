"use client";

import { createContext, use, useState } from "react";
import { IMapFilters } from "../types/filters";
import { MapArea } from "../types/areas";

interface IMapFiltersContext extends IMapFilters {
  reset: () => void;
  update: (newFilters: Partial<IMapFilters>) => void;
}

const MapFiltersContext =
  createContext<IMapFiltersContext | null>(null);

export function MapFiltersProvider({
  initialArea,
  initialDate,
  children,
}: React.PropsWithChildren<{
  initialArea: MapArea;
  initialDate: string;
}>) {
  const [filters, setFilters] = useState<IMapFilters>({
    date: initialDate,
    area: initialArea,
  });

  const update = (newFilters: Partial<IMapFilters>) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }));
  };

  const reset = () => {
    setFilters({
      date: initialDate,
      area: initialArea,
    });
  };

  return (
    <MapFiltersContext
      value={{
        ...filters,
        update,
        reset,
      }}
    >
      {children}
    </MapFiltersContext>
  );
}

export function useMapFilters() {
  const ctx = use(MapFiltersContext);

  if (!ctx) {
    throw new Error(
      "useMapFilters must be used within a MapFiltersProvider",
    );
  }

  return ctx;
}
