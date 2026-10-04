"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CustomArea } from "../types/custom-area";
import areaSrc from "../assets/images/area.webp";
import { EllipsisVertical } from "lucide-react";
import { CustomAreaListItemMenuContent } from "./custom-area-list-item-menu-content";
import Image from "next/image";

interface CustomAreasListProps {
  data: CustomArea[];
}

export function CustomAreasList({
  data,
}: CustomAreasListProps) {
  return (
    <div className="flex flex-col gap-6">
      {data.map((area) => (
        <div
          key={area.id}
          className="flex items-center gap-3"
        >
          <div className="relative size-13 shrink-0 overflow-hidden rounded-md bg-zinc-300">
            <Image
              src={areaSrc}
              alt="Illustration d'une zone personnalisée sur une carte"
              className="object-cover"
              fill
            />
          </div>
          <div className="flex-1 space-y-0.5">
            <h2 className="line-clamp-1 text-base leading-none font-semibold">
              {area.name}
            </h2>
            <div>
              <p className="text-muted-foreground text-xs">
                Carte :{" "}
                <span className="font-medium">
                  {area.date}
                </span>
              </p>
              <p className="text-muted-foreground text-xs">
                Importé le{" "}
                {new Intl.DateTimeFormat("fr-FR", {
                  dateStyle: "long",
                }).format(area.createdAt)}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="shrink-0"
                pill
              >
                <EllipsisVertical
                  size={16}
                  aria-hidden="true"
                />
              </Button>
            </DropdownMenuTrigger>
            <CustomAreaListItemMenuContent area={area} />
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
}
