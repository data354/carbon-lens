"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getDatesQueryOptions } from "../queries/get-dates-filter-query-options";
import { useAreaFetchingState } from "../contexts/area-fetching-state";
import { useMapFilters } from "../contexts/map-filters";
import { ChevronDown, Loader2 } from "lucide-react";
import { useQueryState } from "nuqs";
import { useZoom } from "../contexts/zoom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export function DateFilter() {
  const [queryDate, setQueryDate] = useQueryState("date");
  const { state, setState } = useAreaFetchingState();
  const { data, status } = useQuery(getDatesQueryOptions());
  const { recenter, canRecenter } = useZoom();
  const { date: contextDate, update } = useMapFilters();
  const router = useRouter();

  useEffect(() => {
    if (queryDate && queryDate !== contextDate) {
      update({ date: queryDate });
    }
  }, [queryDate, contextDate, update]);

  useEffect(() => {
    if (status === "error") {
      setState((prev) => ({ ...prev, date: "error" }));
      toast.error("Erreur lors du chargement des dates.");
    }
  }, [status, setState]);

  const handleDateChange = async (newDate: string) => {
    setState((prev) => ({ ...prev, date: "pending" }));

    try {
      await setQueryDate(newDate);
      update({ date: newDate });

      if (canRecenter) {
        recenter();
      }

      router.refresh();
    } catch (err) {
      setState((prev) => ({ ...prev, date: "error" }));
      toast.error("Erreur lors du changement.");
      console.error(err);
    }
  };

  const hasPendingState = Object.values(state).some(
    (s) => s === "pending",
  );

  const currentDate = queryDate || contextDate;

  return (
    <Select
      value={currentDate}
      disabled={hasPendingState || status !== "success"}
      onValueChange={handleDateChange}
    >
      <SelectTrigger
        className="w-[120px]"
        disabled={hasPendingState || status !== "success"}
        rightIcon={(defaultClasses) => {
          return state.date !== "pending" &&
            status !== "pending" ? (
            <ChevronDown className={defaultClasses} />
          ) : (
            <Loader2
              className={cn(defaultClasses, "animate-spin")}
            />
          );
        }}
      >
        <SelectValue placeholder="Dates" />
      </SelectTrigger>
      <SelectContent className="min-w-[120px]">
        {data?.dates.map((date) => (
          <SelectItem
            key={date}
            value={date}
          >
            {date}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
