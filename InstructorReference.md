# Instructor Performance Report — Developer README

> **Module Tag:** `Caleb - Instructor Performance`  
> **Base URL (Production):** `https://gclms.xanotech.org`  
> **Base URL (Local):** `http://localhost:8089`  
> **Authentication:** All endpoints require a Bearer JWT token in the `Authorization` header.

---

## Table of Contents

1. [Overview](#overview)
2. [Module Endpoints](#module-endpoints)
3. [End-to-End Flow](#end-to-end-flow)
4. [Step-by-Step Integration Guide](#step-by-step-integration-guide)
5. [KPI Definitions & Formulas](#kpi-definitions--formulas)
6. [Request & Response Reference](#request--response-reference)
7. [Filtering & Query Parameters](#filtering--query-parameters)
8. [Error Handling](#error-handling)
9. [Export & Downstream Integration](#export--downstream-integration)

---

## Overview

The Instructor Performance Report module measures and evaluates instructor effectiveness across training programs. It aggregates data from courses, enrollments, assessments, exams, projects, and feedback surveys to produce per-instructor KPIs, trend data, and drill-down reports.

**Key questions this module answers:**

- Which instructors have the highest student completion rates?
- Which instructors produce the best average assessment/exam/project scores?
- Which instructors grade submissions fastest?
- How are instructor performance metrics trending over time?

---

## Module Endpoints

Two endpoints belong exclusively to this module:

| Method | Path                                                      | Description                                                    |
| ------ | --------------------------------------------------------- | -------------------------------------------------------------- |
| `GET`  | `/api/v1/instructor-performance-v2/report`                | Full paginated instructor performance report with summary KPIs |
| `GET`  | `/api/v1/instructor-performance-v2/report/{instructorId}` | Drill-down detail for a single instructor                      |

### Supporting Endpoints (used in conjunction)

The following endpoints from other modules feed data into or complement the instructor performance report:

| Method | Path                                                  | Purpose                                                        |
| ------ | ----------------------------------------------------- | -------------------------------------------------------------- |
| `GET`  | `/api/v1/course/admin/list`                           | Retrieve all courses to cross-reference instructor assignments |
| `GET`  | `/api/v1/course/admin/{departmentId}`                 | Get courses filtered by department                             |
| `GET`  | `/api/v1/assessment-quiz-report-v2/course/{courseId}` | Pull assessment scores per course                              |
| `GET`  | `/api/v1/exam-marking/results/{examId}`               | Pull exam results per examination                              |
| `GET`  | `/api/v1/project-grading-v2/report`                   | Pull project grading metrics                                   |
| `GET`  | `/api/v1/dashboard-v2/performance`                    | Cross-module performance dashboard KPIs                        |
| `GET`  | `/api/v1/export-reports-v2`                           | Export the report (PDF/Excel/CSV/JSON/XML)                     |
| `POST` | `/api/v1/export-reports-v2`                           | Trigger a report export for download                           |

---

## End-to-End Flow

The following diagram describes the complete data lifecycle that powers the Instructor Performance Report.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Instructor Delivers Course                                      │
│  → Instructor is assigned to one or more courses                        │
│  → Students enroll, attend lessons, take assessments/exams/projects     │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Students Complete Activities                                    │
│  → Lesson completions tracked via courseTracking                        │
│  → Assessment answers submitted → assessmentScoreSheets                 │
│  → Exam answers submitted      → examResult / examinationScoreSheets   │
│  → Project files uploaded      → ProjectSubmission → ProjectReview     │
│  → Feedback surveys submitted  → feedbackSurvey records                 │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Backend KPI Engine Aggregates Raw Data                         │
│  Source          │ Data Collected                                        │
│  ────────────────┼───────────────────────────────────────────────────  │
│  courses         │ courses delivered per instructor                      │
│  enrollments     │ total enrolled / completed students                   │
│  assessments     │ average score, submission date, graded date           │
│  examinations    │ average exam score, grading timestamps                │
│  projects        │ average project grade, review timestamps              │
│  feedback_surveys│ instructor_rating averages                            │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 4: KPI Calculation                                                 │
│  completion_rate            = (completed / enrolled) × 100              │
│  average_assessment_score   = AVG(assessmentScoreSheet.score)           │
│  average_exam_score         = AVG(examResult.totalScore)                │
│  average_project_score      = AVG(ProjectReview.grade)                  │
│  average_score (combined)   = AVG of all three score types              │
│  grading_timeliness_days    = AVG(graded_at - submitted_at) in days     │
│  feedback_rating            = AVG(instructor_rating from surveys)       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 5: API Returns Processed Report                                    │
│  GET /api/v1/instructor-performance-v2/report                           │
│  → summary KPIs (across all instructors)                                │
│  → per-instructor rows with metrics + trend array                       │
│  → paginated, filterable, sortable                                      │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 6: Drill Down (optional)                                           │
│  GET /api/v1/instructor-performance-v2/report/{instructorId}            │
│  → Same metrics scoped to one instructor                                │
│  → Useful for performance review pages                                  │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  STEP 7: Export (optional)                                               │
│  POST /api/v1/export-reports-v2                                         │
│  { reportType: "performance_reports", exportFormat: "pdf"|"excel"|"csv"}│
│  → Generates file, uploads to Azure Blob Storage                        │
│  → Returns download link (valid 7 days)                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Integration Guide

### Step 1 — Authenticate

All requests require a JWT Bearer token obtained from the login endpoint.

```http
POST /api/v1/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "YourPassword"
}
```

**Response — capture the token:**

```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

Use this token as `Authorization: Bearer <token>` on all subsequent requests.

---

### Step 2 — (Optional) Fetch Available Departments & Courses for Filters

Before rendering the report filter UI, populate the department and course dropdowns.

```http
GET /api/v1/dashboard-v2/filters
Authorization: Bearer <token>
```

**Response excerpt:**

```json
{
  "data": {
    "courses": [{ "id": "uuid-course-1", "title": "Introduction to Grooming" }],
    "departments": [{ "id": "uuid-dept-1", "name": "Technology" }]
  }
}
```

---

### Step 3 — Fetch the Full Instructor Performance Report

This is the primary endpoint. Call it with your desired filters.

```http
GET /api/v1/instructor-performance-v2/report
Authorization: Bearer <token>
```

**With filters applied:**

```http
GET /api/v1/instructor-performance-v2/report
  ?startDate=2026-01-01
  &endDate=2026-03-31
  &departmentId=uuid-dept-1
  &period=quarterly
  &page=1
  &limit=20
Authorization: Bearer <token>
```

**Full response shape:**

```json
{
  "success": true,
  "data": {
    "reportName": "Instructor Performance Report",
    "generatedAt": "2026-05-21T10:00:00.000Z",
    "period": "quarterly",
    "total": 25,
    "page": 1,
    "limit": 20,
    "recordCount": 20,
    "executionTimeMs": 312,
    "summary": {
      "total_instructors": 25,
      "average_completion_rate": 88.0,
      "average_feedback_rating": 4.6,
      "average_assessment_score": 79.0,
      "average_grading_days": 2.4,
      "top_completion_rate": 97.0
    },
    "data": [
      {
        "instructor_id": "uuid-instructor-1",
        "instructor_name": "J. Smith",
        "instructor_email": "j.smith@example.com",
        "department_id": "uuid-dept-1",
        "department": "Technology",
        "courses_delivered": 4,
        "total_enrolled": 100,
        "total_completed": 92,
        "completion_rate": 92.0,
        "average_assessment_score": 80.0,
        "average_exam_score": 78.5,
        "average_project_score": 82.0,
        "average_score": 80.2,
        "grading_timeliness_days": 2.0,
        "feedback_rating": 4.7,
        "score_trend": [
          { "period": "2026-Q1", "average_score": 78.0 },
          { "period": "2026-Q2", "average_score": 80.2 }
        ]
      }
    ]
  }
}
```

---

### Step 4 — Drill Down Into a Single Instructor

When a user clicks on an instructor row in the UI, call the drill-down endpoint for detailed metrics.

```http
GET /api/v1/instructor-performance-v2/report/{instructorId}
Authorization: Bearer <token>
```

**With optional date/period filters:**

```http
GET /api/v1/instructor-performance-v2/report/uuid-instructor-1
  ?startDate=2026-01-01
  &endDate=2026-03-31
  &period=monthly
Authorization: Bearer <token>
```

**Response shape** — same `InstructorRow` schema as the list, but scoped to one instructor:

```json
{
  "success": true,
  "data": {
    "instructor_id": "uuid-instructor-1",
    "instructor_name": "J. Smith",
    "instructor_email": "j.smith@example.com",
    "department": "Technology",
    "courses_delivered": 4,
    "total_enrolled": 100,
    "total_completed": 92,
    "completion_rate": 92.0,
    "average_assessment_score": 80.0,
    "average_exam_score": 78.5,
    "average_project_score": 82.0,
    "average_score": 80.2,
    "grading_timeliness_days": 2.0,
    "feedback_rating": 4.7,
    "score_trend": [
      { "period": "2026-01", "average_score": 77.5 },
      { "period": "2026-02", "average_score": 79.0 },
      { "period": "2026-03", "average_score": 83.1 }
    ]
  }
}
```

---

### Step 5 — (Optional) Cross-Reference Assessment Scores Per Course

To get granular assessment data per course for a specific instructor's course, call:

```http
GET /api/v1/assessment-quiz-report-v2/course/{courseId}
Authorization: Bearer <token>
```

This returns per-student assessment scores, grades, and pass/fail status for the course — useful for building an instructor's course-level breakdown table.

---

### Step 6 — (Optional) Cross-Reference Exam Results

For exam-level data on a course's examination:

```http
GET /api/v1/exam-marking/results/{examId}
Authorization: Bearer <token>
```

Returns all student results for the exam including `totalScore`, `grade`, and `evaluationDate`.

---

### Step 7 — (Optional) Cross-Reference Project Grading

For project data across an instructor's courses:

```http
GET /api/v1/project-grading-v2/report
  ?instructorId=uuid-instructor-1
Authorization: Bearer <token>
```

Returns per-project metrics including grading completion percentage, average grade, and feedback coverage rate.

---

### Step 8 — Export the Report

To generate a downloadable file (PDF, Excel, CSV, JSON, or XML):

```http
POST /api/v1/export-reports-v2
Authorization: Bearer <token>
Content-Type: application/json

{
  "operationType": "export",
  "reportType": "performance_reports",
  "exportFormat": "excel",
  "reportName": "Instructor Performance Q1 2026",
  "filters": {
    "startDate": "2026-01-01",
    "endDate": "2026-03-31",
    "departmentId": "uuid-dept-1"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-export-record",
    "status": "completed",
    "fileUrl": "https://storage.azure.com/.../instructor_performance_q1.xlsx",
    "expiryDate": "2026-05-28",
    "fileSizeMb": 0.45,
    "totalRecords": 25
  }
}
```

Provide the `fileUrl` to the user as a download link. The link expires after **7 days**.

---

### Step 9 — (Optional) View Export History

Retrieve previous exports:

```http
GET /api/v1/export-reports-v2
  ?reportType=performance_reports
  &status=completed
Authorization: Bearer <token>
```

Or get only your own exports:

```http
GET /api/v1/export-reports-v2/my-exports
Authorization: Bearer <token>
```

---

## KPI Definitions & Formulas

| KPI                          | Formula                                                    | Field in Response          |
| ---------------------------- | ---------------------------------------------------------- | -------------------------- |
| **Completion Rate**          | `(total_completed ÷ total_enrolled) × 100`                 | `completion_rate`          |
| **Average Assessment Score** | `AVG(assessmentScoreSheet.score)` per instructor's courses | `average_assessment_score` |
| **Average Exam Score**       | `AVG(examResult.totalScore)` per instructor's courses      | `average_exam_score`       |
| **Average Project Score**    | `AVG(ProjectReview.grade)` per instructor's courses        | `average_project_score`    |
| **Combined Average Score**   | `AVG` of assessment + exam + project scores                | `average_score`            |
| **Grading Timeliness**       | `AVG(graded_at − submitted_at)` in days                    | `grading_timeliness_days`  |
| **Feedback Rating**          | `AVG(instructor_rating)` from feedback surveys             | `feedback_rating`          |
| **Score Trend**              | Grouped average score by period (monthly/quarterly/yearly) | `score_trend[]`            |

### Score Trend Period Format

| `period` parameter | `score_trend[].period` example |
| ------------------ | ------------------------------ |
| `monthly`          | `"2026-01"`                    |
| `quarterly`        | `"2026-Q1"`                    |
| `yearly`           | `"2026"`                       |

---

## Request & Response Reference

### `GET /api/v1/instructor-performance-v2/report`

#### Query Parameters

| Parameter      | Type                                 | Required | Description                                  |
| -------------- | ------------------------------------ | -------- | -------------------------------------------- |
| `instructorId` | UUID                                 | No       | Filter to a specific instructor              |
| `departmentId` | UUID                                 | No       | Filter by department                         |
| `courseId`     | UUID                                 | No       | Filter to a specific course                  |
| `startDate`    | date (YYYY-MM-DD)                    | No       | Report period start                          |
| `endDate`      | date (YYYY-MM-DD)                    | No       | Report period end                            |
| `period`       | `monthly` \| `quarterly` \| `yearly` | No       | Score trend grouping (default: `quarterly`)  |
| `page`         | integer                              | No       | Page number (default: `1`)                   |
| `limit`        | integer                              | No       | Records per page (default: `50`, max: `200`) |

#### Response Schema — `InstructorPerformanceReport`

```
{
  reportName: string
  generatedAt: datetime
  period: string
  total: integer          // total matching instructors
  page: integer
  limit: integer
  recordCount: integer    // records in this page
  executionTimeMs: integer
  summary: InstructorPerformanceSummary
  data: InstructorRow[]
}
```

#### `InstructorPerformanceSummary`

```
{
  total_instructors: integer
  average_completion_rate: float | null
  average_feedback_rating: float | null
  average_assessment_score: float | null
  average_grading_days: float | null
  top_completion_rate: float | null
}
```

#### `InstructorRow`

```
{
  instructor_id: UUID
  instructor_name: string | null
  instructor_email: string | null
  department_id: UUID | null
  department: string | null
  courses_delivered: integer
  total_enrolled: integer
  total_completed: integer
  completion_rate: float          // percentage (0–100)
  average_assessment_score: float | null
  average_exam_score: float | null
  average_project_score: float | null
  average_score: float | null     // combined average
  grading_timeliness_days: float | null
  feedback_rating: float | null
  score_trend: InstructorScoreTrend[]
}
```

#### `InstructorScoreTrend`

```
{
  period: string          // e.g. "2026-Q1" or "2026-01"
  average_score: float | null
}
```

---

### `GET /api/v1/instructor-performance-v2/report/{instructorId}`

#### Path Parameters

| Parameter      | Type | Required | Description            |
| -------------- | ---- | -------- | ---------------------- |
| `instructorId` | UUID | **Yes**  | UUID of the instructor |

#### Query Parameters

| Parameter   | Type                                 | Required | Description                           |
| ----------- | ------------------------------------ | -------- | ------------------------------------- |
| `startDate` | date                                 | No       | Start of reporting period             |
| `endDate`   | date                                 | No       | End of reporting period               |
| `period`    | `monthly` \| `quarterly` \| `yearly` | No       | Trend grouping (default: `quarterly`) |

#### Response

Returns a single `InstructorRow` object (same schema as above) wrapped in the standard success envelope.

**404 returned when:** no performance data exists for the given `instructorId`.

---

## Filtering & Query Parameters

### Common Filtering Patterns

**Filter by department and date range:**

```
GET /api/v1/instructor-performance-v2/report
  ?departmentId=uuid-dept-1
  &startDate=2026-01-01
  &endDate=2026-03-31
```

**Filter to a specific instructor with monthly trend:**

```
GET /api/v1/instructor-performance-v2/report
  ?instructorId=uuid-instructor-1
  &period=monthly
  &startDate=2026-01-01
  &endDate=2026-06-30
```

**Paginate through all instructors:**

```
GET /api/v1/instructor-performance-v2/report?page=1&limit=50
GET /api/v1/instructor-performance-v2/report?page=2&limit=50
```

Use the top-level `total` field from the response to calculate total pages:

```
totalPages = Math.ceil(total / limit)
```

---

## Error Handling

| HTTP Status | Meaning                                | Action                                                       |
| ----------- | -------------------------------------- | ------------------------------------------------------------ |
| `200`       | Success                                | Render report                                                |
| `401`       | Missing or invalid JWT                 | Re-authenticate via `POST /api/v1/login`                     |
| `403`       | Role not authorized                    | Ensure user has `Admin`, `Super Admin`, or `Instructor` role |
| `404`       | Instructor not found (drill-down only) | Show "No data found" message                                 |
| `500`       | Server error                           | Retry with exponential backoff; log for investigation        |

### Example Error Response

```json
{
  "success": false,
  "message": "No data found for this instructor"
}
```

---

## Export & Downstream Integration

### Triggering an Export

Use `POST /api/v1/export-reports-v2` with `reportType: "performance_reports"`.

Supported `exportFormat` values: `pdf`, `excel`, `csv`, `json`, `xml`.

### Viewing Export History

```http
GET /api/v1/export-reports-v2/my-exports
  ?reportType=performance_reports
  &status=completed
Authorization: Bearer <token>
```

### Retrieving a Specific Export Record

```http
GET /api/v1/export-reports-v2/{exportId}
Authorization: Bearer <token>
```

### Integration with the Performance Dashboard

The performance dashboard endpoint provides a complementary high-level view:

```http
GET /api/v1/dashboard-v2/performance
  ?departmentId=uuid-dept-1
  &startDate=2026-01-01
  &endDate=2026-03-31
Authorization: Bearer <token>
```

This returns `PerformanceKPIs` including `quizAverageScore`, `examAverageScore`, and `feedbackRating` — useful as a header summary card before the full instructor table.

---

## Quick Reference — Complete Endpoint List

```
# Core module endpoints
GET  /api/v1/instructor-performance-v2/report
GET  /api/v1/instructor-performance-v2/report/{instructorId}

# Supporting — filters & lookups
GET  /api/v1/dashboard-v2/filters

# Supporting — cross-module score data
GET  /api/v1/assessment-quiz-report-v2/course/{courseId}
GET  /api/v1/exam-marking/results/{examId}
GET  /api/v1/project-grading-v2/report?instructorId={id}

# Supporting — performance dashboard
GET  /api/v1/dashboard-v2/performance

# Export
POST /api/v1/export-reports-v2
GET  /api/v1/export-reports-v2
GET  /api/v1/export-reports-v2/my-exports
GET  /api/v1/export-reports-v2/{exportId}

# Authentication
POST /api/v1/login
GET  /api/v1/me
POST /api/v1/logout
```
