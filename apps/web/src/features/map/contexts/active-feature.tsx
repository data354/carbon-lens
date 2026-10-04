"use client";

import { createContext, use, useState } from "react";

interface ActiveFeatureContext {
  activeFeature: GeoJSON.Feature | undefined;
  setActiveFeature: (
    feature: GeoJSON.Feature | undefined,
  ) => void;
}

const ActiveFeatureContext =
  createContext<ActiveFeatureContext | null>(null);

export function ActiveFeatureProvider({
  children,
}: React.PropsWithChildren) {
  const [activeFeature, setActiveFeature] =
    useState<GeoJSON.Feature>();

  return (
    <ActiveFeatureContext
      value={{ activeFeature, setActiveFeature }}
    >
      {children}
    </ActiveFeatureContext>
  );
}

export function useActiveFeature() {
  const ctx = use(ActiveFeatureContext);

  if (!ctx) {
    throw new Error(
      "useActiveFeature must be used within an ActiveFeatureProvider",
    );
  }

  return ctx;
}
