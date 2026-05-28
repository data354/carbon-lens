"use client";

import { useHeaderHeight } from "../contexts/header-height";
import { useLayoutEffect, useRef } from "react";
import { DashboardLogo } from "./dashboard-logo";
import { useSession } from "@/features/auth/hooks/session";
import { CSVExportButton } from "@/features/export/components/csv-export-button";
import { UserMenuButton } from "./user-menu-button";
import { usePathname } from "next/navigation";

export function DashboardHeader() {
  const { data: session } = useSession();
  const headerRef = useRef<HTMLDivElement>(null);
  const { setHeight } = useHeaderHeight();
  const path = usePathname();

  const isDashboard = path === "/dashboard";

  useLayoutEffect(() => {
    if (headerRef.current) {
      setHeight(
        headerRef.current.getBoundingClientRect().height,
      );
    }
  }, [setHeight, session]);

  return (
    <header
      ref={headerRef}
      className="bg-background border-b py-4"
    >
      <nav className="container flex items-center justify-between">
        <DashboardLogo />
        <div className="flex items-center space-x-4">
          {isDashboard && <CSVExportButton />}
          <UserMenuButton />
        </div>
      </nav>
    </header>
  );
}
