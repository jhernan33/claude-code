# OpenAPI/Swagger Context - Ratings API

**Source:** `http://localhost:8000/openapi.json`
**Generated:** 2025-10-14
**OpenAPI Version:** 3.1.0

---

## 📋 API Metadata

```json
{
  "title": "Platziflix",
  "description": "Platziflix API - Platform for online courses",
  "version": "0.1.0"
}
```

### Features Listed in Documentation
- **Courses**: Browse and search courses
- **Ratings**: Rate courses and view statistics
- **Teachers**: Course instructors information
- **Lessons**: Course content structure

### Rating System Description
Users can rate courses from 1 (worst) to 5 (best).
- One rating per user per course
- Ratings can be updated or deleted
- Aggregated statistics available per course

---

## 🚀 Endpoints Complete Reference

### 1. GET / (Root)
**Summary:** Root endpoint

**Description:** None

**Response:**
```json
{
  "type": "object",
  "additionalProperties": { "type": "string" }
}
```

---

### 2. GET /health
**Tags:** `health`

**Summary:** Health

**Description:** Health check endpoint that verifies:
- Service status
- Database connectivity

**Operation ID:** `health_health_get`

**Response (200):**
```json
{
  "type": "object",
  "additionalProperties": {
    "anyOf": [
      { "type": "string" },
      { "type": "boolean" },
      { "type": "integer" }
    ]
  }
}
```

---

### 3. GET /courses
**Tags:** `courses`

**Summary:** Get Courses

**Description:** Get all courses.
Returns a list of courses with basic information: id, name, description, thumbnail, slug

**Operation ID:** `get_courses_courses_get`

**Response (200):**
```json
{
  "type": "array",
  "items": {}
}
```

---

### 4. GET /courses/{slug}
**Tags:** `courses`

**Summary:** Get Course By Slug

**Description:** Get course details by slug.
Returns course information including teachers and classes.

**Operation ID:** `get_course_by_slug_courses__slug__get`

**Parameters:**
```json
{
  "name": "slug",
  "in": "path",
  "required": true,
  "schema": { "type": "string" }
}
```

**Responses:**
- `200`: Course object (additionalProperties: true)
- `422`: Validation Error

---

### 5. GET /classes/{class_id}
**Tags:** `courses`

**Summary:** Get Class By Id

**Description:** Get lesson/class details by ID.
Returns lesson information including video URL.

**Operation ID:** `get_class_by_id_classes__class_id__get`

**Parameters:**
```json
{
  "name": "class_id",
  "in": "path",
  "required": true,
  "schema": { "type": "integer" }
}
```

**Responses:**
- `200`: Class object (additionalProperties: true)
- `422`: Validation Error

---

## ⭐ RATING ENDPOINTS (COMPLETE)

### 6. POST /courses/{course_id}/ratings
**Tags:** `ratings`

**Summary:** Add Course Rating

**Description:** Add a new rating to a course or update existing rating.

**Business Logic:**
- If user already has an active rating: **UPDATE** existing
- If user has no active rating: **CREATE** new rating
- Returns HTTP 201 for new ratings

**Operation ID:** `add_course_rating_courses__course_id__ratings_post`

**Parameters:**
```json
{
  "name": "course_id",
  "in": "path",
  "required": true,
  "schema": { "type": "integer" }
}
```

**Request Body:**
```json
{
  "required": true,
  "content": {
    "application/json": {
      "schema": { "$ref": "#/components/schemas/RatingRequest" }
    }
  }
}
```

**Responses:**
- `201`: Rating created successfully → `RatingResponse`
- `400`: Validation error → `ErrorResponse`
- `404`: Course not found → `ErrorResponse`
- `422`: Validation Error → `HTTPValidationError`

**Example:**
```bash
POST /courses/1/ratings
Content-Type: application/json

{
  "user_id": 42,
  "rating": 5
}
```

---

### 7. GET /courses/{course_id}/ratings
**Tags:** `ratings`

**Summary:** Get Course Ratings

**Description:** Get all active ratings for a course.

Returns list of ratings ordered by creation date (newest first).
Returns empty list if course has no ratings.

**Operation ID:** `get_course_ratings_courses__course_id__ratings_get`

**Parameters:**
```json
{
  "name": "course_id",
  "in": "path",
  "required": true,
  "schema": { "type": "integer" }
}
```

