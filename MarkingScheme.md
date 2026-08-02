# TC11 – Define and Apply Marking Schemes
## Full-Stack Application Flow Documentation

> **Module:** Marking Schemes (v2)  
> **Base URL:** `/api/v1/marking-schemes-v2`  
> **Roles:** Instructor, Admin / Super Admin, Supervisor  
> **Version:** 1.0.0

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Complete User Flow (End-to-End)](#3-complete-user-flow-end-to-end)
4. [Screen-by-Screen Breakdown](#4-screen-by-screen-breakdown)
   - [4.1 Marking Schemes List Screen](#41-marking-schemes-list-screen)
   - [4.2 Create Marking Scheme Screen](#42-create-marking-scheme-screen)
   - [4.3 Scheme Detail / Edit Screen](#43-scheme-detail--edit-screen)
   - [4.4 Apply Scheme to Examination Screen](#44-apply-scheme-to-examination-screen)
   - [4.5 Compute Student Score Screen](#45-compute-student-score-screen)
   - [4.6 Grade Distribution Analytics Screen](#46-grade-distribution-analytics-screen)
   - [4.7 KPI Dashboard Screen](#47-kpi-dashboard-screen)
5. [API Reference](#5-api-reference)
6. [Data Structures](#6-data-structures)
7. [Validation Rules](#7-validation-rules)
8. [Edge Cases](#8-edge-cases)
9. [UI States (Loading / Error / Empty)](#9-ui-states-loading--error--empty)
10. [Frontend Implementation Notes](#10-frontend-implementation-notes)
11. [Backend Implementation Notes](#11-backend-implementation-notes)
12. [Status & Lock State Machine](#12-status--lock-state-machine)
13. [Integration Points](#13-integration-points)

---

## 1. Module Overview

The **Marking Schemes** module standardises examination grading across the platform. It allows instructors to define per-question-type scoring rules (MCQ negative marking, essay rubrics, partial credit), attach a grading scale (A–F), set a pass threshold, apply the scheme to a live examination, and then trigger score computation per student.

Once a scheme is **applied** to an examination, it is **locked** — no further edits are possible. This guarantees grading consistency and an immutable audit trail.

### Core Capabilities

| Capability | Supported |
|---|---|
| MCQ negative marking | ✅ |
| Essay rubric-based scoring | ✅ |
| Partial credit | ✅ |
| Custom grading scale (A–F) | ✅ |
| Pass/fail threshold | ✅ |
| Per-student score computation | ✅ |
| Grade distribution analytics | ✅ |
| KPI statistics | ✅ |
| Scheme locking after application | ✅ |
| Audit trail | ✅ |

---

## 2. User Roles & Permissions

| Action | Instructor | Admin / Super Admin | Supervisor |
|---|:---:|:---:|:---:|
| Create scheme | ✅ | ✅ | ❌ |
| View schemes | ✅ | ✅ | ✅ |
| Edit scheme (draft only) | ✅ | ✅ | ❌ |
| Delete scheme (draft only) | ✅ | ✅ | ❌ |
| Apply scheme to exam | ❌ | ✅ | ❌ |
| Compute student score | ❌ | ✅ | ❌ |
| View KPIs | ❌ | ✅ | ✅ |
| View grade distribution | ✅ | ✅ | ✅ |

> **Implementation note:** Role-based UI gating must be enforced on the frontend (hide/disable restricted actions) AND validated server-side. A 403 from the API must surface a clear "You don't have permission for this action" toast, not a generic error.

---

## 3. Complete User Flow (End-to-End)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    MARKING SCHEME LIFECYCLE                             │
└─────────────────────────────────────────────────────────────────────────┘

[Instructor / Admin]
        │
        ▼
① List Screen ──── (No schemes yet) ──────────────────────────┐
        │                                                       │
        │ Click "Create Scheme"                                 │
        ▼                                                       │
② Create Screen                                                │
   • Fill name, description                                    │
   • Choose examination                                        │
   • Add question type rules (MCQ / Essay / etc.)             │
   • Configure grading scale                                   │
   • Set pass threshold                                        │
   • Submit → POST /marking-schemes-v2                        │
        │                                                       │
        │ Success → Scheme created (status: draft)              │
        ▼                                                       │
③ Scheme Detail Screen (draft)                                 │
   • View all rules                                            │
   • Edit any field ──→ PATCH /marking-schemes-v2/{id}        │
   • Delete ──────────→ DELETE /marking-schemes-v2/{id}       │
        │                                                       │
        │ Admin clicks "Apply to Examination"                   │
        ▼                                                       │
④ Apply Confirmation Modal                                     │
   • Warn: "This action locks the scheme permanently"          │
   • Confirm → POST /marking-schemes-v2/{id}/apply/{examId}   │
        │                                                       │
        │ Success → status: active, isLocked: true             │
        ▼                                                       │
③ Scheme Detail Screen (locked)                                │
   • All fields read-only                                      │
   • Edit / Delete buttons hidden                              │
   • "Compute Scores" action available                         │
        │                                                       │
        │ Admin triggers score computation (per student)        │
        ▼                                                       │
⑤ Compute Score                                                │
   • POST /marking-schemes-v2/compute-score/{examId}/{stuId}  │
   • Returns adjusted score, grade, pass/fail                  │
        │                                                       │
        ▼                                                       │
⑥ Grade Distribution Screen                                    │
   • GET /marking-schemes-v2/distribution/{examId}            │
   • Bar/pie chart of grade bands                              │
        │                                                       │
        ▼                                                       │
⑦ KPI Dashboard                                                │
   • GET /marking-schemes-v2/kpis                             │
   • System-wide statistics                          ◄─────────┘
```

---

## 4. Screen-by-Screen Breakdown

---

### 4.1 Marking Schemes List Screen

**Route:** `/marking-schemes`  
**Accessible by:** All roles

#### Purpose
Entry point for all marking scheme management. Lists all schemes with filtering and pagination.

#### UI Components

```
┌──────────────────────────────────────────────────────────────┐
│  Marking Schemes                          [+ Create Scheme]  │
│                                                              │
│  Filter: [Examination ▼]  [Status ▼]  [🔍 Search...]        │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ Name          │ Exam      │ Status  │ Locked │ Actions│   │
│  ├──────────────────────────────────────────────────────┤   │
│  │ MCQ+Essay     │ Final'26  │ active  │ 🔒 Yes │ View   │   │
│  │ Quick MCQ     │ Mid-Term  │ draft   │   No   │ View   │   │
│  │               │           │         │        │ Edit   │   │
│  │               │           │         │        │ Delete │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  Showing 1–20 of 42    [< Prev]  Page 1 of 3  [Next >]      │
└──────────────────────────────────────────────────────────────┘
```

#### API Call

```
GET /api/v1/marking-schemes-v2
  ?examinationId=<uuid>   (optional)
  &status=draft|active|inactive  (optional)
  &search=<string>        (optional)
  &page=1
  &limit=20
```

#### Request Trigger
- On page mount
- On filter/search change (debounced 300ms)
- On pagination change

#### Expected Response

```json
{
  "success": true,
  "data": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "schemes": [{ ...SchemeObject }]
  }
}
```

#### Frontend Behaviour

| State | UI Behaviour |
|---|---|
| Loading | Skeleton rows (5 rows, animated shimmer) |
| Empty (no filters) | Illustration + "No marking schemes yet. Create your first one." + CTA button |
| Empty (with filters) | "No schemes match your filters." + "Clear filters" link |
| Error | Error banner with retry button |
| Locked scheme | Show 🔒 badge; hide Edit and Delete actions |
| Draft scheme | Show Edit and Delete actions (role-permissioned) |

#### Action Guards

- **Create Scheme** button: visible to Instructor and Admin only
- **Edit** action: visible only if `isLocked === false` AND user is Instructor or Admin
- **Delete** action: visible only if `isLocked === false` AND user is Instructor or Admin

---

### 4.2 Create Marking Scheme Screen

**Route:** `/marking-schemes/new`  
**Accessible by:** Instructor, Admin

#### Purpose
Multi-section form to define all rules for a new marking scheme. Scheme is saved as `draft`.

#### UI Layout — Sectioned Form

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Schemes                                          │
│  Create Marking Scheme                                      │
│                                                             │
│  ── SECTION 1: Basic Info ──────────────────────────────   │
│  Name*         [________________________]                   │
│  Description   [________________________]                   │
│  Examination*  [Select Examination    ▼]                    │
│                                                             │
│  ── SECTION 2: Question Type Rules ─────────────────────   │
│  [+ Add Rule]                                               │
│                                                             │
│  ┌─ Rule 1: MCQ ─────────────────────────────────────┐     │
│  │ Type*              [MCQ              ▼]            │     │
│  │ Marks per question [2              ]               │     │
│  │ Negative marking   [0.5            ]               │     │
│  │ Partial credit     [Toggle: ON/OFF ]               │     │
│  │                                          [Remove]  │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  ┌─ Rule 2: Essay ────────────────────────────────────┐     │
│  │ Type*              [Essay           ▼]             │     │
│  │ Total marks        [20             ]               │     │
│  │ Rubric criteria:                                   │     │
│  │   [+ Add Criterion]                                │     │
│  │   ┌─────────────────────────────────────────┐     │     │
│  │   │ Criterion*  [Content    ] Max Marks* [5]│     │     │
│  │   │ Description [optional...             ]  │     │     │
│  │   │                               [Remove] │     │     │
│  │   └─────────────────────────────────────────┘     │     │
│  └────────────────────────────────────────────────────┘     │
│                                                             │
│  ── SECTION 3: Grading Scale ───────────────────────────   │
│  A    [90-100]  B+  [85-89]  B   [80-84]                   │
│  C+   [75-79]  C   [70-74]  D   [60-69]  F  [<60]         │
│                                                             │
│  ── SECTION 4: Thresholds ──────────────────────────────   │
│  Pass threshold*   [60  ]%                                  │
│  Negative marking  [Toggle: ON/OFF]                         │
│  Partial credit    [Toggle: ON/OFF]                         │
│                                                             │
│  [Cancel]                              [Save as Draft →]    │
└─────────────────────────────────────────────────────────────┘
```

#### API Call

```
POST /api/v1/marking-schemes-v2
Content-Type: application/json
Authorization: Bearer <token>
```

#### Request Payload

```json
{
  "name": "Standard MCQ + Essay Scheme",
  "description": "2-mark MCQs with 0.5 negative marking, 20-mark essay with rubric",
  "examinationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "questionTypeRules": [
    {
      "type": "mcq",
      "marks_per_question": 2,
      "negative_marking": 0.5,
      "partial_credit": true,
      "total_marks": 20,
      "rubric": []
    },
    {
      "type": "essay",
      "total_marks": 20,
      "rubric": [
        { "criterion": "Content", "max_marks": 5, "description": "Accuracy and relevance" },
        { "criterion": "Structure", "max_marks": 5, "description": "Logical organisation" },
        { "criterion": "Analysis", "max_marks": 5, "description": "Depth of critical thinking" },
        { "criterion": "Language", "max_marks": 5, "description": "Grammar and clarity" }
      ]
    }
  ],
  "gradingScale": {
    "A":  "90-100",
    "B+": "85-89",
    "B":  "80-84",
    "C+": "75-79",
    "C":  "70-74",
    "D":  "60-69",
    "F":  "<60"
  },
  "passThreshold": 60,
  "negativeMarkingEnabled": true,
  "partialCreditEnabled": true,
  "status": "draft"
}
```

#### Expected Response (201)

```json
{
  "success": true,
  "message": "Marking scheme created successfully",
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "examinationId": "...",
    "name": "Standard MCQ + Essay Scheme",
    "status": "draft",
    "isLocked": false,
    "appliedAt": null,
    "creator": { "id": "...", "firstName": "...", "lastName": "...", "email": "..." },
    ...
  }
}
```

#### On Success
- Show success toast: *"Marking scheme created successfully"*
- Redirect to `/marking-schemes/{id}` (Scheme Detail Screen)

#### On Error (400)
- Display inline field-level validation errors beneath each offending input
- Do not navigate away
- Re-enable submit button

#### Validations (Frontend)

| Field | Rule |
|---|---|
| `name` | Required, min 3 chars, max 100 chars |
| `examinationId` | Required, must be a valid UUID from dropdown |
| `questionTypeRules` | At least 1 rule required |
| `type` (per rule) | Required, one of: `mcq`, `essay`, `true_false`, `fill_in_the_blank` |
| `marks_per_question` (MCQ) | Required, positive number |
| `negative_marking` (MCQ) | Optional, 0 ≤ value ≤ `marks_per_question` |
| `total_marks` (Essay) | Required, positive number |
| `rubric` (Essay) | At least 1 criterion required |
| `criterion` (Rubric) | Required, non-empty string |
| `max_marks` (Rubric) | Required, positive number |
| Rubric sum vs total_marks | Sum of all `max_marks` must equal `total_marks` |
| `gradingScale` | All grade bands must be present; ranges must be contiguous with no gaps |
| `passThreshold` | Required, 0–100 |

---

### 4.3 Scheme Detail / Edit Screen

**Route:** `/marking-schemes/:schemeId`  
**Accessible by:** All roles (edit restricted to Instructor / Admin when unlocked)

#### Purpose
Displays full scheme configuration. Supports inline editing when status is `draft`. Transitions to read-only view when `isLocked: true`.

#### API Calls

**Load scheme:**
```
GET /api/v1/marking-schemes-v2/{schemeId}
```

**Save edits:**
```
PATCH /api/v1/marking-schemes-v2/{schemeId}
Content-Type: application/json
```

**Delete scheme:**
```
DELETE /api/v1/marking-schemes-v2/{schemeId}
```

#### UI States

**Draft (editable):**
```
┌────────────────────────────────────────────────────────────────┐
│ ← Schemes   Standard MCQ + Essay Scheme       [DRAFT]         │
│                                                                │
│ Examination: Final Examination 2026                            │
│ Created by:  John Instructor  |  Created: 19 May 2026          │
│                                                                │
│ ┌── Question Type Rules ──────────────────────────────────┐   │
│ │  MCQ: 2 marks/question | Negative: 0.5 | Partial: Yes   │   │
│ │  Essay (20 marks):                                       │   │
│ │    Content    5 pts                                      │   │
│ │    Structure  5 pts                                      │   │
│ │    Analysis   5 pts                                      │   │
│ │    Language   5 pts                                      │   │
│ └─────────────────────────────────────────────────────────┘   │
│                                                                │
│ ┌── Grading Scale ───────────────────────────────────────┐    │
│ │  A: 90-100  B+: 85-89  B: 80-84  C+: 75-79            │    │
│ │  C: 70-74   D: 60-69   F: <60                          │    │
│ └────────────────────────────────────────────────────────┘    │
│                                                                │
│ Pass Threshold: 60%                                            │
│                                                                │
│ [Delete Scheme]         [Edit Scheme]   [Apply to Exam →]     │
└────────────────────────────────────────────────────────────────┘
```

**Locked (read-only):**
```
┌────────────────────────────────────────────────────────────────┐
│ ← Schemes   Standard MCQ + Essay Scheme    🔒 [ACTIVE]        │
│                                                                │
│ ⚠ This scheme is locked. It was applied on 19 May 2026.       │
│   No further edits are allowed.                                │
│                                                                │
│  [same content, all read-only]                                 │
│                                                                │
│                                   [View Distribution]          │
│                                   [Compute Student Scores]     │
└────────────────────────────────────────────────────────────────┘
```

#### PATCH Request Payload (all fields optional)

```json
{
  "name": "Updated Scheme Name",
  "description": "Updated description",
  "questionTypeRules": [...],
  "gradingScale": { ... },
  "passThreshold": 65,
  "negativeMarkingEnabled": true,
  "partialCreditEnabled": false,
  "status": "draft"
}
```

#### Expected Response (200)

```json
{
  "success": true,
  "message": "Marking scheme updated successfully",
  "data": { ...UpdatedSchemeObject }
}
```

#### Delete Confirmation Flow

1. User clicks **Delete Scheme**
2. Modal appears: *"Are you sure you want to delete this scheme? This action cannot be undone."*
3. User confirms → `DELETE /api/v1/marking-schemes-v2/{schemeId}`
4. On 200: toast "Scheme deleted", redirect to `/marking-schemes`
5. On 403: toast "Cannot delete a locked scheme"
6. On 404: toast "Scheme not found"

#### Error Handling

| Status Code | User-facing Message |
|---|---|
| 400 | Inline field errors |
| 403 (locked) | "This scheme is locked and cannot be edited" banner |
| 404 | Full-page 404 with "Back to Schemes" link |
| 500 | "Something went wrong. Please try again." toast |

---

### 4.4 Apply Scheme to Examination Screen

**Route:** Modal triggered from Scheme Detail  
**Accessible by:** Admin / Super Admin only

#### Purpose
Applies a draft scheme to its associated examination, transitions status to `active`, and irreversibly locks it.

#### UI — Confirmation Modal

```
┌─────────────────────────────────────────────────────┐
│  Apply Marking Scheme                               │
│                                                     │
│  You are about to apply:                            │
│  📋 Standard MCQ + Essay Scheme                    │
│  to: Final Examination 2026                         │
│                                                     │
│  ⚠️  WARNING: This action is permanent.             │
│  Once applied, this scheme will be locked and       │
│  cannot be edited or deleted.                       │
│                                                     │
│  Please confirm you have reviewed all rules         │
│  before proceeding.                                 │
│                                                     │
│  [ ] I understand this action is irreversible       │
│                                                     │
│  [Cancel]                    [Apply & Lock →]       │
└─────────────────────────────────────────────────────┘
```

**"Apply & Lock" button is disabled until checkbox is ticked.**

#### API Call

```
POST /api/v1/marking-schemes-v2/{schemeId}/apply/{examinationId}
Authorization: Bearer <token>  (Admin / Super Admin required)
```

#### Expected Response (200)

```json
{
  "success": true,
  "message": "Marking scheme applied to examination and locked",
  "data": {
    "id": "...",
    "status": "active",
    "isLocked": true,
    "appliedAt": "2026-05-19T11:05:13.407Z",
    ...
  }
}
```

#### On Success
- Close modal
- Toast: *"Scheme applied and locked successfully"*
- Reload Scheme Detail Screen (now shows locked state)

#### Error Handling

| Status Code | User-facing Message |
|---|---|
| 400 | "This scheme is already locked" |
| 403 | "You do not have permission to apply schemes. Admin role required." |
| 404 | "Scheme or examination not found" |
| 500 | "Failed to apply scheme. Please try again." |

---

### 4.5 Compute Student Score Screen

**Route:** Triggered from Scheme Detail (locked) or Examination Results view  
**Accessible by:** Admin / Super Admin only

#### Purpose
Applies the active marking scheme to a specific student's submitted result, computing their final grade, adjusted score, and pass/fail status.

#### UI — Trigger & Result Panel

```
┌───────────────────────────────────────────────────────────────┐
│  Compute Score for Student                                    │
│                                                               │
│  Examination: Final Examination 2026                          │
│  Scheme:      Standard MCQ + Essay Scheme (🔒 Active)         │
│                                                               │
│  Student ID*  [________________________________]              │
│                                                               │
│  [Compute Score]                                              │
│                                                               │
│  ── Result ────────────────────────────────────────────────  │
│                                                               │
│  Raw Score:         78                                        │
│  Deductions:        -3.5  (negative marking)                  │
│  ─────────────────────────────────────────                   │
│  Final Score:       74.5                                      │
│  Percentage:        74.5%                                     │
│  Grade:             C                                         │
│  Status:            ✅ Pass                                   │
│                                                               │
│  Breakdown:                                                   │
│    MCQ Score:       48                                        │
│    Essay Score:     30                                        │
│    MCQ Penalty:     -3.5                                      │
│    Adjusted Score:  74.5                                      │
└───────────────────────────────────────────────────────────────┘
```

#### API Call

```
POST /api/v1/marking-schemes-v2/compute-score/{examinationId}/{studentId}
Authorization: Bearer <token>  (Admin / Super Admin required)
```

#### Expected Response (200)

```json
{
  "success": true,
  "message": "Score computed and result updated",
  "data": {
    "examinationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "schemeId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "rawScore": 78,
    "deductions": {
      "negative_marking": 3.5
    },
    "finalScore": 74.5,
    "percentage": 74.5,
    "grade": "C",
    "status": "Pass",
    "breakdown": {
      "raw_score": 78,
      "mcq_penalty": -3.5,
      "essay_manual_score": 30,
      "penalty": -3.5,
      "adjusted_score": 74.5
    }
  }
}
```

#### Frontend Behaviour

- Button shows spinner while request is in-flight
- Results panel is hidden until a successful computation
- If the student has already been computed, re-computing should overwrite and show updated values (idempotent)
- Pass status shown in **green** (✅ Pass) or **red** (❌ Fail)

#### Error Handling

| Status Code | User-facing Message |
|---|---|
| 403 | "Admin role required to compute scores" |
| 404 (no scheme) | "No active marking scheme found for this examination" |
| 404 (no result) | "No submitted result found for this student" |
| 500 | "Score computation failed. Please try again." |

---

### 4.6 Grade Distribution Analytics Screen

**Route:** `/marking-schemes/distribution/:examinationId`  
**Accessible by:** All roles

#### Purpose
Visualises grade distribution across all students for a given examination after scores have been computed.

#### API Call

```
GET /api/v1/marking-schemes-v2/distribution/{examinationId}
```

#### Expected Response (200)

```json
{
  "success": true,
  "data": {
    "examinationId": "...",
    "totalStudents": 120,
    "distribution": {
      "A":  { "count": 15, "percentage": 12.5 },
      "B+": { "count": 22, "percentage": 18.3 },
      "B":  { "count": 30, "percentage": 25.0 },
      "C+": { "count": 20, "percentage": 16.7 },
      "C":  { "count": 18, "percentage": 15.0 },
      "D":  { "count": 10, "percentage":  8.3 },
      "F":  { "count":  5, "percentage":  4.2 }
    },
    "passRate": 95.8,
    "meanScore": 76.4,
    "standardDeviation": 11.2
  }
}
```

#### UI Components

- Bar chart or stacked bar showing student count per grade band
- Summary cards: Pass Rate, Mean Score, Std Deviation, Total Students
- Table view toggle (grade | count | percentage)
- Export to CSV button (client-side)

#### Empty State
If no scores have been computed yet: *"No scores computed yet for this examination. Compute student scores first."* with a link back to the scheme detail.

---

### 4.7 KPI Dashboard Screen

**Route:** `/marking-schemes/kpis`  
**Accessible by:** Admin / Super Admin, Supervisor

#### Purpose
System-wide statistics on grading standardisation.

#### API Call

```
GET /api/v1/marking-schemes-v2/kpis
Authorization: Bearer <token>
```

#### Expected Response (200)

```json
{
  "success": true,
  "data": {
    "totalExaminations": 50,
    "examsUsingMarkingSchemes": 38,
    "examsUsingMarkingSchemesRate": 76.0,
    "rubricUsageRate": 64.3,
    "totalSubjectiveQuestions": 140,
    "rubricGradedQuestions": 90
  }
}
```

#### UI Components

```
┌──────────────────────────────────────────────────────────────┐
│  Grading KPIs                                                │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐    │
│  │ Exams with   │  │ Rubric Usage │  │ Rubric-graded  │    │
│  │ Schemes      │  │ Rate         │  │ Questions      │    │
│  │              │  │              │  │                │    │
│  │  76.0%       │  │  64.3%       │  │  90 / 140      │    │
│  │ 38 of 50     │  │              │  │                │    │
│  └──────────────┘  └──────────────┘  └────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. API Reference

| Method | Endpoint | Auth Role | Description |
|---|---|---|---|
| `POST` | `/api/v1/marking-schemes-v2` | Instructor, Admin | Create a marking scheme |
| `GET` | `/api/v1/marking-schemes-v2` | All | List schemes (paginated, filtered) |
| `GET` | `/api/v1/marking-schemes-v2/kpis` | Admin, Supervisor | System-wide KPI stats |
| `GET` | `/api/v1/marking-schemes-v2/examination/{examinationId}` | All | Get active scheme for an exam |
| `GET` | `/api/v1/marking-schemes-v2/distribution/{examinationId}` | All | Grade distribution analytics |
| `GET` | `/api/v1/marking-schemes-v2/{schemeId}` | All | Get scheme by ID |
| `PATCH` | `/api/v1/marking-schemes-v2/{schemeId}` | Instructor, Admin | Update scheme (draft only) |
| `DELETE` | `/api/v1/marking-schemes-v2/{schemeId}` | Instructor, Admin | Delete scheme (draft only) |
| `POST` | `/api/v1/marking-schemes-v2/{schemeId}/apply/{examinationId}` | Admin | Apply & lock scheme to exam |
| `POST` | `/api/v1/marking-schemes-v2/compute-score/{examinationId}/{studentId}` | Admin | Compute student score |

---

## 6. Data Structures

### SchemeObject (full)

```typescript
interface MarkingScheme {
  id: string;                        // UUID
  examinationId: string;             // UUID
  name: string;
  description?: string;
  questionTypeRules: QuestionTypeRule[];
  gradingScale: GradingScale;
  passThreshold: number;             // 0–100
  negativeMarkingEnabled: boolean;
  partialCreditEnabled: boolean;
  isLocked: boolean;
  appliedAt: string | null;          // ISO 8601 timestamp or null
  status: 'draft' | 'active' | 'inactive';
  examination: {
    id: string;
    title: string;
    totalMarks: number;
  };
  creator: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
```

### QuestionTypeRule

```typescript
interface QuestionTypeRule {
  type: 'mcq' | 'essay' | 'true_false' | 'fill_in_the_blank';
  marks_per_question?: number;    // MCQ, True/False, Fill-in-the-blank
  negative_marking?: number;      // MCQ (penalty per wrong answer)
  partial_credit?: boolean;
  total_marks?: number;           // Essay / subjective
  rubric?: RubricCriterion[];     // Essay only
}
```

### RubricCriterion

```typescript
interface RubricCriterion {
  criterion: string;
  max_marks: number;
  description?: string;
}
```

### GradingScale

```typescript
interface GradingScale {
  'A':  string;   // e.g. "90-100"
  'B+': string;   // e.g. "85-89"
  'B':  string;
  'C+': string;
  'C':  string;
  'D':  string;
  'F':  string;   // e.g. "<60"
}
```

### ComputedScoreResult

```typescript
interface ComputedScoreResult {
  examinationId: string;
  studentId: string;
  schemeId: string;
  rawScore: number;
  deductions: {
    negative_marking: number;
  };
  finalScore: number;
  percentage: number;
  grade: string;               // 'A' | 'B+' | 'B' | 'C+' | 'C' | 'D' | 'F'
  status: 'Pass' | 'Fail';
  breakdown: {
    raw_score: number;
    mcq_penalty: number;
    essay_manual_score: number;
    penalty: number;
    adjusted_score: number;
  };
}
```

---

## 7. Validation Rules

### Create / Update Scheme

| Field | Rule | Error Message |
|---|---|---|
| `name` | Required, 3–100 chars | "Name is required (3–100 characters)" |
| `examinationId` | Required, valid UUID | "Please select a valid examination" |
| `questionTypeRules` | Array, min length 1 | "At least one question type rule is required" |
| `type` per rule | Must be one of `mcq`, `essay`, `true_false`, `fill_in_the_blank` | "Invalid question type" |
| `marks_per_question` (MCQ) | Required for MCQ, must be > 0 | "Marks per question must be greater than 0" |
| `negative_marking` | 0 ≤ value ≤ `marks_per_question` | "Negative marking cannot exceed marks per question" |
| `total_marks` (Essay) | Required for essay, must be > 0 | "Total marks must be greater than 0" |
| `rubric` (Essay) | Min 1 criterion | "Essay type requires at least one rubric criterion" |
| Rubric max_marks sum | Must equal `total_marks` | "Rubric criteria marks must sum to total marks" |
| `passThreshold` | Required, 0–100 | "Pass threshold must be between 0 and 100" |
| Grading scale ranges | No gaps, no overlaps, must cover 0–100 | "Grading scale must cover all score ranges without gaps" |

### Apply Scheme

| Condition | Error |
|---|---|
| Scheme already locked (`isLocked: true`) | 400 – "Scheme is already locked" |
| User is not Admin or Super Admin | 403 – Forbidden |
| Scheme not found | 404 – "Scheme not found" |

### Delete Scheme

| Condition | Error |
|---|---|
| Scheme is locked | 403 – "Cannot delete a locked scheme" |
| Scheme not found | 404 – "Scheme not found" |

---

## 8. Edge Cases

### Multiple Schemes per Examination
- The system should enforce that only **one active scheme** exists per examination at a time.
- Frontend: when creating a scheme for an examination that already has an active scheme, show a warning: *"This examination already has an active marking scheme. Applying a new one will require the existing scheme to be deactivated first."*
- The `GET /examination/{examinationId}` endpoint returns the single active scheme.

### Rubric Marks vs Total Marks Mismatch
- If essay rubric `max_marks` sum ≠ `total_marks`, surface a validation error before submission.
- Do not allow the form to submit.

### Negative Marking > Marks Per Question
- A wrong MCQ answer should never result in a deduction greater than the question's worth.
- Validate: `negative_marking ≤ marks_per_question`.

### Computing Score Before Scheme is Applied
- The `compute-score` endpoint requires an **active** scheme. If the scheme is still in `draft`, the endpoint returns 404.
- Frontend should disable "Compute Score" action if `isLocked === false`.

### Computing Score with No Submitted Result
- If the student has not submitted an exam result, the endpoint returns 404.
- Frontend should surface: *"No submitted result found for this student."*

### Re-computing an Already-Computed Score
- The endpoint is idempotent: re-computing overwrites existing computed values.
- Frontend should confirm with a brief warning: *"This student already has a computed score. Re-computing will overwrite it."*

### Grading Scale Edge Cases
- The `F` band uses `<60` notation — the frontend must parse this as `score < 60`, not as a range.
- Grade determination on the backend: iterate grade bands from highest to lowest; assign the first band whose lower bound ≤ `percentage`.

### Scheme with No Rubric for Essay Type
- Essay type rules must always have a `rubric` array with at least one criterion.
- Frontend: show a dynamic validation error beneath the essay rule section if the rubric array is empty on save attempt.

### Inactive Schemes
- Schemes can be set to `inactive` status (e.g. superseded by a new scheme).
- Inactive schemes are read-only and cannot be reactivated via the UI without admin intervention.
- List screen filter should include `inactive` as a status option.

---

## 9. UI States (Loading / Error / Empty)

### Global Loading Strategy
- Use **skeleton screens** (not spinners) for list and detail pages — they reduce perceived wait time.
- Use **button spinners** for action-triggered requests (create, update, apply, compute).
- Never disable the entire form on loading — only the submit/action button.

### State Reference Table

| Screen | Loading State | Empty State | Error State |
|---|---|---|---|
| List | 5 skeleton table rows | Illustration + CTA | Error banner with retry |
| Detail | Skeleton card layout | — | Full-page error with back link |
| Create Form | — (form is static) | — | Inline field errors |
| KPI Dashboard | Skeleton stat cards | "No data available yet" | Error banner |
| Distribution | Skeleton chart | "No scores computed yet" | Error banner |

### Toast Notifications

All non-form-level feedback should use **toasts** (auto-dismiss after 4s, with manual close):

| Event | Toast Type | Message |
|---|---|---|
| Scheme created | Success | "Marking scheme created successfully" |
| Scheme updated | Success | "Marking scheme updated successfully" |
| Scheme deleted | Success | "Scheme deleted" |
| Scheme applied | Success | "Scheme applied and locked successfully" |
| Score computed | Success | "Score computed and result updated" |
| 403 error | Error | "You don't have permission for this action" |
| 500 error | Error | "Something went wrong. Please try again." |
| Network failure | Error | "Request failed. Check your connection." |

---

## 10. Frontend Implementation Notes

### State Management
- Store the list of schemes in a centralised store (Redux RTK Query slice or React Query).
- Invalidate the scheme list cache after create, update, delete, and apply operations.
- Invalidate the individual scheme cache after update and apply.

### RTK Query Endpoints (suggested)

```typescript
// markingSchemeApi.ts
const markingSchemeApi = createApi({
  reducerPath: 'markingSchemeApi',
  endpoints: (builder) => ({
    listSchemes:         builder.query<...>({ query: (params) => ({ url: '/marking-schemes-v2', params }) }),
    getScheme:           builder.query<...>({ query: (id) => `/marking-schemes-v2/${id}` }),
    getSchemeForExam:    builder.query<...>({ query: (examId) => `/marking-schemes-v2/examination/${examId}` }),
    getKpis:             builder.query<...>({ query: () => '/marking-schemes-v2/kpis' }),
    getDistribution:     builder.query<...>({ query: (examId) => `/marking-schemes-v2/distribution/${examId}` }),
    createScheme:        builder.mutation<...>({ query: (body) => ({ url: '/marking-schemes-v2', method: 'POST', body }) }),
    updateScheme:        builder.mutation<...>({ query: ({ id, ...body }) => ({ url: `/marking-schemes-v2/${id}`, method: 'PATCH', body }) }),
    deleteScheme:        builder.mutation<...>({ query: (id) => ({ url: `/marking-schemes-v2/${id}`, method: 'DELETE' }) }),
    applyScheme:         builder.mutation<...>({ query: ({ schemeId, examId }) => ({ url: `/marking-schemes-v2/${schemeId}/apply/${examId}`, method: 'POST' }) }),
    computeScore:        builder.mutation<...>({ query: ({ examId, studentId }) => ({ url: `/marking-schemes-v2/compute-score/${examId}/${studentId}`, method: 'POST' }) }),
  }),
});
```

### Dynamic Rubric Form
- The rubric section for Essay rules must be a dynamic field array (e.g. `react-hook-form` `useFieldArray`).
- Show a running total of rubric `max_marks` vs `total_marks` as the instructor adds criteria.
- Highlight the total in red if it doesn't match.

### Grading Scale Input
- Render as a structured grid — do not use free-text input for ranges.
- Parse and validate contiguity client-side before submission.

### Role Gating Pattern

```typescript
const { user } = useAuth();
const isAdmin = user.role === 'admin' || user.role === 'super_admin';
const isInstructor = user.role === 'instructor';

// Conditionally render actions:
{!scheme.isLocked && (isAdmin || isInstructor) && <EditButton />}
{!scheme.isLocked && (isAdmin || isInstructor) && <DeleteButton />}
{scheme.isLocked && isAdmin && <ComputeScoreButton />}
{isAdmin && <ApplyButton />}
```

### Locked Scheme Banner
Display a persistent info banner on any locked scheme detail screen:
```
ℹ️  This scheme was locked on [appliedAt date]. No edits are permitted.
```

---

## 11. Backend Implementation Notes

### Score Computation Logic

```
1. Fetch the active marking scheme for the examination.
2. Fetch the student's submitted examResult.
3. For each MCQ question in the result:
   a. If answer is correct: add marks_per_question to rawScore.
   b. If answer is wrong AND negativeMarkingEnabled:
      subtract negative_marking from deductions.
4. For essay questions:
   a. Sum all manually assigned rubric criterion scores.
5. adjustedScore = rawScore - totalDeductions
6. percentage = (adjustedScore / exam.totalMarks) * 100
7. Determine grade by iterating gradingScale bands.
8. status = percentage >= passThreshold ? 'Pass' : 'Fail'
9. Save all computed values to examResult record.
```

### Scheme Locking
- On `apply`, set `isLocked = true` and `status = 'active'` atomically.
- All subsequent `PATCH` and `DELETE` requests must check `isLocked` first and return 403 if true.

### Grading Scale Parsing
- Store `gradingScale` as a JSON object.
- Parse ranges at computation time: `"90-100"` → `{ min: 90, max: 100 }`, `"<60"` → `{ min: 0, max: 59.99 }`.

### Audit Trail
- Every scoring computation should create an audit log entry with: `examResultId`, `schemeId`, `computedBy` (userId), `computedAt` (timestamp), `previousScore`, `newScore`.

### Validation on Create/Update
- Enforce rubric sum ≡ total_marks at the service layer, not just the controller, so it applies to both API and internal calls.
- Reject schemes where the grading scale has overlapping ranges.

---

## 12. Status & Lock State Machine

```
                ┌─────────┐
                │  DRAFT  │
                └────┬────┘
                     │
          PATCH (edits allowed)
          DELETE (allowed)
                     │
         [Admin: POST /apply/{examId}]
                     │
                     ▼
                ┌─────────┐
                │ ACTIVE  │◄── isLocked: true
                └────┬────┘
                     │
          PATCH → 403 Forbidden
          DELETE → 403 Forbidden
                     │
       [Manual Admin deactivation, if supported]
                     │
                     ▼
               ┌──────────┐
               │ INACTIVE │
               └──────────┘
                  read-only
```

**Key rules:**
- A scheme can only move from `draft` → `active` (via apply).
- A locked (`active`) scheme cannot return to `draft`.
- `inactive` is a terminal or administrative state.

---

## 13. Integration Points

| System | How It Connects |
|---|---|
| **Examination Engine (OES)** | `examinationId` links scheme to a specific exam; `exam.totalMarks` is used for percentage calculation |
| **Question Bank System** | Question types (MCQ, Essay, etc.) must match the `type` values in `questionTypeRules` |
| **Grading Engine** | `compute-score` endpoint feeds final values (`grade`, `finalScore`, `status`) back into the student's `examResult` record |
| **Rubric Evaluation Module** | Manual essay marking scores are expected to be present in `examResult` before `compute-score` is called |
| **Academic Records System** | Final grades published here after distribution is reviewed |
| **Audit Logging System** | Every apply and compute action should produce an audit record |
| **Analytics Dashboard** | Consumes `/kpis` and `/distribution/{examId}` endpoints |

---

*Last updated: May 2026 | TC11 v2 | GCLMS Documentation*