"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus } from "lucide-react";
import { useZoom } from "../contexts/zoom";
import { useState, useEffect } from "react";
import { getPercentageFromZoomLvl } from "../lib/zoom";

export function ZoomControl() {
  const {
    zoom,
    canZoomIn,
    canZoomOut,
    canRecenter,
    zoomIn,
    zoomOut,
    zoomToPercentage,
    recenter,
  } = useZoom();
  const [newZoomPercentage, setNewZoomPercentage] =
    useState(getPercentageFromZoomLvl(zoom).toFixed(0));

  const handleZoomPercentageChange: React.FormEventHandler =
    (e) => {
      e.preventDefault();

      if (newZoomPercentage === "") {
        setNewZoomPercentage(
          getPercentageFromZoomLvl(zoom).toFixed(0),
        );
        return;
      }

      const newZoom = zoomToPercentage(
        Number(newZoomPercentage),
      );

      if (newZoom) {
        setNewZoomPercentage(
          getPercentageFromZoomLvl(newZoom).toFixed(0),
        );
      }
    };

  useEffect(() => {
    setNewZoomPercentage(
      getPercentageFromZoomLvl(zoom).toFixed(0),
    );
  }, [zoom]);

  return (
    <Card className="rounded-lg py-1.5">
      <CardContent className="flex items-center gap-3 px-1.5">
        <div className="flex gap-1.5">
          <Button
            size="icon"
            variant="ghost"
            disabled={!canZoomOut}
            onClick={zoomOut}
          >
            <Minus />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            disabled={!canZoomIn}
            onClick={zoomIn}
          >
            <Plus />
          </Button>
        </div>

        <form
          className="w-full max-w-20"
          onSubmit={handleZoomPercentageChange}
        >
          <InputGroup className="h-7.5">
            <InputGroupInput
              autoComplete="off"
              inputMode="numeric"
              maxLength={3}
              className="h-auto w-full rounded-sm px-2 text-right"
              placeholder=""
              value={newZoomPercentage}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value)) {
                  setNewZoomPercentage(e.target.value);
                }
              }}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupText>%</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
        </form>

        <Separator
          orientation="vertical"
          className="h-6!"
        />

        <Button
          size="sm"
          className="h-7.5"
          disabled={!canRecenter}
          onClick={recenter}
        >
          Recentrer
        </Button>
      </CardContent>
    </Card>
  );
}
