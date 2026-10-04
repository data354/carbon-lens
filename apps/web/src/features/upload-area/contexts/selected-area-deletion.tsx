"use client";

import { createContext, use, useState } from "react";
import { CustomArea } from "../types/custom-area";

interface SelectedAreaForDeletionContext {
  areaToDelete: CustomArea | null;
  setAreaToDelete: (area: CustomArea | null) => void;
}

const SelectedAreaForDeletionContext =
  createContext<SelectedAreaForDeletionContext | null>(
    null,
  );

export function SelectedAreaForDeletionProvider({
  children,
}: React.PropsWithChildren) {
  const [areaToDelete, setAreaToDelete] =
    useState<CustomArea | null>(null);

  return (
    <SelectedAreaForDeletionContext
      value={{ areaToDelete, setAreaToDelete }}
    >
      {children}
    </SelectedAreaForDeletionContext>
  );
}

export function useSelectedAreaForDeletion() {
  const ctx = use(SelectedAreaForDeletionContext);

  if (!ctx) {
    throw new Error(
      "useSelectedAreaForDeletion must be used within a SelectedAreaForDeletionProvider",
    );
  }

  return ctx;
}
