import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";
import { SetNewUserNameForm } from "@/features/users/components/set-new-user-name-form";
import { redirect } from "next/navigation";
import { Copyright } from "@/components/copyright";

export default async function SetNamePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/auth/login");
  }

  if (session.user.nameSet) {
    if (session.user.firstLogin) {
      redirect("/update-password");
    } else {
      redirect("/dashboard");
    }
  }

  return (
    <main className="container mx-auto max-w-md!">
      <div className="relative min-h-dvh space-y-8 py-20">
        <div className="space-y-4">
          <h1 className="text-center text-3xl font-semibold">
            Complétez votre identité
          </h1>

          <p className="text-center">
            Renseignez votre nom et votre prénom pour
            poursuivre.
          </p>
        </div>

        <SetNewUserNameForm />

        <div className="absolute bottom-4 grid w-full place-content-center">
          <Copyright />
        </div>
      </div>
    </main>
  );
}
