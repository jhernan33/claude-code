# Frontend Rating System - Documentación Completa

Documentación centralizada para completar la implementación del sistema de ratings en Platziflix Frontend.

**Estado**: 60% completado (necesita 40% adicional)
**Documentos relacionados**: 3 (Plan, Ejemplos, Validación)
**Última actualización**: 2025-11-28

---

## INICIO RÁPIDO

### Para Developers que Empiezan AHORA

```bash
# 1. Estar en la carpeta correcta
cd /home/hernan/Platzi/claudeCode/claude-code/Frontend

# 2. Instalar dependencias
yarn install

# 3. En Terminal 1: Dev server
yarn dev

# 4. En Terminal 2: Tests
yarn test --watch

# 5. Leer documentación
# Lee: FRONTEND_IMPLEMENTATION_PLAN.md primero (10 min)
# Luego: FRONTEND_CODE_EXAMPLES.md para cada sección
```

### Estado Actual

```
✅ BACKEND: 100% COMPLETADO
├─ 6 endpoints API funcionales
├─ 33 tests pasando
├─ BD migrada con tabla course_ratings
└─ Toda lógica de negocio lista

⚠️ FRONTEND: 60% COMPLETADO
├─ ✅ StarRating (readonly) - componente + tests
├─ ✅ ratingsApi service - CRUD completo
├─ ✅ Tipos completos (CourseRating, RatingRequest, etc)
├─ ✅ Visualización en Course cards
├─ ❌ FALTA: Autenticación (3-4 h)
├─ ❌ FALTA: RatingWidget interactivo (8-10 h)
└─ ❌ FALTA: Integración CourseDetail (2-3 h)
```

---

## DOCUMENTACIÓN DISPONIBLE

### 1. FRONTEND_IMPLEMENTATION_PLAN.md (40+ páginas)

**Qué contiene:**
- Análisis de brecha detallado
- Arquitectura de solución completa
- 3 fases de implementación paso a paso
- Especificaciones técnicas
- Plan de testing exhaustivo
- Guía práctica inmediata

**Cuándo leer:**
- **Primera lectura** - debe leer primero (10-15 min)
- Define toda la estrategia
- Base para entender el proyecto

**Secciones principales:**
1. Análisis de Brecha (qué falta, dependencias)
2. Arquitectura (diagrama de componentes, flujos)
3. Fase 1: Autenticación (UserContext + useUser)
4. Fase 2: RatingWidget (componente interactivo)
5. Fase 3: Integración (CourseDetail + flujo completo)
6. Especificación técnica (props, estados, errores)
7. Plan de testing (unitarios, integración, E2E)
8. Checklist detallado (archivos, tareas, criterios)
9. Guía paso a paso (qué hacer ahora mismo)

---

### 2. FRONTEND_CODE_EXAMPLES.md (100+ ejemplos)

**Qué contiene:**
- Código 100% funcional y listo para usar
- Ejemplos de cada archivo a crear
- Ejemplos de tests para cada componente
- SCSS completo con animaciones

**Cuándo usar:**
- **Durante la implementación** - copiar y adaptar
- Tiene ejemplos para CADA paso
- Incluye casos de error y edge cases

**Cómo usarlo:**
```
Para cada archivo:
1. Ver documentación en PLAN
2. Copiar código de EXAMPLES
3. Adaptar a tu contexto (imports, paths)
4. Correr tests
5. Validar en navegador
```

**Secciones:**

#### Fase 1: Autenticación
- `/src/types/auth.ts` - tipos completamente documentados
- `/src/context/AuthContext.tsx` - con localStorage + persistencia
- `/src/hooks/useUser.ts` - hook reutilizable
- Ejemplos de tests para ambos
- Modificación de layout.tsx

#### Fase 2: RatingWidget
- `/src/components/RatingWidget/RatingPrompt.tsx` - subcomponente
- `/src/components/RatingWidget/RatingModal.tsx` - subcomponente
- `/src/components/RatingWidget/RatingWidget.tsx` - componente principal
- `/src/components/RatingWidget/RatingWidget.module.scss` - estilos + animations
- Tests exhaustivos para cada componente

#### Fase 3: Integración
- Modificación de `CourseDetail.tsx` a Client Component
- Integración de RatingWidget en CourseDetail
- Modificación de page.tsx para fetch server-side

---

### 3. VALIDATION_CHECKLIST.md (test cases)

