"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { CARBON_STOCK_UNIT } from "@/features/map/constants/carbon";
import { getAllRegionsCarbonEvolutionStatsQueryOptions } from "../queries/carbon-evolution-stats";
import { useMapFilters } from "@/features/map/contexts/map-filters";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import { Skeleton } from "@/components/ui/skeleton";

const CHART_MIN_WIDTH = 700;
const BAR_WIDTH_PER_REGION = 120;
const CHART_MAX_HEIGHT = 360;
const BAR_SIZE = 20;
const BAR_GAP = 5;

interface TransformedChartData {
  previousOrNextDate: number;
  currentDate: number;
  region: string;
}

function getAdjacentDate(
  allDates: string[],
  currentDate: string,
): string {
  const currentIndex = allDates.indexOf(currentDate);
  return currentIndex > 0
    ? allDates[currentIndex - 1]
    : allDates[currentIndex + 1];
}

function transformData(
  data: {
    region: string;
    stats: Record<string, number>;
  }[],
  currentDate: string,
  adjacentDate: string,
): TransformedChartData[] {
  return data.map((region) => ({
    region: region.region,
    currentDate: region.stats[currentDate],
    previousOrNextDate: region.stats[adjacentDate],
  }));
}

export function CarbonEvolutionCard() {
  const { date } = useMapFilters();
  const { data, status } = useQuery(
    getAllRegionsCarbonEvolutionStatsQueryOptions(date),
  );

  if (status === "error") {
    return null; // TODO: handle error
  }

  const allDates = Object.keys(
    data?.[0].stats || {},
  ).sort();
  const adjacentDate = getAdjacentDate(allDates, date);
  const chartData = transformData(
    data || [],
    date,
    adjacentDate,
  );

  const chartConfig: ChartConfig = {
    currentDate: {
      label: date,
      color: "var(--chart-1)",
    },
    previousOrNextDate: {
      label: adjacentDate,
      color: "var(--chart-5)",
    },
  };

  const chartMinWidth = Math.max(
    chartData.length * BAR_WIDTH_PER_REGION,
    CHART_MIN_WIDTH,
  );

  return (
    <Card className="col-span-2 gap-11">
      <CardHeader>
        <CardTitle className="text-xl font-medium">
          Évolution du stock de carbone par région (
          {CARBON_STOCK_UNIT})
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          Comparaison par rapport à{" "}
          {status === "pending" ? (
            <Skeleton className="h-4 w-15 rounded" />
          ) : (
            adjacentDate
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="overflow-x-auto pb-4">
        {status === "pending" ? (
          <div className="flex h-[360px] w-full items-center justify-center gap-2">
            <Spinner
              icon="loader2"
              className="animate-spin-fast text-muted-foreground size-4.5"
            />
            <span>Chargement du diagramme...</span>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            style={{
              minWidth: `${chartMinWidth}px`,
              maxHeight: CHART_MAX_HEIGHT,
            }}
          >
            <BarChart
              accessibilityLayer
              data={chartData}
              barGap={BAR_GAP}
              barSize={BAR_SIZE}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="region"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                fontSize={16}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
              />
              <Bar
                dataKey="currentDate"
                fill="var(--color-currentDate)"
                radius={4}
              />
              <Bar
                dataKey="previousOrNextDate"
                fill="var(--color-previousOrNextDate)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
