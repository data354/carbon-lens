import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { UpdateNewUserPasswordForm } from "@/features/auth/components/update-new-user-password-form";
import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { AlertCircle } from "lucide-react";
import { redirect } from "next/navigation";
import { Copyright } from "@/components/copyright";

export default async function UpdatePasswordPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  if (!session.user.nameSet) {
    redirect("/set-name");
  }

  if (!session.user.firstLogin) {
    redirect("/dashboard");
  }

  return (
    <main className="container mx-auto max-w-md!">
      <div className="relative min-h-dvh space-y-8 py-20">
        <h1 className="text-center text-3xl font-semibold">
          Mettez à jour votre mot de passe
        </h1>

        <Alert
          variant="warning"
          className="text-start"
        >
          <AlertCircle />
          <AlertDescription>
            Nous vous recommandons de modifier le mot de
            passe qui vous a été attribué par défaut lors de
            la création de votre compte.
          </AlertDescription>
        </Alert>

        <UpdateNewUserPasswordForm />

        <div className="absolute bottom-4 grid w-full place-content-center">
          <Copyright />
        </div>
      </div>
    </main>
  );
}
