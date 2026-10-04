"use client";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { StatsCardsGroup } from "./stats-cards-group";
import { CarbonEvolutionCard } from "./carbon-evolution-card";
import { GlobalReportSheetDescription } from "./global-report-sheet-description";
import { AverageCarbonStockCard } from "./average-carbon-stock-card";

export function GlobalReportSheetContent() {
  return (
    <SheetContent
      side="right"
      className="w-full gap-0 overflow-y-auto sm:max-w-200"
    >
      <SheetHeader className="border-b border-[#F0F0F0] px-10">
        <SheetTitle className="text-2xl font-semibold">
          Rapport global
        </SheetTitle>
        <SheetDescription>
          <GlobalReportSheetDescription />
        </SheetDescription>
      </SheetHeader>

      <div className="overflow-y-auto">
        <div className="grid grid-cols-2 gap-4 p-10">
          <StatsCardsGroup />
          <CarbonEvolutionCard />
          <AverageCarbonStockCard />
        </div>
      </div>
    </SheetContent>
  );
}
