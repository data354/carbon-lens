"use client";

import { Dialog } from "@/components/ui/dialog";
import { AreaStatsDialogContent } from "@/features/map/components/area-stats-dialog-content";
import { SettingsDialogContent } from "@/features/settings/components/settings-dialog-content";
import { DeleteCustomAreaDialogContent } from "@/features/upload-area/components/delete-custom-area-dialog-content";
import { GeoJsonUploadDialogContent } from "@/features/upload-area/components/geojson-upload-dialog-content";
import { SearchDialogContent } from "@/features/search/components/search-dialog-content";
import { useDashboardDialogs } from "../contexts/dialogs";

interface DashboardDialogsProps {
  onSearchClose?: () => void;
  onSettingsClose?: () => void;
  onStatsClose?: () => void;
}

export function DashboardDialogs({
  onSearchClose,
  onSettingsClose,
  onStatsClose,
}: DashboardDialogsProps) {
  const { isOpen, active, close } = useDashboardDialogs();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      if (active === "search") onSearchClose?.();
      if (active === "settings") onSettingsClose?.();
      if (active === "stats") onStatsClose?.();
      close();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      {active === "stats" && <AreaStatsDialogContent />}
      {active === "settings" && <SettingsDialogContent />}
      {active === "search" && <SearchDialogContent />}
      {active === "upload-geojson" && (
        <GeoJsonUploadDialogContent />
      )}
      {active === "delete-custom-area" && (
        <DeleteCustomAreaDialogContent />
      )}
    </Dialog>
  );
}