**Response (200):**
```json
{
  "type": "array",
  "items": { "$ref": "#/components/schemas/RatingResponse" }
}
```

**Responses:**
- `200`: List of course ratings → `RatingResponse[]`
- `404`: Course not found → `ErrorResponse`
- `422`: Validation Error

**Example:**
```bash
GET /courses/1/ratings

Response:
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

---

### 8. GET /courses/{course_id}/ratings/stats
**Tags:** `ratings`

**Summary:** Get Course Rating Stats

**Description:** Get aggregated rating statistics for a course.

**Returns:**
- `average_rating`: Average of all active ratings (0.0 if none)
- `total_ratings`: Count of active ratings
- `rating_distribution`: Count per rating value (1-5)

**Operation ID:** `get_course_rating_stats_courses__course_id__ratings_stats_get`

**Parameters:**
```json
{
  "name": "course_id",
  "in": "path",
  "required": true,
  "schema": { "type": "integer" }
}
```

**Response (200):** `RatingStatsResponse`

**Responses:**
- `200`: Course rating statistics → `RatingStatsResponse`
- `404`: Course not found → `ErrorResponse`
- `422`: Validation Error

**Example:**
```bash
GET /courses/1/ratings/stats

Response:
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

### 9. GET /courses/{course_id}/ratings/user/{user_id}
**Tags:** `ratings`

**Summary:** Get User Course Rating

**Description:** Get a specific user's rating for a course.

**Returns:**
- Rating object if user has rated the course
- 204 No Content if user hasn't rated

**Use Cases:**
- Check if current user has already rated before showing rating UI
- Display user's current rating in course detail page

**Operation ID:** `get_user_course_rating_courses__course_id__ratings_user__user_id__get`

**Parameters:**
```json
[
  {
    "name": "course_id",
    "in": "path",
    "required": true,
    "schema": { "type": "integer" }
  },
  {
    "name": "user_id",
    "in": "path",
    "required": true,
    "schema": { "type": "integer" }
  }
]
```

**Responses:**
- `200`: User's rating for the course → `RatingResponse | null`
- `204`: User has not rated this course
- `422`: Validation Error

**Example (If rated):**
```bash
GET /courses/1/ratings/user/42

Response (200):
{
  "id": 123,
  "course_id": 1,
  "user_id": 42,
  "rating": 4,
  "created_at": "2025-10-14T10:30:00",
  "updated_at": "2025-10-14T10:30:00"
}
```

**Example (If not rated):**
```bash
GET /courses/1/ratings/user/42

Response:
HTTP 204 No Content
```

---

### 10. PUT /courses/{course_id}/ratings/{user_id}
**Tags:** `ratings`

**Summary:** Update Course Rating

**Description:** Update an existing course rating.

**Semantics:** PUT = Update existing resource
Fails with 404 if rating doesn't exist (use POST to create).

**Operation ID:** `update_course_rating_courses__course_id__ratings__user_id__put`

**Parameters:**
```json
[
  {
    "name": "course_id",
    "in": "path",
    "required": true,
    "schema": { "type": "integer" }
  },
  {
    "name": "user_id",
    "in": "path",
    "required": true,
    "schema": { "type": "integer" }
  }
]
```

**Request Body:**
```json
{
  "required": true,
  "content": {
    "application/json": {
      "schema": { "$ref": "#/components/schemas/RatingRequest" }
    }
  }
}
```

**Responses:**
- `200`: Rating updated successfully → `RatingResponse`
- `400`: Validation error → `ErrorResponse`
- `404`: Rating not found → `ErrorResponse`
- `422`: Validation Error

**Example:**
```bash
PUT /courses/1/ratings/42
Content-Type: application/json

{
  "user_id": 42,
  "rating": 3
}

Response:
{
  "id": 123,
  "course_id": 1,
  "user_id": 42,
  "rating": 3,
  "created_at": "2025-10-14T10:30:00",
  "updated_at": "2025-10-14T10:30:01"
}
```

---

### 11. DELETE /courses/{course_id}/ratings/{user_id}
**Tags:** `ratings`

**Summary:** Delete Course Rating

**Description:** Delete (soft delete) a course rating.

