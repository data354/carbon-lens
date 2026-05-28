"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getGlobalReportStatsQueryOptions } from "../queries/stats";
import { useMapFilters } from "@/features/map/contexts/map-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";

type EvolutionStatus = "up" | "down" | "stable";

export function StatsCardsGroup() {
  const { date } = useMapFilters();
  const { data: stats, status } = useQuery(
    getGlobalReportStatsQueryOptions(date || ""),
  );

  const carbonEvolution = useMemo(() => {
    if (!stats?.previous) return null;

    const diff =
      stats.current.carbonMean - stats.previous.carbonMean;

    return {
      status: (diff > 0
        ? "up"
        : diff < 0
          ? "down"
          : "stable") as EvolutionStatus,
      percentage:
        stats.previous.carbonMean === 0
          ? 0
          : Math.abs(diff / stats.previous.carbonMean) *
            100,
    };
  }, [stats]);

  const areaEvolution = useMemo(() => {
    if (!stats?.previous) return null;

    const diff =
      stats.current.landArea - stats.previous.landArea;

    return {
      status: (diff > 0
        ? "up"
        : diff < 0
          ? "down"
          : "stable") as EvolutionStatus,
      percentage:
        stats.previous.landArea === 0
          ? 0
          : Math.abs(diff / stats.previous.landArea) * 100,
    };
  }, [stats]);

  if (!date) return null;

  if (status === "error") {
    return null; // TODO: handle error
  }

  const renderCarbonEvolution = () => {
    if (!carbonEvolution || !stats?.previous) return null;

    switch (carbonEvolution.status) {
      case "up":
        return (
          <div className="text-primary flex items-center gap-1">
            <ArrowUp size={20} />
            <p className="font-semibold">
              {Math.round(carbonEvolution.percentage)}% par
              rapport à {stats.previous.date}
            </p>
          </div>
        );
      case "down":
        return (
          <div className="text-destructive flex items-center gap-1">
            <ArrowDown size={20} />
            <p className="font-semibold">
              {Math.round(carbonEvolution.percentage)}% par
              rapport à {stats.previous.date}
            </p>
          </div>
        );
      case "stable":
        return (
          <div className="text-muted-foreground flex items-center gap-1">
            <ArrowLeftRight size={20} />
            <p className="font-semibold">
              Stable par rapport à {stats.previous.date}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  const renderAreaEvolution = () => {
    if (!areaEvolution) return null;

    switch (areaEvolution.status) {
      case "up":
        return (
          <div className="text-primary flex items-center gap-1">
            <ArrowUp size={20} />
            <p className="font-semibold">
              {Math.round(areaEvolution.percentage)}% par
              rapport à{" "}
              {stats?.previous?.date ||
                "la période précédente"}
            </p>
          </div>
        );
      case "down":
        return (
          <div className="text-destructive flex items-center gap-1">
            <ArrowDown size={20} />
            <p className="font-semibold">
              {Math.round(areaEvolution.percentage)}% par
              rapport à{" "}
              {stats?.previous?.date ||
                "la période précédente"}
            </p>
          </div>
        );
      case "stable":
        return (
          <div className="text-muted-foreground flex items-center gap-1">
            <ArrowLeftRight size={20} />
            <p className="font-semibold">
              Stable par rapport à{" "}
              {stats?.previous?.date ||
                "la période précédente"}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="text-muted-foreground text-xl font-medium">
            Stock de carbone
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === "pending" ? (
            <div className="space-y-6">
              <Skeleton className="h-9 w-1/2 rounded-full" />
              <Skeleton className="h-6 w-full rounded-full" />
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-3xl font-semibold">
                {stats.current.carbonMean} tC/ha
              </p>
              {renderCarbonEvolution()}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-muted-foreground text-xl font-medium">
            Superficie terrière
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status === "pending" ? (
            <div className="space-y-6">
              <Skeleton className="h-9 w-1/2 rounded-full" />
              <Skeleton className="h-6 w-full rounded-full" />
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-3xl font-semibold">
                {stats.current.landArea} ha
              </p>
              {renderAreaEvolution()}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
