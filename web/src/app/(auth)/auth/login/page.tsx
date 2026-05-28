import { LoginForm } from "@/features/auth/components/login-form";
import { PersistAuth } from "@/features/auth/components/server/persist-auth";

async function LoginPage() {
  return (
    <PersistAuth>
      <div className="flex w-full max-w-sm flex-col items-center space-y-12">
        <div className="flex w-full max-w-80 flex-col items-center gap-4">
          <h2 className="text-3xl font-medium">
            Connexion
          </h2>
          <p className="text-muted-foreground text-center">
            Remplissez les champs ci-dessous pour vous
            connecter.
          </p>
        </div>

        <LoginForm />
      </div>
    </PersistAuth>
  );
}

export default LoginPage;
