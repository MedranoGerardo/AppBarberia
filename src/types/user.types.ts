import { UserRole } from "../constants/roles";

export interface AppUser {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: "active" | "inactive";
  preferredLanguage?: "es" | "en";
  photoUrl?: string;
  ownerBarbershopId?: string | null;
  employeeBarbershopId?: string | null;
  isAdmin?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
}
