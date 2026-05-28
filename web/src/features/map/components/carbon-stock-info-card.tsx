import {
  Card,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { getRangeAsText } from "../utils/carbon-classes";
import { CarbonClass } from "../types/carbon-classes";

interface CarbonStockInfoCardProps {
  carbonClass: CarbonClass;
  classCount: number;
}

export function CarbonStockInfoCard({
  carbonClass,
  classCount,
}: CarbonStockInfoCardProps) {
  return (
    <Card className="relative z-50 min-h-[286px] gap-0!">
      <CardContent>
        <div className="relative w-full">
          <div
            className="absolute top-4.5 h-3 w-full"
            style={{
              backgroundColor: `${carbonClass.color}33`,
            }}
          />
          <div
            className="relative flex h-9 justify-between"
            style={{
              width: `calc(100% / ${classCount})`,
              left: `calc(100% / ${classCount} * ${carbonClass.order - 1})`,
            }}
          >
            {carbonClass.order > 1 && (
              <div
                className="w-[2px] opacity-80"
                style={{
                  backgroundColor: carbonClass.color,
                }}
              />
            )}
            <div
              className="mt-1.5 h-3 flex-1"
              style={{
                backgroundColor: carbonClass.color,
              }}
            />
            {carbonClass.order < classCount && (
              <div
                className="w-[2px] bg-black opacity-80"
                style={{
                  backgroundColor: carbonClass.color,
                }}
              />
            )}
            <div className="absolute bottom-0 left-1/2 w-full -translate-x-1/2 translate-y-full">
              <p className="text-center text-xs font-semibold">
                {getRangeAsText(carbonClass)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <p className="text-muted-foreground text-sm font-medium">
            En tC/ha
          </p>
          <CardTitle className="line-clamp-2 text-lg">
            {carbonClass.name} ({carbonClass.meaning})
          </CardTitle>
        </div>

        <p className="mt-2 text-zinc-600">
          {carbonClass.description}
        </p>
      </CardContent>
    </Card>
  );
}
