"use client";

import { Button } from "@/components/ui/button";
import { useDashboardDialogs } from "@/features/dashboard/contexts/dialogs";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface GeoJsonUploadButtonProps
  extends React.ComponentProps<typeof Button> {
  title?: string;
}

export function GeoJsonUploadButton({
  title,
  className,
  onClick,
  ...props
}: GeoJsonUploadButtonProps) {
  const { open: openDialog } = useDashboardDialogs();

  const handleClick: React.MouseEventHandler<
    HTMLButtonElement
  > = (e) => {
    onClick?.(e);
    openDialog("upload-geojson");
  };

  return (
    <Button
      size="lg"
      className={cn("w-full", className)}
      onClick={handleClick}
      {...props}
    >
      <Plus
        size={16}
        aria-hidden="true"
      />
      {title || "Importer un fichier GeoJSON"}
    </Button>
  );
}
