# Assessment Analytics Report — Developer README

> **Module Tag:** `Caleb - Assessment Analytics Report`
> **PRD Reference:** TC04 – Assessment Analytics Report
> **Base URL (Production):** `https://gclms.xanotech.org`
> **Base URL (Local):** `http://localhost:8089`
> **Authentication:** All endpoints require a Bearer JWT token via `Authorization: Bearer <token>`

---

## Table of Contents

1. [Overview](#overview)
2. [Module Endpoints](#module-endpoints)
3. [End-to-End Flow](#end-to-end-flow)
4. [Step-by-Step Integration Guide](#step-by-step-integration-guide)
5. [KPI Definitions & Formulas](#kpi-definitions--formulas)
6. [Difficulty Level Logic](#difficulty-level-logic)
7. [Discrimination Index Explained](#discrimination-index-explained)
8. [Request & Response Reference](#request--response-reference)
9. [Filtering & Query Parameters](#filtering--query-parameters)
10. [Error Handling](#error-handling)

---

## Overview

The Assessment Analytics Report provides deep, question-level analysis of course assessments, course examinations, and standalone examinations. It is the primary tool for evaluating assessment quality, identifying weak or confusing questions, and detecting student knowledge gaps.

**This module targets three assessment types:**

| Type                   | Linked To              |
| ---------------------- | ---------------------- |
| Course Assessment      | A course or module     |
| Course Examination     | A course or module     |
| Standalone Examination | Not linked to a course |

**Key questions this module answers:**

- Which questions are too easy or too difficult?
- Which questions most students fail?
- How long do students spend per question?
- Which questions effectively distinguish strong students from weak students?
- Is the assessment reliable and valid?

---

## Module Endpoints

These are the three endpoints that belong directly to this module:

| Method | Path                                            | Description                                                                            |
| ------ | ----------------------------------------------- | -------------------------------------------------------------------------------------- |
| `GET`  | `/api/v1/assessment-analytics-v2/report`        | Full per-question analytics report (paginated, filterable across all assessment types) |
| `GET`  | `/api/v1/assessment-analytics-v2/exam/{examId}` | Full per-question drill-down for a single course examination                           |
| `GET`  | `/api/v1/assessment-analytics-v2/thresholds`    | Get difficulty, discrimination, and reliability classification thresholds              |

---

## End-to-End Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Instructor Creates Assessment / Exam / Standalone Exam              │
│                                                                              │
│  Each exam is built from a Marking Template.                                │
│  Questions are created with:                                                 │
│    - question_type (mcq, essay, true_false, fill_blank, matching, etc.)     │
│    - difficulty_level (Easy / Medium / Hard)                                │
│    - section assignment                                                      │
│    - correct answer                                                          │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Students Attempt the Assessment                                     │
│                                                                              │
│  System captures per submission:                                             │
│    - answers per question (questionId + answer)                              │
│    - timeTaken per question (in seconds)                                     │
│    - submissionTime (timestamp)                                              │
│    - isCorrect flag (set during auto-marking)                                │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: LMS Auto-Marks Objective Questions                                  │
│                                                                              │
│  Automatic questions (MCQ, True/False, Fill-Blank, Matching):               │
│    → isCorrect = true/false determined at submission                        │
│  Manual questions (Essay, Short Answer):                                     │
│    → Instructor grades via manual-grade endpoint                            │
│                                                                              │
│  Results stored per question attempt (examQuestionAttempt)                  │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Backend Analytics Engine Processes Data                             │
│                                                                              │
│  For each question across all student attempts:                              │
│                                                                              │
│    total_attempts        = COUNT(attempts per question)                     │
│    correct_response_rate = (correct / total) × 100                          │
│    average_time_seconds  = AVG(time_spent_seconds)                          │
│    discrimination_index  = (U - L) / N  [top/bottom 27%]                   │
│    derived_difficulty    = Easy >80% / Medium 50–80% / Hard <50%            │
│    reliability_index     = Cronbach's Alpha                                 │
│    assessment_validity   = High / Moderate / Low / Insufficient             │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 5: Report Aggregation                                                  │
│                                                                              │
│  Data grouped by:                                                            │
│    - Exam / Assessment / Standalone Exam                                    │
│    - Question (question_id, question_type, section, difficulty)             │
│    - Difficulty distribution (Easy / Medium / Hard)                        │
│    - Status classification:                                                  │
│        Too Easy | Too Hard | Excellent | Good | Acceptable | Poor |         │
│        Insufficient Data                                                     │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 6: API Returns Analytics Report                                        │
│                                                                              │
│  GET /api/v1/assessment-analytics-v2/report                                 │
│    → summary KPIs (avg success rate, reliability, validity)                 │
│    → per-question rows (difficulty, discrimination, timing, status)         │
│    → assessment_level_stats  (course assessments aggregate)                 │
│    → standalone_stats        (standalone exam aggregate)                    │
│                                                                              │
│  GET /api/v1/assessment-analytics-v2/exam/{examId}                          │
│    → Same data scoped to a single course examination                        │
└────────────────────────────────┬─────────────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 7: Frontend Displays Dashboard                                         │
│                                                                              │
│  Users can:                                                                  │
│    - Review question-level quality and flag problem questions               │
│    - Filter by difficulty, question type, exam, date range                  │
│    - Drill into a single exam for deeper per-question analysis              │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Integration Guide

### Step 1 — Authenticate

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

Use `Authorization: Bearer <token>` on every subsequent request.

---

### Step 2 — Fetch Classification Thresholds

Before rendering the report UI, fetch the thresholds used for difficulty, discrimination, and status labels so your frontend can display consistent legend values.

```http
GET /api/v1/assessment-analytics-v2/thresholds
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "difficulty": {
      "Easy": "> 80% correct response rate",
      "Medium": "50% – 80% correct response rate",
      "Hard": "< 50% correct response rate"
    },
    "discrimination": {
      "Excellent": "> 0.4",
      "Good": "0.30 – 0.39",
      "Acceptable": "0.20 – 0.29",
      "Poor": "< 0.20"
    },
    "status_labels": [
      "Too Easy",
      "Too Hard",
      "Excellent",
      "Good",
      "Acceptable",
      "Poor",
      "Insufficient Data"
    ],
    "validity_labels": ["High", "Moderate", "Low", "Insufficient Data"]
  }
}
```

> Cache this response for the session — it does not change frequently.

---

### Step 3 — Fetch the Full Analytics Report

This is the primary report endpoint. It covers all three assessment types in a single call.

```http
GET /api/v1/assessment-analytics-v2/report
Authorization: Bearer <token>
```

**With filters applied:**

```http
GET /api/v1/assessment-analytics-v2/report
  ?courseId=uuid-course-1
  &difficultyLevel=Medium
  &questionType=mcq
  &startDate=2026-01-01
  &endDate=2026-03-31
  &page=1
  &limit=50
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "reportName": "Assessment Analytics Report",
    "generatedAt": "2026-05-21T10:00:00.000Z",
    "total": 50,
    "page": 1,
    "limit": 50,
    "recordCount": 50,
    "executionTimeMs": 245,
    "summary": {
      "total_questions": 50,
      "average_success_rate": 78.4,
      "average_completion_time_seconds": 34.2,
      "reliability_index": 0.82,
      "assessment_validity": "High",
      "difficulty_distribution": {
        "Easy": 15,
        "Medium": 25,
        "Hard": 10
      },
      "status_distribution": {
        "Excellent": 12,
        "Good": 18,
        "Acceptable": 10,
        "Poor": 5,
        "Too Easy": 3,
        "Too Hard": 2,
        "Insufficient Data": 0
      }
    },
    "data": [
      {
        "question_id": "uuid-q001",
        "question_text": "What is the primary function of a microfinance institution?",
        "question_type": "mcq",
        "difficulty_level": "Medium",
        "derived_difficulty": "Easy",
        "exam_id": "uuid-exam-1",
        "exam_title": "Microfinance Basics Final Exam",
        "course_id": "uuid-course-1",
        "total_attempts": 28,
        "correct_response_rate": 82.1,
        "average_time_seconds": 32.0,
        "discrimination_index": 0.41,
        "status": "Excellent"
      },
      {
        "question_id": "uuid-q014",
        "question_text": "True or False: Microloans are only for agriculture.",
        "question_type": "true_false",
        "difficulty_level": "Easy",
        "derived_difficulty": "Easy",
        "exam_id": "uuid-exam-1",
        "exam_title": "Microfinance Basics Final Exam",
        "course_id": "uuid-course-1",
        "total_attempts": 30,
        "correct_response_rate": 95.0,
        "average_time_seconds": 20.0,
        "discrimination_index": 0.18,
        "status": "Too Easy"
      }
    ],
    "assessment_level_stats": [
      {
        "assessmentId": "uuid-assessment-1",
        "assessmentTitle": "Module 1 Assessment",
        "totalQuestions": 10,
        "averageSuccessRate": 74.5
      }
    ],
    "standalone_stats": [
      {
        "examId": "uuid-standalone-1",
        "examTitle": "General Knowledge Exam",
        "totalQuestions": 20,
        "averageSuccessRate": 69.0
      }
    ]
  }
}
```

---

### Step 4 — Drill Down Into a Single Course Examination

For the deepest per-question analysis on one specific course examination, including Cronbach's Alpha and discrimination index per question:

```http
GET /api/v1/assessment-analytics-v2/exam/{examId}
Authorization: Bearer <token>
```

**Example:**

```http
GET /api/v1/assessment-analytics-v2/exam/uuid-exam-1
Authorization: Bearer <token>
```

**Response** — same `AssessmentAnalyticsReport` shape, scoped to the specified exam:

```json
{
  "success": true,
  "data": {
    "reportName": "Exam Analytics — Microfinance Basics Final Exam",
    "generatedAt": "2026-05-21T10:00:00.000Z",
    "total": 30,
    "summary": {
      "total_questions": 30,
      "average_success_rate": 76.3,
      "average_completion_time_seconds": 41.8,
      "reliability_index": 0.79,
      "assessment_validity": "Moderate",
      "difficulty_distribution": {
        "Easy": 8,
        "Medium": 15,
        "Hard": 7
      }
    },
    "data": [ ... ]
  }
}
```

> **Note:** This endpoint only works for course-linked examinations. For standalone exam analytics use the main `/report` endpoint with `standaloneExamId` as a query filter.

---

## KPI Definitions & Formulas

### KPI 1 — Average Question Success Rate (%)

```
Question Success Rate (%) = (Correct Responses ÷ Total Attempts) × 100
```

| Field in Response              | Type                               |
| ------------------------------ | ---------------------------------- |
| `correct_response_rate`        | float (0–100) per question         |
| `summary.average_success_rate` | float (0–100) across all questions |

**Example:** 23 correct out of 28 attempts = **82.1%**

---

### KPI 2 — Question Reliability Index (Cronbach's Alpha)

```
α = (k / (k−1)) × (1 − (Σσᵢ²) / σ²T)

Where:
  k    = number of questions
  σᵢ²  = variance of individual question scores
  σ²T  = total test score variance
```

| Field in Response           | Range                              |
| --------------------------- | ---------------------------------- |
| `summary.reliability_index` | 0.0 – 1.0 (higher = more reliable) |

Typical benchmark: ≥ 0.7 acceptable, ≥ 0.8 good.

---

### KPI 3 — Average Time Per Question (seconds)

```
Average Time Per Question = Σ(time_spent_seconds) ÷ Total Attempts
```

| Field in Response                         | Type                         |
| ----------------------------------------- | ---------------------------- |
| `average_time_seconds`                    | float (per question)         |
| `summary.average_completion_time_seconds` | float (across all questions) |

---

### KPI 4 — Assessment Validity Indicator

Derived from a combination of difficulty balance, discrimination index quality, topic alignment, and reliability score.

| `assessment_validity` Value | Meaning                                                    |
| --------------------------- | ---------------------------------------------------------- |
| `"High"`                    | Strong alignment between questions and learning objectives |
| `"Moderate"`                | Acceptable but room for improvement                        |
| `"Low"`                     | Questions may not accurately measure learning outcomes     |
| `"Insufficient Data"`       | Not enough student attempts to compute                     |

---

## Difficulty Level Logic

`derived_difficulty` is computed from the actual `correct_response_rate` and may differ from the instructor-set `difficulty_level`.

| `derived_difficulty` | Correct Response Rate |
| -------------------- | --------------------- |
| `"Easy"`             | > 80%                 |
| `"Medium"`           | 50% – 80%             |
| `"Hard"`             | < 50%                 |

When `difficulty_level` and `derived_difficulty` differ, the question is a candidate for recalibration.

---

## Discrimination Index Explained

The Discrimination Index (D) measures how well a question differentiates high-performing students from low-performing students using the top and bottom 27% of scorers.

```
D = (U − L) / N

Where:
  U = correct responses from the TOP 27% of students
  L = correct responses from the BOTTOM 27% of students
  N = number of students in each group
```

### Interpretation Table

| `discrimination_index` | `status`              | Meaning                                   |
| ---------------------- | --------------------- | ----------------------------------------- |
| > 0.4                  | `"Excellent"`         | Strongly differentiates ability levels    |
| 0.30 – 0.39            | `"Good"`              | Question works well                       |
| 0.20 – 0.29            | `"Acceptable"`        | Usable but could be improved              |
| < 0.20                 | `"Poor"`              | Fails to discriminate — review or replace |
| N/A (too easy)         | `"Too Easy"`          | Nearly everyone answered correctly        |
| N/A (too hard)         | `"Too Hard"`          | Nearly everyone answered incorrectly      |
| N/A                    | `"Insufficient Data"` | Below minimum attempt threshold           |

---

## Request & Response Reference

### `GET /api/v1/assessment-analytics-v2/report`

#### Query Parameters

| Parameter          | Type              | Required | Description                                                            |
| ------------------ | ----------------- | -------- | ---------------------------------------------------------------------- |
| `examId`           | UUID              | No       | Scope to a specific course examination                                 |
| `assessmentId`     | UUID              | No       | Scope to a specific course assessment                                  |
| `standaloneExamId` | UUID              | No       | Scope to a specific standalone examination                             |
| `courseId`         | UUID              | No       | Filter all analytics by course                                         |
| `questionType`     | enum              | No       | `mcq`, `essay`, `true_false`, `fill_blank`, `matching`, `short_answer` |
| `difficultyLevel`  | enum              | No       | `Easy`, `Medium`, `Hard`                                               |
| `startDate`        | date (YYYY-MM-DD) | No       | Filter attempts on or after this date                                  |
| `endDate`          | date (YYYY-MM-DD) | No       | Filter attempts on or before this date                                 |
| `page`             | integer           | No       | Page number (default: `1`)                                             |
| `limit`            | integer           | No       | Records per page (default: `50`, max: `200`)                           |

#### `AssessmentAnalyticsSummary` Schema

```
{
  total_questions:                  integer
  average_success_rate:             float | null
  average_completion_time_seconds:  float | null
  reliability_index:                float | null      // Cronbach's Alpha
  assessment_validity:              "High" | "Moderate" | "Low" | "Insufficient Data"
  difficulty_distribution: {
    Easy:   integer
    Medium: integer
    Hard:   integer
  }
  status_distribution:              object            // count per status label
}
```

#### `AssessmentQuestionRow` Schema

```
{
  question_id:            UUID
  question_text:          string
  question_type:          "mcq" | "essay" | "true_false" | "fill_blank" |
                          "matching" | "short_answer"
  difficulty_level:       "Easy" | "Medium" | "Hard" | null   // instructor-set
  derived_difficulty:     "Easy" | "Medium" | "Hard" | null   // computed from rate
  exam_id:                UUID
  exam_title:             string | null
  course_id:              UUID | null
  total_attempts:         integer
  correct_response_rate:  float | null     // percentage 0–100
  average_time_seconds:   float | null
  discrimination_index:   float | null
  status:                 "Too Easy" | "Too Hard" | "Excellent" | "Good" |
                          "Acceptable" | "Poor" | "Insufficient Data"
}
```

---

### `GET /api/v1/assessment-analytics-v2/exam/{examId}`

#### Path Parameters

| Parameter | Type | Required | Description                           |
| --------- | ---- | -------- | ------------------------------------- |
| `examId`  | UUID | **Yes**  | UUID of the course-linked examination |

Returns an `AssessmentAnalyticsReport` scoped to the specified exam with full per-question metrics and Cronbach's Alpha.

**404** is returned when no exam data or attempts exist for the given `examId`.

---

### `GET /api/v1/assessment-analytics-v2/thresholds`

Returns classification thresholds for difficulty derivation, discrimination index rating, status labels, and validity labels. No parameters required.

---

## Filtering & Query Parameters

### Targeting a Specific Assessment Type

Only one ID filter should be set per request:

```
# Course examination
GET /api/v1/assessment-analytics-v2/report?examId=uuid-exam-1

# Course assessment
GET /api/v1/assessment-analytics-v2/report?assessmentId=uuid-assessment-1

# Standalone examination
GET /api/v1/assessment-analytics-v2/report?standaloneExamId=uuid-standalone-1

# All types for a course
GET /api/v1/assessment-analytics-v2/report?courseId=uuid-course-1
```

### Combined Filters with Pagination

```http
GET /api/v1/assessment-analytics-v2/report
  ?courseId=uuid-course-1
  &questionType=mcq
  &difficultyLevel=Hard
  &startDate=2026-01-01
  &endDate=2026-03-31
  &page=1
  &limit=50
```

Total pages:

```javascript
const totalPages = Math.ceil(data.total / data.limit);
```

---

## Error Handling

| HTTP Status | Meaning                | Recommended Action                                    |
| ----------- | ---------------------- | ----------------------------------------------------- |
| `200`       | Success                | Render analytics                                      |
| `401`       | Missing or invalid JWT | Re-authenticate                                       |
| `403`       | Insufficient role      | Requires `Admin`, `Super Admin`, or `Instructor` role |
| `404`       | No data found          | Display "No analytics data available yet"             |
| `500`       | Server error           | Retry; surface error to user                          |

### Common Null Value Scenarios

| Field is `null`                               | Cause                                      | Resolution                              |
| --------------------------------------------- | ------------------------------------------ | --------------------------------------- |
| `correct_response_rate`                       | No student attempts yet                    | Wait for submissions                    |
| `discrimination_index`                        | Too few attempts for top/bottom 27% groups | More student submissions needed         |
| `reliability_index`                           | Insufficient cross-question data           | Increase participation                  |
| `assessment_validity` = `"Insufficient Data"` | Too few responses                          | Increase participation before analysing |
