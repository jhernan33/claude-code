# Quick Start Guide - 15 Minutos para Empezar

**Guía rápida para comenzar inmediatamente la implementación.**

---

## En 3 Pasos

### Paso 1: Setup (5 min)

```bash
# Ir a carpeta
cd /home/hernan/Platzi/claudeCode/claude-code/Frontend

# Instalar dependencias
yarn install

# Terminal 1: Dev server
yarn dev

# Terminal 2: Tests (nueva terminal)
yarn test --watch
```

**Verificar:**
```bash
# En otra terminal
curl http://localhost:3000
# Esperado: HTML de inicio carga

curl http://localhost:8000/health
# Esperado: {"status": "ok", "database": true, ...}
```

### Paso 2: Leer Plan (5 min)

Abre este archivo primero:
```
/Frontend/docs/FRONTEND_IMPLEMENTATION_PLAN.md

Secciones críticas:
1. "Análisis de Brecha" (2 min)
2. "Fase 1: Autenticación" (3 min)
```

### Paso 3: Crear Primer Archivo (5 min)

```bash
# Crear: /src/types/auth.ts
# Copiar código desde: FRONTEND_CODE_EXAMPLES.md
# Sección: "Archivo 1: `/src/types/auth.ts`"

# Guardar y ejecutar test
yarn test auth
```

---

## Flujo de Trabajo por Fase

### FASE 1: Autenticación (3-4 horas)

```
┌─────────────────────────────┐
│ 1. Leer PLAN (15 min)       │
│    Sección: Fase 1          │
└──────────┬──────────────────┘
           │
┌──────────▼──────────────────┐
│ 2. Copiar CÓDIGO (30 min)   │
│    - Archivos 5 del PLAN    │
│    - Modificar layout.tsx   │
└──────────┬──────────────────┘
           │
┌──────────▼──────────────────┐
│ 3. Tests (30 min)           │
│    - Copiar tests           │
│    - yarn test auth         │
│    - Todo debe pasar        │
└──────────┬──────────────────┘
           │
┌──────────▼──────────────────┐
│ 4. Validar (30 min)         │
│    - VALIDATION_CHECKLIST   │
│    - Pruebas manuales       │
└─────────────────────────────┘
```

**Tiempo total**: 2-2.5 horas

### FASE 2: RatingWidget (8-10 horas)

```
┌─────────────────────────────┐
│ 1. Leer PLAN Fase 2 (20 min)│
└──────────┬──────────────────┘
           │
┌──────────▼──────────────────┐
│ 2. Copiar 4 Archivos (1 h)  │
│    - RatingPrompt.tsx       │
│    - RatingModal.tsx        │
│    - RatingWidget.tsx       │
│    - RatingWidget.module.scss
└──────────┬──────────────────┘
           │
┌──────────▼──────────────────┐
│ 3. Tests (2 h)              │
│    - 3 archivos de tests    │
│    - 19 tests totales       │
└──────────┬──────────────────┘
           │
┌──────────▼──────────────────┐
│ 4. Validar (1-2 h)          │
│    - Navegador testing      │
│    - Edge cases             │
└─────────────────────────────┘
```

**Tiempo total**: 8-10 horas

### FASE 3: Integración (2-3 horas)

```
┌─────────────────────────────┐
│ 1. Modificar 3 archivos     │
│    - CourseDetail.tsx       │
│    - page.tsx               │
│    - .module.scss           │
└──────────┬──────────────────┘
           │
┌──────────▼──────────────────┐
│ 2. Tests integración (1 h)  │
│    - 5 integration tests    │
└──────────┬──────────────────┘
           │
┌──────────▼──────────────────┐
│ 3. Flujo completo (1-2 h)   │
│    - Usuario abre curso     │
│    - Califica              │
│    - Edita y elimina       │
│    - Verifica persistencia │
└─────────────────────────────┘
```

**Tiempo total**: 2-3 horas

---

## Archivos a Crear por Orden

### Fase 1
```
1. src/types/auth.ts
2. src/context/AuthContext.tsx
3. src/hooks/useUser.ts
4. src/context/__tests__/AuthContext.test.tsx
5. src/hooks/__tests__/useUser.test.ts
6. MODIFICAR: src/app/layout.tsx
```

### Fase 2
```
7. src/components/RatingWidget/RatingPrompt.tsx
8. src/components/RatingWidget/RatingModal.tsx
9. src/components/RatingWidget/RatingWidget.tsx
10. src/components/RatingWidget/RatingWidget.module.scss
11. src/components/RatingWidget/__tests__/RatingPrompt.test.tsx
12. src/components/RatingWidget/__tests__/RatingModal.test.tsx
13. src/components/RatingWidget/__tests__/RatingWidget.test.tsx
```

