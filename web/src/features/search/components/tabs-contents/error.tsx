"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AlertCircle, RefreshCcwIcon } from "lucide-react";

interface TabsContentErrorProps {
  title?: string;
  description?: string;
  className?: string;
  onRetry: () => void;
}

export function TabsContentError({
  title,
  description,
  className,
  onRetry,
}: TabsContentErrorProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center gap-5",
        className,
      )}
    >
      <AlertCircle
        size={32}
        className="text-red-600"
      />
      <div className="max-w-xs space-y-2 text-center">
        <p className="text-center">
          {title || "Erreur survenue"}
        </p>
        <p className="text-muted-foreground">
          {description ||
            "Veuillez réessayer ou contacter le support si le problème persiste."}
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        className="rounded-lg"
        onClick={onRetry}
      >
        <RefreshCcwIcon />
        Réessayer
      </Button>
    </div>
  );
}
