"use client";

import { useQuery } from "@tanstack/react-query";
import { getRegionsQueryOptions } from "../../queries/get-regions-query-options";
import { useDashboardDialogs } from "@/features/dashboard/contexts/dialogs";
import { useMapSearchParams } from "../../contexts/search-params";
import { useMapFilters } from "@/features/map/contexts/map-filters";
import { SearchResultList } from "../search-result-list";
import { TabsContentError, TabsContentLoader } from "./";

export function RegionTabsContent() {
  const { open: openDialog } = useDashboardDialogs();
  const { setMapSearchParams } = useMapSearchParams();
  const { date } = useMapFilters();

  const {
    data: regions,
    status,
    refetch,
  } = useQuery(getRegionsQueryOptions(date ?? ""));

  const handleRegionClick = (region: string) => {
    setMapSearchParams({ area: "regions", name: region });
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
      data={regions}
      onItemClick={handleRegionClick}
    />
  );
}
