"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  isAdmin,
  isManager,
} from "@/features/auth/utils/admin";
import { Button } from "@/components/ui/button";
import { Session } from "@/lib/auth/server";
import { Spinner } from "@/components/ui/spinner";
import { deleteMemberAction } from "../actions/delete-member";
import { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/features/auth/hooks/session";
import { toast } from "sonner";

interface DeleteUserButtonProps {
  user: Session["user"];
  onDeleted?: () => void;
}

export function DeleteUserButton({
  user,
  onDeleted,
}: DeleteUserButtonProps) {
  const { data: sessionRes, isPending: isSessionPending } =
    useSession();
  const isCurrentUser = sessionRes?.user.id === user.id;
  const isCurrentUserManager = isManager(
    sessionRes?.user.role,
  );
  const isCurrentUserAdmin = isAdmin(sessionRes?.user.role);
  const isSelectedUserAdmin = isAdmin(user.role);
  const [isDeleting, startTransition] = useTransition();
  const [dialogOpened, setDialogOpened] = useState(false);
  const qc = useQueryClient();

  // Delete permissions:
  // 1. if current user is not the selected user AND
  //    a. if current user is admin => can delete
  //    b. if current user is manager and selected user is not admin => can delete
  const canDelete =
    !isCurrentUser &&
    (isCurrentUserAdmin ||
      (isCurrentUserManager && !isSelectedUserAdmin));

  const handleUserDeletion = () => {
    if (!canDelete) {
      return;
    }

    startTransition(async () => {
      const res = await deleteMemberAction({
        id: user.id,
        role: user.role as any,
      });

      if (!res.ok) {
        toast.error(res.error || "Une erreur est survenue");
        return;
      }

      await qc.invalidateQueries({
        queryKey: ["users-list"],
      });

      onDeleted?.();
      toast.success("Utilisateur supprimé avec succès");
      setDialogOpened(false);
    });
  };

  return (
    <Dialog
      open={dialogOpened}
      onOpenChange={setDialogOpened}
    >
      <DialogTrigger asChild>
        <Button
          variant="link"
          className="text-destructive"
          disabled={
            isDeleting || isSessionPending || !canDelete
          }
        >
          Supprimer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Suppression</DialogTitle>
          <DialogDescription>
            Êtes vous sûr de vouloir supprimer l'utilisateur{" "}
            <span className="text-foreground font-semibold">
              {!user.firstLogin ? user.name : user.email}
            </span>{" "}
            ? Cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
            >
              Annuler
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            disabled={isDeleting}
            onClick={handleUserDeletion}
          >
            {isDeleting ? (
              <>
                <Spinner />
                Suppression...
              </>
            ) : (
              "Supprimer"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
