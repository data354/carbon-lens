import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useDashboardDialogs } from "@/features/dashboard/contexts/dialogs";
import { useSelectedAreaForDeletion } from "../contexts/selected-area-deletion";
import { CustomArea } from "../types/custom-area";
import { Trash2 } from "lucide-react";

export function CustomAreaListItemMenuContent({
  area,
}: {
  area: CustomArea;
}) {
  const { open: openDialog } = useDashboardDialogs();
  const { setAreaToDelete } = useSelectedAreaForDeletion();

  const handleSelectDelete = () => {
    setAreaToDelete(area);
    openDialog("delete-custom-area");
  };

  return (
    <DropdownMenuContent align="end">
      <DropdownMenuItem
        variant="destructive"
        onSelect={handleSelectDelete}
      >
        <Trash2
          size={16}
          aria-hidden="true"
        />
        Supprimer
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}
