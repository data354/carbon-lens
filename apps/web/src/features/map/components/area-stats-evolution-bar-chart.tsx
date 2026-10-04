"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import { getCarbonEvolutionStatsQueryOptions } from "@/features/annual-stats/query/get-region-carbon-evolution-query-options";
import { useMapFilters } from "../contexts/map-filters";
import { MapArea } from "../types/areas";
import { Spinner } from "@/components/ui/spinner";

const chartConfig = {
  value: {
    label: "tC/ha",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig;

export function AreaStatsEvolutionBarChart({
  areaType,
  areaName,
}: {
  areaType?: MapArea;
  areaName: string;
}) {
  const { area: type, date } = useMapFilters();
  const { data: stats, status } = useQuery(
    getCarbonEvolutionStatsQueryOptions(
      (areaType as MapArea) || type!,
      areaName,
      date,
    ),
  );

  const transformedData = Object.entries(stats || {})
    .sort(([leftDate], [rightDate]) =>
      String(leftDate).localeCompare(
        String(rightDate),
        undefined,
        {
          numeric: true,
        },
      ),
    )
    .map(([date, value]) => ({
      year: date,
      value,
    }));

  if (status === "error") {
    return null; // TODO: handle error
  }

  return (
    <div className="flex h-full w-full items-center justify-center">
      {status === "pending" ? (
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <Spinner className="size-4" />
          <span>Chargement...</span>
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className="w-full"
        >
          <BarChart
            accessibilityLayer
            data={transformedData}
            barSize={32}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
              fontWeight="500"
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={6}
            />
          </BarChart>
        </ChartContainer>
      )}
    </div>
  );
}
