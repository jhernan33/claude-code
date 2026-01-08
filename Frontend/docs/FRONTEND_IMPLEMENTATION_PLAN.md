# Plan de Implementación Frontend - Sistema de Ratings

**Documento de Arquitectura y Guía de Ejecución**
**Estado**: 40% completado (necesita integración completa)
**Fecha**: 2025-11-28
**Estimación total**: 11-14 horas

---

## 1. ANÁLISIS DE BRECHA

### 1.1 Estado Actual (60% Completado)

#### Backend - 100% COMPLETADO
- 6 endpoints API totalmente funcionales:
  - `POST /courses/{course_id}/ratings` - Crear/actualizar rating
  - `GET /courses/{course_id}/ratings` - Listar ratings
  - `GET /courses/{course_id}/ratings/stats` - Estadísticas agregadas
  - `GET /courses/{course_id}/ratings/user/{user_id}` - Rating del usuario
  - `PUT /courses/{course_id}/ratings/{user_id}` - Actualizar rating
  - `DELETE /courses/{course_id}/ratings/{user_id}` - Eliminar rating

- 33 test cases pasando (99.8% coverage en rating service)
- Base de datos migrada con tabla `course_ratings` (constraints, soft delete, índices)

#### Frontend - 60% COMPLETADO
```
✅ IMPLEMENTADO:
├── StarRating component (readonly)
│   ├── Renderiza 5 estrellas con estados (empty/half/full)
│   ├── Soporta decimales y mostrar contador
│   ├── Accesibilidad completa (aria-labels)
│   └── Tests unitarios ✅
├── ratingsApi service (CRUD completo)
│   ├── 6 funciones para todas las operaciones
│   ├── Manejo de errores con ApiError
│   ├── Timeout y retry logic
│   └── Type-safe con interfaces completas
├── Visualización en Course cards
│   ├── StarRating en grid de cursos
│   ├── Muestra promedio y contador
│   └── Only read-only
└── Types completos
    ├── CourseRating, RatingRequest, RatingStats
    ├── Type guards para validación
    └── ApiError custom

❌ FALTA (40% restante):
├── AUTENTICACIÓN (3-4 horas)
│   ├── UserContext y Provider
│   ├── useUser hook
│   ├── Persistencia de sesión
│   ├── Mock para desarrollo
│   └── Tests (unit + integration)
│
├── RATINGWIDGET INTERACTIVO (8-10 horas)
│   ├── Componente RatingWidget (editable)
│   ├── Modal de confirmación (RatingModal)
│   ├── Estados complejos (loading/error/success)
│   ├── Manejo optimista de UI
│   ├── Validación e integración con ratingsApi
│   └── Tests exhaustivos
│
└── INTEGRACIÓN COURSEDETAIL (2-3 horas)
    ├── Montaje de RatingWidget en CourseDetail
    ├── Flujo de usuario completo
    ├── Sincronización de estado
    ├── UX improvements (feedback visual)
    └── Tests de integración
```

### 1.2 Dependencias Bloqueantes

1. **AUTENTICACIÓN** → Bloqueante CRÍTICA
   - Sin usuario autenticado, no hay `user_id`
   - RatingWidget necesita saber quién es el usuario
   - Solución: UserContext + mock para dev

2. **COURSEDETAIL** → Requiere autenticación
   - CourseDetail es page component (Server Component)
   - Necesita convertirse a Client Component para state management
   - Requiere RatingWidget integrado

### 1.3 Impacto de Cada Componente Faltante

| Componente | Impacto | Prioridad | Blockers |
|-----------|--------|----------|----------|
| UserContext | Permite saber quién está usando la app | CRÍTICA | Ninguno |
| useUser hook | Hook para acceder al usuario en cualquier componente | ALTA | UserContext |
| RatingWidget | Permite al usuario interactuar (calificar) | CRÍTICA | useUser + ratingsApi |
| RatingModal | Confirmar acción y feedback visual | ALTA | RatingWidget |
| CourseDetail integration | Mostrar RatingWidget en contexto correcto | ALTA | RatingWidget |

---

## 2. ARQUITECTURA DE SOLUCIÓN FRONTEND

### 2.1 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                      Layout (Root)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  AuthProvider (UserContext)                          │  │
│  │  ┌──────────────────────────────────────────────┐   │  │
│  │  │  Page Router                                 │   │  │
│  │  │  ┌────────────────────────────────────────┐ │   │  │
│  │  │  │ /course/[slug] (Server Component)      │ │   │  │
│  │  │  │                                        │ │   │  │
│  │  │  │ CourseDetail (Client Component)       │ │   │  │
│  │  │  │ ┌──────────────────────────────────┐  │ │   │  │
│  │  │  │ │ Course Info Section              │  │ │   │  │
│  │  │  │ │ - Título, descripción, profesor │  │ │   │  │
│  │  │  │ │ - StarRating (readonly)          │  │ │   │  │
│  │  │  │ └──────────────────────────────────┘  │ │   │  │
│  │  │  │ ┌──────────────────────────────────┐  │ │   │  │
│  │  │  │ │ RatingWidget (editable)         │  │ │   │  │
│  │  │  │ │ - ShowRatingPrompt              │  │ │   │  │
│  │  │  │ │ - RatingModal (en overlay)      │  │ │   │  │
│  │  │  │ │ - Usa: useUser + ratingsApi     │  │ │   │  │
│  │  │  │ │ - Estados: idle/loading/success │  │ │   │  │
│  │  │  │ └──────────────────────────────────┘  │ │   │  │
│  │  │  │ ┌──────────────────────────────────┐  │ │   │  │
│  │  │  │ │ Classes Section                  │  │ │   │  │
│  │  │  │ │ - Lista de clases/lecciones      │  │ │   │  │
│  │  │  │ └──────────────────────────────────┘  │ │   │  │
│  │  │  └────────────────────────────────────────┘ │   │  │
│  │  │                                            │   │  │
│  │  │ Home (/page)                              │   │  │
│  │  │ ┌──────────────────────────────────────┐  │   │  │
│  │  │ │ Course Grid                          │  │   │  │
│  │  │ │ ┌──────┐ ┌──────┐ ┌──────┐          │  │   │  │
│  │  │ │ │Course│ │Course│ │Course│ ...      │  │   │  │
│  │  │ │ │Card  │ │Card  │ │Card  │ (readonly)│  │   │  │
│  │  │ │ └──────┘ └──────┘ └──────┘          │  │   │  │
│  │  │ └──────────────────────────────────────┘  │   │  │
│  │  └──────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

Contextos & Hooks:
- UserContext (para autenticación)
  └─ useUser() hook → obtener user actual
```

### 2.2 Flujo de Datos Completo

#### Caso 1: Usuario Abre Curso Detail
```
1. User visits /course/[slug]
   ├─ Page component: fetch course data (server-side)
   ├─ Render CourseDetail (client component)
   │  └─ useUser() hook → obtiene user_id
   │     └─ Si user_id existe:
   │        ├─ Fetch user's rating via ratingsApi.getUserRating()
   │        ├─ Show current rating o prompt
   │        └─ Show RatingWidget
   │
   └─ Render Course info + StarRating (readonly)
      └─ Fetch stats via ratingsApi.getRatingStats()

State Management (CourseDetail):
- courseData: CourseDetail (from parent/server)
- currentUser: User (from useUser)
- userRating: CourseRating | null (from API)
- ratingStats: RatingStats (from API)
- isLoadingRating: boolean
- ratingError: string | null
```

#### Caso 2: Usuario Califica un Curso
```
1. User clicks "Rate this course" button
   ├─ Open RatingModal
   │
