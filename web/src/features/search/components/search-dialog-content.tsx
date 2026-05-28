"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CommuneTabsContent,
  DepartmentsTabsContent,
  RegionTabsContent,
  ProtectedAreasTabsContent,
  TabsContentLoader,
  TabsContentError,
} from "./tabs-contents";
import { SearchIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mapAreas } from "@/features/map/constants/areas";
import { searchAreasQueryOptions } from "../queries/search-areas-query-options";
import { useDashboardDialogs } from "@/features/dashboard/contexts/dialogs";
import { MapArea } from "@/features/map/types/areas";
import { useMapSearchParams } from "../contexts/search-params";
import { Skeleton } from "@/components/ui/skeleton";
import { useMap } from "@/features/map/contexts/map";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { useId, useMemo, useState } from "react";
import { SearchResultList } from "./search-result-list";
import { useDebounce } from "use-debounce";

const DEBOUNCE_DELAY = 500;

export function SearchDialogContent() {
  const [search, setSearch] = useState("");
  const { open: openDialog } = useDashboardDialogs();
  const { setMapSearchParams } = useMapSearchParams();
  const tabId = useId();
  const map = useMap();

  const [debouncedSearch] = useDebounce(
    search.trim().toLowerCase(),
    DEBOUNCE_DELAY,
  );

  const {
    status: searchStatus,
    isFetching: isSearching,
    data: searchResults,
    refetch: refetchSearch,
  } = useQuery(searchAreasQueryOptions(debouncedSearch));

  const firstNonEmptyResult = useMemo(() => {
    return Object.entries(searchResults || {}).find(
      ([, val]) => val.length > 0,
    );
  }, [searchResults]);

  const hasResults = useMemo(() => {
    return Object.values(searchResults || {}).some(
      (r) => r.length > 0,
    );
  }, [searchResults, searchStatus]);

  const handleSearchResultItemClick = (
    areaType: MapArea,
    areaName: string,
  ) => {
    setMapSearchParams({ area: areaType, name: areaName });
    openDialog("stats");
    setSearch("");
  };

  return (
    <DialogContent
      showCloseButton={false}
      className="gap-0 overflow-hidden rounded-2xl p-0"
    >
      <DialogHeader>
        <DialogTitle className="border-b text-base">
          <div className="flex items-center gap-2 px-4 py-3">
            <label htmlFor="area-search">
              {isSearching ? (
                <Spinner
                  className="animate-spin-fast size-4.5 text-zinc-500"
                  icon="loader2"
                />
              ) : (
                <SearchIcon
                  size={18}
                  className="text-zinc-500"
                />
              )}
            </label>
            <input
              id="area-search"
              autoFocus={true}
              autoComplete="off"
              autoCapitalize="off"
              className="w-full border-0 bg-transparent font-normal focus:ring-0 focus:outline-none"
              placeholder="Rechercher une zone"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
            />
            {!!search && (
              <Button
                size="icon"
                variant="ghost"
                className="size-6"
                aria-label="Effacer la recherche"
                onClick={() => setSearch("")}
                pill
              >
                <X
                  size={18}
                  className="text-zinc-500"
                />
              </Button>
            )}
          </div>
        </DialogTitle>
        <DialogDescription className="sr-only">
          Recherchez une zone en saisissant son nom ou en
          cliquant sur la carte.
        </DialogDescription>
      </DialogHeader>
      <div className="text-sm">
        {isSearching ? (
          <div>
            <div className="flex gap-2 border-b px-4 py-3">
              {[...Array(4)].map((_, idx) => (
                <Skeleton
                  key={idx}
                  className="h-9 w-full rounded-md"
                />
              ))}
            </div>
            <div className="h-[400px] w-full">
              <TabsContentLoader spinFast />
            </div>
          </div>
        ) : searchStatus === "success" ? (
          <Tabs
            key={debouncedSearch}
            id={`${tabId}-search-tabs`}
            className="gap-0"
            defaultValue={
              firstNonEmptyResult?.[0] ||
              mapAreas.regions.value
            }
          >
            {!hasResults ? (
              <div className="flex h-[400px] flex-col items-center justify-center gap-2">
                <SearchIcon
                  size={32}
                  className="text-zinc-400"
                />
                <p className="text-center text-sm text-zinc-500">
                  Aucune zone trouvée.
                </p>
              </div>
            ) : (
              <>
                <div className="border-b px-4 py-3">
                  <TabsList>
                    {Object.entries(
                      searchResults || {},
                    ).map(([key, list]) => {
                      const area = Object.values(
                        mapAreas,
                      ).find((area) => area.value === key);

                      if (!area) return null;

                      if (list.length === 0) return null;

                      return (
                        <TabsTrigger
                          key={key}
                          value={area.value}
                        >
                          <span>{area.label}</span>
                          <span className="text-sm text-zinc-500">
                            {list.length > 99
                              ? "99+"
                              : list.length}
                          </span>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </div>
                <div className="h-[400px] overflow-y-auto">
                  {Object.entries(searchResults || {}).map(
                    ([key, list]) => {
                      const area = Object.values(
                        mapAreas,
                      ).find((area) => area.value === key);

                      if (!area) return null;

                      return (
                        <TabsContent
                          key={key}
                          value={area.value}
                          className="h-full"
                        >
                          <SearchResultList
                            data={list}
                            onItemClick={(areaName) => {
                              handleSearchResultItemClick(
                                area.value,
                                areaName,
                              );
                            }}
                          />
                        </TabsContent>
                      );
                    },
                  )}
                </div>
              </>
            )}
          </Tabs>
        ) : searchStatus === "error" ? (
          <div className="h-[400px] w-full">
            <TabsContentError onRetry={refetchSearch} />
          </div>
        ) : (
          <Tabs
            id={`${tabId}-default-tabs`}
            defaultValue={mapAreas.regions.value}
            className="gap-0"
          >
            <div className="border-b px-4 py-3">
              <TabsList>
                <TabsTrigger value={mapAreas.regions.value}>
                  {mapAreas.regions.label}
                </TabsTrigger>
                <TabsTrigger
                  value={mapAreas.departments.value}
                >
                  {mapAreas.departments.label}
                </TabsTrigger>
                <TabsTrigger
                  value={mapAreas.communes.value}
                >
                  {mapAreas.communes.label}
                </TabsTrigger>
                <TabsTrigger
                  value={mapAreas.protectedAreas.value}
                >
                  {mapAreas.protectedAreas.label}
                </TabsTrigger>
              </TabsList>
            </div>
            <div className="h-[400px] overflow-y-auto">
              <TabsContent
                value={mapAreas.regions.value}
                className="h-full"
              >
                <RegionTabsContent />
              </TabsContent>
              <TabsContent
                value={mapAreas.departments.value}
                className="h-full"
              >
                <DepartmentsTabsContent />
              </TabsContent>
              <TabsContent
                value={mapAreas.communes.value}
                className="h-full"
              >
                <CommuneTabsContent />
              </TabsContent>
              <TabsContent
                value={mapAreas.protectedAreas.value}
                className="h-full"
              >
                <ProtectedAreasTabsContent />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </div>
    </DialogContent>
  );
}
