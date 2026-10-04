"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  IUpdateNameInput,
  UpdateNameSchema,
} from "../schemas/update-name";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { setNameAction } from "../actions/set-name";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTransition } from "react";
import { toast } from "sonner";

export function SetNewUserNameForm() {
  const [isUpdating, startPasswordUpdate] = useTransition();
  const router = useRouter();

  const form = useForm<IUpdateNameInput>({
    resolver: zodResolver(UpdateNameSchema),
    defaultValues: {
      fullName: "",
    },
  });

  const onSubmit = (values: IUpdateNameInput) => {
    startPasswordUpdate(async () => {
      const res = await setNameAction({
        fullName: values.fullName,
      });

      if (!res.ok) {
        toast.error(res.error || "Une erreur est survenue");
        return;
      }

      toast.success("Votre nom a été mis à jour.");
      router.push("/update-password");
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
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Nom complet"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="mt-4 w-full"
            disabled={isUpdating}
          >
            {isUpdating ? (
              <>
                <Spinner />
                Enregistrement...
              </>
            ) : (
              "Continuer"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
