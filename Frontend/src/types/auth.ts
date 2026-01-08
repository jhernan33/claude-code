/**
 * Authentication Types
 * Tipos e interfaces para el sistema de autenticación
 */

export interface User {
  id: number; // user_id para ratings
  email: string;
  name: string;
  avatar?: string; // Opcional: URL del avatar
}

export type RoleType = "guest" | "student" | "instructor" | "admin";

export interface AuthContextType {
  // Estado
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Métodos
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;

  // Mock para desarrollo
  loginAsMock: (userId: number) => void;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthError {
  message: string;
  code?: string;
  statusCode?: number;
}