**Qué contiene:**
- Checklist para cada fase
- Pasos de validación manual
- Test cases específicos
- Verificación de funcionalidad
- Edge cases

**Cuándo usar:**
- **Después de cada fase** - validar antes de pasar a la siguiente
- **Pruebas manuales** - instrucciones paso a paso
- **QA** - casos de prueba

**Secciones:**
1. Validación Fase 1 (Autenticación)
2. Validación Fase 2 (RatingWidget)
3. Validación Fase 3 (Integración)
4. Testing summary (conteo de tests)
5. Deployment checklist
6. Debugging tips

---

## PLAN DE EJECUCIÓN

### Estimación de Tiempo

```
Fase 1: Autenticación        3-4 horas
Fase 2: RatingWidget         8-10 horas
Fase 3: Integración          2-3 horas
                            ────────────
Total                        13-17 horas
```

### Timeline Recomendado

```
Día 1 (4-5 horas):
├─ Mañana: Leer documentación + setup
├─ Tarde 1: Implementar Fase 1 (Autenticación)
└─ Tarde 2: Validar Fase 1 con tests

Día 2 (6-8 horas):
├─ Mañana: Implementar Fase 2 (RatingWidget)
└─ Tarde: Validar Fase 2 + ajustes

Día 3 (3-4 horas):
├─ Mañana: Implementar Fase 3 (Integración)
├─ Medio día: Validar flujo completo
└─ Tarde: Testing E2E + debugging
```

### Prerequisitos

```bash
# Verificar todo está setup
✓ Node.js 18+
✓ yarn instalado
✓ Backend corriendo en puerto 8000
✓ Base de datos PostgreSQL
✓ Código fuente disponible

# Verificar backend
curl http://localhost:8000/health
# Esperado: {"status": "ok", "database": true}
```

---

## FLUJO DE TRABAJO

### Para cada Fase

1. **Leer documentación** (PLAN)
   ```
   - Entender qué se va a hacer
   - Ver diagrama de arquitectura
   - Leer especificaciones técnicas
   ```

2. **Copiar código** (EXAMPLES)
   ```
   - Copiar cada archivo
   - Adaptar imports/paths si es necesario
   - No cambiar lógica central
   ```

3. **Escribir tests**
   ```
   - Copiar tests del documento
   - Adaptar mocks si es necesario
   - Ejecutar: yarn test
   ```

4. **Validar** (CHECKLIST)
   ```
   - Seguir checklist de la fase
   - Probar en navegador
   - Verificar funcionalidad
   ```

5. **Commit a Git**
   ```bash
   git add .
   git commit -m "Implement Phase N: Description"
   git push
   ```

---

## ESTRUCTURA DE ARCHIVOS

Archivos que se van a CREAR:

```
Frontend/src/
├── types/
│   └── auth.ts                                    (NUEVO)
├── context/
│   ├── AuthContext.tsx                           (NUEVO)
│   └── __tests__/
│       └── AuthContext.test.tsx                  (NUEVO)
├── hooks/
│   ├── useUser.ts                                (NUEVO)
│   └── __tests__/
│       └── useUser.test.ts                       (NUEVO)
└── components/
    └── RatingWidget/                             (NUEVA CARPETA)
        ├── RatingPrompt.tsx                      (NUEVO)
        ├── RatingModal.tsx                       (NUEVO)
        ├── RatingWidget.tsx                      (NUEVO)
        ├── RatingWidget.module.scss              (NUEVO)
        └── __tests__/
            ├── RatingPrompt.test.tsx             (NUEVO)
            ├── RatingModal.test.tsx              (NUEVO)
            └── RatingWidget.test.tsx             (NUEVO)
```

Archivos que se van a MODIFICAR:

```
Frontend/src/
├── app/
│   └── layout.tsx                      (AGREGAR AuthProvider)
└── components/
    ├── Course/
    │   └── Course.tsx                  (YA ESTÁ LISTO - no modificar)
    └── CourseDetail/
        ├── CourseDetail.tsx            (MODIFICAR - agregar RatingWidget)
        └── CourseDetail.module.scss    (MODIFICAR - agregar estilos)

Frontend/src/app/course/
└── [slug]/
    └── page.tsx                        (MODIFICAR - agregar getCourseStats)
```

---

## ARQUITECTURA VISUAL

### Flujo de Datos

