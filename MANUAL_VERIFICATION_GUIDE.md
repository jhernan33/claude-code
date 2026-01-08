# Guía de Verificación Manual - Sistema de Ratings

**Objetivo:** Verificar que el sistema de ratings interactivo funciona correctamente en el navegador

**Duración:** ~30 minutos
**Requisitos:** Docker, Node.js, navegador moderno
**Dificultad:** Fácil (solo hacer clicks)

---

## ⚡ Quick Start (5 minutos)

### Paso 1: Iniciar Backend
```bash
cd Backend
make start
```
Esperar a que muestre: `INFO:     Uvicorn running on http://0.0.0.0:8000`

### Paso 2: Iniciar Frontend
```bash
cd Frontend
yarn dev
```
Esperar a que muestre: `- ready started server on 0.0.0.0:3000`

### Paso 3: Abrir Navegador
```
http://localhost:3000
```

### Paso 4: Autenticación Mock
En la consola del navegador (F12 → Console):
```javascript
localStorage.setItem('platziflix_auth_user', JSON.stringify({
  version: 1,
  user: {
    id: 1,
    email: 'test@platzi.com',
    name: 'Test User'
  },
  timestamp: Date.now()
}));
location.reload();
```

---

## ✅ Verificación de Funcionalidad (25 minutos)

### 1. Página Home
- [ ] http://localhost:3000 carga correctamente
- [ ] Se muestra grid de cursos
- [ ] Cada curso tiene:
  - [ ] Thumbnail
  - [ ] Título
  - [ ] Descripción
  - [ ] Estrellas (si hay ratings)

### 2. Navegar a Detalle
- [ ] Click en cualquier curso
- [ ] URL cambia a `/course/{slug}`
- [ ] Carga información del curso:
  - [ ] Thumbnail grande
  - [ ] Título y profesor
  - [ ] Descripción
  - [ ] Estrellas en header (stats agregadas)
  - [ ] Duración total
  - [ ] Cantidad de clases
  - [ ] **Sección "Tu opinión"** ← IMPORTANTE

### 3. Sección "Tu Opinión" - Sin Rating
**Aspecto esperado:**
```
┌─────────────────────────────────┐
│ Tu opinión                      │
├─────────────────────────────────┤
│ ¿Te gustó este curso?          │
│ [Califica ahora]               │
└─────────────────────────────────┘
```

✅ **Verificar:**
- [ ] Texto: "¿Te gustó este curso?"
- [ ] Botón: "Califica ahora" (azul)
- [ ] Botón clickeable
- [ ] No hay estrellas visibles (aún)

### 4. Click en "Califica ahora"
**Aspecto esperado:**
```
┌─────────────────────────────────┐
│ ¿Qué te pareció?               │
│ ★ ★ ★ ★ ★                      │ ← 5 estrellas vacías
│                                │
│ [Cancelar] [Confirmar]         │
└─────────────────────────────────┘
```

✅ **Verificar:**
- [ ] Modal se abre
- [ ] Título: "¿Qué te pareció?" (o "Edita tu calificación" si edita)
- [ ] 5 estrellas visibles (no rellenas)
- [ ] Botones: [Cancelar] [Confirmar]
- [ ] Confirmar está deshabilitado (gris)

### 5. Hover sobre Estrellas
**Aspecto esperado:**
```
Pasar mouse sobre:
- Estrella 1: ★ ☆ ☆ ☆ ☆ + "No fue para mí"
- Estrella 2: ★ ★ ☆ ☆ ☆ + "Podría mejorar"
- Estrella 3: ★ ★ ★ ☆ ☆ + "Está bien"
- Estrella 4: ★ ★ ★ ★ ☆ + "¡Muy bueno!"
- Estrella 5: ★ ★ ★ ★ ★ + "¡Excelente!"
```

✅ **Verificar:**
- [ ] Al pasar mouse sobre estrella 1:
  - [ ] Muestra 1 estrella llena
  - [ ] Muestra mensaje: "No fue para mí"
- [ ] Al pasar sobre estrella 4:
  - [ ] Muestra 4 estrellas llenas
  - [ ] Muestra mensaje: "¡Muy bueno!"
- [ ] Al pasar sobre estrella 5:
  - [ ] Muestra 5 estrellas llenas
  - [ ] Muestra mensaje: "¡Excelente!"

