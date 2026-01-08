# Validation Checklist - Frontend Rating System

Documento para verificación progresiva de la implementación.

---

## FASE 1: AUTENTICACIÓN - VALIDACIÓN

### Setup Inicial
```bash
cd /home/hernan/Platzi/claudeCode/claude-code/Frontend
yarn install
yarn dev  # Terminal 1
yarn test --watch  # Terminal 2
```

### Archivos Creados - Verificación

- [ ] `/src/types/auth.ts` existe
  ```bash
  test -f src/types/auth.ts && echo "OK" || echo "FAIL"
  ```
  - [ ] Contiene interface `User`
  - [ ] Contiene interface `AuthContextType`
  - [ ] Contiene interface `LoginCredentials`

- [ ] `/src/context/AuthContext.tsx` existe
  ```bash
  test -f src/context/AuthContext.tsx && echo "OK" || echo "FAIL"
  ```
  - [ ] Exporta `AuthContext`
  - [ ] Exporta `AuthProvider` component
  - [ ] Implementa `createContext`
  - [ ] Usa `localStorage` con key `'platziflix_auth_user'`

- [ ] `/src/hooks/useUser.ts` existe
  ```bash
  test -f src/hooks/useUser.ts && echo "OK" || echo "FAIL"
  ```
  - [ ] Exporta `useUser` hook
  - [ ] Lanza error si se usa fuera de Provider
  - [ ] Retorna `AuthContextType`

- [ ] `/src/app/layout.tsx` modificado
  - [ ] Contiene import de `AuthProvider`
  - [ ] `<AuthProvider>` envuelve `{children}`

### Tests - Validación

```bash
# Ejecutar tests de autenticación
yarn test auth

# Verificar que todos pasan
# Esperado: 8+ tests pasando
```

- [ ] Tests para `AuthContext`
  - [ ] Initialization test
  - [ ] Login test
  - [ ] Logout test
  - [ ] Session persistence test
  - [ ] Version validation test

- [ ] Tests para `useUser hook`
  - [ ] Error without Provider
  - [ ] Return context test
  - [ ] Authenticated user test
  - [ ] Logout test
  - [ ] User data test

### Funcionalidad - Validación Manual

1. **Abrir Developer Tools** (F12)

2. **Prueba 1: Inicialización**
   - [ ] Recargar página
   - [ ] En Console: `localStorage.getItem('platziflix_auth_user')`
   - [ ] Resultado: `null` (sin usuario)

3. **Prueba 2: LoginAsMock**
   ```javascript
   // En Console:
   const { useUser } = await import('/src/hooks/useUser.ts');
   // Buscar un componente que use useUser y verificar:
   // user = null
   ```

4. **Prueba 3: Persistencia**
   - [ ] Ejecutar login
   - [ ] En Console: `localStorage.getItem('platziflix_auth_user')`
   - [ ] Resultado: JSON con user data
   - [ ] Recargar página
   - [ ] Usuario debe persistir

5. **Prueba 4: Logout**
   - [ ] Ejecutar logout
   - [ ] En Console: `localStorage.getItem('platziflix_auth_user')`
   - [ ] Resultado: `null`

### Code Review - Validación

```typescript
// ✅ Debe tener:
- export const AuthProvider
- const STORAGE_KEY = 'platziflix_auth_user'
- useCallback for login/logout
- localStorage.getItem/setItem
- JSON.parse/stringify with error handling

// ❌ No debe tener:
- Duplicación de lógica
- console.error sin try-catch
- Magic numbers en IDs
- Hardcoded URLs
```

### Coverage Esperado

```bash
yarn test --coverage auth

# Esperado:
# Statements   : > 85%
# Branches     : > 80%
# Functions    : > 85%
# Lines        : > 85%
```

---

## FASE 2: RATINGWIDGET - VALIDACIÓN

### Setup Pre-Requisitos

```bash
# Verificar que Fase 1 está 100% completado
yarn test auth
# Esperado: ✅ Todos pasan

# Verificar que Backend está corriendo
curl http://localhost:8000/health
# Esperado: {"status": "ok", "database": true, ...}
```

### Archivos Creados - Verificación

- [ ] `/src/components/RatingWidget/RatingPrompt.tsx`
  ```bash
  test -f src/components/RatingWidget/RatingPrompt.tsx && echo "OK" || echo "FAIL"
  ```
  - [ ] Exporta component `RatingPrompt`
  - [ ] Acepta props: `onRate`, `isLoading`
  - [ ] Renderiza botón con texto "Califica ahora"

