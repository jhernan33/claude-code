'use client';

import React, {
  createContext,
  useCallback,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import type { User, AuthContextType } from '@/types/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'platziflix_auth_user';
const STORAGE_VERSION = 1;

interface StoredSession {
  version: number;
  user: User;
  timestamp: number;
}

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider
 * Proveedor de autenticación para toda la aplicación
 * - Persiste sesión en localStorage
 * - Provee contexto a través de useUser hook
 * - Mock de usuario para desarrollo
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Efecto: Cargar usuario del localStorage en mount
   */
  useEffect(() => {
    const loadStoredUser = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (!stored) {
          setIsLoading(false);
          return;
        }

        const session: StoredSession = JSON.parse(stored);

        // Validar versión del storage
        if (session.version !== STORAGE_VERSION) {
          localStorage.removeItem(STORAGE_KEY);
          setIsLoading(false);
          return;
        }

        // Validar que el usuario tiene los campos requeridos
        if (
          session.user &&
          typeof session.user.id === 'number' &&
          typeof session.user.email === 'string' &&
          typeof session.user.name === 'string'
        ) {
          setUser(session.user);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
        localStorage.removeItem(STORAGE_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    // Pequeño delay para evitar race conditions
    const timer = setTimeout(loadStoredUser, 0);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Login: Autentica usuario con credenciales
   * TODO: Conectar con backend en producción
   */
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);

    try {
      // PLACEHOLDER: En producción, llamar a backend:
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   body: JSON.stringify({ email, password })
      // });
      // const user = await response.json();

      // Por ahora, mock simple
      if (!email || !password) {
        throw new Error('Email y password requeridos');
      }

      const mockUser: User = {
        id: Math.floor(Math.random() * 10000),
        email,
        name: email.split('@')[0],
      };

      // Persistir sesión
      const session: StoredSession = {
        version: STORAGE_VERSION,
        user: mockUser,
        timestamp: Date.now(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      setUser(mockUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout: Cierra sesión del usuario
   */
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  /**
   * LoginAsMock: Utilidad para desarrollo
   * Permite loguear rápidamente como usuario mock con ID específico
   */
  const loginAsMock = useCallback((userId: number) => {
    const mockUser: User = {
      id: userId,
      email: `user${userId}@platziflix.local`,
      name: `User ${userId}`,
    };

    const session: StoredSession = {
      version: STORAGE_VERSION,
      user: mockUser,
      timestamp: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    setUser(mockUser);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    logout,
    loginAsMock,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
