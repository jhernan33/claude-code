# 🎬 PlatziFllix - Arquitectura del Sistema

> Documento de referencia rápida para el desarrollo completo del proyecto. Última actualización: 2025-11-22

## 📋 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Arquitectura de Datos](#arquitectura-de-datos)
5. [Backend (FastAPI)](#backend-fastapi)
6. [Frontend (Next.js)](#frontend-nextjs)
7. [Mobile - Android (Kotlin)](#mobile---android-kotlin)
8. [Mobile - iOS (Swift)](#mobile---ios-swift)
9. [API REST Endpoints](#api-rest-endpoints)
10. [Flujo de Datos](#flujo-de-datos)
11. [Convenciones de Código](#convenciones-de-código)
12. [Guía de Desarrollo Local](#guía-de-desarrollo-local)
13. [Testing](#testing)

---

## Visión General

**PlatziFllix** es una plataforma de educación en video similar a Platzi/Netflix con arquitectura multi-plataforma:

- **Backend centralizado:** FastAPI + PostgreSQL (Puerto 8000)
- **Frontend web:** Next.js 15 + React 19 + TypeScript (Puerto 3000)
- **Mobile Android:** Kotlin + Jetpack Compose (MVVM)
- **Mobile iOS:** Swift + SwiftUI (MVVM)

Todos los clientes se comunican con el backend mediante **HTTP REST API** en JSON.

### Matriz de Características por Plataforma

| Característica | Web | Android | iOS |
|---|---|---|---|
| Listado de cursos | ✅ | ✅ | ✅ |
| Detalle de curso | ✅ | ⏳ | ⏳ |
| Reproductor de video | ✅ | ⏳ | ⏳ |
| Sistema de ratings | ✅ | ⏳ | ⏳ |
| Autenticación | ⏳ | ⏳ | ⏳ |

---

## Estructura del Proyecto

```
claude-code/
├── Backend/                          # FastAPI + PostgreSQL
│   ├── app/
│   │   ├── main.py                   # Punto de entrada FastAPI
│   │   ├── core/config.py            # Configuración
│   │   ├── db/base.py                # SQLAlchemy setup
│   │   ├── models/                   # Modelos ORM
│   │   ├── schemas/                  # Schemas Pydantic
│   │   ├── services/course_service.py # Lógica de negocio
│   │   ├── alembic/                  # Migraciones
│   │   └── tests/                    # Tests unitarios
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── Makefile
│   ├── pyproject.toml
│   ├── specs/                        # Especificaciones
│   └── README.md
│
├── Frontend/                         # Next.js 15
│   ├── src/
│   │   ├── app/                      # App Router
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── page.tsx              # Home
│   │   │   ├── course/[slug]/page.tsx # Detalle
│   │   │   └── classes/[id]/page.tsx # Reproductor
│   │   ├── components/               # React components
│   │   ├── services/                 # API clients
│   │   ├── types/                    # TypeScript interfaces
│   │   └── styles/                   # SCSS + CSS Modules
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.ts
│   ├── vitest.config.ts
│   └── README.md
│
└── Mobile/
    ├── PlatziFlixAndroid/            # Kotlin + Compose
    │   ├── app/src/main/java/com/espaciotiago/platziflixandroid/
    │   │   ├── MainActivity.kt
    │   │   ├── data/                 # Layer: Network, DTOs, Mappers
    │   │   ├── domain/               # Layer: Models, Repositories (interfaces)
    │   │   ├── presentation/         # Layer: ViewModels, Composables
    │   │   ├── di/                   # Dependency Injection
    │   │   └── ui/theme/
    │   ├── app/build.gradle.kts
    │   └── README_COURSES_FEATURE.md
    │
    └── PlatziFlixiOS/                # Swift + SwiftUI
        ├── PlatziFlixiOS/
        │   ├── PlatziFlixiOSApp.swift
        │   ├── Data/                 # Layer: DTOs, Mappers, Network
        │   ├── Domain/               # Layer: Models, Repository Protocol
        │   ├── Presentation/         # Layer: ViewModels, Views
        │   └── Services/             # Network layer
        └── PlatziFlixiOS.xcodeproj
```

---

## Stack Tecnológico

### Backend
- **Framework:** FastAPI 0.104.0+ (async)
- **Base Datos:** PostgreSQL 15
- **ORM:** SQLAlchemy 2.0+
- **Migraciones:** Alembic 1.13.0+
- **Lenguaje:** Python 3.11+
- **Gestor Dependencias:** UV (Astral Sh)
- **Containerización:** Docker + Docker Compose
- **Testing:** pytest + pytest-asyncio

### Frontend
- **Framework:** Next.js 15.3.3 (App Router)
- **UI:** React 19.0
- **Lenguaje:** TypeScript 5 (strict mode)
- **Estilos:** SCSS + CSS Modules
- **Testing:** Vitest 3.2.3 + React Testing Library
- **Bundler:** Turbopack (Next.js)
- **Linting:** ESLint 9

### Android
- **Lenguaje:** Kotlin (JVM target 11)
- **UI:** Jetpack Compose
- **HTTP:** Retrofit 2.9.0
- **JSON:** Gson 2.10.1
- **Imágenes:** Coil 2.5.0
- **Navigation:** Jetpack Navigation Compose 2.7.6
- **Design:** Material 3
- **State Management:** StateFlow + ViewModel Lifecycle
- **Testing:** JUnit + Espresso
- **Build:** Gradle con Kotlin DSL

### iOS
- **Lenguaje:** Swift 5.9+
- **UI:** SwiftUI (iOS 15+)
- **HTTP:** URLSession (nativo)
- **JSON:** Codable protocol
- **State:** @Observable (Swift 5.9+)
- **Testing:** XCTest
- **Build:** Xcode 15+

---

## Arquitectura de Datos

### Modelo Entidades (ER Diagram)

```
┌──────────────┐
│   TEACHER    │
│──────────────│
│ id (PK)      │
│ name         │
│ email        │
│ created_at   │
│ updated_at   │
│ deleted_at   │
└──────┬───────┘
       │
       │ (M:M via COURSE_TEACHER)
       │
┌──────▼──────────────┐
│     COURSE          │
│─────────────────────│
│ id (PK)             │
│ name                │
│ description         │
│ thumbnail (URL)     │
│ slug (UNIQUE)       │
│ created_at          │
│ updated_at          │
│ deleted_at          │
└──────┬──────────────┘
       │
       ├─(1:M)─ LESSON
       │         ├─ id (PK)
       │         ├─ course_id (FK)
       │         ├─ name
       │         ├─ description
       │         ├─ video_url
       │         ├─ slug
       │         ├─ created_at
       │         ├─ updated_at
       │         └─ deleted_at
       │
       └─(1:M)─ COURSE_RATING
                 ├─ id (PK)
                 ├─ course_id (FK) ──┐
                 ├─ user_id (INT)    ├─ UNIQUE cuando deleted_at IS NULL
                 ├─ rating (1-5)  ──┘
                 ├─ created_at
                 ├─ updated_at
                 └─ deleted_at (soft delete)
```

### Características de BD

- **Soft Deletes:** Todas las tablas tienen `deleted_at` para auditoría
- **Timestamps:** `created_at`, `updated_at` automáticos
- **Índices:** slug (único), course_id en ratings
- **Constraints:**
  - `rating` entre 1 y 5
  - `(course_id, user_id)` único en COURSE_RATING cuando no eliminado
  - Slugs únicos por entidad

---

## Backend (FastAPI)

### Ubicación
`/home/hernan/Platzi/claudeCode/claude-code/Backend/`

### Estructura de Aplicación

```
app/
├── main.py                      # FastAPI app + routes
├── core/
│   └── config.py               # Pydantic settings
├── db/
│   ├── base.py                 # engine, SessionLocal, get_db()
│   └── seed.py                 # Datos de prueba
├── models/
│   ├── base.py                 # BaseModel con timestamps
│   ├── course.py               # Course
│   ├── lesson.py               # Lesson
│   ├── teacher.py              # Teacher
│   ├── course_teacher.py       # Tabla M2M
│   └── course_rating.py        # CourseRating
├── schemas/
│   └── rating.py               # Pydantic schemas para API
├── services/
│   └── course_service.py       # Lógica de negocio
├── alembic/
│   ├── env.py
│   ├── alembic.ini
│   └── versions/               # Migraciones SQL
└── tests/
    ├── test_main.py
    ├── test_rating_endpoints.py
    ├── test_course_rating_service.py
    └── test_rating_db_constraints.py
```

### Modelos SQLAlchemy

#### Course
```python
class Course(Base):
    id: int (PK)
    name: str (max 255)
    description: str
    thumbnail: str (URL, max 500)
    slug: str (UNIQUE, indexed)
    teachers: List[Teacher] (M:M relationship)
    lessons: List[Lesson] (O2M relationship)
    ratings: List[CourseRating] (O2M relationship)
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None (soft delete)
```

#### Lesson (alias Class)
```python
class Lesson(Base):
    id: int (PK)
    course_id: int (FK)
    name: str
    description: str
    slug: str
    video_url: str
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None
```

#### Teacher
```python
class Teacher(Base):
    id: int (PK)
    name: str
    email: str
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None
```

#### CourseRating
```python
class CourseRating(Base):
    id: int (PK)
    course_id: int (FK) ──┐ UNIQUE
    user_id: int         ├─ cuando deleted_at IS NULL
    rating: int (1-5)  ──┘
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None
```

### Servicios (Lógica de Negocio)

#### CourseService (`app/services/course_service.py`)

```python
class CourseService:
    # Cursos
    async def get_all_courses() → List[Course]
    async def get_course_by_slug(slug: str) → Course

    # Ratings
    async def add_course_rating(course_id, user_id, rating) → Rating
    async def get_course_ratings(course_id) → List[Rating]
    async def get_course_rating_stats(course_id) → RatingStats
    async def update_course_rating(course_id, user_id, rating) → Rating
    async def delete_course_rating(course_id, user_id) → None
    async def get_user_course_rating(course_id, user_id) → Rating | None
```

### Endpoints API

#### Health & General
```
GET /
    Response: {"message": "Bienvenido a Platziflix API"}

GET /health
    Response: {
        "status": "healthy",
        "service": "Platziflix API",
        "version": "1.0.0",
        "database": "connected",
        "courses_count": int
    }
```

#### Cursos
```
GET /courses
    Response: [
        {
            "id": 1,
            "name": "Curso de Kotlin",
            "description": "...",
            "thumbnail": "https://...",
            "slug": "curso-de-kotlin",
            "average_rating": 4.5,
            "total_ratings": 10
        }
    ]

GET /courses/{slug}
    Response: {
        "id": 1,
        "name": "...",
        "description": "...",
        "thumbnail": "...",
        "slug": "curso-de-kotlin",
        "teachers": [
            {"id": 1, "name": "Juan", "email": "..."}
        ],
        "classes": [
            {"id": 1, "title": "Clase 1", "slug": "clase-1", ...}
        ],
        "average_rating": 4.5,
        "total_ratings": 10,
        "rating_distribution": {
            "1": 0, "2": 1, "3": 2, "4": 3, "5": 4
        }
    }

GET /classes/{class_id}
    Response: {
        "id": 1,
        "title": "Clase 1",
        "description": "...",
        "slug": "clase-1",
        "video_url": "https://...",
        "duration": 3600
    }
```

#### Ratings
```
POST /courses/{course_id}/ratings
    Body: {"user_id": 1, "rating": 5}
    Response: 201 Created
    {
        "id": 1,
        "course_id": 1,
        "user_id": 1,
        "rating": 5,
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": "2024-01-01T00:00:00Z"
    }

GET /courses/{course_id}/ratings
    Response: [
        {
            "id": 1,
            "course_id": 1,
            "user_id": 1,
            "rating": 5,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-01T00:00:00Z"
        }
    ]
    Ordenado por fecha DESC

GET /courses/{course_id}/ratings/stats
    Response: {
        "average_rating": 4.5,
        "total_ratings": 10,
        "rating_distribution": {
            "1": 0,
            "2": 1,
            "3": 2,
            "4": 3,
            "5": 4
        }
    }

GET /courses/{course_id}/ratings/user/{user_id}
    Response: RatingResponse | 204 No Content

PUT /courses/{course_id}/ratings/{user_id}
    Body: {"user_id": 1, "rating": 4}
    Response: 200 OK con rating actualizado

DELETE /courses/{course_id}/ratings/{user_id}
    Response: 204 No Content
```

### Docker & Deployment

#### Dockerfile
- Base: `python:3.11-slim`
- Gestor de deps: UV
- Puerto: **8000**
- Comando: `uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload`

#### docker-compose.yml
```yaml
Servicios:
1. db (PostgreSQL 15)
   - Usuario: platziflix_user
   - Password: platziflix_password
   - BD: platziflix_db
   - Puerto: 5432
   - Volumen: postgres_data:/var/lib/postgresql/data

2. api (FastAPI)
   - Build: ./Dockerfile
   - Puerto: 8000
   - Depende de: db
   - Env var: DATABASE_URL=postgresql://...
   - Volúmenes: ./app:/app/app (hot reload)
```

#### Makefile Commands
```bash
make start              # docker-compose up
make stop               # docker-compose down
make migrate            # Ejecutar migraciones Alembic
make create-migration   # Crear nueva migración
make seed               # Cargar datos de prueba
make seed-fresh         # Limpiar y recargar datos
make logs               # Ver logs en vivo
make clean              # Limpiar todo (containers, volumes)
```

### Testing Backend

```bash
cd Backend
uv run pytest                    # Ejecutar todos los tests
uv run pytest -v                # Con verbosidad
uv run pytest --cov app         # Con coverage
uv run pytest tests/test_rating_endpoints.py  # Test específico
```

**Test files:**
- `test_main.py` - Tests básicos
- `test_rating_endpoints.py` - Endpoints rating
- `test_course_rating_service.py` - Servicio
- `test_rating_db_constraints.py` - Constraints BD

---

## Frontend (Next.js)

### Ubicación
`/home/hernan/Platzi/claudeCode/claude-code/Frontend/`

### Estructura de Aplicación

```
src/
├── app/                         # Next.js 15 App Router
│   ├── layout.tsx              # Root layout + Geist fonts
│   ├── page.tsx                # Home - lista cursos
│   ├── page.module.scss        # Estilos home
│   ├── course/
│   │   └── [slug]/
│   │       ├── page.tsx        # Detalle curso
│   │       ├── loading.tsx     # Skeleton/Loading state
│   │       ├── error.tsx       # Error boundary
│   │       └── not-found.tsx   # 404 page
│   └── classes/
│       └── [class_id]/
│           ├── page.tsx        # Reproductor video
│           └── page.test.tsx   # Tests
│
├── components/
│   ├── Course/
│   │   ├── Course.tsx          # Card de curso
│   │   └── __test__/Course.test.tsx
│   ├── CourseDetail/
│   │   └── CourseDetail.tsx    # Detalle completo
│   ├── VideoPlayer/
│   │   ├── VideoPlayer.tsx     # Reproductor HTML5
│   │   └── VideoPlayer.test.tsx
│   └── StarRating/
│       ├── StarRating.tsx      # Widget 1-5 estrellas
│       └── __tests__/StarRating.test.tsx
│
├── services/
│   └── ratingsApi.ts           # API client para ratings
│
├── styles/
│   ├── reset.scss              # Reset CSS
│   └── vars.scss               # Variables SCSS (colores, spacing)
│
├── test/
│   └── setup.ts                # Vitest setup
│
└── types/
    ├── index.ts                # Course, Class interfaces
    └── rating.ts               # Rating interfaces
```

### Páginas (App Router)

#### Home (`/app/page.tsx`)
- Fetch: `GET /courses` (server-side, no-store cache)
- Renderiza grid de componentes `<Course>`
- Link a `/course/{slug}`

#### Course Detail (`/app/course/[slug]/page.tsx`)
- Server Component
- Fetch: `GET /courses/{slug}`
- Muestra: nombre, descripción, maestros, lecciones
- Lecciones clickeables → `/classes/{id}`

#### Class/Video Player (`/app/classes/[class_id]/page.tsx`)
- Reproduce video
- Componente: `<VideoPlayer>`
- Links de navegación hacia atrás

### Componentes React

#### Course.tsx
```typescript
interface CourseProps {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  slug: string;
  average_rating?: number;
  total_ratings?: number;
}

export default function Course(props: CourseProps) {
  // Renderiza card con thumbnail, título, descripción, rating
}
```

#### CourseDetail.tsx
```typescript
interface CourseDetailProps {
  course: CourseDetail;
  onClassClick: (classId: number) => void;
}

// Muestra nombre, descripción, lista de maestros, lista de clases
```

#### VideoPlayer.tsx
```typescript
interface VideoPlayerProps {
  src: string;
  title: string;
  description?: string;
}

// HTML5 <video> con controles estándar
// O iframe para embed (YouTube, etc)
```

#### StarRating.tsx
```typescript
interface StarRatingProps {
  rating: number;           // 0-5
  totalRatings: number;
  onRate?: (value: number) => void;
  disabled?: boolean;
}

// 5 estrellas clickeables
// Visual feedback hover/selected
// Callback al cambiar rating
```

### Services (API Clients)

#### ratingsApi.ts
```typescript
// Base URL: http://localhost:8000

export async function createRating(
  courseId: number,
  userId: number,
  rating: number
): Promise<Rating>

export async function getRatings(courseId: number): Promise<Rating[]>

export async function getRatingStats(courseId: number): Promise<RatingStats>

export async function getUserRating(
  courseId: number,
  userId: number
): Promise<Rating | null>

export async function updateRating(
  courseId: number,
  userId: number,
  rating: number
): Promise<Rating>

export async function deleteRating(
  courseId: number,
  userId: number
): Promise<void>
```

### TypeScript Types

#### types/index.ts
```typescript
interface Course {
  id: number;
  name: string;
  description: string;
  thumbnail: string;
  slug: string;
  average_rating?: number;
  total_ratings?: number;
}

interface Class {
  id: number;
  title: string;
  description: string;
  video: string;
  duration: number;
  slug: string;
}

interface CourseDetail extends Course {
  classes: Class[];
  teachers: Teacher[];
}

interface Teacher {
  id: number;
  name: string;
  email: string;
}
```

#### types/rating.ts
```typescript
interface Rating {
  id: number;
  course_id: number;
  user_id: number;
  rating: number;      // 1-5
  created_at: string;
  updated_at: string;
}

interface RatingStats {
  average_rating: number;
  total_ratings: number;
  rating_distribution: Record<number, number>;
}
```

### Estilos (SCSS)

#### vars.scss
```scss
// Colores
$primary: #ff0000;           // Rojo Platzi
$secondary: #000000;         // Negro
$background: #ffffff;
$text: #1a1a1a;

// Spacing
$space-xs: 4px;
$space-sm: 8px;
$space-md: 16px;
$space-lg: 24px;
$space-xl: 32px;

// Tipografía
$font-family: 'Geist Sans', -apple-system, BlinkMacSystemFont;
$font-size-base: 16px;
$font-size-lg: 20px;
$font-size-xl: 24px;

// Breakpoints
$breakpoint-mobile: 480px;
$breakpoint-tablet: 768px;
$breakpoint-desktop: 1024px;
```

#### reset.scss
- Normalización CSS cross-browser
- Reset de margins, paddings, line-heights

#### CSS Modules
- Naming: BEM convention
- Scoped per component
- Import: `import styles from './Component.module.scss'`

### Configuration Files

#### tsconfig.json
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "jsx": "preserve",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### next.config.ts
- SCSS support con includePaths
- Prepend: `@import "vars.scss"` automáticamente
- Font optimization (Geist)

#### vitest.config.ts
- Environment: jsdom
- Setup: ./src/test/setup.ts
- Include: src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}

### Scripts (package.json)
```bash
yarn dev            # Dev server + Turbopack
yarn build          # Production build
yarn start          # Start prod server
yarn lint           # ESLint
yarn test           # Vitest runner
yarn test:watch     # Watch mode
```

### Testing Frontend

```bash
cd Frontend
yarn install
yarn test                           # Todos los tests
yarn test:watch                     # Watch mode
yarn test components/StarRating     # Test específico
yarn test --coverage                # Con coverage
```

---

## Mobile - Android (Kotlin)

### Ubicación
`/home/hernan/Platzi/claudeCode/claude-code/Mobile/PlatziFlixAndroid/`

### Arquitectura

**Patrón:** MVVM + Clean Architecture

```
Presentation Layer      Domain Layer           Data Layer
(MVVM)                 (Business Logic)       (Network + DB)
├── ViewModels         ├── Models             ├── API Service
├── Composables        ├── Repositories       ├── DTOs
└── UI State           │   (interfaces)       ├── Mappers
                       └──────────────────────└──Repositories
```

### Estructura de Código

```
app/src/main/java/com/espaciotiago/platziflixandroid/

├── MainActivity.kt                  # Punto de entrada

├── data/                            # DATA LAYER
│   ├── entities/
│   │   └── CourseDTO.kt            # JSON/API format
│   ├── mappers/
│   │   └── CourseMapper.kt         # DTO → Domain
│   ├── network/
│   │   ├── ApiService.kt           # Retrofit interface
│   │   └── NetworkModule.kt        # Retrofit DI setup
│   └── repositories/
│       ├── RemoteCourseRepository.kt # Impl usando API
│       └── MockCourseRepository.kt   # Mock para dev

├── domain/                          # DOMAIN LAYER
│   ├── models/
│   │   └── Course.kt               # Domain model
│   └── repositories/
│       └── CourseRepository.kt     # Interface (abstracción)

├── presentation/                    # PRESENTATION LAYER
│   └── courses/
│       ├── components/
│       │   ├── CourseCard.kt       # Composable item
│       │   ├── ErrorMessage.kt     # Error display
│       │   └── LoadingIndicator.kt # Loading spinner
│       ├── screen/
│       │   └── CourseListScreen.kt # Main screen
│       ├── state/
│       │   └── CourseListUiState.kt # Sealed class estados
│       └── viewmodel/
│           └── CourseListViewModel.kt # MVVM ViewModel

├── di/                              # DEPENDENCY INJECTION
│   └── AppModule.kt                # Manual DI setup

└── ui/theme/
    ├── Color.kt                    # Material 3 colors
    ├── Spacing.kt                  # Design system tokens
    ├── Theme.kt                    # Tema composable
    └── Type.kt                     # Tipografía
```

### Data Models

#### CourseDTO.kt (JSON/API)
```kotlin
@Serializable
data class CourseDTO(
    val id: Int,
    val name: String,
    val description: String,
    val thumbnail: String,
    val slug: String,
    val created_at: String,
    val updated_at: String,
    val deleted_at: String?,
    val teacher_id: List<Int>
)
```

#### Course.kt (Domain Model)
```kotlin
data class Course(
    val id: Int,
    val name: String,
    val description: String,
    val thumbnail: String,
    val slug: String,
    val teachers: List<Int> = emptyList()
)
```

### Repositories

#### CourseRepository.kt (Interface)
```kotlin
interface CourseRepository {
    suspend fun getCourses(): Result<List<Course>>
}
```

#### RemoteCourseRepository.kt (Implementation)
```kotlin
class RemoteCourseRepository(
    private val apiService: ApiService,
    private val mapper: CourseMapper
) : CourseRepository {
    override suspend fun getCourses(): Result<List<Course>> {
        return try {
            val dtos = apiService.getCourses()
            Result.success(dtos.map { mapper.toDomain(it) })
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
```

### ViewModels

#### CourseListViewModel.kt
```kotlin
@HiltViewModel
class CourseListViewModel @Inject constructor(
    private val repository: CourseRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<CourseListUiState>(CourseListUiState.Loading)
    val uiState: StateFlow<CourseListUiState> = _uiState.asStateFlow()

    init {
        loadCourses()
    }

    fun loadCourses() {
        viewModelScope.launch {
            _uiState.value = CourseListUiState.Loading
            repository.getCourses()
                .onSuccess { courses ->
                    _uiState.value = CourseListUiState.Success(courses)
                }
                .onFailure { error ->
                    _uiState.value = CourseListUiState.Error(error.message ?: "Unknown error")
                }
        }
    }
}
```

### UI State Pattern

```kotlin
sealed class CourseListUiState {
    object Loading : CourseListUiState()
    data class Success(val courses: List<Course>) : CourseListUiState()
    data class Error(val message: String) : CourseListUiState()
    object Empty : CourseListUiState()
    object Refreshing : CourseListUiState()
}
```

### Composables

#### CourseListScreen.kt
```kotlin
@Composable
fun CourseListScreen(
    viewModel: CourseListViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    when (val state = uiState) {
        is CourseListUiState.Loading -> LoadingIndicator()
        is CourseListUiState.Success -> {
            LazyColumn {
                items(state.courses) { course ->
                    CourseCard(course = course)
                }
            }
        }
        is CourseListUiState.Error -> ErrorMessage(state.message)
        is CourseListUiState.Empty -> Text("No courses available")
        is CourseListUiState.Refreshing -> LoadingIndicator()
    }
}
```

#### CourseCard.kt
```kotlin
@Composable
fun CourseCard(
    course: Course,
    modifier: Modifier = Modifier
) {
    Card(modifier = modifier) {
        Column {
            Image(course.thumbnail)
            Text(course.name)
            Text(course.description)
        }
    }
}
```

### Networking

#### ApiService.kt (Retrofit)
```kotlin
interface ApiService {
    @GET("/courses")
    suspend fun getCourses(): List<CourseDTO>

    @GET("/courses/{slug}")
    suspend fun getCourse(@Path("slug") slug: String): CourseDTO
}
```

#### NetworkModule.kt
```kotlin
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideRetrofit(): Retrofit {
        return Retrofit.Builder()
            .baseUrl("http://10.0.2.2:8000/") // Emulator
            .addConverterFactory(GsonConverterFactory.create())
            .addCallAdapterFactory(ResultCallAdapterFactory())
            .build()
    }

    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): ApiService {
        return retrofit.create(ApiService::class.java)
    }
}
```

### Dependencias (app/build.gradle.kts)

```kotlin
// Core
implementation("androidx.core:core-ktx:1.12.0")
implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")

// Compose
implementation(platform("androidx.compose:compose-bom:2024.01.00"))
implementation("androidx.compose.ui:ui")
implementation("androidx.compose.ui:ui-graphics")
implementation("androidx.compose.ui:ui-tooling-preview")
implementation("androidx.compose.material3:material3")

// Networking
implementation("com.squareup.retrofit2:retrofit:2.9.0")
implementation("com.squareup.retrofit2:converter-gson:2.9.0")
implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

// Coroutines
implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")

// Image loading
implementation("io.coil-kt:coil-compose:2.5.0")

// Hilt (DI)
implementation("com.google.dagger:hilt-android:2.48")
kapt("com.google.dagger:hilt-compiler:2.48")

// Testing
testImplementation("junit:junit:4.13.2")
testImplementation("androidx.arch.core:core-testing:2.2.0")
androidTestImplementation("androidx.espresso:espresso-core:3.5.1")
```

### Configuration

#### AndroidManifest.xml
```xml
<uses-permission android:name="android.permission.INTERNET" />

<!-- network_security_config.xml para HTTP en dev -->
<application
    ...
    android:networkSecurityConfig="@xml/network_security_config"
>
```

#### network_security_config.xml
```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain> <!-- Emulator -->
    </domain-config>
</network-security-config>
```

### Base URL Handling

```kotlin
// Emulator: http://10.0.2.2:8000/
// Physical device: http://192.168.1.XXX:8000/
// Staging: https://api-staging.platziflix.com/
// Production: https://api.platziflix.com/
```

### Build & Run

```bash
./gradlew build              # Compile
./gradlew test               # Unit tests
./gradlew connectedAndroidTest  # Instrumented tests
./gradlew assembleDebug      # Build APK debug
./gradlew installDebug       # Install en device/emulator
```

---

## Mobile - iOS (Swift)

### Ubicación
`/home/hernan/Platzi/claudeCode/claude-code/Mobile/PlatziFlixiOS/`

### Arquitectura

**Patrón:** MVVM + Repository Pattern

```
Presentation Layer      Domain Layer           Data Layer
(MVVM + SwiftUI)       (Business Logic)       (Network)
├── ViewModels         ├── Models             ├── Network
│   (@Observable)      ├── Repositories       ├── DTOs
└── Views                  (protocols)        └── Mappers
    (SwiftUI)          └─────────────────────────────
```

### Estructura de Código

```
PlatziFlixiOS/

├── PlatziFlixiOSApp.swift          # Entry point

├── Data/                            # DATA LAYER
│   ├── Entities/
│   │   ├── CourseDTO.swift         # JSON/Codable
│   │   ├── TeacherDTO.swift
│   │   └── ClassDetailDTO.swift
│   ├── Mapper/
│   │   ├── CourseMapper.swift      # DTO → Domain
│   │   ├── TeacherMapper.swift
│   │   └── ClassMapper.swift
│   └── Repositories/
│       ├── CourseAPIEndpoints.swift # Enum endpoints
│       └── RemoteCourseRepository.swift # API impl

├── Domain/                          # DOMAIN LAYER
│   ├── Models/
│   │   ├── Course.swift            # Domain model
│   │   ├── Teacher.swift
│   │   └── Class.swift
│   └── Repositories/
│       └── CourseRepositoryProtocol.swift

├── Presentation/                    # PRESENTATION LAYER
│   ├── ViewModels/
│   │   └── CourseListViewModel.swift
│   └── Views/
│       ├── CourseListView.swift    # Main list
│       ├── CourseCardView.swift    # Card
│       └── DesignSystem.swift      # Design tokens

├── Services/                        # NETWORK LAYER
│   ├── NetworkManager.swift         # URLSession wrapper
│   ├── NetworkService.swift         # Generic network
│   ├── APIEndpoint.swift            # Protocol
│   ├── HTTPMethod.swift             # Enum
│   └── NetworkError.swift           # Custom errors

└── Assets.xcassets                  # Recursos visuales
```

### Data Models

#### CourseDTO.swift (Codable)
```swift
struct CourseDTO: Codable {
    let id: Int
    let name: String
    let description: String
    let thumbnail: String
    let slug: String
    let created_at: String
    let updated_at: String
    let deleted_at: String?
    let teacher_id: [Int]

    enum CodingKeys: String, CodingKey {
        case id, name, description, thumbnail, slug
        case created_at, updated_at, deleted_at, teacher_id
    }
}
```

#### Course.swift (Domain Model)
```swift
struct Course: Identifiable {
    let id: Int
    let name: String
    let description: String
    let thumbnail: String
    let slug: String
    let teachers: [Int] = []
}
```

### Network Layer

#### APIEndpoint.swift (Protocol)
```swift
protocol APIEndpoint {
    associatedtype ResponseType: Codable

    var baseURL: URL { get }
    var path: String { get }
    var method: HTTPMethod { get }
    var headers: [String: String]? { get }
    var queryItems: [URLQueryItem]? { get }
}
```

#### HTTPMethod.swift
```swift
enum HTTPMethod: String {
    case get = "GET"
    case post = "POST"
    case put = "PUT"
    case delete = "DELETE"
    case patch = "PATCH"
}
```

#### NetworkError.swift
```swift
enum NetworkError: LocalizedError {
    case invalidURL
    case invalidResponse
    case decodingError(Error)
    case serverError(Int)
    case noData
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL:
            return "Invalid URL"
        case .invalidResponse:
            return "Invalid response from server"
        case .decodingError(let error):
            return "Decoding error: \(error.localizedDescription)"
        case .serverError(let code):
            return "Server error: \(code)"
        case .noData:
            return "No data received"
        case .networkError(let error):
            return "Network error: \(error.localizedDescription)"
        }
    }
}
```

#### NetworkManager.swift
```swift
class NetworkManager {
    static let shared = NetworkManager()

    private let session: URLSession
    private let decoder = JSONDecoder()

    init(session: URLSession = .shared) {
        self.session = session
        decoder.dateDecodingStrategy = .iso8601
    }

    func request<T: Codable>(
        endpoint: some APIEndpoint,
        responseType: T.Type
    ) async throws -> T {
        let request = try buildRequest(for: endpoint)
        let (data, response) = try await session.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.invalidResponse
        }

        guard (200..<300).contains(httpResponse.statusCode) else {
            throw NetworkError.serverError(httpResponse.statusCode)
        }

        return try decoder.decode(T.self, from: data)
    }

    private func buildRequest(
        for endpoint: some APIEndpoint
    ) throws -> URLRequest {
        var components = URLComponents(
            url: endpoint.baseURL.appendingPathComponent(endpoint.path),
            resolvingAgainstBaseURL: true
        )
        components?.queryItems = endpoint.queryItems

        guard let url = components?.url else {
            throw NetworkError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = endpoint.method.rawValue
        request.allHTTPHeaderFields = endpoint.headers

        return request
    }
}
```

### Repositories

#### CourseRepositoryProtocol.swift
```swift
protocol CourseRepositoryProtocol {
    func getCourses() async throws -> [Course]
    func getCourse(slug: String) async throws -> Course
}
```

#### RemoteCourseRepository.swift
```swift
class RemoteCourseRepository: CourseRepositoryProtocol {
    private let networkManager: NetworkManager
    private let mapper: CourseMapper

    init(
        networkManager: NetworkManager = .shared,
        mapper: CourseMapper = CourseMapper()
    ) {
        self.networkManager = networkManager
        self.mapper = mapper
    }

    func getCourses() async throws -> [Course] {
        let endpoint = CourseAPIEndpoints.getAllCourses
        let dtos = try await networkManager.request(
            endpoint: endpoint,
            responseType: [CourseDTO].self
        )
        return dtos.map { mapper.toDomain($0) }
    }

    func getCourse(slug: String) async throws -> Course {
        let endpoint = CourseAPIEndpoints.getCourse(slug: slug)
        let dto = try await networkManager.request(
            endpoint: endpoint,
            responseType: CourseDTO.self
        )
        return mapper.toDomain(dto)
    }
}
```

#### CourseAPIEndpoints.swift
```swift
enum CourseAPIEndpoints: APIEndpoint {
    case getAllCourses
    case getCourse(slug: String)

    var baseURL: URL {
        URL(string: "http://localhost:8000")!
        // Cambiar para production
    }

    var path: String {
        switch self {
        case .getAllCourses:
            return "/courses"
        case .getCourse(let slug):
            return "/courses/\(slug)"
        }
    }

    var method: HTTPMethod {
        return .get
    }

    var headers: [String: String]? {
        return ["Content-Type": "application/json"]
    }

    var queryItems: [URLQueryItem]? {
        return nil
    }
}
```

### ViewModels

#### CourseListViewModel.swift
```swift
@Observable
final class CourseListViewModel {
    var courses: [Course] = []
    var isLoading = true
    var errorMessage: String?

    private let repository: CourseRepositoryProtocol

    init(repository: CourseRepositoryProtocol = RemoteCourseRepository()) {
        self.repository = repository
    }

    @MainActor
    func loadCourses() async {
        isLoading = true
        errorMessage = nil

        do {
            courses = try await repository.getCourses()
        } catch {
            errorMessage = error.localizedDescription
        }

        isLoading = false
    }
}
```

### Views (SwiftUI)

#### CourseListView.swift
```swift
struct CourseListView: View {
    @State private var viewModel = CourseListViewModel()

    var body: some View {
        NavigationStack {
            if viewModel.isLoading {
                ProgressView()
            } else if let error = viewModel.errorMessage {
                ErrorView(message: error) {
                    Task {
                        await viewModel.loadCourses()
                    }
                }
            } else if viewModel.courses.isEmpty {
                Text("No courses available")
            } else {
                List(viewModel.courses) { course in
                    CourseCardView(course: course)
                }
            }
        }
        .navigationTitle("PlatziFllix")
        .task {
            await viewModel.loadCourses()
        }
    }
}
```

#### CourseCardView.swift
```swift
struct CourseCardView: View {
    let course: Course

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            AsyncImage(url: URL(string: course.thumbnail)) { image in
                image
                    .resizable()
                    .scaledToFill()
            } placeholder: {
                Color.gray
            }
            .frame(height: 200)
            .clipped()

            VStack(alignment: .leading, spacing: 4) {
                Text(course.name)
                    .font(.headline)

                Text(course.description)
                    .font(.caption)
                    .lineLimit(2)
                    .foregroundColor(.secondary)
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
        }
        .background(Color(.systemBackground))
        .cornerRadius(8)
    }
}
```

#### DesignSystem.swift
```swift
struct DesignSystem {
    // Colors
    static let primary = Color(red: 1.0, green: 0, blue: 0)    // Red
    static let secondary = Color(red: 0, green: 0, blue: 0)     // Black
    static let background = Color(.systemBackground)
    static let surface = Color(.secondarySystemBackground)

    // Spacing
    static let spacing = (
        xs: 4.0,
        sm: 8.0,
        md: 16.0,
        lg: 24.0,
        xl: 32.0
    )

    // Typography
    static let fontFamily = "Geist Sans"
}
```

### Testing

```swift
// PlatziFlixiOSTests/CourseRepositoryTests.swift

import XCTest
@testable import PlatziFlixiOS

class CourseRepositoryTests: XCTestCase {
    func testGetCourses() async throws {
        // Given
        let mockNetworkManager = MockNetworkManager()
        let repository = RemoteCourseRepository(networkManager: mockNetworkManager)

        // When
        let courses = try await repository.getCourses()

        // Then
        XCTAssertEqual(courses.count, 2)
        XCTAssertEqual(courses.first?.name, "Course 1")
    }
}
```

### Configuration

#### Info.plist
```xml
<key>NSLocalNetworkUsageDescription</key>
<string>This app needs to connect to your local network.</string>

<key>NSBonjourServices</key>
<array>
    <string>_http._tcp</string>
</array>

<key>NSAllowsLocalNetworking</key>
<true/>
```

### Build & Run

```bash
xcodebuild build                          # Compile
xcodebuild test                           # Run tests
xcodebuild -scheme PlatziFlixiOS run      # Run on simulator
open PlatziFlixiOS.xcodeproj              # Open in Xcode
```

---

## API REST Endpoints

### Base URL
- **Development:** `http://localhost:8000`
- **Staging:** `https://api-staging.platziflix.com` (TBD)
- **Production:** `https://api.platziflix.com` (TBD)

### Response Format

**Success (2xx):**
```json
{
  "data": { /* model or array */ },
  "status": 200,
  "message": "OK"
}
```

**Error (4xx, 5xx):**
```json
{
  "error": "Invalid request",
  "detail": "Rating must be between 1 and 5",
  "status": 400
}
```

### Endpoints

#### Health & Info
| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/` | `{"message": "Bienvenido a Platziflix API"}` |
| GET | `/health` | Health check object |

#### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses` | List all courses |
| GET | `/courses/{slug}` | Get course details |
| GET | `/classes/{class_id}` | Get lesson details |

#### Ratings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/courses/{course_id}/ratings` | Create/update rating |
| GET | `/courses/{course_id}/ratings` | List course ratings |
| GET | `/courses/{course_id}/ratings/stats` | Rating statistics |
| GET | `/courses/{course_id}/ratings/user/{user_id}` | Get user's rating |
| PUT | `/courses/{course_id}/ratings/{user_id}` | Update rating |
| DELETE | `/courses/{course_id}/ratings/{user_id}` | Delete rating |

---

## Flujo de Datos

### User Flow: Listar Cursos

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER OPENS APP / VISITS HOME PAGE                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │ Frontend/Mobile              │
        │ Fetch GET /courses           │
        └────────────┬────────────────┘
                     │
                     ▼
        ┌─────────────────────────────┐
        │ Backend (FastAPI)            │
        │ GET /courses endpoint         │
        │ CourseService.get_all_courses()
        └────────────┬────────────────┘
                     │
                     ▼
        ┌─────────────────────────────┐
        │ PostgreSQL                   │
        │ SELECT * FROM courses        │
        │ WHERE deleted_at IS NULL     │
        └────────────┬────────────────┘
                     │
                     ▼
        ┌─────────────────────────────┐
        │ FastAPI Response             │
        │ List[Course{id, name, ..}]   │
        └────────────┬────────────────┘
                     │
                     ▼
        ┌─────────────────────────────┐
        │ Frontend/Mobile              │
        │ Render Grid/List             │
        │ Display Courses              │
        └─────────────────────────────┘
```

### User Flow: Rating a Course

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER CLICKS ON COURSE DETAIL PAGE                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │ Frontend/Mobile              │
        │ 1. GET /courses/{slug}       │
        │ 2. Render StarRating widget  │
        └────────────┬────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. USER CLICKS ON STAR RATING (e.g., 5 stars)             │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
        ┌─────────────────────────────┐
        │ Frontend/Mobile              │
        │ POST /courses/{id}/ratings   │
        │ Body: {user_id: 1, rating: 5}
        └────────────┬────────────────┘
                     │
                     ▼
        ┌─────────────────────────────┐
        │ Backend (FastAPI)            │
        │ POST /courses/{id}/ratings   │
        │ CourseService.add_course_rating()
        └────────────┬────────────────┘
                     │
                     ▼
        ┌─────────────────────────────┐
        │ PostgreSQL                   │
        │ INSERT/UPDATE course_rating  │
        │ (course_id, user_id unique)  │
        └────────────┬────────────────┘
                     │
                     ▼
        ┌─────────────────────────────┐
        │ FastAPI Response             │
        │ 201 Created or 200 OK        │
        │ RatingResponse{id, rating, ..}
        └────────────┬────────────────┘
                     │
                     ▼
        ┌─────────────────────────────┐
        │ Frontend/Mobile              │
        │ Update UI                    │
        │ Show success message         │
        │ Update rating stats          │
        └─────────────────────────────┘
```

---

## Convenciones de Código

### Python (Backend)

```python
# Variables y funciones: snake_case
user_id = 1
def get_course_by_slug(slug: str) -> Course:
    pass

# Clases: PascalCase
class CourseService:
    pass

# Constantes: UPPER_SNAKE_CASE
MAX_RATING = 5
DEFAULT_PAGE_SIZE = 20

# Type hints obligatorios
async def create_rating(
    course_id: int,
    user_id: int,
    rating: int
) -> Rating:
    pass
```

### TypeScript (Frontend)

```typescript
// Variables y funciones: camelCase
const userId = 1;
function getCourseBySlug(slug: string): Course {
}

// Componentes React: PascalCase
function CourseDetail() {
  return <div></div>;
}

// Interfaces/Types: PascalCase
interface Course {
  id: number;
  name: string;
}

// Constantes: UPPER_SNAKE_CASE
const MAX_RATING = 5;
const API_BASE_URL = 'http://localhost:8000';
```

### Kotlin (Android)

```kotlin
// Variables: camelCase
val userId = 1
var courseName = "Kotlin Basics"

// Funciones: camelCase
fun getCourseBySlug(slug: String): Course {
}

// Clases: PascalCase
class CourseListViewModel : ViewModel() {
}

// Constantes: UPPER_SNAKE_CASE
companion object {
    const val API_BASE_URL = "http://10.0.2.2:8000/"
}

// Sealed classes para states
sealed class CourseListUiState {
    object Loading : CourseListUiState()
    data class Success(val courses: List<Course>) : CourseListUiState()
}
```

### Swift (iOS)

```swift
// Variables: camelCase
let userId = 1
var courseName = "Swift Basics"

// Funciones: camelCase
func getCourseBySlug(slug: String) -> Course {
}

// Structs/Classes: PascalCase
struct Course: Identifiable {
}

// Constants: PascalCase (Swift convention)
let APIBaseURL = URL(string: "http://localhost:8000")!

// Enums: PascalCase
enum HTTPMethod: String {
    case get = "GET"
}
```

---

## Guía de Desarrollo Local

### Requisitos

- **Docker** + Docker Compose
- **Node.js** 18+ (para Frontend)
- **Python** 3.11+ (para Backend)
- **Xcode** 15+ (para iOS)
- **Android Studio** (para Android)
- **Git**

### Setup Inicial Completo

```bash
# 1. Clonar repositorio (si no está clonado)
git clone <repo-url>
cd claude-code

# 2. Backend Setup
cd Backend
make start              # docker-compose up -d
make migrate            # Ejecutar migraciones
make seed               # Cargar datos de prueba
# Backend en http://localhost:8000

# 3. Frontend Setup (en otra terminal)
cd Frontend
yarn install
yarn dev
# Frontend en http://localhost:3000

# 4. Android Setup
cd Mobile/PlatziFlixAndroid
./gradlew build
./gradlew installDebug  # Si emulador/device conectado

# 5. iOS Setup
cd Mobile/PlatziFlixiOS
# Abrir en Xcode y build
open PlatziFlixiOS.xcodeproj
```

### Verificar Conectividad

```bash
# Verificar que Backend está corriendo
curl http://localhost:8000/health

# Verificar que Frontend está corriendo
curl http://localhost:3000

# Verificar BD
docker exec claude-code-db-1 psql -U platziflix_user -d platziflix_db -c "SELECT COUNT(*) FROM courses;"
```

### Comandos Útiles

#### Backend
```bash
cd Backend

# Desarrollo
make start              # Iniciar containers
make stop               # Detener containers
make logs               # Ver logs en vivo
make clean              # Limpiar todo

# Base de datos
make migrate            # Ejecutar migraciones
make create-migration   # Crear nueva migración
make seed               # Cargar datos de prueba
make seed-fresh         # Limpiar y recargar datos

# Testing
uv run pytest           # Ejecutar todos los tests
uv run pytest -v        # Con verbosidad
```

#### Frontend
```bash
cd Frontend

# Desarrollo
yarn dev                # Dev server
yarn build              # Production build
yarn start              # Start production server

# Testing
yarn test               # Run tests
yarn test:watch         # Watch mode
yarn lint               # ESLint

# Scripts
yarn format             # Si está configurado
```

#### Android
```bash
cd Mobile/PlatziFlixAndroid

./gradlew build                 # Compile
./gradlew test                  # Unit tests
./gradlew connectedAndroidTest  # Instrumented tests
./gradlew assembleDebug         # Build APK
./gradlew installDebug          # Install in emulator/device
```

#### iOS
```bash
cd Mobile/PlatziFlixiOS

xcodebuild build                        # Compile
xcodebuild test                         # Run tests
xcodebuild -scheme PlatziFlixiOS run    # Run in simulator
```

### Troubleshooting

**Backend no inicia:**
```bash
# Verificar puertos
lsof -i :8000           # Backend
lsof -i :5432           # PostgreSQL

# Limpiar volumes
docker-compose down -v
make start
```

**Frontend connection refused:**
```bash
# Verificar que Backend está corriendo
curl http://localhost:8000

# Verificar .env.local o próxima configuración
# En next.config.ts asegurar que fetch apunta a http://localhost:8000
```

**Android emulator cannot reach localhost:**
```bash
# En NetworkModule.kt, cambiar base URL a:
const val BASE_URL = "http://10.0.2.2:8000/"  # Para emulador
```

**iOS simulator cannot reach localhost:**
```swift
// En CourseAPIEndpoints.swift:
var baseURL: URL {
    // Para simulator:
    URL(string: "http://localhost:8000")!
    // Para dispositivo físico:
    // URL(string: "http://192.168.1.XXX:8000")!
}
```

---

## Testing

### Backend (Python/pytest)

```bash
cd Backend

# Ejecutar todos los tests
uv run pytest

# Tests específicos
uv run pytest tests/test_rating_endpoints.py -v
uv run pytest tests/test_course_rating_service.py::test_add_rating -v

# Con coverage
uv run pytest --cov=app --cov-report=html

# Watch mode (si pytest-watch instalado)
uv run ptw
```

**Test files estructura:**
- `tests/test_main.py` - Tests básicos
- `tests/test_rating_endpoints.py` - Endpoints de rating
- `tests/test_course_rating_service.py` - Lógica de servicio
- `tests/test_rating_db_constraints.py` - Constraints de BD

### Frontend (Next.js/Vitest)

```bash
cd Frontend

# Ejecutar todos los tests
yarn test

# Tests específicos
yarn test components/StarRating

# Watch mode
yarn test:watch

# Coverage
yarn test --coverage
```

**Test files estructura:**
- `src/app/**/*.test.tsx` - Page tests
- `src/components/**/__test__/*.test.tsx` - Component tests
- `src/services/**/*.test.ts` - Service tests

**Testing Library patterns:**
```typescript
// Render component
render(<StarRating rating={3} onRate={handler} />)

// Query elements
screen.getByRole('button')
screen.getByText('Course name')

// User interactions
user.click(screen.getByRole('button'))

// Assertions
expect(screen.getByText('Success')).toBeInTheDocument()
```

### Android (Kotlin/JUnit)

```bash
cd Mobile/PlatziFlixAndroid

# Unit tests
./gradlew test

# Instrumented tests (en device/emulator)
./gradlew connectedAndroidTest

# Tests específicos
./gradlew test --tests CourseListViewModelTest
```

**Test structure:**
- `app/src/test/` - Unit tests (local JVM)
- `app/src/androidTest/` - Instrumented tests (device)

### iOS (Swift/XCTest)

```bash
cd Mobile/PlatziFlixiOS

# Ejecutar tests en Xcode
xcodebuild test

# Tests desde CLI
xcodebuild test -scheme PlatziFlixiOS
```

---

## Notas Importantes

### Base de Datos

- **Soft deletes:** Todos los queries deben filtrar `WHERE deleted_at IS NULL`
- **Migraciones:** Siempre usar Alembic, nunca modificar schema manualmente
- **Unique constraints:** `(course_id, user_id)` en course_rating solo considera no eliminados

### Security Considerations

- Backend HTTPS solo en producción
- Frontend: no almacenar tokens en localStorage sin protección
- Android/iOS: usar Keystore/Keychain para credentials
- Validar CORS en producción
- Rate limiting en API (TBD)

### Performance

- Frontend: SSR en Next.js reduce tiempo de carga
- Backend: índices en slug y course_id para queries rápidas
- Mobile: paginación en listas largas
- Caché en clientes móviles (TBD)

### Monitoring & Logging

- Backend: logs con uvicorn + custom logging
- Frontend: error tracking (Sentry, TBD)
- Mobile: crash reporting (Firebase, TBD)

---

## Próximas Features (Roadmap)

- [ ] Sistema de autenticación (JWT)
- [ ] Perfiles de usuario
- [ ] Historial de reproducción
- [ ] Recomendaciones personalizadas
- [ ] Búsqueda y filtros avanzados
- [ ] Progreso del curso por usuario
- [ ] Certificados
- [ ] Sistema de comentarios
- [ ] Caché offline en mobile
- [ ] Analytics

---

**Última actualización:** 2025-11-22
**Responsable:** Claude Code
**Versión documento:** 1.0
