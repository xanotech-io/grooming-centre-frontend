# TC03 – Project Grading Summary Report

## Overview

The **Project Grading Summary Report** provides instructors, academic coordinators, and LMS administrators with a centralized view of project submission and grading activities across courses or student batches.

This document describes the complete end-to-end flow: how the UI is structured, which API endpoints each section calls, what request parameters are sent, what responses are expected, and how data is rendered and validated.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [API Endpoints Reference](#2-api-endpoints-reference)
3. [UI Sections and API Mapping](#3-ui-sections-and-api-mapping)
   - [3.1 Filter Bar](#31-filter-bar)
   - [3.2 KPI Summary Cards](#32-kpi-summary-cards)
   - [3.3 Per-Project Data Table](#33-per-project-data-table)
   - [3.4 Project Detail Drawer / Page](#34-project-detail-drawer--page)
4. [Complete Step-by-Step User Flow](#4-complete-step-by-step-user-flow)
5. [Request & Response Structures](#5-request--response-structures)
6. [KPI Logic & Calculations](#6-kpi-logic--calculations)
7. [Field Definitions](#7-field-definitions)
8. [Status Values & Display Rules](#8-status-values--display-rules)
9. [Validation Rules](#9-validation-rules)
10. [Error Handling](#10-error-handling)
11. [Export Functionality](#11-export-functionality)
12. [Pagination](#12-pagination)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        UI (Frontend)                        │
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌────────────────┐  │
│  │  Filter Bar  │   │  KPI Cards   │   │  Project Table │  │
│  └──────┬───────┘   └──────┬───────┘   └───────┬────────┘  │
│         │                  │                   │            │
└─────────┼──────────────────┼───────────────────┼────────────┘
          │                  │                   │
          ▼                  ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                              │
│                                                             │
│  GET /api/v1/project-grading-v2/summary    ◄── KPI Cards   │
│  GET /api/v1/project-grading-v2/report     ◄── Table       │
│  GET /api/v1/project-grading-v2/report/{projectId}  ◄── Detail │
└─────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend / Database                        │
│  projects | project_submissions | project_grades            │
└─────────────────────────────────────────────────────────────┘
```

**Key design principle:** The Filter Bar drives both the `/summary` and `/report` endpoints simultaneously. When filters change, both calls are re-issued with the same parameters, keeping KPI cards and the data table in sync.

---

## 2. API Endpoints Reference

| #   | Method | Endpoint                                        | Purpose                                |
| --- | ------ | ----------------------------------------------- | -------------------------------------- |
| 1   | `GET`  | `/api/v1/project-grading-v2/summary`            | Aggregate KPI cards (top of page)      |
| 2   | `GET`  | `/api/v1/project-grading-v2/report`             | Full per-project table with pagination |
| 3   | `GET`  | `/api/v1/project-grading-v2/report/{projectId}` | Detail view for a single project       |

---

## 3. UI Sections and API Mapping

### 3.1 Filter Bar

**Location:** Top of the report page, above KPI cards.

**Purpose:** Allows users to scope the report by course, instructor, date range, and grading status. Every filter change triggers a simultaneous refresh of the KPI cards and the data table.

#### Filter Controls

| Control        | Type                                    | Maps To (Query Param)    | Endpoint(s) Affected  |
| -------------- | --------------------------------------- | ------------------------ | --------------------- |
| Course         | Dropdown (UUID)                         | `courseId`               | `/summary`, `/report` |
| Instructor     | Dropdown (UUID)                         | `instructorId`           | `/summary`, `/report` |
| Start Date     | Date picker                             | `startDate` (YYYY-MM-DD) | `/summary`, `/report` |
| End Date       | Date picker                             | `endDate` (YYYY-MM-DD)   | `/summary`, `/report` |
| Grading Status | Dropdown (`pending` / `graded` / `all`) | `gradingStatus`          | `/report` only        |
| Project        | Dropdown (UUID)                         | `projectId`              | `/report` only        |

> **Note:** `gradingStatus` and `projectId` apply only to the `/report` endpoint. The `/summary` endpoint does not support these parameters.

#### Filter Behavior

- All filters are optional. When none are applied, the report returns all data within the system's default date range.
- `startDate` and `endDate` must both be provided together or both omitted. Providing only one is invalid (see [Validation Rules](#9-validation-rules)).
- `endDate` must be equal to or after `startDate`.
- Changing any filter resets the table to page 1.
- A "Clear Filters" button resets all controls to their default (empty) state and re-fetches with no parameters.

---

### 3.2 KPI Summary Cards

**Location:** Below the filter bar, displayed as a horizontal row of metric cards.

**API Endpoint:** `GET /api/v1/project-grading-v2/summary`

**Trigger:** On page load and on every filter change (except `gradingStatus` and `projectId`).

#### KPI Cards Displayed

| Card                  | Field (`data.summary.*`) | Display Format      | Description                                      |
| --------------------- | ------------------------ | ------------------- | ------------------------------------------------ |
| Total Projects        | `totalProjects`          | Integer             | Total number of projects in scope                |
| Total Submissions     | `totalSubmissions`       | Integer             | All student submissions received                 |
| Graded Submissions    | `gradedSubmissions`      | Integer             | Submissions that have been graded                |
| Pending Grading       | `pendingGrading`         | Integer             | Submissions awaiting grading                     |
| Average Project Score | `averageProjectScore`    | `XX%` or `XX / 100` | Mean score across all graded submissions         |
| Feedback Coverage     | `feedbackCoverage`       | `XX%`               | % of graded submissions with instructor feedback |

#### Sample Request

```http
GET /api/v1/project-grading-v2/summary?courseId=COURSE-UUID&startDate=2026-01-01&endDate=2026-03-31
```

#### Sample Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "reportName": "Project Grading Summary",
    "generatedAt": "2026-05-20T08:44:50.139Z",
    "summary": {
      "totalProjects": 12,
      "totalSubmissions": 320,
      "gradedSubmissions": 290,
      "pendingGrading": 30,
      "averageProjectScore": 79,
      "feedbackCoverage": 91
    }
  }
}
```

#### UI Rendering Rules

- While the API call is in-flight, each card shows a skeleton/loading state.
- If `success: false` or a non-200 response is returned, cards display `—` with an error message below the row.
- `pendingGrading` card uses a warning color (amber/orange) when the value is greater than 0.
- `feedbackCoverage` below 80% triggers a warning indicator; below 50% triggers an error indicator.

---

### 3.3 Per-Project Data Table

**Location:** Below the KPI cards.

**API Endpoint:** `GET /api/v1/project-grading-v2/report`

**Trigger:** On page load, on any filter change, and on pagination navigation.

#### Table Columns

| Column Header      | Field (`data.data[*].*`)      | Notes                                                        |
| ------------------ | ----------------------------- | ------------------------------------------------------------ |
| Project Title      | `projectTitle`                | Clickable — opens detail view                                |
| Module             | `moduleTitle`                 | Module the project belongs to                                |
| Course             | `courseTitle`                 | —                                                            |
| Instructor         | `instructorName`              | —                                                            |
| Deadline           | `submissionDeadline`          | Display as formatted date (e.g., `Feb 15, 2026`)             |
| Total Submissions  | `totalSubmissions`            | —                                                            |
| Graded             | `graded`                      | —                                                            |
| Pending            | `pending`                     | Highlight if `> 0`                                           |
| Avg Grade          | `averageGrade`                | Display as `XX / maxGrade` or `XX%`                          |
| Grading Completion | `gradingCompletionPercentage` | Rendered as a progress bar + `XX%` label                     |
| Feedback Coverage  | `feedbackProvidedPercentage`  | Rendered as a progress bar + `XX%` label                     |
| Grading Status     | `gradingStatus`               | Badge (see [Status Values](#8-status-values--display-rules)) |
| Project Status     | `projectStatus`               | Badge (draft / published / archived)                         |

#### Sortable Columns

The following columns support client-side or server-side sorting:

- `submissionDeadline`
- `gradingCompletionPercentage`
- `feedbackProvidedPercentage`
- `averageGrade`
- `pending`

#### Sample Request

```http
GET /api/v1/project-grading-v2/report
  ?courseId=COURSE-UUID
  &startDate=2026-01-01
  &endDate=2026-03-31
  &gradingStatus=all
  &page=1
  &limit=50
```

#### Sample Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "reportName": "Project Grading Report",
    "generatedAt": "2026-05-20T08:44:50.144Z",
    "total": 120,
    "page": 1,
    "limit": 50,
    "recordCount": 50,
    "executionTimeMs": 210,
    "summary": {
      "totalProjects": 12,
      "totalSubmissions": 320,
      "gradedSubmissions": 290,
      "pendingGrading": 30,
      "averageProjectScore": 79,
      "feedbackCoverage": 91
    },
    "data": [
      {
        "projectId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "projectTitle": "Case Study 1",
        "moduleTitle": "Module 3 – Privacy",
        "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
        "courseTitle": "Data Privacy",
        "instructorId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
        "instructorName": "Dr. Jane Smith",
        "totalSubmissions": 30,
        "graded": 28,
        "pending": 2,
        "averageGrade": 80,
        "maxGrade": 100,
        "gradingCompletionPercentage": 93,
        "feedbackProvidedPercentage": 90,
        "submissionDeadline": "2026-02-15",
        "projectStatus": "published",
        "gradingStatus": "In Progress"
      }
    ]
  }
}
```

> **Note:** The `/report` response also includes a `summary` block. The UI may use this to update the KPI cards in lieu of a separate `/summary` call, reducing total network requests. Implement this as an optimization only if both endpoints are called with the same filters.

---

### 3.4 Project Detail Drawer / Page

**Location:** Opens when a user clicks a project row or the project title link in the table.

**API Endpoint:** `GET /api/v1/project-grading-v2/report/{projectId}`

**Trigger:** User clicks on a project row.

#### Detail View Content

The detail view renders the full per-project grading breakdown for a single project, including:

- Project metadata (title, module, course, instructor, deadline)
- Grading metrics (totalSubmissions, graded, pending, averageGrade, maxGrade)
- Completion percentages (gradingCompletionPercentage, feedbackProvidedPercentage)
- Status badges (projectStatus, gradingStatus)
- Student-level submission list (if returned by the endpoint)

#### Sample Request

```http
GET /api/v1/project-grading-v2/report/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

#### Response Codes

| Code  | Meaning                      | UI Behavior                                           |
| ----- | ---------------------------- | ----------------------------------------------------- |
| `200` | Project data returned        | Render detail panel                                   |
| `404` | Project not found or no data | Show "Project not found" empty state with back button |

---

## 4. Complete Step-by-Step User Flow

### Step 1 — Page Load

1. The UI renders the filter bar with all controls in their default (empty) state.
2. Two parallel API calls are issued immediately:
   - `GET /summary` (no query params) → populates KPI cards with loading skeletons
   - `GET /report?page=1&limit=50` (no query params) → populates data table with loading state
3. Responses arrive and the page renders fully.

### Step 2 — User Applies Filters

1. User selects a **Course** from the dropdown.
2. UI updates both calls simultaneously:
   - `GET /summary?courseId={uuid}`
   - `GET /report?courseId={uuid}&page=1&limit=50`
3. KPI cards and table both refresh. Table resets to page 1.

### Step 3 — User Refines by Date Range

1. User selects **Start Date** and **End Date**.
2. If only one is set, a validation message appears: _"Please provide both a start and end date."_
3. Once both are valid, both API calls fire again with the date parameters appended.

### Step 4 — User Filters by Grading Status

1. User selects **Pending** from the Grading Status dropdown.
2. Only the `/report` call is re-issued with `gradingStatus=pending`.
3. KPI cards do **not** change (the `/summary` endpoint ignores this filter).
4. The table now shows only projects with pending grading.

### Step 5 — User Navigates Table Pages

1. User clicks **Next Page** in the table pagination controls.
2. The UI issues:
   - `GET /report?...&page=2&limit=50` (same filters, incremented page)
3. Only the table updates. KPI cards remain static (no new `/summary` call).

### Step 6 — User Opens a Project Detail

1. User clicks **"Case Study 1"** in the project title column.
2. The UI issues:
   - `GET /report/{projectId}`
3. A detail panel or modal opens with the project's full metrics.
4. If the project is not found (`404`), the panel shows an empty state message.

### Step 7 — User Exports

1. User clicks the **Export** button and selects a format (PDF / Excel / CSV).
2. The UI re-calls `GET /report` with all active filters and `limit` set to the total record count (no pagination).
3. The returned data is serialized to the selected format client-side or via a dedicated export endpoint.
4. The file downloads to the user's device.

### Step 8 — User Clears Filters

1. User clicks **Clear Filters**.
2. All filter controls reset to empty/default.
3. Both `GET /summary` and `GET /report?page=1&limit=50` are called with no query params.
4. The report returns to its full, unfiltered state.

---

## 5. Request & Response Structures

### `/summary` — Query Parameters

| Parameter      | Type   | Format     | Required | Description          |
| -------------- | ------ | ---------- | -------- | -------------------- |
| `courseId`     | string | UUID       | No       | Filter by course     |
| `instructorId` | string | UUID       | No       | Filter by instructor |
| `startDate`    | string | YYYY-MM-DD | No\*     | Report start date    |
| `endDate`      | string | YYYY-MM-DD | No\*     | Report end date      |

\*If one date is provided, both are required.

### `/report` — Query Parameters

| Parameter       | Type    | Format                       | Required | Default | Description                |
| --------------- | ------- | ---------------------------- | -------- | ------- | -------------------------- |
| `courseId`      | string  | UUID                         | No       | —       | Filter by course           |
| `instructorId`  | string  | UUID                         | No       | —       | Filter by instructor       |
| `projectId`     | string  | UUID                         | No       | —       | Filter to a single project |
| `startDate`     | string  | YYYY-MM-DD                   | No\*     | —       | Report start date          |
| `endDate`       | string  | YYYY-MM-DD                   | No\*     | —       | Report end date            |
| `gradingStatus` | string  | `pending` / `graded` / `all` | No       | `all`   | Filter by grading status   |
| `page`          | integer | —                            | No       | `1`     | Pagination page number     |
| `limit`         | integer | —                            | No       | `50`    | Records per page           |

### `/report/{projectId}` — Path Parameters

| Parameter   | Type          | Required | Description                   |
| ----------- | ------------- | -------- | ----------------------------- |
| `projectId` | string (UUID) | Yes      | The unique project identifier |

### Standard Success Response Envelope

```json
{
  "success": true,
  "data": { ... }
}
```

### Standard Error Response Envelope

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "endDate must be after startDate"
  }
}
```

---

## 6. KPI Logic & Calculations

The following formulas are used by the backend and should be reflected accurately in the UI display.

### Grading Completion Percentage

```
Grading Completion % = (gradedSubmissions / totalSubmissions) × 100
```

Example: 28 graded out of 30 → **93.3%**

### Average Project Score

```
Average Project Score = Sum of all scores / Total graded projects
```

Displayed as a percentage or as `score / maxGrade`.

### Feedback Coverage Percentage

```
Feedback Coverage % = (Projects with feedback / Total graded projects) × 100
```

Example: 23 with feedback out of 25 graded → **92%**

### Pending Grading Count

```
Pending = totalSubmissions − gradedSubmissions
```

---

## 7. Field Definitions

| Field                         | Type              | Description                                                 |
| ----------------------------- | ----------------- | ----------------------------------------------------------- |
| `projectId`                   | UUID              | Unique project identifier                                   |
| `projectTitle`                | string            | Human-readable project name                                 |
| `moduleTitle`                 | string            | Module the project belongs to                               |
| `courseId`                    | UUID              | Parent course identifier                                    |
| `courseTitle`                 | string            | Human-readable course name                                  |
| `instructorId`                | UUID              | Assigned instructor identifier                              |
| `instructorName`              | string            | Instructor display name                                     |
| `totalSubmissions`            | integer           | Count of all student submissions                            |
| `graded`                      | integer           | Submissions that have received a grade                      |
| `pending`                     | integer           | Submissions not yet graded                                  |
| `averageGrade`                | number            | Mean score across graded submissions                        |
| `maxGrade`                    | number            | Maximum possible score for this project                     |
| `gradingCompletionPercentage` | number            | `(graded / totalSubmissions) × 100`                         |
| `feedbackProvidedPercentage`  | number            | `(submissions with feedback / graded) × 100`                |
| `submissionDeadline`          | date (YYYY-MM-DD) | Student submission deadline                                 |
| `projectStatus`               | string            | Lifecycle status: `draft`, `published`, `archived`          |
| `gradingStatus`               | string            | Grading progress: `Not Started`, `In Progress`, `Completed` |
| `reportName`                  | string            | Report title included in every response                     |
| `generatedAt`                 | ISO 8601 datetime | Server-side timestamp of report generation                  |
| `total`                       | integer           | Total matching records (for pagination)                     |
| `page`                        | integer           | Current page number                                         |
| `limit`                       | integer           | Records per page                                            |
| `recordCount`                 | integer           | Records returned in this response                           |
| `executionTimeMs`             | integer           | Backend query execution time in milliseconds                |

---

## 8. Status Values & Display Rules

### `gradingStatus` — Badge Colors

| Value         | Badge Color    | Description                           |
| ------------- | -------------- | ------------------------------------- |
| `Not Started` | Gray           | No submissions have been graded yet   |
| `In Progress` | Amber / Yellow | Grading has begun but is not complete |
| `Completed`   | Green          | All submissions have been graded      |

### `projectStatus` — Badge Colors

| Value       | Badge Color       | Description                          |
| ----------- | ----------------- | ------------------------------------ |
| `draft`     | Gray              | Project not yet visible to students  |
| `published` | Blue              | Active and accepting submissions     |
| `archived`  | Dark Gray / Muted | Project closed; historical data only |

### Progress Bar Thresholds

| Metric                        | Threshold | Color |
| ----------------------------- | --------- | ----- |
| `gradingCompletionPercentage` | ≥ 80%     | Green |
| `gradingCompletionPercentage` | 50–79%    | Amber |
| `gradingCompletionPercentage` | < 50%     | Red   |
| `feedbackProvidedPercentage`  | ≥ 80%     | Green |
| `feedbackProvidedPercentage`  | 50–79%    | Amber |
| `feedbackProvidedPercentage`  | < 50%     | Red   |

---

## 9. Validation Rules

### Client-Side (before API call)

| Rule                    | Condition                                                   | Error Message                                                     |
| ----------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------- |
| Date range completeness | `startDate` provided without `endDate` (or vice versa)      | "Please provide both a start and end date."                       |
| Date range order        | `endDate` is before `startDate`                             | "End date must be on or after the start date."                    |
| Future start date       | `startDate` is in the future                                | Warning: "Start date is in the future. No data may be available." |
| UUID format             | `courseId`, `instructorId`, `projectId` must be valid UUIDs | Dropdowns enforce this; do not allow free-text UUID entry.        |
| Pagination bounds       | `page` must be ≥ 1; `limit` must be between 1 and 200       | Enforced by pagination controls; not user-editable directly.      |

### Server-Side (API-level)

The backend validates all parameters and returns a `400 Bad Request` with an error envelope for invalid inputs. The UI must handle `400` responses by displaying the `error.message` from the response body near the relevant filter control.

---

## 10. Error Handling

| HTTP Status     | Scenario                                  | UI Behavior                                                                              |
| --------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| `200`           | Success                                   | Render data normally                                                                     |
| `400`           | Invalid query parameters                  | Show inline validation error near filter bar                                             |
| `401`           | Unauthorized / session expired            | Redirect to login page                                                                   |
| `403`           | Insufficient permissions                  | Show "Access Denied" full-page message                                                   |
| `404`           | Project not found (`/report/{projectId}`) | Show "Project not found" empty state in detail panel                                     |
| `500`           | Internal server error                     | Show generic error banner: "Something went wrong. Please try again." with a retry button |
| Network timeout | Request did not complete                  | Show error banner with retry option; do not clear existing data                          |

### Retry Behavior

- On `500` or network timeout, the UI shows a **Retry** button that re-issues the same request.
- The KPI cards and table independently manage their loading/error state — a failure in `/summary` does not prevent the table from rendering, and vice versa.

---

## 11. Export Functionality

The export button appears above the data table and supports three formats.

| Format        | Description                                         |
| ------------- | --------------------------------------------------- |
| PDF           | Full-page report with KPI summary and project table |
| Excel (.xlsx) | Spreadsheet with one row per project, all columns   |
| CSV           | Plain comma-separated values, one row per project   |

### Export Flow

1. User clicks **Export** and selects a format.
2. The UI calls `GET /report` with all currently-active filters and `limit` set to `total` (retrieved from the last `/report` response) to fetch all records without pagination.
3. The response data is used to generate the export file.
4. A download is triggered in the browser.

> If `total` is very large (e.g., > 10,000 records), the UI should warn the user that the export may take a moment and show a loading spinner.

---

## 12. Pagination

The `/report` endpoint supports page-based pagination via `page` and `limit` parameters.

### Pagination Controls

- **Previous / Next** buttons
- **Page number** indicator: `Page X of Y` (where Y = `Math.ceil(total / limit)`)
- **Records per page** selector: options `10`, `25`, `50` (default), `100`

### Pagination State

| Field         | Source             | Description                             |
| ------------- | ------------------ | --------------------------------------- |
| `total`       | `data.total`       | Total matching records across all pages |
| `page`        | `data.page`        | Current page (1-indexed)                |
| `limit`       | `data.limit`       | Records per page                        |
| `recordCount` | `data.recordCount` | Records in the current response         |

### Behavior

- Changing any filter resets the page to `1`.
- Changing `limit` resets the page to `1`.
- If the current page exceeds the new total pages after a filter change, the UI resets to page `1` automatically.
- The `/summary` KPI cards are **not** re-fetched on pagination — they always reflect aggregate totals for the full filtered dataset, not just the current page.

---

## Appendix A — Sample End-to-End Request Sequence

The following shows the full sequence of API calls for a typical user session:

```
1. Page loads
   → GET /summary                              (no params)
   → GET /report?page=1&limit=50               (no params)

2. User selects Course "Data Privacy" (ID: abc-123)
   → GET /summary?courseId=abc-123
   → GET /report?courseId=abc-123&page=1&limit=50

3. User sets date range: 2026-01-01 to 2026-03-31
   → GET /summary?courseId=abc-123&startDate=2026-01-01&endDate=2026-03-31
   → GET /report?courseId=abc-123&startDate=2026-01-01&endDate=2026-03-31&page=1&limit=50

4. User filters grading status to "pending"
   → GET /report?courseId=abc-123&startDate=2026-01-01&endDate=2026-03-31&gradingStatus=pending&page=1&limit=50
   (No /summary call — gradingStatus not supported)

5. User clicks project "Case Study 1" (ID: proj-456)
   → GET /report/proj-456

6. User clicks Export → CSV
   → GET /report?courseId=abc-123&startDate=2026-01-01&endDate=2026-03-31&gradingStatus=pending&page=1&limit=320
   (limit = total from last /report response)
```

---

## Appendix B — Backend SQL Reference

### Fetch Projects

```sql
SELECT * FROM projects
WHERE due_date BETWEEN :startDate AND :endDate;
```

### Fetch Submission Counts

```sql
SELECT project_id, COUNT(*) AS total_submissions
FROM project_submissions
GROUP BY project_id;
```

### Fetch Graded Counts

```sql
SELECT a.project_id, COUNT(g.grade_id) AS graded_count
FROM project_submissions a
LEFT JOIN project_grades g ON a.submission_id = g.submission_id
GROUP BY a.project_id;
```

### Calculate Average Grade

```sql
SELECT project_id, AVG(score) AS average_grade
FROM project_grades
GROUP BY project_id;
```

### Calculate Feedback Coverage

```sql
SELECT
  COUNT(CASE WHEN feedback_comments IS NOT NULL THEN 1 END) * 100.0 / COUNT(*) AS feedback_coverage
FROM project_grades;
```
