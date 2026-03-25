export type Role = "ADMIN" | "BUSINESS";

export interface User {
  id: string;
  username: string;
  email?: string | null;
  name?: string;
  role?: Role;
  age?: number | null;
  nationalID?: string | null;
}
