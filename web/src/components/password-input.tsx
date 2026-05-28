"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordInputProps
  extends React.ComponentProps<typeof Input> {
  defaultVisible?: boolean;
  containerClassName?: string;
}

export function PasswordInput({
  defaultVisible = false,
  containerClassName,
  ...props
}: PasswordInputProps) {
  const [isVisible, setIsVisible] =
    useState(defaultVisible);

  const toggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  return (
    <div className={cn("relative", containerClassName)}>
      <Input
        {...props}
        className={cn("pe-9", props.className)}
        type={isVisible ? "text" : "password"}
        placeholder={props.placeholder ?? "Mot de passe"}
      />
      <button
        type="button"
        className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        onClick={toggleVisibility}
        aria-pressed={isVisible}
        aria-controls="password"
        aria-label={
          isVisible
            ? "Masquer le mot de passe"
            : "Afficher le mot de passe"
        }
      >
        {isVisible ? (
          <EyeOffIcon
            size={16}
            aria-hidden="true"
          />
        ) : (
          <EyeIcon
            size={16}
            aria-hidden="true"
          />
        )}
      </button>
    </div>
  );
}
