import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CreateUserForm } from "@/features/users/components/create-user-form";
import { UsersTable } from "@/features/users/components/users-table";
import { AlertCircle } from "lucide-react";

export function CollaborationSettingSection() {
  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-2">
          <h3>Administrateur</h3>
          <Alert variant="info">
            <AlertCircle />
            <AlertDescription>
              Vous pouvez ajouter des utilisateurs et les
              supprimer.
            </AlertDescription>
          </Alert>
        </div>

        <CreateUserForm />
      </div>
      <Separator />
      <UsersTable />
    </div>
  );
}
