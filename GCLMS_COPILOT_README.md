# GCLMS — Course Management Module Refactor
> Copilot Reference README · GroomingCenter LMS · Base URL: `http://localhost:8089`

All endpoints require a Bearer token unless stated otherwise.  
All responses follow the shape: `{ success: boolean, message: string, data: any }`.

---

## Module 1 — Modules CRUD

> Manages the creation and lifecycle of modules within a course.

### Business Rules
- A course can have multiple modules.
- Modules can only be created while the course is **not yet published**.
- A module can only be **published** if it has at least one lesson.
- Deleting a module is only allowed while it is in **draft** status.
- Modules are ordered by `sequenceOrder`.

### Endpoints

#### Create a module
```
POST /api/v1/course/:courseId/modules
```
**Body:**
```json
{
  "title": "Module 1: Introduction to Grooming",
  "description": "This module covers the basics of grooming.",
  "sequenceOrder": 1,
  "status": "active"
}
```
**Response (201):** Returns the created module object with `id`, `courseId`, `title`, `description`, `sequenceOrder`, `status`, `createdAt`, `updatedAt`.  
**Errors:** `400` course already published · `401` unauthorized · `404` course not found.

---

#### List all modules in a course
```
GET /api/v1/course/:courseId/modules
```
**Response (200):** Array of module objects ordered by `sequenceOrder`.

---

#### Get a single module
```
GET /api/v1/course/:courseId/modules/:moduleId
```
**Response (200):** Single module object.  
**Errors:** `404` module or course not found.

---

#### Update a module
```
PUT /api/v1/modules/:moduleId
```
**Body (all fields optional):**
```json
{
  "title": "Updated Module Title",
  "description": "Updated description",
  "sequenceOrder": 2,
  "status": "draft"
}
```
**Response (200):** Updated module object.

---

#### Delete a module
```
DELETE /api/v1/modules/:moduleId
```
> Only allowed if module is in `draft` status.

---

#### Publish a module
```
PATCH /api/v1/modules/:moduleId/publish
```
> Requires at least one lesson to exist in the module.

---

#### Unpublish a module
```
PATCH /api/v1/modules/:moduleId/unpublish
```
> Reverts module back to `draft`.

---

## Module 2 — Lessons

> Manages lesson content within a module. Lessons are **mandatory** for publishing a module.

### Business Rules
- Lessons are scoped to both a `courseId` and `moduleId`. If only `moduleId` is provided, `courseId` is derived automatically.
- File upload is **required** when creating a lesson (`multipart/form-data`).
- Supported file types: PDF, Word, PPT, Video, Audio.
- Lessons have optional `startTime` and `endTime` to control student access windows.

### Endpoints

#### Create a lesson
```
POST /api/v1/lesson/create
Content-Type: multipart/form-data
```
**Form fields:**
| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | string | ✅ | |
| `content` | string | ✅ | |
| `courseId` | uuid | Conditional | Required if `moduleId` not provided |
| `moduleId` | uuid | Conditional | Required if `courseId` not provided |
| `lessonTypeId` | uuid | ✅ | |
| `startTime` | string | ❌ | ISO datetime |
| `endTime` | string | ❌ | ISO datetime |
| `file` | binary | ✅ | PDF, Word, PPT, Video, Audio |

**Response (201):** Returns `id`, `title`, `courseId`, `moduleId`, `lessonTypeId`.  
**Errors:** `400` missing file or lesson already exists · `404` course or module not found.

---

#### List all lessons in a module
```
GET /api/v1/lesson/module/:moduleId
```
**Response (200):**
```json
{
  "data": [
    { "id": "...", "title": "...", "moduleId": "...", "courseId": "...", "active": true }
  ]
}
```

---

## Module 3 — Assessments

> Quiz-style evaluations scoped to a module. Optional for module publishing.

### Business Rules
- An assessment is scoped to a `courseId` and/or `moduleId`. Providing only `moduleId` auto-derives `courseId`.
- Each student can only submit answers **once** per assessment.
- Scores are calculated automatically on submission.
- Tracking assessment results contributes to module progress.

### Endpoints

#### Create an assessment
```
POST /api/v1/assessment/create
```
**Body:**
```json
{
  "title": "Assessment 1",
  "courseId": "uuid",
  "moduleId": "uuid",
  "duration": 30,
  "amountOfQuestions": 10,
  "startTime": "2026-06-01T09:00:00.000Z"
}
```
**Response (201):** Returns assessment object with `id`, `title`, `courseId`, `moduleId`, `duration`, `amountOfQuestions`, `startTime`.  
**Errors:** `400` assessment already exists · `404` course or module not found.

---

