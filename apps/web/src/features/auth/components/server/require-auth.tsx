import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export async function RequireAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const res = await auth.api.getSession({
    headers: await headers(),
  });

  if (res == null) {
    redirect("/auth/login");
  }

  return children;
}
