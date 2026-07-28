# TC02 – Edit and Save Course Content

## Overview

This module covers the complete lifecycle of editing and saving course content in the LMS — from updating a course's metadata through modifying modules, lessons, assessments, and examinations, to publishing or unpublishing content. Every edit form maps to a specific API endpoint; this document explains exactly what is sent, what is returned, and what the UI must do at each step.

**Base URL (Production):** `https://gclms.xanotech.org`  
**Base URL (Local):** `http://localhost:8089`  
**Authentication:** All endpoints require `Authorization: Bearer <JWT>`

---

## Table of Contents

1. [Content Hierarchy](#1-content-hierarchy)
2. [API Endpoints Reference](#2-api-endpoints-reference)
3. [Course Editing](#3-course-editing)
4. [Module Editing](#4-module-editing)
5. [Lesson Editing](#5-lesson-editing)
6. [Assessment Editing](#6-assessment-editing)
7. [Examination Editing](#7-examination-editing)
8. [Stand-Alone Examination Editing](#8-stand-alone-examination-editing)
9. [Publish & Unpublish Rules](#9-publish--unpublish-rules)
10. [Complete Step-by-Step Edit Flow](#10-complete-step-by-step-edit-flow)
11. [Field Definitions](#11-field-definitions)
12. [Status Values](#12-status-values)
13. [Validation Rules](#13-validation-rules)
14. [Error Handling](#14-error-handling)

---

## 1. Content Hierarchy

Edits can be made at any level of the following structure. Each level has its own set of endpoints.

```
Course
  └── Module(s)
        ├── Lesson(s)
        ├── Assessment(s)
        │     └── Assessment Question(s)
        └── Examination(s)
              └── Examination Question(s)

Stand-Alone Examination (not tied to a module)
  └── Stand-Alone Exam Question(s)
```

---

## 2. API Endpoints Reference

| #   | Method   | Endpoint                                                         | What it does                              |
| --- | -------- | ---------------------------------------------------------------- | ----------------------------------------- |
| 1   | `PATCH`  | `/api/v1/course/edit/{id}`                                       | Edit course metadata                      |
| 2   | `PATCH`  | `/api/v1/course/publish/{courseId}`                              | Publish a course                          |
| 3   | `PATCH`  | `/api/v1/course/unpublish/{courseId}`                            | Unpublish a course                        |
| 4   | `GET`    | `/api/v1/course/admin/details/{courseId}`                        | Load course data into edit form           |
| 5   | `POST`   | `/api/v1/course/{courseId}/modules`                              | Add a new module to a course              |
| 6   | `GET`    | `/api/v1/course/{courseId}/modules`                              | List modules in a course                  |
| 7   | `GET`    | `/api/v1/course/{courseId}/modules/{moduleId}`                   | Load a single module into edit form       |
| 8   | `PUT`    | `/api/v1/modules/{moduleId}`                                     | Edit a module                             |
| 9   | `DELETE` | `/api/v1/modules/{moduleId}`                                     | Delete a module (draft only)              |
| 10  | `PATCH`  | `/api/v1/modules/{moduleId}/publish`                             | Publish a module                          |
| 11  | `PATCH`  | `/api/v1/modules/{moduleId}/unpublish`                           | Unpublish a module                        |
| 12  | `POST`   | `/api/v1/lesson/create`                                          | Create / save a new lesson                |
| 13  | `GET`    | `/api/v1/lesson/{lessonId}`                                      | Load a lesson into edit form              |
| 14  | `GET`    | `/api/v1/lesson/module/{moduleId}`                               | List lessons in a module                  |
| 15  | `PATCH`  | `/api/v1/assessment/edit/{assessmentId}`                         | Edit assessment settings                  |
| 16  | `PATCH`  | `/api/v1/assessment/question/edit`                               | Edit a question inside an assessment      |
| 17  | `PATCH`  | `/api/v1/examination/edit/{courseId}`                            | Edit a course-linked examination          |
| 18  | `PATCH`  | `/api/v1/examination/question/edit`                              | Edit a question inside an examination     |
| 19  | `PATCH`  | `/api/v1/stand-alone-examination/edit/{standAloneExaminationId}` | Edit a stand-alone examination            |
| 20  | `PATCH`  | `/api/v1/stand-alone-examination-question/edit`                  | Edit a question inside a stand-alone exam |

---

## 3. Course Editing

### Load Course Into Edit Form

**Endpoint:** `GET /api/v1/course/admin/details/{courseId}`  
**When called:** When an instructor or admin opens the course edit page.  
**Path param:** `courseId` (UUID)

The response populates every field in the edit form. The UI should pre-fill all editable controls with the returned values before the user makes any changes.

---

### Save Course Edits

**Endpoint:** `PATCH /api/v1/course/edit/{id}`  
**When called:** User clicks **Save Changes** on the course edit form.  
**Path param:** `id` — Course UUID

All fields are optional. Only send the fields that changed.

**Request Body**

| Field         | Type         | Required | Description                                                |
| ------------- | ------------ | -------- | ---------------------------------------------------------- |
| `title`       | string       | No       | Updated course title                                       |
| `description` | string       | No       | Updated course description                                 |
| `thumbnail`   | string (URL) | No       | New thumbnail image URL                                    |
| `duration`    | integer      | No       | Course duration (days/hours — unit set by platform config) |
| `timeline`    | integer      | No       | Course timeline value                                      |

**Sample Request**

```json
PATCH /api/v1/course/edit/3fa85f64-5717-4562-b3fc-2c963f66afa6

{
  "title": "Introduction to Crop Science — Revised",
  "description": "Updated for the 2026 curriculum.",
  "duration": 30
}
```

**Sample Response (`200 OK`)**

```json
{
  "success": true,
  "message": "Course updated successfully",
  "data": { ... }
}
```

**Response Codes**

| Code  | UI Behavior                                                           |
| ----- | --------------------------------------------------------------------- |
| `200` | Show success toast: _"Course saved."_ Refresh the course detail view. |
| `400` | Show inline validation error from `message` field                     |
| `401` | Redirect to login                                                     |
| `403` | Show "You don't have permission to edit this course"                  |
| `404` | Show "Course not found"                                               |
| `500` | Show error banner with Retry button                                   |

---

### Publish a Course

**Endpoint:** `PATCH /api/v1/course/publish/{courseId}`  
**When called:** Admin clicks the **Publish** button on the course page.  
**Path param:** `courseId` (UUID). No request body.

**Constraints (enforced server-side):**

- The course must have at least one published module.
- Course must be in `draft` status.

**Response Codes**

| Code  | UI Behavior                                                                                 |
| ----- | ------------------------------------------------------------------------------------------- |
| `200` | Status badge changes: `Draft` → `Published`. Publish button replaced with Unpublish button. |
| `400` | Show error (e.g., _"Course has no published modules."_)                                     |
| `404` | Show "Course not found"                                                                     |

---

### Unpublish a Course

**Endpoint:** `PATCH /api/v1/course/unpublish/{courseId}`  
**When called:** Admin clicks **Unpublish**.  
**Path param:** `courseId` (UUID). No request body.

Status reverts to `draft`. Enrolled students lose access until the course is re-published.

---

## 4. Module Editing

### Add a New Module

**Endpoint:** `POST /api/v1/course/{courseId}/modules`  
**When called:** Instructor clicks **Add Module** within a course.  
**Path param:** `courseId` (UUID)

**Request Body**

| Field           | Type    | Required | Description                                |
| --------------- | ------- | -------- | ------------------------------------------ |
| `title`         | string  | **Yes**  | Module title                               |
| `description`   | string  | No       | Module description                         |
| `sequenceOrder` | integer | No       | Display order — auto-increments if omitted |
| `status`        | string  | No       | `draft` (default), `active`, or `archived` |

**Sample Request**

```json
POST /api/v1/course/3fa85f64-5717-4562-b3fc-2c963f66afa6/modules

{
  "title": "Module 1: Soil Preparation",
  "description": "Introduction to soil types and preparation methods.",
  "sequenceOrder": 1
}
```

**Sample Response (`201 Created`)**

```json
{
  "success": true,
  "message": "Module created successfully",
  "data": {
    "id": "module-uuid",
    "courseId": "course-uuid",
    "title": "Module 1: Soil Preparation",
    "description": "Introduction to soil types and preparation methods.",
    "sequenceOrder": 1,
    "status": "draft",
    "createdAt": "2026-05-20T10:00:00Z",
    "updatedAt": "2026-05-20T10:00:00Z"
  }
}
```

---

### Load a Module Into Edit Form

**By course context:** `GET /api/v1/course/{courseId}/modules/{moduleId}`  
**When called:** Instructor opens a module's edit form.

---

### Save Module Edits

**Endpoint:** `PUT /api/v1/modules/{moduleId}`  
**When called:** Instructor clicks **Save** on the module edit form.  
**Path param:** `moduleId` (UUID)

All fields are optional.

**Request Body**

| Field           | Type    | Required | Description                         |
| --------------- | ------- | -------- | ----------------------------------- |
| `title`         | string  | No       | Updated module title                |
| `description`   | string  | No       | Updated description                 |
| `sequenceOrder` | integer | No       | Updated display order               |
| `status`        | string  | No       | `draft`, `published`, or `archived` |

**Sample Request**

```json
PUT /api/v1/modules/3fa85f64-5717-4562-b3fc-2c963f66afa7

{
  "title": "Module 1: Soil Preparation — Updated",
  "sequenceOrder": 1
}
```

**Sample Response (`200 OK`)**

```json
{
  "success": true,
  "message": "Module updated successfully",
  "data": { ... }
}
```

---

### Delete a Module

**Endpoint:** `DELETE /api/v1/modules/{moduleId}`  
**When called:** Instructor clicks the **Delete** button on a draft module.  
**Constraint:** Only modules with `status: "draft"` can be deleted. The Delete button must not be shown for published or archived modules.

**Response Codes**

| Code  | UI Behavior                                                 |
| ----- | ----------------------------------------------------------- |
| `200` | Remove module from the list; show _"Module deleted."_ toast |
| `400` | Show error: _"Only draft modules can be deleted."_          |
| `404` | Show "Module not found"                                     |

---

### Publish a Module

**Endpoint:** `PATCH /api/v1/modules/{moduleId}/publish`  
**When called:** Instructor clicks **Publish** on a module.  
**Path param:** `moduleId` (UUID). No request body.

**Constraint:** The module must contain at least one lesson before it can be published.

**Response Codes**

| Code  | UI Behavior                                                                  |
| ----- | ---------------------------------------------------------------------------- |
| `200` | Status badge: `draft` → `published`. Publish button replaced with Unpublish. |
| `400` | Show error: _"Add at least one lesson before publishing this module."_       |
| `403` | Access denied                                                                |
| `404` | Module not found                                                             |

---

### Unpublish a Module

**Endpoint:** `PATCH /api/v1/modules/{moduleId}/unpublish`  
**When called:** Instructor clicks **Unpublish**.  
**Path param:** `moduleId` (UUID). No request body.

Status reverts to `draft`. If the parent course was published, unpublishing a module does not automatically unpublish the course, but the module's content will no longer be accessible.

---

## 5. Lesson Editing

### Create / Save a Lesson

**Endpoint:** `POST /api/v1/lesson/create`  
**When called:** Instructor clicks **Save** on the lesson editor (new or re-saved lesson).

> There is no standalone `PATCH /lesson/{lessonId}` endpoint. To update an existing lesson, the content is re-saved through `POST /api/v1/lesson/create` with the updated fields.

**Request Body**

| Field          | Type         | Required    | Description                                                                   |
| -------------- | ------------ | ----------- | ----------------------------------------------------------------------------- |
| `title`        | string       | **Yes**     | Lesson title                                                                  |
| `content`      | string       | **Yes**     | Lesson body — rich text, HTML, or plain text                                  |
| `courseId`     | UUID         | Conditional | Required if `moduleId` is not provided                                        |
| `moduleId`     | UUID         | Conditional | Required if `courseId` is not provided; `courseId` is derived from the module |
| `lessonTypeId` | UUID         | **Yes**     | Lesson type (text, video, SCORM, PDF, etc.)                                   |
| `startTime`    | datetime     | No          | Start time for time-gated lessons                                             |
| `endTime`      | datetime     | No          | End time for time-gated lessons                                               |
| `file`         | string (URL) | **Yes**     | Uploaded file URL (PDF, video, SCORM, image)                                  |

> At least one of `courseId` or `moduleId` must be present. If `moduleId` is provided, the backend derives `courseId` automatically.

**Sample Request**

```json
POST /api/v1/lesson/create

{
  "title": "Soil pH Testing Methods",
  "content": "<p>Learn how to test soil pH using digital and paper-based methods.</p>",
  "moduleId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
  "lessonTypeId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
  "file": "https://cdn.example.com/lessons/soil-ph.pdf"
}
```

**Sample Response (`201 Created`)**

```json
{
  "success": true,
  "message": "Lesson created successfully",
  "data": { ... }
}
```

---

### Load a Lesson Into Edit Form

**Endpoint:** `GET /api/v1/lesson/{lessonId}`  
**When called:** Instructor clicks Edit on a lesson. Pre-fills the lesson editor with existing content.

**List Lessons in a Module**

**Endpoint:** `GET /api/v1/lesson/module/{moduleId}`  
**When called:** Opening the lesson management view inside a module.

---

## 6. Assessment Editing

### Save Assessment Settings

**Endpoint:** `PATCH /api/v1/assessment/edit/{assessmentId}`  
**When called:** Instructor edits assessment settings and clicks **Save**.  
**Path param:** `assessmentId` (UUID)

All fields are optional. Only send the fields that changed.

**Request Body**

| Field               | Type     | Required | Description                                                                                                                              |
| ------------------- | -------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `title`             | string   | No       | Assessment title                                                                                                                         |
| `courseId`          | UUID     | No       | Parent course                                                                                                                            |
| `duration`          | integer  | No       | Duration in minutes                                                                                                                      |
| `amountOfQuestions` | integer  | No       | Number of questions                                                                                                                      |
| `startTime`         | datetime | No       | When the assessment opens                                                                                                                |
| `sections`          | array    | No       | Section list — each item needs a `name` and `type`. Questions referencing an existing section name retain their assignment.              |
| `markingMode`       | string   | No       | `automatic` — system grades on submit; `manual` — instructor grades every question; `hybrid` — per-question `markingType` takes priority |
| `totalMarks`        | integer  | No       | Override the marks denominator for percentage scoring. Defaults to sum of question marks if omitted.                                     |

**Sample Request**

```json
PATCH /api/v1/assessment/edit/3fa85f64-5717-4562-b3fc-2c963f66afa9

{
  "title": "Module 1 Quiz — Revised",
  "duration": 45,
  "markingMode": "hybrid",
  "totalMarks": 50
}
```

**Sample Response (`200 OK`)**

```json
{
  "success": true,
  "message": "Assessment updated",
  "data": { ... }
}
```

---

### Edit an Assessment Question

**Endpoint:** `PATCH /api/v1/assessment/question/edit`  
**When called:** Instructor edits a question within the assessment question bank and clicks **Save**.

**Request Body**

| Field         | Type         | Required | Description                                                          |
| ------------- | ------------ | -------- | -------------------------------------------------------------------- |
| `questionId`  | UUID         | **Yes**  | The question to update                                               |
| `question`    | string       | No       | Updated question text                                                |
| `section`     | string       | No       | Section name — must match a section defined on the parent assessment |
| `markingType` | string       | No       | `automatic`, `manual`, or `hybrid`                                   |
| `options`     | string       | No       | JSON-encoded array of option updates (for MCQ)                       |
| `image`       | string (URL) | No       | Image to attach to the question; set to `null` to remove             |

**Sample Request**

```json
PATCH /api/v1/assessment/question/edit

{
  "questionId": "3fa85f64-5717-4562-b3fc-2c963f66afb0",
  "question": "Which soil type retains water best?",
  "section": "Section A",
  "markingType": "automatic",
  "options": "[{\"label\":\"A\",\"text\":\"Sandy\",\"isCorrect\":false},{\"label\":\"B\",\"text\":\"Clay\",\"isCorrect\":true}]"
}
```

---

## 7. Examination Editing

### Save Examination Settings

**Endpoint:** `PATCH /api/v1/examination/edit/{courseId}`  
**When called:** Admin edits an examination linked to a course and clicks **Save**.  
**Path param:** `courseId` (UUID) — identifies the course-linked examination.

> **Important:** Examination settings can only be edited while the exam is in `draft` status. Once published, all fields are locked.

All fields are optional.

**Request Body**

| Field                   | Type     | Required | Description                                                                                                        |
| ----------------------- | -------- | -------- | ------------------------------------------------------------------------------------------------------------------ |
| `title`                 | string   | No       | Examination title                                                                                                  |
| `duration`              | integer  | No       | Duration in minutes                                                                                                |
| `amountOfQuestions`     | integer  | No       | Number of questions to serve                                                                                       |
| `startTime`             | datetime | No       | Examination open time                                                                                              |
| `sections`              | array    | No       | Replace section structure (1–10 sections allowed)                                                                  |
| `navigationMode`        | string   | No       | `free` — any order; `forward-only` — no going back; `section-locked` — must complete each section before moving on |
| `randomizationConfig`   | object   | No       | Question and option shuffle settings                                                                               |
| `uiSettings`            | object   | No       | Display preferences                                                                                                |
| `toolsEnabled`          | object   | No       | Enable/disable calculator, notes, etc.                                                                             |
| `accessibilitySettings` | object   | No       | Screen reader, font size, contrast options                                                                         |
| `submissionSettings`    | object   | No       | Auto-submit on timer, confirm-before-submit prompt                                                                 |

**Sample Request**

```json
PATCH /api/v1/examination/edit/3fa85f64-5717-4562-b3fc-2c963f66afa6

{
  "title": "Microfinance Final Exam — Updated",
  "duration": 120,
  "navigationMode": "forward-only",
  "randomizationConfig": {
    "shuffleQuestions": true,
    "shuffleOptions": true
  }
}
```

**Sample Response (`200 OK`)**

```json
{
  "success": true,
  "message": "Examination updated successfully",
  "data": { ... }
}
```

---

### Edit an Examination Question

**Endpoint:** `PATCH /api/v1/examination/question/edit`  
**When called:** Instructor edits a question in the examination question bank.

**Request Body**

| Field             | Type          | Required | Description                                            |
| ----------------- | ------------- | -------- | ------------------------------------------------------ |
| `questionId`      | UUID          | **Yes**  | The question to update                                 |
| `question`        | string        | No       | Updated question text                                  |
| `section`         | string        | No       | Section name — must match a section on the examination |
| `markingType`     | string        | No       | `automatic`, `manual`, or `hybrid`                     |
| `questionType`    | string        | No       | e.g., `mcq`, `essay`, `true_false`, `short_answer`     |
| `rubric`          | string (JSON) | No       | Grading rubric for essay/manual questions              |
| `difficultyLevel` | string        | No       | `Easy`, `Medium`, or `Hard`                            |
| `bloomLevel`      | string        | No       | Bloom's taxonomy level                                 |
| `options`         | string        | No       | JSON-encoded array of option updates (for MCQ)         |
| `image`           | string (URL)  | No       | Image to attach; set to `null` to remove               |

**Sample Request**

```json
PATCH /api/v1/examination/question/edit

{
  "questionId": "3fa85f64-5717-4562-b3fc-2c963f66afb1",
  "question": "Explain the role of microfinance in poverty reduction.",
  "questionType": "essay",
  "difficultyLevel": "Hard",
  "bloomLevel": "Analysis",
  "markingType": "manual",
  "rubric": "{\"criteria\":[{\"name\":\"Clarity\",\"marks\":5},{\"name\":\"Depth\",\"marks\":5}]}"
}
```

---

## 8. Stand-Alone Examination Editing

A stand-alone examination is not tied to a course module. It has its own edit and question-edit endpoints.

### Save Stand-Alone Examination Settings

**Endpoint:** `PATCH /api/v1/stand-alone-examination/edit/{standAloneExaminationId}`  
**Path param:** `standAloneExaminationId` (UUID)

All fields are optional.

**Request Body**

| Field               | Type     | Required | Description                                                   |
| ------------------- | -------- | -------- | ------------------------------------------------------------- |
| `title`             | string   | No       | Examination title                                             |
| `duration`          | integer  | No       | Duration in minutes                                           |
| `amountOfQuestions` | integer  | No       | Number of questions                                           |
| `startTime`         | datetime | No       | Exam open time                                                |
| `isPublished`       | boolean  | No       | Set to `true` to publish directly via this edit call          |
| `sections`          | array    | No       | Replace the section list for this examination                 |
| `markingMode`       | string   | No       | `automatic`, `manual`, or `hybrid`                            |
| `totalMarks`        | integer  | No       | Override marks denominator; defaults to sum of question marks |

**Sample Request**

```json
PATCH /api/v1/stand-alone-examination/edit/3fa85f64-5717-4562-b3fc-2c963f66afb2

{
  "title": "Data Privacy Certification Exam — Rev 2",
  "duration": 90,
  "totalMarks": 100,
  "markingMode": "automatic"
}
```

---

### Edit a Stand-Alone Examination Question

**Endpoint:** `PATCH /api/v1/stand-alone-examination-question/edit`

**Request Body**

| Field                            | Type   | Required | Description                                                 |
| -------------------------------- | ------ | -------- | ----------------------------------------------------------- |
| `standAloneExaminationQuestionId` | UUID   | **Yes**  | The question to update (NOT `questionId` — confirmed against the live backend, which rejects `questionId` with "Please provide a valid stand alone examination question Id") |
| `question`                       | string | No       | Updated question text                                       |
| `section`                        | string | No       | Section name — must match a section on the stand-alone exam |
| `markingType`                    | string | No       | `automatic`, `manual`, or `hybrid`                           |
| `options`                        | array  | No       | Answer options (for MCQ)                                    |

**Sample Request**

```json
PATCH /api/v1/stand-alone-examination-question/edit

{
  "standAloneExaminationQuestionId": "3fa85f64-5717-4562-b3fc-2c963f66afb3",
  "question": "What does GDPR stand for?",
  "markingType": "automatic",
  "options": [
    { "label": "A", "text": "General Data Protection Regulation", "isCorrect": true },
    { "label": "B", "text": "Global Data Privacy Rule", "isCorrect": false }
  ]
}
```

---

## 9. Publish & Unpublish Rules

| Content Level | Publish Endpoint                    | Unpublish Endpoint                              | Constraint                     |
| ------------- | ----------------------------------- | ----------------------------------------------- | ------------------------------ |
| Course        | `PATCH /course/publish/{courseId}`  | `PATCH /course/unpublish/{courseId}`            | Must have ≥ 1 published module |
| Module        | `PATCH /modules/{moduleId}/publish` | `PATCH /modules/{moduleId}/unpublish`           | Must have ≥ 1 lesson           |
| Examination   | `isPublished: true` in edit body    | `isPublished: false` in edit body (stand-alone) | Settings locked once published |

**Status transition rules:**

- Content starts in `draft` on create.
- Only `draft` content can be edited freely.
- Published content is visible to enrolled students; draft content is not.
- A module in `draft` cannot be deleted if it has lessons — lessons must be removed first.
- An examination in `published` state cannot have its settings edited — it must be taken out of its published state first (if the exam type supports it).

---

## 10. Complete Step-by-Step Edit Flow

This flow walks through the most common end-to-end edit scenario: an instructor updating a lesson inside a published module, then saving and re-publishing.

```
1. Instructor opens the course management page
   → GET /api/v1/course/admin/details/{courseId}
   ← Course data loaded; all modules listed

2. Instructor clicks a module to expand it
   → GET /api/v1/course/{courseId}/modules/{moduleId}
   ← Module details loaded

3. Instructor sees the list of lessons
   → GET /api/v1/lesson/module/{moduleId}
   ← Lesson list rendered

4. Instructor clicks Edit on a lesson
   → GET /api/v1/lesson/{lessonId}
   ← Lesson content loaded into the editor

5. Instructor updates the lesson text and replaces the file attachment

6. Instructor clicks Save
   → POST /api/v1/lesson/create   (with updated title, content, file, moduleId)
   ← 201: new lesson record saved

7. Instructor edits the assessment inside the same module
   → PATCH /api/v1/assessment/edit/{assessmentId}
      Body: { "duration": 45, "totalMarks": 50 }
   ← 200: assessment updated

8. Instructor updates a question inside the assessment
   → PATCH /api/v1/assessment/question/edit
      Body: { "questionId": "...", "question": "Updated question text?" }
   ← 200: question saved

9. Module was published — instructor unpublishes it to apply changes
   → PATCH /api/v1/modules/{moduleId}/unpublish
   ← 200: module status → draft

10. Instructor re-publishes the module once edits are confirmed
    → PATCH /api/v1/modules/{moduleId}/publish
    ← 200: module status → published

11. If the parent course also needs a status refresh:
    → PATCH /api/v1/course/publish/{courseId}
    ← 200: course status → published
```

---

### Examination Edit Flow (Draft Constraint)

```
1. Admin opens the course examination edit page
   → PATCH /api/v1/examination/edit/{courseId}  is available only if exam is draft

2. Admin updates settings and saves
   → PATCH /api/v1/examination/edit/{courseId}
      Body: { "duration": 120, "navigationMode": "forward-only" }
   ← 200: exam updated

3. Admin edits a question in the exam
   → PATCH /api/v1/examination/question/edit
      Body: { "questionId": "...", "difficultyLevel": "Hard" }
   ← 200: question updated

4. Once all edits are complete, the exam is published
   (via the exam publish mechanism — the edit endpoint locks after publish)
```

---

## 11. Field Definitions

| Field                               | Type           | Description                                                                                |
| ----------------------------------- | -------------- | ------------------------------------------------------------------------------------------ |
| `id` / `courseId` / `moduleId` etc. | UUID           | Unique identifier for the resource                                                         |
| `title`                             | string         | Human-readable name of the content item                                                    |
| `description`                       | string         | Supporting description or summary                                                          |
| `content`                           | string         | Full body of a lesson (HTML, rich text, or plain text)                                     |
| `sequenceOrder`                     | integer        | Display order of a module within its course; auto-increments if omitted                    |
| `status`                            | string         | Lifecycle state — see [Section 12](#12-status-values)                                      |
| `lessonTypeId`                      | UUID           | Determines how the lesson is rendered (text, video, SCORM, PDF, etc.)                      |
| `file`                              | string (URL)   | URL of the uploaded lesson file                                                            |
| `startTime`                         | ISO 8601       | When a lesson, assessment, or exam becomes available                                       |
| `endTime`                           | ISO 8601       | When a time-gated lesson closes                                                            |
| `duration`                          | integer        | Duration in minutes (assessments and examinations)                                         |
| `amountOfQuestions`                 | integer        | Number of questions to serve in an assessment or exam                                      |
| `markingMode`                       | string         | `automatic`, `manual`, or `hybrid` — controls how answers are graded                       |
| `totalMarks`                        | integer        | Denominator used when computing percentage scores; defaults to sum of question marks       |
| `sections`                          | array          | Section structure for assessments/exams; each section has a `name` and `type`              |
| `navigationMode`                    | string         | `free`, `forward-only`, or `section-locked` — controls how students move between questions |
| `randomizationConfig`               | object         | Controls whether questions and/or options are shuffled per attempt                         |
| `uiSettings`                        | object         | Visual display preferences for the exam interface                                          |
| `toolsEnabled`                      | object         | Which tools (calculator, notes, etc.) students can use during the exam                     |
| `accessibilitySettings`             | object         | Accessibility options: font size, contrast, screen reader support                          |
| `submissionSettings`                | object         | Auto-submit on timer expiry, confirm-before-submit prompt                                  |
| `isPublished`                       | boolean        | Stand-alone exam only — set to `true` to publish, `false` to draft                         |
| `questionId`                        | UUID           | The specific question to update in a question-edit call                                    |
| `question`                          | string         | Updated question text                                                                      |
| `section`                           | string         | Section name the question belongs to (must match a section on the parent)                  |
| `markingType`                       | string         | Per-question grading: `automatic`, `manual`, or `hybrid`                                   |
| `questionType`                      | string         | `mcq`, `essay`, `true_false`, `short_answer`, `fill_blank`, `matching`                     |
| `difficultyLevel`                   | string         | `Easy`, `Medium`, or `Hard`                                                                |
| `bloomLevel`                        | string         | Bloom's taxonomy cognitive level                                                           |
| `rubric`                            | string (JSON)  | Grading rubric for manual/essay questions                                                  |
| `options`                           | string / array | Answer options for MCQ questions (JSON-encoded string or array)                            |
| `image`                             | string (URL)   | Image attached to a question; set to `null` to remove                                      |

---

## 12. Status Values

### Module Status

| Value       | Meaning                                  | Who sets it                         |
| ----------- | ---------------------------------------- | ----------------------------------- |
| `draft`     | Not visible to students; freely editable | Default on create; set by unpublish |
| `published` | Visible to enrolled students             | Set by publish action               |
| `archived`  | Retired; no longer active                | Admin action                        |

### Course Status

| Value       | Meaning                 |
| ----------- | ----------------------- |
| `draft`     | Not visible to students |
| `published` | Live and accessible     |

### `markingMode`

| Value       | Meaning                                                                                                                             |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `automatic` | System grades all questions on submission                                                                                           |
| `manual`    | Instructor must grade every question manually                                                                                       |
| `hybrid`    | Per-question `markingType` takes priority; automatic questions are system-graded, manual questions are queued for instructor review |

### `navigationMode` (Examinations)

| Value            | Meaning                                                             |
| ---------------- | ------------------------------------------------------------------- |
| `free`           | Students can move to any question at any time                       |
| `forward-only`   | Students can only advance; cannot go back to previous questions     |
| `section-locked` | Students must complete each section fully before moving to the next |

---

## 13. Validation Rules

### Client-Side (before API call)

| Rule                                 | Condition                                                                                   | Message                                                                        |
| ------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Lesson requires module or course     | Neither `courseId` nor `moduleId` provided                                                  | _"Please select a course or module for this lesson."_                          |
| Lesson title required                | `title` is empty                                                                            | _"Lesson title is required."_                                                  |
| Lesson file required                 | `file` is empty                                                                             | _"Please upload a file for this lesson."_                                      |
| Module title required                | `title` is empty on create                                                                  | _"Module title is required."_                                                  |
| Question ID required (question edit) | `questionId` is missing                                                                     | Enforced by UI — question edit form always carries the ID                      |
| Section must match parent            | `section` value in question edit must match a section defined on the parent assessment/exam | Populate the section field from a dropdown of existing sections, not free text |
| Exam edit lock                       | Edit form fields disabled when exam is published                                            | Show read-only banner: _"This exam is published. Settings are locked."_        |
| Module delete guard                  | Delete button not shown when `status !== "draft"`                                           | Render delete button only on draft modules                                     |
| Module publish guard                 | Publish button disabled if module has no lessons                                            | Show tooltip: _"Add at least one lesson before publishing."_                   |
| Stand-alone exam `isPublished`       | Only set `isPublished: true` when all required fields are saved                             | Gate the Publish toggle behind a save confirmation                             |

### Server-Side (API returns `400`)

| Scenario                               | Message shown to user                                                    |
| -------------------------------------- | ------------------------------------------------------------------------ |
| Publish module with no lessons         | _"Module must have at least one lesson before it can be published."_     |
| Delete a non-draft module              | _"Only draft modules can be deleted."_                                   |
| Edit a published examination           | _"Published examinations cannot be edited. Unpublish first."_            |
| Question section does not match parent | _"The section name does not match any section on this assessment/exam."_ |

---

## 14. Error Handling

| HTTP Status     | UI Behavior                                                                        |
| --------------- | ---------------------------------------------------------------------------------- |
| `200` / `201`   | Show success toast; refresh the affected section                                   |
| `400`           | Display the `message` field from the response as an inline form error              |
| `401`           | Clear session state; redirect to login                                             |
| `403`           | Show _"You don't have permission to perform this action."_                         |
| `404`           | Show _"Content not found."_ with a Back button                                     |
| `500`           | Show error banner: _"Something went wrong. Please try again."_ with a Retry button |
| Network timeout | Show retry banner; preserve all unsaved form data                                  |

### Standard Response Envelope

All endpoints return the same wrapper:

```json
{
  "success": true | false,
  "message": "Human-readable result",
  "data": { ... }
}
```

On error:

```json
{
  "success": false,
  "message": "Validation failed — title is required"
}
```
