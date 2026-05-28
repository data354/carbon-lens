import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export function PreferencesSettingSection() {
  return (
    <div className="space-y-8">
      {/* LANGAGUE */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <h3>Langue</h3>
          <p className="text-muted-foreground text-sm">
            Choisissez votre langue préférée
          </p>
        </div>

        <Select defaultValue="fr">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Langue" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="fr">Français</SelectItem>
            <SelectItem value="en">English</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* UNITS */}
      <div className="flex items-center justify-between gap-3">
        <div className="mb-2 space-y-1">
          <h3>Unités de mesure</h3>
          <p className="text-muted-foreground text-sm">
            Stock de carbone
          </p>
        </div>

        <Select defaultValue="tonnes_per_hectare">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Unités de mesure" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tonnes_per_hectare">
              t/ha
            </SelectItem>
            <SelectItem value="kilograms_per_square_meter">
              kg/m²
            </SelectItem>
            <SelectItem value="grams_per_square_meter">
              g/m²
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
