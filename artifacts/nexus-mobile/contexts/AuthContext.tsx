import React, { createContext, useContext, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetMe,
  useLogin as useLoginMutation,
  useRegister as useRegisterMutation,
  useLogout as useLogoutMutation,
} from '@workspace/api-client-react';
import type { AuthUser } from '@workspace/api-client-react';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  // No options needed — 401 is handled gracefully via isError/undefined data
  const { data: meData, isLoading } = useGetMe();

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const logoutMutation = useLogoutMutation();

  const login = useCallback(
    async (username: string, password: string) => {
      await loginMutation.mutateAsync({ data: { username, password } });
      await queryClient.invalidateQueries();
    },
    [loginMutation, queryClient],
  );

  const register = useCallback(
    async (username: string, password: string) => {
      await registerMutation.mutateAsync({ data: { username, password } });
      await queryClient.invalidateQueries();
    },
    [registerMutation, queryClient],
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // ignore server errors on logout
    }
    queryClient.clear();
  }, [logoutMutation, queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user: meData ?? null,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
