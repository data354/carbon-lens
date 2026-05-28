"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CarbonStockInfoCard } from "./carbon-stock-info-card";
import { CARBON_STOCK_UNIT } from "../constants/carbon";
import { CarbonClass } from "../types/carbon-classes";
import { getCarbonClassesQueryOptions } from "../queries/get-carbon-classes-query-options";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function CarbonStockClassesCard() {
  const { data: carbonClasses, status } = useQuery(
    getCarbonClassesQueryOptions(),
  );
  const [activeClass, setActiveClass] =
    useState<CarbonClass>();

  const toggleActiveClass = (carbonClass: CarbonClass) => {
    setActiveClass((prev) => {
      if (!prev || prev.order !== carbonClass.order) {
        return carbonClass;
      }

      return undefined;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeClass) {
        setActiveClass(undefined);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeClass]);

  useEffect(() => {
    if (status === "error") {
      toast.error(
        "Erreur lors du chargement de la légende",
      );
    }
  }, [status]);

  if (status === "error") {
    return null;
  }

  return (
    <div className="flex items-end gap-x-3">
      {activeClass && (
        <>
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setActiveClass(undefined)}
          />
          <div className="animate-in slide-in-from-right-4 relative basis-[346px] duration-300">
            <CarbonStockInfoCard
              carbonClass={activeClass}
              classCount={carbonClasses?.length ?? 1}
            />
          </div>
        </>
      )}
      <Card className="relative gap-4">
        <CardHeader className="min-w-64 gap-0">
          <CardTitle>
            Stock de Carbone ({CARBON_STOCK_UNIT})
          </CardTitle>
        </CardHeader>
        <CardContent className="animate-in">
          <div className="flex flex-col">
            {status === "pending"
              ? [...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="group flex items-center gap-2.5 p-[5px]"
                  >
                    <Skeleton className="size-[18px] shrink-0 rounded" />
                    <div className="flex h-6 flex-1 items-center">
                      <Skeleton className="h-4.5 w-full rounded" />
                    </div>
                  </div>
                ))
              : carbonClasses
                  ?.slice()
                  .sort((a, b) => b.order - a.order)
                  .map((carbonClass) => (
                    <div
                      key={carbonClass.order}
                      className="group flex cursor-pointer items-center gap-2.5 p-[5px]"
                      onClick={() => {
                        toggleActiveClass(carbonClass);
                      }}
                    >
                      <div
                        className="size-[18px] shrink-0 rounded"
                        style={{
                          backgroundColor:
                            carbonClass.color,
                        }}
                      />
                      <span className="inline-block flex-1 font-medium">
                        {carbonClass.name}{" "}
                        {isFinite(carbonClass.max)
                          ? `= ${carbonClass.min} - ${carbonClass.max}`
                          : `≥ ${carbonClass.min}`}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className={cn(
                          "invisible size-5 cursor-pointer duration-0 group-hover:visible",
                          {
                            visible:
                              activeClass?.order ===
                              carbonClass.order,
                          },
                        )}
                        pill={true}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleActiveClass(carbonClass);
                        }}
                      >
                        <Info
                          size={16}
                          className="text-muted-foreground"
                        />
                      </Button>
                    </div>
                  ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
