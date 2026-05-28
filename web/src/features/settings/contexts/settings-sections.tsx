"use client";

import { createContext, use, useState } from "react";
import { SettingsSection } from "../types";
import { NAV_ITEMS } from "../constants/navigation";

interface ISettingsSectionsContext {
  activeSectionId: SettingsSection;
  setActiveSectionId: (id: SettingsSection) => void;
}

const SettingsSectionsContext =
  createContext<ISettingsSectionsContext | null>(null);

export function SettingsSectionsProvider({
  children,
}: React.PropsWithChildren) {
  const [activeSectionId, setActiveSectionId] =
    useState<SettingsSection>(NAV_ITEMS[0].id);

  return (
    <SettingsSectionsContext
      value={{ activeSectionId, setActiveSectionId }}
    >
      {children}
    </SettingsSectionsContext>
  );
}

export function useSettingsSections() {
  const ctx = use(SettingsSectionsContext);

  if (!ctx) {
    throw new Error(
      "useSettingsSections must be used within a SettingsSectionsProvider",
    );
  }

  return ctx;
}
