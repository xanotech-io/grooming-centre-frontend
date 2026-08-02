# Bulk Course Creation Module — Developer README (AI-Optimized)

> **Purpose:** Maps every UI screen to its API endpoint(s), defines the full data flow, and provides step-by-step implementation instructions for the Bulk Course Creation & Structured Course Content into Modules feature in GCLMS (TC10).

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Entity & Data Model Reference](#2-entity--data-model-reference)
3. [Role-Based Access Matrix](#3-role-based-access-matrix)
4. [UI Screens → Endpoint Mapping](#4-ui-screens--endpoint-mapping)
5. [Step-by-Step Feature Flows](#5-step-by-step-feature-flows)
6. [CSV / Excel Upload Specification](#6-csv--excel-upload-specification)
7. [State & Status Rules](#7-state--status-rules)
8. [Business Logic the Frontend Must Enforce](#8-business-logic-the-frontend-must-enforce)
9. [API Quick Reference](#9-api-quick-reference)

---

## 1. Module Overview

The Bulk Course Creation module allows Academic Admins to generate multiple course shells in a single operation, optionally applying a reusable template that auto-populates module/topic structure on every created course.

**Two independent sub-domains:**

```
A) Template Management
   Admin creates/edits templates → templates store module + topic structure
   → templates are referenced during batch creation

B) Batch Creation & Monitoring
   Admin initiates a batch (manual JSON or CSV/Excel upload)
   → system validates + creates course shells
   → optionally applies template structure
   → tracks per-course success/failure
   → admin reviews results, retries failures, bulk-publishes
```

**Upload Methods:** `manual` (JSON course list) | `csv` | `excel`

**Batch Statuses:** `pending` | `in_progress` | `completed` | `error`

**Item (per-course) Statuses:** `created` | `failed`

---

## 2. Entity & Data Model Reference

### Template Object

| Field         | Type                          | Description                |
| ------------- | ----------------------------- | -------------------------- |
| `id`          | UUID                          | Template unique identifier |
| `name`        | string                        | Template display name      |
| `description` | string                        | What this template is for  |
| `modules`     | Module[]                      | Ordered list of modules    |
| `createdBy`   | UUID                          | Admin who created it       |
| `creator`     | `{ id, firstName, lastName }` | Creator details            |
| `createdAt`   | ISO date                      |                            |

### Template Module Object

| Field           | Type              | Description                             |
| --------------- | ----------------- | --------------------------------------- |
| `title`         | string            | Module name                             |
| `description`   | string (optional) | Module description                      |
| `sequenceOrder` | number            | Display/ordering position               |
| `topics`        | string[]          | List of topic strings within the module |

### Batch Object

| Field                | Type                          | Description                                       |
| -------------------- | ----------------------------- | ------------------------------------------------- |
| `id`                 | UUID                          | Batch unique identifier                           |
| `status`             | string                        | `pending`, `in_progress`, `completed`, `error`    |
| `totalCourses`       | number                        | Total courses submitted in this batch             |
| `successfulCount`    | number                        | Courses created successfully                      |
| `failedCount`        | number                        | Courses that failed creation                      |
| `progressPercentage` | number                        | `(successfulCount / totalCourses) * 100`          |
| `uploadMethod`       | string                        | `manual`, `csv`, or `excel`                       |
| `term`               | string                        | Academic term (e.g. `2025/2026 - First Semester`) |
| `department`         | `{ id, name }`                | Department this batch belongs to                  |
| `template`           | `{ id, name }` \| null        | Template applied, if any                          |
| `creator`            | `{ id, firstName, lastName }` | Admin who initiated the batch                     |
| `createdAt`          | ISO date                      |                                                   |
| `items`              | BatchItem[]                   | Per-course results (only on detail endpoint)      |

### BatchItem Object

| Field         | Type                                  | Description                                   |
| ------------- | ------------------------------------- | --------------------------------------------- |
| `id`          | UUID                                  | Item record ID                                |
| `courseId`    | UUID \| null                          | Created course ID (null if failed)            |
| `courseTitle` | string                                | Title submitted                               |
| `status`      | string                                | `created` or `failed`                         |
| `errorReason` | string \| null                        | Failure reason (e.g. "Duplicate course code") |
| `instructor`  | `{ id, firstName, lastName }` \| null | Assigned instructor if provided               |

### Retry Summary Object

| Field            | Type   | Description                  |
| ---------------- | ------ | ---------------------------- |
| `retried`        | number | Total failed items attempted |
| `retriedSuccess` | number | Now successfully created     |
| `retriedFailed`  | number | Still failing after retry    |

---

## 3. Role-Based Access Matrix

| Feature                         | Admin            | Super Admin |
| ------------------------------- | ---------------- | ----------- |
| Create template                 | ✅               | ✅          |
| List templates                  | ✅               | ✅          |
| Get template by ID              | ✅               | ✅          |
| Update template                 | ✅               | ✅          |
| Create batch (JSON)             | ✅               | ✅          |
| Create batch (CSV/Excel upload) | ✅               | ✅          |
| List batches                    | Own batches only | All batches |
| Get batch details               | Own batches only | All batches |
| Retry failed batch items        | ✅               | ✅          |
| Bulk publish batch courses      | ✅               | ✅          |

> There are no student or instructor-facing endpoints in this module. All routes are Admin/Super Admin only.

---

## 4. UI Screens → Endpoint Mapping

---

### Screen 1: Template Management Page

**Route:** `/admin/bulk-courses/templates`

**Purpose:** List all templates, create new ones, edit existing ones.

**Endpoints used:**

```
GET  /api/v1/bulk-course-v2/template           → load template list
POST /api/v1/bulk-course-v2/template           → create new template
PUT  /api/v1/bulk-course-v2/template/:id       → update template
GET  /api/v1/bulk-course-v2/template/:id       → load template for edit pre-fill
```

**UI Components:**

```
TemplateManagementPage
├── "Create Template" button → opens CreateTemplateModal
│
└── TemplateTable
    Columns: Name | Description | Modules Count | Created By | Created At | Actions
    Actions per row:
    ├── Edit → GET /:id to pre-fill form → PUT /:id on submit
    └── View → read-only detail drawer
```

**CreateTemplateModal / EditTemplateModal fields:**

```
{
  name:        string (required)
  description: string (optional)
  modules: [
    {
      title:         string (required)
      description:   string (optional)
      sequenceOrder: number (required — auto-assigned by UI position)
      topics:        string[] (tag/chip input — each topic is a plain string)
    }
  ]
}
```

**Module Builder UX inside the modal:**

```
ModuleBuilder
├── "Add Module" button → appends new module row
├── Each module row:
│   ├── Title input
│   ├── Description input (optional)
│   ├── Sequence order → auto-derived from array index + 1
│   └── Topics tag input → space/enter to add, click to remove
└── Drag to reorder modules → updates sequenceOrder values
```

> `sequenceOrder` is NOT a manual number field — derive it from the array position (index + 1) automatically.

---

### Screen 2: Template Detail View

**Route:** `/admin/bulk-courses/templates/:templateId`

**Purpose:** Read-only view of a template's full module/topic structure.

**Endpoint:**

```
GET /api/v1/bulk-course-v2/template/:templateId
```

**UI:**

```
TemplateDetailPage
├── name, description, creator, createdAt
└── Module List (ordered by sequenceOrder)
    └── ModuleCard per module
        ├── Module title + description
        ├── Sequence badge (#1, #2, ...)
        └── Topic chips (topics[])
```

---

### Screen 3: Batch Creation Page

**Route:** `/admin/bulk-courses/new-batch`

**Purpose:** Initiate a new bulk course creation batch.

**Endpoints used:**

```
GET  /api/v1/bulk-course-v2/template           → populate template selector dropdown
POST /api/v1/bulk-course-v2/batch              → submit JSON course list
POST /api/v1/bulk-course-v2/batch/upload       → submit CSV or Excel file
```

**This screen has two modes — use tabs or a toggle to switch:**

---

#### Mode A: Manual JSON Entry

**Endpoint:** `POST /api/v1/bulk-course-v2/batch`

**Form fields:**

```
BatchSettingsSection
├── departmentId    → select (required)
├── templateId      → select from GET /template list (optional)
├── term            → text input (required, e.g. "2025/2026 - First Semester")
│
CourseListSection
└── Dynamic course rows (add/remove rows)
    Each row:
    ├── title         → string (required)
    ├── description   → string (optional)
    └── instructorId  → instructor selector (optional)
```

**Request body built from form:**

```json
{
  "departmentId": "uuid",
  "templateId": "uuid",
  "term": "2025/2026 - First Semester",
  "courseList": [
    {
      "title": "Introduction to Programming",
      "description": "Foundational programming concepts",
      "instructorId": "uuid"
    }
  ]
}
```

---

#### Mode B: CSV / Excel Upload

**Endpoint:** `POST /api/v1/bulk-course-v2/batch/upload`

**Request type:** `multipart/form-data`

**Form fields:**

```
BatchUploadSection
├── file *          → file input (.csv, .xlsx, .xls only)
├── departmentId    → select (optional)
├── templateId      → select from GET /template list (optional)
├── term            → text input (optional)
└── remark          → textarea (optional)
```

**Required file columns:** `title` or `course_title`
**Optional file columns:** `description`, `instructor_id`

> Show a downloadable sample CSV template on this screen so admins know the expected column format.

---

**After submission (both modes):**

On `201` → navigate to Batch Detail page (`/admin/bulk-courses/batches/:batchId`) with the returned batch ID.

---

### Screen 4: Batch List Page

**Route:** `/admin/bulk-courses/batches`

**Purpose:** List all batches created by this admin (or all batches for Super Admin).

**Endpoint:**

```
GET /api/v1/bulk-course-v2/batch
```

**UI:**

```
BatchListPage
├── Filter/sort controls (by status, date, department)
│
└── BatchTable
    Columns: Batch ID | Term | Department | Upload Method | Total | Successful | Failed | Progress | Status | Created At | Actions
    Actions per row:
    └── View Details → /admin/bulk-courses/batches/:batchId
```

**Status chip colors:**

```
pending     → grey
in_progress → blue
completed   → green
error       → red
```

**Progress column:**

```
<ProgressBar value={progressPercentage} />
"{successfulCount} / {totalCourses}"
```

---

### Screen 5: Batch Detail Page

**Route:** `/admin/bulk-courses/batches/:batchId`

**Purpose:** Full batch result view — per-course success/failure, retry failures, bulk publish.

**Endpoints used:**

```
GET  /api/v1/bulk-course-v2/batch/:batchId         → load batch + items
POST /api/v1/bulk-course-v2/batch/:batchId/retry   → retry all failed items
POST /api/v1/bulk-course-v2/batch/:batchId/publish → publish all created courses
```

**UI:**

```
BatchDetailPage
│
├── BatchSummaryHeader
│   ├── Batch ID | Status chip | Upload Method
│   ├── Term | Department | Template used (if any)
│   ├── Creator | Created At
│   └── KPI row:
│       Total: {totalCourses} | ✅ Created: {successfulCount} | ❌ Failed: {failedCount}
│       Progress bar: {progressPercentage}%
│
├── Action Buttons (conditional)
│   ├── "Retry Failed ({failedCount})" → POST /:batchId/retry
│   │   Only shown if failedCount > 0
│   └── "Publish All Courses ({successfulCount})" → POST /:batchId/publish
│       Only shown if successfulCount > 0
│
└── BatchItemsTable
    Columns: Course Title | Status | Instructor | Course ID | Error Reason
    Filter tabs: All | Created | Failed
    Row styling:
    ├── status === "created" → green row / ✅ chip
    └── status === "failed"  → red row / ❌ chip + errorReason shown
```

**After Retry:**

- Call `POST /:batchId/retry`
- On success: show toast with retry summary → `"{retriedSuccess} courses created, {retriedFailed} still failing"`
- Re-fetch `GET /:batchId` to refresh the items table

**After Publish:**

- Call `POST /:batchId/publish`
- On success: show toast → `"{published} courses published successfully"`
- Update UI state to reflect courses are now active

---

## 5. Step-by-Step Feature Flows

---

### Flow A: Admin Creates a Template

```
1. Admin navigates to /admin/bulk-courses/templates
2. Calls GET /api/v1/bulk-course-v2/template → renders template list
3. Admin clicks "Create Template"
4. CreateTemplateModal opens
5. Admin enters: name, description
6. Admin adds modules one by one using ModuleBuilder:
   a. Types module title
   b. Adds topics via tag input
   c. Drags to reorder → sequenceOrder auto-updates from array position
7. Admin submits → POST /api/v1/bulk-course-v2/template
8. On 201: close modal, toast "Template created", refresh GET /template list
9. On 400: show inline validation errors
```

---

### Flow B: Admin Creates a Batch — Manual Entry

```
1. Admin navigates to /admin/bulk-courses/new-batch
2. Admin selects "Manual Entry" mode
3. Page calls GET /api/v1/bulk-course-v2/template to populate template dropdown
4. Admin fills in: departmentId, templateId (optional), term
5. Admin adds course rows dynamically:
   - Each row: title (required), description (optional), instructorId (optional)
6. Admin reviews course list
7. Admin submits → POST /api/v1/bulk-course-v2/batch
8. On 201:
   a. Extract batchId from response data.id
   b. Navigate to /admin/bulk-courses/batches/{batchId}
   c. Show batch detail with items results
9. On 400: show validation errors, stay on form
```

---

### Flow C: Admin Creates a Batch — CSV/Excel Upload

```
1. Admin navigates to /admin/bulk-courses/new-batch
2. Admin selects "File Upload" mode
3. Admin downloads the sample CSV template shown on screen
4. Admin prepares their file with columns: title (or course_title), description, instructor_id
5. Admin selects their .csv / .xlsx / .xls file
6. Admin fills in optional: departmentId, templateId, term, remark
7. Admin submits → POST /api/v1/bulk-course-v2/batch/upload (multipart/form-data)
8. On 201:
   a. Navigate to /admin/bulk-courses/batches/{batchId}
9. On 400 "Invalid file type": show error "Please upload a .csv, .xlsx, or .xls file"
10. On 400 "No valid course rows found": show error "Your file has no valid course rows. Check that you have a title or course_title column."
```

---

### Flow D: Admin Reviews Batch Results

```
1. Admin is on /admin/bulk-courses/batches/:batchId
2. App calls GET /api/v1/bulk-course-v2/batch/:batchId
3. BatchSummaryHeader shows: total, successful, failed, progress%
4. BatchItemsTable renders all items:
   - Created items: green chip, courseId populated
   - Failed items: red chip, errorReason shown (e.g. "Duplicate course code")
5. Admin uses filter tabs to view "Failed" items only
6. Admin reviews error reasons to understand what went wrong
```

---

### Flow E: Admin Retries Failed Items

```
1. Admin is on Batch Detail page with failedCount > 0
2. Admin clicks "Retry Failed (N)"
3. App calls POST /api/v1/bulk-course-v2/batch/:batchId/retry
4. On 200:
   a. Show toast: "{retriedSuccess} courses created, {retriedFailed} still failing"
   b. Re-call GET /api/v1/bulk-course-v2/batch/:batchId to refresh items
   c. If retriedFailed > 0: keep "Retry" button visible
   d. If retriedFailed === 0: hide "Retry" button, show only "Publish"
5. On 404: show "Batch not found"
```

---

### Flow F: Admin Bulk Publishes All Created Courses

```
1. Admin is on Batch Detail page with successfulCount > 0
2. Admin clicks "Publish All Courses (N)"
3. Confirmation dialog: "This will publish {N} courses and make them visible. Continue?"
4. Admin confirms → POST /api/v1/bulk-course-v2/batch/:batchId/publish
5. On 200:
   a. Show toast: "{published} courses published successfully"
   b. Disable "Publish" button (or change label to "Published")
6. On 401: show "Unauthorized"
```

---

### Flow G: Admin Edits an Existing Template

```
1. Admin is on /admin/bulk-courses/templates
2. Admin clicks "Edit" on a template row
3. App calls GET /api/v1/bulk-course-v2/template/:templateId
4. EditTemplateModal opens pre-filled with template data
5. Admin modifies: name, description, or module structure
6. Admin submits → PUT /api/v1/bulk-course-v2/template/:templateId
7. Only send changed fields (all fields are optional in PUT)
8. On 200: close modal, toast "Template updated", refresh template list
9. On 404: show "Template not found"
```

---

## 6. CSV / Excel Upload Specification

### Required Columns (at least one must be present)

| Column Name    | Description                                         |
| -------------- | --------------------------------------------------- |
| `title`        | Course title                                        |
| `course_title` | Alternative course title column name (either works) |

### Optional Columns

| Column Name     | Description                      |
| --------------- | -------------------------------- |
| `description`   | Course description               |
| `instructor_id` | UUID of the instructor to assign |

### Sample CSV Format

```csv
title,description,instructor_id
Introduction to Programming,Foundational programming concepts,1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f
Data Structures,,
Algorithms and Complexity,Advanced algorithmic thinking,
```

### Frontend File Validation (before upload)

```
1. Accept only: .csv, .xlsx, .xls
2. Check file size (recommend max 5MB client-side guard)
3. For CSV: parse first row to check for title or course_title column
4. Show preview table of first 5 rows after file selection
5. Show row count: "N courses found in file"
6. Only submit if at least 1 valid row detected
```

---

## 7. State & Status Rules

### Batch Status — Never set manually

| Status        | Meaning                                              |
| ------------- | ---------------------------------------------------- |
| `pending`     | Batch created, processing not yet started            |
| `in_progress` | Batch is actively being processed                    |
| `completed`   | All items have been attempted (some may have failed) |
| `error`       | Batch-level failure (system error, not item-level)   |

> `completed` does NOT mean all courses succeeded. Check `failedCount` to determine if there were errors.

### BatchItem Status

| Status    | Meaning                           | UI Treatment                     |
| --------- | --------------------------------- | -------------------------------- |
| `created` | Course shell successfully created | ✅ green chip                    |
| `failed`  | Course creation failed            | ❌ red chip + show `errorReason` |

### Progress Percentage

- Computed by API: `(successfulCount / totalCourses) * 100`
- Never compute this on the frontend — read from `progressPercentage`

### Retry Behaviour

- Retry only re-attempts items with `status === "failed"`
- Items already `created` are not touched by retry
- After retry, re-fetch the full batch to get updated `items[]`

---

## 8. Business Logic the Frontend Must Enforce

1. **`sequenceOrder` auto-derived** — in the ModuleBuilder, `sequenceOrder` is always derived from the array index (`index + 1`). Never show a manual number input for this. Reordering modules via drag-and-drop must recompute all `sequenceOrder` values before submitting.

2. **`requiredCoursesCount` equivalent here is `courseList.length`** — display a live counter in the manual batch form: "X courses in this batch" as rows are added/removed.

3. **Template is optional, not required** — a batch can be created without a template. If no template is selected, courses are created as empty shells (no modules auto-generated).

4. **CSV column naming flexibility** — both `title` and `course_title` are valid column names for the course title. Show this in the UI hint text.

5. **File type restriction** — only `.csv`, `.xlsx`, and `.xls` are accepted. Reject any other file type before uploading with a client-side error message.

6. **Publish confirmation dialog** — always show a confirmation before `POST /batch/:batchId/publish`. This action sets `isPublished = true` on all courses and cannot be undone via this module.

7. **Retry button visibility** — only show the "Retry Failed" button when `batch.failedCount > 0`. Hide or disable it when `failedCount === 0`.

8. **Publish button visibility** — only show "Publish All" when `batch.successfulCount > 0`. This ensures there are courses to publish.

9. **Super Admin vs Admin batch list** — the API handles the scoping (`GET /batch` returns own batches for Admin, all batches for Super Admin). The frontend does not need to filter — just render what the API returns.

10. **Error reason display** — for failed `BatchItem` rows, always show `errorReason` inline in the table. Common reasons: `"Duplicate course code"`, `"Missing required field: title"`, `"Instructor not found"`. Never swallow this string.

---

## 9. API Quick Reference

| Method | Endpoint                                        | Role                | UI Trigger                                             |
| ------ | ----------------------------------------------- | ------------------- | ------------------------------------------------------ |
| `POST` | `/api/v1/bulk-course-v2/template`               | Admin               | Create template form submit                            |
| `GET`  | `/api/v1/bulk-course-v2/template`               | Admin               | Template list page load + batch form template dropdown |
| `GET`  | `/api/v1/bulk-course-v2/template/:templateId`   | Admin               | Template detail view + edit pre-fill                   |
| `PUT`  | `/api/v1/bulk-course-v2/template/:templateId`   | Admin               | Edit template form submit                              |
| `POST` | `/api/v1/bulk-course-v2/batch`                  | Admin               | Manual batch creation form submit                      |
| `GET`  | `/api/v1/bulk-course-v2/batch`                  | Admin / Super Admin | Batch list page load                                   |
| `POST` | `/api/v1/bulk-course-v2/batch/upload`           | Admin               | CSV/Excel file upload submit                           |
| `GET`  | `/api/v1/bulk-course-v2/batch/:batchId`         | Admin               | Batch detail page load + after retry                   |
| `POST` | `/api/v1/bulk-course-v2/batch/:batchId/retry`   | Admin               | Retry Failed button click                              |
| `POST` | `/api/v1/bulk-course-v2/batch/:batchId/publish` | Admin               | Publish All button click (after confirmation)          |

---

_Generated for GCLMS — Bulk Course Creation Module (TC10)_
