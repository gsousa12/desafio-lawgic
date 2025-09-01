import { UserRoleType } from "../types/entities";

export function checkValidationButtonVisibility(
  role: UserRoleType | undefined
) {
  if (!role) return false;
  const allowedRoles = ["admin", "reviewer"];
  return role ? allowedRoles.includes(role) : false;
}

export function checkCreateNotificationButtonVisibility(
  role: UserRoleType | undefined
) {
  if (!role) return false;
  const allowedRoles = ["admin", "notifier"];
  return role ? allowedRoles.includes(role) : false;
}