### 6. Seleccionar Rating de 4 Estrellas
- [ ] Click en estrella 4
- [ ] 4 estrellas permanecen llenas
- [ ] Botón [Confirmar] se activa (azul)
- [ ] Mensaje sigue mostrando "¡Muy bueno!"

### 7. Click en "Confirmar"
**Aspecto esperado:**
- Modal se cierra
- Botón cambia a "Enviando..."
- Toast aparece: "Gracias por tu calificación" (2 segundos)
- Sección se actualiza a:

```
┌─────────────────────────────────┐
│ Tu opinión                      │
├─────────────────────────────────┤
│ Tu calificación:               │
│ ★★★★☆                          │
│                                │
│ [Editar] [Eliminar]            │
└─────────────────────────────────┘
```

✅ **Verificar:**
- [ ] Modal se cierra
- [ ] Toast "Gracias por tu calificación" aparece
- [ ] Toast desaparece después de 2 segundos
- [ ] Sección muestra rating con botones [Editar] [Eliminar]
- [ ] 4 estrellas visibles

### 8. Verificar Header Stats Actualizadas
- [ ] Subir a la sección de header (stats agregadas)
- [ ] StarRating debe mostrar: ★★★★☆
- [ ] Total_ratings debería aumentar en 1

### 9. Click en "Editar"
**Aspecto esperado:**
```
┌─────────────────────────────────┐
│ Edita tu calificación          │
│ ★★★★☆                          │ ← 4 estrellas preseleccionadas
│                                │
│ [Cancelar] [Confirmar]         │
└─────────────────────────────────┘
```

✅ **Verificar:**
- [ ] Modal abre
- [ ] Título: "Edita tu calificación"
- [ ] 4 estrellas ya están seleccionadas
- [ ] Mensaje: "¡Muy bueno!"

### 10. Cambiar a 5 Estrellas
- [ ] Hover sobre estrella 5
- [ ] Mensaje cambia a "¡Excelente!"
- [ ] Click en estrella 5
- [ ] 5 estrellas permanecen seleccionadas
- [ ] Click [Confirmar]

✅ **Verificar:**
- [ ] Modal se cierra
- [ ] Toast: "Calificación actualizada"
- [ ] StarRating ahora muestra: ★★★★★
- [ ] Botones [Editar] [Eliminar] siguen visibles

### 11. Click en "Eliminar"
**Aspecto esperado:**
```
┌──────────────────────────────────────────┐
│ ¿Estás seguro de que deseas eliminar    │
│ tu calificación?                         │
│                                          │
│ [Cancelar] [Eliminar]                   │
└──────────────────────────────────────────┘
```

✅ **Verificar:**
- [ ] Dialog de confirmación aparece
- [ ] Mensaje: "¿Estás seguro de que deseas eliminar tu calificación?"
- [ ] 2 botones: [Cancelar] [Eliminar]

### 12. Confirmar Eliminación
- [ ] Click [Eliminar]
- [ ] Dialog se cierra
- [ ] Sección vuelve a:

```
┌─────────────────────────────────┐
│ Tu opinión                      │
├─────────────────────────────────┤
│ ¿Te gustó este curso?          │
│ [Califica ahora]               │
└─────────────────────────────────┘
```

✅ **Verificar:**
- [ ] Dialog desaparece
- [ ] Vuelve a prompt original
- [ ] Botón "Califica ahora" visible
- [ ] Header stats actualizadas (total_ratings disminuye)

### 13. Cancelar en Modal (ESC)
- [ ] Click "Califica ahora"
- [ ] Modal se abre
- [ ] **Presionar ESC**

✅ **Verificar:**
- [ ] Modal se cierra
- [ ] Ningún cambio de rating

### 14. Cancelar en Modal (Botón)
- [ ] Click "Califica ahora"
- [ ] Seleccionar 3 estrellas
- [ ] Click [Cancelar]

✅ **Verificar:**
- [ ] Modal se cierra
- [ ] Ningún cambio de rating
- [ ] Sección sigue mostrando prompt

### 15. Keyboard Navigation
- [ ] Click en "Califica ahora"
- [ ] **Presionar TAB** múltiples veces