Sets `deleted_at` timestamp, preserving data for historical analysis.
Returns HTTP 204 No Content on success.
Returns HTTP 404 if rating doesn't exist or already deleted.

**Operation ID:** `delete_course_rating_courses__course_id__ratings__user_id__delete`

**Parameters:**
```json
[
  {
    "name": "course_id",
    "in": "path",
    "required": true,
    "schema": { "type": "integer" }
  },
  {
    "name": "user_id",
    "in": "path",
    "required": true,
    "schema": { "type": "integer" }
  }
]
```

**Responses:**
- `204`: Rating deleted successfully
- `404`: Rating not found → `ErrorResponse`
- `422`: Validation Error

**Example:**
```bash
DELETE /courses/1/ratings/42

Response:
HTTP 204 No Content
```

---

## 📦 Schemas (Components)

### RatingRequest
**Description:** Schema for creating or updating a course rating.

**Validation:**
- `user_id` must be positive integer (exclusiveMinimum: 0)
- `rating` must be between 1 and 5 (inclusive)

**Properties:**
```json
{
  "user_id": {
    "type": "integer",
    "exclusiveMinimum": 0,
    "description": "ID of the user submitting the rating"
  },
  "rating": {
    "type": "integer",
    "minimum": 1,
    "maximum": 5,
    "description": "Rating value from 1 (worst) to 5 (best)"
  }
}
```

**Required:** ["user_id", "rating"]

**Example:**
```json
{
  "user_id": 42,
  "rating": 5
}
```

---

### RatingResponse
**Description:** Schema for rating response in API.
Matches the structure returned by `CourseRating.to_dict()`

**Properties:**
```json
{
  "id": { "type": "integer" },
  "course_id": { "type": "integer" },
  "user_id": { "type": "integer" },
  "rating": { "type": "integer" },
  "created_at": { "type": "string" },
  "updated_at": { "type": "string" }
}
```

**Required:** ["id", "course_id", "user_id", "rating", "created_at", "updated_at"]

**Example:**
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

---

### RatingStatsResponse
**Description:** Schema for aggregated rating statistics.
Used in course detail responses.

**Properties:**
```json
{
  "average_rating": {
    "type": "number",
    "minimum": 0.0,
    "maximum": 5.0,
    "description": "Average rating (0.0 if no ratings)"
  },
  "total_ratings": {
    "type": "integer",
    "minimum": 0,
    "description": "Total number of active ratings"
  },
  "rating_distribution": {
    "type": "object",
    "additionalProperties": { "type": "integer" },
    "description": "Count of ratings per value (1-5)"
  }
}
```

**Required:** ["average_rating", "total_ratings", "rating_distribution"]

**Example:**
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

### ErrorResponse
**Description:** Standard error response schema.
Used for validation errors and business logic errors.

**Properties:**
```json
{
  "detail": {
    "type": "string",
    "description": "Error message"
  },
  "error_code": {
    "type": ["string", "null"],
    "description": "Optional error code"
  }
}
```

**Required:** ["detail"]

**Example:**
```json
{
  "detail": "Course with id 999 not found",
  "error_code": null
}
```

---

### HTTPValidationError
**Description:** Pydantic validation error schema.

**Properties:**
```json
{
  "detail": {
    "type": "array",
    "items": { "$ref": "#/components/schemas/ValidationError" }
  }
}
```

---

### ValidationError
**Properties:**
```json
{
  "loc": {
    "type": "array",
    "items": { "oneOf": [{ "type": "string" }, { "type": "integer" }] },
    "description": "Location of error in request"
  },
  "msg": {
    "type": "string",
    "description": "Error message"
  },
  "type": {
    "type": "string",
    "description": "Validation error type"
  }
}
```

---

## 🏷️ Tags

### courses
**Description:** Operations with courses

Endpoints:
- GET /courses
- GET /courses/{slug}
- GET /classes/{class_id}

### ratings
**Description:** Course rating operations

Endpoints:
- POST /courses/{course_id}/ratings
- GET /courses/{course_id}/ratings
- GET /courses/{course_id}/ratings/stats
- GET /courses/{course_id}/ratings/user/{user_id}
- PUT /courses/{course_id}/ratings/{user_id}
- DELETE /courses/{course_id}/ratings/{user_id}

### health
**Description:** Health check endpoints

