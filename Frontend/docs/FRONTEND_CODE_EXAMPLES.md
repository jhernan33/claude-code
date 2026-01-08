# Ejemplos de Código - Frontend Rating System

Documento con ejemplos completos, listos para copiar y pegar.

---

## FASE 1: AUTENTICACIÓN

### Archivo 1: `/src/types/auth.ts`

```typescript
/**
 * Authentication Types
 * Tipos y interfaces para el sistema de autenticación
 */

export interface User {
  id: number;           // user_id para ratings
  email: string;
  name: string;
  avatar?: string;      // Opcional: URL del avatar
}

export type RoleType = 'guest' | 'student' | 'instructor' | 'admin';

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
```

### Archivo 2: `/src/context/AuthContext.tsx`

```typescript
/**
 * AuthContext
 * Contexto global para autenticación y estado de usuario
 */

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
```

### Archivo 3: `/src/hooks/useUser.ts`

```typescript
/**
 * useUser Hook
 * Hook para acceder al contexto de autenticación en componentes
 */

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
```

### Archivo 4: Modificar `/src/app/layout.tsx`

```typescript
/**
 * Root Layout
 * MODIFICAR EXISTENTE - Agregar AuthProvider
 */

import type { Metadata } from 'next';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Platziflix',
  description: 'Plataforma de cursos online',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        {/* Envolver toda la aplicación con AuthProvider */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### Test: `/src/context/__tests__/AuthContext.test.tsx`

```typescript
/**
 * Tests para AuthContext
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useContext } from 'react';
import { AuthProvider, AuthContext } from '@/context/AuthContext';
import { useUser } from '@/hooks/useUser';

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Initialization', () => {
    it('should initialize with null user', async () => {
      let contextValue;

      const TestComponent = () => {
        contextValue = useContext(AuthContext);
        return <div>Initialized</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(contextValue?.user).toBeNull();
        expect(contextValue?.isAuthenticated).toBe(false);
        expect(contextValue?.isLoading).toBe(false);
      });
    });
  });

  describe('Login', () => {
    it('should login user and persist to localStorage', async () => {
      const TestComponent = () => {
        const { user, loginAsMock } = useUser();

        return (
          <div>
            <button onClick={() => loginAsMock(123)}>Login as User 123</button>
            {user && <p>Logged in: {user.email}</p>}
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      const button = screen.getByText('Login as User 123');
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/Logged in:/)).toBeInTheDocument();
      });

      // Verificar localStorage
      const stored = localStorage.getItem('platziflix_auth_user');
      expect(stored).toBeTruthy();

      const session = JSON.parse(stored!);
      expect(session.user.id).toBe(123);
      expect(session.user.email).toBe('user123@platziflix.local');
    });

    it('should set isLoading to false after login', async () => {
      const TestComponent = () => {
        const { isLoading } = useUser();
        return <div>Loading: {isLoading.toString()}</div>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Loading: false')).toBeInTheDocument();
      });
    });
  });

  describe('Logout', () => {
    it('should logout user and clear localStorage', async () => {
      const TestComponent = () => {
        const { user, logout, loginAsMock } = useUser();

        return (
          <div>
            <button onClick={() => loginAsMock(456)}>Login</button>
            <button onClick={logout}>Logout</button>
            {user ? <p>Logged in: {user.email}</p> : <p>Not logged in</p>}
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Login
      await userEvent.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByText(/Logged in:/)).toBeInTheDocument();
      });

      // Logout
      await userEvent.click(screen.getByText('Logout'));

      await waitFor(() => {
        expect(screen.getByText('Not logged in')).toBeInTheDocument();
      });

      // Verificar localStorage está limpio
      const stored = localStorage.getItem('platziflix_auth_user');
      expect(stored).toBeNull();
    });
  });

  describe('Session Persistence', () => {
    it('should restore user from localStorage on mount', async () => {
      // Simular sesión guardada
      const session = {
        version: 1,
        user: { id: 789, email: 'user789@platziflix.local', name: 'User 789' },
        timestamp: Date.now(),
      };

      localStorage.setItem('platziflix_auth_user', JSON.stringify(session));

      const TestComponent = () => {
        const { user } = useUser();
        return user ? <p>{user.email}</p> : <p>Loading...</p>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('user789@platziflix.local')).toBeInTheDocument();
      });
    });

    it('should clear storage if version mismatch', async () => {
      // Simular sesión con versión antigua
      const session = {
        version: 0, // Versión antigua
        user: { id: 999, email: 'old@test.com', name: 'Old User' },
        timestamp: Date.now(),
      };

      localStorage.setItem('platziflix_auth_user', JSON.stringify(session));

      const TestComponent = () => {
        const { user } = useUser();
        return <p>{user ? 'Logged in' : 'Not logged in'}</p>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Not logged in')).toBeInTheDocument();
        expect(localStorage.getItem('platziflix_auth_user')).toBeNull();
      });
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is logged in', async () => {
      const TestComponent = () => {
        const { isAuthenticated, loginAsMock } = useUser();

        return (
          <div>
            <button onClick={() => loginAsMock(111)}>Login</button>
            <p>Authenticated: {isAuthenticated.toString()}</p>
          </div>
        );
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await userEvent.click(screen.getByText('Login'));

      await waitFor(() => {
        expect(screen.getByText('Authenticated: true')).toBeInTheDocument();
      });
    });

    it('should return false when user is not logged in', async () => {
      const TestComponent = () => {
        const { isAuthenticated } = useUser();
        return <p>Authenticated: {isAuthenticated.toString()}</p>;
      };

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Authenticated: false')).toBeInTheDocument();
      });
    });
  });
});
```

### Test: `/src/hooks/__tests__/useUser.test.ts`

```typescript
/**
 * Tests para useUser hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { useUser } from '@/hooks/useUser';

describe('useUser Hook', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    localStorage.clear();
  });

  it('should throw error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useUser());
    }).toThrow('useUser debe ser usado dentro de AuthProvider');
  });

  it('should return context when used inside AuthProvider', () => {
    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
  });

  it('should return authenticated user after login', async () => {
    const { result } = renderHook(() => useUser(), { wrapper });

    act(() => {
      result.current.loginAsMock(42);
    });

    await waitFor(() => {
      expect(result.current.user?.id).toBe(42);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  it('should handle logout correctly', async () => {
    const { result } = renderHook(() => useUser(), { wrapper });

    // Login primero
    act(() => {
      result.current.loginAsMock(42);
    });

    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });

    // Luego logout
    act(() => {
      result.current.logout();
    });

    await waitFor(() => {
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  it('should provide correct user data', async () => {
    const { result } = renderHook(() => useUser(), { wrapper });

    act(() => {
      result.current.loginAsMock(123);
    });

    await waitFor(() => {
      expect(result.current.user).toEqual({
        id: 123,
        email: 'user123@platziflix.local',
        name: 'User 123',
      });
    });
  });
});
```

---

## FASE 2: RATINGWIDGET

### Archivo 1: `/src/components/RatingWidget/RatingPrompt.tsx`

```typescript
/**
 * RatingPrompt Component
 * Sub-componente que muestra un prompt para invitar al usuario a calificar
 */

