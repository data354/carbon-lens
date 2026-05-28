"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  IUpdatePasswordInput,
  UpdatePasswordSchema,
} from "../../users/schemas/update-password";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { updateNewUserPasswordAction } from "../../users/actions/update-new-user-password";
import { updateFirstLoginStatusAction } from "../../users/actions/update-first-login-status";
import { PasswordInput } from "@/components/password-input";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";

export function UpdateNewUserPasswordForm() {
  const [
    isUpdatingPassword,
    startPasswordUpdateTransition,
  ] = useTransition();
  const [isSkipping, startSkipTransition] = useTransition();
  const router = useRouter();

  const form = useForm<IUpdatePasswordInput>({
    resolver: zodResolver(UpdatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: IUpdatePasswordInput) => {
    startPasswordUpdateTransition(async () => {
      const res = await updateNewUserPasswordAction(
        values.password,
      );

      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      toast.success("Votre mot de passe a été mis à jour.");
      router.push("/dashboard");
    });
  };

  const onSkip = () => {
    startSkipTransition(async () => {
      const res = await updateFirstLoginStatusAction(false);

      if (!res.ok) {
        toast.error("Une erreur est survenue.");
        return;
      }

      router.push("/dashboard");
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full"
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput
                    placeholder="Nouveau mot de passe"
                    {...field}
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
                <FormControl>
                  <PasswordInput
                    placeholder="Confirmer le mot de passe"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-8 flex flex-col gap-2">
          <Button
            type="submit"
            className="flex-1"
            disabled={isUpdatingPassword || isSkipping}
          >
            {isUpdatingPassword ? (
              <>
                <Spinner />
                Mise à jour en cours...
              </>
            ) : (
              "Mettre à jour"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={isUpdatingPassword || isSkipping}
            onClick={onSkip}
          >
            {isSkipping ? (
              <>
                <Spinner />
                Patienter un instant...
              </>
            ) : (
              "Passer pour l'instant"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
