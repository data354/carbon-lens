import {
  LucideIcon,
  SlidersHorizontal,
  User,
  UserPlus,
} from "lucide-react";
import { SettingsSection } from "../types";

export interface NavItem {
  id: SettingsSection;
  label: string;
  Icon: LucideIcon;
  requireAdmin?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    id: "general",
    label: "Général",
    Icon: User,
  },
  {
    id: "collaboration",
    label: "Collaboration",
    Icon: UserPlus,
    requireAdmin: true,
  },
  {
    id: "preferences",
    label: "Préférences",
    Icon: SlidersHorizontal,
  },
];