- [ ] `/src/components/RatingWidget/RatingModal.tsx`
  - [ ] Exporta component `RatingModal`
  - [ ] Acepta props: `isOpen`, `onClose`, `onSubmit`, `initialRating`, etc
  - [ ] Renderiza 5 botones de estrellas
  - [ ] Muestra preview message
  - [ ] Botones Cancelar y Confirmar

- [ ] `/src/components/RatingWidget/RatingWidget.tsx`
  - [ ] Exporta component `RatingWidget` principal
  - [ ] Acepta props: `courseId`, `onRatingChange`
  - [ ] Acepta estados: idle, loading, modal-open, etc
  - [ ] Importa y usa: `useUser`, `ratingsApi`, componentes sub

- [ ] `/src/components/RatingWidget/RatingWidget.module.scss`
  - [ ] Define clases: `.ratingWidget`, `.prompt`, `.modal`, etc
  - [ ] Incluye variables CSS: colores, gradientes
  - [ ] Incluye animaciones: fadeIn, slideUp, etc
  - [ ] Responsive en media queries

- [ ] Tests creados
  - [ ] `__tests__/RatingPrompt.test.tsx`
  - [ ] `__tests__/RatingModal.test.tsx`
  - [ ] `__tests__/RatingWidget.test.tsx`

### Compilación - Validación

```bash
yarn build

# Esperado:
# ✓ Compilación sin errores
# ✓ Sin warnings de TypeScript
# ✓ Bundle size aceptable
```

### Tests - Validación

```bash
yarn test RatingWidget

# Esperado:
# ✓ 15+ tests pasando
# ✓ Prompt tests: 3
# ✓ Modal tests: 4
# ✓ Widget tests: 8+
```

- [ ] RatingPrompt Tests
  - [ ] Renderiza botón
  - [ ] Disabled durante loading
  - [ ] Llama callback al click

- [ ] RatingModal Tests
  - [ ] Se abre cuando isOpen=true
  - [ ] Se cierra cuando isOpen=false
  - [ ] Selección de estrellas funciona
  - [ ] Preview message actualiza
  - [ ] Llamar onSubmit con rating correcto
  - [ ] Cancelar sin cambios
  - [ ] Disabled submit si no hay selección

- [ ] RatingWidget Tests
  - [ ] Mostrar prompt sin rating
  - [ ] Mostrar current rating con rating
  - [ ] Abrir modal
  - [ ] Create rating API call
  - [ ] Update rating API call
  - [ ] Delete rating API call
  - [ ] Error handling y retry
  - [ ] Guest message sin usuario

### Funcionalidad Visual - Validación Manual

1. **En Navegador** http://localhost:3000

2. **Test: Componente aislado** (si tienes Storybook)
   ```bash
   yarn storybook  # Si está configurado
   # Navegar a RatingWidget stories
   ```

3. **Test: RatingPrompt**
   - [ ] Buscar componente en página
   - [ ] Botón visible y clickeable
   - [ ] Texto: "¿Te gustó este curso?"
   - [ ] Botón texto: "Califica ahora"
   - [ ] Botón disabled durante operación

4. **Test: RatingModal** (después de click)
   - [ ] Modal visible y centrado
   - [ ] Título: "¿Qué te pareció?" o "Edita tu calificación"
   - [ ] 5 estrellas clickeables
   - [ ] Hover en estrella cambia color
   - [ ] Click en estrella la marca como seleccionada
   - [ ] Preview message actualiza según selección
   - [ ] Botones: Cancelar y Confirmar
   - [ ] Botón Confirmar disabled si no hay selección

5. **Test: Estados**
   - [ ] Loading state: spinner o "Cargando..."
   - [ ] Error state: mensaje rojo con botón Reintentar
   - [ ] Success state: mensaje verde (temporal)
   - [ ] Transiciones suaves entre estados

### Accesibilidad - Validación

```bash
# Usando axe DevTools (extensión Chrome)
1. Instalar: https://chrome.google.com/webstore
2. Abrir RatingWidget en página
3. Ejecutar Axe scan
4. Resultado esperado: 0 errores accesibilidad
```

- [ ] ARIA Labels
  - [ ] Botones tienen aria-label descriptivo
  - [ ] Modal tiene role="dialog" y aria-modal="true"
  - [ ] Modal tiene aria-labelledby
  - [ ] Errores tienen role="alert"
  - [ ] Loading tiene aria-busy

