import { UserRoleType } from "../types/entities";

export function checkValidationButtonVisibility(
  role: UserRoleType | undefined
) {
  console.log("Checking role:", role);
  if (!role) return false;
  const allowedRoles = ["admin", "reviewer"];
  return role ? allowedRoles.includes(role) : false;
}
