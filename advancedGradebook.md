# Advanced Grade Book Module (TC09)

## Overview

Build an **Advanced Grade Book System** for a Learning Management System (LMS).

The module should:

- Support weighted grading
- Automatically sync scores from LMS data
- Compute grades and analytics in real time
- Support manual adjustments (curve, overrides, extra credit)
- Generate reports and exports
- Maintain audit trails
- Allow publishing/finalizing grades

The implementation must follow the existing project architecture and coding structure in the repository.

---

# Core Flow

## 1. Create Grade Book

Instructor/Admin creates a grade book for a course.

API:
`POST /api/v1/grade-book-v2/setup`

Payload example:

```json
{
  "courseId": "course-id",
  "title": "Microfinance Basics Grade Book",
  "calculationMethod": "weighted",
  "gradingScale": {
    "A": "90-100",
    "B": "80-89",
    "C": "70-79",
    "D": "60-69",
    "F": "0-59"
  },
  "categories": [
    {
      "name": "Exams",
      "weight": 40
    },
    {
      "name": "Assessments",
      "weight": 30
    },
    {
      "name": "Projects",
      "weight": 20
    },
    {
      "name": "Attendance",
      "weight": 10
    }
  ]
}
```

Validation:

- Total category weight MUST equal 100
- Prevent duplicate category names
- Support:
  - weighted
  - simple average

After successful creation:

- Store the returned gradebook object
- Use it across all gradebook pages
- Navigate to gradebook details/dashboard page

---

# Expected Grade Book Response Structure

```json
{
  "success": true,
  "data": {
    "id": "gradebook-id",
    "courseId": "course-id",
    "title": "Microfinance Basics Grade Book",
    "calculationMethod": "weighted",
    "gradingScale": {},
    "status": "draft",
    "categories": [
      {
        "id": "category-id",
        "name": "Exams",
        "weight": 40
      }
    ],
    "course": {
      "id": "course-id",
      "title": "Microfinance Basics"
    }
  }
}
```

---

# Grade Book Dashboard

The dashboard should show:

## Gradebook Details

- Title
- Course
- Calculation Method
- Status
- Categories + weights

## Actions

- Sync LMS Data
- Add Entry
- View Analytics
- Export Report
- Finalize
- Publish
- Audit Trail

---

# Sync LMS Data

API:
`POST /api/v1/grade-book-v2/{gradebookId}/sync`

Purpose:
Automatically populate gradebook entries from LMS sources.

Rules:

- Exams → examinationScoreSheets
- Assessments/Quiz/Assignment → assessmentScoreSheets
- Projects → ProjectReview
- Attendance → attendanceScoreSheet

Requirements:

- Do NOT duplicate existing entries
- Show:
  - studentsProcessed
  - entriesCreated
  - entriesSkipped

After sync:

- Refresh gradebook entries automatically

---

# Grade Entries

## Create Entry

API:
`POST /api/v1/grade-book-v2/{gradebookId}/entries`

Payload:

```json
{
  "studentId": "student-id",
  "categoryId": "category-id",
  "assessmentName": "Midterm Exam",
  "assessmentType": "exam",
  "score": 85,
  "maxScore": 100,
  "feedback": "Good performance"
}
```

Requirements:

- Grade should auto-calculate from gradingScale
- Contribution should auto-calculate
- Effective score should consider:
  - adjustmentValue
  - extraCredit

Formula:

```ts
effectiveScore = min(score + adjustmentValue + extraCredit, maxScore);
```

---

# Grade Calculation Logic

## Weighted Formula

For each category:

```ts
categoryAverage = totalStudentCategoryScore / totalPossibleCategoryScore;
```

Contribution:

```ts
contribution = categoryAverage * categoryWeight;
```

Final Score:

```ts
finalScore = sum(all contributions)
```

Final Grade:
Use gradingScale mapping.

Example:

```ts
90 - 100 => A
80 - 89 => B
70 - 79 => C
60 - 69 => D
0 - 59 => F
```

---

# Adjustments

API:
`PATCH /api/v1/grade-book-v2/{gradebookId}/entries/{entryId}/adjust`

Supports:

- Curves
- Extra credit
- Deductions

Payload example:

```json
{
  "adjustmentValue": 5,
  "adjustmentReason": "Class-wide curve applied",
  "extraCredit": 2
}
```

Requirements:

- Recalculate effectiveScore
- Recalculate grade
- Record all changes in audit trail

---

# Analytics Page

API:
`GET /api/v1/grade-book-v2/{gradebookId}/analytics`

Display:

- Total students
- Class average
- Highest score
- Lowest score
- Pass rate
- Grade distribution
- Category breakdown

Charts:

- Grade distribution bar chart
- Category average chart
- Pass/fail ratio

---

# Student Grade Breakdown

API:
`GET /api/v1/grade-book-v2/{gradebookId}/my-grades`

UI should display:

## Per Assessment

- Assessment name
- Type
- Score
- Effective score
- Grade
- Weight
- Contribution
- Feedback

## Overall

- Total score
- Final grade
- Status

## KPIs

- Class average
- Highest score
- Lowest score
- Pass rate
- Grade distribution

---

# Full Gradebook Report

API:
`GET /api/v1/grade-book-v2/{gradebookId}/report`

Should display:

- Gradebook metadata
- Analytics summary
- All students
- Student breakdowns
- Sorted by highest final score first

---

# Export Functionality

API:
`GET /api/v1/grade-book-v2/{gradebookId}/export?format=Excel`

Supported:

- PDF
- Excel
- CSV

Requirements:

## Excel

Two sheets:

1. Summary
2. Student Grades

## CSV

Flat grade rows

## PDF

Formatted report with:

- Summary
- Student tables
- Analytics

---

# Finalize and Publish Flow

## Finalize

API:
`POST /api/v1/grade-book-v2/{gradebookId}/finalize`

Behavior:

- Gradebook status → finalized
- All draft entries → finalized
- Students cannot see yet

---

## Publish

API:
`POST /api/v1/grade-book-v2/{gradebookId}/publish`

Behavior:

- Gradebook status → published
- Students can now view grades
- Notifications are sent

---

# Audit Trail

API:
`GET /api/v1/grade-book-v2/{gradebookId}/audit`

Requirements:

- Show chronological logs
- Include:
  - action
  - performer
  - changed fields
  - previous value
  - new value
  - timestamps

Track:

- Create
- Update
- Delete
- Adjustments
- Finalize
- Publish

---

# UI Requirements

## Pages

### Instructor/Admin

- Gradebook List
- Create Gradebook
- Gradebook Dashboard
- Student Breakdown
- Analytics
- Audit Logs

### Student

- My Grades
- Grade Breakdown

---

# Important Frontend Requirements

- Follow existing repo structure
- Reuse existing components/hooks
- Use proper loading/error states
- Use optimistic updates where appropriate
- Refetch data after mutations
- Avoid hardcoded category names
- Use dynamic rendering from API responses
- Use type-safe interfaces/types
- Keep components modular and reusable

---

# Edge Cases

Handle:

- Weight total not equal to 100
- Empty gradebooks
- Missing grading scales
- Duplicate LMS sync entries
- Students with no submissions
- Adjustments exceeding maxScore
- Unauthorized access
- Publishing before finalize

---

# Expected Deliverables

Implement:

- API integrations
- State management
- Grade calculations
- Dynamic UI
- Analytics
- Export support
- Audit logs
- Finalize/publish workflows
- Student/instructor views

The final implementation should be production-ready, scalable, and consistent with the current codebase architecture.
