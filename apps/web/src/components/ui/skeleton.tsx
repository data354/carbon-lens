import { cn } from "@/lib/utils";

function Skeleton({
  className,
  pill = false,
  ...props
}: React.ComponentProps<"div"> & {
  pill?: boolean;
}) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-accent animate-pulse rounded-md",
        pill && "rounded-full",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