'use client';

import { FC } from 'react';
import styles from './RatingWidget.module.scss';

interface RatingPromptProps {
  onRate: () => void;
  isLoading?: boolean;
}

/**
 * RatingPrompt
 * Botón interactivo que invita al usuario a calificar
 * - Muestra cuando el usuario aún no ha calificado
 * - Se deshabilita durante operaciones
 */
export const RatingPrompt: FC<RatingPromptProps> = ({
  onRate,
  isLoading = false,
}) => {
  return (
    <div className={styles.prompt}>
      <p className={styles.promptText}>¿Te gustó este curso?</p>
      <button
        className={styles.promptButton}
        onClick={onRate}
        disabled={isLoading}
        aria-label="Califica este curso"
        type="button"
      >
        {isLoading ? 'Cargando...' : 'Califica ahora'}
      </button>
    </div>
  );
};
```

### Archivo 2: `/src/components/RatingWidget/RatingModal.tsx`

```typescript
/**
 * RatingModal Component
 * Modal interactivo para seleccionar y confirmar una calificación
 */

'use client';

import { FC, useState, useEffect } from 'react';
import styles from './RatingWidget.module.scss';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => void;
  initialRating?: number;
  isLoading?: boolean;
  isEditing?: boolean;
}

/**
 * Mensajes de preview según la calificación seleccionada
 */
const getPreviewMessage = (rating: number): string => {
  switch (rating) {
    case 1:
      return 'No fue para mí';
    case 2:
      return 'Podría mejorar';
    case 3:
      return 'Está bien';
    case 4:
      return '¡Muy bueno!';
    case 5:
      return '¡Excelente!';
    default:
      return '';
  }
};

