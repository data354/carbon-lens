"use client";

import { PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAreaFetchingState } from "@/features/map/contexts/area-fetching-state";
import { useDashboardSheets } from "@/features/dashboard/contexts/sheets";
import { useEffect, useState } from "react";

export function GlobalReportSheetButton() {
  const [mounted, setMounted] = useState(false);
  const { open: openSheet } = useDashboardSheets();
  const { state } = useAreaFetchingState();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // ⛔ skip SSR to avoid mismatch
  }

  const canOpen = Object.values(state).some(
    (state) => state !== "success",
  );

  return (
    <Button
      variant="outline"
      onClick={() => openSheet("global-report")}
      disabled={canOpen}
    >
      <PanelLeftOpen />
      Rapport global
    </Button>
  );
}
