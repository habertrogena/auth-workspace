import { LoginFormValues } from "@/validation/login.schema";

export type AuthUser = {
  id: string;
  username: string;
  email?: string | null;
  name?: string;
  role?: string;
  age?: number | null;
  nationalID?: string | null;
};

export type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (data: LoginFormValues) => Promise<void>;
  logout: () => Promise<void>;
};
