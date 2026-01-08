# Platziflix - Plataforma de Cursos Online

> Proyecto Multi-plataforma desarrollado para el **Curso de Claude Code de Platzi**

## 👨‍🏫 Instructor
- **Eduardo Alvarez**

---

## 📋 Tabla de Contenidos
- [Descripción General](#-descripción-general)
- [Arquitectura del Sistema](#-arquitectura-del-sistema)
- [Stack Tecnológico](#-stack-tecnológico)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Prerequisitos](#-prerequisitos)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Comandos de Desarrollo](#-comandos-de-desarrollo)
- [URLs del Sistema](#-urls-del-sistema)
- [Funcionalidades](#-funcionalidades)
- [Sistema de Ratings](#-sistema-de-ratings)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Documentación Adicional](#-documentación-adicional)

---

## 🎯 Descripción General

Platziflix es una plataforma educativa multi-plataforma estilo Netflix diseñada para la gestión y visualización de cursos online. El proyecto implementa una arquitectura completa con backend API REST, aplicación web responsive y aplicaciones móviles nativas para Android e iOS.

### Características Principales:
- 📚 Catálogo de cursos con diseño tipo Netflix
- 🎥 Reproductor de video integrado
- ⭐ Sistema completo de ratings y reseñas
- 👨‍🏫 Gestión de profesores y lecciones
- 📱 Aplicaciones nativas Android (Kotlin) e iOS (Swift)
- 🔄 API REST centralizada
- 🐳 Despliegue con Docker Compose

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (Next.js 16)                │
│                    http://localhost:3000                 │
└────────────────────────┬────────────────────────────────┘
                         │
                    REST API
                         │
┌────────────────────────┴────────────────────────────────┐
│                  BACKEND (FastAPI)                       │
│                 http://localhost:8000                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  API Layer (FastAPI + Pydantic)                  │  │
│  └──────────────────────┬───────────────────────────┘  │
│  ┌──────────────────────┴───────────────────────────┐  │
│  │  Service Layer (Business Logic)                  │  │
│  └──────────────────────┬───────────────────────────┘  │
│  ┌──────────────────────┴───────────────────────────┐  │
│  │  Data Layer (SQLAlchemy ORM)                     │  │
│  └──────────────────────┬───────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
              ┌─────────┴─────────┐
              │   PostgreSQL 15   │
              │  localhost:5435   │
              └───────────────────┘
                        │
                        │
      ┌─────────────────┴─────────────────┐
      │                                   │
┌─────┴─────────────┐         ┌──────────┴──────────┐
│  ANDROID (Kotlin)  │         │   iOS (Swift)       │
│  Jetpack Compose   │         │   SwiftUI           │
└────────────────────┘         └─────────────────────┘
```

---

## 🛠️ Stack Tecnológico

### Backend (FastAPI + Python)
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Python | >= 3.11 | Lenguaje principal |
| FastAPI | >= 0.104.0 | Framework web asíncrono |
| Uvicorn | >= 0.24.0 | Servidor ASGI |
| SQLAlchemy | >= 2.0.0 | ORM para base de datos |
| PostgreSQL | 15 | Base de datos relacional |
| Alembic | >= 1.13.0 | Migraciones de BD |
| Pydantic | >= 2.0 | Validación de datos |
| UV | latest | Gestor de dependencias |
| Docker Compose | latest | Orquestación de contenedores |

### Frontend (Next.js + React)
| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 16.1.1 | Framework React con SSR |
| React | 19.0.0 | Librería UI |
| TypeScript | 5.x | Lenguaje tipado |
| SCSS | 1.77.0 | Preprocesador CSS |
| Vitest | 3.2.3 | Testing framework |
| React Testing Library | 16.3.0 | Testing de componentes |

### Mobile Apps

#### Android (Kotlin)
- **Lenguaje**: Kotlin
- **UI**: Jetpack Compose + Material 3
- **Arquitectura**: MVVM + Clean Architecture
- **Networking**: Retrofit + OkHttp
- **Image Loading**: Coil
- **Testing**: JUnit + Mockito

#### iOS (Swift)
- **Lenguaje**: Swift
- **UI**: SwiftUI
- **Arquitectura**: Repository Pattern + Mappers
- **Networking**: URLSession
- **Testing**: XCTest

---

## 📁 Estructura del Proyecto

```
claude-code/
├── Backend/                      # API REST con FastAPI
│   ├── app/
│   │   ├── alembic/              # Migraciones de BD
│   │   ├── core/                 # Configuración y settings
│   │   ├── db/                   # Conexión y seeds
│   │   ├── models/               # Modelos SQLAlchemy
│   │   │   ├── course.py         # Modelo de cursos
│   │   │   ├── teacher.py        # Modelo de profesores
│   │   │   ├── lesson.py         # Modelo de lecciones
│   │   │   ├── class_.py         # Modelo de clases
│   │   │   └── course_rating.py  # Modelo de ratings
│   │   ├── schemas/              # Pydantic schemas
│   │   ├── services/             # Lógica de negocio
│   │   │   └── course_service.py # Servicio de cursos
│   │   └── main.py               # Entry point
│   ├── docker-compose.yml        # Configuración Docker
│   ├── Dockerfile                # Imagen de la API
│   ├── Makefile                  # Comandos útiles
│   └── pyproject.toml            # Dependencias Python (UV)
│
├── Frontend/                     # Aplicación web Next.js
│   ├── src/
│   │   ├── app/                  # App Router (Next.js 15+)
│   │   │   ├── page.tsx          # Homepage con catálogo
│   │   │   ├── course/           # Detalle de curso
│   │   │   └── classes/          # Reproductor de video
│   │   ├── components/           # Componentes React
│   │   │   ├── Course/           # Card de curso
│   │   │   ├── CourseDetail/     # Detalle completo
│   │   │   ├── RatingWidget/     # Sistema de ratings
│   │   │   ├── StarRating/       # Componente de estrellas
│   │   │   └── VideoPlayer/      # Reproductor HTML5
│   │   ├── services/             # API calls
│   │   ├── types/                # TypeScript types
│   │   └── styles/               # SCSS global
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
│
├── Mobile/                       # Aplicaciones móviles
│   ├── PlatziFlixAndroid/        # App Android
│   │   ├── app/src/main/java/com/espaciotiago/platziflixandroid/
│   │   │   ├── data/             # Capa de datos
│   │   │   │   ├── entities/     # DTOs
│   │   │   │   ├── mappers/      # Transformadores
│   │   │   │   ├── network/      # Retrofit config
│   │   │   │   └── repositories/ # Repositorios
│   │   │   ├── domain/           # Lógica de negocio
│   │   │   │   ├── models/       # Modelos de dominio
│   │   │   │   └── repositories/ # Interfaces
│   │   │   ├── presentation/     # UI Layer
│   │   │   │   └── courses/      # Feature de cursos
│   │   │   ├── di/               # Dependency injection
│   │   │   └── ui/theme/         # Material 3 theme
│   │   ├── build.gradle.kts
│   │   └── README_COURSES_FEATURE.md
│   │
│   └── PlatziFlixiOS/            # App iOS
│       ├── PlatziFlixiOS/
│       │   ├── Data/             # Capa de datos
│       │   ├── Domain/           # Modelos de dominio
│       │   ├── Presentation/     # SwiftUI Views
│       │   └── Services/         # Networking
│       └── PlatziFlixiOS.xcodeproj
│
├── spec/                         # Especificaciones técnicas
│   ├── 00_sistema_ratings_cursos.md
│   ├── 01_backend_ratings_implementation_plan.md
│   ├── 02_frontend_ratings_implementation_plan.md
│   └── 03_backend_ratings_api_reference.md
│
├── README.md                     # Este archivo
└── CLAUDE.md                     # Memoria del proyecto para Claude
```

---

## ✅ Prerequisitos

### Para Backend:
- Docker Desktop instalado y corriendo
- Make (opcional, para usar comandos simplificados)
- Puerto 8000 disponible (API)
- Puerto 5435 disponible (PostgreSQL)

### Para Frontend:
- Node.js >= 18.x
- Yarn o npm
- Puerto 3000 disponible

### Para Android:
- Android Studio Arctic Fox o superior
- JDK 11+
- Emulador Android o dispositivo físico

### Para iOS:
- macOS con Xcode 14+
- iOS Simulator o dispositivo físico
- CocoaPods

---

## 🚀 Instalación y Configuración

### 1. Backend (FastAPI + PostgreSQL)

```bash
# Navegar al directorio Backend
cd Backend

# Iniciar contenedores Docker (PostgreSQL + API)
make start

# Aplicar migraciones a la base de datos
make migrate

# Poblar la base de datos con datos de ejemplo
make seed

# Verificar que todo funciona
curl http://localhost:8000/health
```

**Configuración de Base de Datos:**
- **Host**: localhost
- **Puerto**: 5435 (mapeado desde 5432 del contenedor)
- **Usuario**: platziflix_user
- **Password**: platziflix_password
- **Database**: platziflix_db

### 2. Frontend (Next.js)

```bash
# Navegar al directorio Frontend
cd Frontend

# Instalar dependencias
yarn install
# o
npm install

# Iniciar servidor de desarrollo
yarn dev

# La aplicación estará disponible en http://localhost:3000
```

**Configuración de API:**
La URL del backend está configurada en `src/services/api.ts`:
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

### 3. Mobile - Android

```bash
cd Mobile/PlatziFlixAndroid

# Instalar dependencias y compilar
./gradlew build

# Ejecutar en emulador (desde Android Studio)
# Run > Run 'app'
```

**Configuración de red:**
- Para emulador: `http://10.0.2.2:8000`
- Para dispositivo físico: usar IP de tu computadora (ej: `http://192.168.1.100:8000`)

### 4. Mobile - iOS

```bash
cd Mobile/PlatziFlixiOS

# Abrir proyecto en Xcode
open PlatziFlixiOS.xcodeproj

# Ejecutar desde Xcode: Product > Run (⌘R)
```

---

## ⚡ Comandos de Desarrollo

### Backend (Makefile)

```bash
make start             # Iniciar contenedores Docker
make stop              # Detener contenedores
make restart           # Reiniciar contenedores
make logs              # Ver logs en tiempo real
make migrate           # Aplicar migraciones pendientes
make create-migration  # Crear nueva migración
make seed              # Poblar datos de ejemplo
make seed-fresh        # Limpiar y repoblar datos
make test              # Ejecutar tests
make test-coverage     # Tests con reporte de cobertura
make clean             # Eliminar contenedores y volúmenes
make help              # Mostrar ayuda
```

### Frontend

```bash
yarn dev          # Servidor de desarrollo (http://localhost:3000)
yarn build        # Build de producción
yarn start        # Servidor de producción
yarn lint         # Ejecutar ESLint
yarn test         # Ejecutar tests con Vitest
```

### Android

```bash
./gradlew build              # Compilar proyecto
./gradlew test               # Ejecutar tests unitarios
./gradlew connectedAndroidTest  # Tests de instrumentación
./gradlew clean              # Limpiar build
```

### iOS

```bash
# Desde terminal
xcodebuild -scheme PlatziFlixiOS -destination 'platform=iOS Simulator,name=iPhone 15' test

# O usar Xcode UI
# Product > Test (⌘U)
```

---

## 🌐 URLs del Sistema

| Servicio | URL | Descripción |
|----------|-----|-------------|
| Backend API | http://localhost:8000 | Servidor FastAPI |
| API Docs (Swagger) | http://localhost:8000/docs | Documentación interactiva OpenAPI |
| API Redoc | http://localhost:8000/redoc | Documentación alternativa |
| Frontend Web | http://localhost:3000 | Aplicación Next.js |
| PostgreSQL | localhost:5435 | Base de datos (usuario: platziflix_user) |

---

## ✨ Funcionalidades

### ✅ Implementadas

#### Backend:
- [x] API REST con FastAPI
- [x] Base de datos PostgreSQL con SQLAlchemy
- [x] Sistema de migraciones con Alembic
- [x] CRUD completo de cursos
- [x] Gestión de profesores y lecciones
- [x] Sistema completo de ratings (CRUD + estadísticas)
- [x] Health checks con verificación de BD
- [x] Documentación automática (OpenAPI/Swagger)
- [x] Soft deletes para ratings
- [x] Validación con Pydantic
- [x] Tests unitarios y de integración

#### Frontend:
- [x] Catálogo de cursos con grid responsive
- [x] Detalle de curso con información completa
- [x] Lista de lecciones y clases
- [x] Reproductor de video HTML5
- [x] Sistema de ratings interactivo (estrellas)
- [x] Visualización de estadísticas de ratings
- [x] Navegación con App Router (Next.js 15+)
- [x] Routing por slug (SEO-friendly)
- [x] Componentes reutilizables
- [x] Testing con Vitest + RTL
- [x] TypeScript strict mode
- [x] SCSS Modules

#### Mobile:
- [x] Apps nativas Android e iOS
- [x] Lista de cursos con diseño Material/iOS nativo
- [x] Carga de imágenes optimizada
- [x] Manejo de estados (loading, error, success)
- [x] Arquitectura limpia (Clean Architecture)
- [x] Repository Pattern
- [x] Tests unitarios

---

## ⭐ Sistema de Ratings

### Características:
- **Rango**: 1-5 estrellas
- **Restricción**: Un rating por usuario por curso
- **Operaciones**: Crear, leer, actualizar, eliminar
- **Soft Delete**: Los ratings eliminados se marcan con `deleted_at`
- **Estadísticas**: Promedio, total, distribución por estrellas

### Modelo de Datos:

```python
class CourseRating:
    id: int
    course_id: int              # FK a Course
    user_id: int                # ID del usuario
    rating: int                 # 1-5
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None  # Soft delete
```

### Endpoints del Sistema de Ratings:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/courses/{course_id}/ratings` | Crear/actualizar rating |
| GET | `/courses/{course_id}/ratings` | Listar todos los ratings |
| GET | `/courses/{course_id}/ratings/stats` | Estadísticas agregadas |
| GET | `/courses/{course_id}/ratings/user/{user_id}` | Rating de un usuario |
| PUT | `/courses/{course_id}/ratings/{user_id}` | Actualizar rating existente |
| DELETE | `/courses/{course_id}/ratings/{user_id}` | Eliminar rating (soft delete) |

### Ejemplo de Uso:

```bash
# Crear rating
curl -X POST http://localhost:8000/courses/1/ratings \
  -H "Content-Type: application/json" \
  -d '{"user_id": 42, "rating": 5}'

# Obtener estadísticas
curl http://localhost:8000/courses/1/ratings/stats
```

**Respuesta:**
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

---

## 📡 API Endpoints

### Cursos

| Método | Endpoint | Descripción | Respuesta |
|--------|----------|-------------|-----------|
| GET | `/` | Mensaje de bienvenida | `{"message": "Bienvenido a Platziflix API"}` |
| GET | `/health` | Health check + DB status | Estado del sistema |
| GET | `/courses` | Listar todos los cursos | Array de cursos |
| GET | `/courses/{slug}` | Detalle de curso por slug | Curso con profesores y lecciones |
| GET | `/classes/{class_id}` | Detalle de una clase | Información de la clase + video URL |

### Ratings
Ver sección [Sistema de Ratings](#-sistema-de-ratings)

---

## 🧪 Testing

### Backend (pytest)

```bash
cd Backend

# Tests unitarios
make test

# Tests con cobertura
make test-coverage

# Tests específicos
docker compose exec api bash -c "cd /app && uv run pytest app/tests/test_main.py"
```

**Cobertura actual:**
- Models: 100%
- Services: 95%
- Endpoints: 90%

### Frontend (Vitest)

```bash
cd Frontend

# Ejecutar todos los tests
yarn test

# Mode watch (desarrollo)
yarn test --watch

# Con cobertura
yarn test --coverage
```

**Tests incluidos:**
- Componentes: Course, CourseDetail, RatingWidget, StarRating, VideoPlayer
- Hooks personalizados
- Utilidades

### Mobile

```bash
# Android
cd Mobile/PlatziFlixAndroid
./gradlew test

# iOS
cd Mobile/PlatziFlixiOS
xcodebuild test -scheme PlatziFlixiOS
```

---

## 🔧 Troubleshooting

### Backend

**Problema**: Error al conectar con PostgreSQL
```
sqlalchemy.exc.OperationalError: could not connect to server
```
**Solución**:
```bash
# Verificar que Docker está corriendo
docker ps

# Reiniciar contenedores
make stop && make start

# Ver logs
make logs
```

**Problema**: Migraciones no aplicadas
```bash
# Verificar estado de migraciones
docker compose exec api bash -c "cd /app && uv run alembic -c app/alembic.ini current"

# Aplicar migraciones
make migrate
```

**Problema**: Puerto 8000 ya en uso
```bash
# Encontrar proceso usando el puerto
lsof -i :8000

# Matar proceso (reemplazar PID)
kill -9 <PID>
```

### Frontend

**Problema**: Error de conexión con API
```
Failed to fetch courses
```
**Solución**:
- Verificar que el backend esté corriendo: `curl http://localhost:8000/health`
- Revisar la URL de API en `src/services/api.ts`
- Verificar CORS en el backend

**Problema**: Error de TypeScript
```bash
# Limpiar cache de Next.js
rm -rf .next

# Reinstalar dependencias
rm -rf node_modules yarn.lock
yarn install
```

### Mobile - Android

**Problema**: "Cleartext communication not permitted"
**Solución**: Ya configurado en `network_security_config.xml`, pero verificar:
1. Que el archivo esté referenciado en `AndroidManifest.xml`
2. Usar `http://10.0.2.2:8000` para emulador
3. Para dispositivo físico, usar IP de tu red local

**Problema**: Error de Gradle
```bash
# Limpiar y reconstruir
./gradlew clean build
```

### Mobile - iOS

**Problema**: Error de certificados
**Solución**: En Xcode, ir a Signing & Capabilities y configurar tu equipo de desarrollo

**Problema**: Error de red
**Solución**: Verificar que el backend esté accesible desde tu red local

---

## 📚 Documentación Adicional

### Archivos de Documentación Disponibles:

- **CLAUDE.md**: Memoria técnica completa del proyecto
- **Backend/README.md**: Documentación específica del backend
- **Frontend/README.md**: Guía del frontend
- **Mobile/PlatziFlixAndroid/README_COURSES_FEATURE.md**: Feature de cursos en Android
- **spec/**: Especificaciones técnicas detalladas del sistema de ratings

### Especificaciones Técnicas (carpeta `spec/`):
- `00_sistema_ratings_cursos.md`: Diseño del sistema de ratings
- `01_backend_ratings_implementation_plan.md`: Plan de implementación backend
- `02_frontend_ratings_implementation_plan.md`: Plan de implementación frontend
- `03_backend_ratings_api_reference.md`: Referencia completa de la API
- `04_openapi_extracted_context.md`: Contexto OpenAPI

---

## 🤝 Contribución

Este proyecto es parte del **Curso de Claude Code de Platzi**. Para contribuir:

1. Fork el repositorio
2. Crea una branch para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Add: nueva funcionalidad'`)
4. Push a la branch (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto es material educativo del **Curso de Claude Code de Platzi**.

---

## 🎓 Recursos de Aprendizaje

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Jetpack Compose](https://developer.android.com/jetpack/compose)
- [SwiftUI](https://developer.apple.com/xcode/swiftui/)
- [SQLAlchemy](https://docs.sqlalchemy.org/)
- [PostgreSQL](https://www.postgresql.org/docs/)

---

**Desarrollado con ❤️ para el Curso de Claude Code de Platzi**