export const RatingModal: FC<RatingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialRating = 0,
  isLoading = false,
  isEditing = false,
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(initialRating);
  const [hoverRating, setHoverRating] = useState<number>(0);

  // Actualizar selectedRating cuando initialRating cambia
  useEffect(() => {
    setSelectedRating(initialRating);
  }, [initialRating, isOpen]);

  if (!isOpen) return null;

  const displayRating = hoverRating || selectedRating;
  const previewMessage = getPreviewMessage(displayRating);

  const handleSubmit = () => {
    if (selectedRating > 0) {
      onSubmit(selectedRating);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // ESC para cerrar
    if (e.key === 'Escape') {
      onClose();
    }
    // ENTER para confirmar
    if (e.key === 'Enter' && selectedRating > 0 && !isLoading) {
      handleSubmit();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={styles.modalBackdrop}
        onClick={onClose}
        aria-hidden="true"
        role="presentation"
      />

      {/* Modal */}
      <div
        className={styles.modal}
        role="dialog"
        aria-labelledby="rating-modal-title"
        aria-modal="true"
        onKeyDown={handleKeyDown}
      >
        <div className={styles.modalContent}>
          <h3 id="rating-modal-title" className={styles.modalTitle}>
            {isEditing ? 'Edita tu calificación' : '¿Qué te pareció?'}
          </h3>

          {/* Interactive Stars */}
          <div className={styles.interactiveStars}>
            <div
              className={styles.starsContainer}
              role="group"
              aria-label="Selecciona una calificación del 1 al 5"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`${styles.starButton} ${
                    star <= displayRating ? styles.active : ''
                  }`}
                  onClick={() => setSelectedRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Califica con ${star} estrellas`}
                  title={`${star} estrellas`}
                  disabled={isLoading}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Preview Message */}
          {displayRating > 0 && (
            <div className={styles.modalPreview}>
              <p className={styles.previewText}>{previewMessage}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.modalActions}>
            <button
              type="button"
              className={`${styles.button} ${styles.secondary}`}
              onClick={onClose}
              disabled={isLoading}
              aria-label="Cancelar"
            >
              Cancelar
            </button>
            <button
              type="button"
              className={`${styles.button} ${styles.primary}`}
              onClick={handleSubmit}
              disabled={selectedRating === 0 || isLoading}
              aria-busy={isLoading}
              aria-label={`Confirmar calificación de ${selectedRating} estrellas`}
            >
              {isLoading ? 'Enviando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
```

### Archivo 3: `/src/components/RatingWidget/RatingWidget.tsx` (Parte 1)

```typescript
/**
 * RatingWidget Component
 * Componente principal que orquesta todo el flujo de ratings
 * - Muestra prompt para calificar
 * - Abre modal interactivo
 * - Maneja CREATE, READ, UPDATE, DELETE
 * - Gestiona estados y errores
 */

'use client';

import { FC, useEffect, useState, useCallback, useRef } from 'react';
import { useUser } from '@/hooks/useUser';
import { ratingsApi, ApiError } from '@/services/ratingsApi';
import { StarRating } from '@/components/StarRating/StarRating';
import { RatingPrompt } from './RatingPrompt';
import { RatingModal } from './RatingModal';
import styles from './RatingWidget.module.scss';

import type { CourseRating } from '@/types/rating';

interface RatingWidgetProps {
  courseId: number;
  onRatingChange?: (rating: CourseRating | null) => void;
}

type WidgetState =
  | 'idle'                // Sin rating, mostrar prompt
  | 'loading'             // Cargando datos iniciales
  | 'modal-open'          // Modal abierto
  | 'modal-loading'       // Enviando a API
  | 'showing-rating'      // Mostrar rating del usuario
  | 'delete-confirm'      // Confirmación de eliminación
  | 'error';              // Error en operación

interface WidgetData {
  userRating: CourseRating | null;
  error: string | null;
  selectedRating: number;
}

/**
 * RatingWidget
 * Componente completo para el sistema de ratings
 */
export const RatingWidget: FC<RatingWidgetProps> = ({
  courseId,
  onRatingChange,
}) => {
  const { user, isLoading: isAuthLoading } = useUser();

  const [state, setState] = useState<WidgetState>('loading');
  const [data, setData] = useState<WidgetData>({
    userRating: null,
    error: null,
    selectedRating: 0,
  });

  // Ref para evitar race conditions
  const isMountedRef = useRef(true);

  /**
   * Efecto: Cargar rating del usuario al montar o cambiar usuario
   */
  useEffect(() => {
    isMountedRef.current = true;

    if (!user || isAuthLoading) return;

    const loadUserRating = async () => {
      try {
        const rating = await ratingsApi.getUserRating(courseId, user.id);

        if (!isMountedRef.current) return;

        setData((prev) => ({
          ...prev,
          userRating: rating,
          error: null,
        }));

        setState(rating ? 'showing-rating' : 'idle');
      } catch (error) {
        if (!isMountedRef.current) return;

        // 204 No Content = usuario no ha calificado (no es error)
        if (error instanceof ApiError && error.status === 204) {
          setState('idle');
          return;
        }

        console.error('Error loading rating:', error);

        const errorMsg =
          error instanceof ApiError
            ? error.message
            : 'Error al cargar tu calificación';

        setData((prev) => ({
          ...prev,
          error: errorMsg,
        }));

        setState('error');
      }
    };

    loadUserRating();

    return () => {
      isMountedRef.current = false;
    };
  }, [courseId, user, isAuthLoading]);

  /**
   * Manejar apertura de modal
   */
  const handleOpenModal = useCallback(() => {
    setState('modal-open');
    setData((prev) => ({
      ...prev,
      selectedRating: prev.userRating?.rating ?? 0,
      error: null,
    }));
  }, []);

  /**
   * Manejar cierre de modal
   */
  const handleCloseModal = useCallback(() => {
    setState(data.userRating ? 'showing-rating' : 'idle');
    setData((prev) => ({
      ...prev,
      selectedRating: 0,
    }));
  }, [data.userRating]);

  /**
   * Manejar envío de rating (create o update)
   */
  const handleSubmitRating = useCallback(
    async (rating: number) => {
      if (!user || !isMountedRef.current) return;

      setState('modal-loading');
      setData((prev) => ({ ...prev, error: null }));

      try {
        let result: CourseRating;

        if (data.userRating) {
          // Actualizar rating existente
          result = await ratingsApi.updateRating(courseId, user.id, {
            user_id: user.id,
            rating,
          });
        } else {
          // Crear nuevo rating
          result = await ratingsApi.createRating(courseId, {
            user_id: user.id,
            rating,
          });
        }

        if (!isMountedRef.current) return;

        // Optimistic update - actualizar inmediatamente
        setData((prev) => ({
          ...prev,
          userRating: result,
          selectedRating: 0,
          error: null,
        }));

        setState('showing-rating');

        // Notificar al componente padre
        onRatingChange?.(result);

        // Feedback visual: mostrar mensaje de éxito por 2 segundos
        const successMessage = document.createElement('div');
        successMessage.className = styles.successBanner;
        successMessage.textContent = data.userRating
          ? 'Calificación actualizada'
          : 'Gracias por tu calificación';
        successMessage.setAttribute('role', 'status');
        successMessage.setAttribute('aria-live', 'polite');
        document.body.appendChild(successMessage);

        setTimeout(() => {
          successMessage.remove();
        }, 2000);
      } catch (error) {
        if (!isMountedRef.current) return;

        const errorMsg =
          error instanceof ApiError
            ? error.message
            : 'Error al enviar tu calificación';

        setData((prev) => ({
          ...prev,
          error: errorMsg,
        }));

        setState('error');
      }
    },
    [courseId, user, data.userRating, onRatingChange]
  );

  /**
   * Manejar eliminación de rating
   */
  const handleDeleteRating = useCallback(async () => {
    if (!user || !data.userRating || !isMountedRef.current) return;

    setState('modal-loading');
    setData((prev) => ({ ...prev, error: null }));

    try {
      await ratingsApi.deleteRating(courseId, user.id);

      if (!isMountedRef.current) return;

      setData((prev) => ({
        ...prev,
        userRating: null,
        error: null,
      }));

      setState('idle');
      onRatingChange?.(null);
    } catch (error) {
      if (!isMountedRef.current) return;

      const errorMsg =
        error instanceof ApiError
          ? error.message
          : 'Error al eliminar tu calificación';

      setData((prev) => ({
        ...prev,
        error: errorMsg,
      }));

      setState('error');
    }
  }, [courseId, user, data.userRating, onRatingChange]);

  /**
   * Si no hay usuario autenticado
   */
  if (!isAuthLoading && !user) {
    return (
      <div className={styles.guestMessage} role="status">
        <p>Inicia sesión para calificar este curso</p>
      </div>
    );
  }

  /**
   * Renderizar según estado actual
   */
  return (
    <div className={styles.ratingWidget}>
      {/* Error State */}
      {state === 'error' && (
        <div className={styles.errorBanner} role="alert" aria-live="polite">
          <p className={styles.errorText}>{data.error}</p>
          <button
            className={styles.retryButton}
            onClick={() => {
              setState(data.userRating ? 'showing-rating' : 'idle');
              setData((prev) => ({ ...prev, error: null }));
            }}
            type="button"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading State (fetch inicial) */}
      {(isAuthLoading || state === 'loading') && (
        <div className={styles.loadingState} aria-busy="true">
          <p>Cargando...</p>
        </div>
      )}

      {/* Idle State - Sin rating del usuario */}
      {state === 'idle' && !isAuthLoading && (
        <RatingPrompt
          onRate={handleOpenModal}
          isLoading={false}
        />
      )}

      {/* Showing Rating State - Con rating del usuario */}
      {state === 'showing-rating' && data.userRating && (
        <div className={styles.userRatingSection}>
          <div className={styles.currentRating}>
            <p className={styles.label}>Tu calificación:</p>
            <StarRating
              rating={data.userRating.rating}
              size="medium"
              readonly={true}
            />
          </div>

          <div className={styles.actions}>
            <button
              className={`${styles.button} ${styles.secondary}`}
              onClick={handleOpenModal}
              aria-label="Edita tu calificación"
              type="button"
            >
              Editar
            </button>
            <button
              className={`${styles.button} ${styles.danger}`}
              onClick={() => setState('delete-confirm')}
              aria-label="Elimina tu calificación"
              type="button"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {state === 'delete-confirm' && (
        <div
          className={styles.confirmDelete}
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-title"
        >
          <p id="delete-title">
            ¿Estás seguro de que deseas eliminar tu calificación?
          </p>
          <div className={styles.confirmActions}>
            <button
              className={`${styles.button} ${styles.secondary}`}
              onClick={() => setState('showing-rating')}
              type="button"
            >
              Cancelar
            </button>
            <button
              className={`${styles.button} ${styles.danger}`}
              onClick={handleDeleteRating}
              type="button"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      <RatingModal
        isOpen={state === 'modal-open' || state === 'modal-loading'}
        onClose={handleCloseModal}
        onSubmit={handleSubmitRating}
        initialRating={data.userRating?.rating}
        isLoading={state === 'modal-loading'}
        isEditing={!!data.userRating}
      />
    </div>
  );
};
```

### Archivo 4: `/src/components/RatingWidget/RatingWidget.module.scss`

```scss
/**
 * RatingWidget Styles
 * Estilos para todo el componente de ratings
 */

// ===== VARIABLES =====
$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$secondary-bg: rgba(255, 255, 255, 0.05);
$secondary-text: rgba(255, 255, 255, 0.8);
$error-color: #ef4444;
$success-color: #10b981;
$gold-color: #fbbf24;

// ===== MAIN WIDGET =====
.ratingWidget {
  padding: 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, transparent 100%);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin: 20px 0;
}

// ===== PROMPT STATE =====
.prompt {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.promptText {
  font-size: 16px;
  font-weight: 500;
  color: $secondary-text;
  margin: 0;
  letter-spacing: 0.3px;
}

.promptButton {
  padding: 10px 24px;
  background: $primary-gradient;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }
}

// ===== MODAL =====
.modalBackdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 999;
  animation: fadeIn 0.2s ease;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  width: 90%;
  max-width: 400px;
  background: linear-gradient(
    135deg,
    rgba(20, 20, 30, 0.95) 0%,
    rgba(30, 30, 40, 0.95) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
  animation: slideUp 0.3s ease;
}

.modalContent {
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modalTitle {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin: 0;
  text-align: center;
}

.interactiveStars {
  text-align: center;
  animation: fadeIn 0.2s ease 0.1s backwards;
}

.starsContainer {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.starButton {
  width: 50px;
  height: 50px;
  font-size: 32px;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 600;

  &:hover:not(:disabled) {
    color: $gold-color;
    border-color: $gold-color;
    transform: scale(1.1);
  }

  &:active:not(:disabled) {
    transform: scale(0.95);
  }

  &.active {
    color: $gold-color;
    border-color: $gold-color;
    background: rgba(251, 191, 36, 0.1);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  &:focus {
    outline: 2px solid #667eea;
    outline-offset: -2px;
  }
}

.modalPreview {
  background: rgba(102, 126, 234, 0.1);
  border-left: 3px solid #667eea;
  padding: 12px 16px;
  border-radius: 4px;
  text-align: center;
  animation: slideInDown 0.3s ease;
}

.previewText {
  font-size: 14px;
  color: #667eea;
  margin: 0;
  font-weight: 500;
}

.modalActions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

// ===== BUTTONS =====
.button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  font-family: inherit;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:focus {
    outline: 2px solid #667eea;
    outline-offset: 2px;
  }

  &.primary {
    background: $primary-gradient;
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(102, 126, 234, 0.3);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }
  }

  &.secondary {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
    }
  }

  &.danger {
    background: rgba(239, 68, 68, 0.1);
    color: $error-color;
    border: 1px solid rgba(239, 68, 68, 0.3);

    &:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.2);
      border-color: rgba(239, 68, 68, 0.5);
    }
  }
}

// ===== USER RATING SECTION =====
.userRatingSection {
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: fadeIn 0.3s ease;
}

.currentRating {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

// ===== ERROR STATE =====
.errorBanner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  animation: slideInDown 0.3s ease;
}

.errorText {
  color: $error-color;
  margin: 0;
  font-size: 14px;
  flex: 1;
}

.retryButton {
  padding: 6px 12px;
  background: rgba(239, 68, 68, 0.2);
  color: $error-color;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(239, 68, 68, 0.3);
  }

  &:focus {
    outline: 2px solid $error-color;
    outline-offset: 2px;
  }
}

// ===== SUCCESS BANNER =====
.successBanner {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(16, 185, 129, 0.2);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: $success-color;
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  z-index: 10000;
  animation: slideInDown 0.3s ease;
}

// ===== LOADING STATE =====
.loadingState {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.6);
  animation: fadeIn 0.3s ease;

  p {
    margin: 0;
  }
}

// ===== DELETE CONFIRM =====
.confirmDelete {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  padding: 16px;
  margin-top: 12px;
  animation: fadeIn 0.3s ease;

  p {
    color: rgba(255, 255, 255, 0.8);
    margin: 0 0 12px 0;
    font-size: 14px;
  }
}

.confirmActions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

// ===== GUEST MESSAGE =====
.guestMessage {
  text-align: center;
  padding: 20px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  color: #3b82f6;
  font-size: 14px;
  animation: fadeIn 0.3s ease;

  p {
    margin: 0;
  }
}

// ===== ANIMATIONS =====
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, -40%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// ===== RESPONSIVE =====
@media (max-width: 768px) {
  .modal {
    width: 95%;
    max-width: none;
  }

  .modalContent {
    padding: 24px 16px;
  }

  .starButton {
    width: 42px;
    height: 42px;
    font-size: 28px;
    gap: 8px;
  }

  .starsContainer {
    gap: 8px;
  }

  .actions {
    flex-direction: column;

    .button {
      width: 100%;
    }
  }

  .modalActions {
    flex-direction: column-reverse;

    .button {
      width: 100%;
    }
  }

  .errorBanner {
    flex-direction: column;
    align-items: flex-start;
  }

  .confirmActions {
    flex-direction: column-reverse;

    .button {
      width: 100%;
    }
  }

  .successBanner {
    right: 10px;
    left: 10px;
  }
}

// ===== ACCESSIBILITY =====
@media (prefers-reduced-motion: reduce) {
  .prompt,
  .modal,
  .userRatingSection,
  .errorBanner,
  .successBanner,
  .modalPreview {
    animation: none;
  }

  .button,
  .starButton,
  .promptButton {
    transition: none;
  }
}

// ===== DARK MODE (si es necesario) =====
@media (prefers-color-scheme: dark) {
  .ratingWidget {
    // Ya está optimizado para dark
  }
}
```

---

### Tests (Parte 1): `/src/components/RatingWidget/__tests__/RatingWidget.test.tsx`

```typescript
/**
 * Tests para RatingWidget
 * Cubre todos los flujos principales
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RatingWidget } from '../RatingWidget';
import { useUser } from '@/hooks/useUser';
import * as ratingsApi from '@/services/ratingsApi';

// Mocks
jest.mock('@/hooks/useUser');
jest.mock('@/services/ratingsApi');

const mockUseUser = useUser as jest.MockedFunction<typeof useUser>;
const mockRatingsApi = ratingsApi as jest.Mocked<typeof ratingsApi>;

describe('RatingWidget', () => {
  const mockCourseId = 1;
  const mockUser = { id: 42, email: 'test@test.com', name: 'Test User' };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUser.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
      login: jest.fn(),
      logout: jest.fn(),
      loginAsMock: jest.fn(),
    });
  });

  describe('Initial Load', () => {
    it('should show loading state initially', () => {
      mockRatingsApi.getUserRating.mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve(null), 100))
      );

      render(<RatingWidget courseId={mockCourseId} />);

      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('should show prompt when user has no rating', async () => {
      mockRatingsApi.getUserRating.mockResolvedValueOnce(null);

      render(<RatingWidget courseId={mockCourseId} />);

      await waitFor(() => {
        expect(screen.getByText(/Te gustó este curso/i)).toBeInTheDocument();
      });
    });

    it('should show current rating when user has rated', async () => {
      const mockRating = {
        id: 1,
        course_id: mockCourseId,
        user_id: mockUser.id,
        rating: 4,
        created_at: '2025-11-28T00:00:00',
        updated_at: '2025-11-28T00:00:00',
      };

      mockRatingsApi.getUserRating.mockResolvedValueOnce(mockRating);

      render(<RatingWidget courseId={mockCourseId} />);

      await waitFor(() => {
        expect(screen.getByText('Tu calificación:')).toBeInTheDocument();
      });
    });

    it('should show guest message when not authenticated', async () => {
      mockUseUser.mockReturnValueOnce({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        login: jest.fn(),
        logout: jest.fn(),
        loginAsMock: jest.fn(),
      });

      render(<RatingWidget courseId={mockCourseId} />);

      expect(
        screen.getByText(/Inicia sesión para calificar/i)
      ).toBeInTheDocument();
    });
  });

  describe('Modal Interaction', () => {
    it('should open modal when user clicks rate button', async () => {
      mockRatingsApi.getUserRating.mockResolvedValueOnce(null);

      const user = userEvent.setup();
      render(<RatingWidget courseId={mockCourseId} />);

      const rateButton = await screen.findByRole('button', {
        name: /Califica ahora/i,
      });
      await user.click(rateButton);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should close modal when clicking cancel', async () => {
      mockRatingsApi.getUserRating.mockResolvedValueOnce(null);

      const user = userEvent.setup();
      render(<RatingWidget courseId={mockCourseId} />);

      const rateButton = await screen.findByRole('button', {
        name: /Califica ahora/i,
      });
      await user.click(rateButton);

      const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });

    it('should allow star selection in modal', async () => {
      mockRatingsApi.getUserRating.mockResolvedValueOnce(null);

      const user = userEvent.setup();
      render(<RatingWidget courseId={mockCourseId} />);

      const rateButton = await screen.findByRole('button', {
        name: /Califica ahora/i,
      });
      await user.click(rateButton);

      const fiveStarButton = screen.getByRole('button', {
        name: /Califica con 5 estrellas/i,
      });
      await user.click(fiveStarButton);

      // El botón debe estar activo (clase .active)
      expect(fiveStarButton).toHaveClass('active');
    });
  });

  describe('Create Rating', () => {
    it('should create new rating successfully', async () => {
      mockRatingsApi.getUserRating.mockResolvedValueOnce(null);

      const newRating = {
        id: 1,
        course_id: mockCourseId,
        user_id: mockUser.id,
        rating: 5,
        created_at: '2025-11-28T00:00:00',
        updated_at: '2025-11-28T00:00:00',
      };

      mockRatingsApi.createRating.mockResolvedValueOnce(newRating);

      const user = userEvent.setup();
      const onRatingChange = jest.fn();

      render(
        <RatingWidget
          courseId={mockCourseId}
          onRatingChange={onRatingChange}
        />
      );

      // Abirir modal
      const rateButton = await screen.findByRole('button', {
        name: /Califica ahora/i,
      });
      await user.click(rateButton);

      // Seleccionar 5 estrellas
      const fiveStarButton = screen.getByRole('button', {
        name: /Califica con 5 estrellas/i,
      });
      await user.click(fiveStarButton);

      // Confirmar
      const confirmButton = screen.getByRole('button', {
        name: /Confirmar/i,
      });
      await user.click(confirmButton);

      // Verificar que se llamó a createRating
      await waitFor(() => {
        expect(mockRatingsApi.createRating).toHaveBeenCalledWith(
          mockCourseId,
          { user_id: mockUser.id, rating: 5 }
        );
        expect(onRatingChange).toHaveBeenCalledWith(newRating);
      });

      // Verificar que se muestra el rating
      expect(screen.getByText('Tu calificación:')).toBeInTheDocument();
    });
  });

  describe('Update Rating', () => {
    it('should update existing rating', async () => {
      const existingRating = {
        id: 1,
        course_id: mockCourseId,
        user_id: mockUser.id,
        rating: 3,
        created_at: '2025-11-28T00:00:00',
        updated_at: '2025-11-28T00:00:00',
      };

      mockRatingsApi.getUserRating.mockResolvedValueOnce(existingRating);

      const updatedRating = { ...existingRating, rating: 5 };
      mockRatingsApi.updateRating.mockResolvedValueOnce(updatedRating);

      const user = userEvent.setup();
      const onRatingChange = jest.fn();

      render(
        <RatingWidget
          courseId={mockCourseId}
          onRatingChange={onRatingChange}
        />
      );

      // Esperar a que se cargue el rating actual
      await waitFor(() => {
        expect(screen.getByText('Tu calificación:')).toBeInTheDocument();
      });

      // Click en Editar
      const editButton = screen.getByRole('button', { name: /Editar/i });
      await user.click(editButton);

      // Seleccionar 5 estrellas
      const fiveStarButton = screen.getByRole('button', {
        name: /Califica con 5 estrellas/i,
      });
      await user.click(fiveStarButton);

      // Confirmar
      const confirmButton = screen.getByRole('button', {
        name: /Confirmar/i,
      });
      await user.click(confirmButton);

      // Verificar que se llamó a updateRating
      await waitFor(() => {
        expect(mockRatingsApi.updateRating).toHaveBeenCalledWith(
          mockCourseId,
          mockUser.id,
          { user_id: mockUser.id, rating: 5 }
        );
        expect(onRatingChange).toHaveBeenCalledWith(updatedRating);
      });
    });
  });

  describe('Delete Rating', () => {
    it('should delete rating successfully', async () => {
      const existingRating = {
        id: 1,
        course_id: mockCourseId,
        user_id: mockUser.id,
        rating: 4,
        created_at: '2025-11-28T00:00:00',
        updated_at: '2025-11-28T00:00:00',
      };

      mockRatingsApi.getUserRating.mockResolvedValueOnce(existingRating);
      mockRatingsApi.deleteRating.mockResolvedValueOnce(undefined);

      const user = userEvent.setup();
      const onRatingChange = jest.fn();

      render(
        <RatingWidget
          courseId={mockCourseId}
          onRatingChange={onRatingChange}
        />
      );

      // Esperar a que cargue el rating
      await waitFor(() => {
        expect(screen.getByText('Tu calificación:')).toBeInTheDocument();
      });

      // Click en Eliminar
      const deleteButton = screen.getByRole('button', {
        name: /Eliminar/i,
      });
      await user.click(deleteButton);

      // Confirmar eliminación
      const confirmButton = screen.getByRole('button', {
        name: /Eliminar/i,
      });
      await user.click(confirmButton);

      // Verificar que se llamó a deleteRating
      await waitFor(() => {
        expect(mockRatingsApi.deleteRating).toHaveBeenCalledWith(
          mockCourseId,
          mockUser.id
        );
        expect(onRatingChange).toHaveBeenCalledWith(null);
      });

      // Verificar que vuelve a mostrar el prompt
      expect(screen.getByText(/Te gustó este curso/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error message on API failure', async () => {
      mockRatingsApi.getUserRating.mockResolvedValueOnce(null);
      mockRatingsApi.createRating.mockRejectedValueOnce(
        new ratingsApi.ApiError('Network error', 0, 'NETWORK_ERROR')
      );

      const user = userEvent.setup();
      render(<RatingWidget courseId={mockCourseId} />);

      const rateButton = await screen.findByRole('button', {
        name: /Califica ahora/i,
      });
      await user.click(rateButton);

      const fiveStarButton = screen.getByRole('button', {
        name: /Califica con 5 estrellas/i,
      });
      await user.click(fiveStarButton);

      const confirmButton = screen.getByRole('button', {
        name: /Confirmar/i,
      });
      await user.click(confirmButton);

      // Verificar que se muestre el error
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    it('should allow retry after error', async () => {
      mockRatingsApi.getUserRating.mockResolvedValueOnce(null);
      mockRatingsApi.createRating
        .mockRejectedValueOnce(
          new ratingsApi.ApiError('Network error', 0)
        )
        .mockResolvedValueOnce({
          id: 1,
          course_id: mockCourseId,
          user_id: mockUser.id,
          rating: 5,
          created_at: '2025-11-28T00:00:00',
          updated_at: '2025-11-28T00:00:00',
        });

      const user = userEvent.setup();
      render(<RatingWidget courseId={mockCourseId} />);

      const rateButton = await screen.findByRole('button', {
        name: /Califica ahora/i,
      });
      await user.click(rateButton);

      const fiveStarButton = screen.getByRole('button', {
        name: /Califica con 5 estrellas/i,
      });
      await user.click(fiveStarButton);

      let confirmButton = screen.getByRole('button', {
        name: /Confirmar/i,
      });
      await user.click(confirmButton);

      // Esperar error
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      // Click retry
      const retryButton = screen.getByRole('button', { name: /Reintentar/i });
      await user.click(retryButton);

      // Debe volver a mostrar el prompt
      expect(screen.getByText(/Te gustó este curso/i)).toBeInTheDocument();
    });
  });
});
```

---

## FASE 3: INTEGRACIÓN

### Archivo: `/src/components/CourseDetail/CourseDetail.tsx` (MODIFICADO)

```typescript
/**
 * CourseDetail Component
 * MODIFICADO PARA INCLUIR RATINGWIDGET
 * Cambios:
 * - Agregar 'use client' al inicio
 * - Importar RatingWidget
 * - Agregar manejo de stats
 * - Agregar onRatingChange callback
 */

'use client';

import { FC, useState, useCallback } from 'react';
import Link from 'next/link';
import { CourseDetail as CourseDetailType } from '@/types';
import { StarRating } from '@/components/StarRating/StarRating';
import { RatingWidget } from '@/components/RatingWidget/RatingWidget';
import { ratingsApi } from '@/services/ratingsApi';
import styles from './CourseDetail.module.scss';

import type { CourseRating, RatingStats } from '@/types/rating';

interface CourseDetailComponentProps {
  course: CourseDetailType;
  initialStats?: RatingStats;
}

export const CourseDetailComponent: FC<CourseDetailComponentProps> = ({
  course,
  initialStats,
}) => {
  const [stats, setStats] = useState<RatingStats>({
    average_rating: initialStats?.average_rating ?? course.average_rating ?? 0,
    total_ratings: initialStats?.total_ratings ?? course.total_ratings ?? 0,
  });

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const totalDuration = course.classes.reduce((acc, cls) => acc + cls.duration, 0);

  /**
   * Callback cuando cambia el rating
   * Refetch stats después de cambio
   */
  const handleRatingChange = useCallback(
    async (rating: CourseRating | null) => {
      try {
        // Refetch stats después de cambio de rating
        const updatedStats = await ratingsApi.getRatingStats(course.id);
        setStats(updatedStats);
      } catch (error) {
        console.error('Error updating stats:', error);
        // Si falla, mantener stats actuales (sin mostrar error al usuario)
      }
    },
    [course.id]
  );

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <div className={styles.navigation}>
        <Link href="/" className={styles.backButton}>
          ← Volver a cursos
        </Link>
      </div>

      {/* Course Header */}
      <div className={styles.header}>
        <div className={styles.thumbnailContainer}>
          <img
            src={course.thumbnail}
            alt={course.title}
            className={styles.thumbnail}
          />
        </div>

        <div className={styles.courseInfo}>
          <h1 className={styles.title}>{course.title}</h1>
          <p className={styles.teacher}>Por {course.teacher}</p>
          <p className={styles.description}>{course.description}</p>

          {/* Rating Section - ReadOnly */}
          <div className={styles.stats}>
            <div className={styles.ratingContainer}>
              <StarRating
                rating={stats.average_rating}
                totalRatings={stats.total_ratings}
                showCount={true}
                size="medium"
                readonly={true}
              />
            </div>
            <span className={styles.duration}>
              Duración total: {formatDuration(totalDuration)}
            </span>
            <span className={styles.classCount}>
              {course.classes.length} clases
            </span>
          </div>
        </div>
      </div>

      {/* NEW: RatingWidget Interactive Section */}
      <section className={styles.ratingSection} aria-labelledby="rating-title">
        <h2 id="rating-title" className={styles.sectionTitle}>
          Tu opinión
        </h2>
        <RatingWidget
          courseId={course.id}
          onRatingChange={handleRatingChange}
        />
      </section>

      {/* Classes Section */}
      <div className={styles.classesSection}>
        <h2 className={styles.sectionTitle}>Contenido del curso</h2>
        <div className={styles.classesList}>
          {course.classes.map((cls, index) => (
            <Link
              href={`/classes/${cls.id}`}
              key={cls.id}
              className={styles.classItem}
            >
              <div className={styles.classNumber}>
                {(index + 1).toString().padStart(2, '0')}
              </div>
              <div className={styles.classInfo}>
                <h3 className={styles.classTitle}>{cls.title}</h3>
                <p className={styles.classDescription}>{cls.description}</p>
                <span className={styles.classDuration}>
                  {formatDuration(cls.duration)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

Fin de ejemplos de código. Consulta el documento principal para la guía completa de implementación.
