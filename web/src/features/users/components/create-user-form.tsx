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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CreateUserSchema,
  ICreateUserInput,
} from "../schemas/create-user";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { rolesWithLabels } from "@/features/auth/constants";
import { createNewUserAction } from "../actions/create-user";
import { useSession } from "@/features/auth/hooks/session";
import { isManager } from "@/features/auth/utils/admin";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type CreateUserFormProps = React.ComponentProps<"form"> & {
  onSuccess?: () => void;
};

export function CreateUserForm({
  onSuccess,
  ...props
}: CreateUserFormProps) {
  const { data: session } = useSession();
  const [pending, startTransition] = useTransition();
  const isUserManager = isManager(session?.user?.role);
  const qc = useQueryClient();

  const form = useForm<ICreateUserInput>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      fullName: "X X",
      email: "",
      role: "user",
    },
  });

  function onSubmit(data: ICreateUserInput) {
    startTransition(async () => {
      const res = await createNewUserAction(data);

      if (!res.ok) {
        toast.error(res.error);
        return;
      }

      await qc.invalidateQueries({
        queryKey: ["users-list"],
      });
      toast.success(res.data);
      form.reset();
      onSuccess?.();
    });
  }

  return (
    <Form {...form}>
      <form
        {...props}
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("w-full", props.className)}
      >
        <div className="flex items-end gap-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-muted-foreground">
                  Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="nom@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="text-muted-foreground">
                  Rôle
                </FormLabel>
                <FormControl>
                  <Select
                    defaultValue="user"
                    onValueChange={field.onChange}
                    {...field}
                  >
                    <SelectTrigger
                      className="w-full"
                      {...field}
                    >
                      <SelectValue placeholder="Sélectionner un rôle" />
                    </SelectTrigger>
                    <SelectContent className="[&_*[role=option]]:ps-2 [&_*[role=option]]:pe-8 [&_*[role=option]>span]:start-auto [&_*[role=option]>span]:end-2">
                      {rolesWithLabels.map((role) => {
                        if (
                          isUserManager &&
                          role.value === "admin"
                        ) {
                          return;
                        }

                        return (
                          <SelectItem
                            key={role.value}
                            value={role.value}
                          >
                            {role.label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={
              pending ||
              form.formState.isSubmitting ||
              !form.formState.isValid
            }
          >
            {pending ? (
              <>
                <Spinner />
                Création...
              </>
            ) : (
              "Créer l'utilisateur"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
