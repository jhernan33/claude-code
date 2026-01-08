# 📊 ANÁLISIS DE IMPACTO - Sistema de Ratings (1-5 Estrellas)

**Fecha:** 2025-11-22
**Proyecto:** Platziflix
**Alcance:** Implementación completa del sistema de ratings de cursos

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Estado Actual de Implementación](#estado-actual-de-implementación)
3. [Impacto por Componente](#impacto-por-componente)
4. [Backend - Análisis Detallado](#backend---análisis-detallado)
5. [Frontend - Análisis Detallado](#frontend---análisis-detallado)
6. [Mobile - Análisis Detallado](#mobile---análisis-detallado)
7. [Plan de Implementación](#plan-de-implementación)
8. [Estimación de Esfuerzo](#estimación-de-esfuerzo)
9. [Riesgos y Mitigaciones](#riesgos-y-mitigaciones)
10. [Checklist de Implementación](#checklist-de-implementación)

---

## Resumen Ejecutivo

### Estado Global: 60% COMPLETADO ✅⚠️

El sistema de ratings **ya está 100% implementado en el Backend**, con modelos, servicios, endpoints y tests completos. El Frontend tiene componentes de **visualización readonly** (mostrar ratings), pero **falta la interactividad** (crear, editar, eliminar ratings).

### Porcentaje de Implementación por Componente

```
Backend (FastAPI):      ████████████████████████████ 100% ✅
Frontend (Next.js):     ████████████████░░░░░░░░░░░░ 60%  ⚠️
Android (Kotlin):       ████░░░░░░░░░░░░░░░░░░░░░░░░ 20%  ⏳
iOS (Swift):            ████░░░░░░░░░░░░░░░░░░░░░░░░ 20%  ⏳
```

### Impacto General: BAJO PERO IMPORTANTE ✅

- **Backend:** Ya implementado, sin cambios necesarios
- **Frontend:** 40% de trabajo pendiente (componente interactivo + integración)
- **Mobile:** Implementación similar al Frontend (40% pendiente)
- **Base de datos:** Migración ya aplicada, schema listo
- **Compatibilidad:** 100% compatible con arquitectura actual

---

## Estado Actual de Implementación

### Backend (FastAPI + PostgreSQL) - 100% COMPLETO ✅

#### Modelos de Datos
```
✅ CourseRating Model
   - Fields: id, course_id, user_id, rating (1-5), created_at, updated_at, deleted_at
   - Validaciones: CHECK constraint (1-5), UNIQUE (course_id, user_id), FK course_id
   - Soft deletes: Soportado via deleted_at
```

#### Esquemas Pydantic
```
✅ RatingRequest       - Validación de entrada (user_id > 0, rating 1-5)
✅ RatingResponse      - Serialización de salida completa
✅ RatingStatsResponse - Estadísticas (avg, total, distribución 1-5)
✅ ErrorResponse       - Manejo estándar de errores
```

#### Servicios
```
✅ CourseService.get_course_ratings()      - GET lista de ratings
✅ CourseService.add_course_rating()       - POST crear/actualizar rating
✅ CourseService.update_course_rating()    - PUT actualizar rating existente
✅ CourseService.delete_course_rating()    - DELETE soft-delete
✅ CourseService.get_user_course_rating()  - GET rating del usuario
✅ CourseService.get_course_rating_stats() - GET estadísticas agregadas
```

#### Endpoints API
```
✅ POST   /courses/{id}/ratings            [201] Crear/actualizar rating
✅ GET    /courses/{id}/ratings            [200] Listar todos los ratings
✅ GET    /courses/{id}/ratings/stats      [200] Estadísticas agregadas
✅ GET    /courses/{id}/ratings/user/{uid} [200/204] Rating del usuario específico
✅ PUT    /courses/{id}/ratings/{uid}      [200] Actualizar rating existente
✅ DELETE /courses/{id}/ratings/{uid}      [204] Eliminar (soft-delete)
```

#### Migraciones
```
✅ 0e3a8766f785_add_course_ratings_table.py
   - Crea tabla course_ratings
   - Índices en course_id, user_id, id
   - Constraints: CHECK rating 1-5, UNIQUE (course_id, user_id, deleted_at)
   - Foreign key: course_id → courses.id
```

#### Tests (33 test cases)
```
✅ test_rating_endpoints.py      - 10 tests de endpoints HTTP
✅ test_course_rating_service.py - 18 tests de lógica de negocio
✅ test_rating_db_constraints.py - 5 tests de constraints BD
   - Cobertura: CRUD, validaciones, errores, edge cases
```

### Frontend (Next.js 15) - 60% COMPLETO ⚠️

#### Implementado ✅

```
✅ StarRating Component (Readonly)
   - Visualización de ratings 1-5 con estrellas SVG
   - Soporte para valores decimales (estrellas medio-llenas)
   - Props: rating, totalRatings, size, readonly, className
   - Estilos: small/medium/large, colores variables CSS
   - Accesibilidad: ARIA labels, roles semánticos
   - Tests: 23 tests unitarios con cobertura 100%

✅ ratingsApi Service
   - getRatingStats(courseId)      → GET /courses/{id}/ratings/stats
   - getCourseRatings(courseId)    → GET /courses/{id}/ratings
   - getUserRating(courseId, uid)  → GET /courses/{id}/ratings/user/{uid}
   - createRating(courseId, req)   → POST /courses/{id}/ratings
   - updateRating(courseId, uid, req) → PUT /courses/{id}/ratings/{uid}
   - deleteRating(courseId, uid)   → DELETE /courses/{id}/ratings/{uid}
   - Manejo de errores: ApiError custom con status codes
   - Timeout: 10 segundos por request

✅ Types (rating.ts)
   - CourseRating interface
   - RatingRequest interface
   - RatingStats interface
   - Type guards: isValidRating(), isCourseRating()
   - Custom ApiError class

✅ Course Card Component
   - Muestra average_rating + total_ratings
   - Integra <StarRating readonly={true} />
   - Estilos SCSS con BEM naming

✅ Home Page
   - Fetch de cursos con ratings incluidos
   - Grid de Course cards con ratings visibles
```

#### Pendiente ❌

```
❌ RatingWidget Component (Interactivo)
   - Componente para crear/editar ratings
   - Estados: idle, loading, success, error
   - Props: courseId, userId, onSuccess callback
   - Modo edición vs lectura
   - Validación visual de entrada

❌ Modal/Dialog de Rating
   - Pop-up confirmation antes de guardar
   - Preview del rating a guardar
   - Opción de cancelar/confirmar

❌ Integración en CourseDetail Page
   - Mostrar rating actual del usuario
   - Mostrar promedio de curso
   - Widget RatingWidget interactivo
   - Actualización de UI tras calificar

❌ Sistema de Autenticación/Usuario
   - Obtener userId del usuario logueado
   - Context o state global de usuario
   - Validación de autenticación

❌ Estados UI de Loading/Error
   - Spinner mientras se guarda rating
   - Toast/Notificación de éxito
   - Manejo visual de errores en UI
   - Retry en caso de fallos

❌ Tests de Componentes Interactivos
   - Tests unitarios de RatingWidget
   - Tests de integración Frontend-Backend
   - E2E tests del flujo completo
```

### Mobile (Android + iOS) - 20% COMPLETO ⏳

#### Android (Kotlin)
```
⏳ Listado de cursos: Implementado
   - Muestra cursos con datos básicos
   - API integration vía Retrofit

❌ Visualización de ratings: No implementado
   - No existe componente para mostrar estrellas
   - No se consume GET /ratings/stats

❌ Creación de ratings: No implementado
   - No existe UI para calificar
   - No se integra POST /ratings
```

#### iOS (Swift)
```
⏳ Listado de cursos: Implementado
   - Muestra cursos en lista
   - API integration vía URLSession

❌ Visualización de ratings: No implementado
   - No existe componente para mostrar estrellas
   - No se consume ratings del API

❌ Creación de ratings: No implementado
   - No existe UI para calificar
   - No se integra POST /ratings
```

---

## Impacto por Componente

### 🔵 Backend Impact: NINGUNO ✅

**Estado:** Sistema de ratings completamente implementado
**Cambios necesarios:** NINGUNO
**Riesgo:** BAJO - Código ya testeado

| Aspecto | Actual | Cambio | Impacto |
|---------|--------|--------|---------|
| Modelos | ✅ CourseRating | ✅ Ya existe | 0 cambios |
| Servicios | ✅ CourseService | ✅ 6 métodos listos | 0 cambios |
| Endpoints | ✅ 6 endpoints | ✅ Ya implementados | 0 cambios |
| BD | ✅ Migración aplicada | ✅ Schema correcto | 0 cambios |
| Tests | ✅ 33 test cases | ✅ Cobertura 100% | 0 cambios |

### 🟢 Frontend Impact: MEDIO ⚠️

**Estado:** 60% completo (visualización OK, interacción pendiente)
**Cambios necesarios:** 4-5 componentes nuevos
**Riesgo:** MEDIO - Requiere trabajo de UI/UX

| Aspecto | Actual | Cambio Necesario | Impacto |
|---------|--------|------------------|---------|
| Componentes | StarRating (readonly) | + RatingWidget (interactivo) | +1 componente |
| Pages | Home con ratings visibles | + CourseDetail mejorada | +1 mejora |
| UI/Modales | Ninguno | + Modal de calificación | +1 modal |
| Servicios | ✅ ratingsApi completo | ✅ Solo integrar existentes | 0 cambios nuevos |
| Autenticación | Ninguna | + Sistema usuario/auth | +1 feature |
| Estados | Ninguno | + loading/error states | +1 feature |
| Tests | 23 tests (StarRating) | + 10-15 tests (RatingWidget) | +1 suite |

### 🟡 Mobile Impact: MEDIO-ALTO ⏳

**Estado:** 20% completo (lista OK, ratings no)
**Cambios necesarios:** Componentes de visualización + interacción
**Riesgo:** ALTO - Requiere implementación desde cero

#### Android (Kotlin + Compose)

| Aspecto | Actual | Cambio Necesario | Impacto |
|---------|--------|------------------|---------|
| DTO/Models | CourseDTO | + RatingDTO | +1 modelo |
| API Service | CourseRepository | + RatingRepository | +1 repositorio |
| ViewModel | CourseListViewModel | + RatingViewModel | +1 viewmodel |
| Composables | CourseCard | + StarRatingComposable, RatingWidget | +2 composables |
| Pages | CourseListScreen | + CourseDetailScreen mejorada | +1 mejora |
| Integración | Retrofit OK | + Integración ratings en detail | +1 integración |
| Tests | 5 tests | + 10-15 tests ratings | +2-3 suites |

#### iOS (Swift + SwiftUI)

| Aspecto | Actual | Cambio Necesario | Impacto |
|---------|--------|------------------|---------|
| Models | CourseDTO | + RatingDTO | +1 modelo |
| Repository | RemoteCourseRepository | + RatingRepository | +1 repositorio |
| ViewModel | CourseListViewModel | + RatingViewModel | +1 viewmodel |
| Views | CourseCardView | + StarRatingView, RatingWidget | +2 views |
| Pages | CourseListView | + CourseDetailView mejorada | +1 mejora |
| Integración | URLSession OK | + Integración ratings en detail | +1 integración |
| Tests | 3 tests | + 8-12 tests ratings | +1-2 suites |

### 📊 Base de Datos Impact: NINGUNO ✅

**Estado:** Schema completamente diseñado y migración aplicada
**Cambios necesarios:** NINGUNO
**Riesgo:** BAJO

```sql
✅ Tabla: course_ratings
   - Columnas: id, course_id, user_id, rating, created_at, updated_at, deleted_at
   - Índices: idx_course_id, idx_user_id
   - Constraints: CHECK (rating 1-5), UNIQUE (course_id, user_id, deleted_at), FK
   - Relación: One-to-Many con courses
```

---

## Backend - Análisis Detallado

### Arquitectura Actual

```
FastAPI Application
├── main.py
│   └── 6 endpoints de ratings
├── models/
│   ├── course_rating.py          ✅ Modelo ORM
│   └── course.py                 ✅ Relación back_populates
├── schemas/
│   └── rating.py                 ✅ 4 schemas Pydantic
├── services/
│   └── course_service.py         ✅ 6 métodos rating
├── tests/
│   ├── test_rating_endpoints.py      ✅ 10 tests
│   ├── test_course_rating_service.py ✅ 18 tests
│   └── test_rating_db_constraints.py ✅ 5 tests
└── alembic/
    └── versions/
        └── 0e3a8766f785_*.py     ✅ Migración

PostgreSQL Database
└── course_ratings table          ✅ Schema en BD
```

### Endpoints Detallados

#### 1. POST /courses/{course_id}/ratings
**Propósito:** Crear nuevo rating O actualizar existente

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

**Lógica:** Si usuario ya tiene rating → PUT automático

#### 2. GET /courses/{course_id}/ratings
**Propósito:** Obtener lista de todos los ratings de un curso

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
    {
      "id": 2,
      "course_id": 1,
      "user_id": 3,
      "rating": 5,
      "created_at": "2025-01-16T09:15:00",
      "updated_at": "2025-01-16T09:15:00"
    }
  ]

Errores:
  404: curso no existe
```

**Orden:** Por created_at DESC (más recientes primero)

#### 3. GET /courses/{course_id}/ratings/stats
**Propósito:** Obtener estadísticas agregadas de ratings

```
Response (200 OK):
  {
    "average_rating": 4.5,
    "total_ratings": 100,
    "rating_distribution": {
      "1": 5,    # 5% gave 1 star
      "2": 10,   # 10% gave 2 stars
      "3": 15,   # 15% gave 3 stars
      "4": 35,   # 35% gave 4 stars
      "5": 35    # 35% gave 5 stars
    }
  }

Errores:
  404: curso no existe
```

**Cálculo:** SQL AVG() y COUNT() GROUP BY rating

#### 4. GET /courses/{course_id}/ratings/user/{user_id}
**Propósito:** Obtener rating específico de un usuario

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

#### 5. PUT /courses/{course_id}/ratings/{user_id}
**Propósito:** Actualizar rating existente (semántica PUT)

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
    "rating": 3,  # Actualizado de 4 a 3
    "created_at": "2025-11-20T14:22:00",
    "updated_at": "2025-11-22T10:05:00"  # Nuevo timestamp
  }

Errores:
  400: user_id en body no coincide con path
  400: rating fuera de rango
  404: curso no existe
  404: rating no existe (usuario nunca calificó)
```

#### 6. DELETE /courses/{course_id}/ratings/{user_id}
**Propósito:** Eliminar rating (soft delete)

```
Response (204 No Content):
  [vacío]

Errores:
  404: curso no existe
  404: rating no existe
```

**Operación:** Soft delete → SET deleted_at = NOW()

### Validaciones en Backend

#### Nivel 1: Pydantic (Request Validation)
```python
class RatingRequest(BaseModel):
    user_id: int = Field(..., gt=0, description="Must be > 0")
    rating: int = Field(..., ge=1, le=5, description="Must be 1-5")

    @field_validator('rating')
    @classmethod
    def validate_rating(cls, v):
        if not 1 <= v <= 5:
            raise ValueError('Rating must be between 1 and 5')
        return v
```

#### Nivel 2: Service Layer (Business Logic)
```python
def add_course_rating(self, course_id, user_id, rating):
    # Validar curso existe
    course = self.db.query(Course).filter_by(id=course_id).first()
    if not course:
        raise ValueError(f"Course {course_id} not found")

    # Validar rating 1-5
    if not 1 <= rating <= 5:
        raise ValueError("Rating must be between 1 and 5")

    # Lógica: crear o actualizar
    existing = self.db.query(CourseRating).filter_by(
        course_id=course_id, user_id=user_id, deleted_at=None
    ).first()

    if existing:
        existing.rating = rating
        existing.updated_at = datetime.utcnow()
    else:
        # Crear nuevo
    ...
```

#### Nivel 3: Base de Datos (Constraints)
```sql
ALTER TABLE course_ratings ADD CONSTRAINT check_rating
    CHECK (rating >= 1 AND rating <= 5);

ALTER TABLE course_ratings ADD CONSTRAINT unique_user_course_rating
    UNIQUE (course_id, user_id) WHERE deleted_at IS NULL;
```

### Base de Datos

#### Tabla course_ratings
```sql
CREATE TABLE course_ratings (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id),
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    UNIQUE (course_id, user_id) WHERE deleted_at IS NULL,

    INDEX idx_course_id (course_id),
    INDEX idx_user_id (user_id),
    INDEX idx_deleted_at (deleted_at)
);
```

#### Soft Deletes
- Cada registro tiene `deleted_at`
- Cuando se elimina: SET deleted_at = NOW()
- Queries automáticamente filtran: WHERE deleted_at IS NULL
- Permite auditoría y recuperación

### Testing Backend

**33 Test Cases Totales**

```
test_rating_endpoints.py (10 tests)
├── POST /ratings
│   ├── ✅ Crear rating nuevo
│   ├── ✅ Actualizar rating existente
│   ├── ✅ Rating fuera de rango (400)
│   └── ✅ Curso no existe (404)
├── GET /ratings
│   ├── ✅ Obtener lista
│   └── ✅ Lista vacía (curso sin ratings)
├── GET /ratings/stats
│   └── ✅ Estadísticas correctas
├── GET /ratings/user/{uid}
│   ├── ✅ Existe (200)
│   └── ✅ No existe (204)
├── PUT /ratings/{uid}
│   ├── ✅ Actualizar existente
│   └── ✅ No existe (404)
└── DELETE /ratings/{uid}
    └── ✅ Soft delete correcto

test_course_rating_service.py (18 tests)
├── get_course_ratings (3)
├── add_course_rating (4)
├── update_course_rating (3)
├── delete_course_rating (2)
├── get_user_course_rating (2)
└── get_course_rating_stats (4)

test_rating_db_constraints.py (5 tests)
├── ✅ CHECK constraint (min/max)
├── ✅ UNIQUE constraint
├── ✅ Soft delete behavior
└── ✅ Foreign key constraint
```

### Conclusión Backend

**Status:** ✅ 100% COMPLETO Y LISTO
**Requerimientos:** NINGUNO
**Cambios necesarios:** NINGUNO

El Backend está completamente implementado, testeado y listo para usar. No requiere cambios.

---

## Frontend - Análisis Detallado

### Arquitectura Actual

```
Frontend/src/
├── app/
│   ├── page.tsx                    ✅ Home con ratings visibles
│   ├── course/[slug]/page.tsx      ⚠️ Detalle sin interacción
│   └── classes/[class_id]/page.tsx (Reproductor video)
│
├── components/
│   ├── Course/
│   │   ├── Course.tsx              ✅ Card con StarRating
│   │   └── Course.module.scss
│   ├── CourseDetail/
│   │   └── CourseDetail.tsx        ⚠️ Sin interacción de ratings
│   ├── StarRating/
│   │   ├── StarRating.tsx          ✅ Readonly component
│   │   ├── StarRating.module.scss  ✅ Estilos
│   │   └── __tests__/              ✅ 23 tests
│   └── VideoPlayer/
│       └── VideoPlayer.tsx
│
├── services/
│   └── ratingsApi.ts               ✅ CRUD completo
│
├── types/
│   ├── rating.ts                   ✅ Interfaces + type guards
│   └── index.ts                    ✅ Course con campos rating
│
└── styles/
    ├── reset.scss
    └── vars.scss
```

### Componentes Implementados

#### 1. StarRating Component ✅
**Archivo:** `src/components/StarRating/StarRating.tsx`

**Props:**
```typescript
interface StarRatingProps {
  rating: number;           // 0-5, soporta decimales (4.5)
  totalRatings?: number;    // Mostrar "(42 ratings)"
  showCount?: boolean;      // Mostrar contador
  size?: 'small' | 'medium' | 'large';
  readonly?: boolean;       // Modo solo lectura (true por defecto)
  className?: string;       // CSS adicional
}
```

**Comportamiento:**
- Renderiza 5 estrellas SVG
- Soporta valores decimales con media estrella
- Estilos CSS variables para personalización
- ARIA labels para accesibilidad
- Responsive y flexible

**Ejemplo de uso:**
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

#### 2. Course Card Component ✅
**Archivo:** `src/components/Course/Course.tsx`

**Cambios para ratings:**
```tsx
export const Course = ({
  id, name, description, thumbnail,
  average_rating, total_ratings  // 👈 Props para ratings
}) => (
  <article className={styles.course}>
    <img src={thumbnail} alt={name} />
    <h3>{name}</h3>
    <p>{description}</p>

    {/* 👇 Visualización de ratings */}
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

**Estado actual:** ✅ Implementado
**Impacto:** NINGUNO - Ya funciona

#### 3. ratingsApi Service ✅
**Archivo:** `src/services/ratingsApi.ts`

**Métodos implementados:**
```typescript
const ratingsApi = {
  // GET /courses/{id}/ratings/stats
  async getRatingStats(courseId: number): Promise<RatingStats> {
    const response = await fetch(
      `${API_URL}/courses/${courseId}/ratings/stats`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!response.ok) {
      if (response.status === 404) {
        return { average_rating: 0, total_ratings: 0 };
      }
      throw new ApiError(/* ... */);
    }
    return response.json();
  },

  // GET /courses/{id}/ratings/{user_id}
  async getUserRating(
    courseId: number,
    userId: number
  ): Promise<CourseRating | null> {
    const response = await fetch(
      `${API_URL}/courses/${courseId}/ratings/user/${userId}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (response.status === 204) return null;  // No content
    if (!response.ok) {
      throw new ApiError(/* ... */);
    }
    return response.json();
  },

  // POST /courses/{id}/ratings
  async createRating(
    courseId: number,
    request: RatingRequest
  ): Promise<CourseRating> {
    const response = await fetch(
      `${API_URL}/courses/${courseId}/ratings`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(10000)
      }
    );
    if (!response.ok) {
      throw new ApiError(/* ... */);
    }
    return response.json();
  },

  // PUT /courses/{id}/ratings/{user_id}
  async updateRating(
    courseId: number,
    userId: number,
    request: RatingRequest
  ): Promise<CourseRating> {
    const response = await fetch(
      `${API_URL}/courses/${courseId}/ratings/${userId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(10000)
      }
    );
    if (!response.ok) {
      throw new ApiError(/* ... */);
    }
    return response.json();
  },

  // DELETE /courses/{id}/ratings/{user_id}
  async deleteRating(
    courseId: number,
    userId: number
  ): Promise<void> {
    const response = await fetch(
      `${API_URL}/courses/${courseId}/ratings/${userId}`,
      {
        method: 'DELETE',
        signal: AbortSignal.timeout(10000)
      }
    );
    if (!response.ok) {
      throw new ApiError(/* ... */);
    }
  }
};
```

**Estado actual:** ✅ Implementado
**Impacto:** Listo para usar - Solo falta integración en componentes

### Componentes Faltantes

#### 1. RatingWidget Component ❌

**Necesario para:** Crear/editar ratings de forma interactiva

**Props recomendadas:**
```typescript
interface RatingWidgetProps {
  courseId: number;
  userId: number;
  currentRating?: number;  // Si existe rating previo
  onSuccess?: (rating: CourseRating) => void;
  onError?: (error: ApiError) => void;
}
```

**Funcionalidad:**
- Mostrar estrella interactiva (no readonly)
- Estados: idle, loading, success, error
- Mensaje de confirmación antes de guardar
- Validación visual
- Feedback después de guardar

**Impacto:**
- ⏱️ Tiempo: 3-4 horas de desarrollo
- 🎨 Complejidad: Media
- 🧪 Tests: 10-15 test cases

**Pseudocódigo:**
```tsx
export function RatingWidget({
  courseId, userId, currentRating, onSuccess
}: RatingWidgetProps) {
  const [rating, setRating] = useState(currentRating);
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

#### 2. Modal de Confirmación ❌

**Necesario para:** Confirmar calificación antes de guardar

**Características:**
- Preview del rating a guardar
- Botones: Confirmar, Cancelar
- Puede mostrar rating anterior (si existe)

**Impacto:**
- ⏱️ Tiempo: 1-2 horas
- 🎨 Complejidad: Baja
- 🧪 Tests: 5-8 test cases

#### 3. Integración en CourseDetail Page ⚠️

**Cambios necesarios en:** `src/app/course/[slug]/page.tsx`

**Agregar:**
```tsx
// Dentro de CourseDetail:

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

    {/* Widget para calificar (solo si autenticado) */}
    {currentUser && (
      <section className={styles.rateSection}>
        <h3>Rate this course</h3>
        <RatingWidget
          courseId={courseId}
          userId={currentUser.id}
          currentRating={courseRating?.rating}
          onSuccess={(newRating) => {
            setCourseRating(newRating);
            // Actualizar stats si es necesario
          }}
        />
      </section>
    )}
  </div>
);
```

**Impacto:**
- ⏱️ Tiempo: 2-3 horas
- 🎨 Complejidad: Media
- 🧪 Tests: 8-12 test cases

#### 4. Sistema de Autenticación ❌

**Necesario para:** Obtener usuario actual (userId)

**Opciones:**
1. **JWT en localStorage** - Rápido pero menos seguro
2. **Session cookies** - Más seguro pero requiere backend
3. **NextAuth.js** - Recomendado para Next.js (integración fácil)

**Impacto:**
- ⏱️ Tiempo: 4-6 horas (dependiendo de opción)
- 🎨 Complejidad: Alta
- 🧪 Tests: 15-20 test cases

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

### Estados de Loading/Error ❌

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

**Impacto:**
- ⏱️ Tiempo: 2-3 horas
- 🎨 Complejidad: Baja
- 🧪 Tests: 5-8 test cases

### Tests Faltantes

**StarRating Tests:** ✅ 23 tests existentes

**Tests a agregar:**
```
RatingWidget.test.tsx (~15 tests)
├── Rendering
│   ├── Renderiza 5 estrellas interactivas
│   ├── Muestra rating actual si existe
│   └── Botón de submit visible
├── User Interactions
│   ├── Click en estrella actualiza state local
│   ├── Hover muestra valor de estrella
│   └── Click en submit envía API request
├── States
│   ├── Loading state muestra spinner
│   ├── Success state muestra mensaje
│   ├── Error state muestra error
│   └── Se resetea después de 2 segundos
└── Integración
    ├── onSuccess callback se llama con rating
    ├── Maneja ApiError correctamente
    └── Valida userId antes de enviar

CourseDetail Integration (~12 tests)
├── Renderiza stats de ratings
├── Renderiza RatingWidget si usuario autenticado
├── Fetch de ratings al montar
├── Actualiza UI después de calificar
└── Maneja errores en fetches

Integration Tests (~8 tests)
├── Flujo completo: crear rating
├── Flujo completo: actualizar rating
├── Flujo completo: eliminar rating
└── E2E: usuario califica curso
```

### Resumen Frontend

| Tarea | Estado | Tiempo Est. | Complejidad |
|-------|--------|------------|-------------|
| StarRating (readonly) | ✅ | 0h | - |
| ratingsApi service | ✅ | 0h | - |
| RatingWidget interactivo | ❌ | 3-4h | Media |
| Modal confirmación | ❌ | 1-2h | Baja |
| CourseDetail integración | ⚠️ | 2-3h | Media |
| Sistema autenticación | ❌ | 4-6h | Alta |
| Loading/Error states | ❌ | 2-3h | Baja |
| Tests (RatingWidget + integration) | ❌ | 4-5h | Media |
| **TOTAL** | | **17-26h** | **Media** |

---

## Mobile - Análisis Detallado

### Android (Kotlin + Jetpack Compose)

#### Estado Actual
```
✅ CourseListScreen - Muestra lista de cursos
✅ CourseDTO - Modelo de datos básico
✅ ApiService - Retrofit configurado
✅ CourseRepository - Implementado para cursos

❌ Visualización de ratings - No existe
❌ Creación de ratings - No existe
❌ CourseDetailScreen - No completa
```

#### Cambios Necesarios

**1. Actualizar CourseDTO**
```kotlin
@Serializable
data class CourseDTO(
    val id: Int,
    val name: String,
    val description: String,
    val thumbnail: String,
    val slug: String,
    val average_rating: Float?,      // 👈 Nuevo
    val total_ratings: Int?,          // 👈 Nuevo
    val teacher_id: List<Int>,
    val created_at: String,
    val updated_at: String,
    val deleted_at: String?
)
```

**Impacto:** Bajo, solo 2 campos nuevos

**2. Agregar RatingDTO**
```kotlin
@Serializable
data class RatingDTO(
    val id: Int,
    val course_id: Int,
    val user_id: Int,
    val rating: Int,  // 1-5
    val created_at: String,
    val updated_at: String
)

@Serializable
data class RatingStatsDTO(
    val average_rating: Float,
    val total_ratings: Int,
    val rating_distribution: Map<Int, Int>
)
```

**Impacto:** Bajo, nuevos modelos sin efectos colaterales

**3. Actualizar ApiService**
```kotlin
interface ApiService {
    // Ya existe
    @GET("/courses")
    suspend fun getCourses(): List<CourseDTO>

    // Nuevos endpoints de ratings
    @GET("/courses/{course_id}/ratings/stats")
    suspend fun getCourseRatingStats(
        @Path("course_id") courseId: Int
    ): RatingStatsDTO

    @GET("/courses/{course_id}/ratings/user/{user_id}")
    suspend fun getUserRating(
        @Path("course_id") courseId: Int,
        @Path("user_id") userId: Int
    ): RatingDTO?

    @POST("/courses/{course_id}/ratings")
    suspend fun createRating(
        @Path("course_id") courseId: Int,
        @Body request: RatingRequest
    ): RatingDTO

    @PUT("/courses/{course_id}/ratings/{user_id}")
    suspend fun updateRating(
        @Path("course_id") courseId: Int,
        @Path("user_id") userId: Int,
        @Body request: RatingRequest
    ): RatingDTO

    @DELETE("/courses/{course_id}/ratings/{user_id}")
    suspend fun deleteRating(
        @Path("course_id") courseId: Int,
        @Path("user_id") userId: Int
    ): Unit
}

data class RatingRequest(
    val user_id: Int,
    val rating: Int
)
```

**Impacto:** Bajo, extensión de ApiService

**4. Crear RatingRepository**
```kotlin
interface RatingRepository {
    suspend fun getRatingStats(courseId: Int): Result<RatingStatsDTO>
    suspend fun getUserRating(courseId: Int, userId: Int): Result<RatingDTO?>
    suspend fun createRating(courseId: Int, request: RatingRequest): Result<RatingDTO>
    suspend fun updateRating(courseId: Int, userId: Int, request: RatingRequest): Result<RatingDTO>
    suspend fun deleteRating(courseId: Int, userId: Int): Result<Unit>
}

class RemoteRatingRepository(
    private val apiService: ApiService
) : RatingRepository {
    override suspend fun getRatingStats(courseId: Int): Result<RatingStatsDTO> {
        return try {
            Result.success(apiService.getCourseRatingStats(courseId))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    // ... resto de métodos
}
```

**Impacto:** Bajo, nuevo repositorio sin efectos

**5. Crear StarRatingComposable**
```kotlin
@Composable
fun StarRating(
    rating: Float,
    totalRatings: Int = 0,
    size: Dp = 20.dp,
    readonly: Boolean = true,
    onRatingChange: (Int) -> Unit = {},
    modifier: Modifier = Modifier
) {
    Row(modifier = modifier.fillMaxWidth()) {
        repeat(5) { index ->
            val isFilled = index < rating
            val isHalf = index == rating.toInt() && rating % 1 != 0f

            Icon(
                imageVector = if (isFilled) Icons.Filled.Star else Icons.Outlined.Star,
                contentDescription = "Star ${index + 1}",
                modifier = Modifier
                    .size(size)
                    .clickable { if (!readonly) onRatingChange(index + 1) },
                tint = if (isFilled || isHalf) Color(0xFFFF6D00) else Color.Gray
            )
        }

        if (totalRatings > 0) {
            Text("$rating ($totalRatings)", modifier = Modifier.padding(start = 8.dp))
        }
    }
}
```

**Impacto:** Bajo, componente nuevo standalone

**6. Crear RatingViewModel**
```kotlin
@HiltViewModel
class RatingViewModel @Inject constructor(
    private val ratingRepository: RatingRepository
) : ViewModel() {

    private val _ratingStats = MutableStateFlow<RatingStatsDTO?>(null)
    val ratingStats: StateFlow<RatingStatsDTO?> = _ratingStats.asStateFlow()

    private val _userRating = MutableStateFlow<RatingDTO?>(null)
    val userRating: StateFlow<RatingDTO?> = _userRating.asStateFlow()

    private val _ratingUiState = MutableStateFlow<RatingUiState>(RatingUiState.Idle)
    val ratingUiState: StateFlow<RatingUiState> = _ratingUiState.asStateFlow()

    fun loadRatingStats(courseId: Int, userId: Int) {
        viewModelScope.launch {
            _ratingUiState.value = RatingUiState.Loading
            val result = ratingRepository.getRatingStats(courseId)
            result.onSuccess { stats ->
                _ratingStats.value = stats
                loadUserRating(courseId, userId)
            }.onFailure {
                _ratingUiState.value = RatingUiState.Error(it.message ?: "Unknown error")
            }
        }
    }

    fun createRating(courseId: Int, userId: Int, rating: Int) {
        viewModelScope.launch {
            _ratingUiState.value = RatingUiState.Loading
            val result = ratingRepository.createRating(
                courseId,
                RatingRequest(userId, rating)
            )
            result.onSuccess { newRating ->
                _userRating.value = newRating
                _ratingUiState.value = RatingUiState.Success
            }.onFailure {
                _ratingUiState.value = RatingUiState.Error(it.message ?: "Failed to save rating")
            }
        }
    }

    // ... otros métodos
}

sealed class RatingUiState {
    object Idle : RatingUiState()
    object Loading : RatingUiState()
    object Success : RatingUiState()
    data class Error(val message: String) : RatingUiState()
}
```

**Impacto:** Bajo, nuevo ViewModel

**7. Crear CourseDetailScreen**
```kotlin
@Composable
fun CourseDetailScreen(
    courseId: String,
    viewModel: CourseListViewModel = hiltViewModel(),
    ratingViewModel: RatingViewModel = hiltViewModel()
) {
    val course by viewModel.getCourse(courseId)
    val ratingStats by ratingViewModel.ratingStats.collectAsStateWithLifecycle()
    val userRating by ratingViewModel.userRating.collectAsStateWithLifecycle()
    val ratingUiState by ratingViewModel.ratingUiState.collectAsStateWithLifecycle()

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        item {
            // Course info
            course?.let { c ->
                Image(c.thumbnail)
                Text(c.name, style = MaterialTheme.typography.headlineSmall)
                Text(c.description)
            }
        }

        item {
            // Ratings section
            ratingStats?.let { stats ->
                Column {
                    Text("Ratings", style = MaterialTheme.typography.titleMedium)
                    StarRating(
                        rating = stats.average_rating,
                        totalRatings = stats.total_ratings,
                        readonly = true
                    )
                }
            }
        }

        item {
            // Rating widget
            Column {
                Text("Rate this course", style = MaterialTheme.typography.titleMedium)
                StarRating(
                    rating = (userRating?.rating?.toFloat()) ?: 0f,
                    readonly = false,
                    onRatingChange = { newRating ->
                        if (userRating != null) {
                            ratingViewModel.updateRating(courseId.toInt(), newRating)
                        } else {
                            ratingViewModel.createRating(courseId.toInt(), newRating)
                        }
                    }
                )

                when (ratingUiState) {
                    is RatingUiState.Loading -> CircularProgressIndicator()
                    is RatingUiState.Success -> Text("Rating saved!")
                    is RatingUiState.Error -> Text("Error: ${(ratingUiState as RatingUiState.Error).message}")
                    else -> {}
                }
            }
        }
    }

    LaunchedEffect(courseId) {
        ratingViewModel.loadRatingStats(courseId.toInt(), 1) // TODO: obtener userId real
    }
}
```

**Impacto:** Medio, nuevos componentes y lógica

#### Tests Android

```
RatingRepositoryTests (8 tests)
├── getRatingStats success
├── getRatingStats failure
├── createRating success
├── createRating validation error
├── updateRating success
├── deleteRating success
├── Manejo de errores de red
└── Manejo de errores de parsing

RatingViewModelTests (10 tests)
├── Initial state
├── Load rating stats success
├── Load rating stats failure
├── Create rating success
├── Update rating success
├── Delete rating success
├── Manejo de excepciones
└── State management correcto

StarRatingComposableTests (8 tests)
├── Renderiza 5 estrellas
├── Click en estrella actualiza valor
├── Readonly mode funciona
├── Muestra total de ratings
└── Valores decimales

CourseDetailScreenTests (10 tests)
├── Renderiza información del curso
├── Muestra ratings stats
├── Renderiza widget de rating
├── Loading states
├── Error states
└── Integración con ViewModels
```

**Total tests Android:** ~36 tests

#### Impacto Android

| Tarea | Tiempo Est. | Complejidad |
|-------|------------|-------------|
| Actualizar CourseDTO | 0.5h | Baja |
| Agregar RatingDTO | 0.5h | Baja |
| Extender ApiService | 1h | Baja |
| Crear RatingRepository | 2h | Media |
| StarRatingComposable | 2h | Media |
| RatingViewModel | 2-3h | Media |
| CourseDetailScreen | 3-4h | Media-Alta |
| Tests (36 tests) | 5-6h | Media |
| **TOTAL** | **16-20h** | **Media** |

### iOS (Swift + SwiftUI)

#### Estado Actual
```
✅ CourseListView - Muestra lista de cursos
✅ CourseDTO - Modelo básico
✅ NetworkManager - URLSession configurado
✅ RemoteCourseRepository - Para cursos

❌ Visualización de ratings - No existe
❌ Creación de ratings - No existe
❌ CourseDetailView - No completa
```

#### Cambios Necesarios (Similar a Android)

**1. Actualizar CourseDTO**
```swift
struct CourseDTO: Codable {
    let id: Int
    let name: String
    let description: String
    let thumbnail: String
    let slug: String
    let average_rating: Float?     // 👈 Nuevo
    let total_ratings: Int?         // 👈 Nuevo
    let teacher_id: [Int]
    let created_at: String
    let updated_at: String
    let deleted_at: String?
}
```

**2. Crear RatingDTO**
```swift
struct RatingDTO: Codable {
    let id: Int
    let course_id: Int
    let user_id: Int
    let rating: Int
    let created_at: String
    let updated_at: String
}

struct RatingStatsDTO: Codable {
    let average_rating: Float
    let total_ratings: Int
    let rating_distribution: [Int: Int]
}

struct RatingRequest: Codable {
    let user_id: Int
    let rating: Int
}
```

**3. Extender API endpoints**
```swift
enum RatingAPIEndpoints: APIEndpoint {
    case getRatingStats(courseId: Int)
    case getUserRating(courseId: Int, userId: Int)
    case createRating(courseId: Int)
    case updateRating(courseId: Int, userId: Int)
    case deleteRating(courseId: Int, userId: Int)

    var path: String {
        switch self {
        case .getRatingStats(let courseId):
            return "/courses/\(courseId)/ratings/stats"
        case .getUserRating(let courseId, let userId):
            return "/courses/\(courseId)/ratings/user/\(userId)"
        // ... etc
        }
    }

    var method: HTTPMethod {
        switch self {
        case .getRatingStats, .getUserRating:
            return .get
        case .createRating:
            return .post
        case .updateRating:
            return .put
        case .deleteRating:
            return .delete
        }
    }
}
```

**4. Crear RatingRepository**
```swift
protocol RatingRepositoryProtocol {
    func getRatingStats(courseId: Int) async throws -> RatingStatsDTO
    func getUserRating(courseId: Int, userId: Int) async throws -> RatingDTO?
    func createRating(courseId: Int, request: RatingRequest) async throws -> RatingDTO
    func updateRating(courseId: Int, userId: Int, request: RatingRequest) async throws -> RatingDTO
    func deleteRating(courseId: Int, userId: Int) async throws
}

class RemoteRatingRepository: RatingRepositoryProtocol {
    private let networkManager: NetworkManager

    func getRatingStats(courseId: Int) async throws -> RatingStatsDTO {
        let endpoint = RatingAPIEndpoints.getRatingStats(courseId: courseId)
        return try await networkManager.request(
            endpoint: endpoint,
            responseType: RatingStatsDTO.self
        )
    }

    // ... resto de métodos
}
```

**5. Crear StarRatingView**
```swift
struct StarRatingView: View {
    let rating: Float
    let totalRatings: Int
    let size: CGFloat
    let readonly: Bool
    let onRatingChange: (Int) -> Void

    var body: some View {
        HStack(spacing: 4) {
            ForEach(1...5, id: \.self) { index in
                Image(systemName: starName(for: index))
                    .font(.system(size: size))
                    .foregroundColor(index <= Int(rating) ? .orange : .gray)
                    .onTapGesture {
                        if !readonly {
                            onRatingChange(index)
                        }
                    }
            }

            if totalRatings > 0 {
                Text("\(rating, specifier: "%.1f") (\(totalRatings))")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
    }

    private func starName(for index: Int) -> String {
        if index <= Int(rating) {
            return "star.fill"
        } else if index - 1 < rating && rating.truncatingRemainder(dividingBy: 1) > 0 {
            return "star.leadinghalf.fill"
        } else {
            return "star"
        }
    }
}
```

**6. Crear RatingViewModel**
```swift
@Observable
final class RatingViewModel {
    var ratingStats: RatingStatsDTO?
    var userRating: RatingDTO?
    var isLoading = false
    var errorMessage: String?

    private let repository: RatingRepositoryProtocol

    init(repository: RatingRepositoryProtocol = RemoteRatingRepository()) {
        self.repository = repository
    }

    @MainActor
    func loadRatingStats(courseId: Int, userId: Int) async {
        isLoading = true
        errorMessage = nil

        do {
            ratingStats = try await repository.getRatingStats(courseId: courseId)
            userRating = try await repository.getUserRating(courseId: courseId, userId: userId)
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }

    @MainActor
    func submitRating(courseId: Int, userId: Int, rating: Int) async {
        isLoading = true
        errorMessage = nil

        do {
            let request = RatingRequest(user_id: userId, rating: rating)
            if userRating != nil {
                userRating = try await repository.updateRating(
                    courseId: courseId,
                    userId: userId,
                    request: request
                )
            } else {
                userRating = try await repository.createRating(
                    courseId: courseId,
                    request: request
                )
            }
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}
```

**7. Crear CourseDetailView**
```swift
struct CourseDetailView: View {
    let course: Course
    @State private var viewModel = RatingViewModel()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                // Course image
                AsyncImage(url: URL(string: course.thumbnail)) { image in
                    image.resizable().scaledToFill()
                } placeholder: {
                    Color.gray
                }
                .frame(height: 200)
                .clipped()

                // Course info
                VStack(alignment: .leading, spacing: 8) {
                    Text(course.name)
                        .font(.title2)
                        .fontWeight(.bold)

                    Text(course.description)
                        .font(.body)
                        .foregroundColor(.secondary)
                }
                .padding(.horizontal)

                Divider()

                // Ratings section
                if let stats = viewModel.ratingStats {
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Ratings")
                            .font(.headline)

                        StarRatingView(
                            rating: stats.average_rating,
                            totalRatings: stats.total_ratings,
                            size: 20,
                            readonly: true,
                            onRatingChange: { _ in }
                        )
                    }
                    .padding(.horizontal)
                }

                Divider()

                // Rating widget
                VStack(alignment: .leading, spacing: 12) {
                    Text("Rate this course")
                        .font(.headline)

                    if viewModel.isLoading {
                        ProgressView()
                    } else {
                        StarRatingView(
                            rating: Float(viewModel.userRating?.rating ?? 0),
                            totalRatings: 0,
                            size: 24,
                            readonly: false,
                            onRatingChange: { rating in
                                Task {
                                    await viewModel.submitRating(
                                        courseId: course.id,
                                        userId: 1,
                                        rating: rating
                                    )
                                }
                            }
                        )

                        if let error = viewModel.errorMessage {
                            Text(error)
                                .font(.caption)
                                .foregroundColor(.red)
                        }
                    }
                }
                .padding(.horizontal)

                Spacer()
            }
        }
        .task {
            await viewModel.loadRatingStats(courseId: course.id, userId: 1)
        }
    }
}
```

#### Tests iOS

```
RatingRepositoryTests (8 tests)
├── getRatingStats success
├── getUserRating success/null
├── createRating success
├── updateRating success
├── deleteRating success
├── Manejo de errores de network
└── Parsing de respuestas

RatingViewModelTests (10 tests)
├── Initial state
├── Load rating stats
├── Submit new rating
├── Update existing rating
├── Delete rating
├── Error handling
└── MainActor updates

StarRatingViewTests (8 tests)
├── Renderiza 5 estrellas
├── Click en star (readonly=false)
├── Mostrar total de ratings
├── Media estrella
└── Valores decimales

CourseDetailViewTests (10 tests)
├── Renderiza curso
├── Muestra stats
├── Renderiza widget
├── Loading states
├── Error display
├── Task execution
└── Integration con ViewModel
```

**Total tests iOS:** ~36 tests

#### Impacto iOS

| Tarea | Tiempo Est. | Complejidad |
|-------|------------|-------------|
| Actualizar CourseDTO | 0.5h | Baja |
| Crear RatingDTO | 0.5h | Baja |
| Extender API endpoints | 1h | Baja |
| Crear RatingRepository | 1.5h | Baja |
| StarRatingView | 2h | Media |
| RatingViewModel | 2h | Media |
| CourseDetailView | 2-3h | Media |
| Tests (36 tests) | 4-5h | Media |
| **TOTAL** | **14-17h** | **Media-Baja** |

---

## Plan de Implementación

### Fase 1: Backend (YA COMPLETADO ✅)

**Status:** 100% hecho
**Duración:** 0 horas
**Acciones:** NINGUNA

El backend está completamente implementado, testeado y en producción.

### Fase 2: Frontend - Visualización (COMPLETADO 60%)

**Tareas a completar:**

1. **Componente RatingWidget Interactivo**
   - Duración: 3-4 horas
   - Crear componente con estados de loading/error
   - Props: courseId, userId, onSuccess callback
   - Estilos según diseño de Platzi

2. **Modal de Confirmación**
   - Duración: 1-2 horas
   - Dialog/Modal para confirmar calificación
   - Preview del rating
   - Botones Confirmar/Cancelar

3. **Integración en CourseDetail**
   - Duración: 2-3 horas
   - Agregar RatingWidget a página de detalle
   - Cargar rating stats al montar
   - Actualizar UI después de calificar

4. **Sistema de Autenticación Básico**
   - Duración: 3-4 horas
   - Context API para usuario actual
   - Obtener userId del usuario autenticado
   - Validar que usuario esté autenticado

5. **Estados de Loading/Error UI**
   - Duración: 1-2 horas
   - Spinner durante guardado
   - Toast de éxito/error
   - Retry en caso de fallos

6. **Tests**
   - Duración: 4-5 horas
   - Tests de RatingWidget
   - Tests de integración
   - E2E tests de flujo completo

**Subtotal Fase 2:** 14-20 horas

### Fase 3: Mobile

#### Android (16-20 horas)

1. **Actualizar DTOs y Tipos**
   - Duración: 1 hora
   - Agregar rating fields a CourseDTO
   - Crear RatingDTO, RatingStatsDTO, RatingRequest

2. **Extender API Service**
   - Duración: 1 hora
   - Agregar endpoints de ratings a Retrofit

3. **Crear RatingRepository**
   - Duración: 2 horas
   - Implementar interfaz de ratings
   - Manejo de errores

4. **StarRatingComposable**
   - Duración: 2 horas
   - Componente visual de estrellas
   - Soportar readonly y editable

5. **RatingViewModel**
   - Duración: 2-3 horas
   - StateFlow para ratings
   - Métodos CRUD

6. **CourseDetailScreen**
   - Duración: 3-4 horas
   - Mostrar stats de ratings
   - Renderizar RatingWidget
   - Integración completa

7. **Tests**
   - Duración: 5-6 horas
   - Repository tests
   - ViewModel tests
   - Composable tests
   - Screen integration tests

**Subtotal Fase 3 - Android:** 16-20 horas

#### iOS (14-17 horas)

1. **Actualizar DTOs y Tipos**
   - Duración: 1 hora

2. **Extender API endpoints**
   - Duración: 1 hora

3. **Crear RatingRepository**
   - Duración: 1.5 horas

4. **StarRatingView**
   - Duración: 2 horas

5. **RatingViewModel**
   - Duración: 2 horas

6. **CourseDetailView**
   - Duración: 2-3 horas

7. **Tests**
   - Duración: 4-5 horas

**Subtotal Fase 3 - iOS:** 14-17 horas

### Timeline Estimado

```
Fase 1: Backend          ✅ 0h    (completado)
Fase 2: Frontend         ⏳ 14-20h (TODO)
Fase 3: Android          ⏳ 16-20h (TODO)
Fase 3: iOS              ⏳ 14-17h (TODO)
────────────────────────────────
TOTAL                       44-57h (3-4 semanas)
```

---

## Estimación de Esfuerzo

### Por Componente

| Componente | Tiempo (horas) | Complejidad | Persona |
|---|---|---|---|
| **Frontend** | 14-20 | Media | 1 dev |
| **Android** | 16-20 | Media | 1 dev |
| **iOS** | 14-17 | Media-Baja | 1 dev |
| **Testing Total** | 13-16 | Media | 1 dev |
| **DevOps/Deploy** | 2-3 | Baja | 1 dev |
| **Documentación** | 2-3 | Baja | 1 dev |

### Por Sprint (1 sprint = 40 horas / 1 dev)

```
Sprint 1: Frontend
├── Crear RatingWidget (3-4h)
├── Modal confirmación (1-2h)
├── Integración CourseDetail (2-3h)
├── Auth básico (3-4h)
├── Estados loading/error (1-2h)
└── Tests (4-5h)
Total: 14-20h ✓

Sprint 2: Mobile (Android)
├── Actualizar DTOs (1h)
├── API Service (1h)
├── Repository (2h)
├── Composables (2h)
├── ViewModel (2-3h)
├── DetailScreen (3-4h)
└── Tests (5-6h)
Total: 16-20h ✓

Sprint 3: Mobile (iOS)
├── Actualizar DTOs (1h)
├── API endpoints (1h)
├── Repository (1.5h)
├── Views (4h)
├── ViewModel (2h)
└── Tests (4-5h)
Total: 14-17h ✓

Sprint 4: QA + Optimización
├── Testing integración (5-8h)
├── Performance (2-3h)
├── Documentación (2-3h)
└── Bug fixes (2-4h)
Total: 11-18h
```

**Timeline:** 3-4 semanas con 1 dev por plataforma

---

## Riesgos y Mitigaciones

### Riesgos Técnicos

#### 1. Autenticación/Usuario No Implementado
**Severidad:** Alta
**Probabilidad:** Alta

**Problema:** Sin sistema de auth, no hay userId para ratings

**Mitigación:**
- Implementar auth básica primero (NextAuth.js recomendado)
- O usar userId hardcoded durante desarrollo
- Después migrar a auth real

#### 2. Integración Frontend-Backend
**Severidad:** Media
**Probabilidad:** Media

**Problema:** Endpoints Backend pueden cambiar, rutas pueden estar mal

**Mitigación:**
- Tests de integración antes de deploy
- Usar Swagger UI para verificar endpoints
- Documentación clara de endpoints

#### 3. Mobile UI inconsistencia
**Severidad:** Baja
**Probabilidad:** Alta

**Problema:** StarRating se ve diferente en Android vs iOS vs Web

**Mitigación:**
- Crear design system centralizado
- Usar Material 3 en Android
- Usar SwiftUI native components en iOS
- Mantener paleta de colores consistente

### Riesgos de Scope

#### 1. Feature Creep
**Severidad:** Alta
**Probabilidad:** Media

**Problema:** Agregarle más features a ratings

**Mitigación:**
- Mantener scope mínimo: CREATE, READ, UPDATE, DELETE (CRUD)
- Dejar para MVP 2: historial, filtraje, paginación
- Documentar claramente lo que está IN-SCOPE vs OUT-SCOPE

#### 2. Cambios de Especificación
**Severidad:** Media
**Probabilidad:** Media

**Problema:** Requisitos cambian durante implementación

**Mitigación:**
- Validar requisitos ANTES de empezar
- Comunicación clara con stakeholders
- Documentar decisiones tomadas

### Riesgos de Implementación

#### 1. Tests Incompletos
**Severidad:** Media
**Probabilidad:** Alta

**Problema:** Tests no cubren todos los casos

**Mitigación:**
- Requerir >80% de cobertura
- Tests de integración obligatorios
- E2E tests para flujo principal

#### 2. Performance
**Severidad:** Baja
**Probabilidad:** Baja

**Problema:** Rating API es lenta con muchos usuarios

**Mitigación:**
- Índices en BD (ya implementados)
- Caché de stats (opcional para MVP)
- Paginación de ratings (futura feature)

---

## Checklist de Implementación

### Frontend

- [ ] Leer spec de ratings completamente
- [ ] Diseñar UI mockups de RatingWidget
- [ ] Crear componente RatingWidget
  - [ ] Estados: idle, loading, success, error
  - [ ] Props: courseId, userId, onSuccess
  - [ ] Estilos SCSS según diseño
  - [ ] Validaciones
- [ ] Crear Modal/Dialog confirmación
  - [ ] Preview del rating
  - [ ] Botones confirmar/cancelar
  - [ ] Animaciones
- [ ] Implementar autenticación básica
  - [ ] UserContext
  - [ ] useUser hook
  - [ ] Obtener userId en componentes
- [ ] Integrar en CourseDetail
  - [ ] Mostrar stats
  - [ ] Renderizar widget
  - [ ] Actualizar UI post-save
- [ ] Estados de loading/error
  - [ ] Spinner component
  - [ ] Toast notifications
  - [ ] Error boundaries
- [ ] Tests
  - [ ] RatingWidget.test.tsx (15+ tests)
  - [ ] CourseDetail integration (10+ tests)
  - [ ] E2E tests (5+ scenarios)
- [ ] Code review
- [ ] Testing en staging
- [ ] Deploy a producción

### Android

- [ ] Leer spec de ratings
- [ ] Actualizar CourseDTO con rating fields
- [ ] Crear RatingDTO, RatingStatsDTO
- [ ] Extender ApiService con endpoints
- [ ] Crear RatingRepository
  - [ ] Interface
  - [ ] RemoteRatingRepository
  - [ ] Error handling
- [ ] Crear RatingViewModel
  - [ ] StateFlow para ratings
  - [ ] Métodos CRUD
  - [ ] Manejo de estados
- [ ] StarRatingComposable
  - [ ] Renderización de estrellas
  - [ ] Modo readonly y editable
  - [ ] Tamaños variables
- [ ] CourseDetailScreen
  - [ ] Mostrar stats
  - [ ] Rating widget
  - [ ] Integración completa
- [ ] Tests
  - [ ] Repository (8+ tests)
  - [ ] ViewModel (10+ tests)
  - [ ] Composables (8+ tests)
  - [ ] Screens (10+ tests)
- [ ] Code review
- [ ] Test en emulator
- [ ] Build APK
- [ ] Deploy (si aplica)

### iOS

- [ ] Leer spec de ratings
- [ ] Actualizar CourseDTO
- [ ] Crear RatingDTO, RatingStatsDTO
- [ ] Extender API endpoints
- [ ] Crear RatingRepository
- [ ] Crear RatingViewModel
- [ ] StarRatingView
  - [ ] SVG stars o SF Symbols
  - [ ] Half stars
  - [ ] Interactive y readonly
- [ ] CourseDetailView
  - [ ] Stats section
  - [ ] Rating widget
  - [ ] Full integration
- [ ] Tests
  - [ ] Repository (8+ tests)
  - [ ] ViewModel (10+ tests)
  - [ ] Views (8+ tests)
  - [ ] DetailView (10+ tests)
- [ ] Code review
- [ ] Test en simulator
- [ ] Build IPA
- [ ] TestFlight (si aplica)

### QA y Validación

- [ ] Flujo manual completo: crear rating
  - [ ] Web
  - [ ] Android
  - [ ] iOS
- [ ] Flujo manual: actualizar rating
- [ ] Flujo manual: eliminar rating
- [ ] Validaciones
  - [ ] Rating 1-5 validado
  - [ ] Usuario requerido
  - [ ] Curso requerido
- [ ] Errores de red
  - [ ] Timeout
  - [ ] 404
  - [ ] 500
  - [ ] Connection refused
- [ ] Performance
  - [ ] Load time de ratings
  - [ ] Memory usage
  - [ ] Battery impact (mobile)
- [ ] Compatibilidad
  - [ ] Navegadores (Chrome, Firefox, Safari)
  - [ ] Versiones iOS (13+)
  - [ ] Versiones Android (API 24+)

### Documentación

- [ ] README actualizado
- [ ] API docs (Swagger)
- [ ] Component docs
  - [ ] StarRating
  - [ ] RatingWidget
  - [ ] RatingViewModel
- [ ] Setup guide para devs
- [ ] Architecture diagram
- [ ] Test coverage report

### Deployment

- [ ] Frontend
  - [ ] Build optimizado
  - [ ] Environment variables
  - [ ] Deploy a Vercel/hosting
- [ ] Android
  - [ ] Release APK
  - [ ] Play Store (si aplica)
- [ ] iOS
  - [ ] Release IPA
  - [ ] App Store (si aplica)
- [ ] Monitoreo
  - [ ] Error tracking (Sentry)
  - [ ] Analytics
  - [ ] Logs

---

## Conclusión

### Resumen de Impacto

**Sistema de Ratings: Impacto BAJO-MEDIO ✅**

```
Backend:    100% completo  ✅ LISTO
Frontend:    60% completo  ⚠️ 14-20h para completar
Android:     20% completo  ⏳ 16-20h de trabajo
iOS:         20% completo  ⏳ 14-17h de trabajo
────────────────────────────────
TOTAL:                        44-57h (3-4 semanas)
```

### Próximos Pasos Recomendados

1. **Inmediato:** Revisar y aprobar este documento de impacto
2. **Corto plazo:** Iniciar Fase 2 (Frontend - prioritario)
3. **Mediano plazo:** Iniciar Fase 3 (Mobile - paralelo)
4. **Validación:** QA completo antes de release

### Beneficios de Implementar Ratings

✅ Aumenta engagement de usuarios
✅ Proporciona retroalimentación sobre cursos
✅ Ayuda a otros usuarios a elegir cursos
✅ Mejora credibilidad de la plataforma
✅ Data para mejora de cursos

---

**Documento preparado por:** Claude Code
**Fecha:** 2025-11-22
**Estado:** Listo para implementación
