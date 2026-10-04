import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapFilters } from "./map-filters";
import { GlobalReportSheetButton } from "../../global-report/components/global-report-sheet-button";
import { IMapFilters } from "../types/filters";
import { ZoomControl } from "./zoom-control";
import { CarbonStockClassesCard } from "./carbon-stock-classes-card";
import { AreaSearchButton } from "@/features/search/components/area-search-button";
import { Suspense } from "react";

export function MapControls({
  searchParams,
  enableCustomAreas,
}: {
  searchParams: IMapFilters;
  enableCustomAreas: boolean;
}) {
  const { date } = searchParams;

  return (
    <>
      <Suspense
        key={date}
        fallback={
          <Button
            variant="outline"
            className="absolute top-7 left-7"
            disabled
          >
            <Loader2 className="animate-spin" />
            Rapport global
          </Button>
        }
      >
        <div className="absolute top-7 left-7">
          <GlobalReportSheetButton />
        </div>
      </Suspense>

      <div className="absolute top-7 right-7">
        <MapFilters enableCustomAreas={enableCustomAreas} />
      </div>

      <div className="absolute bottom-7 left-7">
        <ZoomControl />
      </div>

      <div className="absolute bottom-7 left-1/2 -translate-x-1/2">
        <AreaSearchButton />
      </div>

      <div className="absolute right-7 bottom-7">
        <CarbonStockClassesCard />
      </div>
    </>
  );
}
