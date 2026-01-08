'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import type { AuthContextType } from '@/types/auth';

/**
 * useUser
 * Hook que retorna el contexto de autenticación
 *
 * Uso:
 * const { user, isLoading, isAuthenticated, login, logout } = useUser();
 *
 * @throws Error si se usa fuera de AuthProvider
 */
export const useUser = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error(
      'useUser debe ser usado dentro de AuthProvider. ' +
        'Asegúrate de que tu componente está envuelto con <AuthProvider>'
    );
  }

  return context;
};

/**
 * Hook auxiliar: useIsAuthenticated
 * Retorna solo el estado de autenticación
 */
export const useIsAuthenticated = (): boolean => {
  const { isAuthenticated } = useUser();
  return isAuthenticated;
};

/**
 * Hook auxiliar: useCurrentUser
 * Retorna el usuario actual o undefined
 */
export const useCurrentUser = () => {
  const { user } = useUser();
  return user;
};
