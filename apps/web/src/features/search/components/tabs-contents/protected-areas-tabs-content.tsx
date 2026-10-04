"use client";

import { useQuery } from "@tanstack/react-query";
import { getProtectedAreasQueryOptions } from "../../queries/get-protected-area-query-options";
import { useDashboardDialogs } from "@/features/dashboard/contexts/dialogs";
import { useMapSearchParams } from "../../contexts/search-params";
import { useMapFilters } from "@/features/map/contexts/map-filters";
import { SearchResultList } from "../search-result-list";
import { TabsContentError, TabsContentLoader } from "./";

export function ProtectedAreasTabsContent() {
  const { open: openDialog } = useDashboardDialogs();
  const { setMapSearchParams } = useMapSearchParams();
  const { date } = useMapFilters();

  const {
    data: protectedAreas,
    status,
    refetch,
  } = useQuery(getProtectedAreasQueryOptions(date ?? ""));

  const handleProtectedAreaClick = (name: string) => {
    setMapSearchParams({ area: "protected_areas", name });
    openDialog("stats");
  };

  if (status === "pending") {
    return <TabsContentLoader />;
  }

  if (status === "error") {
    return (
      <div className="h-full">
        <TabsContentError onRetry={refetch} />
      </div>
    );
  }

  return (
    <SearchResultList
      data={protectedAreas}
      onItemClick={handleProtectedAreaClick}
    />
  );
}
