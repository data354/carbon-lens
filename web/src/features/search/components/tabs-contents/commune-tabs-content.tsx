"use client";

import { useQuery } from "@tanstack/react-query";
import { getCommunesQueryOptions } from "../../queries/get-communes-query-options";
import { useDashboardDialogs } from "@/features/dashboard/contexts/dialogs";
import { useMapSearchParams } from "../../contexts/search-params";
import { useMapFilters } from "@/features/map/contexts/map-filters";
import { SearchResultList } from "../search-result-list";
import { TabsContentError, TabsContentLoader } from "./";

export function CommuneTabsContent() {
  const { open: openDialog } = useDashboardDialogs();
  const { setMapSearchParams } = useMapSearchParams();
  const { date } = useMapFilters();

  const {
    data: communes,
    status,
    refetch,
  } = useQuery(getCommunesQueryOptions(date ?? ""));

  const handleCommuneClick = (commune: string) => {
    setMapSearchParams({ area: "communes", name: commune });
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
      data={communes}
      onItemClick={handleCommuneClick}
    />
  );
}
