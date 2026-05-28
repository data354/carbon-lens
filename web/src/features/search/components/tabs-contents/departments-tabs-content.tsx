"use client";

import { useQuery } from "@tanstack/react-query";
import { getDepartmentsQueryOptions } from "../../queries/get-departments";
import { useDashboardDialogs } from "@/features/dashboard/contexts/dialogs";
import { useMapSearchParams } from "../../contexts/search-params";
import { useMapFilters } from "@/features/map/contexts/map-filters";
import { SearchResultList } from "../search-result-list";
import { TabsContentError, TabsContentLoader } from "./";

export function DepartmentsTabsContent() {
  const { open: openDialog } = useDashboardDialogs();
  const { setMapSearchParams } = useMapSearchParams();
  const { date } = useMapFilters();

  const {
    data: departments,
    status,
    refetch,
  } = useQuery(getDepartmentsQueryOptions(date ?? ""));

  const handleDepartmentClick = (name: string) => {
    setMapSearchParams({ area: "departments", name });
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
      data={departments}
      onItemClick={handleDepartmentClick}
    />
  );
}
