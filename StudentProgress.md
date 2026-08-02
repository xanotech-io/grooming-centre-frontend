# TC09 – Student Training & Progress Report: AI Flow README

This document maps every UI action to its API endpoint and describes the full
step-by-step flow an AI agent should follow to operate this module.

---

## Overview

The Student Training & Progress module provides a unified view of a learner's
academic journey — enrollment, module completion, assessment performance,
engagement activity, certification, and KPIs.

**Base path:** `/api/v1/student-progress-v2`

**Two access modes:**

- Student: reads their own data only (auth token identifies them)
- Admin / Super Admin: reads any student's data by `studentId`

---

## Role and endpoint map

| Who     | What they can access                 | Endpoints                                     |
| ------- | ------------------------------------ | --------------------------------------------- |
| Student | Own progress (all courses)           | `GET /progress/me`                            |
| Student | Own progress (one course)            | `GET /progress/me/course/{courseId}`          |
| Student | Own KPI summary                      | `GET /kpis/me`                                |
| Student | Own session activity                 | `GET /activity/me`                            |
| Admin   | Any student's full progress          | `GET /progress/{studentId}`                   |
| Admin   | Any student's single-course progress | `GET /progress/{studentId}/course/{courseId}` |
| Admin   | Any student's KPI summary            | `GET /kpis/{studentId}`                       |
| Admin   | Any student's session activity       | `GET /activity/{studentId}`                   |
| Admin   | Full unified training report         | `GET /training-report/{studentId}`            |

---

## Step-by-step flow

---

### Phase 1 – Student & enrollment data retrieval

**Triggered by:** any progress or report request.

The system identifies the student (from auth token for `/me` routes, or from
`studentId` path param for admin routes) and fetches:

- Full name, email, department
- All actively enrolled courses with titles and enrollment dates
- Module structure (total modules per course)

This phase runs automatically as the first step inside every endpoint listed above.
No separate API call is needed for it.

---

### Phase 2 – Learning progress tracking

**Computed inside:** all `/progress` and `/training-report` endpoints.

For each enrolled course the system calculates:

| Field                   | Formula                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------ |
| `modulesCompleted`      | Count of modules the student has completed                                                 |
| `modulesCompletedRatio` | `"completed/total"` string e.g. `"8/10"`                                                   |
| `completionPercentage`  | `(modulesCompleted ÷ totalModules) × 100`                                                  |
| `completionStatus`      | `"Not Started"` / `"In Progress"` / `"Completed"` — system-derived, cannot be manually set |

---

### Phase 3 – Assessment & performance aggregation

**Computed inside:** all `/progress` and `/training-report` endpoints.

The system pulls scores from three separate sources per course:

| Field                 | Source                                                    |
| --------------------- | --------------------------------------------------------- |
| `assessmentScore`     | `assessmentScoreSheets` table (course assessments)        |
| `courseExamScore`     | `examResult` joined to `examination` table (course exams) |
| `standaloneExamScore` | `saExamResult` table (standalone exams)                   |

Then it computes combined figures:

| Field                             | Formula                                                                                             |
| --------------------------------- | --------------------------------------------------------------------------------------------------- |
| `latestScore`                     | Average of the latest available scores across the three sources                                     |
| `averageScore`                    | Average across all attempt averages                                                                 |
| `averageAssessmentScorePerModule` | Group `assessmentScoreSheet` records by `moduleId`, average per module, then average across modules |

Any of the three source scores may be `null` if that assessment type has not been
taken yet. The combined fields exclude nulls.

---

### Phase 4 – Activity & engagement tracking

**Endpoint (student):** `GET /activity/me`
**Endpoint (admin):** `GET /activity/{studentId}`

The system queries all `userSession` records for the student and computes:

| Field                 | How it is computed                                                                 |
| --------------------- | ---------------------------------------------------------------------------------- |
| `lastLoginDate`       | Most recent `loginTime` across all sessions                                        |
| `weeklyLogins`        | Count of sessions where `loginTime` is within the last 7 days                      |
| `monthlyLogins`       | Count of sessions where `loginTime` is within the last 30 days                     |
| `totalTimeSpentHours` | Sum of `sessionDurationMinutes` (nulls excluded) ÷ 60, rounded to 2 decimal places |
| `totalSessionCount`   | Count of all session rows regardless of duration                                   |
| `activityRate`        | Equals `weeklyLogins` — used as the learner activity rate KPI                      |

