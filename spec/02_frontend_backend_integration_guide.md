# Frontend-Backend Integration Guide: Sistema de Ratings

## 📚 Resumen Ejecutivo

El sistema de ratings **está completamente implementado** en Backend. Este documento es una guía de referencia para que el Frontend lo integre correctamente.

**Estado:**
- ✅ Backend: 99% completo (44 tests pasando)
- ✅ Database: Migración ejecutada, tabla creada
- 🟡 Frontend: 65% completo (tipos + API service listos, UI interactiva parcial)

---

## 1. ENDPOINTS API DISPONIBLES

### Base URL
```
http://localhost:8000
(Frontend puede usar NEXT_PUBLIC_API_URL env var)
```

### Operaciones de Rating

#### 📝 POST /courses/{course_id}/ratings
**Crear o actualizar rating**

```bash
curl -X POST http://localhost:8000/courses/1/ratings \
  -H "Content-Type: application/json" \
  -d '{"user_id": 42, "rating": 5}'
```

**Request Body:**
```json
{
  "user_id": integer,      // > 0 (validado Pydantic)
  "rating": integer        // 1-5 (validado Pydantic + DB)
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "course_id": 1,
  "user_id": 42,
  "rating": 5,
  "created_at": "2025-10-14T10:30:00",
  "updated_at": "2025-10-14T10:30:00"
}
```

**Error Responses:**
- `400`: Rating fuera de rango (< 1 o > 5)
- `404`: Curso no existe
- `422`: Validación Pydantic fallida

**Lógica Backend:**
- Si user_id ya tiene rating activo → UPDATE (actualiza el valor)
- Si es nuevo → CREATE (inserta nuevo record)

---

#### 📖 GET /courses/{course_id}/ratings
**Obtener todos los ratings de un curso**

```bash
curl http://localhost:8000/courses/1/ratings
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "course_id": 1,
    "user_id": 42,
    "rating": 5,
    "created_at": "2025-10-14T10:30:00",
    "updated_at": "2025-10-14T10:30:00"
  },
  ...
]
```

**Notas:**
- Retorna array vacío si curso tiene 0 ratings
- Solo retorna ratings activos (deleted_at IS NULL)
- Ordenado por created_at DESC

---

#### 📊 GET /courses/{course_id}/ratings/stats
**Obtener estadísticas agregadas de ratings**

```bash
curl http://localhost:8000/courses/1/ratings/stats
```

**Response (200 OK):**
```json
{
  "average_rating": 4.35,
  "total_ratings": 142,
  "rating_distribution": {
    "1": 5,
    "2": 10,
    "3": 25,
    "4": 50,
    "5": 52
  }
}
```

**Notas:**
- `average_rating`: float redondeado a 2 decimales
- `total_ratings`: cuenta solo ratings activos
- `rating_distribution`: objeto con claves string "1"-"5"
- Si no hay ratings: todos los valores son 0

**Cuándo usar:**
- Cargar página de curso (mostrar estadísticas agregadas)
- Después de crear/actualizar/eliminar un rating (refetch)

---

#### 👤 GET /courses/{course_id}/ratings/user/{user_id}
**Obtener el rating específico de un usuario**

```bash
curl http://localhost:8000/courses/1/ratings/user/42
```

**Response si usuario ya calificó (200 OK):**
```json
{
  "id": 123,
  "course_id": 1,
  "user_id": 42,
  "rating": 4,
  "created_at": "2025-10-14T10:30:00",
  "updated_at": "2025-10-14T10:30:00"
}
```

**Response si usuario NO ha calificado (204 No Content):**
```
HTTP 204
```

**Cuándo usar:**
- Cargar página de curso para pre-llenar la UI
- Mostrar al usuario cuál fue su rating anterior

---

#### ✏️ PUT /courses/{course_id}/ratings/{user_id}
**Actualizar un rating existente**

```bash
curl -X PUT http://localhost:8000/courses/1/ratings/42 \
  -H "Content-Type: application/json" \
  -d '{"user_id": 42, "rating": 3}'
```

**Request Body:**
```json
{
  "user_id": 42,          // DEBE COINCIDIR con user_id en path
  "rating": 3             // 1-5
}
```

