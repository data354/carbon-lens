"use client";

import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/img/logo.svg";
import whiteLogo from "@/assets/img/logo-white.svg";
import { cn } from "@/lib/utils";

interface LogoLinkProps {
  href: string;
  className?: string;
  labelClassName?: string;
  variant?: "default" | "white";
  imgSize?: number;
  onClick?: () => void;
}

export function LogoLink({
  href,
  variant = "default",
  labelClassName,
  imgSize = 34,
  className,
  onClick,
}: LogoLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-1.5",
        className,
      )}
      onClick={onClick}
    >
      <Image
        alt="CarbonLens Logo"
        src={variant === "white" ? whiteLogo : logo}
        width={imgSize}
        height={imgSize}
      />
      <h1
        className={cn(
          "hidden font-semibold md:inline-block",
          {
            "text-white": variant === "white",
          },
          labelClassName,
        )}
      >
        CarbonLens
      </h1>
    </Link>
  );
}