2. User selects rating (1-5 stars)
   ├─ Show live preview
   │
3. User clicks "Submit"
   ├─ RatingWidget: setState({ isLoading: true })
   │
4. RatingWidget calls:
   ├─ IF user has existing rating → ratingsApi.updateRating()
   │  └─ PUT /courses/{courseId}/ratings/{userId}
   │
   └─ ELSE → ratingsApi.createRating()
      └─ POST /courses/{courseId}/ratings

5. On success:
   ├─ Optimistic update (immediate UI feedback)
   ├─ Fetch updated stats
   ├─ Show success message
   ├─ Close modal
   └─ Refresh user rating in CourseDetail

6. On error:
   ├─ Show error message
   ├─ Allow retry
   └─ Preserve selected rating for user
```

#### Caso 3: Usuario Borra su Rating
```
1. User sees their current rating + "Delete" button
   ├─ Open confirmation modal
   │
2. User confirms deletion
   ├─ RatingWidget: setState({ isLoading: true })
   │
3. Call ratingsApi.deleteRating()
   └─ DELETE /courses/{courseId}/ratings/{userId}

4. On success:
   ├─ Optimistic update
   ├─ Fetch updated stats
   ├─ Show success message
   └─ Re-show rating prompt

5. On error:
   ├─ Show error
   ├─ Keep current rating visible
   └─ Allow retry
```

### 2.3 Estados y Transiciones

```
RATINGWIDGET STATE MACHINE:

┌─────────────┐
│   IDLE      │ (inicial, sin rating del usuario)
│  (Prompt)   │
└──────┬──────┘
       │ onClick "Rate"
       ▼
┌─────────────────┐
│  MODAL_OPEN     │ (mostrar modal de selección)
│ (Seleccionar)   │
└──────┬──────────┘
       │ onChange star rating
       ▼
┌─────────────────┐
│ PREVIEW_RATING  │ (mostrar preview de selección)
│ (Preview stars) │
└──────┬──────────┘
       │ onClick "Submit"
       ▼
┌─────────────────┐
│   LOADING       │ (enviando a API)
│ (Spinner)       │
└──────┬──────────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
 SUCCESS ERROR
   │       │
   │      ▼
   │  ┌──────────┐
   │  │ERROR_MSG │ (mostrar error, opción retry)
   │  └────┬─────┘
   │       │ onClick "Retry"
   │       └──────────────┐
   │                      │
   ├─────────────────────┘
   │
   ▼
┌──────────────┐
│ SHOWING      │ (mostrar rating del usuario)
│ USER_RATING  │
├──────────────┤
│ Current: ★★★ │
│ [Delete btn]  │
│ [Edit btn]    │
└──────┬───────┘
       │ onClick "Edit"
       └─────────────┐
                     │
                     ▼
              (volver a MODAL_OPEN)

       │ onClick "Delete"
       ▼
┌──────────────────┐
│ DELETE_CONFIRM   │ (confirmar eliminación)
└────────┬─────────┘
         │ onClick "Confirm"
         ▼
      LOADING → SUCCESS/ERROR
```

### 2.4 Estructura de Archivos Propuesta

```
Frontend/src/
├── app/
│   ├── layout.tsx ← MODIFICAR (agregar AuthProvider)
│   ├── course/
│   │   └── [slug]/
│   │       └── page.tsx ← MODIFICAR (CourseDetail como client component)
│   └── ...
│
├── components/
│   ├── StarRating/ (✅ existe)
│   │   ├── StarRating.tsx
│   │   ├── StarRating.module.scss
│   │   └── __tests__/
│   │       └── StarRating.test.tsx
│   │
│   ├── CourseDetail/ (✅ existe, necesita mods)
│   │   ├── CourseDetail.tsx ← MODIFICAR (agregar RatingWidget)
│   │   ├── CourseDetail.module.scss
│   │   └── __tests__/
│   │       └── CourseDetail.test.tsx ← AGREGAR
│   │
│   ├── RatingWidget/ (❌ CREAR)
│   │   ├── RatingWidget.tsx ← NUEVO
│   │   ├── RatingWidget.module.scss ← NUEVO
│   │   ├── RatingPrompt.tsx ← NUEVO (sub-componente)
│   │   ├── RatingModal.tsx ← NUEVO (sub-componente)
│   │   └── __tests__/
│   │       ├── RatingWidget.test.tsx ← NUEVO
│   │       ├── RatingPrompt.test.tsx ← NUEVO
│   │       └── RatingModal.test.tsx ← NUEVO
│   │
│   └── ... (otros componentes)
│
├── context/ (❌ CREAR)
│   ├── AuthContext.tsx ← NUEVO (UserContext)
│   ├── AuthProvider.tsx ← NUEVO
│   └── __tests__/
│       └── AuthContext.test.tsx ← NUEVO
│
├── hooks/ (❌ CREAR)
│   ├── useUser.ts ← NUEVO
│   └── __tests__/
│       └── useUser.test.ts ← NUEVO
│
├── services/
│   ├── ratingsApi.ts (✅ existe)
│   └── authService.ts ← NUEVO (mock para dev)
│
├── types/
│   ├── index.ts (✅ existe)
│   ├── rating.ts (✅ existe)
│   └── auth.ts ← NUEVO
│
└── styles/ (✅ existe)
```

---

## 3. FASE 1: AUTENTICACIÓN (3-4 HORAS)

### 3.1 Objetivo
Implementar sistema de autenticación básico que permite identificar el usuario y proporciona acceso a `user_id` en todos los componentes.

### 3.2 Requerimientos
- UserContext que mantiene el estado del usuario actual
- useUser hook para acceder al usuario desde cualquier componente
- Persistencia de sesión (localStorage) para dev
- Mock de usuario para permitir desarrollo sin backend de auth
- Integración con layout root

### 3.3 Implementación Paso a Paso

#### Paso 3.3.1: Crear tipos de autenticación

```typescript
// Frontend/src/types/auth.ts

export interface User {
  id: number;           // user_id que necesitan los ratings
  email: string;
  name: string;
  avatar?: string;
  // Otros campos según se necesite
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  // Mock para desarrollo
  loginAsMock: (userId: number) => void;
}
```

#### Paso 3.3.2: Crear AuthContext

```typescript
// Frontend/src/context/AuthContext.tsx

