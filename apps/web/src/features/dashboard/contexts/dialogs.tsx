"use client";

import { createContext, use, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { DIALOG_ANIMATION_DURATION } from "@/components/ui/dialog";

export type DashboardDialog =
  | "stats"
  | "search"
  | "settings"
  | "upload-geojson"
  | "delete-custom-area";

interface DashboardDialogsContext {
  isOpen: boolean;
  active: DashboardDialog | undefined;
  open: (type: DashboardDialog) => void;
  close: () => void;
}

const DashboardDialogsContext =
  createContext<DashboardDialogsContext | null>(null);

export function DashboardDialogsProvider({
  children,
}: React.PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState<DashboardDialog>();

  const debouncedClearActive = useDebouncedCallback(() => {
    setActive(undefined);
  }, DIALOG_ANIMATION_DURATION);

  const open = (type: DashboardDialog) => {
    debouncedClearActive.cancel();
    setActive(type);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    debouncedClearActive();
  };

  return (
    <DashboardDialogsContext
      value={{ isOpen, active, open, close }}
    >
      {children}
    </DashboardDialogsContext>
  );
}

export function useDashboardDialogs() {
  const ctx = use(DashboardDialogsContext);

  if (!ctx) {
    throw new Error(
      "useDashboardDialogs must be used within a DashboardDialogsProvider",
    );
  }

  return ctx;
}
