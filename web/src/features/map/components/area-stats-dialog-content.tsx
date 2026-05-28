"use client";

import {
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { DialogHeader } from "@/components/ui/dialog";
import { useMapFilters } from "../contexts/map-filters";
import { Separator } from "@/components/ui/separator";
import { AreaStatsEvolutionBarChart } from "./area-stats-evolution-bar-chart";
import { getAreaFeatureQueryOptions } from "../queries/get-area-feature-query-options";
import { useMapSearchParams } from "@/features/search/contexts/search-params";
import { useActiveFeature } from "../contexts/active-feature";
import { CARBON_STOCK_UNIT } from "../constants/carbon";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, isNumber } from "@/lib/utils";
import { MapArea } from "../types/areas";
import { CircleAlert } from "lucide-react";
import { useMemo } from "react";

const REGION_NAME_KEY = "NAME_1";
const DEPARTMENT_NAME_KEY = "NAME_2";
const COMMUNE_NAME_KEY = "NAME_4";
const PROTECTED_AREA_NAME_KEY = "NAME";
const CUSTOM_AREA_NAME_KEY = "NAME";
const CARBON_MEAN_KEY = "carbon_mean";
const CARBON_STD_KEY = "carbon_std";
const AREA_HA_KEY = "area_ha";

export function AreaStatsDialogContent() {
  const { activeFeature } = useActiveFeature();
  const { mapSearchParams } = useMapSearchParams();
  const { area: activeArea } = useMapFilters();
  const { date } = useMapFilters();

  const from = useMemo(() => {
    if (activeFeature) {
      return "click";
    }

    if (mapSearchParams.area && mapSearchParams.name) {
      return "search";
    }

    return null;
  }, [
    activeFeature,
    mapSearchParams.area,
    mapSearchParams.name,
  ]);

  const {
    data: searchFeature,
    status: searchFeatureStatus,
  } = useQuery({
    ...getAreaFeatureQueryOptions(
      mapSearchParams.area,
      date || undefined,
      mapSearchParams.name,
    ),
    enabled:
      !!mapSearchParams.area &&
      !!mapSearchParams.name &&
      !!date &&
      from === "search",
  });

  const feature = useMemo(() => {
    switch (from) {
      case "click":
        return activeFeature;
      case "search":
        return searchFeature?.features?.at(0);
      default:
        return undefined;
    }
  }, [activeFeature, searchFeature, from]);

  const props = useMemo(() => {
    if (!feature) return {};
    return feature.properties;
  }, [feature]);

  const areaName: string = useMemo(() => {
    if (!props) return "N/D";

    if (from === "search") {
      return mapSearchParams.name || "N/D";
    }

    switch (activeArea as MapArea) {
      case "regions":
        return props[REGION_NAME_KEY];
      case "departments":
        return props[DEPARTMENT_NAME_KEY];
      case "communes":
        return props[COMMUNE_NAME_KEY];
      case "protected_areas":
        return props[PROTECTED_AREA_NAME_KEY];
      case "custom":
        return props[CUSTOM_AREA_NAME_KEY];
      default:
        return "N/D";
    }
  }, [props, from, mapSearchParams.name, activeArea]);

  return (
    <DialogContent
      className={cn(
        "w-full max-w-[320px]! gap-0 rounded-2xl p-0 [&>button:last-child]:text-white",
        { "rounded-xl": activeArea === "custom" },
      )}
      showCloseButton={false}
    >
      {activeArea !== "custom" && (
        <div className="p-2">
          <div className="h-[182px] w-full rounded-lg border">
            <AreaStatsEvolutionBarChart
              areaType={mapSearchParams.area}
              areaName={areaName}
            />
          </div>
        </div>
      )}

      <div className="space-y-3 px-5 py-3">
        <DialogHeader>
          <DialogTitle className="line-clamp-3 leading-snug">
            {areaName}
          </DialogTitle>
          <DialogDescription className="sr-only">
            Description et données sur {areaName}
          </DialogDescription>
        </DialogHeader>

        <div>
          {/* AREA */}
          <div className="flex items-center justify-between py-3">
            <span className="text-muted-foreground">
              Superficie
            </span>
            {from === "search" ? (
              searchFeatureStatus === "error" ? (
                <CircleAlert
                  size={18}
                  className="text-destructive"
                />
              ) : searchFeatureStatus === "pending" ? (
                <Skeleton className="bg-primary/30 h-4 w-24 rounded-xl" />
              ) : (
                <span className="text-primary font-semibold">
                  {isNumber(props?.[AREA_HA_KEY])
                    ? `${props[AREA_HA_KEY]?.toFixed(2)} ha`
                    : "N/D"}
                </span>
              )
            ) : (
              <span className="text-primary font-semibold">
                {isNumber(props?.[AREA_HA_KEY])
                  ? `${props[AREA_HA_KEY]?.toFixed(2)} ha`
                  : "N/D"}
              </span>
            )}
          </div>

          <Separator />

          {/* AVERAGE CARBON STORED */}
          <div className="flex items-center justify-between py-3">
            <span className="text-muted-foreground">
              Moyenne
            </span>
            {from === "search" ? (
              searchFeatureStatus === "error" ? (
                <CircleAlert
                  size={18}
                  className="text-destructive"
                />
              ) : searchFeatureStatus === "pending" ? (
                <Skeleton className="bg-primary/30 h-4 w-24 rounded-xl" />
              ) : (
                <span className="text-primary font-semibold">
                  {isNumber(props?.carbon_mean)
                    ? `${props[CARBON_MEAN_KEY]?.toFixed(2)} ${CARBON_STOCK_UNIT}`
                    : "N/D"}
                </span>
              )
            ) : (
              <span className="text-primary font-semibold">
                {isNumber(props?.carbon_mean)
                  ? `${props[CARBON_MEAN_KEY]?.toFixed(2)} ${CARBON_STOCK_UNIT}`
                  : "N/D"}
              </span>
            )}
          </div>

          <Separator />

          {/* STANDARD DEVIATION */}
          <div className="flex items-center justify-between py-3">
            <span className="text-muted-foreground">
              Écart-type
            </span>
            {from === "search" ? (
              searchFeatureStatus === "error" ? (
                <CircleAlert
                  size={18}
                  className="text-destructive"
                />
              ) : searchFeatureStatus === "pending" ? (
                <Skeleton className="bg-primary/30 h-4 w-24 rounded-xl" />
              ) : (
                <span className="text-primary font-semibold">
                  {isNumber(props?.carbon_std)
                    ? `${props[CARBON_STD_KEY]?.toFixed(2)} ${CARBON_STOCK_UNIT}`
                    : "N/D"}
                </span>
              )
            ) : (
              <span className="text-primary font-semibold">
                {isNumber(props?.carbon_std)
                  ? `${props[CARBON_STD_KEY]?.toFixed(2)} ${CARBON_STOCK_UNIT}`
                  : "N/D"}
              </span>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  );
}