'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import type { User, AuthContextType } from '@/types/auth';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'platziflix_user';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario del localStorage en mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      }
    } catch (error) {
      console.error('Error loading user from storage:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // TODO: Llamar a backend cuando esté listo
      // Por ahora, mock simple
      const mockUser: User = {
        id: 42,
        email,
        name: email.split('@')[0],
      };
      setUser(mockUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const loginAsMock = useCallback((userId: number) => {
    const mockUser: User = {
      id: userId,
      email: `user${userId}@platziflix.local`,
      name: `User ${userId}`,
    };
    setUser(mockUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUser));
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

#### Paso 3.3.3: Crear useUser hook

```typescript
// Frontend/src/hooks/useUser.ts

'use client';

import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import type { AuthContextType } from '@/types/auth';

/**
 * Hook para acceder al contexto de autenticación
 * Lanza error si se usa fuera de AuthProvider
 */
export const useUser = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useUser debe ser usado dentro de AuthProvider');
  }

  return context;
};
```

#### Paso 3.3.4: Envolver Layout con AuthProvider

```typescript
// Frontend/src/app/layout.tsx
// MODIFICAR EXISTENTE

import { AuthProvider } from '@/context/AuthProvider';
// ... otros imports

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

### 3.4 Testing - Autenticación

#### Tests para AuthContext

```typescript
// Frontend/src/context/__tests__/AuthContext.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, AuthContext } from '@/context/AuthContext';

describe('AuthContext', () => {
  it('should initialize with null user', () => {
    let contextValue;
    const TestComponent = () => {
      contextValue = useContext(AuthContext);
      return <div>Test</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(contextValue?.user).toBeNull();
    expect(contextValue?.isAuthenticated).toBe(false);
  });

  it('should persist user in localStorage', async () => {
    const TestComponent = () => {
      const { loginAsMock } = useUser();
      return (
        <button onClick={() => loginAsMock(123)}>
          Login
        </button>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const button = screen.getByText('Login');
    await userEvent.click(button);

    await waitFor(() => {
      const stored = localStorage.getItem('platziflix_user');
      expect(stored).toBeTruthy();
      const user = JSON.parse(stored!);
      expect(user.id).toBe(123);
    });
  });

  // Más tests...
});
```

#### Tests para useUser hook

```typescript
// Frontend/src/hooks/__tests__/useUser.test.ts

import { renderHook, act } from '@testing-library/react';
import { AuthProvider } from '@/context/AuthContext';
import { useUser } from '@/hooks/useUser';

describe('useUser hook', () => {
  it('should throw error when used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useUser());
    }).toThrow('useUser debe ser usado dentro de AuthProvider');
  });

  it('should return context when used inside AuthProvider', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useUser(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should return authenticated user when logged in', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useUser(), { wrapper });

    act(() => {
      result.current.loginAsMock(42);
    });

    expect(result.current.user?.id).toBe(42);
    expect(result.current.isAuthenticated).toBe(true);
  });
});
```

### 3.5 Checklist Fase 1

- [ ] Crear `/src/types/auth.ts` con interfaces User y AuthContextType
- [ ] Crear `/src/context/AuthContext.tsx` con AuthProvider
- [ ] Crear `/src/hooks/useUser.ts` hook
- [ ] Modificar `/src/app/layout.tsx` para envolver con AuthProvider
- [ ] Crear tests para AuthContext
- [ ] Crear tests para useUser hook
- [ ] Validar en dev que localStorage persiste usuario
- [ ] Validar que useUser puede accederse desde cualquier componente

---

## 4. FASE 2: RATINGWIDGET INTERACTIVO (8-10 HORAS)

### 4.1 Objetivo
Crear componente RatingWidget que permite al usuario ver, crear, actualizar y eliminar ratings con UI interactiva y manejo completo de estados.

### 4.2 Componentes a Crear

#### 4.2.1 RatingPrompt (Sub-componente)

Botón/prompt para invitar al usuario a calificar.

```typescript
// Frontend/src/components/RatingWidget/RatingPrompt.tsx

'use client';

import { FC } from 'react';
import styles from './RatingWidget.module.scss';

interface RatingPromptProps {
  onRate: () => void;
  isLoading?: boolean;
}

export const RatingPrompt: FC<RatingPromptProps> = ({ onRate, isLoading = false }) => {
  return (
    <div className={styles.prompt}>
      <p className={styles.promptText}>¿Te gustó este curso?</p>
      <button
        className={styles.promptButton}
        onClick={onRate}
        disabled={isLoading}
        aria-label="Califica este curso"
      >
        {isLoading ? 'Cargando...' : 'Califica ahora'}
      </button>
    </div>
  );
};
```

#### 4.2.2 RatingModal (Sub-componente)

Modal para seleccionar y confirmar rating.

```typescript
// Frontend/src/components/RatingWidget/RatingModal.tsx

'use client';

import { FC, useState } from 'react';
import { StarRating } from '@/components/StarRating/StarRating';
import styles from './RatingWidget.module.scss';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number) => void;
  initialRating?: number;
  isLoading?: boolean;
  isEditing?: boolean;
}

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

  if (!isOpen) return null;

  const displayRating = hoverRating || selectedRating;

  return (
    <>
      {/* Backdrop */}
      <div
        className={styles.modalBackdrop}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={styles.modal}
        role="dialog"
        aria-labelledby="rating-modal-title"
        aria-modal="true"
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
              aria-label="Selecciona una calificación"
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  className={`${styles.starButton} ${
                    star <= displayRating ? styles.active : ''
                  }`}
                  onClick={() => setSelectedRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Califica con ${star} estrella${star !== 1 ? 's' : ''}`}
                  title={`${star} estrella${star !== 1 ? 's' : ''}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          {selectedRating > 0 && (
            <div className={styles.modalPreview}>
              <p className={styles.previewText}>
                {selectedRating <= 2 && 'No fue para mí'}
                {selectedRating === 3 && 'Está bien'}
                {selectedRating === 4 && '¡Muy bueno!'}
                {selectedRating === 5 && '¡Excelente!'}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className={styles.modalActions}>
            <button
              className={`${styles.button} ${styles.secondary}`}
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              className={`${styles.button} ${styles.primary}`}
              onClick={() => onSubmit(selectedRating)}
              disabled={selectedRating === 0 || isLoading}
              aria-busy={isLoading}
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

#### 4.2.3 RatingWidget (Componente Principal)

Componente que orquesta todo el flujo de ratings.

```typescript
// Frontend/src/components/RatingWidget/RatingWidget.tsx

'use client';

import { FC, useEffect, useState, useCallback } from 'react';
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
  | 'idle'
  | 'loading'
  | 'modal-open'
  | 'modal-loading'
  | 'success'
  | 'error'
  | 'showing-rating'
  | 'delete-confirm';

interface WidgetData {
  userRating: CourseRating | null;
  error: string | null;
  selectedRating: number;
}

export const RatingWidget: FC<RatingWidgetProps> = ({ courseId, onRatingChange }) => {
  const { user, isLoading: isAuthLoading } = useUser();

  const [state, setState] = useState<WidgetState>('idle');
  const [data, setData] = useState<WidgetData>({
    userRating: null,
    error: null,
    selectedRating: 0,
  });

  // Cargar rating del usuario al montar
  useEffect(() => {
    if (!user || isAuthLoading) return;

    const loadUserRating = async () => {
      try {
        const rating = await ratingsApi.getUserRating(courseId, user.id);
        setData((prev) => ({
          ...prev,
          userRating: rating,
        }));
        setState(rating ? 'showing-rating' : 'idle');
      } catch (error) {
        if (error instanceof ApiError && error.status === 204) {
          // No content = usuario no ha calificado
          setState('idle');
        } else {
          console.error('Error loading rating:', error);
          setData((prev) => ({
            ...prev,
            error: 'Error al cargar tu calificación. Intenta de nuevo.',
          }));
        }
      }
    };

    loadUserRating();
  }, [courseId, user, isAuthLoading]);

  // Manejar apertura de modal
  const handleOpenModal = useCallback(() => {
    setState('modal-open');
    setData((prev) => ({
      ...prev,
      selectedRating: prev.userRating?.rating ?? 0,
    }));
  }, []);

  // Manejar cierre de modal
  const handleCloseModal = useCallback(() => {
    setState(data.userRating ? 'showing-rating' : 'idle');
    setData((prev) => ({
      ...prev,
      selectedRating: 0,
    }));
  }, [data.userRating]);

  // Manejar envío de rating
  const handleSubmitRating = useCallback(async (rating: number) => {
    if (!user) return;

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

      setData((prev) => ({
        ...prev,
        userRating: result,
        selectedRating: 0,
      }));

      setState('showing-rating');

      // Notificar al padre
      onRatingChange?.(result);

      // Mostrar feedback visual
      setTimeout(() => {
        // El éxito se mostrará con el estado 'showing-rating'
      }, 300);
    } catch (error) {
      const errorMsg = error instanceof ApiError
        ? error.message
        : 'Error al enviar tu calificación';

      setData((prev) => ({
        ...prev,
        error: errorMsg,
      }));

      setState('error');
    }
  }, [courseId, user, data.userRating, onRatingChange]);

  // Manejar eliminación de rating
  const handleDeleteRating = useCallback(async () => {
    if (!user || !data.userRating) return;

    setState('modal-loading');
    setData((prev) => ({ ...prev, error: null }));

    try {
      await ratingsApi.deleteRating(courseId, user.id);

      setData((prev) => ({
        ...prev,
        userRating: null,
        error: null,
      }));

      setState('idle');
      onRatingChange?.(null);
    } catch (error) {
      const errorMsg = error instanceof ApiError
        ? error.message
        : 'Error al eliminar tu calificación';

      setData((prev) => ({
        ...prev,
        error: errorMsg,
      }));

      setState('error');
    }
  }, [courseId, user, data.userRating, onRatingChange]);

  // Si no hay usuario autenticado
  if (!user) {
    return (
      <div className={styles.guestMessage}>
        <p>Inicia sesión para calificar este curso</p>
      </div>
    );
  }

  // Renderizar según estado
  return (
    <div className={styles.ratingWidget}>
      {/* Error State */}
      {state === 'error' && (
        <div className={styles.errorBanner} role="alert">
          <p className={styles.errorText}>{data.error}</p>
          <button
            className={styles.retryButton}
            onClick={() => {
              setState(data.userRating ? 'showing-rating' : 'idle');
              setData((prev) => ({ ...prev, error: null }));
            }}
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Loading State (fetch inicial) */}
      {(isAuthLoading || state === 'loading') && (
        <div className={styles.loadingState}>
          <p>Cargando...</p>
        </div>
      )}

      {/* Idle State - Sin rating */}
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
            >
              Editar
            </button>
            <button
              className={`${styles.button} ${styles.danger}`}
              onClick={() => setState('delete-confirm')}
              aria-label="Elimina tu calificación"
            >
              Eliminar
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {state === 'delete-confirm' && (
        <div className={styles.confirmDelete} role="dialog" aria-modal="true">
          <p>¿Estás seguro de que deseas eliminar tu calificación?</p>
          <div className={styles.confirmActions}>
            <button
              className={`${styles.button} ${styles.secondary}`}
              onClick={() => setState('showing-rating')}
            >
              Cancelar
            </button>
            <button
              className={`${styles.button} ${styles.danger}`}
              onClick={handleDeleteRating}
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

### 4.3 Estilos SCSS

```scss
// Frontend/src/components/RatingWidget/RatingWidget.module.scss

.ratingWidget {
  padding: 20px;
  background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%);
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  margin: 20px 0;
}

// ===== PROMPT STATE =====
.prompt {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  text-align: center;

  .promptText {
    font-size: 16px;
    font-weight: 500;
    color: rgba(255,255,255,0.8);
    margin: 0;
  }

  .promptButton {
    padding: 10px 24px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(102, 126, 234, 0.4);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}

// ===== MODAL =====
.modalBackdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
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
  background: linear-gradient(135deg, rgba(20,20,30,0.95) 0%, rgba(30,30,40,0.95) 100%);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.8);
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
  background: rgba(255,255,255,0.05);
  border: 2px solid rgba(255,255,255,0.2);
  border-radius: 8px;
  color: rgba(255,255,255,0.4);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #fbbf24;
    border-color: #fbbf24;
    transform: scale(1.1);
  }

  &.active {
    color: #fbbf24;
    border-color: #fbbf24;
    background: rgba(251, 191, 36, 0.1);
  }
}

.modalPreview {
  background: rgba(102, 126, 234, 0.1);
  border-left: 3px solid #667eea;
  padding: 12px 16px;
  border-radius: 4px;
  text-align: center;
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
}

.button {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
    }
  }

  &.secondary {
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.8);
    border: 1px solid rgba(255,255,255,0.1);

    &:hover:not(:disabled) {
      background: rgba(255,255,255,0.1);
    }
  }

  &.danger {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
    border: 1px solid rgba(239, 68, 68, 0.3);

    &:hover:not(:disabled) {
      background: rgba(239, 68, 68, 0.2);
    }
  }
}

