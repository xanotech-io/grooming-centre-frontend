# TC01 – Course Completion & Pass Rate Report

> **Module:** TC01 | **Category:** Instructor / Teaching Reports
> **Tags:** `Caleb - Instructor Performance` · `Caleb - Enrollment Status`
> **Servers:** `http://localhost:8089` (dev) · `https://gclms.xanotech.org` (production)
> **Auth:** Bearer JWT required on all endpoints

---

## Overview

The Course Completion & Pass Rate Report measures the academic performance and effectiveness of courses delivered by instructors. It provides insights into student completion levels, pass rates, and learning outcomes across courses, branches, and program areas.

This report equips instructors, academic administrators, and management to assess teaching effectiveness, identify performance gaps, and support data-driven academic decision-making.

**Core flow in one line:**
`Apply Filters → Retrieve Enrollment & Performance Data → Calculate KPIs → Generate Report → Export / Archive`

---

## Table of Contents

1. [Objectives](#1-objectives)
2. [User Roles & Responsibilities](#2-user-roles--responsibilities)
3. [Key Data Elements](#3-key-data-elements)
4. [KPI Definitions & Formulas](#4-kpi-definitions--formulas)
5. [Lifecycle State Machine](#5-lifecycle-state-machine)
6. [Step-by-Step Flow](#6-step-by-step-flow)
7. [API Endpoints](#7-api-endpoints)
8. [Data Models](#8-data-models)
9. [Sample Payloads](#9-sample-payloads)
10. [Error Reference](#10-error-reference)
11. [Endpoint Quick Reference](#11-endpoint-quick-reference)

---

## 1. Objectives

- Evaluate course performance and student success rates.
- Monitor completion and pass rates across courses and instructors.
- Measure instructional effectiveness against defined benchmarks.
- Identify underperforming courses and at-risk learners early.
- Support curriculum improvements and academic planning.
- Provide data for accreditation, quality assurance, and institutional reporting.

---

## 2. User Roles & Responsibilities

| Role                       | Responsibility                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------- |
| **Instructor**             | Reviews individual student performance and course-level outcomes                   |
| **Academic Administrator** | Monitors teaching effectiveness and program success institution-wide               |
| **Branch Manager**         | Evaluates performance and trends across campus branches                            |
| **Quality Assurance Team** | Ensures academic standards are met and compliance requirements are satisfied       |
| **Management**             | Uses aggregated insights for strategic planning and resource allocation            |
| **System**                 | Aggregates data from LMS/OES, calculates KPIs, and generates reports automatically |

---

## 3. Key Data Elements

### Course Performance Fields

| Field             | Type      | Description                                  |
| ----------------- | --------- | -------------------------------------------- |
| `course_id`       | `string`  | Unique course identifier                     |
| `course_title`    | `string`  | Name of the course or module                 |
| `instructor_id`   | `uuid`    | Assigned instructor                          |
| `instructor_name` | `string`  | Instructor's full name                       |
| `branch`          | `string`  | Campus or delivery branch                    |
| `program_area`    | `string`  | Subject/programme classification             |
| `pass_mark`       | `integer` | Minimum score threshold to pass (e.g., `50`) |
| `total_enrolled`  | `integer` | Total number of registered students          |
| `completed`       | `integer` | Students who completed the course            |
| `passed`          | `integer` | Students who met the pass mark               |
| `failed`          | `integer` | Students who did not meet the threshold      |
| `average_score`   | `number`  | Mean score across enrolled students          |
| `data_source`     | `string`  | Source system: `LMS/OES`                     |

### Enrollment Row Fields (per student)

| Field                 | Type      | Description                                        |
| --------------------- | --------- | -------------------------------------------------- |
| `student_id`          | `uuid`    |                                                    |
| `student_name`        | `string`  |                                                    |
| `student_email`       | `string`  |                                                    |
| `course_id`           | `uuid`    |                                                    |
| `course_title`        | `string`  |                                                    |
| `enrollment_date`     | `date`    |                                                    |
| `student_status`      | `enum`    | `Enrolled`, `Deactivated`                          |
| `engagement_status`   | `enum`    | `In Progress`, `Completed`, `Inactive`             |
| `last_active_date`    | `date`    | Last recorded platform activity                    |
| `progress_percentage` | `number`  | Lesson/module completion percentage                |
| `is_dropout`          | `boolean` | Flagged when student disengaged without completing |
| `department_id`       | `uuid`    |                                                    |
| `department_name`     | `string`  |                                                    |

### Course Enrollment Row Fields (aggregated per course)

| Field                  | Type      | Description                                 |
| ---------------------- | --------- | ------------------------------------------- |
| `course_id`            | `uuid`    |                                             |
| `course_title`         | `string`  |                                             |
| `total_enrollments`    | `integer` | All-time enrolments including deactivated   |
| `enrollment_count`     | `integer` | Active (non-deactivated) enrolments         |
| `active_students`      | `integer` | Currently `In Progress`                     |
| `completed_students`   | `integer` | Reached course completion                   |
| `inactive_students`    | `integer` | Enrolled but disengaged                     |
| `deactivated_students` | `integer` | Removed from the platform                   |
| `dropout_rate`         | `number`  | Computed dropout percentage                 |
| `enrollment_trend`     | `enum`    | `Growing`, `Declining`, `Stable`, `No Data` |

---

## 4. KPI Definitions & Formulas

| KPI                           | Formula                                                 | Description                                  |
| ----------------------------- | ------------------------------------------------------- | -------------------------------------------- |
| **Pass Rate (%)**             | `(Passed ÷ Completed) × 100`                            | Percentage of completers who passed          |
| **Completion Rate (%)**       | `(Completed ÷ Total Enrolled) × 100`                    | Percentage of enrolled students who finished |
| **Dropout Rate (%)**          | `((Total Enrolled − Completed) ÷ Total Enrolled) × 100` | Percentage who did not complete              |
| **Average Course Score**      | `Total Scores ÷ Number of Students`                     | Mean score across all enrolled students      |
| **Overall Completion Rate**   | Average completion rate across all instructor's courses | Used in instructor-level summary             |
| **Grading Timeliness (days)** | Average days between submission and grade publication   | Measures instructor responsiveness           |

### System-Level Summary KPIs (`InstructorPerformanceSummary`)

| KPI                        | Description                                            |
| -------------------------- | ------------------------------------------------------ |
| `total_instructors`        | Count of instructors included in the report            |
| `average_completion_rate`  | Mean completion rate across all instructors            |
| `average_feedback_rating`  | Mean student feedback rating                           |
| `average_assessment_score` | Mean assessment score across all courses               |
| `average_grading_days`     | Mean days to grade submissions                         |
| `top_completion_rate`      | Highest completion rate recorded among all instructors |

---

## 5. Lifecycle State Machine

```
   REQUEST REPORT
        │
        ▼
  [ Apply Filters ]  ◄──── instructorId, courseId, departmentId,
        │                   startDate, endDate, period, page, limit
        │
        ▼
  [ Retrieve Data ]
  ┌─────────────────────────────────────────────────────────┐
  │  GET /enrollment-status-v2/students   (per-student rows) │
  │  GET /enrollment-status-v2/courses    (course aggregates)│
  │  GET /enrollment-status-v2/trends     (time-series data) │
  │  GET /instructor-performance-v2/report (instructor KPIs) │
  └─────────────────────────────────────────────────────────┘
        │
        ▼
  [ Aggregate & Calculate KPIs ]
  Pass Rate · Completion Rate · Dropout Rate · Avg Score
        │
        ▼
  [ Generate Report ]  ─────── status: "Generated"
        │
        ├──► Export (PDF / Excel / CSV / Dashboard)
        │
        └──► Archive (retained for audit & analytics)
```

---

## 6. Step-by-Step Flow

### Step 1 — Instructors Deliver Courses

Instructors facilitate course content through the LMS. Students enroll, participate in lessons, and complete assessments. The LMS records all course progress, last active dates, and engagement statuses in real time.

### Step 2 — Assessment Results Are Evaluated

The Online Examination System (OES) evaluates student submissions. Pass/fail outcomes are determined against each course's configured `pass_mark`. Final scores are stored per student per course.

### Step 3 — User Selects Report Filters

The report requester (Admin, Instructor, or Manager) selects filters:

- `instructorId` — scope report to a single instructor
- `courseId` — scope to a specific course
- `departmentId` — filter by organisational department
- `startDate` / `endDate` — date range for the data window
- `period` — trend grouping: `monthly`, `quarterly`, or `yearly`
- `studentStatus` — `Enrolled` or `Deactivated`
- `engagementStatus` — `In Progress`, `Completed`, or `Inactive`

### Step 4 — System Retrieves Enrollment Data

**Call:** `GET /api/v1/enrollment-status-v2/students`

Returns all per-student enrollment rows filtered by the selected criteria. Each row includes `student_status`, `engagement_status`, `progress_percentage`, `last_active_date`, and `is_dropout`.

### Step 5 — System Retrieves Course-Level Breakdown

**Call:** `GET /api/v1/enrollment-status-v2/courses`

Returns aggregated data per course: `total_enrollments`, `active_students`, `completed_students`, `inactive_students`, `dropout_rate`, and `enrollment_trend`.

### Step 6 — System Retrieves Trend Data

**Call:** `GET /api/v1/enrollment-status-v2/trends`

Returns time-series enrollment growth (monthly counts), per-course engagement trends, dropout pattern rankings, and an activity heatmap showing active vs inactive distributions over time.

### Step 7 — System Retrieves Instructor Performance Metrics

**Call:** `GET /api/v1/instructor-performance-v2/report`

Returns per-instructor metrics: `courses_delivered`, `total_enrolled`, `total_completed`, `completion_rate`, `average_assessment_score`, `average_exam_score`, `average_project_score`, `grading_timeliness_days`, and score trend data. Includes a `summary` block with institution-wide KPIs.

### Step 8 — Drill Down on a Single Instructor (Optional)

**Call:** `GET /api/v1/instructor-performance-v2/report/{instructorId}`

Returns the full performance breakdown for a specific instructor with course-by-course detail and period-granularity score trends.

### Step 9 — KPIs Are Calculated

The reporting engine computes:

```
Pass Rate (%)         = (Passed ÷ Completed) × 100
Completion Rate (%)   = (Completed ÷ Total Enrolled) × 100
Dropout Rate (%)      = ((Total Enrolled − Completed) ÷ Total Enrolled) × 100
Average Course Score  = Total Scores ÷ Number of Students
```

### Step 10 — Report Is Generated and Displayed

The system assembles the report, assigns `status: "Generated"`, and displays it in tabular and/or chart format. Data is visualized as tables, bar charts, trend lines, and completion funnels depending on the requester's access level.

### Step 11 — Export / Share

The report is available for download in PDF, Excel, CSV, or as a live dashboard view. The requester can share the report link or schedule automated delivery.

### Step 12 — Archive for Audit

Completed reports are archived and linked to the corresponding academic period. Archived reports are read-only and retained for accreditation, quality assurance, and historical analysis.

---

## 7. API Endpoints

All endpoints require `Authorization: Bearer <JWT>`.
Base URL: `/api/v1`

---

### `GET /enrollment-status-v2/students`

**Per-student enrollment status report**

Returns per-student-per-course rows including student status, engagement status, last active date, progress percentage, and dropout flag. Supports full filtering and pagination.

**Query Parameters:**

| Parameter          | Type      | Required | Description                                  |
| ------------------ | --------- | -------- | -------------------------------------------- |
| `courseId`         | `uuid`    | ❌       | Scope to a specific course                   |
| `departmentId`     | `uuid`    | ❌       | Filter by department                         |
| `instructorId`     | `uuid`    | ❌       | Filter to an instructor's courses            |
| `studentStatus`    | `enum`    | ❌       | `Enrolled` or `Deactivated`                  |
| `engagementStatus` | `enum`    | ❌       | `In Progress`, `Completed`, `Inactive`       |
| `startDate`        | `date`    | ❌       | Enrollment date range start (ISO 8601)       |
| `endDate`          | `date`    | ❌       | Enrollment date range end                    |
| `page`             | `integer` | ❌       | Page number (default: `1`)                   |
| `limit`            | `integer` | ❌       | Records per page (default: `50`, max: `200`) |

**Response `data` shape:** `EnrollmentStudentReport`

```json
{
  "reportName": "Enrollment Status Report",
  "generatedAt": "2025-12-15T09:00:00Z",
  "total": 120,
  "page": 1,
  "limit": 50,
  "recordCount": 50,
  "executionTimeMs": 143,
  "kpis": { ... },
  "data": [ { ...EnrollmentStudentRow } ]
}
```

**Responses:**

- `200 OK` — Report data returned

---

### `GET /enrollment-status-v2/students/{studentId}`

**Enrollment detail for a single student**

Returns all course enrollments for a specific student with engagement status per course.

**Path Parameters:**

| Parameter   | Type   | Required |
| ----------- | ------ | -------- |
| `studentId` | `uuid` | ✅       |

**Responses:**

- `200 OK` — Student enrollment records
- `404 Not Found` — No enrollment data found for this student

---

### `GET /enrollment-status-v2/courses`

**Course-level enrollment breakdown**

Returns aggregated enrollment data per course including active/completed/inactive/deactivated student counts, dropout rate, and enrollment trend direction.

**Query Parameters:**

| Parameter      | Type      | Required | Description                       |
| -------------- | --------- | -------- | --------------------------------- |
| `courseId`     | `uuid`    | ❌       | Scope to a specific course        |
| `departmentId` | `uuid`    | ❌       | Filter by department              |
| `instructorId` | `uuid`    | ❌       | Filter to an instructor's courses |
| `startDate`    | `date`    | ❌       |                                   |
| `endDate`      | `date`    | ❌       |                                   |
| `page`         | `integer` | ❌       | Default: `1`                      |
| `limit`        | `integer` | ❌       | Default: `50`, max: `200`         |

**Response `data` shape:** `EnrollmentCourseReport`

```json
{
  "reportName": "Course Enrollment Report",
  "generatedAt": "2025-12-15T09:00:00Z",
  "total": 15,
  "page": 1,
  "limit": 50,
  "data": [ { ...EnrollmentCourseRow } ]
}
```

**Responses:**

- `200 OK` — Course-level enrollment report

---

### `GET /enrollment-status-v2/trends`

**Enrollment trend and activity analysis**

Returns time-series enrollment growth, per-course engagement trends, dropout pattern detection ranked by dropout count, and an activity heatmap of active vs inactive distributions.

**Query Parameters:**

| Parameter      | Type   | Required | Description                       |
| -------------- | ------ | -------- | --------------------------------- |
| `courseId`     | `uuid` | ❌       | Scope trends to a specific course |
| `departmentId` | `uuid` | ❌       |                                   |
| `instructorId` | `uuid` | ❌       |                                   |
| `startDate`    | `date` | ❌       |                                   |
| `endDate`      | `date` | ❌       |                                   |

**Response `data` shape:** `EnrollmentTrends`

```json
{
  "reportName": "Enrollment Trends Report",
  "generatedAt": "2025-12-15T09:00:00Z",
  "enrollment_growth": [
    { "month": "2025-01", "count": 45 },
    { "month": "2025-02", "count": 62 }
  ],
  "engagement_trend_per_course": [ ... ],
  "dropout_patterns": [ ... ],
  "activity_heatmap": [ ... ]
}
```

**Responses:**

- `200 OK` — Trend analysis data

---

### `GET /instructor-performance-v2/report`

**Instructor performance report**

Returns per-instructor metrics including courses delivered, completion rate, average scores (assessment, exam, project), grading timeliness, and score trend over the selected period. Includes a `summary` object with institution-wide KPIs.

**Query Parameters:**

| Parameter      | Type      | Required | Description                                                |
| -------------- | --------- | -------- | ---------------------------------------------------------- |
| `instructorId` | `uuid`    | ❌       | Filter to a specific instructor                            |
| `departmentId` | `uuid`    | ❌       | Filter by department                                       |
| `courseId`     | `uuid`    | ❌       | Filter to a specific course                                |
| `startDate`    | `date`    | ❌       |                                                            |
| `endDate`      | `date`    | ❌       |                                                            |
| `period`       | `enum`    | ❌       | Trend grouping: `monthly`, `quarterly` (default), `yearly` |
| `page`         | `integer` | ❌       | Default: `1`                                               |
| `limit`        | `integer` | ❌       |                                                            |

**Response `data` shape:** `InstructorPerformanceReport`

```json
{
  "reportName": "Instructor Performance Report",
  "generatedAt": "2025-12-15T09:00:00Z",
  "period": "quarterly",
  "total": 8,
  "page": 1,
  "summary": {
    "total_instructors": 8,
    "average_completion_rate": 87.5,
    "average_feedback_rating": 4.2,
    "average_assessment_score": 78.3,
    "average_grading_days": 2.4,
    "top_completion_rate": 96.0
  },
  "data": [ { ...InstructorRow } ]
}
```

**Responses:**

- `200 OK` — Instructor performance report

---

### `GET /instructor-performance-v2/report/{instructorId}`

**Drill-down detail for a single instructor**

Returns the complete performance breakdown for one instructor: all delivered courses, per-course scores, grading timeliness, student completion data, and period-level score trend.

**Path Parameters:**

| Parameter      | Type   | Required |
| -------------- | ------ | -------- |
| `instructorId` | `uuid` | ✅       |

**Query Parameters:**

| Parameter   | Type   | Required | Description                      |
| ----------- | ------ | -------- | -------------------------------- |
| `startDate` | `date` | ❌       |                                  |
| `endDate`   | `date` | ❌       |                                  |
| `period`    | `enum` | ❌       | `monthly`, `quarterly`, `yearly` |

**Responses:**

- `200 OK` — Instructor detail data
- `404 Not Found` — Instructor not found

---

## 8. Data Models

### `EnrollmentStudentRow`

| Field                 | Type                                   | Description                                     |
| --------------------- | -------------------------------------- | ----------------------------------------------- |
| `student_id`          | `uuid`                                 |                                                 |
| `student_name`        | `string \| null`                       |                                                 |
| `student_email`       | `string \| null`                       |                                                 |
| `department_id`       | `uuid \| null`                         |                                                 |
| `department_name`     | `string \| null`                       |                                                 |
| `course_id`           | `uuid`                                 |                                                 |
| `course_title`        | `string \| null`                       |                                                 |
| `enrollment_date`     | `date \| null`                         |                                                 |
| `student_status`      | `Enrolled \| Deactivated`              | Platform account status                         |
| `engagement_status`   | `In Progress \| Completed \| Inactive` | Course-level engagement                         |
| `last_active_date`    | `date \| null`                         | Last recorded activity                          |
| `progress_percentage` | `number`                               | % of course content completed                   |
| `is_dropout`          | `boolean`                              | True when student disengaged without completing |

### `EnrollmentCourseRow`

| Field                  | Type                                        | Description                          |
| ---------------------- | ------------------------------------------- | ------------------------------------ |
| `course_id`            | `uuid`                                      |                                      |
| `course_title`         | `string`                                    |                                      |
| `department_id`        | `uuid \| null`                              |                                      |
| `department_name`      | `string \| null`                            |                                      |
| `total_enrollments`    | `integer`                                   | All enrolments including deactivated |
| `enrollment_count`     | `integer`                                   | Active (non-deactivated) enrolments  |
| `active_students`      | `integer`                                   | Currently In Progress                |
| `completed_students`   | `integer`                                   | Reached completion                   |
| `inactive_students`    | `integer`                                   | Enrolled but disengaged              |
| `deactivated_students` | `integer`                                   | Removed from platform                |
| `dropout_rate`         | `number`                                    | Computed %                           |
| `enrollment_trend`     | `Growing \| Declining \| Stable \| No Data` |                                      |

### `EnrollmentKpis`

| Field                            | Type      | Description                                   |
| -------------------------------- | --------- | --------------------------------------------- |
| `total_students_in_lms`          | `integer` | All students registered on platform           |
| `total_enrolled_students`        | `integer` | Currently enrolled count                      |
| `total_active_students`          | `integer` | In Progress across all courses                |
| `total_completed_students`       | `integer` |                                               |
| `total_inactive_students`        | `integer` |                                               |
| `total_deactivated_students`     | `integer` |                                               |
| `overall_dropout_rate`           | `number`  | %                                             |
| `average_course_completion_rate` | `number`  | %                                             |
| `enrollment_distribution`        | `object`  | `{ enrolled, deactivated }` counts            |
| `engagement_distribution`        | `object`  | `{ in_progress, completed, inactive }` counts |

### `InstructorRow`

| Field                      | Type             | Description                                          |
| -------------------------- | ---------------- | ---------------------------------------------------- |
| `instructor_id`            | `uuid`           |                                                      |
| `instructor_name`          | `string \| null` |                                                      |
| `instructor_email`         | `string \| null` |                                                      |
| `department_id`            | `uuid \| null`   |                                                      |
| `department`               | `string \| null` | Department name                                      |
| `courses_delivered`        | `integer`        | Total courses taught                                 |
| `total_enrolled`           | `integer`        | Students enrolled across all courses                 |
| `total_completed`          | `integer`        | Students who completed                               |
| `completion_rate`          | `number`         | % enrolled who completed                             |
| `average_assessment_score` | `number \| null` |                                                      |
| `average_exam_score`       | `number \| null` |                                                      |
| `average_project_score`    | `number \| null` |                                                      |
| `grading_timeliness_days`  | `number \| null` | Avg days to grade submissions                        |
| `score_trend`              | `array`          | Period-based score progression `[{ period, score }]` |

---

## 9. Sample Payloads

### Course Performance Input Payload

```json
{
  "course_id": "CRS-101",
  "course_title": "Data Protection Basics",
  "instructor_id": "INS-001",
  "instructor_name": "Dr. Jane Smith",
  "branch": "Lagos Campus",
  "program_area": "Information Security",
  "pass_mark": 50,
  "total_enrolled": 32,
  "completed": 30,
  "passed": 28,
  "failed": 2,
  "average_score": 81,
  "data_source": "LMS/OES"
}
```

### Report Generation Request Payload

```json
{
  "report_id": "ITR-CCR-2025-001",
  "report_name": "Course Completion & Pass Rate Report",
  "report_type": "Standard",
  "generated_by": "Academic Admin",
  "instructor_id": "INS-001",
  "branch": "Lagos Campus",
  "program_area": "All",
  "course_id": "All",
  "date_range": {
    "start_date": "2025-01-01",
    "end_date": "2025-12-31"
  },
  "filters": {
    "department": "All",
    "course_status": "Completed"
  },
  "data_source": "LMS/OES",
  "report_format": "PDF",
  "visualization": "Table/Chart",
  "frequency": "On-Demand",
  "access_level": "Instructor/Admin/Management",
  "approval_status": "Draft"
}
```

### Expected JSON Report Output

```json
{
  "report_id": "ITR-CCR-2025-001",
  "report_name": "Course Completion & Pass Rate Report",
  "generated_by": "Academic Admin",
  "generated_date": "2025-12-15",
  "instructor": "Dr. Jane Smith",
  "branch": "Lagos Campus",
  "program_area": "Information Security",
  "courses": [
    {
      "course_title": "Data Protection Basics",
      "total_enrolled": 32,
      "completed": 30,
      "passed": 28,
      "failed": 2,
      "pass_rate": 93.3,
      "completion_rate": 93.8,
      "average_score": 81
    },
    {
      "course_title": "Microfinance Fundamentals",
      "total_enrolled": 25,
      "completed": 20,
      "passed": 18,
      "failed": 2,
      "pass_rate": 90.0,
      "completion_rate": 80.0,
      "average_score": 77
    }
  ],
  "kpis": {
    "overall_pass_rate": 91.8,
    "overall_completion_rate": 88.9,
    "average_course_score": 79,
    "dropout_rate": 11.1
  },
  "report_format": "PDF",
  "status": "Generated"
}
```

### Fetch All Students in a Course (paginated)

```
GET /api/v1/enrollment-status-v2/students
    ?courseId=<uuid>
    &engagementStatus=Completed
    &startDate=2025-01-01
    &endDate=2025-12-31
    &page=1
    &limit=50
```

### Fetch Course Breakdown for an Instructor

```
GET /api/v1/enrollment-status-v2/courses
    ?instructorId=<uuid>
    &startDate=2025-01-01
    &endDate=2025-12-31
```

### Fetch Instructor Performance — Quarterly Trend

```
GET /api/v1/instructor-performance-v2/report
    ?instructorId=<uuid>
    &period=quarterly
    &startDate=2025-01-01
    &endDate=2025-12-31
```

### Drill Down on One Instructor

```
GET /api/v1/instructor-performance-v2/report/{instructorId}
    ?period=monthly
    &startDate=2025-09-01
    &endDate=2025-12-31
```

---

## 10. Error Reference

| HTTP Code | Meaning               | Common Cause                                                |
| --------- | --------------------- | ----------------------------------------------------------- |
| `401`     | Unauthorized          | Missing or expired Bearer JWT                               |
| `404`     | Not Found             | `studentId` or `instructorId` does not exist or has no data |
| `500`     | Internal Server Error | Unexpected server-side failure                              |

---

## 11. Endpoint Quick Reference

| Method | Endpoint                                                  | Description                                                        |
| ------ | --------------------------------------------------------- | ------------------------------------------------------------------ |
| `GET`  | `/api/v1/enrollment-status-v2/students`                   | Per-student enrollment rows with filtering and pagination          |
| `GET`  | `/api/v1/enrollment-status-v2/students/{studentId}`       | All enrollments for a single student                               |
| `GET`  | `/api/v1/enrollment-status-v2/courses`                    | Aggregated enrollment breakdown per course                         |
| `GET`  | `/api/v1/enrollment-status-v2/trends`                     | Time-series enrollment growth, engagement trends, dropout patterns |
| `GET`  | `/api/v1/instructor-performance-v2/report`                | Multi-instructor performance report with summary KPIs              |
| `GET`  | `/api/v1/instructor-performance-v2/report/{instructorId}` | Single instructor drill-down detail                                |

---

## Data Sources

| Source                               | Role                                                  |
| ------------------------------------ | ----------------------------------------------------- |
| **Learning Management System (LMS)** | Course progress, engagement status, last active dates |
| **Online Examination System (OES)**  | Assessment results, pass/fail outcomes, scores        |
| **Student Information System (SIS)** | Student profiles, department, enrollment status       |
| **Course Management Module**         | Course metadata, pass marks, programme areas          |
| **Instructor Management Module**     | Instructor profiles, department assignments           |
| **Reporting & Analytics Engine**     | KPI computation, aggregation, report assembly         |