#### List assessments in a module
```
GET /api/v1/assessment/module/:moduleId
```
**Response (200):** Array of assessment objects.

---

#### Submit assessment answers (student)
```
POST /api/v1/assessment/scoresheet/create
```
**Body:**
```json
{
  "assessmentId": "uuid",
  "courseId": "uuid",
  "assessmentQuestionsId": ["uuid"],
  "assessmentOptionsId": ["uuid"]
}
```
**Response (201):** Returns scoresheet with `id`, `assessmentId`, `userId`, `courseId`, `moduleId`, `score`.  
**Errors:** `400` already submitted or invalid question ID.

---

## Module 4 — Examinations

> Formal end-of-module or end-of-course evaluations. Optional for module publishing.

### Business Rules
- Only **one examination** is allowed per course.
- Scoped to a `courseId` and/or `moduleId`. If only `moduleId` provided, `courseId` is derived.
- Longer duration and more questions than assessments by convention.

### Endpoints

#### Create an examination
```
POST /api/v1/examination/create
```
**Body:**
```json
{
  "title": "Final Examination",
  "courseId": "uuid",
  "moduleId": "uuid",
  "duration": 60,
  "amountOfQuestions": 20,
  "startTime": "2026-07-15T09:00:00.000Z"
}
```
**Response (201):** Returns examination object.  
**Errors:** `400` examination limit reached (one per course).

---

#### List examinations in a module
```
GET /api/v1/examination/module/:moduleId
```
**Response (200):** Array of examination objects.

---

#### Submit examination answers (student)
```
POST /api/v1/examination/scoresheet/create
```
Same shape as assessment scoresheet submission.

---

## Module 5 — Projects

> Practical assignments that students submit a file for. Instructors review with inline markup.

### Business Rules
- Projects are optional for module publishing.
- A project must be in **`published`** status before a student can submit.
- Each student can only submit **once** per project.
- Deletion is only allowed while the project is in **`draft`** status.
- Instructor review includes: `grade` (number), `remarks` (string), and `inlineMarkup` (key-value object mapping section/line keys to comments).
- A submission can only be reviewed **once**.

### Endpoints

#### Create a project
```
POST /api/v1/projects/module/:moduleId
```
**Body:**
```json
{
  "title": "Build a Grooming Portfolio",
  "description": "Create a professional portfolio showcasing your work",
  "instructions": "1. Photograph at least 5 sessions\n2. Write a 200-word reflection",
  "dueDate": "2026-06-01T23:59:59.000Z",
  "maxGrade": 100,
  "status": "draft"
}
```
**Response (201):** Returns project object with `id`, `moduleId`, `instructorId`, `title`, `description`, `instructions`, `dueDate`, `maxGrade`, `status`.

---

#### List all projects in a module
```
GET /api/v1/projects/module/:moduleId
```

---

#### Get a single project
```
GET /api/v1/projects/:projectId
```

---

#### Update a project
```
PUT /api/v1/projects/:projectId
```
**Body (all optional):**
```json
{
  "title": "string",
  "description": "string",
  "instructions": "string",
  "dueDate": "ISO datetime",
  "maxGrade": 100,
  "status": "draft"
}
```

---

#### Delete a project
```
DELETE /api/v1/projects/:projectId
```
> Only allowed in `draft` status.

---

## Module 6 — Project Submissions

> Handles student submission of project files and instructor review.

### Endpoints

#### Student submits a project
```
POST /api/v1/projects/:projectId/submissions
```
**Body:**
```json
{
  "submissionUrl": "https://drive.google.com/file/d/example/view"
}
```
**Response (201):** Returns submission with `id`, `projectId`, `userId`, `submissionUrl`, `submittedAt`, `status`.  
**Errors:** `400` project not published · `400` duplicate submission.

---

#### List all submissions for a project (instructor/admin only)
```
GET /api/v1/projects/:projectId/submissions
```

---

#### Get a single submission
```
GET /api/v1/submissions/:submissionId
```

---

#### Instructor adds inline markup review
```
POST /api/v1/submissions/:submissionId/reviews
```
**Body:**
```json
{
  "grade": 85,
  "remarks": "Great work overall. Good structure and clear explanations.",
  "inlineMarkup": {
    "section_intro": "Strong opening paragraph",
    "section_3": "Needs more detail here"
  }
}
```
**Response (201):** Returns review with `id`, `submissionId`, `reviewerId`, `grade`, `remarks`, `inlineMarkup`, `reviewedAt`.  
**Errors:** `400` already reviewed.

---

#### Get the review for a submission
```
GET /api/v1/submissions/:submissionId/reviews
```

---

## Module 7 — Progress Tracking

> Tracks student completion per module and aggregates to a course completion rate.

