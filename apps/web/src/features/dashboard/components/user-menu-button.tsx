"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileJson2, LogOut, Settings } from "lucide-react";
import { useSession } from "@/features/auth/hooks/session";
import { useDashboardDialogs } from "../contexts/dialogs";
import { useDashboardSheets } from "../contexts/sheets";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth/client";
import { getInitials } from "@/lib/utils";

export function UserMenuButton() {
  const { data: session, isPending } = useSession();
  const { open: openDialog } = useDashboardDialogs();
  const { open: openSheet } = useDashboardSheets();
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/auth/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isPending ? (
          <Skeleton
            className="size-8.5"
            pill
          />
        ) : (
          <Button
            size="icon"
            className="bg-[#F13E3E] hover:bg-[#F13E3E]"
            disabled={isPending}
            pill
          >
            {getInitials(session?.user.name || "")
              .slice(0, 2)
              .toUpperCase()}
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48"
        align="end"
      >
        <DropdownMenuLabel className="flex min-w-0 flex-col">
          <span className="text-foreground truncate text-sm font-medium">
            {session?.user.name}
          </span>
          <span className="text-muted-foreground truncate text-xs font-normal">
            {session?.user.email}
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onSelect={() => openSheet("upload-geojson")}
          >
            <FileJson2
              size={16}
              aria-hidden="true"
            />
            GeoJSON
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => openDialog("settings")}
          >
            <Settings
              size={16}
              aria-hidden="true"
            />
            Paramètres
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            variant="destructive"
            onSelect={handleSignOut}
          >
            <LogOut
              size={16}
              aria-hidden="true"
            />
            Déconnexion
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
