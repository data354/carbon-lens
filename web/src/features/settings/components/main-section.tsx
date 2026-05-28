import { Separator } from "@/components/ui/separator";
import { PasswordUpdateForm } from "./password-update-form";
import { PersonalInfoUpdateForm } from "./personal-info-update-form";
import { UserWithRole } from "better-auth/plugins";

interface MainSettingSectionProps {
  user: UserWithRole;
}

export function MainSettingSection({
  user,
}: MainSettingSectionProps) {
  return (
    <div className="space-y-8">
      <PersonalInfoUpdateForm user={user} />
      <Separator />
      <PasswordUpdateForm />
    </div>
  );
}
