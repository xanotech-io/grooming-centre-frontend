# TC19 — Instructor Posts Course Completion to Transcript

## Developer README

> **Module Tag:** `Yisa - Student Transcript`
> **PRD Reference:** TC19 – Instructor Posts Course Completion to Transcript
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
   - [Step 2 — Student Requests a Transcript](#step-2--student-requests-a-transcript)
   - [Step 3 — Admin Views All Transcript Requests (Review Queue)](#step-3--admin-views-all-transcript-requests-review-queue)
   - [Step 4 — Admin Views All Requests for a Specific Student](#step-4--admin-views-all-requests-for-a-specific-student)
   - [Step 5 — View a Single Transcript in Full](#step-5--view-a-single-transcript-in-full)
   - [Step 6 — Instructor Posts Exam Completion to a Transcript Record](#step-6--instructor-posts-exam-completion-to-a-transcript-record)
   - [Step 7 — Admin Reviews an Official Transcript (Approve or Return)](#step-7--admin-reviews-an-official-transcript-approve-or-return)
   - [Step 8 — Get Department Performance Analytics](#step-8--get-department-performance-analytics)
5. [Transcript Status Lifecycle](#transcript-status-lifecycle)
6. [Exam Type Display Rules](#exam-type-display-rules)
7. [Completion Status Reference](#completion-status-reference)
8. [Request & Response Schema Reference](#request--response-schema-reference)
9. [Filtering & Query Parameters](#filtering--query-parameters)
10. [Error Handling](#error-handling)

---

## Overview

The Student Transcript module manages the full lifecycle of student academic transcripts — from request through instructor posting, admin review, issuance, and department analytics.

**Two transcript types are supported:**

| Type         | Behaviour                                                                |
| ------------ | ------------------------------------------------------------------------ |
| `Unofficial` | Generated and issued immediately upon request — no admin review required |
| `Official`   | Enters `Pending Review` status — requires admin approval before issuance |

**The complete lifecycle is:**

```
Student requests transcript → Instructor posts exam completion to record
→ Admin reviews Official transcript → Approved & issued → Available for reporting
→ Department analytics aggregated across all students in the department
```

---

## Module Endpoints

All 7 endpoints that belong to this module:

| #   | Method  | Path                                                                | Description                                                  | Roles              |
| --- | ------- | ------------------------------------------------------------------- | ------------------------------------------------------------ | ------------------ |
| 1   | `POST`  | `/api/v1/student-transcript-v2`                                     | Student requests a transcript                                | All authenticated  |
| 2   | `GET`   | `/api/v1/student-transcript-v2`                                     | List all transcript requests — admin review queue            | Admin, Super Admin |
| 3   | `GET`   | `/api/v1/student-transcript-v2/student/{studentId}`                 | Get all transcript requests for a specific student           | Admin, Super Admin |
| 4   | `GET`   | `/api/v1/student-transcript-v2/{transcriptId}`                      | Get a single transcript with course rows and summary metrics | All authenticated  |
| 5   | `PATCH` | `/api/v1/student-transcript-v2/{transcriptId}/review`               | Admin approves or returns an Official transcript             | Admin, Super Admin |
| 6   | `PATCH` | `/api/v1/student-transcript-v2/records/{recordId}/post-completion`  | Instructor posts exam completion to a transcript record      | Instructor, Admin  |
| 7   | `GET`   | `/api/v1/student-transcript-v2/department-analytics/{departmentId}` | Department performance analytics                             | Admin, Super Admin |

---

## End-to-End Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  PHASE 1 — Student Requests a Transcript                                     │
│                                                                              │
│  POST /api/v1/student-transcript-v2                                          │
│                                                                              │
│  Student specifies transcriptType:                                           │
│    "Unofficial" → System generates and issues immediately (status: Issued)  │
│    "Official"   → Status set to Pending Review; admin must approve          │
│                                                                              │
│  System automatically:                                                       │
│    - Identifies the student from the JWT token                              │
│    - Retrieves all enrolled courses with enrollment dates                   │
│    - Computes scores from the grades table per course                       │
│    - Checks certificate issuance per course                                 │
│    - Assembles the transcript with all course records                       │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  PHASE 2 — Instructor Posts Exam Completion to Transcript Records            │
│                                                                              │
│  PATCH /api/v1/student-transcript-v2/records/{recordId}/post-completion      │
│                                                                              │
│  Instructor provides:                                                        │
│    - examId          → the specific exam to post results for                │
│    - completionStatus → Completed | Passed | Failed | Pending               │
│    - remarks          → optional notes or manual adjustments                │
│                                                                              │
│  System identifies exam type and applies display rules:                     │
│                                                                              │
│  Course Examination:                                                         │
│    → Questions and answers displayed                                        │
│    → All answers marked as correct regardless of actual response            │
│    → Score contributes to course completion                                 │
│                                                                              │
│  Standalone Examination:                                                     │
│    → Questions displayed only                                               │
│    → Answers hidden                                                         │
│    → Score set to N/A                                                       │
│                                                                              │
│  System stores audit log entry for every post action:                       │
│    - Instructor/Admin ID who posted                                         │
│    - Date and time posted                                                   │
│    - Previous transcript state                                              │
│    - Updated transcript state                                               │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  PHASE 3 — Admin Reviews Official Transcript                                 │
│                                                                              │
│  Admin fetches queue:                                                        │
│  GET /api/v1/student-transcript-v2?status=Pending Review                    │
│                                                                              │
│  Admin reviews full transcript:                                              │
│  GET /api/v1/student-transcript-v2/{transcriptId}                           │
│                                                                              │
│  Admin decides:                                                              │
│  PATCH /api/v1/student-transcript-v2/{transcriptId}/review                  │
│                                                                              │
│  Approved:                                                                   │
│    → Status → Issued                                                        │
│    → issuedAt timestamp recorded                                            │
│    → Unique issuanceReference generated (e.g. ISS-2026-4F3A9B)             │
│    → Record becomes read-only                                               │
│                                                                              │
│  Returned:                                                                   │
│    → Status → Returned                                                      │
│    → reviewRemarks stored explaining what needs correction                  │
│    → Student can submit a new request                                       │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  PHASE 4 — Department Performance Analytics                                  │
│                                                                              │
│  GET /api/v1/student-transcript-v2/department-analytics/{departmentId}      │
│                                                                              │
│  System aggregates across all students in the department:                   │
│    - Total students                                                         │
│    - Completed transcripts                                                  │
│    - Average exam score                                                     │
│    - Pass rate / fail rate                                                  │
│    - Weekly and monthly transcript update counts                           │
│    - Transcript discrepancy count                                           │
│    - Individual student transcript summaries                               │
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
  "email": "instructor@example.com",
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

### Step 2 — Student Requests a Transcript

The student's identity is derived from their JWT token — no `studentId` needed in the body.

**Request an Unofficial transcript (issued immediately):**

```http
POST /api/v1/student-transcript-v2
Authorization: Bearer <student-token>
Content-Type: application/json

{
  "transcriptType": "Unofficial"
}
```

**Request an Official transcript (requires admin review):**

```http
POST /api/v1/student-transcript-v2
Authorization: Bearer <student-token>
Content-Type: application/json

{
  "transcriptType": "Official"
}
```

**Success Response — `201 Created`:**

```json
{
  "success": true,
  "message": "Transcript request created successfully",
  "data": {
    "transcript": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "studentId": "uuid-student-1",
      "student": {
        "id": "uuid-student-1",
        "firstName": "Amina",
        "lastName": "Yusuf",
        "email": "amina.yusuf@example.com"
      },
      "transcriptType": "Official",
      "status": "Pending Review",
      "requestDate": "2026-05-21T09:00:00.000Z",
      "approvedBy": null,
      "issuedAt": null,
      "issuanceReference": null,
      "reviewRemarks": null,
      "courseRecords": [
        {
          "id": "uuid-record-1",
          "transcriptRequestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "studentId": "uuid-student-1",
          "courseId": "uuid-course-1",
          "course": {
            "id": "uuid-course-1",
            "title": "Microfinance Basics"
          },
          "instructorId": "uuid-instructor-1",
          "instructor": {
            "id": "uuid-instructor-1",
            "firstName": "John",
            "lastName": "Doe"
          },
          "attemptDate": "2026-05-21T09:00:00.000Z",
          "completionDate": null,
          "score": 85.0,
          "grade": "A",
          "certificateIssued": true,
          "remarks": null
        }
      ]
    },
    "summary": {
      "totalCoursesEnrolled": 3,
      "totalCoursesCompleted": 3,
      "courseCompletionRate": 100.0,
      "weightedAverageScore": 83.0,
      "gpa": 3.5,
      "certificatesIssued": 2,
      "certificationRatio": 66.7
    }
  }
}
```

> **Unofficial transcripts** return `status: "Issued"` and include a populated `issuedAt` timestamp immediately.
> **Official transcripts** return `status: "Pending Review"` — no `issuedAt` until admin approves.

---

### Step 3 — Admin Views All Transcript Requests (Review Queue)

Use this to build the admin's transcript review queue dashboard. Filter to `Pending Review` to see only those awaiting action.

```http
GET /api/v1/student-transcript-v2
Authorization: Bearer <admin-token>
```

**Filter to Official transcripts awaiting review:**

```http
GET /api/v1/student-transcript-v2?status=Pending Review&transcriptType=Official
Authorization: Bearer <admin-token>
```

**Filter by status only:**

```http
GET /api/v1/student-transcript-v2?status=Issued
Authorization: Bearer <admin-token>
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Transcript requests fetched successfully",
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "studentId": "uuid-student-1",
      "student": {
        "id": "uuid-student-1",
        "firstName": "Amina",
        "lastName": "Yusuf",
        "email": "amina.yusuf@example.com"
      },
      "transcriptType": "Official",
      "status": "Pending Review",
      "requestDate": "2026-05-21T09:00:00.000Z",
      "approvedBy": null,
      "issuedAt": null,
      "issuanceReference": null,
      "reviewRemarks": null,
      "courseRecords": []
    }
  ]
}
```

---

### Step 4 — Admin Views All Requests for a Specific Student

Returns the full transcript history for a given student — all Official and Unofficial requests, ordered most recent first.

```http
GET /api/v1/student-transcript-v2/student/{studentId}
Authorization: Bearer <admin-token>
```

**Example:**

```http
GET /api/v1/student-transcript-v2/student/uuid-student-1
Authorization: Bearer <admin-token>
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Transcript requests fetched successfully",
  "data": [
    {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "transcriptType": "Official",
      "status": "Issued",
      "requestDate": "2026-05-21T09:00:00.000Z",
      "issuedAt": "2026-05-22T11:00:00.000Z",
      "issuanceReference": "ISS-2026-4F3A9B"
    },
    {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "transcriptType": "Unofficial",
      "status": "Issued",
      "requestDate": "2026-04-10T08:00:00.000Z",
      "issuedAt": "2026-04-10T08:00:05.000Z",
      "issuanceReference": null
    }
  ]
}
```

**`404`** is returned when no transcript requests exist for the student.

---

### Step 5 — View a Single Transcript in Full

Returns the complete transcript including all course records, per-course scores, grades, certificate issuance, and computed summary metrics (GPA, weighted average, completion rate, certification ratio).

```http
GET /api/v1/student-transcript-v2/{transcriptId}
Authorization: Bearer <token>
```

**Example:**

```http
GET /api/v1/student-transcript-v2/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer <token>
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Transcript fetched successfully",
  "data": {
    "transcript": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "studentId": "uuid-student-1",
      "student": {
        "id": "uuid-student-1",
        "firstName": "Amina",
        "lastName": "Yusuf",
        "email": "amina.yusuf@example.com"
      },
      "transcriptType": "Official",
      "status": "Issued",
      "requestDate": "2026-05-21T09:00:00.000Z",
      "approvedBy": "uuid-admin-1",
      "issuedAt": "2026-05-22T11:00:00.000Z",
      "issuanceReference": "ISS-2026-4F3A9B",
      "reviewRemarks": null,
      "courseRecords": [
        {
          "id": "uuid-record-1",
          "transcriptRequestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "studentId": "uuid-student-1",
          "courseId": "uuid-course-1",
          "course": {
            "id": "uuid-course-1",
            "title": "Microfinance Basics"
          },
          "instructorId": "uuid-instructor-1",
          "instructor": {
            "id": "uuid-instructor-1",
            "firstName": "John",
            "lastName": "Doe"
          },
          "attemptDate": "2026-05-21T09:00:00.000Z",
          "completionDate": "2026-03-10T14:00:00.000Z",
          "score": 85.0,
          "grade": "A",
          "certificateIssued": true,
          "remarks": "Result verified and approved"
        },
        {
          "id": "uuid-record-2",
          "courseId": "uuid-course-2",
          "course": {
            "id": "uuid-course-2",
            "title": "Data Privacy Awareness"
          },
          "score": 78.0,
          "grade": "B",
          "certificateIssued": false,
          "remarks": null
        }
      ]
    },
    "summary": {
      "totalCoursesEnrolled": 2,
      "totalCoursesCompleted": 2,
      "courseCompletionRate": 100.0,
      "weightedAverageScore": 81.5,
      "gpa": 3.5,
      "certificatesIssued": 1,
      "certificationRatio": 50.0
    }
  }
}
```

---

### Step 6 — Instructor Posts Exam Completion to a Transcript Record

This is the core instructor action. It posts exam results to a specific course record row inside a transcript. The `recordId` is the `id` from a `courseRecords` entry returned in Step 5.

**Important — Exam Type Display Rules:**

| Exam Type              | Questions | Answers                        | Score   |
| ---------------------- | --------- | ------------------------------ | ------- |
| Course Examination     | Displayed | Displayed (all marked correct) | Shown   |
| Standalone Examination | Displayed | **Hidden**                     | **N/A** |

---

**Post completion for a Course Examination:**

```http
PATCH /api/v1/student-transcript-v2/records/{recordId}/post-completion
Authorization: Bearer <instructor-token>
Content-Type: application/json

{
  "examId": "uuid-exam-1",
  "completionStatus": "Passed",
  "remarks": "Final course assessment — result verified and approved"
}
```

**Post completion for a Standalone Examination:**

```http
PATCH /api/v1/student-transcript-v2/records/{recordId}/post-completion
Authorization: Bearer <instructor-token>
Content-Type: application/json

{
  "examId": "uuid-standalone-exam-1",
  "completionStatus": "Completed",
  "remarks": "Answers hidden — standalone exam rules applied"
}
```

**Post a failed result:**

```http
PATCH /api/v1/student-transcript-v2/records/{recordId}/post-completion
Authorization: Bearer <instructor-token>
Content-Type: application/json

{
  "examId": "uuid-exam-2",
  "completionStatus": "Failed",
  "remarks": "Student did not meet minimum pass threshold"
}
```

**Post a pending result (exam not yet graded):**

```http
PATCH /api/v1/student-transcript-v2/records/{recordId}/post-completion
Authorization: Bearer <instructor-token>
Content-Type: application/json

{
  "examId": "uuid-exam-3",
  "completionStatus": "Pending",
  "remarks": "Manual grading in progress"
}
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Exam completion posted to transcript successfully",
  "data": {
    "id": "uuid-record-1",
    "transcriptRequestId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "studentId": "uuid-student-1",
    "courseId": "uuid-course-1",
    "course": {
      "id": "uuid-course-1",
      "title": "Microfinance Basics"
    },
    "instructorId": "uuid-instructor-1",
    "instructor": {
      "id": "uuid-instructor-1",
      "firstName": "John",
      "lastName": "Doe"
    },
    "attemptDate": "2026-05-21T09:00:00.000Z",
    "completionDate": "2026-05-22T10:00:00.000Z",
    "score": 85.0,
    "grade": "A",
    "certificateIssued": true,
    "remarks": "Final course assessment — result verified and approved"
  }
}
```

> Every call to this endpoint creates an **audit log entry** recording: who posted (`instructorId`), when it was posted, the previous state, and the updated state.

**`400`** is returned when the `examId` does not exist or the student did not attempt that exam.
**`404`** is returned when the `recordId` does not exist.

---

### Step 7 — Admin Reviews an Official Transcript (Approve or Return)

Only applies to `Official` transcripts with `status: "Pending Review"`. The admin fetches the queue (Step 3), views the full transcript (Step 5), then calls this endpoint to action it.

**Approve — transcript is locked, timestamped, and issued:**

```http
PATCH /api/v1/student-transcript-v2/{transcriptId}/review
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "decision": "Approved",
  "reviewRemarks": "All records verified and accurate"
}
```

**Return for correction:**

```http
PATCH /api/v1/student-transcript-v2/{transcriptId}/review
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "decision": "Returned",
  "reviewRemarks": "Score for Microfinance Basics appears incorrect — please re-check exam result before resubmitting"
}
```

**Success Response — `200 OK` (Approved):**

```json
{
  "success": true,
  "message": "Transcript approved and issued",
  "data": {
    "transcript": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "transcriptType": "Official",
      "status": "Issued",
      "approvedBy": "uuid-admin-1",
      "issuedAt": "2026-05-22T11:00:00.000Z",
      "issuanceReference": "ISS-2026-4F3A9B",
      "reviewRemarks": "All records verified and accurate"
    },
    "summary": {
      "gpa": 3.5,
      "weightedAverageScore": 83.0,
      "certificationRatio": 66.7
    }
  }
}
```

**Success Response — `200 OK` (Returned):**

```json
{
  "success": true,
  "message": "Transcript returned for correction",
  "data": {
    "transcript": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "status": "Returned",
      "reviewRemarks": "Score for Microfinance Basics appears incorrect — please re-check exam result before resubmitting"
    }
  }
}
```

> Once a transcript is `Issued`, it is **read-only**. No further edits can be made to that record.

**`400`** is returned when:

- `decision` field is missing
- The transcript is not an `Official` type
- The transcript is not in `Pending Review` status

---

### Step 8 — Get Department Performance Analytics

Aggregates all student transcript and examination performance data across an entire department. The department is treated as the reporting group — no sub-group entity is required.

```http
GET /api/v1/student-transcript-v2/department-analytics/{departmentId}
Authorization: Bearer <admin-token>
```

**Example:**

```http
GET /api/v1/student-transcript-v2/department-analytics/uuid-dept-1
Authorization: Bearer <admin-token>
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "Department analytics fetched successfully",
  "data": {
    "departmentId": "uuid-dept-1",
    "departmentName": "Microfinance Department",
    "departmentPerformance": {
      "totalStudents": 250,
      "completedTranscripts": 210,
      "averageExamScore": 76.5,
      "passRate": 84.0,
      "failedRate": 16.0
    },
    "transcriptActivity": {
      "weeklyTranscriptUpdates": 45,
      "monthlyTranscriptUpdates": 180,
      "transcriptDiscrepancies": 3
    },
    "studentTranscripts": [
      {
        "transcriptId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "studentId": "uuid-student-1",
        "examType": "course",
        "completionStatus": "Passed"
      },
      {
        "transcriptId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "studentId": "uuid-student-2",
        "examType": "standalone",
        "completionStatus": "Completed"
      }
    ]
  }
}
```

| Analytics Field            | Description                                                |
| -------------------------- | ---------------------------------------------------------- |
| `totalStudents`            | Total students enrolled in the department                  |
| `completedTranscripts`     | Students whose transcript status is `Issued`               |
| `averageExamScore`         | Mean exam score across all department students             |
| `passRate`                 | Percentage of students with `Passed` or `Completed` status |
| `failedRate`               | Percentage of students with `Failed` status                |
| `weeklyTranscriptUpdates`  | Transcript post/update count in the last 7 days            |
| `monthlyTranscriptUpdates` | Transcript post/update count in the last 30 days           |
| `transcriptDiscrepancies`  | Count of transcripts flagged as `Returned` or disputed     |

---

## Transcript Status Lifecycle

```
                    ┌─────────────────┐
                    │   (request made) │
                    └────────┬────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
      transcriptType=Unofficial     transcriptType=Official
              │                             │
              ▼                             ▼
          ┌────────┐               ┌────────────────┐
          │ Issued │               │ Pending Review │
          └────────┘               └───────┬────────┘
                                           │
                          ┌────────────────┴────────────────┐
                          │                                 │
                   decision=Approved                 decision=Returned
                          │                                 │
                          ▼                                 ▼
                      ┌────────┐                       ┌──────────┐
                      │ Issued │ ← read-only            │ Returned │
                      └────────┘                       └──────────┘
```

| Status           | Meaning                                        | Next Action                      |
| ---------------- | ---------------------------------------------- | -------------------------------- |
| `Draft`          | Record exists but not yet submitted            | Student submits request          |
| `Pending Review` | Official transcript awaiting admin action      | Admin approves or returns        |
| `Approved`       | Admin has approved, awaiting issuance          | System issues automatically      |
| `Issued`         | Transcript is finalised and read-only          | Available for download/reporting |
| `Returned`       | Sent back to student/instructor for correction | Resubmit after fixing            |

---

## Exam Type Display Rules

When an instructor calls `PATCH /records/{recordId}/post-completion`, the system determines the exam type from the provided `examId` and applies these rules:

| Rule                      | Course Examination       | Standalone Examination |
| ------------------------- | ------------------------ | ---------------------- |
| Questions displayed       | Yes                      | Yes                    |
| Answers displayed         | Yes (all marked correct) | **No — hidden**        |
| Score shown               | Yes                      | **No — N/A**           |
| Contributes to completion | Yes                      | No                     |

> These rules are enforced server-side. The instructor does not need to specify exam type — the system resolves it from the `examId`.

---

## Completion Status Reference

| `completionStatus` | When to Use                                                                       |
| ------------------ | --------------------------------------------------------------------------------- |
| `"Completed"`      | Student finished the exam (applies to both standalone and course exams)           |
| `"Passed"`         | Student met or exceeded the pass threshold on a course exam                       |
| `"Failed"`         | Student did not meet the pass threshold on a course exam                          |
| `"Pending"`        | Exam submitted but grading is not yet finalised (e.g. manual grading in progress) |

---

## Request & Response Schema Reference

### `POST /api/v1/student-transcript-v2` — Request Body

```
{
  transcriptType: "Official" | "Unofficial"   (required)
}
```

### `PATCH .../records/{recordId}/post-completion` — Request Body

```
{
  examId:           UUID                                         (required)
  completionStatus: "Completed" | "Passed" | "Failed" | "Pending" (required)
  remarks:          string | null                                (optional)
}
```

### `PATCH .../{transcriptId}/review` — Request Body

```
{
  decision:       "Approved" | "Returned"    (required)
  reviewRemarks:  string | null              (optional; recommended when Returned)
}
```

### `TranscriptRequest` — Response Object

```
{
  id:                 UUID
  studentId:          UUID
  student:            { id, firstName, lastName, email }
  transcriptType:     "Official" | "Unofficial"
  status:             "Draft" | "Pending Review" | "Approved" | "Issued" | "Returned"
  requestDate:        datetime
  approvedBy:         UUID | null
  approver:           { id, firstName, lastName } | null
  issuedAt:           datetime | null
  issuanceReference:  string | null              // e.g. "ISS-2026-4F3A9B"
  reviewRemarks:      string | null
  courseRecords:      TranscriptCourseRow[]
}
```

### `TranscriptCourseRow` — Course Record in a Transcript

```
{
  id:                 UUID
  transcriptRequestId:UUID
  studentId:          UUID
  courseId:           UUID
  course:             { id, title }
  instructorId:       UUID
  instructor:         { id, firstName, lastName }
  attemptDate:        datetime
  completionDate:     datetime | null
  score:              float | null
  grade:              string | null              // e.g. "A", "B"
  certificateIssued:  boolean
  remarks:            string | null
}
```

### `TranscriptSummary` — Computed Metrics Returned with Transcript

```
{
  totalCoursesEnrolled:    integer
  totalCoursesCompleted:   integer
  courseCompletionRate:    float         // percentage
  weightedAverageScore:    float | null
  gpa:                     float | null  // e.g. 3.5
  certificatesIssued:      integer
  certificationRatio:      float         // percentage
}
```

### Department Analytics Response Object

```
{
  departmentId:   UUID
  departmentName: string
  departmentPerformance: {
    totalStudents:          integer
    completedTranscripts:   integer
    averageExamScore:       float | null
    passRate:               float
    failedRate:             float
  }
  transcriptActivity: {
    weeklyTranscriptUpdates:  integer
    monthlyTranscriptUpdates: integer
    transcriptDiscrepancies:  integer
  }
  studentTranscripts: [
    {
      transcriptId:      UUID
      studentId:         UUID
      examType:          "course" | "standalone" | null
      completionStatus:  string | null
    }
  ]
}
```

---

## Filtering & Query Parameters

### `GET /api/v1/student-transcript-v2` — Admin Queue

| Parameter        | Type | Required | Description                                                 |
| ---------------- | ---- | -------- | ----------------------------------------------------------- |
| `status`         | enum | No       | `Draft`, `Pending Review`, `Approved`, `Issued`, `Returned` |
| `transcriptType` | enum | No       | `Official`, `Unofficial`                                    |

**Recommended filter for admin review queue:**

```
GET /api/v1/student-transcript-v2?status=Pending Review&transcriptType=Official
```

---

## Error Handling

| HTTP Status   | Meaning                                    | Recommended Action                                                                 |
| ------------- | ------------------------------------------ | ---------------------------------------------------------------------------------- |
| `200` / `201` | Success                                    | Render response                                                                    |
| `400`         | Validation error or wrong transcript state | Check required fields; verify transcript is in correct status before review        |
| `401`         | Missing or invalid JWT                     | Re-authenticate                                                                    |
| `403`         | Insufficient role                          | Post-completion requires Instructor or Admin; review requires Admin or Super Admin |
| `404`         | Resource not found                         | Verify `transcriptId`, `recordId`, `studentId`, or `departmentId` UUID             |
| `500`         | Server error                               | Retry; log for investigation                                                       |

### Common Errors

| Error                                   | Cause                                                        | Fix                                                                    |
| --------------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------- |
| `400` — wrong transcript type on review | Attempting to review an `Unofficial` transcript              | Only `Official` transcripts go through admin review                    |
| `400` — wrong status on review          | Transcript is not in `Pending Review`                        | Check current `status` before calling the review endpoint              |
| `400` — student did not attempt exam    | `examId` provided but student has no submission              | Verify the student submitted answers for that specific `examId`        |
| `404` — record not found                | `recordId` does not match any course row in a transcript     | Fetch the full transcript first and use an `id` from `courseRecords[]` |
| `404` — no enrolled courses             | Student has no course enrollments when requesting transcript | Ensure student is enrolled in at least one course before requesting    |