Endpoints:
- GET /health

---

## 🔑 Key Points for Frontend Integration

1. **All Rating Endpoints Use These Schemas:**
   - **Input:** RatingRequest (user_id + rating)
   - **Output:** RatingResponse (full rating object) or RatingStatsResponse (aggregated stats)
   - **Errors:** ErrorResponse or HTTPValidationError

2. **HTTP Status Codes:**
   - `200`: Success (GET, PUT)
   - `201`: Created (POST new rating)
   - `204`: No Content (DELETE success, GET no rating)
   - `400`: Bad request (validation or business logic error)
   - `404`: Not found (course/rating doesn't exist)
   - `422`: Unprocessable entity (Pydantic validation)

3. **Special Case: 204 No Content**
   - GET /courses/{id}/ratings/user/{uid} returns 204 if user hasn't rated
   - Not an error, just empty response
   - Frontend must handle this explicitly

4. **Content-Type:**
   - All endpoints expect/return: `application/json`
   - Always include `Content-Type: application/json` header

5. **Validation is Done:**
   - At Pydantic level (HTTP 422)
   - At service level (HTTP 400, 404)
   - At database level (CHECK constraints)

6. **Soft Deletes:**
   - DELETE returns 204 on success
   - User can re-rate after deleting
   - Data is preserved with deleted_at timestamp

---

## 🧪 Testing with curl

```bash
# Get all courses
curl http://localhost:8000/courses

# Get course by slug
curl http://localhost:8000/courses/python-basics

# Get rating stats
curl http://localhost:8000/courses/1/ratings/stats

# Get user's rating
curl http://localhost:8000/courses/1/ratings/user/42

# Create/update rating
curl -X POST http://localhost:8000/courses/1/ratings \
  -H "Content-Type: application/json" \
  -d '{"user_id": 42, "rating": 5}'

# Update rating
curl -X PUT http://localhost:8000/courses/1/ratings/42 \
  -H "Content-Type: application/json" \
  -d '{"user_id": 42, "rating": 3}'

# Delete rating
curl -X DELETE http://localhost:8000/courses/1/ratings/42

# Health check
curl http://localhost:8000/health
```

---

## 📚 Complete Endpoint Summary Table

| Method | Endpoint | Operation ID | Summary | Request | Response |
|--------|----------|--------------|---------|---------|----------|
| GET | / | root__get | Root | - | object |
| GET | /health | health_health_get | Health | - | object |
| GET | /courses | get_courses_courses_get | Get Courses | - | array |
| GET | /courses/{slug} | get_course_by_slug_courses__slug__get | Get Course By Slug | - | object |
| GET | /classes/{class_id} | get_class_by_id_classes__class_id__get | Get Class By Id | - | object |
| **POST** | **/courses/{course_id}/ratings** | **add_course_rating_courses__course_id__ratings_post** | **Add Rating** | **RatingRequest** | **RatingResponse** |
| **GET** | **/courses/{course_id}/ratings** | **get_course_ratings_courses__course_id__ratings_get** | **Get Ratings** | **-** | **RatingResponse[]** |
| **GET** | **/courses/{course_id}/ratings/stats** | **get_course_rating_stats_courses__course_id__ratings_stats_get** | **Get Stats** | **-** | **RatingStatsResponse** |
| **GET** | **/courses/{course_id}/ratings/user/{user_id}** | **get_user_course_rating_courses__course_id__ratings_user__user_id__get** | **Get User Rating** | **-** | **RatingResponse \| 204** |
| **PUT** | **/courses/{course_id}/ratings/{user_id}** | **update_course_rating_courses__course_id__ratings__user_id__put** | **Update Rating** | **RatingRequest** | **RatingResponse** |
| **DELETE** | **/courses/{course_id}/ratings/{user_id}** | **delete_course_rating_courses__course_id__ratings__user_id__delete** | **Delete Rating** | **-** | **204 No Content** |

---

## 📖 Documentation URL

**Interactive Swagger UI:**
```
http://localhost:8000/docs
```

This provides:
- Detailed endpoint documentation
- Live "Try it out" functionality
- Request/response examples
- Schema validation

---

**Generated from:** `http://localhost:8000/openapi.json`
**Last Updated:** 2025-10-14
**Status:** ✅ Complete & Current
