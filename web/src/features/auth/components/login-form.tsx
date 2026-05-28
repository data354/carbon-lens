"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { ILoginInput, LoginSchema } from "../schemas/login";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/password-input";
import { useEffect, useState, useTransition } from "react";
import { CircleAlert } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useRouter } from "next/navigation";
import { loginAction } from "../actions/login";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const qc = useQueryClient();
  const router = useRouter();

  const form = useForm<ILoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const email = form.watch("email");
  const password = form.watch("password");

  function onSubmit(data: ILoginInput) {
    setError(null);

    startTransition(async () => {
      const response = await loginAction(data);

      if (!response.ok) {
        setError(response.error);
        return;
      }

      await qc.invalidateQueries({
        queryKey: ["session"],
      });

      if (!response.data.nameSet) {
        router.push("/set-name");
        return;
      }

      if (response.data.firstLogin) {
        router.push("/update-password");
        return;
      }

      router.push("/dashboard");
    });
  }

  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [email, password]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full"
      >
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
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
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PasswordInput
                    {...field}
                    className=""
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!!error && (
            <Alert variant="destructive">
              <CircleAlert />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}
        </div>

        <Button
          disabled={isPending}
          className="mt-12 w-full"
        >
          {isPending ? (
            <>
              <Spinner />
              Connexion en cours...
            </>
          ) : (
            "Se connecter"
          )}
        </Button>
      </form>
    </Form>
  );
}
