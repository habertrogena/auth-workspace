/** Body for POST /auth/login. Send either email or username. */
export interface LoginInput {
  email?: string;
  username?: string;
  password: string;
}
