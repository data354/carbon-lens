"use client";

import { Sheet } from "@/components/ui/sheet";
import { GlobalReportSheetContent } from "@/features/global-report/components/global-report-sheet-content";
import { CustomAreaSheetContent } from "@/features/upload-area/components/custom-area-sheet-content";
import { useDashboardSheets } from "../contexts/sheets";

interface DashboardSheetsProps {
  onGlobalReportClose?: () => void;
}

export function DashboardSheets({
  onGlobalReportClose,
}: DashboardSheetsProps) {
  const { isOpen, active, close } = useDashboardSheets();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (active === "global-report") {
        onGlobalReportClose?.();
      }
      close();
    }
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      {active === "global-report" && (
        <GlobalReportSheetContent />
      )}
      {active === "upload-geojson" && (
        <CustomAreaSheetContent />
      )}
    </Sheet>
  );
}
