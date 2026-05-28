"use client";

import { createContext, use, useState } from "react";

interface IMapContext {
  map: maplibregl.Map | undefined;
  registerMap: (map: maplibregl.Map) => void;
  unregisterMap: () => void;
}

const MapContext = createContext<IMapContext | null>(null);

export function MapProvider({
  children,
}: React.PropsWithChildren) {
  const [map, setMap] = useState<maplibregl.Map>();

  /**
   * Register the map instance in the context
   * @param map The map instance to register
   */
  function registerMap(map: maplibregl.Map) {
    setMap(map);
  }

  /**
   * Unregister the map instance from the context
   */
  function unregisterMap() {
    setMap(undefined);
  }

  return (
    <MapContext value={{ map, registerMap, unregisterMap }}>
      {children}
    </MapContext>
  );
}

export function useMap() {
  const ctx = use(MapContext);

  if (!ctx) {
    throw new Error(
      "useMap must be used within a MapProvider",
    );
  }

  return ctx;
}
