"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useMapFilters } from "@/features/map/contexts/map-filters";
import { MapArea } from "@/features/map/types/areas";
import { useAreaFetchingState } from "@/features/map/contexts/area-fetching-state";
import { getCSVDownloadUrl } from "../api/export";
import { saveAs } from "file-saver";
import { toast } from "sonner";

export function CSVExportButton() {
  const { area, date } = useMapFilters();
  const [loading, setLoading] = useState(false);
  const { state } = useAreaFetchingState();

  const disabled =
    loading ||
    area === "custom" ||
    Object.values(state).some((s) => s === "pending");

  const handleExport = async () => {
    if (area === "custom") {
      return;
    }

    try {
      setLoading(true);

      const { filename, blob } = await getCSVDownloadUrl(
        area as MapArea,
        date,
      );

      saveAs(blob, filename);
    } catch (err) {
      console.error("Error exporting CSV:", err);
      toast.error("Erreur lors de l'exportation du CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      disabled={disabled}
      onClick={handleExport}
    >
      {loading ? (
        <>
          <Spinner />
          Export...
        </>
      ) : (
        "Exporter"
      )}
    </Button>
  );
}
