"use client";

import { createContext, use, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { SHEET_CLOSE_ANIMATION_DURATION } from "@/components/ui/sheet";

export type DashboardSheet =
  | "global-report"
  | "upload-geojson";

interface DashboardSheetsContext {
  isOpen: boolean;
  active: DashboardSheet | undefined;
  open: (type: DashboardSheet) => void;
  close: () => void;
}

const DashboardSheetsContext =
  createContext<DashboardSheetsContext | null>(null);

export function DashboardSheetsProvider({
  children,
}: React.PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState<DashboardSheet>();

  const debouncedClearActive = useDebouncedCallback(() => {
    setActive(undefined);
  }, SHEET_CLOSE_ANIMATION_DURATION);

  const open = (type: DashboardSheet) => {
    debouncedClearActive.cancel();
    setActive(type);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    debouncedClearActive();
  };

  return (
    <DashboardSheetsContext
      value={{ isOpen, active, open, close }}
    >
      {children}
    </DashboardSheetsContext>
  );
}

export function useDashboardSheets() {
  const ctx = use(DashboardSheetsContext);

  if (!ctx) {
    throw new Error(
      "useDashboardSheets must be used within a DashboardSheetsProvider",
    );
  }

  return ctx;
}