**Response (200 OK):**
```json
{
  "id": 123,
  "course_id": 1,
  "user_id": 42,
  "rating": 3,
  "created_at": "2025-10-14T10:30:00",
  "updated_at": "2025-10-14T10:30:01"
}
```

**Error Responses:**
- `400`: user_id en body no coincide con user_id en path
- `404`: Rating no existe para ese usuario-curso

---

#### 🗑️ DELETE /courses/{course_id}/ratings/{user_id}
**Eliminar un rating (soft delete)**

```bash
curl -X DELETE http://localhost:8000/courses/1/ratings/42
```

**Response (204 No Content):**
```
HTTP 204
```

**Notas:**
- Soft delete: establece `deleted_at` pero preserva datos
- Usuario puede volver a calificar después
- No retorna body, solo status code

---

## 2. MODELOS DE DATOS ESPERADOS

### CourseRating Model
```typescript
interface CourseRating {
  id: number;
  course_id: number;
  user_id: number;
  rating: number;              // 1-5
  created_at: string;          // ISO 8601 timestamp
  updated_at: string;          // ISO 8601 timestamp
}
```

### RatingStats Model
```typescript
interface RatingStats {
  average_rating: number;      // 0.0-5.0, 2 decimales
  total_ratings: number;       // >= 0
  rating_distribution: {
    [key: string]: number;     // Claves "1"-"5", valores count
  };
}
```

### Course Model Extendido
```typescript
interface Course {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  slug: string;

  // CAMPOS NUEVOS PARA RATINGS:
  average_rating: number;      // 0.0-5.0
  total_ratings: number;       // >= 0
  rating_distribution?: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}
```

---

## 3. VALIDACIONES ESPERADAS

### Por Backend (Pydantic)
```
- user_id > 0
- rating >= 1 AND rating <= 5
```

### Por Base de Datos (Constraints)
```sql
CHECK (rating >= 1 AND rating <= 5)
UNIQUE (course_id, user_id, deleted_at)  -- Soft delete pattern
FOREIGN KEY (course_id) REFERENCES courses(id)
```

### Por Frontend (RECOMENDADO)
```typescript
// Antes de enviar al backend
if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
  throw new Error('Rating must be integer between 1-5');
}

if (user_id <= 0) {
  throw new Error('user_id must be positive');
}
```

---

## 4. MANEJO DE ERRORES

### HTTP Status Codes

| Status | Escenario | Respuesta |
|--------|-----------|----------|
| 200 | GET exitoso, PUT exitoso | `{ id, course_id, user_id, rating, created_at, updated_at }` |
| 201 | POST exitoso (nuevo rating) | `{ id, course_id, user_id, rating, created_at, updated_at }` |
| 204 | GET user rating sin resultados | Sin body |
| 400 | Rating fuera de rango, user_id mismatch | `{ "detail": "..." }` |
| 404 | Curso no existe, Rating no existe | `{ "detail": "..." }` |
| 422 | Validación Pydantic fallida | Detalles de validación |

### Ejemplo de Error 400
```json
{
  "detail": "Rating must be between 1 and 5"
}
```

### Ejemplo de Error 404
```json
{
  "detail": "Course with id 999 not found"
}
```

---

## 5. FLUJO DE INTEGRACIÓN EN FRONTEND

### 5.1 Al Cargar Página de Curso
```
1. GET /courses/{slug}              → Obtiene datos básicos + average_rating
2. GET /courses/{id}/ratings/stats  → Obtiene estadísticas detalladas
3. GET /courses/{id}/ratings/user/{uid}  → Obtiene rating del usuario
```

### 5.2 Usuario Califica por Primera Vez
```
1. User selecciona rating (UI)
2. POST /courses/{id}/ratings       → Backend crea rating
3. GET /courses/{id}/ratings/stats  → Refetch stats actualizadas
4. UI actualiza StarRating
```

### 5.3 Usuario Edita Su Calificación
```
1. User cambia rating (UI)
2. PUT /courses/{id}/ratings/{uid}  → Backend actualiza
3. GET /courses/{id}/ratings/stats  → Refetch stats
4. UI actualiza visualización
```

### 5.4 Usuario Elimina Su Calificación
```
1. User confirma eliminación
2. DELETE /courses/{id}/ratings/{uid} → Backend soft delete
3. GET /courses/{id}/ratings/stats  → Refetch stats
4. UI resetea a "Sin calificar"
```

