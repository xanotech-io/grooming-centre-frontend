# TC02 – Question Bank Usage Report

## Overview

The **Question Bank Usage Analytics Module** tracks how questions are used across exams and evaluates their difficulty, effectiveness, and reliability. It aggregates attempt-level data into per-question metrics, computes performance and quality indicators, flags weak or overused questions, and exposes structured KPIs and chart datasets for reporting and visualization.

This document describes the complete end-to-end flow: how each UI section maps to its API endpoint, what is sent and received, how data is rendered, and how validations and errors are handled.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [API Endpoints Reference](#2-api-endpoints-reference)
3. [UI Sections and API Mapping](#3-ui-sections-and-api-mapping)
   - [3.1 Filter Bar](#31-filter-bar)
   - [3.2 Summary KPI Bar](#32-summary-kpi-bar)
   - [3.3 Question List Table](#33-question-list-table)
   - [3.4 Question Detail View](#34-question-detail-view)
   - [3.5 Visualization / Charts Section](#35-visualization--charts-section)
4. [Complete Step-by-Step User Flow](#4-complete-step-by-step-user-flow)
5. [Request & Response Structures](#5-request--response-structures)
6. [KPI Logic & Calculations](#6-kpi-logic--calculations)
7. [Field Definitions](#7-field-definitions)
8. [Flag & Quality Indicator Reference](#8-flag--quality-indicator-reference)
9. [Validation Rules](#9-validation-rules)
10. [Error Handling](#10-error-handling)
11. [Pagination](#11-pagination)

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────┐
│                            UI (Admin / Instructor)                       │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │  Filter Bar  (courseId · difficulty · questionType · date range) │    │
│  └──────────────────────────────┬───────────────────────────────────┘    │
│                                 │ drives all sections below              │
│  ┌──────────────────────────────▼───────────────────────────────────┐    │
│  │  Summary KPI Bar                                                 │    │
│  │  totalQuestions · difficultyDistribution · overallCorrectRate    │    │
│  │  totalAttempts · usageTrend                                      │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌───────────────────────────┐    ┌───────────────────────────────────┐  │
│  │  Question List Table      │    │  Visualization / Charts           │  │
│  │  (paginated, filterable)  │    │  · Difficulty Distribution Bar    │  │
│  │           │               │    │  · Correct Rate vs Time Scatter   │  │
│  │           ▼ click row     │    │  · Monthly Usage Trend            │  │
│  │  Question Detail View     │    └───────────────────────────────────┘  │
│  └───────────────────────────┘                                           │
└──────────────────────────────────────────────────────────────────────────┘
          │                    │                      │
          ▼                    ▼                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                             API Layer                                    │
│                                                                          │
│  GET /question-bank-v2/summary          ◄── Summary KPI Bar             │
│  GET /question-bank-v2/questions        ◄── Question List Table          │
│  GET /question-bank-v2/questions/{id}   ◄── Question Detail View         │
│  GET /question-bank-v2/chart-data       ◄── Visualization Section        │
└──────────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  Backend / Database                                                      │
│  questions | exam_question_usage | student_responses | attempt_timings   │
└──────────────────────────────────────────────────────────────────────────┘
```

**Key design principles:**

- The **Filter Bar** drives three endpoints simultaneously: `/summary`, `/questions`, and `/chart-data`. When any filter changes, all three are re-fetched together.
- The **Question Detail View** is triggered by row-level navigation and operates independently via `/questions/{questionId}`.
- `courseId` is the only filter shared by all four endpoints. `difficulty`, `questionType`, and date range apply only to `/questions`.

> **Access control:** All endpoints require admin or instructor authentication. A `401` response must redirect to the login page immediately.

---

## 2. API Endpoints Reference

| #   | Method | Endpoint                                          | Purpose                                              |
| --- | ------ | ------------------------------------------------- | ---------------------------------------------------- |
| 1   | `GET`  | `/api/v1/question-bank-v2/summary`                | Aggregate KPI bar (totals, difficulty split, trend)  |
| 2   | `GET`  | `/api/v1/question-bank-v2/questions`              | Paginated question list with per-question analytics  |
| 3   | `GET`  | `/api/v1/question-bank-v2/questions/{questionId}` | Full analytics detail for a single question          |
| 4   | `GET`  | `/api/v1/question-bank-v2/chart-data`             | Pre-computed datasets for all three chart components |

---

## 3. UI Sections and API Mapping

### 3.1 Filter Bar

**Location:** Top of the Question Bank Usage Report page, above all other sections.

**Purpose:** Scopes the entire report to a specific course, difficulty level, question type, and/or date window. Every filter change triggers a simultaneous refresh of the Summary KPI Bar, the Question List Table, and the Visualization section.

#### Filter Controls

| Control       | Type            | Maps To (Query Param)    | Endpoints Affected                      |
| ------------- | --------------- | ------------------------ | --------------------------------------- |
| Course        | Dropdown (UUID) | `courseId`               | `/summary`, `/questions`, `/chart-data` |
| Difficulty    | Dropdown (enum) | `difficulty`             | `/questions` only                       |
| Question Type | Dropdown (enum) | `questionType`           | `/questions` only                       |
| Start Date    | Date picker     | `startDate` (YYYY-MM-DD) | `/questions` only                       |
| End Date      | Date picker     | `endDate` (YYYY-MM-DD)   | `/questions` only                       |

#### Allowed Filter Values

**`difficulty`**

| Value    | Description                   |
| -------- | ----------------------------- |
| `Easy`   | Low-difficulty questions      |
| `Medium` | Moderate-difficulty questions |
| `Hard`   | High-difficulty questions     |

**`questionType`**

| Value          | Display Label     |
| -------------- | ----------------- |
| `mcq`          | Multiple Choice   |
| `essay`        | Essay             |
| `true_false`   | True / False      |
| `fill_blank`   | Fill in the Blank |
| `matching`     | Matching          |
| `short_answer` | Short Answer      |

#### Filter Behavior

- All filters are optional. With no filters applied the report returns data across all courses, difficulties, types, and dates.
- `startDate` and `endDate` must both be provided together or both omitted; providing only one is invalid (see [Validation Rules](#9-validation-rules)).
- `endDate` must be equal to or after `startDate`.
- Changing any filter resets the Question List Table to page 1.
- A **Clear Filters** button resets all controls to empty and re-fetches with no parameters.
- `difficulty`, `questionType`, and date range do **not** affect `/summary` or `/chart-data` — those endpoints remain scoped to `courseId` only.

---

### 3.2 Summary KPI Bar

**Location:** Below the filter bar, above the question list. Displayed as a horizontal row of metric cards.

**API Endpoint:** `GET /api/v1/question-bank-v2/summary`

**Trigger:** On page load and whenever `courseId` changes. Not re-triggered by changes to `difficulty`, `questionType`, or date range.

#### KPI Cards Displayed

| Card                 | Field (`data.*`)                  | Display Format      | Description                                     |
| -------------------- | --------------------------------- | ------------------- | ----------------------------------------------- |
| Total Questions      | `totalQuestions`                  | Integer             | All active questions in scope                   |
| Easy                 | `difficultyDistribution.Easy`     | Integer             | Count of Easy-tagged questions                  |
| Medium               | `difficultyDistribution.Medium`   | Integer             | Count of Medium-tagged questions                |
| Hard                 | `difficultyDistribution.Hard`     | Integer             | Count of Hard-tagged questions                  |
| Untagged             | `difficultyDistribution.untagged` | Integer             | Questions with no difficulty tag                |
| Overall Correct Rate | `overallCorrectRate`              | `XX%`               | Mean correct response rate across all questions |
| Total Attempts       | `totalAttempts`                   | Integer (formatted) | All student attempts recorded                   |

The `usageTrend` array from this endpoint feeds the Trend Chart in the Visualization section (see [Section 3.5](#35-visualization--charts-section)).

#### Sample Request

```http
GET /api/v1/question-bank-v2/summary?courseId=COURSE-UUID
```

#### Sample Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "totalQuestions": 70,
    "difficultyDistribution": {
      "Easy": 20,
      "Medium": 35,
      "Hard": 15,
      "untagged": 0
    },
    "overallCorrectRate": 67.4,
    "totalAttempts": 8200,
    "usageTrend": [
      { "month": "2026-01", "usageCount": 420 },
      { "month": "2026-02", "usageCount": 510 },
      { "month": "2026-03", "usageCount": 390 }
    ]
  }
}
```

#### UI Rendering Rules

- While loading, each card shows a skeleton placeholder.
- `overallCorrectRate` below 50% renders the card value in amber; below 30% in red.
- Difficulty distribution cards can optionally render as a mini inline bar showing proportional fill.
- On error, all cards display `—` with an error message beneath the bar.

---

### 3.3 Question List Table

**Location:** Main content area, below the KPI bar.

**API Endpoint:** `GET /api/v1/question-bank-v2/questions`

**Trigger:** On page load, on any filter change, and on pagination navigation.

#### Query Parameters Sent

| Parameter      | Type              | Default | Description              |
| -------------- | ----------------- | ------- | ------------------------ |
| `courseId`     | UUID              | —       | Course filter            |
| `difficulty`   | string            | —       | Difficulty filter        |
| `questionType` | string            | —       | Question type filter     |
| `startDate`    | date (YYYY-MM-DD) | —       | Attempt date range start |
| `endDate`      | date (YYYY-MM-DD) | —       | Attempt date range end   |
| `page`         | integer           | `1`     | Current page             |
| `limit`        | integer           | `20`    | Records per page         |

#### Table Columns

| Column Header     | Field (`data.questions[*].*`) | Display Notes                                                                |
| ----------------- | ----------------------------- | ---------------------------------------------------------------------------- |
| Question          | `question`                    | Truncated to ~80 chars; full text in tooltip. Clickable — opens detail view. |
| Type              | `questionType`                | Badge (see type values)                                                      |
| Section           | `section`                     | Plain text                                                                   |
| Course            | `course`                      | Plain text                                                                   |
| Exam              | `examTitle`                   | Plain text                                                                   |
| Difficulty        | `difficultyLevel`             | Colored badge: green (Easy), amber (Medium), red (Hard)                      |
| Usage Frequency   | `usageFrequency`              | Integer; amber if above overuse threshold                                    |
| Total Attempts    | `totalAttempts`               | Integer                                                                      |
| Correct Rate      | `correctResponseRate`         | `XX%` with color coding (see thresholds)                                     |
| Avg Time Spent    | `averageTimeSpent`            | `XXs`; amber/red if above time threshold                                     |
| Reliability Index | `reliabilityIndex`            | Decimal (0–1); red if below reliability threshold                            |
| Last Used         | `lastUsedDate`                | Formatted date: `May 20, 2026`                                               |
| Flags             | `flags[]`                     | One badge per flag; row highlighted if any flags present                     |

#### Sortable Columns

- `correctResponseRate`
- `usageFrequency`
- `averageTimeSpent`
- `reliabilityIndex`
- `lastUsedDate`

#### Sample Request

```http
GET /api/v1/question-bank-v2/questions
  ?courseId=COURSE-UUID
  &difficulty=Hard
  &startDate=2026-01-01
  &endDate=2026-03-31
  &page=1
  &limit=20
```

#### Sample Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "questions": [
      {
        "questionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "question": "What is the primary purpose of a microfinance institution?",
        "questionType": "mcq",
        "section": "Module 1 – Introduction",
        "difficultyLevel": "Hard",
        "predefinedDifficulty": "Hard",
        "course": "Microfinance Basics",
        "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
        "examId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
        "examTitle": "Microfinance Midterm",
        "lastUsedDate": "2026-03-15T00:00:00Z",
        "createdAt": "2025-09-01T00:00:00Z",
        "usageFrequency": 5,
        "totalAttempts": 100,
        "correctResponses": 60,
        "incorrectResponses": 40,
        "correctResponseRate": 60.0,
        "averageTimeSpent": 35,
        "reliabilityIndex": 0.45,
        "flags": ["too_difficult"]
      }
    ]
  }
}
```

#### UI Rendering Rules

- Rows with any `flags` entries are highlighted with a light amber or red background.
- The `flags[]` array renders each item as a distinct badge in the Flags column (see [Section 8](#8-flag--quality-indicator-reference) for badge colors and thresholds).
- If `flags` is an empty array, the Flags cell is blank.
- Questions with `difficultyLevel: "Hard"` and `correctResponseRate < 30` should render the Correct Rate value in red.

---

### 3.4 Question Detail View

**Location:** Opens as a full page or side panel when a user clicks a question row or its title text in the list table.

**API Endpoint:** `GET /api/v1/question-bank-v2/questions/{questionId}`

**Trigger:** User clicks a question row in the Question List Table.

#### Content Rendered

| Label                   | Field                  | Display Format                          |
| ----------------------- | ---------------------- | --------------------------------------- |
| Question Text           | `question`             | Full text, not truncated                |
| Question Type           | `questionType`         | Badge                                   |
| Section                 | `section`              | Plain text                              |
| Course                  | `course`               | Plain text                              |
| Exam                    | `examTitle`            | Plain text                              |
| Created                 | `createdAt`            | Formatted date                          |
| Last Used               | `lastUsedDate`         | Formatted date                          |
| Difficulty (system)     | `difficultyLevel`      | Colored badge                           |
| Difficulty (predefined) | `predefinedDifficulty` | Plain text — instructor's original tag  |
| Usage Frequency         | `usageFrequency`       | Integer                                 |
| Total Attempts          | `totalAttempts`        | Integer                                 |
| Correct Responses       | `correctResponses`     | Integer                                 |
| Incorrect Responses     | `incorrectResponses`   | Integer                                 |
| Correct Response Rate   | `correctResponseRate`  | `XX%` with color                        |
| Avg Time Spent          | `averageTimeSpent`     | `XX seconds`                            |
| Reliability Index       | `reliabilityIndex`     | Decimal (0–1) with interpretation label |
| Quality Flags           | `flags[]`              | One badge per flag                      |

**Reliability Index Interpretation Labels**

| Range       | Label                |
| ----------- | -------------------- |
| 0.70 – 1.00 | High Reliability     |
| 0.40 – 0.69 | Moderate Reliability |
| 0.00 – 0.39 | Low Reliability      |

#### Sample Request

```http
GET /api/v1/question-bank-v2/questions/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

#### Sample Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "questionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "question": "What is the primary purpose of a microfinance institution?",
    "questionType": "mcq",
    "section": "Module 1 – Introduction",
    "difficultyLevel": "Hard",
    "predefinedDifficulty": "Hard",
    "course": "Microfinance Basics",
    "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
    "examId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
    "examTitle": "Microfinance Midterm",
    "lastUsedDate": "2026-03-15T00:00:00Z",
    "createdAt": "2025-09-01T00:00:00Z",
    "usageFrequency": 5,
    "totalAttempts": 100,
    "correctResponses": 60,
    "incorrectResponses": 40,
    "correctResponseRate": 60.0,
    "averageTimeSpent": 35,
    "reliabilityIndex": 0.45,
    "flags": ["too_difficult"]
  }
}
```

#### Response Codes

| Code  | Meaning            | UI Behavior                                            |
| ----- | ------------------ | ------------------------------------------------------ |
| `200` | Question found     | Render detail view                                     |
| `401` | Unauthorized       | Redirect to login                                      |
| `404` | Question not found | Show "Question not found" empty state with Back button |
| `500` | Server error       | Show error banner with Retry button                    |

---

### 3.5 Visualization / Charts Section

**Location:** Below the Question List Table, or in a dedicated "Analytics" tab.

**API Endpoint:** `GET /api/v1/question-bank-v2/chart-data`

**Trigger:** On page load and whenever `courseId` changes. Not re-triggered by `difficulty`, `questionType`, or date range changes.

#### Query Parameters Sent

| Parameter  | Type | Required | Description                                   |
| ---------- | ---- | -------- | --------------------------------------------- |
| `courseId` | UUID | No       | Scopes all three chart datasets to one course |

#### Chart Components

---

**Chart 1 — Difficulty Distribution (Bar Chart)**

Data source: `data.difficultyDistribution`

| Field    | Description               |
| -------- | ------------------------- |
| `easy`   | Count of Easy questions   |
| `medium` | Count of Medium questions |
| `hard`   | Count of Hard questions   |

Renders as a vertical bar chart with three bars. Bar colors: Easy = green, Medium = amber, Hard = red. Y-axis = question count. X-axis = difficulty level.

> Note: `/chart-data` uses lowercase keys (`easy`, `medium`, `hard`). `/summary` uses title-case (`Easy`, `Medium`, `Hard`, `untagged`). The UI must handle both separately.

---

**Chart 2 — Correct Rate vs. Average Time (Scatter Plot)**

Data source: `data.scatterData[]`

| Field         | Description                                       |
| ------------- | ------------------------------------------------- |
| `questionId`  | UUID of the question (used for tooltip lookup)    |
| `correctRate` | Correct response rate (%) — plotted on Y-axis     |
| `avgTime`     | Average time spent in seconds — plotted on X-axis |

Each point represents one question. Hovering a point shows the question's ID (and optionally its truncated text if cross-referenced with the question list). The plot helps identify outliers: questions with low correct rates and high time are candidates for revision; questions with very high correct rates and very low time are potentially too easy.

**Quadrant interpretation (optional overlay):**

| Quadrant     | Correct Rate | Avg Time | Interpretation                |
| ------------ | ------------ | -------- | ----------------------------- |
| Top-right    | High         | High     | Challenging but engaging      |
| Top-left     | High         | Low      | Possibly too easy             |
| Bottom-right | Low          | High     | Too difficult or confusing    |
| Bottom-left  | Low          | Low      | Disengaging or poorly written |

---

**Chart 3 — Monthly Usage Trend (Line / Area Chart)**

Data source: `data.usageTrend[]`

> The `/chart-data` endpoint provides `usageTrend`. The `/summary` endpoint provides an identical structure. The UI should use `/chart-data`'s `usageTrend` for the Visualization section and `/summary`'s `usageTrend` only if the chart-data call fails.

| Field        | Description                                            |
| ------------ | ------------------------------------------------------ |
| `month`      | Year-month string: `"2026-01"`                         |
| `usageCount` | Total question appearances across all exams that month |

Renders as a line or area chart. X-axis = month labels (formatted as `Jan 2026`). Y-axis = usage count. Used to identify spikes in exam activity or prolonged periods of question re-use.

---

#### Sample Request

```http
GET /api/v1/question-bank-v2/chart-data?courseId=COURSE-UUID
```

#### Sample Response (`200 OK`)

```json
{
  "success": true,
  "data": {
    "difficultyDistribution": {
      "easy": 20,
      "medium": 35,
      "hard": 15
    },
    "scatterData": [
      {
        "questionId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "correctRate": 60,
        "avgTime": 35
      },
      {
        "questionId": "3fa85f64-5717-4562-b3fc-2c963f66afb1",
        "correctRate": 88,
        "avgTime": 12
      },
      {
        "questionId": "3fa85f64-5717-4562-b3fc-2c963f66afb2",
        "correctRate": 25,
        "avgTime": 55
      }
    ],
    "usageTrend": [
      { "month": "2026-01", "usageCount": 420 },
      { "month": "2026-02", "usageCount": 510 },
      { "month": "2026-03", "usageCount": 390 }
    ]
  }
}
```

---

## 4. Complete Step-by-Step User Flow

### Step 1 — Page Load

1. UI renders the filter bar with all controls empty (no filters applied).
2. Three parallel API calls fire:
   - `GET /summary` → populates KPI cards (loading skeletons shown)
   - `GET /questions?page=1&limit=20` → populates question list (table skeleton shown)
   - `GET /chart-data` → populates all three chart components (chart skeletons shown)
3. Responses arrive and all sections render.

### Step 2 — User Applies Course Filter

1. User selects a course from the Course dropdown (e.g., "Microfinance Basics").
2. Three simultaneous calls fire:
   - `GET /summary?courseId={uuid}`
   - `GET /questions?courseId={uuid}&page=1&limit=20`
   - `GET /chart-data?courseId={uuid}`
3. All three sections refresh. Question list resets to page 1.

### Step 3 — User Narrows by Difficulty and Question Type

1. User selects `Hard` from the Difficulty dropdown.
2. User selects `mcq` from the Question Type dropdown.
3. Only the question list call re-fires (the other two endpoints do not support these filters):
   - `GET /questions?courseId={uuid}&difficulty=Hard&questionType=mcq&page=1&limit=20`
4. KPI bar and charts remain unchanged.

### Step 4 — User Applies a Date Range

1. User selects Start Date `2026-01-01` and End Date `2026-03-31`.
2. Once both dates are valid, the question list call re-fires:
   - `GET /questions?courseId={uuid}&difficulty=Hard&questionType=mcq&startDate=2026-01-01&endDate=2026-03-31&page=1&limit=20`
3. If only one date is set, validation prevents the call and shows an inline error.

### Step 5 — User Browses the Question List

1. User reviews flags, correct rates, and reliability scores in the table.
2. Flagged rows (amber/red background) are visually prominent.
3. User pages through results with pagination controls.
   - Only `GET /questions?...&page=N` is called. KPI bar and charts are not re-fetched.

### Step 6 — User Opens a Question Detail

1. User clicks the question text **"What is the primary purpose of a microfinance institution?"**.
2. The UI issues:
   - `GET /questions/3fa85f64-5717-4562-b3fc-2c963f66afa6`
3. A detail view opens showing full analytics, metrics, and flags for that question.
4. The Reliability Index is shown with its interpretation label (e.g., _Moderate Reliability_).
5. User clicks **Back** to return to the question list with all filters preserved.

### Step 7 — User Reviews Charts

1. User scrolls to (or switches tabs to) the Visualization section.
2. Chart data is already loaded from Step 1 or Step 2 — no additional call is needed unless the course filter changes.
3. User reads the Difficulty Distribution bar chart to assess bank composition.
4. User reviews the Scatter Plot to identify outlier questions (low correct rate + high time).
5. User reviews the Usage Trend to spot periods of heavy question reuse.

### Step 8 — User Clears All Filters

1. User clicks **Clear Filters**.
2. All controls reset to empty.
3. Three calls fire simultaneously:
   - `GET /summary`
   - `GET /questions?page=1&limit=20`
   - `GET /chart-data`
4. All sections return to the unfiltered state.

---

## 5. Request & Response Structures

### `/summary` — Query Parameters

| Parameter  | Type   | Format | Required | Description                 |
| ---------- | ------ | ------ | -------- | --------------------------- |
| `courseId` | string | UUID   | No       | Scope summary to one course |

### `/questions` — Query Parameters

| Parameter      | Type    | Format     | Required | Default | Description                 |
| -------------- | ------- | ---------- | -------- | ------- | --------------------------- |
| `courseId`     | string  | UUID       | No       | —       | Course filter               |
| `difficulty`   | string  | enum       | No       | —       | `Easy`, `Medium`, or `Hard` |
| `questionType` | string  | enum       | No       | —       | See question type values    |
| `startDate`    | string  | YYYY-MM-DD | No\*     | —       | Attempt date range start    |
| `endDate`      | string  | YYYY-MM-DD | No\*     | —       | Attempt date range end      |
| `page`         | integer | —          | No       | `1`     | Page number                 |
| `limit`        | integer | —          | No       | `20`    | Records per page            |

\*Both `startDate` and `endDate` must be provided together or both omitted.

### `/questions/{questionId}` — Path Parameters

| Parameter    | Type          | Required | Description                |
| ------------ | ------------- | -------- | -------------------------- |
| `questionId` | string (UUID) | Yes      | Unique question identifier |

### `/chart-data` — Query Parameters

| Parameter  | Type   | Format | Required | Description                            |
| ---------- | ------ | ------ | -------- | -------------------------------------- |
| `courseId` | string | UUID   | No       | Scope all chart datasets to one course |

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
    "code": "VALIDATION_ERROR",
    "message": "endDate must be on or after startDate"
  }
}
```

---

## 6. KPI Logic & Calculations

### Correct Response Rate (%)

```
Correct Response Rate = (correctResponses / totalAttempts) × 100
```

Example: 60 correct out of 100 attempts → **60.0%**

### Average Time Spent (seconds)

```
Average Time Spent = totalTimeSpent / totalAttempts
```

Stored and returned in seconds. Display as `XXs` in the table; expand to `X min Xs` in the detail view when the value exceeds 60.

### Reliability Index (0 – 1)

A statistical consistency score measuring how stable a question's performance is across multiple exam attempts. A higher value indicates the question consistently discriminates between students who know the material and those who do not.

```
Reliability Index = 1 − (variance of per-attempt correctness / max variance)
```

Computed by the backend; the frontend displays the value and maps it to an interpretation label (see [Section 3.4](#34-question-detail-view)).

### Usage Frequency

```
Usage Frequency = number of exams in which the question appeared
```

Does not count duplicate appearances within the same exam.

### Difficulty Level — Derived vs. Predefined

| Field                  | Source                          | Description                                                         |
| ---------------------- | ------------------------------- | ------------------------------------------------------------------- |
| `predefinedDifficulty` | Instructor tag at creation time | The manually assigned difficulty label                              |
| `difficultyLevel`      | System-derived from performance | Computed from `correctResponseRate`; may differ from predefined tag |

When the two values differ, the UI should display both and note the discrepancy (e.g., _"Tagged: Easy — Performance: Hard"_).

---

## 7. Field Definitions

| Field                    | Type         | Description                                                            |
| ------------------------ | ------------ | ---------------------------------------------------------------------- |
| `questionId`             | UUID         | Unique question identifier                                             |
| `question`               | string       | Full question text                                                     |
| `questionType`           | string       | `mcq`, `essay`, `true_false`, `fill_blank`, `matching`, `short_answer` |
| `section`                | string       | Curriculum section or module the question belongs to                   |
| `difficultyLevel`        | string       | System-derived difficulty: `Easy`, `Medium`, `Hard`                    |
| `predefinedDifficulty`   | string       | Instructor-assigned difficulty tag at creation time                    |
| `course`                 | string       | Human-readable course name                                             |
| `courseId`               | UUID         | Parent course identifier                                               |
| `examId`                 | UUID         | Most recent exam the question was used in                              |
| `examTitle`              | string       | Title of the most recent exam                                          |
| `lastUsedDate`           | ISO 8601     | Date the question last appeared in an exam                             |
| `createdAt`              | ISO 8601     | Date the question was added to the question bank                       |
| `usageFrequency`         | integer      | Number of exams the question has appeared in                           |
| `totalAttempts`          | integer      | Total student attempts across all appearances                          |
| `correctResponses`       | integer      | Total correct answers recorded                                         |
| `incorrectResponses`     | integer      | Total incorrect answers recorded                                       |
| `correctResponseRate`    | number       | `(correctResponses / totalAttempts) × 100`                             |
| `averageTimeSpent`       | number       | Mean time per attempt in seconds                                       |
| `reliabilityIndex`       | number (0–1) | Statistical consistency of question performance                        |
| `flags`                  | string[]     | Quality alert codes (see Section 8)                                    |
| `totalQuestions`         | integer      | Total active questions in scope (summary)                              |
| `difficultyDistribution` | object       | Counts by difficulty level: Easy, Medium, Hard, untagged (summary)     |
| `overallCorrectRate`     | number       | Mean correct response rate across all questions (summary)              |
| `totalAttempts`          | integer      | Total attempts across all questions (summary)                          |
| `usageTrend`             | object[]     | Monthly usage counts: `{ month, usageCount }`                          |
| `scatterData`            | object[]     | Per-question scatter points: `{ questionId, correctRate, avgTime }`    |
| `total`                  | integer      | Total records matching the query (pagination)                          |
| `page`                   | integer      | Current page number (1-indexed)                                        |
| `limit`                  | integer      | Records per page                                                       |

---

## 8. Flag & Quality Indicator Reference

Flags are computed by the backend and returned in the `flags[]` array on each question. Each flag renders as a distinct badge. A question can carry multiple flags simultaneously.

| Flag Code        | Display Label  | Badge Color               | Condition                                     |
| ---------------- | -------------- | ------------------------- | --------------------------------------------- |
| `too_easy`       | Too Easy       | Green (inverted — ironic) | `correctResponseRate` > 85%                   |
| `too_difficult`  | Too Difficult  | Red                       | `correctResponseRate` < 30%                   |
| `time_consuming` | Time Consuming | Amber                     | `averageTimeSpent` above configured threshold |
| `unreliable`     | Unreliable     | Orange                    | `reliabilityIndex` below configured threshold |
| `overused`       | Overused       | Purple                    | `usageFrequency` above configured threshold   |

> Threshold values are configurable per deployment. The UI must not hardcode them — it should render flags as returned by the API without re-evaluating the conditions client-side.

### Row Highlight Rules

| Condition                                        | Row Background         |
| ------------------------------------------------ | ---------------------- |
| `flags` contains `too_difficult` or `unreliable` | Light red              |
| `flags` contains `too_easy` or `overused`        | Light amber            |
| `flags` contains `time_consuming`                | Light yellow           |
| `flags` is empty                                 | No highlight (default) |

When multiple flags are present, the highest-severity color takes precedence (red > amber > yellow).

### Correct Response Rate — Color Thresholds

| Range  | Color             |
| ------ | ----------------- |
| > 85%  | Green             |
| 50–85% | Default / neutral |
| 30–49% | Amber             |
| < 30%  | Red               |

---

## 9. Validation Rules

### Client-Side (before API call)

| Rule                    | Condition                                                 | Message                                                             |
| ----------------------- | --------------------------------------------------------- | ------------------------------------------------------------------- |
| Date range completeness | `startDate` set without `endDate` (or vice versa)         | _"Please provide both a start and end date."_                       |
| Date range order        | `endDate` before `startDate`                              | _"End date must be on or after the start date."_                    |
| Future start date       | `startDate` in the future                                 | Warning: _"Start date is in the future. No data may be available."_ |
| UUID format             | `courseId` must be a valid UUID                           | Enforced by dropdown; free-text UUID entry not permitted.           |
| Enum values             | `difficulty` and `questionType` must match allowed values | Enforced by dropdown; not editable as free text.                    |
| Pagination bounds       | `page` ≥ 1; `limit` between 1 and 100                     | Enforced by pagination controls.                                    |

### Server-Side (API-level)

The backend returns `400 Bad Request` with an error envelope for invalid parameter values. The UI surfaces `error.message` as an inline error banner near the filter bar. On `401 Unauthorized`, the UI clears session state and redirects to the login page immediately.

---

## 10. Error Handling

| HTTP Status     | Endpoint(s)               | UI Behavior                                                                      |
| --------------- | ------------------------- | -------------------------------------------------------------------------------- |
| `200`           | All                       | Render data normally                                                             |
| `401`           | All                       | Clear session and redirect to login                                              |
| `404`           | `/questions/{questionId}` | Show "Question not found" empty state with **Back to List** button               |
| `500`           | All                       | Show error banner: _"Something went wrong. Please try again."_ with Retry button |
| Network timeout | All                       | Show error banner with Retry; preserve last successfully loaded data             |

### Independent Error Boundaries

Each of the four UI sections manages its own loading and error state independently:

- A `500` on `/chart-data` shows an error only in the Visualization section; the KPI bar and question list continue to work.
- A `500` on `/summary` shows an error only in the KPI bar row; the table and charts continue to display.
- A `404` on `/questions/{questionId}` is contained within the detail panel; the parent list remains visible and functional.

---

## 11. Pagination

### Question List Table — `/questions`

| Control                 | Behavior                                  |
| ----------------------- | ----------------------------------------- |
| Previous / Next buttons | Navigate between pages                    |
| Page indicator          | `Page X of Y` where Y = `⌈total / limit⌉` |
| Records per page        | Options: `10`, `20` (default), `50`       |
| Any filter change       | Resets to page 1                          |
| Limit change            | Resets to page 1                          |

### Summary and Chart Data

`/summary` and `/chart-data` return complete aggregated datasets in a single response. Neither endpoint supports pagination parameters.

---

## Appendix A — Sample API Call Sequence

```
1. Page loads
   → GET /summary
   → GET /questions?page=1&limit=20
   → GET /chart-data

2. User selects course "Microfinance Basics" (ID: abc-123)
   → GET /summary?courseId=abc-123
   → GET /questions?courseId=abc-123&page=1&limit=20
   → GET /chart-data?courseId=abc-123

3. User sets difficulty filter to "Hard"
   → GET /questions?courseId=abc-123&difficulty=Hard&page=1&limit=20
   (No /summary or /chart-data calls — filter not supported by those endpoints)

4. User sets date range: 2026-01-01 to 2026-03-31
   → GET /questions?courseId=abc-123&difficulty=Hard&startDate=2026-01-01&endDate=2026-03-31&page=1&limit=20

5. User clicks page 2
   → GET /questions?courseId=abc-123&difficulty=Hard&startDate=2026-01-01&endDate=2026-03-31&page=2&limit=20

6. User clicks question "What is the primary purpose..." (ID: q-456)
   → GET /questions/q-456

7. User clicks Back — returns to list with all filters preserved
   (No new API call if list data is still cached; re-fetch if stale)

8. User clears all filters
   → GET /summary
   → GET /questions?page=1&limit=20
   → GET /chart-data
```

---

## Appendix B — Metric Computation Reference

The backend computes the following per question. All metrics are stored at the question level and updated after every new exam attempt.

| Metric                      | Formula                                               | Notes                                                       |
| --------------------------- | ----------------------------------------------------- | ----------------------------------------------------------- |
| `correctResponseRate`       | `(correctResponses / totalAttempts) × 100`            | Returns 0 if `totalAttempts` is 0                           |
| `averageTimeSpent`          | `totalTimeSpent / totalAttempts`                      | In seconds; `totalTimeSpent` is summed at attempt-log level |
| `usageFrequency`            | Count of distinct exams containing this question      | Does not double-count multiple appearances in the same exam |
| `reliabilityIndex`          | `1 − (variance of per-attempt scores / max variance)` | Range 0–1; backend formula; frontend displays only          |
| `difficultyLevel` (derived) | Inferred from `correctResponseRate` thresholds        | Compared to `predefinedDifficulty` to detect tag mismatches |

**Derived Difficulty Inference Rules (default thresholds — configurable):**

| `correctResponseRate` | Derived `difficultyLevel` |
| --------------------- | ------------------------- |
| > 85%                 | Easy                      |
| 30–85%                | Medium                    |
| < 30%                 | Hard                      |
