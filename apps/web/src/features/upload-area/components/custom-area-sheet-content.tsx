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
  SheetTitle,
  SheetHeader,
  SheetDescription,
  SheetContent,
} from "@/components/ui/sheet";
import {
  MAX_GEOJSON_FILE_SIZE_MO,
  ACCEPTED_GEOJSON_FILES,
} from "../constants/file";
import { Badge } from "@/components/ui/badge";
import { useCustomAreas } from "../contexts/custom-areas";
import frameSrc from "../assets/images/upload-geojson-empty-frame.png";
import { GeoJsonUploadButton } from "./geojson-upload-button";
import { CustomAreasList } from "./custom-areas-list";
import Image from "next/image";

export function CustomAreaSheetContent() {
  const { data } = useCustomAreas();
  const hasCustomAreas = data.length > 0;

  return (
    <SheetContent
      side="right"
      className="w-full gap-0 overflow-y-auto sm:max-w-[480px]"
    >
      <SheetHeader className="border-b border-[#F0F0F0] px-10">
        <SheetTitle className="text-2xl font-semibold">
          Mes fichiers GeoJSON
        </SheetTitle>
        <SheetDescription className="sr-only">
          Gérez vos zones personnalisées importées pour
          obtenir des indicateurs de séquestration carbone à
          l'échelle souhaitée.
        </SheetDescription>
      </SheetHeader>

      <div className="h-full overflow-y-auto">
        {hasCustomAreas ? (
          <div className="flex h-full flex-col">
            <div className="flex-1 space-y-7 px-10 py-6 pb-0">
              <p className="text-muted-foreground text-sm">
                {data.length}{" "}
                {data.length > 1
                  ? "zones sauvegardées"
                  : "zone sauvegardée"}
              </p>
              <CustomAreasList data={data} />
            </div>
            <div className="bg-background border-t border-[#F0F0F0] p-10 pt-6">
              <GeoJsonUploadButton />
            </div>
          </div>
        ) : (
          <div className="space-y-8 p-10">
            <Empty className="border-2 border-dashed md:p-9.5">
              <EmptyHeader>
                <EmptyMedia>
                  <Image
                    src={frameSrc}
                    alt="Illustration d'une zone personnalisée sur une carte"
                    height={142}
                    width={126}
                  />
                </EmptyMedia>
                <EmptyTitle>
                  Aucun fichier importé
                </EmptyTitle>
                <EmptyDescription className="text-base/normal">
                  Importez votre premier fichier GeoJSON
                  pour délimiter une zone personnalisée et
                  obtenir des indicateurs de séquestration
                  carbone à l'échelle souhaitée.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex gap-2">
                  {[
                    ...ACCEPTED_GEOJSON_FILES.flatMap(
                      (f) => f.extensions,
                    ),
                    `${MAX_GEOJSON_FILE_SIZE_MO} Mo max`,
                  ].map((info) => (
                    <Badge
                      key={info}
                      variant="outline"
                      className="text-muted-foreground text-xs"
                    >
                      {info}
                    </Badge>
                  ))}
                </div>
              </EmptyContent>
            </Empty>
            <GeoJsonUploadButton />
          </div>
        )}
      </div>
    </SheetContent>
  );
}
