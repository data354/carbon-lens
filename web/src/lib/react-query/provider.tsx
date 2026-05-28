"use client";

import { QueryClientProvider as QCProvider } from "@tanstack/react-query";
import { getQueryClient } from "./client";

export function QueryClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();

  return (
    <QCProvider client={queryClient}>{children}</QCProvider>
  );
}
