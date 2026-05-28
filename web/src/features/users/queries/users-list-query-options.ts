import { authClient } from "@/lib/auth/client";
import { queryOptions } from "@tanstack/react-query";

export function getUsersListQueryOptions() {
  return queryOptions({
    queryKey: ["users-list"],
    queryFn: async () => {
      return authClient.admin
        .listUsers({
          query: {
            sortBy: "updatedAt",
            sortDirection: "desc",
          },
        })
        .then((res) => res.data?.users || []);
    },
  });
}
