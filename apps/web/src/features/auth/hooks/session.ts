"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export function useSession() {
  const router = useRouter();
  const response = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const sessionRes = await authClient.getSession();
      if (!!sessionRes.error) throw sessionRes.error;
      return sessionRes.data;
    },
  });

  useEffect(() => {
    if (!response.isPending && !response.data) {
      router.push("/auth/login");
    }
  }, [response.isPending, response.data, router]);

  return response;
}
