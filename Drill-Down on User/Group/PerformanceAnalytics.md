# TC19 – Drill-Down on User / Group / Performance Analytics

> **Base URLs**
> | Environment | URL |
> |---|---|
> | Local | `http://localhost:8089` |
> | Production | `https://gclms.xanotech.org` |
>
> **Authentication:** All endpoints require `Authorization: Bearer <JWT>`.

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Architecture at a Glance](#2-architecture-at-a-glance)
3. [Step-by-Step Flow](#3-step-by-step-flow)
   - [Phase 1 – User / Group Identification](#phase-1--user--group-identification)
   - [Phase 2 – Metrics Data Retrieval](#phase-2--metrics-data-retrieval)
   - [Phase 3 – Performance Analytics Aggregation](#phase-3--performance-analytics-aggregation)
   - [Phase 4 – Drill-Down Analytics Processing](#phase-4--drill-down-analytics-processing)
   - [Phase 5 – KPI Computation](#phase-5--kpi-computation)
   - [Phase 6 – Status & Validation Logic](#phase-6--status--validation-logic)
   - [Phase 7 – Analytics Report Generation](#phase-7--analytics-report-generation)
4. [Endpoint Reference](#4-endpoint-reference)
   - [4.1 Performance Filters](#41-performance-filters)
   - [4.2 Visual Analytics](#42-visual-analytics)
   - [4.3 Instructor Performance](#43-instructor-performance)
5. [Schema Reference](#5-schema-reference)
   - [PerformanceFilterInput](#performancefilterinput)
   - [FilterCriteria](#filtercriteria)
   - [FilterResult / StudentPerformanceRow](#filterresult--studentperformancerow)
   - [VisualStudentRow](#visualstudentrow)
   - [VisualDashboard](#visualdashboard)
   - [VisualKpis](#visualkpis)
   - [InstructorRow](#instructorrow)
   - [InstructorPerformanceSummary](#instructorperformancesummary)
   - [GradingScale](#gradingscale)
6. [KPI Reference](#6-kpi-reference)
7. [Enum & Status Values](#7-enum--status-values)
8. [Developer Notes](#8-developer-notes)

---

## 1. Module Overview

TC19 delivers a **Performance Analytics & Reporting Module** that gives a consolidated, drill-down view of performance data across users, groups, departments, and courses.

| Capability        | Description                                                                 |
| ----------------- | --------------------------------------------------------------------------- |
| Entity targeting  | Scope analytics to a User, Group, Department, or Course                     |
| Role-aware views  | Student self-service vs Instructor/Admin org-wide views                     |
| Drill-down chain  | Org → Department → Course → Individual student/instructor                   |
| KPI computation   | Avg score, pass rate, at-risk %, completion rate, grading timeliness        |
| Visual indicators | Color-coded tiers: Green / Yellow / Red + Excellent / Good / Average / Poor |
| Filter management | Save, reuse, and share named filter configurations                          |
| Audit & history   | Every execution is logged with timestamp, `requestedBy`, and access count   |
| Export            | Dashboard data exportable in multiple formats                               |

---

## 2. Architecture at a Glance

```
┌─────────────────────────────────────────────────────────────────┐
│                    TC19 Analytics Module                        │
│                                                                 │
│  ┌─────────────────────┐   ┌──────────────────────────────────┐ │
│  │  Performance Filters│   │      Visual Analytics            │ │
│  │  /performance-      │   │      /visual-analytics-v2/       │ │
│  │  filters-v2/        │   │                                  │ │
│  │                     │   │  thresholds → dashboard → report │ │
│  │  grading-scale      │   │  per-student drill-down          │ │
│  │  filters (CRUD)     │   └──────────────────────────────────┘ │
│  │  filters/execute    │                                        │
│  │  preview            │   ┌──────────────────────────────────┐ │
│  │  stats              │   │    Instructor Performance        │ │
│  └─────────────────────┘   │    /instructor-performance-v2/   │ │
│                             │                                  │ │
│                             │  report (list) → report/{id}    │ │
│                             └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Step-by-Step Flow

### Phase 1 – User / Group Identification

**Goal:** Establish the target entity and retrieve the grading context before any analytics are computed.

**Endpoints called:**

```
1. GET /api/v1/performance-filters-v2/grading-scale
```

Returns the institution's grading classification scale (e.g. A = 90–100, B+ = 85–89 … F = <60) and the full list of metric field keys available in filter results. Call this once at session start to populate grading dropdowns and metric checkboxes in the UI.

**Sample response:**

```json
{
  "gradingScale": {
    "Excellent": "80-100",
    "Very Good": "70-79",
    "Good": "60-69",
    "Fair": "50-59",
    "Pass": "40-49",
    "Fail": "<40"
  },
  "availableMetrics": [
    "overall_avg_score",
    "exam_avg_score",
    "assessment_avg_score",
    "grade",
    "pass_fail",
    "completion_rate"
  ]
}
```

```
2. GET /api/v1/performance-filters-v2/filters
   ?status=active&myFilters=true
```

Check whether a saved filter already exists for the target entity scope. Reuse it to avoid re-entering criteria.

---

### Phase 2 – Metrics Data Retrieval

**Goal:** Retrieve raw performance and completion metrics for the identified scope.

**For student-level analytics,** build and execute a filter:

```
POST /api/v1/performance-filters-v2/preview
```

Use this for ad-hoc retrieval without persisting a filter. Pass `FilterCriteria` to scope by `courseId`, `departmentId`, `studentId`, or `instructorId`, plus threshold filters (`scoreMin`, `attendanceMin`, `grade`, `passFail`).

**Request body:**

```json
{
  "criteria": {
    "courseId": "<uuid>",
    "departmentId": "<uuid>",
    "scoreMin": 0,
    "scoreMax": 100,
    "startDate": "2025-01-01",
    "endDate": "2025-12-31"
  },
  "performanceMetrics": [
    "overall_avg_score",
    "grade",
    "pass_fail",
    "completion_rate"
  ],
  "sortBy": { "field": "overall_avg_score", "order": "DESC" }
}
```

**For instructor-level analytics:**

```
GET /api/v1/instructor-performance-v2/report
  ?departmentId=<uuid>
  &courseId=<uuid>
  &startDate=2025-01-01
  &endDate=2025-12-31
  &period=quarterly
```

Returns per-instructor rows with: `courses_delivered`, `total_enrolled`, `total_completed`, `completion_rate`, `average_score`, `grading_timeliness_days`, `feedback_rating`, `score_trend[]`.

---

### Phase 3 – Performance Analytics Aggregation

**Goal:** Compute aggregated metrics — averages, rates, distributions — across the selected scope.

**For student group aggregation:**

```
POST /api/v1/performance-filters-v2/filters/{filterId}/execute
```

Runs the saved filter against live data and returns:

- Per-student `StudentPerformanceRow` records
- Aggregated `kpis` object with `average_performance`, `pass_rate`, `fail_rate`, `high_performers_percentage`, `at_risk_percentage`, and full `grade_distribution` map.

**For visual aggregation across a course:**

```
GET /api/v1/visual-analytics-v2/dashboard
  ?courseId=<uuid>
  &startDate=2025-01-01
  &endDate=2025-12-31
```

Returns chart-ready aggregations:

- `achievement_distribution` — count per tier (Excellent / Good / Average / Poor)
- `visual_indicator_distribution` — count per color (Green / Yellow / Red)
- `score_histogram` — student counts per score band (0–59, 60–69, 70–79, 80–100)
- `top_performers` — top 5 students by `performance_metric`
- `at_risk_students` — all students in the Poor category
- `chart_data.pie`, `chart_data.bar`, `chart_data.heatmap` — pre-shaped arrays for direct chart rendering

**For instructor-level aggregation:**

The `GET /instructor-performance-v2/report` response includes an `InstructorPerformanceSummary` object alongside the per-row data:

- `average_completion_rate`
- `average_feedback_rating`
- `average_assessment_score`
- `average_grading_days`
- `top_completion_rate`

---

### Phase 4 – Drill-Down Analytics Processing

**Goal:** Navigate from broad aggregates into specific user, group, department, or course detail.

**Drill-down path: Org → Department → Course → Student**

```
Step 1 – Org-wide (no scope filters):
  GET /api/v1/visual-analytics-v2/dashboard
  GET /api/v1/instructor-performance-v2/report

Step 2 – Department scope:
  GET /api/v1/visual-analytics-v2/report?courseId=<uuid>
  GET /api/v1/instructor-performance-v2/report?departmentId=<uuid>

Step 3 – Course scope (add courseId to criteria):
  POST /api/v1/performance-filters-v2/preview
    criteria.courseId = <uuid>

Step 4 – Individual student:
  GET /api/v1/visual-analytics-v2/report/{studentId}
    ?courseId=<uuid>&startDate=...&endDate=...

Step 5 – Individual instructor:
  GET /api/v1/instructor-performance-v2/report/{instructorId}
    ?period=monthly&startDate=...&endDate=...
```

**Individual student drill-down response** (`GET /visual-analytics-v2/report/{studentId}`) includes:

- `performance_metric` — combined average score (exam + assessment)
- `completion_rate` — lesson completion percentage
- `achievement_category` — Excellent / Good / Average / Poor
- `visual_indicator` — Green / Yellow / Red
- `chart_type` — recommended chart: Bar / Heatmap / Gauge
- `class_average` — course-level class mean
- `comparison_to_average` — signed deviation e.g. `"+16%"` or `"-8%"`
- `remarks` — auto-generated performance remark

**Individual instructor drill-down** (`GET /instructor-performance-v2/report/{instructorId}`) includes the full `InstructorRow` plus a `score_trend[]` array showing `average_score` per period (e.g. `2026-Q1`, `2026-01`).

---

### Phase 5 – KPI Computation

**Goal:** Surface the key performance indicators for dashboard cards and summary rows.

**Student/Group KPIs** — returned inside `FilterResult.kpis` from filter execution:

| KPI Field                    | Description                                            |
| ---------------------------- | ------------------------------------------------------ |
| `total_students`             | Total matched students in the filter result            |
| `average_performance`        | Mean `overall_avg_score` across all matched students   |
| `high_performers_percentage` | % of students with grade Excellent or Very Good        |
| `at_risk_percentage`         | % of students with grade Fail or Poor visual indicator |
| `pass_rate`                  | % of students with `pass_fail = Pass`                  |
| `fail_rate`                  | % of students with `pass_fail = Fail`                  |
| `grade_distribution`         | Object mapping each grade label to student count       |

**Visual Analytics KPIs** — returned inside `VisualKpis`:

| KPI Field                            | Description                            |
| ------------------------------------ | -------------------------------------- |
| `total_students`                     | Total students in scope                |
| `class_average`                      | Mean combined performance metric       |
| `students_meeting_target`            | Count of students above pass threshold |
| `students_meeting_target_percentage` | % of students above pass threshold     |
| `excellent_percentage`               | % of students in Excellent tier        |
| `good_percentage`                    | % in Good tier                         |
| `average_percentage`                 | % in Average tier                      |
| `poor_percentage`                    | % in Poor tier                         |

**Filter Module Usage KPIs** — returned by `GET /performance-filters-v2/stats`:

| KPI Field               | Description                            |
| ----------------------- | -------------------------------------- |
| `totalFiltersSaved`     | Total saved filter configurations      |
| `totalExecutions`       | Total times any filter has been run    |
| `previewExecutions`     | Ad-hoc preview runs (not saved)        |
| `savedFilterExecutions` | Executions of saved filters            |
| `mostUsedFilters`       | Top 5 filters by `accessCount`         |
| `avgGenerationTimeMs`   | Average execution time in milliseconds |

**Instructor KPIs** — returned in `InstructorPerformanceSummary`:

| KPI Field                  | Description                                         |
| -------------------------- | --------------------------------------------------- |
| `total_instructors`        | Total instructors in scope                          |
| `average_completion_rate`  | Mean student completion rate across all instructors |
| `average_feedback_rating`  | Mean feedback rating                                |
| `average_assessment_score` | Mean assessment score across all instructor courses |
| `average_grading_days`     | Mean days from submission to grading                |
| `top_completion_rate`      | Highest completion rate among all instructors       |

---

### Phase 6 – Status & Validation Logic

**Goal:** Validate filter configuration before execution and confirm result integrity.

**Filter lifecycle states:**

```
draft → active → archived
```

- Filters are created in `draft` status by default.
- Set `status: "active"` before executing via the saved filter route.
- Archived filters cannot be executed; retrieve and update status to reactive.

**Validation checks at execution time:**

- Criteria fields (`courseId`, `studentId`, `departmentId`) must be valid UUIDs if supplied.
- `scoreMin` must be ≤ `scoreMax` (both 0–100).
- `attendanceMin` must be 0–100.
- `startDate` must be before or equal to `endDate`.
- `performanceMetrics` array must contain at least one valid metric key (obtainable from `GET /grading-scale`).
- `accessLevel` controls who can execute the filter: `instructor` (own courses only), `admin` (org-wide), `all`.

**Access control:**

- `myFilters=true` on `GET /filters` restricts results to the authenticated user's own configurations.
- `sharedWith` on a filter configuration allows specific user IDs to execute it.

---

### Phase 7 – Analytics Report Generation

**Goal:** Produce the final structured report for display, export, or audit.

#### Option A — Student Performance Filter Report

```
POST /api/v1/performance-filters-v2/filters/{filterId}/execute
Body: { "sortBy": { "field": "overall_avg_score", "order": "DESC" } }
```

**Response structure (`FilterResult`):**

```json
{
  "filterId": "<uuid>",
  "filterName": "Top Performers – Module 3",
  "generatedAt": "2025-11-01T09:00:00Z",
  "recordCount": 42,
  "executionTimeMs": 183,
  "kpis": {
    "total_students": 42,
    "average_performance": 74.5,
    "high_performers_percentage": 38.1,
    "at_risk_percentage": 11.9,
    "pass_rate": 88.1,
    "fail_rate": 11.9,
    "grade_distribution": {
      "Excellent": 8,
      "Very Good": 8,
      "Good": 14,
      "Fair": 6,
      "Pass": 3,
      "Fail": 3
    }
  },
  "data": [
    {
      "student_id": "uuid",
      "student_name": "Jane Doe",
      "student_email": "jane@example.com",
      "course_id": "uuid",
      "course_title": "Agriculture Fundamentals",
      "exam_avg_score": 82.0,
      "assessment_avg_score": 78.5,
      "overall_avg_score": 80.2,
      "grade": "Excellent",
      "pass_fail": "Pass",
      "exam_count": 3,
      "assessment_count": 5,
      "completion_rate": 95.0,
      "total_lessons": 20,
      "completed_lessons": 19
    }
  ]
}
```

#### Option B — Visual Analytics Report

```
GET /api/v1/visual-analytics-v2/report
  ?courseId=<uuid>&page=1&limit=50
```

Adds visual layers on top of performance data: `visual_indicator`, `achievement_category`, `chart_type`, `comparison_to_average`, and auto-generated `remarks` per student.

#### Option C — Instructor Performance Report

```
GET /api/v1/instructor-performance-v2/report
  ?departmentId=<uuid>&period=quarterly
```

Returns per-instructor rows with `score_trend[]` (quarterly/monthly/yearly) plus org-level `InstructorPerformanceSummary` KPIs.

---

## 4. Endpoint Reference

### 4.1 Performance Filters

**Base path:** `/api/v1/performance-filters-v2`

| #   | Method   | Endpoint                      | Summary                                                              |
| --- | -------- | ----------------------------- | -------------------------------------------------------------------- |
| 1   | `GET`    | `/grading-scale`              | Get grading scale and available metric field keys                    |
| 2   | `POST`   | `/filters`                    | Create a named, reusable performance filter configuration            |
| 3   | `GET`    | `/filters`                    | List saved filter configurations                                     |
| 4   | `GET`    | `/filters/{filterId}`         | Retrieve a single filter configuration                               |
| 5   | `PUT`    | `/filters/{filterId}`         | Update a filter configuration                                        |
| 6   | `DELETE` | `/filters/{filterId}`         | Delete a filter configuration                                        |
| 7   | `POST`   | `/filters/{filterId}/execute` | Execute a saved filter against live data                             |
| 8   | `POST`   | `/preview`                    | Ad-hoc filter preview without saving                                 |
| 9   | `GET`    | `/stats`                      | Usage KPIs: execution counts, most-used filters, avg generation time |

**Query parameters for `GET /filters`:**

| Parameter   | Type    | Required | Values                        | Description                                     |
| ----------- | ------- | -------- | ----------------------------- | ----------------------------------------------- |
| `status`    | string  | No       | `active`, `draft`, `archived` | Filter by lifecycle state                       |
| `myFilters` | boolean | No       | `true` / `false`              | Return only filters created by the current user |
| `page`      | integer | No       | default `1`                   | Page number                                     |
| `limit`     | integer | No       | default `20`                  | Results per page                                |

**Request body for `POST /filters` and `PUT /filters/{filterId}`:** See [PerformanceFilterInput](#performancefilterinput).

**Request body for `POST /filters/{filterId}/execute`:**

```json
{
  "sortBy": {
    "field": "overall_avg_score",
    "order": "DESC"
  }
}
```

**Request body for `POST /preview`:**

```json
{
  "criteria": { ... },
  "performanceMetrics": ["overall_avg_score", "grade", "pass_fail", "completion_rate"],
  "sortBy": { "field": "overall_avg_score", "order": "DESC" }
}
```

---

### 4.2 Visual Analytics

**Base path:** `/api/v1/visual-analytics-v2`

| #   | Method | Endpoint              | Summary                                                       |
| --- | ------ | --------------------- | ------------------------------------------------------------- |
| 1   | `GET`  | `/thresholds`         | Get achievement category thresholds and color indicator rules |
| 2   | `GET`  | `/dashboard`          | Aggregate visual analytics dashboard with chart-ready data    |
| 3   | `GET`  | `/report`             | Per-student visual analytics report (paginated)               |
| 4   | `GET`  | `/report/{studentId}` | Visual analytics drill-down for a single student              |

**Query parameters for `GET /dashboard`:**

| Parameter   | Type | Required | Description                |
| ----------- | ---- | -------- | -------------------------- |
| `courseId`  | uuid | No       | Scope to a specific course |
| `startDate` | date | No       | Range start (ISO 8601)     |
| `endDate`   | date | No       | Range end (ISO 8601)       |

**Query parameters for `GET /report`:**

| Parameter               | Type    | Required | Values                                 | Description           |
| ----------------------- | ------- | -------- | -------------------------------------- | --------------------- |
| `courseId`              | uuid    | No       | —                                      | Filter by course      |
| `studentId`             | uuid    | No       | —                                      | Filter to one student |
| `startDate` / `endDate` | date    | No       | —                                      | Date range            |
| `achievementCategory`   | string  | No       | `Excellent`, `Good`, `Average`, `Poor` | Filter by tier        |
| `visualIndicator`       | string  | No       | `Green`, `Yellow`, `Red`               | Filter by color       |
| `page`                  | integer | No       | default `1`                            | —                     |
| `limit`                 | integer | No       | default `50`                           | —                     |

**Query parameters for `GET /report/{studentId}`:**

| Parameter               | Type | Required       | Description       |
| ----------------------- | ---- | -------------- | ----------------- |
| `studentId`             | uuid | **Yes** (path) | Target student    |
| `courseId`              | uuid | No             | Scope to a course |
| `startDate` / `endDate` | date | No             | Date range        |

---

### 4.3 Instructor Performance

**Base path:** `/api/v1/instructor-performance-v2`

| #   | Method | Endpoint                 | Summary                                                         |
| --- | ------ | ------------------------ | --------------------------------------------------------------- |
| 1   | `GET`  | `/report`                | Paginated instructor performance report with summary KPIs       |
| 2   | `GET`  | `/report/{instructorId}` | Drill-down detail for a single instructor including score trend |

**Query parameters for `GET /report`:**

| Parameter               | Type    | Required | Values                                                  | Description              |
| ----------------------- | ------- | -------- | ------------------------------------------------------- | ------------------------ |
| `instructorId`          | uuid    | No       | —                                                       | Filter to one instructor |
| `departmentId`          | uuid    | No       | —                                                       | Filter by department     |
| `courseId`              | uuid    | No       | —                                                       | Filter by course         |
| `startDate` / `endDate` | date    | No       | —                                                       | Date range               |
| `period`                | string  | No       | `monthly`, `quarterly`, `yearly` (default: `quarterly`) | Score trend grouping     |
| `page`                  | integer | No       | default `1`                                             | —                        |
| `limit`                 | integer | No       | default `50`                                            | —                        |

**Query parameters for `GET /report/{instructorId}`:**

| Parameter               | Type   | Required       | Values                           | Description          |
| ----------------------- | ------ | -------------- | -------------------------------- | -------------------- |
| `instructorId`          | uuid   | **Yes** (path) | —                                | Target instructor    |
| `startDate` / `endDate` | date   | No             | —                                | Date range           |
| `period`                | string | No             | `monthly`, `quarterly`, `yearly` | Score trend grouping |

---

## 5. Schema Reference

### PerformanceFilterInput

Used for `POST /filters` and `PUT /filters/{filterId}`.

| Field                | Type           | Required | Values / Notes                                                    |
| -------------------- | -------------- | -------- | ----------------------------------------------------------------- |
| `name`               | string         | **Yes**  | Human-readable filter name                                        |
| `description`        | string         | No       | Optional description                                              |
| `studentScope`       | string         | No       | `individual`, `group` (default: `group`)                          |
| `criteria`           | FilterCriteria | No       | See below                                                         |
| `performanceMetrics` | string[]       | No       | Fields to surface in results e.g. `["overall_avg_score","grade"]` |
| `visualizationType`  | string         | No       | `bar_chart`, `table`, `line_chart`, `pie_chart`                   |
| `accessLevel`        | string         | No       | `instructor`, `admin`, `all` (default: `instructor`)              |
| `sharedWith`         | string[]       | No       | Array of user UUIDs who can execute this filter                   |
| `status`             | string         | No       | `active`, `draft`, `archived` (default: `draft`)                  |

---

### FilterCriteria

All fields are optional and combinable.

| Field                   | Type   | Description                                              |
| ----------------------- | ------ | -------------------------------------------------------- |
| `courseId`              | uuid   | Filter by course                                         |
| `moduleId`              | uuid   | Filter by module                                         |
| `studentId`             | uuid   | Scope to a single student                                |
| `departmentId`          | uuid   | Filter by department                                     |
| `instructorId`          | uuid   | Filter by instructor                                     |
| `scoreMin`              | number | Minimum `overall_avg_score` (0–100)                      |
| `scoreMax`              | number | Maximum `overall_avg_score` (0–100)                      |
| `grade`                 | string | `Excellent`, `Very Good`, `Good`, `Fair`, `Pass`, `Fail` |
| `passFail`              | string | `pass` (score ≥ 50) or `fail`                            |
| `attendanceMin`         | number | Minimum lesson completion rate %                         |
| `startDate` / `endDate` | date   | ISO 8601 date strings                                    |

---

### FilterResult / StudentPerformanceRow

**FilterResult** envelope:

| Field             | Type                    | Description                     |
| ----------------- | ----------------------- | ------------------------------- |
| `filterId`        | uuid                    | null for preview executions     |
| `filterName`      | string                  | null for preview executions     |
| `generatedAt`     | datetime                | Execution timestamp             |
| `recordCount`     | integer                 | Number of student rows returned |
| `executionTimeMs` | integer                 | Query execution time in ms      |
| `kpis`            | object                  | See KPI Reference               |
| `data`            | StudentPerformanceRow[] | Per-student result rows         |

**StudentPerformanceRow** fields:

| Field                  | Type    | Description                       |
| ---------------------- | ------- | --------------------------------- |
| `student_id`           | uuid    | —                                 |
| `student_name`         | string  | —                                 |
| `student_email`        | string  | —                                 |
| `course_id`            | uuid    | nullable                          |
| `course_title`         | string  | nullable                          |
| `exam_avg_score`       | number  | Mean score across all exams       |
| `assessment_avg_score` | number  | Mean score across all assessments |
| `overall_avg_score`    | number  | Combined average                  |
| `grade`                | string  | `Excellent` → `Fail`              |
| `pass_fail`            | string  | `Pass` / `Fail`                   |
| `exam_count`           | integer | Number of exams taken             |
| `assessment_count`     | integer | Number of assessments taken       |
| `completion_rate`      | number  | Lesson completion %               |
| `total_lessons`        | integer | —                                 |
| `completed_lessons`    | integer | —                                 |

---

### VisualStudentRow

Returned by `GET /visual-analytics-v2/report` and `GET /visual-analytics-v2/report/{studentId}`.

| Field                   | Type   | Values                                 | Description                            |
| ----------------------- | ------ | -------------------------------------- | -------------------------------------- |
| `student_id`            | uuid   | —                                      | —                                      |
| `student_name`          | string | —                                      | —                                      |
| `student_email`         | string | —                                      | —                                      |
| `course_id`             | uuid   | —                                      | nullable                               |
| `course_title`          | string | —                                      | nullable                               |
| `performance_metric`    | number | 0–100                                  | Combined avg score (exam + assessment) |
| `completion_rate`       | number | 0–100                                  | Lesson completion %                    |
| `achievement_category`  | string | `Excellent`, `Good`, `Average`, `Poor` | Computed tier                          |
| `visual_indicator`      | string | `Green`, `Yellow`, `Red`               | Color-coded tier                       |
| `chart_type`            | string | `Bar`, `Heatmap`, `Gauge`              | Recommended chart for this student     |
| `class_average`         | number | —                                      | Course-level mean score                |
| `comparison_to_average` | string | e.g. `"+16%"`, `"-8%"`                 | Signed deviation from class average    |
| `remarks`               | string | —                                      | Auto-generated performance remark      |

---

### VisualDashboard

Returned by `GET /visual-analytics-v2/dashboard`.

| Field                           | Type       | Description                                                         |
| ------------------------------- | ---------- | ------------------------------------------------------------------- |
| `reportName`                    | string     | —                                                                   |
| `generatedAt`                   | datetime   | —                                                                   |
| `kpis`                          | VisualKpis | See below                                                           |
| `achievement_distribution`      | object     | `{ Excellent: n, Good: n, Average: n, Poor: n }`                    |
| `visual_indicator_distribution` | object     | `{ Green: n, Yellow: n, Red: n }`                                   |
| `score_histogram`               | object     | `{ "0-59": n, "60-69": n, "70-79": n, "80-100": n }`                |
| `top_performers`                | array      | Top 5 students by `performance_metric`                              |
| `at_risk_students`              | array      | All students in Poor category                                       |
| `chart_data.pie`                | array      | `[{ label, value }]` for achievement distribution pie chart         |
| `chart_data.bar`                | array      | `[{ range, count }]` for score histogram bar chart                  |
| `chart_data.heatmap`            | array      | `[{ student_id, student_name, score, indicator }]` for grid heatmap |

---

### VisualKpis

| Field                                | Type    | Description                |
| ------------------------------------ | ------- | -------------------------- |
| `total_students`                     | integer | Total students in scope    |
| `class_average`                      | number  | Mean performance metric    |
| `students_meeting_target`            | integer | Count above pass threshold |
| `students_meeting_target_percentage` | number  | % above pass threshold     |
| `excellent_percentage`               | number  | % in Excellent tier        |
| `good_percentage`                    | number  | % in Good tier             |
| `average_percentage`                 | number  | % in Average tier          |
| `poor_percentage`                    | number  | % in Poor tier             |

---

### InstructorRow

| Field                      | Type                   | Description                                    |
| -------------------------- | ---------------------- | ---------------------------------------------- |
| `instructor_id`            | uuid                   | —                                              |
| `instructor_name`          | string                 | nullable                                       |
| `instructor_email`         | string                 | nullable                                       |
| `department_id`            | uuid                   | nullable                                       |
| `department`               | string                 | nullable                                       |
| `courses_delivered`        | integer                | Number of courses the instructor has delivered |
| `total_enrolled`           | integer                | Total students enrolled across all courses     |
| `total_completed`          | integer                | Students who completed                         |
| `completion_rate`          | number                 | `(total_completed / total_enrolled) × 100`     |
| `average_assessment_score` | number                 | Mean assessment score                          |
| `average_exam_score`       | number                 | Mean exam score                                |
| `average_project_score`    | number                 | Mean project score                             |
| `average_score`            | number                 | Combined average across all score types        |
| `grading_timeliness_days`  | number                 | Avg days from submission to grading            |
| `feedback_rating`          | number                 | Student feedback rating                        |
| `score_trend`              | InstructorScoreTrend[] | `[{ period: "2026-Q1", average_score: 78.2 }]` |

---

### InstructorPerformanceSummary

Returned alongside the `data[]` array in `GET /instructor-performance-v2/report`.

| Field                      | Type    | Description                                 |
| -------------------------- | ------- | ------------------------------------------- |
| `total_instructors`        | integer | Total instructors in scope                  |
| `average_completion_rate`  | number  | Mean completion rate across all instructors |
| `average_feedback_rating`  | number  | Mean feedback rating                        |
| `average_assessment_score` | number  | Mean assessment score                       |
| `average_grading_days`     | number  | Mean grading timeliness                     |
| `top_completion_rate`      | number  | Highest completion rate in scope            |

---

### GradingScale

Returned by `GET /performance-filters-v2/grading-scale`.

```json
{
  "A": "90-100",
  "B+": "85-89",
  "B": "80-84",
  "C+": "75-79",
  "C": "70-74",
  "D": "60-69",
  "F": "<60"
}
```

Range formats: `"90-100"` (inclusive range), `"<60"` (below threshold), `">80"` (above threshold).

---

## 6. KPI Reference

| KPI                                 | Endpoint                            | Field Name                                |
| ----------------------------------- | ----------------------------------- | ----------------------------------------- |
| Average performance score           | `/filters/{id}/execute`             | `kpis.average_performance`                |
| Pass rate                           | `/filters/{id}/execute`             | `kpis.pass_rate`                          |
| Fail rate                           | `/filters/{id}/execute`             | `kpis.fail_rate`                          |
| High performers %                   | `/filters/{id}/execute`             | `kpis.high_performers_percentage`         |
| At-risk %                           | `/filters/{id}/execute`             | `kpis.at_risk_percentage`                 |
| Grade distribution                  | `/filters/{id}/execute`             | `kpis.grade_distribution`                 |
| Class average                       | `/visual-analytics-v2/dashboard`    | `kpis.class_average`                      |
| Students meeting target             | `/visual-analytics-v2/dashboard`    | `kpis.students_meeting_target_percentage` |
| Excellent / Good / Average / Poor % | `/visual-analytics-v2/dashboard`    | `kpis.*_percentage`                       |
| Filter usage frequency              | `/performance-filters-v2/stats`     | `totalExecutions`, `mostUsedFilters`      |
| Avg generation time                 | `/performance-filters-v2/stats`     | `avgGenerationTimeMs`                     |
| Instructor completion rate          | `/instructor-performance-v2/report` | `summary.average_completion_rate`         |
| Instructor grading timeliness       | `/instructor-performance-v2/report` | `summary.average_grading_days`            |

---

## 7. Enum & Status Values

| Context              | Field                  | Values                                                   |
| -------------------- | ---------------------- | -------------------------------------------------------- |
| Filter lifecycle     | `status`               | `draft`, `active`, `archived`                            |
| Filter access scope  | `studentScope`         | `individual`, `group`                                    |
| Filter access level  | `accessLevel`          | `instructor`, `admin`, `all`                             |
| Filter visualization | `visualizationType`    | `bar_chart`, `table`, `line_chart`, `pie_chart`          |
| Grade label          | `grade`                | `Excellent`, `Very Good`, `Good`, `Fair`, `Pass`, `Fail` |
| Pass/fail status     | `pass_fail`            | `Pass`, `Fail`                                           |
| Achievement tier     | `achievement_category` | `Excellent`, `Good`, `Average`, `Poor`                   |
| Visual indicator     | `visual_indicator`     | `Green`, `Yellow`, `Red`                                 |
| Recommended chart    | `chart_type`           | `Bar`, `Heatmap`, `Gauge`                                |
| Score trend period   | `period`               | `monthly`, `quarterly`, `yearly`                         |
| Sort order           | `order`                | `ASC`, `DESC`                                            |

---

## 8. Developer Notes

- **Drill-down chain:** Start broad → `GET /visual-analytics-v2/dashboard` (no filters) → add `courseId` → then `GET /visual-analytics-v2/report/{studentId}` for individual detail.
- **Filter reuse:** Always call `GET /performance-filters-v2/filters` before building a new filter — a matching saved configuration may already exist. Reuse reduces duplicated config and increments `accessCount` for accurate usage KPIs.
- **Preview vs execute:** Use `POST /preview` for exploratory analysis. Use `POST /filters/{id}/execute` for audited, logged report generation — every execution increments `accessCount` and updates `lastExecutedAt`.
- **Metrics are dynamic:** All scores and rates are computed at request time from live data. Do not cache results without a TTL strategy.
- **Date range format:** All `startDate` / `endDate` parameters accept ISO 8601 format: `YYYY-MM-DD`.
- **Sorting filter results:** Pass `sortBy.field` (any `StudentPerformanceRow` field, e.g. `overall_avg_score`, `completion_rate`) and `order` (`ASC`/`DESC`) in the execute or preview request body.
- **Pagination:** All list endpoints support `page` and `limit`. Default `limit` is `20` for filters, `50` for report endpoints.
- **Score threshold:** `passFail: "pass"` is defined as `overall_avg_score ≥ 50`. This threshold is system-derived and cannot be overridden via the API.
- **Grading scale is institutional:** The scale returned by `GET /grading-scale` reflects the institution's configuration. Always fetch it dynamically — do not hardcode grade boundaries.
- **Color indicator rules:** Fetch `GET /visual-analytics-v2/thresholds` to get the exact score boundaries that map to Green / Yellow / Red and Excellent / Good / Average / Poor. These may vary per institution.
- **Audit trail:** `PerformanceFilter.accessCount` and `lastExecutedAt` provide a built-in audit log of report usage frequency. Expose these in admin dashboards for compliance reporting.
