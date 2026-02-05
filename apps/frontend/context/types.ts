import { LoginFormValues } from "@/validation/login.schema";
import { RegisterFormValues } from "@/validation/register.schema";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  age?: number | null;
  nationalID?: string | null;
};

export type AuthContextType = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;

  register: (data: RegisterFormValues) => Promise<void>;
  login: (data: LoginFormValues) => Promise<void>;
  logout: () => Promise<void>;
};
