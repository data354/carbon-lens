"use client";

import { SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardDialogs } from "@/features/dashboard/contexts/dialogs";
import { useMap } from "@/features/map/contexts/map";

export function AreaSearchButton() {
  const { open: openDialog } = useDashboardDialogs();
  const map = useMap();

  return (
    <Button
      variant="outline"
      onClick={() => openDialog("search")}
      disabled={!map}
    >
      <SearchIcon />
      <span className="w-[calc(240px-70px)] text-left">
        Rechercher une zone
      </span>
    </Button>
  );
}
