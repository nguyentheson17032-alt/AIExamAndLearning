import type { UserRole } from "./types";

export function isStaffRole(role: UserRole): boolean {
  return role === "TEACHER" || role === "ADMIN";
}