// ===== USER RATING SECTION =====
.userRatingSection {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.currentRating {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}

.label {
  font-size: 14px;
  color: rgba(255,255,255,0.6);
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
}

.errorText {
  color: #ef4444;
  margin: 0;
  font-size: 14px;
}

.retryButton {
  padding: 6px 12px;
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.3);
  }
}

// ===== LOADING STATE =====
.loadingState {
  text-align: center;
  padding: 20px;
  color: rgba(255,255,255,0.6);
}

// ===== DELETE CONFIRM =====
.confirmDelete {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 6px;
  padding: 16px;
  margin-top: 12px;

  p {
    color: rgba(255,255,255,0.8);
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

// ===== RESPONSIVE =====
@media (max-width: 640px) {
  .modal {
    width: 95%;
    max-width: none;
  }

  .starButton {
    width: 42px;
    height: 42px;
    font-size: 28px;
  }

  .actions {
    flex-direction: column;
  }

  .button {
    width: 100%;
  }
}
```

### 4.4 Testing - RatingWidget

```typescript
// Frontend/src/components/RatingWidget/__tests__/RatingWidget.test.tsx

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

  it('should open modal when user clicks rate button', async () => {
    mockRatingsApi.getUserRating.mockResolvedValueOnce(null);

    const user = userEvent.setup();
    render(<RatingWidget courseId={mockCourseId} />);

    const rateButton = await screen.findByRole('button', { name: /Califica ahora/i });
    await user.click(rateButton);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should submit rating successfully', async () => {
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

    render(<RatingWidget courseId={mockCourseId} onRatingChange={onRatingChange} />);

    // Click rate button
    const rateButton = await screen.findByRole('button', { name: /Califica ahora/i });
    await user.click(rateButton);

    // Click 5-star button
    const fiveStarButton = screen.getAllByLabelText(/Califica con 5 estrellas/i)[0];
    await user.click(fiveStarButton);

    // Click confirm
    const confirmButton = screen.getByRole('button', { name: /Confirmar/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(mockRatingsApi.createRating).toHaveBeenCalledWith(
        mockCourseId,
        { user_id: mockUser.id, rating: 5 }
      );
      expect(onRatingChange).toHaveBeenCalledWith(newRating);
    });
  });

  it('should show error message on API failure', async () => {
    mockRatingsApi.getUserRating.mockResolvedValueOnce(null);
    mockRatingsApi.createRating.mockRejectedValueOnce(
      new ratingsApi.ApiError('Network error', 0, 'NETWORK_ERROR')
    );

    const user = userEvent.setup();
    render(<RatingWidget courseId={mockCourseId} />);

    const rateButton = await screen.findByRole('button', { name: /Califica ahora/i });
    await user.click(rateButton);

    const fiveStarButton = screen.getAllByLabelText(/Califica con 5 estrellas/i)[0];
    await user.click(fiveStarButton);

    const confirmButton = screen.getByRole('button', { name: /Confirmar/i });
    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });

  // Más tests...
});
```

### 4.5 Checklist Fase 2

- [ ] Crear `/src/components/RatingWidget/RatingWidget.tsx` con componente principal
- [ ] Crear `/src/components/RatingWidget/RatingPrompt.tsx` sub-componente
- [ ] Crear `/src/components/RatingWidget/RatingModal.tsx` sub-componente
- [ ] Crear `/src/components/RatingWidget/RatingWidget.module.scss` con estilos
- [ ] Implementar state machine completo (idle → modal → loading → success)
- [ ] Implementar manejo de errores con retry
- [ ] Implementar optimistic updates
- [ ] Crear tests unitarios para RatingWidget
- [ ] Crear tests para RatingPrompt
- [ ] Crear tests para RatingModal
- [ ] Validar accesibilidad (ARIA labels, roles)
- [ ] Validar responsive design

---

## 5. FASE 3: INTEGRACIÓN COURSEDETAIL (2-3 HORAS)

### 5.1 Objetivo
Integrar RatingWidget en CourseDetail, sincronizar estados y proporcionar experiencia de usuario completa.

### 5.2 Modificación CourseDetail

```typescript
// Frontend/src/components/CourseDetail/CourseDetail.tsx
// MODIFICAR EXISTENTE

