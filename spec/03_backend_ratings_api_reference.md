# Backend Ratings API - Quick Reference

## 📡 API Endpoints Summary

```
BASE_URL: http://localhost:8000

POST   /courses/{course_id}/ratings           → Crear/Actualizar rating
GET    /courses/{course_id}/ratings           → Obtener todos los ratings
GET    /courses/{course_id}/ratings/stats     → Obtener estadísticas
GET    /courses/{course_id}/ratings/user/{user_id}  → Obtener rating del usuario
PUT    /courses/{course_id}/ratings/{user_id}      → Actualizar rating
DELETE /courses/{course_id}/ratings/{user_id}      → Eliminar rating
```

---

## 📋 Backend Models & Architecture

### Database Schema (course_ratings table)

| Column | Type | Constraint | Purpose |
|--------|------|-----------|---------|
| `id` | INTEGER | PRIMARY KEY | Identificador único |
| `created_at` | TIMESTAMP | NOT NULL | Fecha de creación |
| `updated_at` | TIMESTAMP | NOT NULL | Fecha de actualización |
| `deleted_at` | TIMESTAMP | NULL | Soft delete flag |
| `course_id` | INTEGER | FK → courses.id | Curso siendo calificado |
| `user_id` | INTEGER | NOT NULL | Usuario que califica |
| `rating` | INTEGER | CHECK (1-5) | Valor del rating (1-5) |

### Key Indexes
```sql
ix_course_ratings_id         -- Para búsquedas por ID
ix_course_ratings_course_id  -- Para queries por curso (MÁS USADO)
ix_course_ratings_user_id    -- Para queries por usuario
uq_course_ratings_user_course_deleted  -- UNIQUE (course_id, user_id, deleted_at)
```

---

## 🎯 CourseService Methods

### Query Methods

#### `get_all_courses() → List[Dict]`
Returns all courses with rating stats included in each course object.

#### `get_course_by_slug(slug: str) → Optional[Dict]`
Returns single course with complete rating info including distribution.

#### `get_course_ratings(course_id: int) → List[Dict]`
Returns array of all rating objects for a course.

#### `get_user_course_rating(course_id: int, user_id: int) → Optional[Dict]`
Returns single rating object or None if not found.

#### `get_course_rating_stats(course_id: int) → Dict`
Returns aggregated stats (average, total, distribution).

### Mutation Methods

#### `add_course_rating(course_id, user_id, rating) → Dict`
Create new or update existing rating (upsert behavior).

#### `update_course_rating(course_id, user_id, rating) → Dict`
Update only if exists, else raises ValueError.

#### `delete_course_rating(course_id, user_id) → bool`
Soft delete rating (sets deleted_at timestamp).

---

## 🔄 Request/Response Formats

### POST /courses/{id}/ratings

**Request:**
```json
{
  "user_id": 42,
  "rating": 5
}
```

**Response (201):**
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

### GET /courses/{id}/ratings/stats

**Response (200):**
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

### GET /courses/{id}/ratings/user/{user_id}

**If exists (200):**
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

**If not exists (204):** No content body

---

## ⚡ Key Behaviors

### Upsert Pattern (POST /ratings)
- If user already has a rating on this course → **UPDATE** that rating
- If new user → **CREATE** new rating record
- Returns rating object either way with status 200 or 201

### Soft Delete Pattern
- DELETE sets `deleted_at` timestamp but preserves data
- User can rate again after deleting previous rating
- UNIQUE constraint allows multiple soft-deleted records per user-course pair

### Aggregation Queries
- All stats queries filter by `deleted_at IS NULL`
- Stats are calculated at SQL level for performance
- Average is rounded to 2 decimals
- Distribution shows count for each 1-5 rating level

### Validation Layers
1. **Pydantic**: Validates user_id > 0, rating 1-5
2. **Database**: CHECK constraint enforces rating range
3. **Service**: Business logic validation

---

## 🚨 Error Codes

| HTTP | Scenario | Message |
|------|----------|---------|
| 200 | GET/PUT success | `{ rating object or stats }` |
| 201 | POST creates new | `{ rating object }` |
| 204 | GET user rating not found | No body |
| 400 | Rating out of range | "Rating must be between 1 and 5" |
| 400 | User ID mismatch | "user_id in body must match path" |
| 404 | Course not found | "Course with id X not found" |
| 404 | Rating not found (PUT/DELETE) | "No active rating found..." |
| 422 | Pydantic validation | Validation details |

---

## 🔧 Service Layer File Structure

```
Backend/app/
├── models/
│   ├── base.py              ← BaseModel (inherited by all)
│   ├── course.py            ← Course + ratings relationship
│   ├── course_rating.py     ← CourseRating ORM model
│   └── ...
├── schemas/
│   └── rating.py            ← RatingRequest, RatingResponse, RatingStats
├── services/
│   └── course_service.py    ← CourseService (8 rating methods)
├── main.py                  ← FastAPI app + 6 rating endpoints
├── alembic/
│   └── versions/
│       └── 0e3a8766f785_add_course_ratings_table.py
└── tests/
    ├── test_rating_endpoints.py
    ├── test_course_rating_service.py
    └── test_rating_db_constraints.py
```

---

## 📊 Course Model Extension

When Backend returns a Course object (in GET /courses or GET /courses/{slug}), it now includes:

```typescript
{
  // Existing fields
  id: number,
  name: string,
  description: string,
  thumbnail: string,
  slug: string,

  // NEW RATING FIELDS
  average_rating: number,      // 0.0-5.0
  total_ratings: number,       // >= 0
  rating_distribution: {       // Only in /courses/{slug}
    1: number,
    2: number,
    3: number,
    4: number,
    5: number
  }
}
```

---

## ✅ Tests Status

```
Backend Tests: 49 PASSED ✅

✓ app/test_main.py                      10 tests
✓ app/tests/test_course_rating_service.py   17 tests
✓ app/tests/test_rating_db_constraints.py   5 tests (1 skipped)
✓ app/tests/test_rating_endpoints.py        18 tests
```

All critical functionality is tested and passing.

---

## 🚀 Running Tests

```bash
cd Backend

# All tests
make test

# With coverage report
make test-coverage

# Watch mode (re-runs on file change)
make test-watch

# Specific test file
make test -- app/tests/test_rating_endpoints.py
```

---

## 📚 API Documentation

Live Swagger/OpenAPI docs available at:
```
http://localhost:8000/docs
```

This shows:
- All endpoints with descriptions
- Request/response schemas
- Example payloads
- Try-it-out functionality

---

## 🎯 Integration Checklist for Frontend

- [ ] Backend running (`make start`)
- [ ] Test endpoints with curl or Postman
- [ ] Read `/docs` endpoint
- [ ] Update NEXT_PUBLIC_API_URL env var
- [ ] Implement StarRating interactive component
- [ ] Create UserRatingSection component
- [ ] Add to CourseDetail page
- [ ] Test all rating operations
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Test with real user_id

---

## 💡 Key Points for Frontend Dev

1. **204 Response**: GET /ratings/user/{uid} returns 204 if user hasn't rated
2. **Upsert**: POST always creates or updates (no need to check first)
3. **Stats**: Use /ratings/stats for performance, not calculating from rating list
4. **Headers**: Always send `Content-Type: application/json`
5. **Auth**: Currently no auth required, but user_id param is mandatory
6. **Timestamps**: ISO 8601 format in responses

---

**Last Updated:** 2025-10-14
**Status:** Ready for Integration
**Backend Status:** ✅ Complete & Tested