- [ ] Keyboard Navigation
  - [ ] Tab navega por botones
  - [ ] Enter activa botones
  - [ ] Escape cierra modal
  - [ ] Focus visible en todos los elementos

- [ ] Screen Reader (NVDA/JAWS/VoiceOver)
  - [ ] Lee correctamente el contenido
  - [ ] Comunica estados
  - [ ] Announces cambios dinámicos

### Performance - Validación

```bash
# Lighthouse
1. DevTools → Lighthouse
2. Audit: Performance, Accessibility
3. Esperado: > 90 Performance, > 90 Accessibility
```

- [ ] No hay re-renders innecesarios
- [ ] useCallback está bien utilizado
- [ ] No hay memory leaks (refs limpios)
- [ ] Bundle size aceptable

### Code Quality - Validación

```bash
yarn lint

# Esperado: 0 errores eslint
```

---

## FASE 3: INTEGRACIÓN - VALIDACIÓN

### Pre-Requisitos

```bash
# Fase 1 OK
yarn test auth
# ✓ Todos pasan

# Fase 2 OK
yarn test RatingWidget
# ✓ Todos pasan

# Backend corriendo
curl http://localhost:8000/health
# ✓ {"status": "ok"}
```

### Archivos Modificados - Verificación

- [ ] `/src/components/CourseDetail/CourseDetail.tsx`
  - [ ] Primera línea: `'use client'`
  - [ ] Import: `import { RatingWidget }`
  - [ ] Import: `import { ratingsApi }`
  - [ ] Estado: `const [stats, setStats]`
  - [ ] Callback: `const handleRatingChange = useCallback(...)`
  - [ ] JSX: `<RatingWidget courseId={course.id} onRatingChange={handleRatingChange} />`

- [ ] `/src/app/course/[slug]/page.tsx`
  - [ ] Función: `async function getCourseStats(courseId)`
  - [ ] Fetch: `http://localhost:8000/courses/${courseId}/ratings/stats`
  - [ ] Pasar: `initialStats={stats}` a CourseDetail

- [ ] `/src/components/CourseDetail/CourseDetail.module.scss`
  - [ ] Clase: `.ratingSection`
  - [ ] Clase: `.sectionTitle` (para ambas secciones)
  - [ ] Estilos responsive

### Compilación - Validación

```bash
yarn build

# Esperado:
# ✓ Sin errores
# ✓ Sin warnings
# ✓ CourseDetail se compila correctamente
```

### Tests - Validación

```bash
yarn test CourseDetail

# Esperado:
# ✓ Integration tests pasando
# ✓ Test: Mostrar RatingWidget
# ✓ Test: Al calificar actualizar stats
# ✓ Test: Flujo completo
```

### Flujo Completo - Validación Manual

#### Setup
```bash
# Terminal 1: Dev server
yarn dev

# Terminal 2: Tests (opcional)
yarn test --watch

# Terminal 3: Backend health
curl http://localhost:8000/health
```

#### Pasos de Validación

1. **Abrir http://localhost:3000**
   - [ ] Página de cursos carga
   - [ ] Ver grid de cursos

2. **Click en un curso**
   - [ ] Navegar a `/course/[slug]`
   - [ ] Cargar detalles del curso
   - [ ] Mostrar:
     - [ ] Thumbnail
     - [ ] Título
     - [ ] Descripción
     - [ ] Profesor
     - [ ] Rating promedio (readonly)
     - [ ] Número de clases

3. **Ver sección "Tu opinión"**
   - [ ] Sección visible
   - [ ] Mostrar RatingWidget
   - [ ] Mostrar prompt: "¿Te gustó este curso?"

4. **SIN USUARIO AUTENTICADO**
   - [ ] Click en "Califica ahora"
   - [ ] Mostrar: "Inicia sesión para calificar este curso"
   - [ ] No abrir modal

5. **AUTENTICAR USUARIO** (usar mock)
   ```javascript
   // Console en DevTools
   localStorage.setItem('platziflix_auth_user', JSON.stringify({
     version: 1,
     user: { id: 123, email: 'test@example.com', name: 'Test User' },
     timestamp: Date.now()
   }));
   // Recargar página
   ```

