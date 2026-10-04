import { AdminRole, Role } from "./types";

export const MIN_PASSWORD_LENGTH = 6;

export const adminRoles: readonly AdminRole[] = Array.from(
  new Set<AdminRole>(["admin", "manager"]),
);

export const roles: readonly Role[] = Array.from(
  new Set<Role>(["admin", "manager", "user"]),
);

export const rolesWithLabels: {
  value: Role;
  label: string;
}[] = [
  {
    value: "admin",
    label: "Admin",
  },
  {
    value: "manager",
    label: "Manager",
  },
  {
    value: "user",
    label: "Utilisateur",
  },
];