---

## 6. IMPLEMENTACIÓN FRONTEND REQUERIDA

### 6.1 StarRating Component
**Archivo:** `src/components/StarRating/StarRating.tsx`

**Estado Actual:** ✅ Completo pero READONLY

**Cambios Requeridos:**
- [ ] Agregar modo interactivo (prop `onRatingChange`)
- [ ] Agregar handlers: onClick, onKeyDown, onMouseEnter, onMouseLeave
- [ ] Agregar estados: hoveredRating, isLoading, isError
- [ ] Agregar loading spinner durante submit
- [ ] Agregar error message con retry

**Props Esperados:**
```typescript
interface StarRatingProps {
  rating: number;                    // Valor actual (0-5)
  totalRatings?: number;             // Count de ratings
  showCount?: boolean;               // Mostrar contador
  size?: 'small' | 'medium' | 'large';
  readonly?: boolean;                // Modo lectura
  onRatingChange?: (rating: number) => void;  // Callback
  className?: string;
}
```

### 6.2 RatingWidget/Section Component
**Archivo:** `src/components/CourseDetail/UserRatingSection.tsx` (NUEVO)

**Responsabilidades:**
- Cargar rating del usuario al montar
- Cargar estadísticas de ratings
- Mostrar StarRating interactivo
- Manejar submit a API
- Mostrar loading/error states
- Refetch stats después de cambios

**Props:**
```typescript
interface UserRatingSectionProps {
  courseId: number;
  userId: number;              // Requerido para crear rating
  onRatingSubmitted?: () => void;  // Callback post-submit
}
```

### 6.3 Integración en CourseDetail
**Archivo:** `src/components/CourseDetail/CourseDetail.tsx`

**Cambios:**
- [ ] Mostrar StarRating readonly con stats (línea 25-35 ya existe)
- [ ] Agregar UserRatingSection interactivo debajo
- [ ] Manejar refetch de stats post-rating

---

## 7. CONSIDERACIONES CRÍTICAS

### 7.1 Manejo de HTTP 204
```typescript
// El endpoint GET /courses/{id}/ratings/user/{uid}
// retorna 204 No Content si usuario NO ha calificado

try {
  const rating = await ratingsApi.getUserRating(courseId, userId);
  setUserRating(rating);
} catch (error) {
  if (error instanceof ApiError && error.status === 204) {
    setUserRating(null);  // Usuario no ha calificado
    return;
  }
  // Otro error
  setError(error);
}
```

### 7.2 Race Conditions
```typescript
// Usar AbortController para cancelar requests en limpieza
useEffect(() => {
  const controller = new AbortController();

  ratingsApi.getRatingStats(courseId, { signal: controller.signal })
    .then(stats => {
      if (!controller.signal.aborted) {
        setStats(stats);
      }
    });

  return () => controller.abort();
}, [courseId]);
```

### 7.3 Prevención de Double-Submit
```typescript
// Deshabilitar mientras se envía
const [isSubmitting, setIsSubmitting] = useState(false);

const handleRatingChange = async (newRating: number) => {
  if (isSubmitting) return;  // Prevenir múltiples clicks

  setIsSubmitting(true);
  try {
    // Enviar rating
    await ratingsApi.createRating(courseId, {
      user_id: userId,
      rating: newRating
    });
    // Refetch
  } finally {
    setIsSubmitting(false);
  }
};
```

### 7.4 Auth Integration (Futuro)
```typescript
// Actualmente user_id es hardcoded
// Preparar para recibir desde contexto auth:

'use client';
import { useUser } from '@/context/AuthContext';  // Futuro

export function UserRatingSection({ courseId }: Props) {
  const { user } = useUser();

  if (!user) {
    return <AuthRequiredMessage />;
  }

  return <StarRating onRatingChange={...} />;
}
```

---

## 8. TESTING GUIDE

### Backend Tests Existentes
```bash
cd Backend

# Ejecutar todos los tests
make test

# Con cobertura de código
make test-coverage

# Tests específicos
make test -- -k "rating"
```

**Archivos de test:**
- `app/tests/test_rating_endpoints.py` - HTTP endpoints
- `app/tests/test_course_rating_service.py` - Lógica de negocio
- `app/tests/test_rating_db_constraints.py` - Constraints BD