'use client';  // ← CONVERTIR A CLIENT COMPONENT

import { FC, useState } from "react";
import Link from "next/link";
import { CourseDetail as CourseDetailType } from "@/types";
import { StarRating } from "@/components/StarRating/StarRating";
import { RatingWidget } from "@/components/RatingWidget/RatingWidget";
import { ratingsApi } from "@/services/ratingsApi";
import styles from "./CourseDetail.module.scss";

import type { CourseRating } from "@/types/rating";

interface CourseDetailComponentProps {
  course: CourseDetailType;
  initialStats?: { average_rating: number; total_ratings: number };
}

export const CourseDetailComponent: FC<CourseDetailComponentProps> = ({
  course,
  initialStats,
}) => {
  const [stats, setStats] = useState({
    average_rating: initialStats?.average_rating ?? course.average_rating ?? 0,
    total_ratings: initialStats?.total_ratings ?? course.total_ratings ?? 0,
  });

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const totalDuration = course.classes.reduce((acc, cls) => acc + cls.duration, 0);

  // Callback cuando cambia el rating
  const handleRatingChange = async (rating: CourseRating | null) => {
    try {
      // Refetch stats después de cambio de rating
      const updatedStats = await ratingsApi.getRatingStats(course.id);
      setStats(updatedStats);
    } catch (error) {
      console.error('Error updating stats:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.navigation}>
        <Link href="/" className={styles.backButton}>
          ← Volver a cursos
        </Link>
      </div>

      <div className={styles.header}>
        <div className={styles.thumbnailContainer}>
          <img src={course.thumbnail} alt={course.title} className={styles.thumbnail} />
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
            <span className={styles.classCount}>{course.classes.length} clases</span>
          </div>
        </div>
      </div>

      {/* NEW: RatingWidget Interactive */}
      <section className={styles.ratingSection}>
        <h2 className={styles.sectionTitle}>Tu opinión</h2>
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
            <Link href={`/classes/${cls.id}`} key={cls.id} className={styles.classItem}>
              <div className={styles.classNumber}>{(index + 1).toString().padStart(2, "0")}</div>
              <div className={styles.classInfo}>
                <h3 className={styles.classTitle}>{cls.title}</h3>
                <p className={styles.classDescription}>{cls.description}</p>
                <span className={styles.classDuration}>{formatDuration(cls.duration)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
```

### 5.3 Modificación Page Component (Server)

```typescript
// Frontend/src/app/course/[slug]/page.tsx
// MODIFICAR EXISTENTE

import { notFound } from "next/navigation";
import { CourseDetail as CourseDetailType } from "@/types";
import { CourseDetailComponent } from "@/components/CourseDetail/CourseDetail";
import { ratingsApi } from "@/services/ratingsApi";

interface CoursePageProps {
  params: {
    slug: string;
  };
}

async function getCourseData(slug: string): Promise<CourseDetailType> {
  const response = await fetch(`http://localhost:8000/courses/${slug}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error("Failed to fetch course data");
  }

  return response.json();
}

async function getCourseStats(courseId: number) {
  try {
    // Fetch stats server-side para mejor SEO/performance
    const response = await fetch(
      `http://localhost:8000/courses/${courseId}/ratings/stats`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return { average_rating: 0, total_ratings: 0 };
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error);
    return { average_rating: 0, total_ratings: 0 };
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const courseData = await getCourseData(params.slug);
  const stats = await getCourseStats(courseData.id);

  return <CourseDetailComponent course={courseData} initialStats={stats} />;
}

export async function generateMetadata({ params }: CoursePageProps) {
  const courseData = await getCourseData(params.slug);

  return {
    title: `${courseData.title} - Curso Online`,
    description: courseData.description,
  };
}
```

### 5.4 Actualizar estilos CourseDetail

```scss
// Frontend/src/components/CourseDetail/CourseDetail.module.scss
// AGREGAR AL EXISTENTE

// Sección de ratings
.ratingSection {
  margin: 40px 0;
  padding: 30px 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, transparent 100%);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);

  .sectionTitle {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 24px;
    color: white;
  }
}

// Mejorar stats section
.stats {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;

  .ratingContainer {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
```

### 5.5 Testing - Integración

```typescript
// Frontend/src/components/CourseDetail/__tests__/CourseDetail.integration.test.tsx

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseDetailComponent } from '../CourseDetail';
import * as ratingsApi from '@/services/ratingsApi';
import { useUser } from '@/hooks/useUser';

jest.mock('@/services/ratingsApi');
jest.mock('@/hooks/useUser');

const mockCourseData = {
  id: 1,
  name: 'Test Course',
  title: 'Test Course',
  description: 'Test Description',
  thumbnail: 'https://example.com/thumb.jpg',
  slug: 'test-course',
  teacher: 'Test Teacher',
  average_rating: 4.5,
  total_ratings: 100,
  classes: [
    {
      id: 1,
      title: 'Lesson 1',
      description: 'Desc',
      video: 'url',
      duration: 3600,
      slug: 'lesson-1',
    },
  ],
};

describe('CourseDetail Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display course info with ratings', () => {
    render(<CourseDetailComponent course={mockCourseData} />);

    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('Tu opinión')).toBeInTheDocument();
  });

  it('should update stats after user rates', async () => {
    const mockUser = { id: 42 };
    (useUser as jest.Mock).mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
    });

    (ratingsApi.getUserRating as jest.Mock).mockResolvedValue(null);

    const newStats = {
      average_rating: 4.6,
      total_ratings: 101,
    };

    (ratingsApi.createRating as jest.Mock).mockResolvedValue({
      id: 1,
      course_id: 1,
      user_id: 42,
      rating: 5,
      created_at: '2025-11-28T00:00:00',
      updated_at: '2025-11-28T00:00:00',
    });

    (ratingsApi.getRatingStats as jest.Mock).mockResolvedValue(newStats);

    const user = userEvent.setup();
    render(<CourseDetailComponent course={mockCourseData} />);

    // Simular rating
    const rateButton = await screen.findByRole('button', { name: /Califica ahora/i });
    await user.click(rateButton);

    // Seleccionar 5 estrellas y confirmar
    const fiveStars = screen.getAllByLabelText(/5 estrellas/i)[0];
    await user.click(fiveStars);

    const confirmBtn = screen.getByRole('button', { name: /Confirmar/i });
    await user.click(confirmBtn);

    // Verificar que los stats se actualizaron
    await waitFor(() => {
      expect(ratingsApi.getRatingStats).toHaveBeenCalledWith(1);
    });
  });
});
```

### 5.6 Checklist Fase 3

- [ ] Convertir CourseDetail a Client Component
- [ ] Agregar RatingWidget a CourseDetail
- [ ] Implementar callback onRatingChange
- [ ] Actualizar estilos para sección de ratings
- [ ] Modificar page.tsx para fetch inicial de stats
- [ ] Crear integration tests
- [ ] Validar flujo completo usuario (ver → calificar → actualizar → ver cambios)
- [ ] Validar sincronización de estado entre componentes

---

## 6. ESPECIFICACIÓN TÉCNICA DETALLADA

### 6.1 Props de Componentes

#### RatingWidget
```typescript
interface RatingWidgetProps {
  courseId: number;                    // ID del curso (requerido)
  onRatingChange?: (rating: CourseRating | null) => void;  // Callback opcional
}
```

#### RatingPrompt
```typescript
interface RatingPromptProps {
  onRate: () => void;                  // Callback al hacer click
  isLoading?: boolean;                 // Estado de carga
}
```

#### RatingModal
```typescript
interface RatingModalProps {
  isOpen: boolean;                     // Controla visibilidad
  onClose: () => void;                 // Callback al cerrar
  onSubmit: (rating: number) => void;  // Callback al confirmar
  initialRating?: number;              // Rating inicial (para edición)
  isLoading?: boolean;                 // Estado de carga
  isEditing?: boolean;                 // Modo edición vs crear
}
```

#### CourseDetail
```typescript
interface CourseDetailComponentProps {
  course: CourseDetail;                // Datos del curso
  initialStats?: {
    average_rating: number;
    total_ratings: number;
  };                                   // Stats iniciales (opcional)
}
```

### 6.2 Estados Internos

#### RatingWidget
```typescript
type WidgetState =
  | 'idle'              // Sin rating, mostrar prompt
  | 'loading'           // Cargando datos iniciales
  | 'modal-open'        // Modal abierto para seleccionar
  | 'modal-loading'     // Enviando rating a API
  | 'success'           // Operación exitosa
  | 'error'             // Error en operación
  | 'showing-rating'    // Mostrando rating actual del usuario
  | 'delete-confirm';   // Confirmación de eliminación