```
User Opens Page
      ↓
[Next.js Page] (Server Component)
      ↓
  Fetch Data:
  - GET /courses/{slug}
  - GET /courses/{courseId}/ratings/stats
      ↓
[CourseDetail] (Client Component)
      ├─ Mostrar info del curso
      ├─ Mostrar rating promedio (readonly)
      │
      ├─ Usar: useUser() hook
      │  └─ Obtener user_id actual
      │
      └─ Render: RatingWidget
           │
           ├─ Fetch: GET /ratings/user/{userId}
           │  (ver si usuario tiene rating)
           │
           ├─ Si user ha calificado:
           │  └─ Mostrar: "Tu calificación: 4★"
           │     Botones: [Editar] [Eliminar]
           │
           └─ Si user NO ha calificado:
              └─ Mostrar: "¿Te gustó?"
                 Botón: [Califica ahora]

               Click [Califica ahora]
                     ↓
               [RatingModal]
               - Seleccionar 1-5 estrellas
               - Preview message
               - [Cancelar] [Confirmar]
                     ↓
               API Calls:
               - POST /ratings (crear) OR
               - PUT /ratings/{userId} (actualizar) OR
               - DELETE /ratings/{userId} (eliminar)
                     ↓
               Refresh Stats
               Update UI
```

### Component Hierarchy

```
<AuthProvider>
  │
  ├─ <Layout>
  │
  └─ <Page>
      │
      ├─ <CourseDetail>  (Client Component)
      │  ├─ useUser() hook
      │  │
      │  ├─ <StarRating> (readonly)
      │  │
      │  └─ <RatingWidget>
      │     ├─ <RatingPrompt>
      │     │  └─ Button "Califica ahora"
      │     │
      │     ├─ <RatingModal>
      │     │  ├─ 5 Star Buttons
      │     │  ├─ Preview Message
      │     │  └─ [Cancel] [Submit]
      │     │
      │     ├─ ratingsApi calls
      │     └─ State management
      │
      └─ <ClassesList>
```

---

## PASOS INMEDIATOS

### Ahora Mismo (Próximos 15 minutos)

```bash
# 1. Ir a carpeta
cd /home/hernan/Platzi/claudeCode/claude-code/Frontend

# 2. Leer plan de inicio
# Leer sección: "8. Guía Paso a Paso para Empezar Ahora"
# en: FRONTEND_IMPLEMENTATION_PLAN.md

# 3. Setup
yarn install
yarn dev  # Terminal 1
yarn test --watch  # Terminal 2

# 4. Crear estructura de archivos (Fase 1)
mkdir -p src/types
mkdir -p src/context/{ __tests__ }
mkdir -p src/hooks/__tests__

# 5. Listo para implementar
```

### Primer Archivo a Crear

```bash
# Crear: /src/types/auth.ts
# Copiar contenido de: FRONTEND_CODE_EXAMPLES.md → "Archivo 1: `/src/types/auth.ts`"
# Guardar y continuar...
```

---

## TESTING STRATEGY

### Test Pyramid

```
         E2E Tests (5-10)
        ╱               ╲
       ╱   Integration   ╲
      ╱     Tests (15-20) ╲
     ╱─────────────────────────╲
    │                           │
    │    Unit Tests (40-50)     │
    │  Components, Hooks, Types │
    │___________________________|
```

### Test Command Reference

```bash
# Todos los tests
yarn test

# Watch mode (para desarrollo)
yarn test --watch

# Específicos por nombre
yarn test AuthContext
yarn test RatingWidget

# Con coverage
yarn test --coverage

# UI interactiva
yarn test --ui
```

### Test Files Location

```
Todos los tests están en __tests__ folder adyacente:

src/types/
src/context/__tests__/AuthContext.test.tsx
src/hooks/__tests__/useUser.test.ts
src/components/RatingWidget/__tests__/
├─ RatingPrompt.test.tsx
├─ RatingModal.test.tsx
└─ RatingWidget.test.tsx
```

---

## DEBUGGING TIPS

### Common Issues

| Problema | Solución |
|----------|----------|
| "useUser debe ser usado dentro de AuthProvider" | Agregar AuthProvider en layout.tsx |
| "Cannot read property 'id' of null" | Verificar que user está autenticado |
| "RatingWidget no aparece" | Verificar que CourseDetail está como 'use client' |
| "Stats no se actualizan" | Verificar que onRatingChange callback se ejecuta |
| "404 Not Found" | Verificar que backend está corriendo en puerto 8000 |

