"use client";

import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteUploadedGeoJson } from "../actions/delete-uploaded-geojson";
import { useSelectedAreaForDeletion } from "../contexts/selected-area-deletion";
import { useDashboardDialogs } from "@/features/dashboard/contexts/dialogs";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";

export function DeleteCustomAreaDialogContent() {
  const [pending, startTransition] = useTransition();
  const { close: closeDialog } = useDashboardDialogs();
  const { areaToDelete, setAreaToDelete } =
    useSelectedAreaForDeletion();

  const handleDelete = () => {
    if (!areaToDelete) return;

    startTransition(async () => {
      try {
        const result = await deleteUploadedGeoJson(
          areaToDelete.id,
        );

        if (!result.ok) {
          throw new Error(result.error);
        }
      } catch (err) {
        console.error("Error deleting custom area:", err);
        toast.error(
          "Erreur lors de la suppression de la zone.",
        );
      } finally {
        setAreaToDelete(null);
        closeDialog();
      }
    });
  };

  return (
    <DialogContent
      className="gap-y-8 rounded-xl sm:max-w-md"
      showCloseButton={false}
    >
      <DialogHeader>
        <DialogTitle>
          Confirmation de suppression
        </DialogTitle>
        <DialogDescription>
          Êtes-vous sûr de vouloir supprimer la zone
          personnalisée{" "}
          <span className="font-semibold text-black">
            {areaToDelete?.name}
          </span>{" "}
          ? Cette action est irréversible.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <DialogClose asChild>
          <Button
            variant="outline"
            disabled={pending}
          >
            Annuler
          </Button>
        </DialogClose>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={pending}
        >
          Supprimer
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
