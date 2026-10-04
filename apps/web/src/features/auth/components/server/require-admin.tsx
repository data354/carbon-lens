import { headers } from "next/headers";
import { auth } from "@/lib/auth/server";
import { notFound } from "next/navigation";
import { checkAdminRole } from "../../utils/admin";

export async function RequireAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (
    session == null ||
    !checkAdminRole(session?.user.role)
  ) {
    notFound();
  }

  return children;
}
