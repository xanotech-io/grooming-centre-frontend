# TC03 – Randomization & Exam Integrity Monitoring

## Overview

The **Randomization & Exam Integrity Monitoring Module** ensures exams are fair, tamper-resistant, and free from malpractice. It tracks question randomization across student attempts, detects duplicate or overlapping exam sets, monitors session-level behavior (IP, device, timing), flags suspicious activity, and exposes structured KPIs and chart datasets for audit and compliance reporting.

This document describes the complete end-to-end flow: how each UI section maps to its API endpoint, what is sent and received, how data is rendered, and how validations and errors are handled.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [API Endpoints Reference](#2-api-endpoints-reference)
3. [UI Sections and API Mapping](#3-ui-sections-and-api-mapping)
   - [3.1 Filter Bar](#31-filter-bar)
   - [3.2 Exam List Table](#32-exam-list-table)
   - [3.3 Exam Detail View](#33-exam-detail-view)
   - [3.4 Irregularity Logs Panel](#34-irregularity-logs-panel)
   - [3.5 Visualization / Charts Section](#35-visualization--charts-section)
4. [Complete Step-by-Step User Flow](#4-complete-step-by-step-user-flow)
5. [Request & Response Structures](#5-request--response-structures)
6. [KPI Logic & Calculations](#6-kpi-logic--calculations)
7. [Field Definitions](#7-field-definitions)
8. [Status & Anomaly Type Values](#8-status--anomaly-type-values)
9. [Validation Rules](#9-validation-rules)
10. [Error Handling](#10-error-handling)
11. [Pagination](#11-pagination)
12. [Privacy & Compliance Notes](#12-privacy--compliance-notes)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                            UI (Admin Only)                           │
│                                                                      │
│  ┌─────────────┐  ┌─────────────────┐  ┌──────────────────────────┐ │
│  │  Filter Bar │  │  Exam List      │  │  Visualization / Charts  │ │
│  └──────┬──────┘  └───────┬─────────┘  └────────────┬─────────────┘ │
│         │                 │                          │               │
│         │         ┌───────▼──────────────────────┐  │               │
│         │         │  Exam Detail View             │  │               │
│         │         │  ┌────────────────────────┐   │  │               │
│         │         │  │  Irregularity Logs     │   │  │               │
│         │         │  └────────────────────────┘   │  │               │
│         │         └──────────────────────────────-┘  │               │
└─────────┼────────────────────┼───────────────────────┼───────────────┘
          │                    │                        │
          ▼                    ▼                        ▼
┌──────────────────────────────────────────────────────────────────────┐
│                            API Layer                                 │
│                                                                      │
│  GET /exam-integrity-v2/exams              ◄── Exam List Table       │
│  GET /exam-integrity-v2/exams/{examId}     ◄── Exam Detail View      │
│  GET /exam-integrity-v2/exams/{examId}/    ◄── Irregularity Logs     │
│           irregularity-logs                    Panel                 │
│  GET /exam-integrity-v2/chart-data         ◄── Visualization Section │
└──────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────────────┐
│               Backend / Database                                     │
│  exams | exam_attempts | question_sets | irregularity_logs           │
└──────────────────────────────────────────────────────────────────────┘
```

**Key design principle:** The Filter Bar drives the `/exams` list and `/chart-data` endpoints simultaneously. A `courseId` filter scopes both. The Exam Detail and Irregularity Logs panels are triggered by row-level user navigation and are independent of the top-level filter state.

> **Access control:** All four endpoints require admin authentication. A `401 Unauthorized` response must redirect to the login page. Non-admin users must not see this module.

---

## 2. API Endpoints Reference

| #   | Method | Endpoint                                                     | Purpose                                        |
| --- | ------ | ------------------------------------------------------------ | ---------------------------------------------- |
| 1   | `GET`  | `/api/v1/exam-integrity-v2/exams`                            | Paginated list of exams with integrity KPIs    |
| 2   | `GET`  | `/api/v1/exam-integrity-v2/exams/{examId}`                   | Full integrity report for a single exam        |
| 3   | `GET`  | `/api/v1/exam-integrity-v2/exams/{examId}/irregularity-logs` | Paginated irregularity logs for a single exam  |
| 4   | `GET`  | `/api/v1/exam-integrity-v2/chart-data`                       | Pre-computed chart datasets for visualizations |

---

## 3. UI Sections and API Mapping

### 3.1 Filter Bar

**Location:** Top of the Exam Integrity report page, above the exam list table.

**Purpose:** Scopes the exam list and chart data to a specific course. Changing the filter simultaneously refreshes the Exam List Table and the Visualization section.

#### Filter Controls

| Control | Type            | Maps To (Query Param) | Endpoints Affected      |
| ------- | --------------- | --------------------- | ----------------------- |
| Course  | Dropdown (UUID) | `courseId`            | `/exams`, `/chart-data` |

#### Filter Behavior

- `courseId` is optional. When not set, all exams across all courses are returned.
- Changing the course filter resets the exam list to page 1.
- A **Clear Filter** button resets the dropdown to empty and re-fetches with no parameters.
- The filter does **not** affect `/exams/{examId}` or `/exams/{examId}/irregularity-logs` — those are scoped to a specific exam by path parameter.

---

### 3.2 Exam List Table

**Location:** Main content area of the page, below the filter bar.

**API Endpoint:** `GET /api/v1/exam-integrity-v2/exams`

**Trigger:** On page load, on `courseId` filter change, and on pagination navigation.

#### Query Parameters Sent

| Parameter  | Type    | Default | Description            |
| ---------- | ------- | ------- | ---------------------- |
| `courseId` | UUID    | —       | Optional course filter |
| `page`     | integer | `1`     | Current page           |
| `limit`    | integer | `20`    | Records per page       |

#### Table Columns

| Column Header               | Field (`data.exams[*].*`)    | Display Notes                      |
| --------------------------- | ---------------------------- | ---------------------------------- |
| Exam Title                  | `examTitle`                  | Clickable — opens Exam Detail view |
| Randomization Method        | `randomizationMethod`        | Badge: Full / Partial / None       |
| Total Attempts              | `totalAttempts`              | Integer                            |
| Duplicate Sets Detected     | `duplicateDetectionCount`    | Highlight if `> 0`                 |
| Duplicate Question Rate     | `duplicateQuestionRate`      | Display as `XX%`                   |
| Avg Question Overlap        | `avgQuestionOverlap`         | Display as `XX%`                   |
| Randomization Effectiveness | `randomizationEffectiveness` | Progress bar + `XX%`               |
| Irregular Attempts          | `irregularAttemptsCount`     | Red badge if `> 0`                 |
| Integrity Status            | `integrityStatus`            | Status badge: Valid / Flagged      |

#### Sample Request

```http
GET /api/v1/exam-integrity-v2/exams?courseId=COURSE-UUID&page=1&limit=20
```

#### Sample Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "exams": [
      {
        "examId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "examTitle": "Microfinance Midterm",
        "randomizationMethod": "full",
        "totalAttempts": 100,
        "duplicateDetectionCount": 2,
        "duplicateQuestionRate": 2.0,
        "avgQuestionOverlap": 15.5,
        "randomizationEffectiveness": 85.0,
        "irregularAttemptsCount": 3,
        "integrityStatus": "Flagged"
      }
    ]
  }
}
```

#### UI Rendering Rules

- While loading, the table shows a skeleton state (rows with shimmer placeholders).
- `integrityStatus: "Flagged"` rows are highlighted with a subtle red/amber background.
- `irregularAttemptsCount > 0` renders as a red badge to draw attention.
- `duplicateDetectionCount > 0` renders the value in amber.
- `randomizationEffectiveness` is rendered as a colored progress bar (see threshold rules in [Section 8](#8-status--anomaly-type-values)).

---

### 3.3 Exam Detail View

**Location:** Opens as a full page or side panel when a user clicks an exam row in the list table.

**API Endpoint:** `GET /api/v1/exam-integrity-v2/exams/{examId}`

**Trigger:** User clicks an exam title or row in the Exam List Table.

#### Content Rendered

The detail view renders all integrity metrics for the selected exam, divided into two logical sections:

**Section A — Exam Integrity Summary (KPI block)**

| Label                       | Field                        | Display Format        |
| --------------------------- | ---------------------------- | --------------------- |
| Exam Title                  | `examTitle`                  | Page/panel heading    |
| Course                      | `course.title`               | Subtitle              |
| Randomization Method        | `randomizationMethod`        | Badge                 |
| Total Attempts              | `totalAttempts`              | Integer               |
| Duplicate Sets Detected     | `duplicateDetectionCount`    | Integer, amber if > 0 |
| Duplicate Question Rate     | `duplicateQuestionRate`      | `XX%`                 |
| Avg Question Overlap        | `avgQuestionOverlap`         | `XX%`                 |
| Randomization Effectiveness | `randomizationEffectiveness` | Progress bar + `XX%`  |
| Irregular Attempts          | `irregularAttemptsCount`     | Integer, red if > 0   |
| Integrity Status            | `integrityStatus`            | Status badge          |

**Section B — Inline Irregularity Log Preview**

The detail response includes an embedded `irregularityLogs` array. This is displayed as a preview table (up to the first 5–10 entries). A **"View All Logs"** button at the bottom of this table navigates to the full paginated logs panel (Section 3.4).

| Column        | Field                                    | Notes                                              |
| ------------- | ---------------------------------------- | -------------------------------------------------- |
| Student Name  | `student.firstName` + `student.lastName` | —                                                  |
| Student Email | `student.email`                          | —                                                  |
| IP Address    | `ipAddress`                              | Partially masked for privacy (e.g., `192.168.1.x`) |
| Device Info   | `deviceInfo`                             | Browser + OS string                                |
| Geolocation   | `geolocation`                            | City, Country                                      |
| Timestamp     | `timestamp`                              | Formatted: `Apr 10, 2025, 10:15 AM`                |
| Anomaly Types | `anomalyTypes`                           | One badge per type (see anomaly type list)         |

#### Sample Request

```http
GET /api/v1/exam-integrity-v2/exams/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

#### Sample Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "examId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "examTitle": "Microfinance Midterm",
    "randomizationMethod": "full",
    "totalAttempts": 100,
    "duplicateDetectionCount": 2,
    "duplicateQuestionRate": 2.0,
    "avgQuestionOverlap": 15.5,
    "randomizationEffectiveness": 85.0,
    "irregularAttemptsCount": 3,
    "integrityStatus": "Flagged",
    "course": {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
      "title": "Microfinance Principles"
    },
    "irregularityLogs": [
      {
        "logId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
        "examId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa9",
        "student": {
          "id": "3fa85f64-5717-4562-b3fc-2c963f66afa9",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com"
        },
        "ipAddress": "192.168.1.1",
        "deviceInfo": "Chrome - Windows",
        "geolocation": "Lagos, Nigeria",
        "timestamp": "2025-04-10T10:15:00Z",
        "anomalyTypes": ["same_ip", "duplicate_answers"]
      }
    ]
  }
}
```

#### Response Codes

| Code  | Meaning        | UI Behavior                                        |
| ----- | -------------- | -------------------------------------------------- |
| `200` | Exam found     | Render detail view                                 |
| `401` | Unauthorized   | Redirect to login                                  |
| `404` | Exam not found | Show "Exam not found" empty state with back button |
| `500` | Server error   | Show error banner with retry button                |

---

### 3.4 Irregularity Logs Panel

**Location:** Accessed via the "View All Logs" button in the Exam Detail View, or directly via a link from the Exam List Table. Renders as a dedicated sub-page or expanded panel below the detail summary.

**API Endpoint:** `GET /api/v1/exam-integrity-v2/exams/{examId}/irregularity-logs`

**Trigger:** User clicks "View All Logs" in the detail view, or navigates to the logs tab for a specific exam.

#### Query Parameters Sent

| Parameter | Type    | Default | Description      |
| --------- | ------- | ------- | ---------------- |
| `page`    | integer | `1`     | Current page     |
| `limit`   | integer | `20`    | Records per page |

#### Log Table Columns

| Column Header | Field                                    | Display Notes                          |
| ------------- | ---------------------------------------- | -------------------------------------- |
| Student Name  | `student.firstName` + `student.lastName` | —                                      |
| Student Email | `student.email`                          | —                                      |
| IP Address    | `ipAddress`                              | Partially masked (e.g., `192.168.1.x`) |
| Device Info   | `deviceInfo`                             | Browser + OS                           |
| Geolocation   | `geolocation`                            | City, Country                          |
| Timestamp     | `timestamp`                              | `MMM DD, YYYY, HH:MM AM/PM`            |
| Anomaly Types | `anomalyTypes[]`                         | Render as one badge per anomaly type   |

#### Sample Request

```http
GET /api/v1/exam-integrity-v2/exams/3fa85f64-5717-4562-b3fc-2c963f66afa6/irregularity-logs?page=1&limit=20
```

#### Sample Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "total": 12,
    "page": 1,
    "limit": 20,
    "logs": [
      {
        "logId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
        "examId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa9",
        "student": {
          "id": "3fa85f64-5717-4562-b3fc-2c963f66afa9",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com"
        },
        "ipAddress": "192.168.1.1",
        "deviceInfo": "Chrome - Windows",
        "geolocation": "Lagos, Nigeria",
        "timestamp": "2026-05-20T09:13:48.672Z",
        "anomalyTypes": ["same_ip"]
      }
    ]
  }
}
```

#### UI Rendering Rules

- Each item in `anomalyTypes[]` renders as a separate badge (e.g., a log with `["same_ip", "fast_completion"]` shows two badges on the same row).
- If `logs` is an empty array, show an empty state: _"No irregularities detected for this exam."_
- Pagination controls appear below the table.

---

### 3.5 Visualization / Charts Section

**Location:** Below the Exam List Table (or in a dedicated "Analytics" tab). Renders three visual components.

**API Endpoint:** `GET /api/v1/exam-integrity-v2/chart-data`

**Trigger:** On page load and when `courseId` filter changes.

#### Query Parameters Sent

| Parameter  | Type | Required | Description                                               |
| ---------- | ---- | -------- | --------------------------------------------------------- |
| `courseId` | UUID | No       | Scopes all three chart datasets to exams from this course |

#### Chart Components

**Chart 1 — Randomization Distribution (Bar / Column Chart)**

Data source: `data.randomizationDistribution[]`

| Field              | Description                                             |
| ------------------ | ------------------------------------------------------- |
| `method`           | Randomization method label (`full`, `partial`, `none`)  |
| `examCount`        | Number of exams using this method                       |
| `avgEffectiveness` | Average randomization effectiveness (%) for this method |

Renders a grouped bar chart with two series: exam count and average effectiveness per method. X-axis = method, Y-axis = value.

**Chart 2 — Duplicate Heatmap (Map or Bar Chart by Location)**

Data source: `data.duplicateHeatmap[]`

| Field            | Description                                             |
| ---------------- | ------------------------------------------------------- |
| `location`       | City or region name                                     |
| `duplicateCount` | Number of flagged duplicate attempts from this location |

Renders as a geographic heatmap if a mapping library is available, or as a horizontal bar chart grouped by location when a map is not feasible. Locations with higher `duplicateCount` are shaded more intensely.

**Chart 3 — Irregular Logs Table (Inline Data Table)**

Data source: `data.irregularLogsTable[]`

| Field            | Description                   |
| ---------------- | ----------------------------- |
| `logId`          | Unique log identifier         |
| `studentId`      | Student UUID                  |
| `student`        | Student object (name, email)  |
| `anomalyTypes[]` | Array of anomaly type strings |
| `geolocation`    | Location string               |
| `timestamp`      | ISO 8601 datetime             |
| `status`         | Always `"Flagged"`            |

Renders as a sortable data table. Columns: Student, Anomaly Types (badges), Location, Timestamp, Status. This table provides a cross-exam view of all flagged sessions, unlike the per-exam logs in Section 3.4.

#### Sample Request

```http
GET /api/v1/exam-integrity-v2/chart-data?courseId=COURSE-UUID
```

#### Sample Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "randomizationDistribution": [
      { "method": "full", "examCount": 8, "avgEffectiveness": 85 },
      { "method": "partial", "examCount": 3, "avgEffectiveness": 60 },
      { "method": "none", "examCount": 1, "avgEffectiveness": 0 }
    ],
    "duplicateHeatmap": [
      { "location": "Lagos", "duplicateCount": 5 },
      { "location": "Abuja", "duplicateCount": 2 }
    ],
    "irregularLogsTable": [
      {
        "logId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
        "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa9",
        "student": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com"
        },
        "anomalyTypes": ["duplicate_answers"],
        "geolocation": "Lagos, Nigeria",
        "timestamp": "2026-05-20T09:13:48.676Z",
        "status": "Flagged"
      }
    ]
  }
}
```

---

## 4. Complete Step-by-Step User Flow

### Step 1 — Page Load

1. UI renders the filter bar (Course dropdown, empty by default).
2. Two parallel API calls fire immediately:
   - `GET /exams?page=1&limit=20` → populates the Exam List Table
   - `GET /chart-data` → populates all three visualization components
3. Both sections show loading skeletons until responses arrive.

### Step 2 — User Applies Course Filter

1. User selects a course from the dropdown (e.g., "Microfinance Principles").
2. Two simultaneous API calls fire:
   - `GET /exams?courseId={uuid}&page=1&limit=20`
   - `GET /chart-data?courseId={uuid}`
3. Exam List Table and all three charts refresh. Table resets to page 1.

### Step 3 — User Browses the Exam List

1. User reviews KPI columns in the table: Duplicate Rate, Overlap %, Randomization Effectiveness, Irregular Attempts, Integrity Status.
2. Flagged exams (red/amber rows) are visually prominent.
3. User pages through results using pagination controls.
   - Only `GET /exams?...&page=N&limit=20` is called. Chart data is **not** re-fetched on pagination.

### Step 4 — User Opens an Exam Detail

1. User clicks the title **"Microfinance Midterm"** in the table.
2. The UI issues:
   - `GET /exams/3fa85f64-5717-4562-b3fc-2c963f66afa6`
3. A detail view (full page or side panel) opens showing:
   - KPI summary block with all integrity metrics
   - An inline preview of the first few irregularity logs
4. If `integrityStatus` is `"Flagged"`, the panel header renders with a red/amber indicator.

### Step 5 — User Views All Irregularity Logs for an Exam

1. User clicks **"View All Logs"** in the detail view's log preview.
2. The UI issues:
   - `GET /exams/{examId}/irregularity-logs?page=1&limit=20`
3. The full paginated logs panel renders.
4. User can page through logs, read anomaly badges, and review per-session details (IP, device, location, timestamp).

### Step 6 — User Reviews Visualizations

1. User scrolls to (or switches to) the Analytics / Charts section.
2. Data is already loaded from the initial `GET /chart-data` call (Step 1) or the filtered call (Step 2).
3. User reads the Randomization Distribution chart to assess method coverage and effectiveness.
4. User inspects the Duplicate Heatmap to identify geographic clusters of suspicious activity.
5. User reviews the cross-exam Irregular Logs Table for a system-wide flagged-session overview.

### Step 7 — User Clears Filter

1. User clicks **Clear Filter**.
2. The Course dropdown resets to empty.
3. Two calls fire:
   - `GET /exams?page=1&limit=20`
   - `GET /chart-data`
4. All content returns to the unfiltered state.

---

## 5. Request & Response Structures

### `/exams` — Query Parameters

| Parameter  | Type    | Format | Required | Default | Description                    |
| ---------- | ------- | ------ | -------- | ------- | ------------------------------ |
| `courseId` | string  | UUID   | No       | —       | Filter to exams in this course |
| `page`     | integer | —      | No       | `1`     | Page number                    |
| `limit`    | integer | —      | No       | `20`    | Records per page               |

### `/exams/{examId}` — Path Parameters

| Parameter | Type          | Required | Description            |
| --------- | ------------- | -------- | ---------------------- |
| `examId`  | string (UUID) | Yes      | Unique exam identifier |

### `/exams/{examId}/irregularity-logs` — Parameters

| Parameter | Location | Type    | Required | Default | Description      |
| --------- | -------- | ------- | -------- | ------- | ---------------- |
| `examId`  | path     | UUID    | Yes      | —       | Target exam      |
| `page`    | query    | integer | No       | `1`     | Page number      |
| `limit`   | query    | integer | No       | `20`    | Records per page |

### `/chart-data` — Query Parameters

| Parameter  | Type   | Format | Required | Description                     |
| ---------- | ------ | ------ | -------- | ------------------------------- |
| `courseId` | string | UUID   | No       | Scopes all three chart datasets |

### Standard Success Envelope

```json
{
  "success": true,
  "data": { ... }
}
```

### Standard Error Envelope

```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Exam not found"
  }
}
```

---

## 6. KPI Logic & Calculations

### Duplicate Question Rate (%)

```
Duplicate Question Rate = (duplicateDetectionCount / totalAttempts) × 100
```

Example: 2 duplicate sets out of 100 attempts → **2.0%**

### Average Question Overlap (%)

```
Avg Question Overlap = (Number of shared questions ÷ Total questions per set) × 100
```

Averaged across all pairwise comparisons for the exam.

### Randomization Effectiveness (%)

Measures the degree to which question sets are uniquely distributed across students. A higher value means fewer students received the same question arrangement.

```
Randomization Effectiveness = 100 − Avg Question Overlap
```

Or computed directly from the distribution of question set hashes: if all sets are unique, effectiveness = 100%.

### Integrity Status Logic

| Condition                                                        | Status    |
| ---------------------------------------------------------------- | --------- |
| `duplicateQuestionRate` is low AND `irregularAttemptsCount` is 0 | `Valid`   |
| `duplicateQuestionRate` is high OR `irregularAttemptsCount` > 0  | `Flagged` |

> Threshold values for "high" duplication and the definition of "low" are configurable per deployment.

---

## 7. Field Definitions

| Field                        | Type     | Description                                             |
| ---------------------------- | -------- | ------------------------------------------------------- |
| `examId`                     | UUID     | Unique exam identifier                                  |
| `examTitle`                  | string   | Human-readable exam name                                |
| `randomizationMethod`        | string   | `full`, `partial`, or `none`                            |
| `totalAttempts`              | integer  | Total student attempts for this exam                    |
| `duplicateDetectionCount`    | integer  | Number of identical exam sets detected                  |
| `duplicateQuestionRate`      | number   | `(duplicateDetectionCount / totalAttempts) × 100`       |
| `avgQuestionOverlap`         | number   | Mean pairwise question set similarity (%)               |
| `randomizationEffectiveness` | number   | Measure of uniqueness across all exam sets (%)          |
| `irregularAttemptsCount`     | integer  | Total flagged suspicious sessions                       |
| `integrityStatus`            | string   | `Valid` or `Flagged`                                    |
| `course.id`                  | UUID     | Parent course identifier                                |
| `course.title`               | string   | Human-readable course name                              |
| `logId`                      | UUID     | Unique irregularity log entry identifier                |
| `studentId`                  | UUID     | Student who triggered the irregularity                  |
| `student.firstName`          | string   | Student first name                                      |
| `student.lastName`           | string   | Student last name                                       |
| `student.email`              | string   | Student email address                                   |
| `ipAddress`                  | string   | Network IP address at time of attempt                   |
| `deviceInfo`                 | string   | Browser and OS fingerprint string                       |
| `geolocation`                | string   | Resolved location (City, Country) — optional            |
| `timestamp`                  | ISO 8601 | Date and time of the flagged event                      |
| `anomalyTypes`               | string[] | Array of anomaly type codes (see Section 8)             |
| `method`                     | string   | Randomization method label (chart data)                 |
| `examCount`                  | integer  | Number of exams using this method (chart data)          |
| `avgEffectiveness`           | number   | Average effectiveness for the method group (chart data) |
| `location`                   | string   | Geographic location label (heatmap data)                |
| `duplicateCount`             | integer  | Flagged duplicate attempts from this location (heatmap) |
| `status`                     | string   | Always `"Flagged"` in the cross-exam logs table         |
| `total`                      | integer  | Total matching records (for pagination)                 |
| `page`                       | integer  | Current page (1-indexed)                                |
| `limit`                      | integer  | Records per page                                        |

---

## 8. Status & Anomaly Type Values

### `integrityStatus` — Badge Colors

| Value     | Badge Color | Meaning                                               |
| --------- | ----------- | ----------------------------------------------------- |
| `Valid`   | Green       | No significant duplication or irregular activity      |
| `Flagged` | Red         | High duplication rate or suspicious sessions detected |

### `randomizationMethod` — Badge Colors

| Value     | Badge Color | Meaning                             |
| --------- | ----------- | ----------------------------------- |
| `full`    | Blue        | Questions and options both shuffled |
| `partial` | Amber       | Only options or sections shuffled   |
| `none`    | Gray        | No randomization applied            |

### `anomalyTypes` — Badge Reference

| Code                | Display Label     | Description                                          |
| ------------------- | ----------------- | ---------------------------------------------------- |
| `same_ip`           | Same IP           | Multiple students submitted from the same IP address |
| `duplicate_answers` | Duplicate Answers | Identical answer patterns across multiple students   |
| `fast_completion`   | Fast Completion   | Submission time was suspiciously short               |
| `same_device`       | Same Device       | Multiple students used the same device fingerprint   |

Multiple anomaly types can appear on a single log entry. Each renders as its own badge.

### Randomization Effectiveness — Progress Bar Thresholds

| Range  | Bar Color |
| ------ | --------- |
| ≥ 80%  | Green     |
| 50–79% | Amber     |
| < 50%  | Red       |

### Duplicate Question Rate — Display Rules

| Value         | Color           |
| ------------- | --------------- |
| 0%            | Green (neutral) |
| > 0% and ≤ 5% | Amber           |
| > 5%          | Red             |

---

## 9. Validation Rules

### Client-Side (before API call)

| Rule                | Condition                                                       | Message                                                              |
| ------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------- |
| UUID format         | `courseId` (filter dropdown) must be a valid UUID               | Enforced by dropdown; free-text UUID entry not permitted             |
| Pagination bounds   | `page` ≥ 1; `limit` between 1 and 100                           | Enforced by pagination controls                                      |
| Path param presence | `examId` must be present before calling detail or logs endpoint | Navigation logic enforces this; deep links validate before rendering |

### Server-Side (API-level)

The API returns `400 Bad Request` for invalid parameters. The UI must surface the `error.message` from the response body in an inline error banner near the affected control.

For `401 Unauthorized`, the UI must immediately redirect to the login page without displaying any report data.

---

## 10. Error Handling

| HTTP Status     | Endpoint(s)       | UI Behavior                                                                        |
| --------------- | ----------------- | ---------------------------------------------------------------------------------- |
| `200`           | All               | Render data normally                                                               |
| `401`           | All               | Clear session state and redirect to login                                          |
| `404`           | `/exams/{examId}` | Show "Exam not found" empty state with **Back to List** button                     |
| `500`           | All               | Show error banner: _"Something went wrong. Please try again."_ with a Retry button |
| Network timeout | All               | Show error banner with Retry; do not clear existing loaded data                    |

### Independent Error Boundaries

The Exam List Table, Visualization section, and Detail view manage their own loading/error states independently:

- A `500` on `/chart-data` shows an error only in the Visualization section; the Exam List Table continues to function.
- A `500` on `/exams` shows an error only in the table; charts continue to display last-loaded data.
- The Detail view and Logs panel errors are contained within their own panel — they do not affect the parent list view.

---

## 11. Pagination

### Exam List Table — `/exams`

| Control                 | Behavior                                  |
| ----------------------- | ----------------------------------------- |
| Previous / Next buttons | Navigate between pages                    |
| Page indicator          | `Page X of Y` where Y = `⌈total / limit⌉` |
| Records per page        | Options: `10`, `20` (default), `50`       |
| Filter change           | Resets to page 1                          |
| Limit change            | Resets to page 1                          |

### Irregularity Logs Panel — `/irregularity-logs`

| Control                 | Behavior                            |
| ----------------------- | ----------------------------------- |
| Previous / Next buttons | Navigate between log pages          |
| Page indicator          | `Page X of Y`                       |
| Records per page        | Options: `10`, `20` (default), `50` |

### Chart Data — `/chart-data`

No pagination. The `/chart-data` endpoint returns all pre-aggregated datasets in a single response. There are no page or limit parameters.

---

## 12. Privacy & Compliance Notes

The following fields contain personally identifiable or network-sensitive data and must be handled in accordance with applicable data privacy regulations (e.g., GDPR, NDPR):

| Field           | Sensitivity | Recommended Handling                                                                    |
| --------------- | ----------- | --------------------------------------------------------------------------------------- |
| `ipAddress`     | Medium      | Partially mask in UI display (e.g., `192.168.1.x`). Store securely.                     |
| `deviceInfo`    | Low–Medium  | Display as-is; do not expose raw fingerprint hashes.                                    |
| `geolocation`   | Low–Medium  | Display at city/country level only; do not expose coordinates.                          |
| `student.email` | High        | Display only to authorized admins; do not include in CSV exports visible to non-admins. |

Additional backend requirements:

- IP and device tracking must be consistently captured per attempt at the time of submission.
- Geolocation resolution is optional and should be implemented as a pluggable service.
- Time anomaly thresholds (for `fast_completion` detection) must be configurable per exam, not hardcoded.
- Audit logs of admin access to irregularity data should be maintained separately.

---

## Appendix A — Sample API Call Sequence

```
1. Page loads
   → GET /exams?page=1&limit=20
   → GET /chart-data

2. User selects course "Microfinance" (ID: abc-123)
   → GET /exams?courseId=abc-123&page=1&limit=20
   → GET /chart-data?courseId=abc-123

3. User clicks page 2 of the exam list
   → GET /exams?courseId=abc-123&page=2&limit=20
   (No /chart-data call — filter did not change)

4. User clicks exam "Microfinance Midterm" (ID: exam-456)
   → GET /exams/exam-456

5. User clicks "View All Logs" in the detail panel
   → GET /exams/exam-456/irregularity-logs?page=1&limit=20

6. User pages through logs
   → GET /exams/exam-456/irregularity-logs?page=2&limit=20

7. User returns to list and clears the course filter
   → GET /exams?page=1&limit=20
   → GET /chart-data
```

---

## Appendix B — Anomaly Detection Reference

The backend flags attempts based on the following conditions. These thresholds should be configurable:

| Anomaly Type        | Detection Condition                                                                                        |
| ------------------- | ---------------------------------------------------------------------------------------------------------- |
| `same_ip`           | Two or more students submitted the same exam from the same IP address within the same session window       |
| `duplicate_answers` | Answer sequences between two students have similarity above a configured threshold (e.g., > 90% identical) |
| `fast_completion`   | Student completed the exam in less than a configured minimum time (e.g., < 20% of the allowed duration)    |
| `same_device`       | Two or more students share an identical device/browser fingerprint for the same exam                       |

An attempt may carry multiple anomaly types simultaneously. All matching types are stored in the `anomalyTypes[]` array for that log entry.
