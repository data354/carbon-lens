"use client";

import { useMapFilters } from "../../map/contexts/map-filters";

export function GlobalReportSheetDescription() {
  const { date } = useMapFilters();

  return (
    <span className="font-medium">
      Données détaillées pour la période {date}
    </span>
  );
}
