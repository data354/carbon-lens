"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mapAreas } from "../constants/areas";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Loader2 } from "lucide-react";
import { useMapFilters } from "../contexts/map-filters";
import { useAreaFetchingState } from "../contexts/area-fetching-state";
import { useRouter } from "next/navigation";
import { useZoom } from "../contexts/zoom";
import { MapArea } from "../types/areas";
import { useQueryState } from "nuqs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AreaFilterProps {
  enableCustomAreas?: boolean;
}

export function AreaFilter({
  enableCustomAreas = false,
}: AreaFilterProps) {
  const [activeArea, setActiveArea] = useQueryState(
    "area",
    {
      defaultValue: mapAreas.departments.value,
    },
  );
  const { update } = useMapFilters();
  const { recenter, canRecenter } = useZoom();
  const { state, setState } = useAreaFetchingState();
  const router = useRouter();

  const hasPendingState = Object.values(state).some(
    (s) => s === "pending",
  );

  const handleAreaChange = async (newArea: MapArea) => {
    setState((prev) => ({ ...prev, area: "pending" }));

    try {
      await setActiveArea(newArea);
      update({ area: newArea });

      if (canRecenter) {
        recenter();
      }

      router.refresh();
    } catch (err) {
      setState((prev) => ({ ...prev, area: "error" }));
      toast.error("Erreur lors du changement.");
      console.error(err);
    }
  };

  return (
    <Select
      value={activeArea}
      disabled={hasPendingState}
      onValueChange={handleAreaChange}
    >
      <SelectTrigger
        className="w-[192px]"
        disabled={hasPendingState}
        rightIcon={(defaultClasses) => {
          return state.area !== "pending" ? (
            <ChevronDown className={defaultClasses} />
          ) : (
            <Loader2
              className={cn(defaultClasses, "animate-spin")}
            />
          );
        }}
      >
        <SelectValue placeholder="Filtrer par zone" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={mapAreas.regions.value}>
          {mapAreas.regions.label}
        </SelectItem>
        <SelectItem value={mapAreas.departments.value}>
          {mapAreas.departments.label}
        </SelectItem>
        <SelectItem value={mapAreas.communes.value}>
          {mapAreas.communes.label}
        </SelectItem>
        <SelectItem value={mapAreas.protectedAreas.value}>
          {mapAreas.protectedAreas.label}
        </SelectItem>
        {enableCustomAreas && (
          <SelectItem value={mapAreas.custom.value}>
            {mapAreas.custom.label}
            {/* TODO: Make the badge right below active for a certain period */}
            <Badge>Nouveau</Badge>
          </SelectItem>
        )}
      </SelectContent>
    </Select>
  );
}