✅ **Verificar:**
- [ ] Focus se mueve entre estrellas y botones
- [ ] Focus visible (outline)
- [ ] Presionar ENTER en una estrella la selecciona

### 16. Sin Autenticación
```javascript
// En consola del navegador
localStorage.removeItem('platziflix_auth_user');
location.reload();
```

**Aspecto esperado:**
```
┌─────────────────────────────────┐
│ Tu opinión                      │
├─────────────────────────────────┤
│ Inicia sesión para calificar   │
│ este curso                      │
└─────────────────────────────────┘
```

✅ **Verificar:**
- [ ] Mensaje: "Inicia sesión para calificar este curso"
- [ ] Sin botones interactivos
- [ ] Sin estrellas

### 17. Error Handling (Optional)
```bash
# En otra terminal
cd Backend
make stop
```

Luego intentar crear rating:
- [ ] Click "Califica ahora"
- [ ] Seleccionar rating
- [ ] Click [Confirmar]

✅ **Verificar (después de ~10 segundos):**
- [ ] Error banner aparece: "Request timeout" o similar
- [ ] Botón [Reintentar] disponible
- [ ] Sin crash de aplicación
- [ ] Modal se cierra (o mantiene abierto para reintentar)

Reiniciar backend:
```bash
make start
```
- [ ] Click [Reintentar] funciona
- [ ] Rating se crea exitosamente

### 18. DevTools Network (Optional)
Abrir DevTools → Network tab

Crear rating:
- [ ] **POST /courses/{id}/ratings**
  - [ ] Status: 201 Created
  - [ ] Body: `{ "user_id": 1, "rating": 4 }`
  - [ ] Response: `{ "id": ..., "course_id": ..., "user_id": 1, "rating": 4, ... }`

- [ ] **GET /courses/{id}/ratings/stats**
  - [ ] Status: 200 OK
  - [ ] Response: `{ "average_rating": 4.0, "total_ratings": 1 }`

Editar rating:
- [ ] **PUT /courses/{id}/ratings/1**
  - [ ] Status: 200 OK
  - [ ] Body: `{ "user_id": 1, "rating": 5 }`

Eliminar rating:
- [ ] **DELETE /courses/{id}/ratings/1**
  - [ ] Status: 204 No Content
  - [ ] (no body)

---

## 📝 Checklist Final

```
Funcionalidad Básica:
- [ ] Página home carga
- [ ] Navegar a detalle funciona
- [ ] Sección "Tu opinión" visible

Rating Flow:
- [ ] Crear rating (POST)
- [ ] Editar rating (PUT)
- [ ] Eliminar rating (DELETE)
- [ ] Stats actualizadas en header

Interactividad:
- [ ] Hover messages cambian
- [ ] Buttons habilitados/deshabilitados correctamente
- [ ] Toast notifications aparecen
- [ ] Transiciones suaves

Error Handling:
- [ ] Sin auth muestra mensaje correcto
- [ ] Timeout muestra error
- [ ] Botón reintentar funciona

Keyboard:
- [ ] ESC cierra modal
- [ ] ENTER confirma
- [ ] TAB navega

API Calls:
- [ ] POST 201 Created
- [ ] PUT 200 OK
- [ ] DELETE 204 No Content
- [ ] GET stats retorna correcto

Accesibilidad:
- [ ] Focus visible
- [ ] ARIA labels leídas por screen readers
- [ ] Semantic HTML
```

---

## 🎉 Éxito!

Si todos los checks pasaron ✅, el sistema funciona perfectamente.

**Reporte:** Documentar cualquier issue encontrado en `RATING_SYSTEM_VERIFICATION.md` sección "Problemas Encontrados".

---

## 🆘 Troubleshooting

### Backend no inicia
```bash
cd Backend
make stop
make start
```

### Frontend no compila
```bash
cd Frontend
rm -rf .next node_modules
yarn install
yarn dev
```

### API 500 Error
Revisar logs del backend:
```bash
cd Backend
make logs
```

### CORS Error
Verificar que API_URL es `http://localhost:8000`

### Modal no abre
Limpiar cache:
```javascript
localStorage.clear()
location.reload()
```

---

**Tiempo estimado:** 30 minutos
**Dificultad:** Fácil (solo clicks)
**Resultado esperado:** ✅ Todo funciona correctamente

*Generado por Claude Code - 2025-12-11*