### DevTools Tips

```javascript
// Verificar usuario
localStorage.getItem('platziflix_auth_user')

// Limpiar sesión
localStorage.removeItem('platziflix_auth_user')

// Ver componentes
// F12 → React DevTools tab → Inspect

// Ver requests
// F12 → Network tab → XHR

// Ejecutar tests en console
// Abrir terminal y: yarn test
```

---

## FAQ

### P: ¿Por dónde empiezo?
**R:** Lee la sección "Guía Paso a Paso" en FRONTEND_IMPLEMENTATION_PLAN.md. Comienza por Fase 1 (Autenticación).

### P: ¿Qué necesito saber antes?
**R:** React hooks básicos (useState, useContext, useCallback, useEffect). Todo lo demás está explicado en la documentación.

### P: ¿Puedo saltarme una fase?
**R:** No. Fase 1 es requisito para Fase 2 y 3. Las dependencias están explícitas en el plan.

### P: ¿Qué pasa si un test falla?
**R:** Lee el error, consulta VALIDATION_CHECKLIST.md, y ajusta el código. Todo está documentado.

### P: ¿Cuánto tiempo toma?
**R:** 13-17 horas total. Depende de tu velocidad de lectura y familiaridad con React.

### P: ¿Necesito el backend corriendo?
**R:** SÍ. Backend debe estar en http://localhost:8000. Verifica con: `curl http://localhost:8000/health`

### P: ¿Qué pasa con datos reales?
**R:** La Fase 1 usa mock de usuario (para desarrollo). En producción, se conectará a tu servicio de auth.

### P: ¿Cómo se ve en mobile?
**R:** Responsive design está incluido. Prueba con DevTools: Toggle Device Toolbar (Ctrl+Shift+M).

---

## RECURSOS ÚTILES

### Documentación Externa
- [React Context API](https://react.dev/learn/passing-data-deeply-with-context)
- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Vitest Guide](https://vitest.dev/)
- [Testing Library Best Practices](https://testing-library.com/docs/best-practices)
- [WCAG 2.1 Accessibility](https://www.w3.org/WAI/WCAG21/quickref/)

### Herramientas
- **IDE**: VS Code con extensiones:
  - ES7+ React/Redux/React-Native snippets
  - TypeScript Vue Plugin
  - ESLint
  - Prettier

- **DevTools**:
  - React DevTools (Chrome/Firefox extension)
  - Redux DevTools (si lo usas)
  - axe DevTools (Accesibilidad)

- **Testing**:
  - Vitest (incluido en proyecto)
  - Testing Library (incluido)
  - @testing-library/user-event (incluido)

---

## CONTACT & SUPPORT

Si tienes preguntas:
1. Consulta el FAQ arriba
2. Busca en VALIDATION_CHECKLIST.md el tema
3. Revisa la sección de Debugging Tips
4. Lee los ejemplos en FRONTEND_CODE_EXAMPLES.md

---

## CHECKLIST INICIAL

Antes de empezar, asegúrate de:

- [ ] Node.js 18+ instalado (`node --version`)
- [ ] yarn instalado (`yarn --version`)
- [ ] Backend corriendo (`curl http://localhost:8000/health`)
- [ ] Código fuente disponible
- [ ] Carpeta Frontend accesible
- [ ] Documentación leída (este archivo + PLAN)

---

## RESUMEN

Este proyecto es:
- **Auto-contenido**: Todo está documentado en estos 3 archivos
- **Executable**: Código listo para copiar y usar
- **Tested**: Incluye tests para todo
- **Accessible**: Sigue WCAG 2.1 Level A
- **Production-ready**: Listo para deploy

**Tiempo estimado**: 13-17 horas
**Complejidad**: Intermedia (React + APIs + Testing)
**Prerrequisitos**: React básico + hooks

---

## ROADMAP DESPUÉS

Una vez completado:

1. **Mejorar**: Agregar features opcionales
   - Pagination de ratings
   - Filtros por rating
   - Búsqueda en comentarios

2. **Optimizar**: Performance
   - Lazy loading de ratings
   - Caché de stats

3. **Extender**: Plataforma
   - Similar para otras entidades (teachers, lessons)
   - Integración con sistema de pagos
   - Analytics de ratings

---

**Documentación preparada el 2025-11-28**
**Versión 1.0**
**Platziflix Frontend Rating System**

¡Listo para implementar! 🚀
