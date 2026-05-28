import { adminRoles } from "../constants";

export function checkAdminRole(role: any) {
  return adminRoles.includes(role);
}

export function isAdmin(role: any) {
  return role === "admin";
}

export function isManager(role: any) {
  return role === "manager";
}

export function isUser(role: any) {
  return role === "user";
}