interface WidgetData {
  userRating: CourseRating | null;   // Rating actual del usuario
  error: string | null;               // Mensaje de error
  selectedRating: number;             // Rating seleccionado en modal (0-5)
}
```

### 6.3 Manejo de Errores

Todos los errores siguen el patrón ApiError:

```typescript
try {
  // operación
} catch (error) {
  if (error instanceof ApiError) {
    // error.message: descripción legible
    // error.status: código HTTP (404, 400, 500, etc)
    // error.code: código custom ('TIMEOUT', 'NETWORK_ERROR', etc)
  }
}
```

Errores comunes y estrategias:

| Error | Status | Estrategia |
|-------|--------|-----------|
| Validación (rating inválido) | 400 | Mostrar error y permitir reintentar |
| Curso no encontrado | 404 | No debería ocurrir (validado en server) |
| No autenticado | 401 | Mostrar "Inicia sesión" |
| Timeout de red | 408 | Mostrar "Timeout" con opción retry |
| Error de servidor | 500+ | Mostrar "Error del servidor" con retry |

### 6.4 Validaciones

```typescript
// Rating debe ser entre 1-5
function isValidRating(rating: number): boolean {
  return Number.isInteger(rating) && rating >= 1 && rating <= 5;
}

// Validar que courseId es positivo
if (courseId <= 0) throw new Error('Invalid courseId');

// Validar que userId existe
if (!user) throw new Error('User must be authenticated');
```

### 6.5 Accesibilidad (WCAG 2.1)

```typescript
// Todos los elementos interactivos tienen aria-labels
<button aria-label="Califica con 5 estrellas">★</button>

// Modal tiene role="dialog" y aria-modal="true"
<div role="dialog" aria-modal="true" aria-labelledby="title">

// Estados se comunican con aria-busy
<button aria-busy={isLoading}>Confirm</button>

// Mensajes de error tienen role="alert"
<div role="alert">{errorMessage}</div>

// Colores no son el único indicador (usar texto + iconos)
```

---

## 7. PLAN DE TESTING

### 7.1 Pirámide de Testing

```
        ▲
       /|\
      / | \
     /  |  \  E2E Tests (5-10)
    /   |   \ - Flujos completos usuario
   /    |    \- Real API (staging)
  /     |     \
 /      |      \
/───────┼───────\
|   Integration  | Integration Tests (15-20)
|     Tests      | - Componentes + hooks + API
├─────────────────┤
|    Unit Tests   | Unit Tests (40-50)
│ Components      │ - Componentes aislados
│ Hooks           │ - Funciones puras
│ Services        │ - Lógica de negocio
└─────────────────┘
```

### 7.2 Coverage Esperado

| Área | Meta | Estrategia |
|------|------|-----------|
| Components | 85%+ | Tests para cada componente |
| Services | 95%+ | Tests exhaustivos de API calls |
| Hooks | 90%+ | Tests de edge cases |
| Types/Guards | 100% | Type guards validados |
| Integración | 70%+ | Tests de flujos críticos |

### 7.3 Test Scenarios

#### Unit Tests
```typescript
// RatingWidget Tests
- ✅ Mostrar prompt cuando user no tiene rating
- ✅ Mostrar current rating cuando user tiene rating
- ✅ Abrir/cerrar modal
- ✅ Validar selección de estrellas (1-5)
- ✅ Crear nuevo rating (POST)
- ✅ Actualizar rating existente (PUT)
- ✅ Eliminar rating (DELETE)
- ✅ Mostrar error y permitir retry
- ✅ Mostrar loading states
- ✅ Ocultar widget si no hay usuario

// RatingPrompt Tests
- ✅ Renderizar con botón
- ✅ Disabled durante loading
- ✅ Llamar callback al hacer click

// RatingModal Tests
- ✅ Mostrar/ocultar según isOpen
- ✅ Aceptar selección de 1-5 estrellas
- ✅ Preview text según rating seleccionado
- ✅ Llamar onSubmit con rating seleccionado
- ✅ Cancelar sin cambios
- ✅ Disabled submit si no hay selección
- ✅ Disabled durante loading
```

#### Integration Tests
```typescript
// CourseDetail + RatingWidget
- ✅ Mostrar stats iniciales del curso
- ✅ RatingWidget cargue rating del usuario
- ✅ Al calificar, actualizar stats en CourseDetail
- ✅ Sincronización de estado correcta

// AuthContext + RatingWidget
- ✅ RatingWidget mostrar guest message si no hay usuario
- ✅ RatingWidget funcionar con usuario autenticado
- ✅ Persistencia de sesión (localStorage)