6. **CON USUARIO AUTENTICADO**
   - [ ] RatingWidget carga
   - [ ] Mostrar prompt: "¿Te gustó este curso?"
   - [ ] Botón "Califica ahora" activo

7. **CALIFICAR CURSO (CREATE)**
   - [ ] Click "Califica ahora"
   - [ ] Modal abre
   - [ ] Título: "¿Qué te pareció?"
   - [ ] Click en 5 estrellas
   - [ ] Preview dice: "¡Excelente!"
   - [ ] Click "Confirmar"
   - [ ] Modal cierra
   - [ ] Mostrar "Tu calificación:" con 5 estrellas
   - [ ] Botones: "Editar" y "Eliminar"

8. **VERIFICAR EN API**
   ```bash
   # En otra terminal
   curl "http://localhost:8000/courses/1/ratings/stats"

   # Esperado:
   # {"average_rating": 5.0, "total_ratings": 1}
   ```

9. **VERIFICAR STATS ACTUALIZADAS**
   - [ ] En CourseDetail, sección header
   - [ ] StarRating (readonly) muestra 5 estrellas
   - [ ] Contador: "(1)" ratings

10. **EDITAR RATING**
    - [ ] Click en botón "Editar"
    - [ ] Modal abre con 5 estrellas pre-seleccionadas
    - [ ] Título: "Edita tu calificación"
    - [ ] Click en 3 estrellas
    - [ ] Preview dice: "Está bien"
    - [ ] Click "Confirmar"
    - [ ] Modal cierra
    - [ ] Mostrar "Tu calificación:" con 3 estrellas
    - [ ] Stats actualizados (3.0)

11. **ELIMINAR RATING**
    - [ ] Click en "Eliminar"
    - [ ] Mostrar confirmación: "¿Estás seguro...?"
    - [ ] Click "Eliminar" en confirmación
    - [ ] Desaparecer rating
    - [ ] Volver a mostrar prompt "¿Te gustó este curso?"
    - [ ] Stats en cero

12. **RECARGAR PÁGINA**
    - [ ] Navegación (con URL)
    - [ ] RatingWidget vuelve a cargar el rating
    - [ ] Mostrar el rating más reciente (o prompt si no hay)

### Base de Datos - Verificación

```sql
-- Conectar a PostgreSQL
psql -U platziflix_user -d platziflix_db

-- Verificar tabla
SELECT * FROM course_ratings;

-- Esperado: Filas con los ratings creados
-- course_id, user_id, rating, created_at, updated_at, deleted_at
```

### Edge Cases - Validación

1. **Sin Usuario Autenticado**
   - [ ] Mostrar guest message
   - [ ] Botón disabled

2. **Error de Red**
   - [ ] Mostrar error banner
   - [ ] Botón "Reintentar"
   - [ ] Click reintentar intenta de nuevo

3. **Timeout**
   - [ ] Mostrar timeout error
   - [ ] Permitir reintentar

4. **Múltiples Usuarios**
   - [ ] Login como User 123
   - [ ] Calificar curso
   - [ ] Logout
   - [ ] Login como User 456
   - [ ] Mostrar prompt (sin rating de User 456)
   - [ ] Calificar diferente
   - [ ] Verificar que cada usuario ve su rating

5. **Actualización Concurrente**
   - [ ] Abrir 2 tabs con mismo curso
   - [ ] En tab 1, calificar
   - [ ] En tab 2, recargar
   - [ ] Debe mostrar el nuevo rating

### Performance - Validación

```bash
# DevTools → Performance tab
# Grabar session mientras:
# 1. Abrir curso
# 2. Calificar
# 3. Editar
# 4. Eliminar

# Esperado:
# ✓ Animaciones suaves (60 FPS)
# ✓ No hay jank
# ✓ Time to Interactive < 3s
```

### Cross-Browser - Validación

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

**Para cada navegador:**
- [ ] Todos los flujos funcionan
- [ ] Estilos correctos
- [ ] Animaciones suaves
- [ ] Accesibilidad OK

### Mobile - Validación

```bash
# DevTools → Toggle Device Toolbar
# Seleccionar iPhone 12 / Pixel 5
```

- [ ] Responsive design OK
- [ ] Touch targets > 44px
- [ ] Botones funcionan con touch
- [ ] Modal se ajusta al ancho
- [ ] Sin horizontal scroll
- [ ] Textos legibles (no zoom requerido)

### Final Checklist