**Important:** sessions where `sessionDurationMinutes` is `null` (idle or
abnormally disconnected sessions) are excluded from `totalTimeSpentHours` but
are still counted in `totalSessionCount`.

**Response shape:**

```json
{
  "studentId": "...",
  "studentName": "Amina Yusuf",
  "email": "amina.yusuf@example.com",
  "lastLoginDate": "2026-05-04T17:45:00.000Z",
  "weeklyLogins": 4,
  "monthlyLogins": 14,
  "totalTimeSpentHours": 25.5,
  "totalSessionCount": 42
}
```

---

### Phase 5 – Certificate check

**Computed inside:** all `/progress` and `/training-report` endpoints.

For each course, the system queries the `certificate` table:

| Field               | Value                                                                           |
| ------------------- | ------------------------------------------------------------------------------- |
| `certificateEarned` | `"Yes"` if a certificate row exists for this student + course, otherwise `"No"` |
| `certificateId`     | The certificate identifier string, or `null` if not yet issued                  |

A certificate is only issued once `completionStatus` is `"Completed"`.

---

### Phase 6 – Student-level KPI computation

**Endpoint (student):** `GET /kpis/me`
**Endpoint (admin):** `GET /kpis/{studentId}`

The system aggregates across all course tracking records for the student:

| KPI field              | Formula                                                                   |
| ---------------------- | ------------------------------------------------------------------------- |
| `totalCourses`         | Count of enrolled courses                                                 |
| `completedCourses`     | Count where `completionStatus = "Completed"`                              |
| `completionPercentage` | `(completedCourses ÷ totalCourses) × 100`                                 |
| `averageScore`         | Mean of `averageScore` across all courses                                 |
| `benchmarkAchieved`    | `true` if `averagePerformance >= 70` (used in training report only)       |
| `certificatesEarned`   | Count of courses where `certificateEarned = "Yes"` (training report only) |

The response also includes a `courses` array with per-course `completionStatus`,
`completionPercentage`, and `averageScore` so coordinators can see exactly which
courses a student is struggling with or has not started.

**Response shape:**

```json
{
  "totalCourses": 2,
  "completedCourses": 2,
  "completionPercentage": 100,
  "averageScore": 88,
  "courses": [
    {
      "courseId": "...",
      "courseTitle": "Microfinance Basics",
      "completionStatus": "Completed",
      "completionPercentage": 100,
      "averageScore": 88
    }
  ]
}
```

---

### Phase 7 – Full unified training report (admin only)

**Endpoint:** `GET /training-report/{studentId}`
**Auth required:** Admin or Super Admin only

This is the master endpoint. It runs all 7 phases in sequence and assembles a
single structured output. Use this when a training coordinator needs everything
about a student in one call.

**What it adds on top of the other endpoints:**

| Field                        | Notes                                                     |
| ---------------------------- | --------------------------------------------------------- |
| `reportId`                   | `"REP-"` + first 8 characters of `studentId` uppercased   |
| `department`                 | Resolved via `userDepartment` junction table              |
| `activityMetrics`            | Full Phase 4 block embedded in the report                 |
| `summary.benchmarkAchieved`  | `true` if `averagePerformance >= 70`                      |
| `summary.certificatesEarned` | Count of certificates issued                              |
| `generatedBy`                | Name of the requesting admin user                         |
| `generationTimestamp`        | UTC timestamp of report generation                        |
| `instructorRemarks`          | Per-course field, `null` until an instructor populates it |

**Response shape (condensed):**