### Business Rules
- Lessons **must** be completed to mark a module as complete.
- Optional content (assessments, exams, projects) contributes to module progress but is not blocking.
- Course completion formula:  
  `Course Completion = (Completed Modules / Total Modules) × 100`

### Endpoints

#### Get student's course completion rate
```
GET /api/v1/course/:courseId/progress
```
> Returns the authenticated student's overall completion % for the course.

---

#### Get student's progress for a specific module
```
GET /api/v1/modules/:moduleId/progress
```
> Returns the authenticated student's progress within a single module.

---

## Module 8 — Approval Workflows

> All published courses must go through a supervisor approval workflow before students can access them.

### Business Rules
- Instructor submits course for approval via a workflow.
- Supervisor can **approve**, **reject**, or **escalate** a pending workflow.
- Once approved, the course can be published via the publish endpoint.
- Admin can track all workflows and generate KPI reports.
- Every workflow action is recorded in an audit log.

### Endpoints

#### Submit a workflow for approval
```
POST /api/v1/workflows/submit
```
**Body:**
```json
{
  "request_type": "CourseApproval",
  "content_id": "uuid",
  "content_title": "New Course Request",
  "supervisor_id": "uuid",
  "description": "Please review and approve this course",
  "attachment_url": "https://example.com/files/course-outline.pdf"
}
```
**Response (201):** `{ success: true, message: string, data: {} }`

---

#### Get pending workflows for a supervisor
```
GET /api/v1/workflows/pending/:supervisor_id
```

---

#### Review a workflow (approve / reject / escalate)
```
POST /api/v1/workflows/review
```

---

#### Publish an approved workflow
```
POST /api/v1/workflows/publish
```

---

#### Track all workflows (admin only)
```
GET /api/v1/workflows/track
```
> Supports optional filters.

---

#### Get workflow KPI report (admin only)
```
GET /api/v1/workflows/report
```

---

#### Get audit log for a workflow
```
GET /api/v1/workflows/audit/:workflow_id
```

---

## Quick Reference — All Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/course/:courseId/modules` | Create module |
| `GET` | `/api/v1/course/:courseId/modules` | List modules |
| `GET` | `/api/v1/course/:courseId/modules/:moduleId` | Get module |
| `PUT` | `/api/v1/modules/:moduleId` | Update module |
| `DELETE` | `/api/v1/modules/:moduleId` | Delete module (draft only) |
| `PATCH` | `/api/v1/modules/:moduleId/publish` | Publish module |
| `PATCH` | `/api/v1/modules/:moduleId/unpublish` | Unpublish module |
| `POST` | `/api/v1/lesson/create` | Create lesson (multipart) |
| `GET` | `/api/v1/lesson/module/:moduleId` | List lessons |
| `POST` | `/api/v1/assessment/create` | Create assessment |
| `GET` | `/api/v1/assessment/module/:moduleId` | List assessments |
| `POST` | `/api/v1/assessment/scoresheet/create` | Submit assessment answers |
| `POST` | `/api/v1/examination/create` | Create examination |
| `GET` | `/api/v1/examination/module/:moduleId` | List examinations |
| `POST` | `/api/v1/examination/scoresheet/create` | Submit exam answers |
| `POST` | `/api/v1/projects/module/:moduleId` | Create project |
| `GET` | `/api/v1/projects/module/:moduleId` | List projects |
| `GET` | `/api/v1/projects/:projectId` | Get project |
| `PUT` | `/api/v1/projects/:projectId` | Update project |
| `DELETE` | `/api/v1/projects/:projectId` | Delete project (draft only) |
| `POST` | `/api/v1/projects/:projectId/submissions` | Student submits project |
| `GET` | `/api/v1/projects/:projectId/submissions` | List submissions |
| `GET` | `/api/v1/submissions/:submissionId` | Get submission |
| `POST` | `/api/v1/submissions/:submissionId/reviews` | Instructor review |
| `GET` | `/api/v1/submissions/:submissionId/reviews` | Get review |
| `GET` | `/api/v1/course/:courseId/progress` | Course completion rate |
| `GET` | `/api/v1/modules/:moduleId/progress` | Module progress |
| `POST` | `/api/v1/workflows/submit` | Submit approval workflow |
| `GET` | `/api/v1/workflows/pending/:supervisor_id` | Pending workflows |
| `POST` | `/api/v1/workflows/review` | Review workflow |
| `POST` | `/api/v1/workflows/publish` | Publish approved workflow |
| `GET` | `/api/v1/workflows/track` | Track all workflows |
| `GET` | `/api/v1/workflows/report` | Workflow KPI report |
| `GET` | `/api/v1/workflows/audit/:workflow_id` | Workflow audit log |
