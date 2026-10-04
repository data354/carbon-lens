"use client";

import {
  MAX_FILE_COUNT,
  ACCEPTED_GEOJSON_FILES,
  MAX_GEOJSON_FILE_SIZE_MO,
} from "../constants/file";
import { useCallback } from "react";
import { CloudUpload, FileJson2 } from "lucide-react";
import { FileRejection, useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface AreaUploaderProps {
  file: File | undefined;
  inputProps?: React.ComponentProps<"input">;
  onFileChange: (file: File | undefined) => void;
}

export function AreaUploader({
  file,
  inputProps,
  onFileChange,
}: AreaUploaderProps) {
  const onDrop = useCallback(
    (
      acceptedFiles: File[],
      fileRejections: FileRejection[],
    ) => {
      if (fileRejections.length > 0) {
        // TODO: handle errors properly
        return console.warn(fileRejections);
      }

      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];

        new Blob([file], { type: file.type })
          .text()
          .then((text) => {
            const geoJson = JSON.parse(text) as
              | GeoJSON.Feature
              | GeoJSON.FeatureCollection;

            if (!geoJson || !geoJson.type) {
              return toast.error(
                "Le fichier sélectionné n'est pas un GeoJSON valide.",
              );
            }

            switch (geoJson.type) {
              case "FeatureCollection":
                if (geoJson.features.length === 0) {
                  return toast.error(
                    "Le GeoJSON ne contient aucune parcelle.",
                  );
                }

                if (geoJson.features.length > 1) {
                  return toast.error(
                    "Le GeoJSON doit avoir exactement une seule parcelle (feature) dans la collection.",
                  );
                }

                onFileChange(
                  new File(
                    [JSON.stringify(geoJson.features[0])],
                    file.name,
                    { type: file.type },
                  ),
                );
                break;

              case "Feature":
                onFileChange(file);
                break;

              default:
                toast.error(
                  "Le fichier sélectionné n'est pas un GeoJSON valide.",
                );
            }
          })
          .catch((err) => {
            console.error(
              "Erreur lors de la lecture du fichier:",
              err,
            );
            toast.error(
              "Une erreur est survenue lors de la lecture du fichier.",
            );
          });
      }
    },
    [onFileChange],
  );

  const { getRootProps, getInputProps, isDragActive } =
    useDropzone({
      onDrop,
      maxFiles: MAX_FILE_COUNT,
      maxSize: MAX_GEOJSON_FILE_SIZE_MO * 1024 * 1024,
      accept: ACCEPTED_GEOJSON_FILES.reduce(
        (acc, file) => {
          file.mimes.forEach((mime) => {
            acc[mime] = file.extensions;
          });
          return acc;
        },
        {} as Record<string, string[]>,
      ),
    });

  if (file) {
    return (
      <div className="bg-primary/10 rounded-lg p-4">
        <div className="flex items-center gap-2.5">
          <div className="bg-primary grid size-10 shrink-0 place-content-center rounded-md">
            <FileJson2 className="text-primary-foreground size-5" />
          </div>
          <div className="flex-1">
            <h3 className="line-clamp-1 text-sm font-semibold">
              {file.name}
            </h3>
            <p className="text-muted-foreground text-sm">
              {Math.round((file.size / 1024) * 10) / 10} Ko
            </p>
          </div>
          <Button
            size="sm"
            type="button"
            variant="ghost"
            className="text-primary hover:bg-primary/10 hover:text-primary rounded-md"
            onClick={() => onFileChange(undefined)}
          >
            Remplacer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "bg-muted cursor-default rounded-md border border-dashed border-zinc-300 p-6 text-center",
        { "border-primary border-solid": isDragActive },
        getRootProps().className,
      )}
    >
      <input
        {...getInputProps()}
        {...inputProps}
      />
      <div className="flex flex-col items-center justify-center gap-4">
        <CloudUpload
          size={28}
          className="text-primary"
        />
        <div className="space-y-2">
          {isDragActive ? (
            <p className="font-medium text-black">
              Relâchez le fichier ici ...
            </p>
          ) : (
            <p className="font-medium text-black">
              Glissez votre fichier ici ou cliquez pour
              parcourir.
            </p>
          )}
          <p className="text-muted-foreground text-sm">
            {ACCEPTED_GEOJSON_FILES.map((f) => f.name).join(
              ", ",
            )}{" "}
            (max: {MAX_GEOJSON_FILE_SIZE_MO} Mo)
          </p>
        </div>
      </div>
    </div>
  );
}