```
FASE 1: AUTENTICACIÓN ✓
├─ Types créados ✓
├─ AuthContext implementado ✓
├─ useUser hook implementado ✓
├─ Layout modificado ✓
├─ Tests pasando ✓
└─ Persistencia funciona ✓

FASE 2: RATINGWIDGET ✓
├─ RatingPrompt componente ✓
├─ RatingModal componente ✓
├─ RatingWidget principal ✓
├─ Estilos SCSS ✓
├─ CREATE rating funciona ✓
├─ UPDATE rating funciona ✓
├─ DELETE rating funciona ✓
├─ Error handling OK ✓
├─ Tests pasando ✓
└─ Accesibilidad OK ✓

FASE 3: INTEGRACIÓN ✓
├─ CourseDetail modificado ✓
├─ Page.tsx modificado ✓
├─ Stats server-side OK ✓
├─ RatingWidget en CourseDetail ✓
├─ Callback onRatingChange funciona ✓
├─ Flujo completo OK ✓
├─ Tests integración OK ✓
├─ Database OK ✓
├─ Mobile responsive ✓
└─ Cross-browser OK ✓

GENERAL ✓
├─ 100+ tests pasando ✓
├─ Coverage > 80% ✓
├─ Build sin errores ✓
├─ Lint sin errores ✓
├─ Lighthouse > 90 ✓
├─ WCAG 2.1 Level A ✓
└─ Documentación completa ✓
```

---

## TESTING SUMMARY

### Conteo de Tests Esperados

```
Phase 1 (Auth):
├─ AuthContext tests: 6
├─ useUser hook tests: 5
└─ Total: 11 tests

Phase 2 (RatingWidget):
├─ RatingPrompt tests: 3
├─ RatingModal tests: 6
├─ RatingWidget tests: 10
└─ Total: 19 tests

Phase 3 (Integration):
├─ CourseDetail integration: 5
└─ Total: 5 tests

GRAND TOTAL: 35+ tests
```

### Coverage Target

```
┌─────────────────┬─────────────┐
│ Category        │ Target      │
├─────────────────┼─────────────┤
│ Statements      │ > 85%       │
│ Branches        │ > 80%       │
│ Functions       │ > 85%       │
│ Lines           │ > 85%       │
└─────────────────┴─────────────┘
```

### Ejecutar Coverage

```bash
yarn test --coverage

# Generar HTML report
yarn test --coverage --reporters=html

# Abrir
open coverage/index.html
```

---

## DEPLOYMENT CHECKLIST

Antes de hacer deploy a staging/production:

- [ ] Todos los tests pasan
  ```bash
  yarn test
  ```

- [ ] Build sin errores
  ```bash
  yarn build
  ```

- [ ] Lint sin errores
  ```bash
  yarn lint
  ```

- [ ] No hay console.log en código (solo errors)

- [ ] No hay hardcoded IDs o URLs

- [ ] Variables de entorno configuradas
  ```bash
  NEXT_PUBLIC_API_URL=http://localhost:8000  # dev
  NEXT_PUBLIC_API_URL=https://api.prod.com   # prod
  ```

- [ ] Documentación actualizada

- [ ] Cambios en changelog

- [ ] Code review completado

- [ ] Performance acceptable (Lighthouse)

---

## RECURSOS PARA DEBUGGING

### Logs Útiles

```javascript
// console.log en RatingWidget
console.log('State:', state);
console.log('User:', user);
console.log('User Rating:', data.userRating);

// En tests
screen.debug();  // Ver HTML actual
screen.logTestingPlaygroundURL();  // Debugging helper
```

### DevTools Tips

```javascript
// Ver localStorage
localStorage.getItem('platziflix_auth_user')

// Limpiar
localStorage.removeItem('platziflix_auth_user')

// Ver requests
// Network tab → XHR → /ratings

// Ver componentes React
// React DevTools → Inspect
```

### Errores Comunes

| Error | Solución |
|-------|----------|
| "useUser debe ser usado dentro de AuthProvider" | Verificar que layout.tsx tiene AuthProvider |
| "courseId is not defined" | Pasar courseId prop a RatingWidget |
| "Cannot read property 'id' of null" | Verificar que user está autenticado |
| "404 No Content" | Normal - usuario no ha calificado aún |
| "CORS error" | Verificar backend CORS headers |
| "Timeout" | Aumentar timeout en ratingsApi |

---

**Documento de validación completado.**
**¡Listo para implementación!**
