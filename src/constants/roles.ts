export const ROLES = {
  CLIENT: "client",
  OWNER: "owner",
  EMPLOYEE: "employee",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];
