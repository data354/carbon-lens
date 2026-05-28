import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export function TabsContentLoader({
  label,
  className,
  spinFast = false,
  ...props
}: React.ComponentProps<"div"> & {
  label?: string;
  spinFast?: boolean;
}) {
  return (
    <div
      {...props}
      className={cn(
        "flex h-full items-center justify-center space-x-1.5 p-4",
        className,
      )}
    >
      <Spinner
        className={cn({
          "animate-spin-fast": spinFast,
        })}
      />
      <span>{label || "Chargement..."}</span>
    </div>
  );
}
