import { createContext, useContext } from "react";

interface AuthContextType {
  user: { id: string; name: string } | null;
  token: string | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
});

export function useAuth() {
  return useContext(AuthContext);
}
