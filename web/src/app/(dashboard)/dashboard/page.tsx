import {
  getAllUserCustomAreas,
  getCustomAreaFeatureCollectionByDate as getCustomAreaFCByDate,
} from "@/features/upload-area/queries/server/get-custom-area";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { MapProvider } from "@/features/map/contexts/map";
import { CarbonMap } from "@/features/map/components/carbon-map";
import { ZoomProvider } from "@/features/map/contexts/zoom";
import { MapControls } from "@/features/map/components/map-controls";
import { AreaFetchingStateProvider } from "@/features/map/contexts/area-fetching-state";
import { loadMapSearchParams } from "@/features/map/lib/search-params";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { RequireAuth } from "@/features/auth/components/server/require-auth";
import { MapFiltersProvider } from "@/features/map/contexts/map-filters";
import { HeaderHeightProvider } from "@/features/dashboard/contexts/header-height";
import { MapSearchParamsProvider } from "@/features/search/contexts/search-params";
import { ActiveFeatureProvider } from "@/features/map/contexts/active-feature";
import { MapErrorFallback } from "@/features/map/components/map-error-fallback";
import { DashboardDialogsProvider } from "@/features/dashboard/contexts/dialogs";
import { SettingsSectionsProvider } from "@/features/settings/contexts/settings-sections";
import { DashboardSheetsProvider } from "@/features/dashboard/contexts/sheets";
import { SelectedAreaForDeletionProvider } from "@/features/upload-area/contexts/selected-area-deletion";
import { hasUserCustomArea } from "@/features/upload-area/queries/server/has-user-custom-area";
import { getWatercoursesTile } from "@/features/map/api/watercourses";
import { MapAreaSchema } from "@/features/map/schemas/areas";
import { getAreaFeatures } from "@/features/map/api/areas";
import { getTileJson } from "@/features/map/api/tile-json";
import { ErrorBoundary } from "@/components/error-boundary";
import { MapArea } from "@/features/map/types/areas";
import { getDates } from "@/features/map/api/filters";
import { Spinner } from "@/components/ui/spinner";
import { Suspense } from "react";

async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const res = await auth.api.getSession({
    headers: await headers(),
  });

  if (!res) {
    redirect("/auth/login");
  }

  if (!res.user.nameSet) {
    redirect("/set-name");
  }

  if (res.user.firstLogin) {
    redirect("/update-password");
  }

  const sp = await loadMapSearchParams(searchParams);
  const areaParseResult = MapAreaSchema.safeParse(sp.area);
  let date = sp.date ?? (await getDates()).dates.at(-1);

  if (!date) notFound();

  if (!areaParseResult.success) {
    redirect("/dashboard?date=" + date);
  }

  const tileJson = getTileJson(date);
  const watercoursesPromise = getWatercoursesTile();
  const customAreasPromise = getAllUserCustomAreas();
  const activeArea = areaParseResult.data as MapArea;
  const hasCustomArea = await hasUserCustomArea(date);

  if (activeArea === "custom" && !hasCustomArea) {
    redirect("/dashboard?date=" + date);
  }

  const featuresPromise =
    activeArea === "custom"
      ? getCustomAreaFCByDate(date)
      : getAreaFeatures(activeArea, date);

  return (
    <RequireAuth>
      <MapProvider>
        <MapFiltersProvider
          initialArea={areaParseResult.data as MapArea}
          initialDate={date}
        >
          <MapSearchParamsProvider>
            <ActiveFeatureProvider>
              <ZoomProvider>
                <HeaderHeightProvider>
                  <AreaFetchingStateProvider>
                    <DashboardDialogsProvider>
                      <DashboardSheetsProvider>
                        <SettingsSectionsProvider>
                          <SelectedAreaForDeletionProvider>
                            <DashboardHeader />
                            <main>
                              <ErrorBoundary
                                fallback={
                                  <MapErrorFallback />
                                }
                              >
                                <Suspense
                                  // key={`map-${sp.area}-${sp.date}`}
                                  fallback={
                                    <div className="fixed top-0 left-0 grid h-dvh w-full place-content-center bg-black/20">
                                      <div className="rounded-xl bg-black/5 p-3">
                                        <Spinner
                                          className="size-6"
                                          strokeWidth={3}
                                        />
                                      </div>
                                    </div>
                                  }
                                >
                                  <CarbonMap
                                    tileJsonPromise={
                                      tileJson
                                    }
                                    watercoursesPromise={
                                      watercoursesPromise
                                    }
                                    featureCollectionPromise={
                                      featuresPromise
                                    }
                                    customAreasPromise={
                                      customAreasPromise
                                    }
                                  >
                                    <Suspense
                                      fallback={null}
                                    >
                                      <MapControls
                                        enableCustomAreas={
                                          hasCustomArea
                                        }
                                        searchParams={{
                                          date,
                                          area: areaParseResult.data as MapArea,
                                        }}
                                      />
                                    </Suspense>
                                  </CarbonMap>
                                </Suspense>
                              </ErrorBoundary>
                            </main>
                          </SelectedAreaForDeletionProvider>
                        </SettingsSectionsProvider>
                      </DashboardSheetsProvider>
                    </DashboardDialogsProvider>
                  </AreaFetchingStateProvider>
                </HeaderHeightProvider>
              </ZoomProvider>
            </ActiveFeatureProvider>
          </MapSearchParamsProvider>
        </MapFiltersProvider>
      </MapProvider>
    </RequireAuth>
  );
}

export default DashboardPage;
