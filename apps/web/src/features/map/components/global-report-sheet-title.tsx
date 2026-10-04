"use client";

import { useMapFilters } from "../contexts/map-filters";

export function GlobalReportSheetTitle() {
  const { date } = useMapFilters();

  return <span>Rapport global {date}</span>;
}