```json
{
  "reportId": "REP-B9C8D7E6",
  "studentId": "b9c8d7e6-...",
  "studentName": "Amina Yusuf",
  "email": "amina.yusuf@example.com",
  "department": "Digital Operations",
  "summary": {
    "totalCourses": 2,
    "completedCourses": 1,
    "overallCompletionPercentage": 50,
    "averagePerformance": 85,
    "certificatesEarned": 1,
    "benchmarkAchieved": true
  },
  "activityMetrics": {
    "lastLoginDate": "2026-09-14T10:30:00.000Z",
    "weeklyLogins": 4,
    "monthlyLogins": 14,
    "totalTimeSpentHours": 25,
    "totalSessionCount": 42,
    "activityRate": 4
  },
  "courses": [
    {
      "courseTitle": "Microfinance Basics",
      "modulesCompleted": "8/10",
      "completionPercentage": 80,
      "assessmentScore": 78,
      "courseExamScore": 75,
      "standaloneExamScore": null,
      "latestScore": 76.5,
      "averageScore": 75.5,
      "averageAssessmentScorePerModule": 74.8,
      "completionStatus": "In Progress",
      "certificateEarned": "No",
      "certificateId": null,
      "lastAccessDate": "2026-09-14T10:30:00.000Z",
      "instructorRemarks": null
    }
  ],
  "generatedBy": "Admin User",
  "generationTimestamp": "2026-09-15T12:00:00.000Z"
}
```

---

## Full happy-path sequences

### Student self-service flow

```
1. GET /progress/me                        → Load summary + all-course list on dashboard
2. GET /progress/me/course/{courseId}      → Load single-course detail when student clicks a course
3. GET /activity/me                        → Load engagement tab (logins, time spent)
4. GET /kpis/me                            → Load KPI tab (completion %, avg score, per-course breakdown)
```

### Admin monitoring flow

```
1. GET /progress/{studentId}               → Load full multi-course progress for a student
2. GET /progress/{studentId}/course/{courseId} → Drill into a specific course
3. GET /kpis/{studentId}                   → View aggregated KPIs and flag students needing intervention
4. GET /activity/{studentId}              → Check login frequency; identify disengaged learners
5. GET /training-report/{studentId}       → Generate the complete TC09 report for download or review
```

---

## Key field reference

| Field                             | Type    | Nullable | Notes                                   |
| --------------------------------- | ------- | -------- | --------------------------------------- |
| `completionStatus`                | string  | No       | System-derived. Never set manually.     |
| `assessmentScore`                 | number  | Yes      | Null if no course assessments taken     |
| `courseExamScore`                 | number  | Yes      | Null if no course exam taken            |
| `standaloneExamScore`             | number  | Yes      | Null if no standalone exam taken        |
| `latestScore`                     | number  | Yes      | Average of latest available scores      |
| `averageScore`                    | number  | Yes      | Average across all attempt averages     |
| `averageAssessmentScorePerModule` | number  | Yes      | Grouped by moduleId then averaged       |
| `certificateEarned`               | string  | No       | `"Yes"` or `"No"`                       |
| `certificateId`                   | string  | Yes      | Null if not earned                      |
| `activityRate`                    | number  | No       | Equals `weeklyLogins`                   |
| `instructorRemarks`               | string  | Yes      | Null until instructor populates         |
| `benchmarkAchieved`               | boolean | No       | Training report only. True if avg >= 70 |

---

## Error handling reference

| HTTP code | Cause                                                                         | UI action                      |
| --------- | ----------------------------------------------------------------------------- | ------------------------------ |
| `400`     | Invalid `studentId` or `courseId` format                                      | Show validation error          |
| `401`     | Not authenticated                                                             | Redirect to login              |
| `403`     | Student trying to access another student's data, or non-admin on admin routes | Show permission denied         |
| `404`     | No progress/activity/KPI record found for this student                        | Show "No data found" state     |
| `500`     | Internal server error                                                         | Show error banner; allow retry |

---

## Data relationships

```
Student (studentId)
  ├── Enrolled courses (via courseTracking)
  │     ├── Phase 2: modulesCompleted, completionPercentage, completionStatus
  │     ├── Phase 3: assessmentScore (assessmentScoreSheets)
  │     │           courseExamScore  (examResult → examination)
  │     │           standaloneExamScore (saExamResult)
  │     │           → latestScore, averageScore, averageAssessmentScorePerModule
  │     └── Phase 5: certificateEarned, certificateId (certificate table)
  │
  ├── Sessions (userSession)
  │     └── Phase 4: lastLoginDate, weeklyLogins, monthlyLogins,
  │                   totalTimeSpentHours, totalSessionCount, activityRate
  │
  └── Department (userDepartment junction)
        └── Phase 1: department name (training report only)
```

---

_End of TC09 flow README._
