"use client";

import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { checkAdminRole } from "@/features/auth/utils/admin";
import { useSession } from "@/features/auth/hooks/session";
import { MainSettingSection } from "./main-section";
import { CollaborationSettingSection } from "./collaboration-section";
import { PreferencesSettingSection } from "./preferences-setting-section";
import { useSettingsSections } from "../contexts/settings-sections";
import { NAV_ITEMS } from "../constants/navigation";
import { cn } from "@/lib/utils";

export function SettingsDialogContent() {
  const { data: session, status: sessionQueryStatus } =
    useSession();
  const { activeSectionId, setActiveSectionId } =
    useSettingsSections();

  const activeSection = NAV_ITEMS.find(
    (item) => item.id === activeSectionId,
  );

  if (sessionQueryStatus !== "success") {
    return null;
  }

  if (!session?.user) {
    return null;
  }

  const isAdminRole = checkAdminRole(session.user.role); // admin or manager

  return (
    <DialogContent className="h-[673px] p-0 sm:max-w-[min(calc(100%-2rem),_982px)]">
      <div className="flex h-full min-h-0 w-full divide-x">
        {/* SIDEBAR */}
        <aside className="w-52 p-4">
          <DialogHeader className="text-left">
            <DialogTitle className="text-muted-foreground text-base font-medium">
              Paramètres
            </DialogTitle>
            <DialogDescription className="sr-only">
              Gérez vos informations et préférences
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 flex flex-col gap-y-2">
            {NAV_ITEMS.map(
              ({ id, label, Icon, requireAdmin }) => {
                if (!!requireAdmin && !isAdminRole) {
                  return null;
                }

                return (
                  <Button
                    key={id}
                    variant="ghost"
                    className={cn(
                      "text-muted-foreground justify-start text-base",
                      {
                        "bg-muted text-foreground":
                          activeSectionId === id,
                      },
                    )}
                    onClick={() => setActiveSectionId(id)}
                  >
                    <Icon
                      size={20}
                      aria-hidden="true"
                      strokeWidth={2.5}
                    />
                    {label}
                  </Button>
                );
              },
            )}
          </div>
        </aside>

        {/* CONTENT */}
        {!!activeSection && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="shrink-0 border-b px-7 py-4">
              <h2 className="text-xl font-medium">
                {activeSection.label}
              </h2>
            </div>

            <div className="min-h-0 w-full flex-1 overflow-y-auto px-7 py-6">
              {activeSectionId === "general" ? (
                <MainSettingSection
                  user={{
                    ...session.user,
                    banned: session.user.banned || null,
                    role: session.user.role as any,
                  }}
                />
              ) : activeSectionId === "collaboration" ? (
                <CollaborationSettingSection />
              ) : activeSectionId === "preferences" ? (
                <PreferencesSettingSection />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );
}
