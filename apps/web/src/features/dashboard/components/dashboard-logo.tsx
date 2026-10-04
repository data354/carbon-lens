"use client";

import Image from "next/image";
import logo from "@/assets/img/logo.svg";
import whiteLogo from "@/assets/img/logo-white.svg";
import { cn } from "@/lib/utils";

const IMG_SIZE = 28;

interface DashboardLogoProps {
  variant?: "default" | "white";
  labelClassName?: string;
  className?: string;
  imgSize?: number;
}

export function DashboardLogo({
  variant = "default",
  imgSize = IMG_SIZE,
  ...props
}: DashboardLogoProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5",
        props.className,
      )}
    >
      <Image
        alt="CarbonLens Logo"
        src={variant === "white" ? whiteLogo : logo}
        width={imgSize}
        height={imgSize}
      />
      <h1
        className={cn(
          "hidden text-base font-semibold md:inline-block",
          { "text-white": variant === "white" },
          props.labelClassName,
        )}
      >
        CarbonLens
      </h1>
    </div>
  );
}
