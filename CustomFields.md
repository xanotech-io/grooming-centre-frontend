# TC14 — Custom Fields in User Profiles & Courses

## Developer README

> **Module Tag:** `Custom Fields`
> **PRD Reference:** TC14 – Support Custom Fields in User Profiles/Courses
> **Base URL (Production):** `https://gclms.xanotech.org`
> **Base URL (Local):** `http://localhost:8089`
> **Authentication:** All endpoints require a Bearer JWT token via `Authorization: Bearer <token>`

---

## Table of Contents

1. [Overview](#overview)
2. [Module Endpoints](#module-endpoints)
3. [End-to-End Flow](#end-to-end-flow)
4. [Step-by-Step Integration Guide](#step-by-step-integration-guide)
   - [Step 1 — Authenticate](#step-1--authenticate)
   - [Step 2 — Create a Custom Field Definition](#step-2--create-a-custom-field-definition)
   - [Step 3 — List All Custom Field Definitions](#step-3--list-all-custom-field-definitions)
   - [Step 4 — Get a Single Custom Field Definition](#step-4--get-a-single-custom-field-definition)
   - [Step 5 — Update a Custom Field Definition](#step-5--update-a-custom-field-definition)
   - [Step 6 — Save Field Values for an Entity](#step-6--save-field-values-for-an-entity)
   - [Step 7 — Retrieve Field Values for an Entity](#step-7--retrieve-field-values-for-an-entity)
   - [Step 8 — Get KPI Dashboard](#step-8--get-kpi-dashboard)
   - [Step 9 — Delete a Custom Field](#step-9--delete-a-custom-field)
5. [Field Type Reference](#field-type-reference)
6. [Entity Type Reference](#entity-type-reference)
7. [Validation Rules Reference](#validation-rules-reference)
8. [Visibility & Permissions Reference](#visibility--permissions-reference)
9. [Request & Response Schema Reference](#request--response-schema-reference)
10. [Filtering & Query Parameters](#filtering--query-parameters)
11. [Error Handling](#error-handling)

---

## Overview

The Custom Fields module allows system administrators to extend user profiles and course metadata with institution-specific data fields — without any code changes. Fields support six data types, can target either user profiles or courses, and enforce validation rules, role-based visibility, and input constraints.

**The complete lifecycle is:**

```
Admin creates field → Field activates → UI renders field dynamically
→ User/Admin enters values → System validates and stores values
→ Values become available for filtering, reporting, and export
```

---

## Module Endpoints

All 8 endpoints that belong to this module:

| Method   | Path                                               | Description                                                   | Roles              |
| -------- | -------------------------------------------------- | ------------------------------------------------------------- | ------------------ |
| `POST`   | `/custom-fields-v2`                                | Create a custom field definition                              | Admin, Super Admin |
| `GET`    | `/custom-fields-v2`                                | List all field definitions (paginated, filterable)            | All authenticated  |
| `GET`    | `/custom-fields-v2/kpis`                           | Custom fields KPI dashboard                                   | All authenticated  |
| `GET`    | `/custom-fields-v2/values/{entityType}/{entityId}` | Get all field values for a user profile or course             | All authenticated  |
| `POST`   | `/custom-fields-v2/values`                         | Save (upsert) field values for a user profile or course       | All authenticated  |
| `GET`    | `/custom-fields-v2/{fieldId}`                      | Get a single field definition by ID                           | All authenticated  |
| `PATCH`  | `/custom-fields-v2/{fieldId}`                      | Update a field definition                                     | Admin, Super Admin |
| `DELETE` | `/custom-fields-v2/{fieldId}`                      | Delete a field (blocked if values exist — deactivate instead) | Admin, Super Admin |

---

## End-to-End Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Admin Creates a Custom Field Definition                             │
│                                                                              │
│  POST /custom-fields-v2                                                      │
│                                                                              │
│  Defines:                                                                    │
│    - fieldName       → "Employee ID"                                        │
│    - fieldType       → text | dropdown | date | number | checkbox | textarea │
│    - entity          → user_profile | course                                │
│    - required        → true | false                                          │
│    - defaultValue    → optional pre-filled value                            │
│    - validationRules → regex, min, max, error_message                       │
│    - options         → required for dropdown type                           │
│    - visibility      → who can view/edit: Self | Admin | Instructor etc.    │
│    - helpText        → guidance text shown below the field in UI            │
│    - status          → active | inactive                                    │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Field is Saved and Activated                                        │
│                                                                              │
│  System:                                                                     │
│    - Validates field name uniqueness per entity                             │
│    - Assigns a unique fieldId (UUID)                                        │
│    - Sets status to active                                                   │
│    - Makes field available for UI rendering                                 │
│    - Indexes field for search and reporting                                 │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Frontend Fetches Field Definitions to Render UI                     │
│                                                                              │
│  GET /custom-fields-v2?entity=user_profile&status=active                    │
│  GET /custom-fields-v2?entity=course&status=active                          │
│                                                                              │
│  Returns all active fields for the given entity type.                       │
│  Frontend uses fieldType to render the correct input component.             │
│  helpText, validationRules, and options are used for UX and validation.     │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 4: User Enters Values — System Saves Them                              │
│                                                                              │
│  POST /custom-fields-v2/values                                               │
│                                                                              │
│  Payload contains:                                                           │
│    - entityType  → user_profile | course                                    │
│    - entityId    → UUID of the user or course                               │
│    - fieldValues → [{ fieldId, value }]                                     │
│                                                                              │
│  System:                                                                     │
│    - Validates each value against the field's validationRules               │
│    - Checks required fields are not empty                                   │
│    - Validates dropdown values match the field's options list               │
│    - Upserts the value (creates if new, updates if exists)                  │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 5: Retrieve Field Values for an Entity                                 │
│                                                                              │
│  GET /custom-fields-v2/values/{entityType}/{entityId}                       │
│                                                                              │
│  Returns all custom field values for the user or course, including:         │
│    - full field definition linked to each value                             │
│    - who last edited each value                                             │
│    - summary of total/active field counts                                   │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 6: Admin Manages Fields Over Time                                      │
│                                                                              │
│  Update a field:   PATCH /custom-fields-v2/{fieldId}                        │
│  Deactivate:       PATCH /custom-fields-v2/{fieldId}  { status: inactive }  │
│  Delete a field:   DELETE /custom-fields-v2/{fieldId}                       │
│                    ↳ Blocked if values exist — deactivate instead           │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 7: Monitor via KPI Dashboard                                           │
│                                                                              │
│  GET /custom-fields-v2/kpis                                                  │
│                                                                              │
│  Returns:                                                                    │
│    - totalFields / activeFields / inactiveFields                            │
│    - dataCompletenessRate  (% of required fields filled)                    │
│    - breakdown by entity, field type, and status                           │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Integration Guide

### Step 1 — Authenticate

All endpoints require a valid JWT.

```http
POST /api/v1/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "YourPassword"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "sessionId": "c1d2e3f4-a5b6-7890-cdef-123456789012"
  }
}
```

Use `Authorization: Bearer <token>` on every subsequent request.

---

### Step 2 — Create a Custom Field Definition

Only **Admin** and **Super Admin** roles can create field definitions.

---

#### Example A — Text field for User Profile (with regex validation)

```http
POST /custom-fields-v2
Authorization: Bearer <token>
Content-Type: application/json

{
  "fieldName": "Employee ID",
  "fieldType": "text",
  "entity": "user_profile",
  "required": true,
  "defaultValue": null,
  "validationRules": {
    "regex": "^EMP-[0-9]{6}$",
    "error_message": "Format must be EMP-123456"
  },
  "visibility": {
    "view": ["Self", "Admin"],
    "edit": ["Admin"]
  },
  "helpText": "Enter your official employee identification number",
  "status": "active"
}
```

---

#### Example B — Dropdown field for Course

```http
POST /custom-fields-v2
Authorization: Bearer <token>
Content-Type: application/json

{
  "fieldName": "Delivery Mode",
  "fieldType": "dropdown",
  "entity": "course",
  "required": true,
  "options": ["Online", "Blended", "In-Person"],
  "visibility": {
    "view": ["Self", "Admin", "Instructor"],
    "edit": ["Admin"]
  },
  "helpText": "Select how this course is delivered",
  "status": "active"
}
```

---

#### Example C — Number field for User Profile (with min/max range)

```http
POST /custom-fields-v2
Authorization: Bearer <token>
Content-Type: application/json

{
  "fieldName": "Years of Experience",
  "fieldType": "number",
  "entity": "user_profile",
  "required": false,
  "validationRules": {
    "min": 0,
    "max": 50,
    "error_message": "Must be between 0 and 50"
  },
  "visibility": {
    "view": ["Self", "Admin", "Instructor"],
    "edit": ["Self", "Admin"]
  },
  "status": "active"
}
```

---

**Success Response — `201 Created`:**

```json
{
  "success": true,
  "message": "Custom field created successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "fieldName": "Employee ID",
    "fieldType": "text",
    "entity": "user_profile",
    "required": true,
    "defaultValue": null,
    "validationRules": {
      "regex": "^EMP-[0-9]{6}$",
      "error_message": "Format must be EMP-123456"
    },
    "options": null,
    "visibility": {
      "view": ["Self", "Admin"],
      "edit": ["Admin"]
    },
    "helpText": "Enter your official employee identification number",
    "status": "active",
    "createdBy": "uuid-admin-1",
    "creator": {
      "id": "uuid-admin-1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    "createdAt": "2026-05-21T09:00:00.000Z",
    "updatedAt": "2026-05-21T09:00:00.000Z"
  }
}
```

---

### Step 3 — List All Custom Field Definitions

Use this to fetch all active fields for a given entity so the UI can render them dynamically.

**List all fields (no filter):**

```http
GET /custom-fields-v2
Authorization: Bearer <token>
```

**List only active user profile fields:**

```http
GET /custom-fields-v2?entity=user_profile&status=active
Authorization: Bearer <token>
```

**List only active course fields:**

```http
GET /custom-fields-v2?entity=course&status=active
Authorization: Bearer <token>
```

**Search by field name:**

```http
GET /custom-fields-v2?search=Employee&page=1&limit=20
Authorization: Bearer <token>
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Custom fields fetched successfully",
  "data": {
    "total": 18,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "fields": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "fieldName": "Employee ID",
        "fieldType": "text",
        "entity": "user_profile",
        "required": true,
        "defaultValue": null,
        "validationRules": {
          "regex": "^EMP-[0-9]{6}$",
          "error_message": "Format must be EMP-123456"
        },
        "options": null,
        "visibility": {
          "view": ["Self", "Admin"],
          "edit": ["Admin"]
        },
        "helpText": "Enter your official employee identification number",
        "status": "active",
        "createdAt": "2026-05-21T09:00:00.000Z",
        "updatedAt": "2026-05-21T09:00:00.000Z"
      },
      {
        "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "fieldName": "Delivery Mode",
        "fieldType": "dropdown",
        "entity": "course",
        "required": true,
        "defaultValue": null,
        "validationRules": null,
        "options": ["Online", "Blended", "In-Person"],
        "visibility": {
          "view": ["Self", "Admin", "Instructor"],
          "edit": ["Admin"]
        },
        "helpText": "Select how this course is delivered",
        "status": "active",
        "createdAt": "2026-05-21T09:05:00.000Z",
        "updatedAt": "2026-05-21T09:05:00.000Z"
      }
    ]
  }
}
```

---

### Step 4 — Get a Single Custom Field Definition

Use this to inspect the full configuration of one field, or to confirm a `fieldId` before saving values against it.

```http
GET /custom-fields-v2/{fieldId}
Authorization: Bearer <token>
```

**Example:**

```http
GET /custom-fields-v2/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer <token>
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Custom field fetched successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "fieldName": "Employee ID",
    "fieldType": "text",
    "entity": "user_profile",
    "required": true,
    "defaultValue": null,
    "validationRules": {
      "regex": "^EMP-[0-9]{6}$",
      "error_message": "Format must be EMP-123456"
    },
    "options": null,
    "visibility": {
      "view": ["Self", "Admin"],
      "edit": ["Admin"]
    },
    "helpText": "Enter your official employee identification number",
    "status": "active",
    "creator": {
      "id": "uuid-admin-1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    "createdAt": "2026-05-21T09:00:00.000Z",
    "updatedAt": "2026-05-21T09:00:00.000Z"
  }
}
```

**`404`** is returned when the `fieldId` does not exist.

---

### Step 5 — Update a Custom Field Definition

Only **Admin** and **Super Admin** roles can update field definitions. All fields in the request body are optional — only send what needs to change.

**Example — deactivate a field:**

```http
PATCH /custom-fields-v2/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "inactive"
}
```

**Example — update dropdown options:**

```http
PATCH /custom-fields-v2/b2c3d4e5-f6a7-8901-bcde-f12345678901
Authorization: Bearer <token>
Content-Type: application/json

{
  "options": ["Online", "Blended", "In-Person", "Hybrid"]
}
```

**Example — update validation rules and help text:**

```http
PATCH /custom-fields-v2/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer <token>
Content-Type: application/json

{
  "validationRules": {
    "regex": "^EMP-[0-9]{6}$",
    "min": 1,
    "max": 100,
    "error_message": "Must be a valid Employee ID"
  },
  "helpText": "Enter your 6-digit employee number prefixed with EMP-"
}
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Custom field updated successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "fieldName": "Employee ID",
    "fieldType": "text",
    "entity": "user_profile",
    "required": true,
    "status": "inactive",
    "updatedAt": "2026-05-21T10:30:00.000Z"
  }
}
```

> **Important:** Deactivating a field (`status: inactive`) preserves all existing values. The field stops rendering in UI forms but historical data is retained. This is the recommended alternative to deletion when a field has existing values.

---

### Step 6 — Save Field Values for an Entity

This endpoint **upserts** values — it creates the value if it does not exist, or updates it if it does. Pass all field values for the entity in a single call.

**Save values for a User Profile:**

```http
POST /custom-fields-v2/values
Authorization: Bearer <token>
Content-Type: application/json

{
  "entityType": "user_profile",
  "entityId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "fieldValues": [
    {
      "fieldId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "value": "EMP-123456"
    },
    {
      "fieldId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "value": "Vegetarian"
    }
  ]
}
```

**Save values for a Course:**

```http
POST /custom-fields-v2/values
Authorization: Bearer <token>
Content-Type: application/json

{
  "entityType": "course",
  "entityId": "d4e5f6a7-b8c9-0123-defa-234567890123",
  "fieldValues": [
    {
      "fieldId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "value": "Blended"
    }
  ]
}
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Custom field values saved successfully",
  "data": {
    "entityId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "entityType": "user_profile",
    "custom_fields": [
      {
        "id": "uuid-value-1",
        "fieldId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "entityType": "user_profile",
        "entityId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "value": "EMP-123456",
        "updatedBy": "uuid-admin-1",
        "field": {
          "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "fieldName": "Employee ID",
          "fieldType": "text",
          "status": "active"
        },
        "editor": {
          "id": "uuid-admin-1",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com"
        },
        "updatedAt": "2026-05-21T10:00:00.000Z"
      }
    ],
    "summary": {
      "total_fields": 2,
      "active_fields": 2
    },
    "status": "Updated"
  }
}
```

**Validation errors return `400`:**

```json
{
  "success": false,
  "message": "Validation failed for field 'Employee ID': Format must be EMP-123456"
}
```

---

### Step 7 — Retrieve Field Values for an Entity

Fetch all custom field values currently stored for a specific user profile or course.

**Get values for a User Profile:**

```http
GET /custom-fields-v2/values/user_profile/3fa85f64-5717-4562-b3fc-2c963f66afa6
Authorization: Bearer <token>
```

**Get values for a Course:**

```http
GET /custom-fields-v2/values/course/d4e5f6a7-b8c9-0123-defa-234567890123
Authorization: Bearer <token>
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Custom field values fetched successfully",
  "data": {
    "entityId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "entityType": "user_profile",
    "custom_fields": [
      {
        "id": "uuid-value-1",
        "fieldId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "entityType": "user_profile",
        "entityId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "value": "EMP-123456",
        "updatedBy": "uuid-admin-1",
        "field": {
          "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "fieldName": "Employee ID",
          "fieldType": "text",
          "entity": "user_profile",
          "required": true,
          "status": "active",
          "validationRules": {
            "regex": "^EMP-[0-9]{6}$",
            "error_message": "Format must be EMP-123456"
          },
          "visibility": {
            "view": ["Self", "Admin"],
            "edit": ["Admin"]
          }
        },
        "editor": {
          "id": "uuid-admin-1",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com"
        },
        "updatedAt": "2026-05-21T10:00:00.000Z"
      }
    ],
    "summary": {
      "total_fields": 3,
      "active_fields": 3
    }
  }
}
```

**`400`** is returned when `entityType` is not `user_profile` or `course`.

---

### Step 8 — Get KPI Dashboard

Returns system-wide KPIs for the custom fields module.

```http
GET /custom-fields-v2/kpis
Authorization: Bearer <token>
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Custom fields KPIs fetched successfully",
  "data": {
    "totalFields": 18,
    "activeFields": 15,
    "inactiveFields": 3,
    "dataCompletenessRate": 87,
    "byEntity": [
      { "entity": "user_profile", "count": 10 },
      { "entity": "course", "count": 8 }
    ],
    "byType": [
      { "fieldType": "text", "count": 6 },
      { "fieldType": "dropdown", "count": 5 },
      { "fieldType": "date", "count": 2 },
      { "fieldType": "number", "count": 2 },
      { "fieldType": "checkbox", "count": 2 },
      { "fieldType": "textarea", "count": 1 }
    ],
    "byStatus": [
      { "status": "active", "count": 15 },
      { "status": "inactive", "count": 3 }
    ]
  }
}
```

| KPI Field              | Description                                                             |
| ---------------------- | ----------------------------------------------------------------------- |
| `totalFields`          | Total custom fields defined in the system                               |
| `activeFields`         | Fields currently in use (status = active)                               |
| `inactiveFields`       | Deactivated fields (data preserved)                                     |
| `dataCompletenessRate` | Percentage of required fields that have been filled across all entities |
| `byEntity`             | Field count split between `user_profile` and `course`                   |
| `byType`               | Field count per input type                                              |
| `byStatus`             | Field count per status                                                  |

---

### Step 9 — Delete a Custom Field

Permanently removes the field definition. **Blocked if any entity has a value stored against this field.** Use deactivation (`PATCH` with `status: inactive`) when a field has existing data.

```http
DELETE /custom-fields-v2/{fieldId}
Authorization: Bearer <token>
```

**Example:**

```http
DELETE /custom-fields-v2/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer <token>
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Custom field deleted successfully"
}
```

**`403` response when the field has existing data:**

```json
{
  "success": false,
  "message": "Cannot delete a field that has existing values. Deactivate it instead."
}
```

---

## Field Type Reference

| `fieldType` Value | Input Rendered         | Notes                             |
| ----------------- | ---------------------- | --------------------------------- |
| `text`            | Single-line text input | Supports regex validation         |
| `dropdown`        | Select menu            | `options` array is required       |
| `date`            | Date picker            | ISO date format                   |
| `number`          | Numeric input          | Supports `min` / `max` validation |
| `checkbox`        | Checkbox (boolean)     | Value stored as `true` / `false`  |
| `textarea`        | Multi-line text area   | No length constraint by default   |

---

## Entity Type Reference

| `entity` Value | Applies To                               | Used In                      |
| -------------- | ---------------------------------------- | ---------------------------- |
| `user_profile` | Student, Instructor, Admin profile pages | Stored against a user UUID   |
| `course`       | Course detail and creation forms         | Stored against a course UUID |

---

## Validation Rules Reference

The `validationRules` object is optional and supports the following keys:

| Key             | Type   | Applies To         | Description                                        |
| --------------- | ------ | ------------------ | -------------------------------------------------- |
| `regex`         | string | `text`, `textarea` | Regular expression pattern the value must match    |
| `min`           | number | `number`           | Minimum numeric value allowed                      |
| `max`           | number | `number`           | Maximum numeric value allowed                      |
| `error_message` | string | All types          | Human-readable message shown when validation fails |

**Example — text with regex:**

```json
"validationRules": {
  "regex": "^EMP-[0-9]{6}$",
  "error_message": "Format must be EMP-123456"
}
```

**Example — number with range:**

```json
"validationRules": {
  "min": 1,
  "max": 100,
  "error_message": "Must be between 1 and 100"
}
```

> `validationRules` is not used for `dropdown` fields — validation for dropdown is handled by checking that the submitted value exists in the `options` array.

---

## Visibility & Permissions Reference

The `visibility` object controls who can view and who can edit the field value on an entity.

```json
"visibility": {
  "view": ["Self", "Admin"],
  "edit": ["Admin"]
}
```

| Role String    | Meaning                                         |
| -------------- | ----------------------------------------------- |
| `"Self"`       | The entity owner (the user whose profile it is) |
| `"Admin"`      | System administrators                           |
| `"Instructor"` | Course instructors                              |

**Common patterns:**

| Use Case                           | `view`                            | `edit`              |
| ---------------------------------- | --------------------------------- | ------------------- |
| Admin-only internal field          | `["Admin"]`                       | `["Admin"]`         |
| Student can see and fill own field | `["Self", "Admin"]`               | `["Self", "Admin"]` |
| Public course metadata             | `["Self", "Admin", "Instructor"]` | `["Admin"]`         |
| Read-only display to student       | `["Self", "Admin"]`               | `["Admin"]`         |

---

## Request & Response Schema Reference

### `CustomFieldRequest` — used by `POST` and `PATCH`

```
{
  fieldName:        string                                        (required on POST)
  fieldType:        "text" | "dropdown" | "date" |
                    "number" | "checkbox" | "textarea"           (required on POST)
  entity:           "user_profile" | "course"                    (required on POST)
  required:         boolean  default=false
  defaultValue:     string | null
  validationRules:  {
    regex?:         string
    min?:           number
    max?:           number
    error_message?: string
  } | null
  options:          string[]  (required when fieldType = "dropdown")
  visibility:       {
    view: string[]
    edit: string[]
  }
  helpText:         string | null
  status:           "active" | "inactive"  default="active"
}
```

### `UpsertValuesRequest` — used by `POST /custom-fields-v2/values`

```
{
  entityType:   "user_profile" | "course"   (required)
  entityId:     UUID                         (required)
  fieldValues:  [                            (required, min 1 item)
    {
      fieldId:  UUID      (required)
      value:    string | null
    }
  ]
}
```

### `EntityValuesResponse` — returned by both values endpoints

```
{
  entityId:      UUID
  entityType:    "user_profile" | "course"
  custom_fields: [
    {
      id:          UUID
      fieldId:     UUID
      entityType:  string
      entityId:    UUID
      value:       string | null
      updatedBy:   UUID | null
      field:       CustomField
      editor:      { id, firstName, lastName, email } | null
      updatedAt:   datetime
    }
  ]
  summary: {
    total_fields:  integer
    active_fields: integer
  }
  status:        string
}
```

### `CustomFieldKpis` — returned by `GET /custom-fields-v2/kpis`

```
{
  totalFields:            integer
  activeFields:           integer
  inactiveFields:         integer
  dataCompletenessRate:   integer    // percentage
  byEntity:               [{ entity: string, count: integer }]
  byType:                 [{ fieldType: string, count: integer }]
  byStatus:               [{ status: string, count: integer }]
}
```

---

## Filtering & Query Parameters

### `GET /custom-fields-v2` — Query Parameters

| Parameter | Type    | Required | Description                                  |
| --------- | ------- | -------- | -------------------------------------------- |
| `entity`  | enum    | No       | Filter by entity: `user_profile` or `course` |
| `status`  | enum    | No       | Filter by status: `active` or `inactive`     |
| `search`  | string  | No       | Case-insensitive search on field name        |
| `page`    | integer | No       | Page number (default: `1`)                   |
| `limit`   | integer | No       | Records per page (default: `20`)             |

**Total pages calculation:**

```javascript
const totalPages = Math.ceil(data.total / data.limit);
```

### `GET /custom-fields-v2/values/{entityType}/{entityId}` — Path Parameters

| Parameter    | Type | Required | Description                |
| ------------ | ---- | -------- | -------------------------- |
| `entityType` | enum | **Yes**  | `user_profile` or `course` |
| `entityId`   | UUID | **Yes**  | UUID of the user or course |

---

## Error Handling

| HTTP Status | Meaning                | Recommended Action                                                             |
| ----------- | ---------------------- | ------------------------------------------------------------------------------ |
| `200`       | Success                | Render response                                                                |
| `201`       | Field created          | Store returned `id` for downstream use                                         |
| `400`       | Validation error       | Check required fields; verify dropdown options; check regex/range rules        |
| `401`       | Missing or invalid JWT | Re-authenticate                                                                |
| `403`       | Action not permitted   | Field has existing values — use `PATCH { status: inactive }` instead of DELETE |
| `404`       | Field not found        | Verify the `fieldId` UUID is correct                                           |
| `500`       | Server error           | Retry; log error for investigation                                             |

### Common Validation Errors

| Error                                    | Cause                                                       | Fix                                                                              |
| ---------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `"Duplicate field name"` on create       | Field name already exists for that entity                   | Use a unique `fieldName` per entity                                              |
| `"options required for dropdown"`        | `fieldType` is `dropdown` but `options` is missing          | Include the `options` array                                                      |
| Regex mismatch on value save             | Submitted value does not match the field's `regex` pattern  | Validate client-side before submitting using the field's `validationRules.regex` |
| `"required field missing"` on value save | A field marked `required: true` has no value                | Ensure all required fields have a non-null, non-empty value                      |
| `"invalid option"` on value save         | Submitted value for a dropdown is not in the `options` list | Fetch the field definition first and display only the allowed options            |
| `403` on DELETE                          | Field has existing values stored                            | Use `PATCH /custom-fields-v2/{fieldId}` with `{ "status": "inactive" }` instead  |
