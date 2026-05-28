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
  IUpdateNameInput,
  UpdateNameSchema,
} from "@/features/users/schemas/update-name";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { UserWithRole } from "better-auth/plugins";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { updateNameAction } from "@/features/users/actions/update-name";
import { useQueryClient } from "@tanstack/react-query";
import { useId, useTransition } from "react";
import { toast } from "sonner";

export function PersonalInfoUpdateForm({
  user,
}: {
  user: UserWithRole;
}) {
  const formId = useId();
  const qc = useQueryClient();
  const [isUpdating, startUpdateTransition] =
    useTransition();

  const form = useForm<IUpdateNameInput>({
    resolver: zodResolver(UpdateNameSchema),
    defaultValues: {
      fullName: user.name,
    },
  });

  const onSubmit = (data: IUpdateNameInput) => {
    startUpdateTransition(async () => {
      const res = await updateNameAction(data);

      if (!res.ok) {
        toast.error(res.error || "Une erreur est survenue");
        return;
      }

      await Promise.all([
        qc.invalidateQueries({
          queryKey: ["users-list"],
        }),
        qc.invalidateQueries({
          queryKey: ["session"],
        }),
      ]);

      toast.success("Votre nom a été mis à jour");
      form.reset(data);
    });
  };

  return (
    <Form {...form}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">
            Informations personnelles
          </h3>

          <Button
            type="submit"
            form={formId}
            disabled={
              isUpdating ||
              !form.formState.isDirty ||
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
            <FormItem>
              <FormLabel className="text-muted-foreground">
                Email
              </FormLabel>
              <Input
                value={user.email}
                readOnly
                disabled
              />
            </FormItem>

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel className="text-muted-foreground">
                    Nom complet
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Saisir le nom complet"
                      {...field}
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
