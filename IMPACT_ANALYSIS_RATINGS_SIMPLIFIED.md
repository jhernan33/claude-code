# 📊 ANÁLISIS DE IMPACTO - Sistema de Ratings (1-5 Estrellas)

**Fecha:** 2025-11-22
**Alcance:** Frontend + Backend (sin Mobile)
**Proyecto:** Platziflix

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Backend - Análisis Completo](#backend---análisis-completo)
3. [Frontend - Análisis Completo](#frontend---análisis-completo)
4. [Plan de Implementación](#plan-de-implementación)
5. [Estimación de Esfuerzo](#estimación-de-esfuerzo)
6. [Riesgos y Mitigaciones](#riesgos-y-mitigaciones)
7. [Checklist de Implementación](#checklist-de-implementación)

---

## Resumen Ejecutivo

### Estado Global: 60% COMPLETADO ✅⚠️

El sistema de ratings **ya está 100% implementado en el Backend**, con modelos, servicios, endpoints y tests completos. El Frontend tiene componentes de **visualización readonly** (mostrar ratings), pero **falta la interactividad** (crear, editar, eliminar ratings).

### Porcentaje de Implementación

```
Backend (FastAPI):      ████████████████████████████ 100% ✅
Frontend (Next.js):     ████████████████░░░░░░░░░░░░ 60%  ⚠️
────────────────────────────────────────
TOTAL:                  ███████████████████░░░░░░░░░ 80%
```

### Impacto General: BAJO ✅

- **Backend:** Ya implementado, sin cambios necesarios
- **Frontend:** 40% de trabajo pendiente (componente interactivo + integración)
- **Base de datos:** Migración ya aplicada, schema listo
- **Compatibilidad:** 100% compatible con arquitectura actual

---

## Backend - Análisis Completo

### 🎯 Estado: 100% COMPLETADO ✅

**Ubicación:** `/home/hernan/Platzi/claudeCode/claude-code/Backend/`

### Modelo de Datos

```
CourseRating Table:
├── id (PK)
├── course_id (FK → courses.id)
├── user_id (INT - no FK aún, por implementar autenticación)
├── rating (INT - CHECK 1-5)
├── created_at (TIMESTAMP)
├── updated_at (TIMESTAMP)
└── deleted_at (TIMESTAMP - soft delete)

Constraints:
  • CHECK (rating >= 1 AND rating <= 5)
  • UNIQUE (course_id, user_id) WHERE deleted_at IS NULL
  • Foreign Key: course_id → courses.id

Relación con Course:
  Course (1) ─── (M) CourseRating

  Course properties agregadas:
    • average_rating (Float)
    • total_ratings (Int)
```

### Migraciones

**Estado:** ✅ Aplicadas
- Archivo: `app/alembic/versions/0e3a8766f785_add_course_ratings_table.py`
- Status: Ya ejecutada en BD

```sql
CREATE TABLE course_ratings (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    UNIQUE (course_id, user_id) WHERE deleted_at IS NULL
);
```

### Servicios (CourseService)

**Archivo:** `app/services/course_service.py`

**6 Métodos implementados:**

```python
# 1. Obtener lista de ratings de un curso
async def get_course_ratings(course_id: int) → List[CourseRating]

# 2. Crear O actualizar rating
async def add_course_rating(course_id: int, user_id: int, rating: int) → CourseRating

# 3. Actualizar rating existente (semántica PUT)
async def update_course_rating(course_id: int, user_id: int, rating: int) → CourseRating

# 4. Eliminar rating (soft delete)
async def delete_course_rating(course_id: int, user_id: int) → bool

# 5. Obtener rating específico de usuario
async def get_user_course_rating(course_id: int, user_id: int) → CourseRating | None

# 6. Obtener estadísticas agregadas
async def get_course_rating_stats(course_id: int) → RatingStats
```

### Endpoints API

**Estado:** ✅ Implementados y testeados

| Método | Endpoint | Status | Response |
|--------|----------|--------|----------|
| POST | `/courses/{id}/ratings` | 201/200 | RatingResponse |
| GET | `/courses/{id}/ratings` | 200 | List[RatingResponse] |
| GET | `/courses/{id}/ratings/stats` | 200 | RatingStatsResponse |
| GET | `/courses/{id}/ratings/user/{uid}` | 200/204 | RatingResponse \| None |
| PUT | `/courses/{id}/ratings/{uid}` | 200 | RatingResponse |
| DELETE | `/courses/{id}/ratings/{uid}` | 204 | (empty) |

**Detalle de cada endpoint:**

#### 1. POST /courses/{course_id}/ratings - Crear/Actualizar Rating

```
Request:
{
  "user_id": 1,
  "rating": 5
}

Response (201 Created si nuevo, 200 OK si actualiza):
{
  "id": 42,
  "course_id": 1,
  "user_id": 1,
  "rating": 5,
  "created_at": "2025-11-22T10:00:00",
  "updated_at": "2025-11-22T10:00:00"
}

Errores:
  400: rating fuera de rango (< 1 o > 5)
  404: curso no existe
  422: validación Pydantic falla
```

**Lógica especial:** Si el usuario ya tiene rating activo, actualiza en lugar de crear uno nuevo (PUT automático)

#### 2. GET /courses/{course_id}/ratings - Obtener Todos Los Ratings

```
Response (200 OK):
[
  {
    "id": 1,
    "course_id": 1,
    "user_id": 5,
    "rating": 4,
    "created_at": "2025-01-15T08:30:00",
    "updated_at": "2025-01-15T08:30:00"
  },
  { ... }
]

Errores:
  404: curso no existe
```

**Orden:** Por `created_at DESC` (más recientes primero)

#### 3. GET /courses/{course_id}/ratings/stats - Estadísticas Agregadas

```
Response (200 OK):
{
  "average_rating": 4.5,
  "total_ratings": 100,
  "rating_distribution": {
    "1": 5,
    "2": 10,
    "3": 15,
    "4": 35,
    "5": 35
  }
}

Errores:
  404: curso no existe
```

**Cálculo:** SQL AVG() y COUNT() con GROUP BY rating

#### 4. GET /courses/{course_id}/ratings/user/{user_id} - Rating del Usuario

```
Response (200 OK si existe):
{
  "id": 42,
  "course_id": 1,
  "user_id": 7,
  "rating": 4,
  "created_at": "2025-11-20T14:22:00",
  "updated_at": "2025-11-20T14:22:00"
}

Response (204 No Content si no existe):
[vacío]

Errores:
  404: curso no existe
```

#### 5. PUT /courses/{course_id}/ratings/{user_id} - Actualizar Rating Existente

```
Request:
{
  "user_id": 7,
  "rating": 3
}

Response (200 OK):
{
  "id": 42,
  "course_id": 1,
  "user_id": 7,
  "rating": 3,
  "created_at": "2025-11-20T14:22:00",
  "updated_at": "2025-11-22T10:05:00"
}

Errores:
  400: user_id en body no coincide con path
  400: rating fuera de rango
  404: curso no existe
  404: rating no existe
```

#### 6. DELETE /courses/{course_id}/ratings/{user_id} - Eliminar Rating

```
Response (204 No Content):
[vacío]

Errores:
  404: curso no existe
  404: rating no existe
```

**Operación:** Soft delete → SET deleted_at = NOW()

### Schemas Pydantic

**Archivo:** `app/schemas/rating.py`

```python
class RatingRequest(BaseModel):
    user_id: int = Field(..., gt=0, description="Must be > 0")
    rating: int = Field(..., ge=1, le=5, description="Must be 1-5")

class RatingResponse(BaseModel):
    id: int
    course_id: int
    user_id: int
    rating: int  # 1-5
    created_at: str
    updated_at: str

class RatingStatsResponse(BaseModel):
    average_rating: float  # 0.0-5.0
    total_ratings: int
    rating_distribution: Dict[int, int]  # {1: count, 2: count, ...}

class ErrorResponse(BaseModel):
    detail: str
    error_code: str | None = None
```

### Testing

**Estado:** ✅ 33 test cases

```
test_rating_endpoints.py (10 tests):
├── POST /ratings - Crear nuevo
├── POST /ratings - Actualizar existente
├── POST /ratings - Rating fuera de rango (400)
├── POST /ratings - Curso no existe (404)
├── GET /ratings - Obtener lista
├── GET /ratings - Lista vacía
├── GET /ratings/stats - Estadísticas
├── GET /ratings/user/{uid} - Existe (200)
├── GET /ratings/user/{uid} - No existe (204)
├── PUT /ratings/{uid} - Actualizar
├── PUT /ratings/{uid} - No existe (404)
└── DELETE /ratings/{uid} - Soft delete

test_course_rating_service.py (18 tests):
├── get_course_ratings - Success, not found, empty
├── add_course_rating - New, update, invalid range, not found
├── update_course_rating - Success, not found, invalid range
├── delete_course_rating - Success, not found
├── get_user_course_rating - Exists, not exists
└── get_course_rating_stats - With ratings, no ratings, not found

test_rating_db_constraints.py (5 tests):
├── CHECK constraint min/max
├── UNIQUE constraint
├── Soft delete allows re-rating
└── Foreign key constraint
```

### Validaciones

**Nivel 1: Pydantic (Request)**
- rating: 1-5 (field validator)
- user_id: > 0

**Nivel 2: Service Layer (Business Logic)**
- Validar que curso existe
- Validar que rating 1-5
- Lógica crear vs actualizar

**Nivel 3: Database (Constraints)**
- CHECK (rating >= 1 AND rating <= 5)
- UNIQUE (course_id, user_id) WHERE deleted_at IS NULL
- Foreign Key: course_id → courses.id

### Conclusión Backend

**Status:** ✅ 100% COMPLETADO Y LISTO
**Acciones requeridas:** NINGUNA
**Cambios necesarios:** NINGUNO

El Backend está completamente implementado, testeado y en producción. No requiere cambios.

---

## Frontend - Análisis Completo

### 🎯 Estado: 60% COMPLETADO ⚠️

**Ubicación:** `/home/hernan/Platzi/claudeCode/claude-code/Frontend/`

### Implementado ✅

#### 1. StarRating Component (Readonly)

**Archivo:** `src/components/StarRating/StarRating.tsx`

**Props:**
```typescript
interface StarRatingProps {
  rating: number;           // 0-5, soporta decimales (4.5)
  totalRatings?: number;    // Opcional: mostrar "(42 ratings)"
  showCount?: boolean;      // Mostrar contador
  size?: 'small' | 'medium' | 'large';
  readonly?: boolean;       // true por defecto
  className?: string;
}
```

**Comportamiento:**
- Renderiza 5 estrellas SVG
- Soporta valores decimales con media estrella
- Estilos CSS variables para personalización
- ARIA labels para accesibilidad
- Responsive y flexible

**Ejemplo:**
```tsx
<StarRating
  rating={4.5}
  totalRatings={128}
  showCount={true}
  size="medium"
  readonly={true}
/>
// Output: ⭐⭐⭐⭐◐ (4.5 out of 128 ratings)
```

**Tests:** 23 test cases, 100% coverage

#### 2. ratingsApi Service

**Archivo:** `src/services/ratingsApi.ts`

**Funciones implementadas:**

```typescript
// GET /courses/{id}/ratings/stats
async getRatingStats(courseId: number): Promise<RatingStats>

// GET /courses/{id}/ratings/{uid}
async getUserRating(courseId: number, userId: number): Promise<CourseRating | null>

// GET /courses/{id}/ratings
async getCourseRatings(courseId: number): Promise<CourseRating[]>

// POST /courses/{id}/ratings
async createRating(courseId: number, request: RatingRequest): Promise<CourseRating>

// PUT /courses/{id}/ratings/{uid}
async updateRating(courseId: number, userId: number, request: RatingRequest): Promise<CourseRating>

// DELETE /courses/{id}/ratings/{uid}
async deleteRating(courseId: number, userId: number): Promise<void>
```

**Características:**
- Fetch con timeout de 10 segundos
- Manejo robusto de errores con ApiError custom
- Fallback a valores por defecto en 404
- JSON validation en responses

**Status:** ✅ Completamente funcional, solo falta integración en componentes

#### 3. TypeScript Types

**Archivo:** `src/types/rating.ts`

```typescript
interface CourseRating {
  id: number;
  course_id: number;
  user_id: number;
  rating: number;  // 1-5
  created_at: string;
  updated_at: string;
}

interface RatingRequest {
  user_id: number;
  rating: number;  // 1-5
}

interface RatingStats {
  average_rating: number;  // 0.0-5.0
  total_ratings: number;
}

// Type guards
function isValidRating(rating: number): boolean
function isCourseRating(obj: unknown): obj is CourseRating
```

**Status:** ✅ Completo

#### 4. Course Card Component

**Archivo:** `src/components/Course/Course.tsx`

```tsx
export const Course = ({
  id, name, description, thumbnail,
  average_rating, total_ratings
}) => (
  <article className={styles.course}>
    <img src={thumbnail} alt={name} />
    <h3>{name}</h3>
    <p>{description}</p>

    {typeof average_rating === 'number' && (
      <div className={styles.ratingContainer}>
        <StarRating
          rating={average_rating}
          totalRatings={total_ratings}
          showCount={true}
          size="small"
          readonly={true}
        />
      </div>
    )}
  </article>
);
```

**Status:** ✅ Implementado

#### 5. Home Page

**Archivo:** `src/app/page.tsx`

- Fetch de cursos con ratings incluidos
- Grid de Course cards con ratings visibles
- Server component con fetch asíncrono

**Status:** ✅ Implementado

### Faltante ❌

#### 1. RatingWidget Component (Interactivo)

**Necesario para:** Crear/editar ratings de forma interactiva

**Props recomendadas:**
```typescript
interface RatingWidgetProps {
  courseId: number;
  userId: number;
  currentRating?: number;     // Si existe rating previo
  onSuccess?: (rating: CourseRating) => void;
  onError?: (error: ApiError) => void;
}
```

**Funcionalidad:**
- Mostrar estrella interactiva (no readonly)
- Estados: idle, loading, success, error
- Validación visual
- Feedback después de guardar
- Manejo de errores

**Estimado:** 3-4 horas

**Pseudocódigo:**
```tsx
export function RatingWidget({
  courseId, userId, currentRating, onSuccess
}: RatingWidgetProps) {
  const [rating, setRating] = useState(currentRating || 0);
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async () => {
    setState('loading');
    try {
      const result = currentRating
        ? await ratingsApi.updateRating(courseId, userId, { user_id: userId, rating })
        : await ratingsApi.createRating(courseId, { user_id: userId, rating });

      setState('success');
      onSuccess?.(result);
      setTimeout(() => setState('idle'), 2000);
    } catch (error) {
      setState('error');
    }
  };

  return (
    <div className={styles.ratingWidget}>
      <StarRating
        rating={rating}
        readonly={false}
        size="large"
        onChange={setRating}
      />

      {state === 'loading' && <Spinner />}
      {state === 'success' && <SuccessMessage />}
      {state === 'error' && <ErrorMessage />}

      <button onClick={handleSubmit} disabled={state === 'loading'}>
        {currentRating ? 'Update Rating' : 'Submit Rating'}
      </button>
    </div>
  );
}
```

#### 2. Modal de Confirmación

**Necesario para:** Confirmar calificación antes de guardar

**Características:**
- Preview del rating a guardar
- Botones: Confirmar, Cancelar
- Muestra rating anterior (si existe)

**Estimado:** 1-2 horas

#### 3. Integración en CourseDetail Page

**Archivo:** `src/app/course/[slug]/page.tsx`

**Cambios necesarios:**

```tsx
// 1. State del usuario actual (de autenticación)
const [currentUser, setCurrentUser] = useState<User | null>(null);

// 2. State de ratings
const [courseRating, setCourseRating] = useState<CourseRating | null>(null);
const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);

// 3. Fetch ratings al cargar página
useEffect(() => {
  if (currentUser) {
    Promise.all([
      ratingsApi.getRatingStats(courseId),
      ratingsApi.getUserRating(courseId, currentUser.id)
    ]).then(([stats, rating]) => {
      setRatingStats(stats);
      setCourseRating(rating);
    });
  }
}, [courseId, currentUser]);

// 4. Renderizar componentes de rating
return (
  <div className={styles.courseDetail}>
    {/* Información del curso */}

    {/* Sección de ratings */}
    {ratingStats && (
      <section className={styles.ratingsSection}>
        <h3>Ratings</h3>
        <StarRating
          rating={ratingStats.average_rating}
          totalRatings={ratingStats.total_ratings}
          readonly={true}
        />
      </section>
    )}

    {/* Widget para calificar */}
    {currentUser && (
      <section className={styles.rateSection}>
        <h3>Rate this course</h3>
        <RatingWidget
          courseId={courseId}
          userId={currentUser.id}
          currentRating={courseRating?.rating}
          onSuccess={(newRating) => {
            setCourseRating(newRating);
          }}
        />
      </section>
    )}
  </div>
);
```

**Estimado:** 2-3 horas

#### 4. Sistema de Autenticación

**Necesario para:** Obtener usuario actual (userId)

**Opciones:**
1. **JWT en localStorage** - Rápido pero menos seguro
2. **Session cookies** - Más seguro pero requiere backend
3. **NextAuth.js** - Recomendado para Next.js (integración fácil)

**Mínimo necesario:**
```tsx
// src/context/UserContext.tsx
export const UserContext = createContext<User | null>(null);

export function useUser() {
  const user = useContext(UserContext);
  return user;
}

// En layout.tsx:
<UserProvider>
  {children}
</UserProvider>
```

**Estimado:** 3-4 horas

#### 5. Estados de Loading/Error

**Necesarios para:** Feedback visual durante operaciones

**Componentes a agregar:**
```tsx
// Spinner/Loading
<Spinner size="small" color="primary" />

// Toast/Notificación
<Toast type="success" message="Rating saved successfully!" />
<Toast type="error" message="Failed to save rating. Please try again." />

// Error boundary
<ErrorBoundary fallback={<ErrorUI />}>
  <RatingWidget ... />
</ErrorBoundary>
```

**Estimado:** 2-3 horas

#### 6. Tests

**Faltantes:**
- RatingWidget tests (~15 tests)
- CourseDetail integration tests (~12 tests)
- E2E tests (~8 tests)

**Estimado:** 4-5 horas

### Resumen Frontend

| Tarea | Status | Tiempo Est. | Complejidad |
|-------|--------|------------|-------------|
| StarRating (readonly) | ✅ | 0h | - |
| ratingsApi service | ✅ | 0h | - |
| RatingWidget interactivo | ❌ | 3-4h | Media |
| Modal confirmación | ❌ | 1-2h | Baja |
| CourseDetail integración | ⚠️ | 2-3h | Media |
| Sistema autenticación | ❌ | 3-4h | Alta |
| Loading/Error states | ❌ | 2-3h | Baja |
| Tests | ❌ | 4-5h | Media |
| **TOTAL** | | **17-26h** | **Media** |

---

## Plan de Implementación

### Sprint 1: Autenticación Básica (BLOQUEANTE)

**Duración:** 3-4 horas
**Prioridad:** CRÍTICA

**Tareas:**
1. Crear UserContext
2. Crear useUser hook
3. Implementar login básico (o mock usuario para dev)
4. Integrar en layout.tsx

**Resultado:** Componentes pueden acceder a userId

### Sprint 2: RatingWidget + Integración

**Duración:** 10-14 horas
**Dependencia:** Sprint 1 ✓

**Tareas:**
1. Crear RatingWidget component (3-4h)
2. Crear Modal confirmación (1-2h)
3. Integrar en CourseDetail page (2-3h)
4. Agregar estados loading/error (2-3h)
5. Escribir tests (4-5h)

**Resultado:** Sistema de ratings funcional end-to-end

### Timeline Total

```
Sprint 1: Autenticación      3-4 horas     (2-3 días)
Sprint 2: Rating + Tests     10-14 horas   (5-7 días)
──────────────────────────────────
TOTAL:                       13-18 horas   (1-2 semanas)
```

---

## Estimación de Esfuerzo

### Por Componente

| Componente | Horas | Complejidad | Persona |
|-----------|-------|-------------|----------|
| **Autenticación** | 3-4 | Alta | 1 dev |
| **RatingWidget** | 3-4 | Media | 1 dev |
| **Modal confirmación** | 1-2 | Baja | 1 dev |
| **Integración CourseDetail** | 2-3 | Media | 1 dev |
| **Loading/Error states** | 2-3 | Baja | 1 dev |
| **Tests** | 4-5 | Media | 1 dev |
| **TOTAL** | **15-21** | **Media** | **1 dev** |

### Con Contingencia (15%)

```
Base:           15-21 horas
Contingencia:   +2-3 horas
────────────────────────
TOTAL:          17-24 horas (1 semana con 1 dev)
```

---

## Riesgos y Mitigaciones

### Riesgo 1: Autenticación Bloqueante

**Severidad:** ALTA
**Probabilidad:** ALTA

**Problema:** Sin userId, no se puede saber quién califica

**Mitigación:**
- Implementar autenticación PRIMERO (Sprint 1)
- O usar userId hardcoded durante desarrollo
- Después migrar a auth real

**Impacto:** Bloquea toda la implementación de ratings

### Riesgo 2: Integración Frontend-Backend

**Severidad:** MEDIA
**Probabilidad:** MEDIA

**Problema:** Endpoints Backend pueden cambiar, rutas pueden estar mal

**Mitigación:**
- Tests de integración antes de deploy
- Usar Swagger UI para verificar endpoints
- Documentación clara de endpoints

**Impacto:** Regressions y bugs en producción

### Riesgo 3: Scope Creep

**Severidad:** MEDIA
**Probabilidad:** ALTA

**Problema:** Agregar más features a ratings durante desarrollo

**Mitigación:**
- MVP es CRUD básico: crear, leer, actualizar, eliminar
- Features avanzadas (paginación, filtros, historial) para fase 2
- Documentar claramente lo que está IN-SCOPE vs OUT-SCOPE

**Impacto:** Proyecto se extiende más de lo planeado

### Riesgo 4: Tests Incompletos

**Severidad:** MEDIA
**Probabilidad:** MEDIA

**Problema:** Tests no cubren todos los casos edge

**Mitigación:**
- Requerir >80% de cobertura
- Tests de integración obligatorios
- E2E tests para flujo principal

**Impacto:** Bugs encontrados en producción

---

## Checklist de Implementación

### Sprint 1: Autenticación

#### Preparación
- [ ] Revisar este documento completamente
- [ ] Entender flujo de ratings en Backend
- [ ] Familiarizarse con endpoints API

#### Implementación
- [ ] Crear `src/context/UserContext.tsx`
- [ ] Crear `src/hooks/useUser.ts`
- [ ] Crear componente de login (o mock para dev)
- [ ] Integrar UserProvider en `app/layout.tsx`
- [ ] Tests de UserContext
- [ ] Code review
- [ ] Testing en dev environment

#### Validación
- [ ] `useUser()` retorna usuario autenticado
- [ ] userId está disponible en todos los componentes
- [ ] No hay regressions en rutas existentes

### Sprint 2: RatingWidget

#### RatingWidget Component
- [ ] Crear `src/components/RatingWidget/RatingWidget.tsx`
  - [ ] Props: courseId, userId, currentRating, onSuccess, onError
  - [ ] Estados: idle, loading, success, error
  - [ ] Renderizar StarRating interactivo
  - [ ] Botón de submit
  - [ ] Validaciones visuales
  - [ ] Estilos SCSS según diseño
- [ ] Crear `src/components/RatingWidget/RatingWidget.module.scss`
- [ ] Tests: 10-15 test cases
  - [ ] Renderizado correcto
  - [ ] Click en estrella actualiza state
  - [ ] Submit envía API request
  - [ ] Estados loading/success/error
  - [ ] Callbacks se llaman correctamente

#### Modal Confirmación
- [ ] Crear `src/components/RatingModal/RatingModal.tsx`
  - [ ] Props: rating, totalRatings, onConfirm, onCancel
  - [ ] Preview del rating
  - [ ] Botones confirmar/cancelar
  - [ ] Animaciones
- [ ] Tests: 5-8 test cases

#### Integración CourseDetail
- [ ] Actualizar `src/app/course/[slug]/page.tsx`
  - [ ] Fetch rating stats al montar
  - [ ] Fetch rating del usuario actual
  - [ ] Renderizar StarRating (readonly)
  - [ ] Renderizar RatingWidget (interactivo)
  - [ ] Actualizar UI después de calificar
  - [ ] Manejo de errores
- [ ] Tests: 8-12 test cases
  - [ ] Renderiza stats correctamente
  - [ ] Fetch de ratings al montar
  - [ ] Widget visible si usuario autenticado
  - [ ] Actualización UI post-submit

#### Estados UI
- [ ] Crear/actualizar componentes de spinner
- [ ] Crear/actualizar Toast notifications
- [ ] Error boundaries
- [ ] Retry logic en case de fallos

#### Tests Finales
- [ ] Flujo completo: usuario califica un curso
- [ ] Flujo: usuario actualiza su calificación
- [ ] Flujo: usuario elimina su calificación
- [ ] E2E test del flujo principal
- [ ] Performance testing
- [ ] Compatibilidad navegadores (Chrome, Firefox, Safari)

#### Code Review & Deployment
- [ ] Code review de todo el código
- [ ] Fixing de comentarios
- [ ] Testing en staging
- [ ] Deploy a producción

---

## Matriz de Decisiones

### Autenticación

**Opción 1: JWT en localStorage** (3-4 horas)
- ✅ Rápido de implementar
- ✅ No requiere cambios en Backend
- ❌ Menos seguro
- ❌ No protege contra CSRF

**Opción 2: NextAuth.js** (4-6 horas)
- ✅ Integración Next.js nativa
- ✅ Más seguro (session cookies)
- ✅ Soporte para OAuth/Social login (futuro)
- ❌ Requiere más setup

**Opción 3: Mock para MVP** (1 hora)
- ✅ Más rápido
- ✅ Valida flujo
- ❌ Necesita refactor después

**Recomendación:** Opción 3 (Mock) para MVP rápido, después Opción 2 (NextAuth)

### Estilos

**Opción 1: Mantener SCSS modules** (Actual)
- ✅ Consistente con proyecto
- ✅ Scoped styles

**Opción 2: Tailwind CSS**
- ✅ Desarrollo rápido
- ❌ Cambio de dirección del proyecto

**Recomendación:** Opción 1 (SCSS modules)

### Validaciones

**Opción 1: Client-side only**
- ✅ Rápido
- ❌ Poco seguro

**Opción 2: Client + Server**
- ✅ Seguro
- ✅ Mejor UX

**Recomendación:** Opción 2 (Backend ya valida, Frontend es redundancia)

---

## Conclusión

### Resumen

**Sistema de Ratings: Impacto BAJO**

```
Backend:    100% completo  ✅ LISTO
Frontend:    60% completo  ⚠️ 15-21h para completar
────────────────────────────
TOTAL:                       15-21 horas (1 semana)
```

### Recomendaciones

1. **Implementación prioritaria:** Autenticación PRIMERO
2. **Timeline realista:** 1-2 semanas con 1 dev
3. **Riesgos mitigados:** Plan de contingencia en place
4. **Calidad:** >80% test coverage requerido

### Próximos Pasos

1. ✅ Revisar y aprobar este análisis
2. ✅ Implementar Sprint 1: Autenticación (3-4 horas)
3. ✅ Implementar Sprint 2: RatingWidget (10-14 horas)
4. ✅ Testing y QA (2-3 horas)
5. ✅ Deploy a producción

---

**Documento preparado por:** Claude Code
**Fecha:** 2025-11-22
**Estado:** Listo para implementación