### Fase 3
```
14. MODIFICAR: src/components/CourseDetail/CourseDetail.tsx
15. MODIFICAR: src/components/CourseDetail/CourseDetail.module.scss
16. MODIFICAR: src/app/course/[slug]/page.tsx
17. src/components/CourseDetail/__tests__/CourseDetail.integration.test.tsx
```

---

## Comandos Clave

### Development
```bash
# Dev server
yarn dev

# Tests en watch mode
yarn test --watch

# Tests específicos
yarn test RatingWidget

# Coverage
yarn test --coverage

# Build
yarn build

# Lint
yarn lint
```

### Git
```bash
# Después de cada fase
git add .
git commit -m "Implement Phase N: Description"
git push
```

---

## Validación Rápida

### Después de Fase 1
```bash
# Tests
yarn test auth
# Resultado esperado: ✓ Todos pasan

# Manual
# Browser Console:
localStorage.getItem('platziflix_auth_user')
# Resultado: JSON con user si ejecutó loginAsMock()
```

### Después de Fase 2
```bash
# Tests
yarn test RatingWidget
# Resultado: ✓ 19 tests

# Manual
# Abre: http://localhost:3000
# Click en un curso
# Scroll a sección "Tu opinión"
# Ver: Botón "Califica ahora"
```

### Después de Fase 3
```bash
# Tests
yarn test CourseDetail

# Manual
# http://localhost:3000/course/[slug]
# Ver: RatingWidget integrado
# Flujo completo:
# 1. Click "Califica ahora"
# 2. Seleccionar estrellas
# 3. Click "Confirmar"
# 4. Ver rating en UI
# 5. Recargar página
# 6. Rating persiste
```

---

## Errores Comunes & Soluciones

| Problema | Solución |
|----------|----------|
| "useUser debe ser usado dentro de AuthProvider" | Agregar AuthProvider en layout.tsx (Paso 5 Fase 1) |
| "RatingWidget not found" | Verificar ruta: `src/components/RatingWidget/RatingWidget.tsx` |
| "Curso no carga" | Backend no corriendo: `curl http://localhost:8000/health` |
| "Tests fallan" | Leer error completo, buscar en VALIDATION_CHECKLIST |
| "Estilos no se ven" | Verificar import de .module.scss en componente |

---

## Recursos Rápidos

### Documentación Completa
- **FRONTEND_IMPLEMENTATION_PLAN.md** - 2500+ líneas, todo explicado
- **FRONTEND_CODE_EXAMPLES.md** - 100+ ejemplos listos para copiar
- **VALIDATION_CHECKLIST.md** - Tests y validación

### Ubicación de Código
```
Plan detallado        → docs/FRONTEND_IMPLEMENTATION_PLAN.md
Código para copiar    → docs/FRONTEND_CODE_EXAMPLES.md
Tests esperados       → docs/VALIDATION_CHECKLIST.md
Qué hacer ahora      → docs/QUICK_START.md (este archivo)
```

### Ejemplos por Sección
```
Fase 1 (Auth)         → Líneas 200-600 en CODE_EXAMPLES
Fase 2 (RatingWidget) → Líneas 600-1800 en CODE_EXAMPLES
Fase 3 (Integración)  → Líneas 1800-2300 en CODE_EXAMPLES
```

---

## Checklist Pre-Inicio

Antes de empezar, asegúrate:

- [ ] `cd` a la carpeta Frontend
- [ ] `yarn install` ejecutado
- [ ] `yarn dev` corriendo (Terminal 1)
- [ ] `yarn test --watch` corriendo (Terminal 2)
- [ ] Backend en puerto 8000 activo
- [ ] Documentación leída (este archivo)

**Si TODO está checked: ¡Listo para empezar!**

---

## Próximos Pasos

1. **Ahora**: Lee FRONTEND_IMPLEMENTATION_PLAN.md (Fase 1)
2. **En 15 min**: Crea primer archivo (auth.ts)
3. **En 1 hora**: Fase 1 completa
4. **Mañana**: Fase 2 y 3

---

## Timeline Realista

```
Hora 0:     Setup + lectura
Hora 1-2:   Fase 1 (Auth)
Hora 2-3:   Validar Fase 1
Hora 4-6:   Fase 2 (RatingWidget)
Hora 6-7:   Validar Fase 2
Hora 7-8:   Fase 3 (Integración)
Hora 8-9:   Validar flujo completo

TOTAL: 9 horas (incluye validación)
```

---

**¡Ahora abre FRONTEND_IMPLEMENTATION_PLAN.md y comienza!**

Leer sección: "8. Guía Paso a Paso para Empezar Ahora" (página ~100)
