import { DateFilter } from "./date-filter";
import { AreaFilter } from "./area-filter";

export async function MapFilters({
  enableCustomAreas,
}: {
  enableCustomAreas: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <AreaFilter enableCustomAreas={enableCustomAreas} />
      <DateFilter />
    </div>
  );
}
