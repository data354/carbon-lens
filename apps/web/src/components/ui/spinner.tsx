import { LoaderIcon, Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

function Spinner({
  className,
  icon = "loader2",
  ...props
}: React.ComponentProps<"svg"> & {
  icon?: "loader" | "loader2";
}) {
  const Icon = icon === "loader" ? LoaderIcon : Loader2Icon;

  return (
    <Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
