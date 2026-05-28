"use client";

import { createContext, use } from "react";
import { CustomArea } from "../types/custom-area";

interface CustomAreasContext {
  data: CustomArea[];
}

const CustomAreasContext =
  createContext<CustomAreasContext | null>(null);

export function CustomAreasProvider({
  children,
  data = [],
}: React.PropsWithChildren<{
  data?: CustomArea[];
}>) {
  return (
    <CustomAreasContext value={{ data }}>
      {children}
    </CustomAreasContext>
  );
}

export function useCustomAreas() {
  const ctx = use(CustomAreasContext);

  if (!ctx) {
    throw new Error(
      "useCustomAreas must be used within a CustomAreasProvider",
    );
  }

  return ctx;
}