### Frontend Tests
```bash
cd Frontend

# Ejecutar tests
yarn test

# Con cobertura
yarn test:coverage

# Watch mode
yarn test:watch
```

**Tests a escribir:**
- StarRating interactividad (click, keyboard, hover)
- UserRatingSection: fetch, submit, error handling
- Integration: E2E de crear/actualizar/eliminar rating

---

## 9. VARIABLES DE ENTORNO

### Frontend (.env.local)
```env
# URL base del API backend
NEXT_PUBLIC_API_URL=http://localhost:8000

# Opcional: timeout para requests
NEXT_PUBLIC_API_TIMEOUT=10000
```

### Backend (ya configurado)
```env
# Database
DATABASE_URL=postgresql://platziflix_user:platziflix_password@localhost:5435/platziflix_db

# API Server
API_PORT=8000
API_HOST=0.0.0.0
```

---

## 10. CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Database Layer ✅
- [x] Migración Alembic creada
- [x] Tabla course_ratings con constraints
- [x] Índices para performance

### Fase 2: Backend Models & Services ✅
- [x] CourseRating ORM model
- [x] Course relationship bidireccional
- [x] CourseService métodos (8 métodos)
- [x] Pydantic schemas (RatingRequest, RatingResponse, RatingStats)
- [x] Tests de modelos y servicios

### Fase 3: API Endpoints ✅
- [x] 6 endpoints CRUD implementados
- [x] Error handling
- [x] Validación en capas múltiples
- [x] Tests de endpoints

### Fase 4: Frontend Types & API Service ✅
- [x] TypeScript types (CourseRating, RatingStats)
- [x] API service (ratingsApi.ts)
- [x] Type guards y error handling
- [x] Integration con fetch helpers

### Fase 5: Frontend UI Components (🔄 IN PROGRESS)
- [x] StarRating component readonly
- [ ] StarRating component interactivo
- [ ] UserRatingSection component
- [ ] Integración en CourseDetail
- [ ] Tests de componentes

### Fase 6: Testing & QA (🔄 IN PROGRESS)
- [x] Backend tests (49 pasando)
- [ ] Frontend unit tests
- [ ] Frontend integration tests
- [ ] End-to-end tests

---

## 11. COMANDOS ÚTILES

### Backend
```bash
cd Backend

# Iniciar servicios
make start

# Migrar BD
make migrate

# Ejecutar tests
make test
make test-coverage
make test-watch

# Ver logs
make logs

# Seed datos
make seed
make seed-fresh

# Detener
make stop
```

### Frontend
```bash
cd Frontend

# Desarrollo
yarn dev

# Tests
yarn test
yarn test:coverage
yarn test:watch

# Build producción
yarn build

# Linter
yarn lint
```

---

## 12. URLS DE REFERENCIA

| URL | Propósito |
|-----|-----------|
| `http://localhost:8000` | Backend API |
| `http://localhost:8000/docs` | OpenAPI/Swagger Documentation |
| `http://localhost:3000` | Frontend |
| `http://localhost:5435` | PostgreSQL (port interno) |

---

## 13. PRÓXIMOS PASOS

1. **Validar Backend está corriendo:**
   ```bash
   cd Backend && make start
   ```

2. **Completar StarRating interactivo:**
   - Agregar estado de hover
   - Agregar handlers de click
   - Agregar callback onRatingChange

3. **Crear UserRatingSection:**
   - Fetch inicial de rating + stats
   - Manejo de submit
   - Error/loading states

4. **Integrar en CourseDetail:**
   - Actualizar imports
   - Agregar UserRatingSection
   - Refetch de stats post-rating

5. **Testing:**
   - Escribir tests de componentes
   - Tests de integración
   - E2E tests

6. **Auth Integration (Futuro):**
   - Integrar con useUser() hook
   - Mostrar "log in para calificar" si necesario
   - Injector user_id desde context

---

## 📞 SOPORTE

Para debugging:
1. Ver logs del backend: `make logs`
2. Revisar OpenAPI docs: http://localhost:8000/docs
3. Usar DevTools del navegador para ver requests
4. Revisar test files para ejemplos de uso

---

**Última actualización:** 2025-10-14
**Status:** Ready for Frontend Integration
