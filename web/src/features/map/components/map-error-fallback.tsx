"use client";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  RefreshCcw,
  CircleQuestionMark,
} from "lucide-react";
import { useHeaderHeight } from "@/features/dashboard/contexts/header-height";
import { Button } from "@/components/ui/button";

export function MapErrorFallback() {
  const { height } = useHeaderHeight();

  return (
    <div
      className="grid place-content-center"
      style={{ height: `calc(100dvh - ${height}px)` }}
    >
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CircleQuestionMark />
          </EmptyMedia>
          <EmptyTitle>
            Oups, une erreur est survenue
          </EmptyTitle>
          <EmptyDescription>
            Nous avons rencontré un problème lors du
            chargement de la carte avec les paramètres
            sélectionnés. Veuillez réessayer ou ajuster vos
            paramètres de recherche.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              window.location.href = "/dashboard";
            }}
          >
            <RefreshCcw />
            Recharger la page
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
