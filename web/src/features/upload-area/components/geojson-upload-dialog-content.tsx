"use client";

import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AreaUploadForm } from "./area-upload-form";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useId, useState } from "react";

export function GeoJsonUploadDialogContent() {
  const [pending, setPending] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const formId = useId();

  return (
    <DialogContent className="gap-y-8 rounded-xl p-0 pt-6 sm:max-w-[596px]">
      <DialogHeader className="px-6">
        <DialogTitle className="text-xl">
          Importer un fichier GeoJSON
        </DialogTitle>
        <DialogDescription className="text-base">
          Délimitez une zone personnalisée pour obtenir ses
          indicateurs de séquestration.
        </DialogDescription>
      </DialogHeader>

      <div className="px-6">
        <AreaUploadForm
          id={formId}
          onValidStateChange={setIsFormValid}
          onPendingChange={setPending}
        />
      </div>

      <DialogFooter className="border-muted border-t p-6 pt-4">
        <DialogClose asChild>
          <Button
            variant="outline"
            className="rounded-md"
            disabled={pending}
          >
            Annuler
          </Button>
        </DialogClose>
        <Button
          type="submit"
          className="rounded-md"
          disabled={!isFormValid || pending}
          form={formId}
        >
          {pending ? (
            <>
              <Spinner />
              Importation ...
            </>
          ) : (
            "Importer"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