// API Mock Tests
- ✅ ratingsApi.getUserRating retorna null si no existe
- ✅ ratingsApi.createRating retorna CourseRating
- ✅ ratingsApi.updateRating retorna CourseRating actualizado
- ✅ ratingsApi.deleteRating completa sin error
- ✅ Manejo de errores HTTP (404, 400, 500)
- ✅ Manejo de timeout
```

#### E2E Tests (Cypress)
```typescript
// Flujo: Usuario abre curso y califica
- ✅ Visitar /course/[slug]
- ✅ Ver información del curso
- ✅ Ver botón "Califica ahora"
- ✅ Click en botón abre modal
- ✅ Seleccionar 5 estrellas
- ✅ Click Confirmar
- ✅ Ver mensaje de éxito
- ✅ Verificar stats actualizadas
- ✅ Recargar página y verificar rating persiste

// Flujo: Usuario edita su rating
- ✅ Usuario con rating existente ve su calificación
- ✅ Click "Editar" abre modal
- ✅ Cambiar a 3 estrellas
- ✅ Confirmar
- ✅ Ver 3 estrellas actualizadas

// Flujo: Usuario elimina su rating
- ✅ Usuario con rating ve botón "Eliminar"
- ✅ Click eliminar abre confirmación
- ✅ Confirmar
- ✅ Volver a mostrar prompt
- ✅ Stats actualizadas
```

### 7.4 Testing Tools Setup

```bash
# Ya debería estar en package.json, sino:
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/user-event @testing-library/jest-dom

# Para E2E (opcional pero recomendado)
npm install --save-dev cypress
```

---

## 8. GUÍA PASO A PASO PARA EMPEZAR AHORA

### 8.1 Setup Inicial (5 minutos)

```bash
# 1. Estar en directorio Frontend
cd /home/hernan/Platzi/claudeCode/claude-code/Frontend

# 2. Instalar dependencias si no está hecho
yarn install

# 3. Verificar que el backend está corriendo
curl http://localhost:8000/health

# 4. Iniciar dev server
yarn dev

# 5. En otra terminal, ver logs de tests
yarn test --watch
```

### 8.2 Orden Exacto de Implementación

#### FASE 1 - Autenticación (3-4 horas)

```bash
# Paso 1: Crear tipos
touch /home/hernan/Platzi/claudeCode/claude-code/Frontend/src/types/auth.ts

# Paso 2: Crear contexto
mkdir -p /home/hernan/Platzi/claudeCode/claude-code/Frontend/src/context
mkdir -p /home/hernan/Platzi/claudeCode/claude-code/Frontend/src/context/__tests__
touch /home/hernan/Platzi/claudeCode/claude-code/Frontend/src/context/AuthContext.tsx

# Paso 3: Crear hooks
mkdir -p /home/hernan/Platzi/claudeCode/claude-code/Frontend/src/hooks
mkdir -p /home/hernan/Platzi/claudeCode/claude-code/Frontend/src/hooks/__tests__
touch /home/hernan/Platzi/claudeCode/claude-code/Frontend/src/hooks/useUser.ts

# Paso 4: Modificar layout
# Editar: /src/app/layout.tsx

# Paso 5: Tests
touch /home/hernan/Platzi/claudeCode/claude-code/Frontend/src/context/__tests__/AuthContext.test.tsx
touch /home/hernan/Platzi/claudeCode/claude-code/Frontend/src/hooks/__tests__/useUser.test.ts

# Paso 6: Verificar
yarn test  # Todos los tests de auth deben pasar
```

#### FASE 2 - RatingWidget (8-10 horas)

```bash
# Paso 1: Crear directorio y componentes
mkdir -p /home/hernan/Platzi/claudeCode/claude-code/Frontend/src/components/RatingWidget
mkdir -p /home/hernan/Platzi/claudeCode/claude-code/Frontend/src/components/RatingWidget/__tests__

# Paso 2: Crear componentes
touch /home/hernan/Platzi/claudeCode/claude-code/Frontend/src/components/RatingWidget/RatingPrompt.tsx
touch /home/hernan/Platzi/claudeCode/claude-code/Frontend/src/components/RatingWidget/RatingModal.tsx
touch /home/hernan/Platzi/claudeCode/claude-code/Frontend/src/components/RatingWidget/RatingWidget.tsx

# Paso 3: Crear estilos
touch /home/hernan/Platzi/claudeCode/claude-code/Frontend/src/components/RatingWidget/RatingWidget.module.scss

# Paso 4: Tests
touch /home/hernan/Platzi/claudeCode/claude-code/Frontend/src/components/RatingWidget/__tests__/RatingWidget.test.tsx
touch /home/hernan/Platzi/claudeCode/claude-code/Frontend/src/components/RatingWidget/__tests__/RatingPrompt.test.tsx
touch /home/hernan/Platzi/claudeCode/claude-code/Frontend/src/components/RatingWidget/__tests__/RatingModal.test.tsx

# Paso 5: Verificar en navegador
# http://localhost:3000 debe cargar sin errores
```

#### FASE 3 - Integración (2-3 horas)

```bash
# Paso 1: Modificar CourseDetail
# Editar: /src/components/CourseDetail/CourseDetail.tsx
# - Agregar 'use client'
# - Agregar RatingWidget
# - Agregar onRatingChange callback

# Paso 2: Actualizar page.tsx
# Editar: /src/app/course/[slug]/page.tsx
# - Agregar getCourseStats()
# - Pasar initialStats a CourseDetailComponent

# Paso 3: Estilos
# Editar: /src/components/CourseDetail/CourseDetail.module.scss
# - Agregar sección de ratings

# Paso 4: Tests de integración
touch /home/hernan/Platzi/claudeCode/claude-code/Frontend/src/components/CourseDetail/__tests__/CourseDetail.integration.test.tsx

# Paso 5: Verificar flujo completo
# - Visitar http://localhost:3000
# - Click en un curso
# - Ver botón "Califica ahora"
# - Completar flujo de calificación
# - Verificar que se actualiza en UI y persiste
```

### 8.3 Testing Durante Desarrollo

```bash
# Terminal 1: Dev server
yarn dev

# Terminal 2: Tests en watch mode
yarn test --watch

# Terminal 3: Vitest UI (opcional, visual)
yarn test --ui

# Testing componente específico
yarn test RatingWidget

# Testing con coverage
yarn test --coverage
```

### 8.4 Debugging Tips

#### En navegador (DevTools)
```javascript
// Verificar usuario actual (si implementaste AuthContext)
// En Console:
localStorage.getItem('platziflix_user')

// Limpiar sesión
localStorage.removeItem('platziflix_user')

// Monitorear requests
// Network tab → XHR → ver /ratings endpoints
```

#### En código
```typescript
// Agregar logs para debugging
console.log('RatingWidget state:', state);
console.log('User rating:', data.userRating);
console.log('API response:', result);

// Usar React DevTools
// Inspeccionar componentes y sus props
```

#### Errores comunes
```typescript
// Error: "useUser debe ser usado dentro de AuthProvider"
// Solución: AuthProvider debe envolver el componente

// Error: "Cannot read property 'id' of null"
// Verificar que user está autenticado antes de usar user.id

// Error: "API 404"
// Verificar que courseId es correcto
// Verificar que backend está corriendo en puerto 8000
```

### 8.5 Validación Progresiva

```bash
# Después de FASE 1
□ yarn test               # Todo pasa
□ useUser se puede usar en componentes
□ localStorage persiste usuario
□ http://localhost:3000 carga sin errores

