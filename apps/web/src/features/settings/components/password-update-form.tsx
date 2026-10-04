"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  IUpdateCurrentPasswordInput,
  UpdateCurrentPasswordSchema,
} from "@/features/users/schemas/update-password";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { PasswordInput } from "@/components/password-input";
import { updateCurrentPasswordAction } from "@/features/users/actions/update-current-password";
import { ActionErrorCode } from "@/features/users/constants";
import { useId, useTransition } from "react";
import { toast } from "sonner";

export function PasswordUpdateForm() {
  const formId = useId();
  const [isUpdating, startUpdateTransition] =
    useTransition();

  const form = useForm<IUpdateCurrentPasswordInput>({
    resolver: zodResolver(UpdateCurrentPasswordSchema),
    defaultValues: {
      currentPassword: "",
      confirmPassword: "",
      password: "",
    },
  });

  const onSubmit = (data: IUpdateCurrentPasswordInput) => {
    startUpdateTransition(async () => {
      const res = await updateCurrentPasswordAction(data);

      if (!res.ok) {
        if (res.code === ActionErrorCode.PasswordMismatch) {
          toast.error(
            "Les mots de passe ne correspondent pas",
          );
          return;
        }

        toast.error(res.error || "Une erreur est survenue");
        return;
      }

      toast.success("Mot de passe mis à jour");
      form.reset();
    });
  };

  return (
    <Form {...form}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Mot de passe</h3>

          <Button
            type="submit"
            form={formId}
            disabled={
              isUpdating ||
              !form.formState.isValid ||
              form.formState.isSubmitting
            }
          >
            {isUpdating ? (
              <>
                <Spinner />
                Enregistrement...
              </>
            ) : (
              "Enregistrer"
            )}
          </Button>
        </div>

        <form
          id={formId}
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">
                    Mot de passe actuel
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder=""
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">
                    Nouveau mot de passe
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder=""
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-muted-foreground">
                    Confirmer le nouveau mot de passe
                  </FormLabel>
                  <FormControl>
                    <PasswordInput
                      {...field}
                      placeholder=""
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </div>
    </Form>
  );
}
