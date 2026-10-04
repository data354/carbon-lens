"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeftRight,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getGlobalReportStatsQueryOptions } from "../queries/stats";
import { useMapFilters } from "@/features/map/contexts/map-filters";
import { CARBON_CLASSES } from "@/features/map/constants/carbon-classes";
import { CarbonClassKey } from "@/features/map/types/carbon-classes";
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

  const biomassEvolution = useMemo(() => {
    if (!stats?.previous) return null;

    const diff =
      stats.current.biomassMean -
      stats.previous.biomassMean;

    return {
      status: (diff > 0
        ? "up"
        : diff < 0
          ? "down"
          : "stable") as EvolutionStatus,
      percentage:
        stats.previous.biomassMean === 0
          ? 0
          : Math.abs(diff / stats.previous.biomassMean) *
            100,
    };
  }, [stats]);

  const tco2eEvolution = useMemo(() => {
    if (!stats?.previous) return null;

    const diff =
      stats.current.tco2eMean - stats.previous.tco2eMean;

    return {
      status: (diff > 0
        ? "up"
        : diff < 0
          ? "down"
          : "stable") as EvolutionStatus,
      percentage:
        stats.previous.tco2eMean === 0
          ? 0
          : Math.abs(diff / stats.previous.tco2eMean) * 100,
    };
  }, [stats]);

  const totalValues = useMemo(() => {
    if (!stats) {
      return {
        ha: 0,
        squareKm: 0,
        pct: 0,
      };
    }

    return {
      ha: Object.values(
        stats.current.carbonClasses || {},
      ).reduce((sum, cls) => sum + cls.ha, 0),
      squareKm: Object.values(
        stats.current.carbonClasses || {},
      ).reduce((sum, cls) => sum + cls.squareKm, 0),
      pct: 100,
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
    if (!areaEvolution || !stats?.previous) return null;

    switch (areaEvolution.status) {
      case "up":
        return (
          <div className="text-primary flex items-center gap-1">
            <ArrowUp size={20} />
            <p className="font-semibold">
              {Math.round(areaEvolution.percentage)}% par
              rapport à {stats.previous.date}
            </p>
          </div>
        );
      case "down":
        return (
          <div className="text-destructive flex items-center gap-1">
            <ArrowDown size={20} />
            <p className="font-semibold">
              {Math.round(areaEvolution.percentage)}% par
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

  const renderBiomassEvolution = () => {
    if (!biomassEvolution || !stats?.previous) return null;

    switch (biomassEvolution.status) {
      case "up":
        return (
          <div className="text-primary flex items-center gap-1">
            <ArrowUp size={20} />
            <p className="font-semibold">
              {Math.round(biomassEvolution.percentage)}% par
              rapport à {stats.previous.date}
            </p>
          </div>
        );
      case "down":
        return (
          <div className="text-destructive flex items-center gap-1">
            <ArrowDown size={20} />
            <p className="font-semibold">
              {Math.round(biomassEvolution.percentage)}% par
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

  const renderTco2eEvolution = () => {
    if (!tco2eEvolution) return null;

    switch (tco2eEvolution.status) {
      case "up":
        return (
          <div className="text-primary flex items-center gap-1">
            <ArrowUp size={20} />
            <p className="font-semibold">
              {Math.round(tco2eEvolution.percentage)}% par
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
              {Math.round(tco2eEvolution.percentage)}% par
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
      {/* CARBON STOCK */}
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

      {/* AREA LAND */}
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

      {/* BIOMASS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-muted-foreground text-xl font-medium">
            Biomasse
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
                {stats.current.biomassMean} t/ha
              </p>
              {renderBiomassEvolution()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* TCO2E */}
      <Card>
        <CardHeader>
          <CardTitle className="text-muted-foreground text-xl font-medium">
            CO₂ équivalent
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
                {stats.current.tco2eMean} tCO₂/ha
              </p>
              {renderTco2eEvolution()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CARBON CLASSES */}
      <Card className="col-span-2 gap-6">
        <CardHeader>
          <CardTitle className="text-xl font-medium">
            Occupation du sol par classe de végétation
          </CardTitle>
          <CardDescription className="flex items-center gap-1">
            Données pour la période :{" "}
            {status === "pending" ? (
              <Skeleton className="h-4 w-15 rounded" />
            ) : (
              stats.current.date
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">
                  Classe
                </TableHead>
                <TableHead>Libellé</TableHead>
                <TableHead>Superficie (ha)</TableHead>
                <TableHead>Superficie (km²)</TableHead>
                <TableHead className="text-right">
                  %
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(CARBON_CLASSES).map(
                ([key, { name, meaning }]) => (
                  <TableRow key={key}>
                    <TableCell className="font-medium">
                      {name}
                    </TableCell>
                    <TableCell>{meaning}</TableCell>
                    <TableCell>
                      {status === "pending" ? (
                        <Skeleton className="h-4 w-20 rounded-full" />
                      ) : stats ? (
                        stats.current.carbonClasses[
                          key as CarbonClassKey
                        ].ha.toFixed(1)
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      {status === "pending" ? (
                        <Skeleton className="h-4 w-20 rounded-full" />
                      ) : stats ? (
                        stats.current.carbonClasses[
                          key as CarbonClassKey
                        ].squareKm.toFixed(1)
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {status === "pending" ? (
                        <Skeleton className="inline-block h-4 w-10 rounded-full" />
                      ) : stats ? (
                        `${stats.current.carbonClasses[
                          key as CarbonClassKey
                        ].pct.toFixed(2)}%`
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                  </TableRow>
                ),
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-primary font-semibold"
                >
                  TOTAL
                </TableCell>
                <TableCell className="text-primary font-semibold">
                  {status === "pending" ? (
                    <Skeleton className="bg-primary/20 h-4 w-20 rounded-full" />
                  ) : (
                    totalValues.ha.toFixed(1)
                  )}
                </TableCell>
                <TableCell className="text-primary font-semibold">
                  {status === "pending" ? (
                    <Skeleton className="bg-primary/20 h-4 w-20 rounded-full" />
                  ) : (
                    totalValues.squareKm.toFixed(1)
                  )}
                </TableCell>
                <TableCell className="text-primary text-right font-semibold">
                  {status === "pending" ? (
                    <Skeleton className="bg-primary/20 inline-block h-4 w-10 rounded-full" />
                  ) : (
                    `${totalValues.pct.toFixed(2)}%`
                  )}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