# Después de FASE 2
□ RatingWidget muestra prompt
□ RatingModal abre/cierra
□ Estrellas interactivas funcionan
□ API calls funcionan
□ Errores se manejan correctamente
□ Responsive en mobile

# Después de FASE 3
□ CourseDetail muestra RatingWidget
□ Al calificar se actualiza stats
□ Flujo completo funciona
□ All tests pass (100+ tests)
□ Coverage > 80%
```

---

## 9. CHECKLIST DETALLADO EJECUCIÓN

### FASE 1: AUTENTICACIÓN

#### Arquivos a Crear
- [ ] `/src/types/auth.ts` - Tipos User, AuthContextType
- [ ] `/src/context/AuthContext.tsx` - Contexto y Provider
- [ ] `/src/hooks/useUser.ts` - Hook personalizado
- [ ] `/src/context/__tests__/AuthContext.test.tsx` - Tests contexto
- [ ] `/src/hooks/__tests__/useUser.test.ts` - Tests hook

#### Archivos a Modificar
- [ ] `/src/app/layout.tsx` - Agregar AuthProvider wrapper

#### Tests a Pasar
- [ ] UserContext inicializa con null user
- [ ] useUser lanza error fuera de Provider
- [ ] loginAsMock persiste en localStorage
- [ ] logout limpia localStorage
- [ ] useUser retorna contexto correcto
- [ ] Sesión persiste en reload

#### Puntos de Validación
```
✓ yarn test auth*         # Tests pasan
✓ Componente carga sin errores
✓ localStorage tiene 'platziflix_user'
✓ useUser funciona en componentes
```

### FASE 2: RATINGWIDGET

#### Archivos a Crear
- [ ] `/src/components/RatingWidget/RatingPrompt.tsx`
- [ ] `/src/components/RatingWidget/RatingModal.tsx`
- [ ] `/src/components/RatingWidget/RatingWidget.tsx`
- [ ] `/src/components/RatingWidget/RatingWidget.module.scss`
- [ ] `/src/components/RatingWidget/__tests__/RatingPrompt.test.tsx`
- [ ] `/src/components/RatingWidget/__tests__/RatingModal.test.tsx`
- [ ] `/src/components/RatingWidget/__tests__/RatingWidget.test.tsx`

#### Funcionalidades a Implementar
- [ ] State machine completo (7 estados)
- [ ] Manejo de carga inicial (getUserRating)
- [ ] Modal interactivo con preview
- [ ] Create rating (POST)
- [ ] Update rating (PUT)
- [ ] Delete rating (DELETE)
- [ ] Error handling con retry
- [ ] Optimistic updates
- [ ] Accessibility (ARIA)
- [ ] Responsive design

#### Tests a Pasar
- [ ] RatingPrompt renderiza correctamente
- [ ] RatingModal abre/cierra
- [ ] Selección de estrellas funciona
- [ ] Create rating API call
- [ ] Update rating API call
- [ ] Delete rating API call
- [ ] Error cases manejados
- [ ] Loading states mostrados
- [ ] Guest message cuando no hay usuario

#### Puntos de Validación
```
✓ yarn test RatingWidget       # Todos los tests
✓ RatingWidget aparece en storybook (si existe)
✓ Modal responsive en mobile
✓ Keyboard navigation funciona
✓ ARIA labels válidos
```

### FASE 3: INTEGRACIÓN

#### Archivos a Modificar
- [ ] `/src/components/CourseDetail/CourseDetail.tsx`
  - Convertir a Client Component ('use client')
  - Agregar RatingWidget
  - Agregar manejo de stats
  - Agregar onRatingChange callback
- [ ] `/src/app/course/[slug]/page.tsx`
  - Agregar getCourseStats()
  - Pasar initialStats a CourseDetail
- [ ] `/src/components/CourseDetail/CourseDetail.module.scss`
  - Agregar sección de ratings

#### Archivos a Crear
- [ ] `/src/components/CourseDetail/__tests__/CourseDetail.integration.test.tsx`

#### Funcionalidades a Integrar
- [ ] RatingWidget en CourseDetail
- [ ] Stats iniciales server-side
- [ ] Actualización de stats client-side
- [ ] Sincronización de estado
- [ ] Callback onRatingChange
- [ ] UX completo usuario

#### Tests a Pasar
- [ ] CourseDetail se renderiza
- [ ] RatingWidget aparece
- [ ] Al calificar, stats se actualizan
- [ ] Flujo completo funciona

#### Puntos de Validación
```
✓ yarn test CourseDetail       # Integration tests
✓ Visitar /course/test-course
✓ Ver curso y RatingWidget
✓ Calificar curso
✓ Verificar stats actualizan
✓ Recargar página y verificar persiste
```

---

## 10. RESUMEN EJECUCIÓN

### Tiempo Total Estimado
- Fase 1 (Autenticación): **3-4 horas**
- Fase 2 (RatingWidget): **8-10 horas**
- Fase 3 (Integración): **2-3 horas**
- **Total: 13-17 horas** (completar 40% restante)

### Dependencias Externas
- Backend: Debe estar corriendo en http://localhost:8000
- Database: PostgreSQL con tabla course_ratings
- API: 6 endpoints completamente funcionales

### Stack Tecnológico Utilizado
- React 19 (Client Components)
- TypeScript (strict mode)
- SCSS Modules (estilos)
- Vitest + Testing Library (tests)
- Next.js 15 (routing)
- Custom Hooks (useUser)
- Context API (autenticación)

### Criterios de Éxito
1. Backend: 100% funcional ✅
2. Frontend: 100% completo (60% → 100%)
   - Autenticación: ✅ (después Fase 1)
   - RatingWidget: ✅ (después Fase 2)
   - Integración: ✅ (después Fase 3)
3. Tests: 100+ tests pasando
4. Coverage: > 80%
5. Accesibilidad: WCAG 2.1 Level A
6. Performance: Lighthouse > 90

---

## APÉNDICES

### A. Rutas de API (Backend)
```
POST   /courses/{course_id}/ratings              Create/Update rating
GET    /courses/{course_id}/ratings              Get all ratings
GET    /courses/{course_id}/ratings/stats        Get statistics
GET    /courses/{course_id}/ratings/user/{id}    Get user rating
PUT    /courses/{course_id}/ratings/{user_id}    Update rating
DELETE /courses/{course_id}/ratings/{user_id}    Delete rating
```

### B. Estructura de Datos

#### CourseRating
```json
{
  "id": 1,
  "course_id": 1,
  "user_id": 42,
  "rating": 5,
  "created_at": "2025-11-28T10:30:00Z",
  "updated_at": "2025-11-28T10:30:00Z"
}
```

#### RatingStats
```json
{
  "average_rating": 4.35,
  "total_ratings": 142
}
```

#### User (Auth)
```json
{
  "id": 42,
  "email": "user@example.com",
  "name": "User Name"
}
```

### C. Convenciones de Código
- **Componentes**: PascalCase, Client Components con 'use client'
- **Funciones**: camelCase, tipadas con TypeScript
- **Archivos**: kebab-case (RatingWidget.tsx)
- **Estilos**: CSS Modules con .module.scss
- **Tests**: *.test.tsx o *.test.ts
- **Imports**: Absolutos con @/ alias

### D. Recursos Útiles
- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/best-practices)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Documento generado para Platziflix Frontend Rating System**
**Versión**: 1.0
**Última actualización**: 2025-11-28
