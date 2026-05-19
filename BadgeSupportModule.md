# Badge Support Module — Developer README (AI-Optimized)

> **Purpose:** This document maps every UI screen/component to its corresponding API endpoint(s), explains the full data flow, and provides step-by-step implementation instructions for building the Badge Support Module in GCLMS.

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Entity & Data Model Reference](#2-entity--data-model-reference)
3. [Role-Based Access Matrix](#3-role-based-access-matrix)
4. [UI Screens → Endpoint Mapping](#4-ui-screens--endpoint-mapping)
5. [Step-by-Step Feature Flows](#5-step-by-step-feature-flows)
6. [State Derivation Rules](#6-state-derivation-rules)
7. [Business Logic the Frontend Must Enforce](#7-business-logic-the-frontend-must-enforce)
8. [API Quick Reference](#8-api-quick-reference)

---

## 1. Module Overview

The Badge Support Module handles the full lifecycle of digital badges:

```
Admin creates badge → assigns courses → student completes courses
→ system checks eligibility → badge issued (auto or manual)
→ student views earned badge → admin monitors KPIs
```

**Badge Types:** `Open Badge` | `Mozilla Badge` | `Custom Badge`

**Validation Methods:** `automatic` | `manual`

**Award Statuses:** `Not Started` | `In Progress` | `Pending Approval` | `Earned`

---

## 2. Entity & Data Model Reference

### Badge Object (from API)

| Field                  | Type         | Description                                                     |
| ---------------------- | ------------ | --------------------------------------------------------------- |
| `id`                   | UUID         | Badge's unique identifier                                       |
| `title`                | string       | Badge display name                                              |
| `badgeType`            | string       | `Open Badge`, `Mozilla Badge`, or `Custom Badge`                |
| `description`          | string       | Purpose/meaning of the badge                                    |
| `issuingAuthority`     | string       | Who issues it (e.g. `Automated System`)                         |
| `requiredCoursesCount` | number       | **Always display this.** Auto-derived from courseIds length     |
| `requiredCourseList`   | Course[]     | Array of course objects `{ id, title, description, thumbnail }` |
| `validationMethod`     | string       | `automatic` or `manual`                                         |
| `badgeFile`            | string (URL) | PNG or SVG badge image URL                                      |
| `status`               | string       | `active` or `inactive`                                          |
| `createdAt`            | ISO date     |                                                                 |
| `updatedAt`            | ISO date     |                                                                 |

### Student Progress Fields (appended when student is authenticated)

| Field                   | Type             | Description                                                   |
| ----------------------- | ---------------- | ------------------------------------------------------------- |
| `coursesCompletedSoFar` | number           | How many required courses student has finished                |
| `remainingCourses`      | number           | `requiredCoursesCount - coursesCompletedSoFar`                |
| `progressPercentage`    | number           | `(coursesCompletedSoFar / requiredCoursesCount) * 100`        |
| `awardStatus`           | string           | `Not Started`, `In Progress`, `Pending Approval`, or `Earned` |
| `awardDate`             | ISO date \| null | Populated when `Earned`                                       |

### Badge Award Record

| Field         | Type             | Description        |
| ------------- | ---------------- | ------------------ |
| `id`          | UUID             | Award record ID    |
| `badgeId`     | UUID             | Reference to badge |
| `awardStatus` | string           | Award status       |
| `awardDate`   | ISO date \| null | Date of issuance   |
| `badge`       | Badge object     | Full badge details |

---

## 3. Role-Based Access Matrix

| Feature                               | Student | Instructor       | Admin               | Super Admin |
| ------------------------------------- | ------- | ---------------- | ------------------- | ----------- |
| View all active badges + own progress | ✅      | ✅ (no progress) | ✅ (all + inactive) | ✅          |
| View single badge + own progress      | ✅      | ✅               | ✅                  | ✅          |
| View own earned badges                | ✅      | ❌               | ❌                  | ❌          |
| Track own badge progress              | ✅      | ❌               | ❌                  | ❌          |
| Create badge                          | ❌      | ❌               | ✅                  | ✅          |
| Update badge                          | ❌      | ❌               | ✅                  | ✅          |
| Deactivate badge                      | ❌      | ❌               | ✅                  | ✅          |
| Add/remove courses from badge         | ❌      | ❌               | ✅                  | ✅          |
| Manually award badge to student       | ❌      | ❌               | ✅                  | ✅          |
| Approve pending manual badge          | ❌      | ❌               | ✅                  | ✅          |
| View pending approvals                | ❌      | ❌               | ✅                  | ✅          |
| View badge KPIs                       | ❌      | ❌               | ✅                  | ✅          |
| View badge issuance report            | ❌      | ❌               | ✅                  | ✅          |

---

## 4. UI Screens → Endpoint Mapping

---

### Screen 1: Badge List Page (Student View)

**Route:** `/badges` (student)

**Purpose:** Show all active badges with the student's real-time progress on each.

**Primary Endpoint:**

```
GET /api/v1/badges
```

**What the API returns (for students):**

- Full badge list with `coursesCompletedSoFar`, `remainingCourses`, `progressPercentage`, `awardStatus` appended per badge.

**UI Components to Render:**

```
BadgeCard
├── badgeFile image (PNG/SVG)
├── title
├── badgeType chip
├── description (truncated)
├── requiredCoursesCount — ALWAYS VISIBLE (spec requirement)
├── Progress Bar → progressPercentage
├── "X of Y courses completed" → coursesCompletedSoFar / requiredCoursesCount
├── remainingCourses → "X courses remaining"
└── awardStatus badge chip → color coded:
    Not Started   → grey
    In Progress   → blue/yellow
    Pending Approval → orange
    Earned        → green
```

**Data flow:**

1. On mount → call `GET /api/v1/badges`
2. Map response `data[]` into `BadgeCard` components
3. Display `requiredCoursesCount` on every card regardless of progress
4. Derive status chip color from `awardStatus` field

---

### Screen 2: Badge Detail Page (Student View)

**Route:** `/badges/:badgeId` (student)

**Purpose:** Full badge detail + student's progress + required course list.

**Primary Endpoint:**

```
GET /api/v1/badges/:badgeId
```

**Side Effect (automatic issuance):**

> If this student has completed all required courses and `validationMethod === "automatic"`, calling this endpoint **triggers automatic badge issuance**. The response will return `awardStatus: "Earned"` and populate `awardDate`.

**UI Components to Render:**

```
BadgeDetailPage
├── badgeFile image (large display)
├── title + badgeType
├── description
├── issuingAuthority
├── requiredCoursesCount — ALWAYS VISIBLE
├── validationMethod label
│
├── Progress Section
│   ├── Circular or linear progress → progressPercentage
│   ├── coursesCompletedSoFar / requiredCoursesCount
│   ├── remainingCourses
│   └── awardStatus chip
│
└── Required Courses List
    └── For each course in requiredCourseList:
        ├── thumbnail
        ├── title
        ├── description
        └── ✅ / ⏳ completion indicator
            (compare against student's completed course IDs)
```

**Alternate state — Earned:**

```
├── Show "🏅 Badge Earned!" banner
├── awardDate formatted
└── Option to download/share badgeFile
```

**Alternate state — Pending Approval:**

```
└── Show "⏳ Awaiting Admin Approval" notice
```

---

### Screen 3: My Badges Page (Student View)

**Route:** `/badges/my-badges` (student)

**Purpose:** Show only badges the student has earned.

**Primary Endpoint:**

```
GET /api/v1/badges/my-badges
```

**Filter:** API already returns only `awardStatus === "Earned"` records.

**UI Components to Render:**

```
MyBadgesPage
└── EarnedBadgeCard (per item in data[])
    ├── badge.badgeFile image
    ├── badge.title
    ├── badge.badgeType
    ├── awardDate formatted ("Earned on May 16, 2026")
    ├── badge.issuingAuthority
    └── Download / Share button → link to badge.badgeFile
```

**Empty state:**

```
"You haven't earned any badges yet. Start completing courses!"
→ CTA button → /badges
```

---

### Screen 4: Badge Progress Tracker (Student — specific badge)

**Route:** `/badges/:badgeId/progress` (student)

**Purpose:** Dedicated real-time progress view for a single badge.

**Primary Endpoint:**

```
GET /api/v1/badges/:badgeId/progress
```

**Side Effect:** Same as the detail endpoint — if all courses complete + `automatic`, badge is issued here.

**UI Components to Render:**

```
BadgeProgressPage
├── badge header (image, title, type)
├── requiredCoursesCount — ALWAYS VISIBLE
├── Large progress ring → progressPercentage%
├── "X of Y required courses completed"
├── Remaining courses list (courses not yet completed from requiredCourseList)
└── awardStatus chip
```

---

### Screen 5: Badge Management Page (Admin View)

**Route:** `/admin/badges`

**Purpose:** List all badges (active + inactive), manage, create.

**Endpoints used:**

```
GET  /api/v1/badges              → load all badges (admin sees inactive too)
POST /api/v1/badges/create       → create new badge (via modal/drawer)
PUT  /api/v1/badges/:badgeId     → edit badge (via edit modal)
DELETE /api/v1/badges/:badgeId   → deactivate badge (soft delete)
```

**UI Components:**

```
AdminBadgePage
├── "Create Badge" button → opens CreateBadgeModal
├── Filter tabs: All | Active | Inactive
│
└── BadgeAdminTable
    Columns: Title | Type | Required Courses | Validation | Status | Actions
    Actions per row:
    ├── Edit → PUT /api/v1/badges/:badgeId
    ├── Manage Courses → opens CourseAssignmentPanel
    └── Deactivate → DELETE /api/v1/badges/:badgeId
```

---

### Screen 6: Create Badge Modal (Admin)

**Triggered from:** Badge Management Page

**Endpoint:**

```
POST /api/v1/badges/create
```

**Request body fields to collect in the form:**

```
{
  title:             string (required)
  badgeType:         select → ["Open Badge", "Mozilla Badge", "Custom Badge"]
  description:       textarea (required)
  issuingAuthority:  string (required)
  validationMethod:  select → ["automatic", "manual"]
  badgeFile:         URL input or file upload → returns CDN URL
  courseIds:         multi-select course picker → string[] (required)
}
```

> **Important:** `requiredCoursesCount` is NOT sent in the form. It is automatically derived by the API from the length of `courseIds`. Display the count dynamically in the UI as the admin selects courses.

**On success (201):** Close modal, refresh badge list, show toast "Badge created successfully".

---

### Screen 7: Course Assignment Panel (Admin)

**Triggered from:** Badge Management → Manage Courses per badge

**Endpoints:**

```
POST   /api/v1/badges/:badgeId/courses   → add courses
DELETE /api/v1/badges/:badgeId/courses   → remove courses
```

**UI:**

```
CourseAssignmentPanel
├── Current required courses list (from badge.requiredCourseList)
│   └── Each course has a [Remove] button → DELETE /courses
├── Search/select courses to add
└── [Add Selected] → POST /courses
```

**After each operation:** Re-fetch `GET /api/v1/badges/:badgeId` to reflect updated `requiredCoursesCount` and `requiredCourseList`.

---

### Screen 8: Pending Approvals Page (Admin)

**Route:** `/admin/badges/pending-approvals`

**Purpose:** Review students waiting on manual badge approval.

**Endpoints:**

```
GET  /api/v1/badges/pending-approvals           → load pending list
POST /api/v1/badges/:badgeId/approve/:userId    → approve individual
POST /api/v1/badges/:badgeId/award/:userId      → manually award (bypass checks)
```

**UI:**

```
PendingApprovalsPage
└── PendingApprovalTable
    Columns: Student Name | Badge Title | Courses Completed | Submitted Date | Actions
    Actions:
    ├── Approve → POST /:badgeId/approve/:userId
    │   └── Request body: { validationDetails: string }
    └── View Badge → link to badge detail
```

**On approve success:** Remove row from table, show toast "Badge approved and issued to [Student Name]".

---

### Screen 9: Manual Award Modal (Admin)

**Triggered from:** Badge detail or student profile

**Endpoint:**

```
POST /api/v1/badges/:badgeId/award/:userId
```

**Form fields:**

```
{
  validationDetails: string (required) — e.g. "Manually verified by instructor"
}
```

**Duplicate guard:** API returns `400` if badge already issued to this student. Show error: "This badge has already been issued to this student."

---

### Screen 10: Badge KPI Dashboard (Admin)

**Route:** `/admin/badges/kpis`

**Endpoint:**

```
GET /api/v1/badges/kpis
```

**UI — KPI Cards to render:**

```
KPI Dashboard
├── Total Badges                → data.totalBadges
├── Active Badges               → data.activeBadges
├── Inactive Badges             → data.inactiveBadges
├── Total Badges Awarded        → data.totalBadgesAwarded
├── Badge Completion Rate       → data.badgeCompletionRate (display as %)
├── Average Days to Earn        → data.averageDaysToEarn
├── Auto-Awarded This Week      → data.autoAwardedThisWeek
├── Auto-Awarded This Month     → data.autoAwardedThisMonth
├── Pending Approvals           → data.pendingApprovalCount
└── Badges with Req. Displayed  → data.badgesWithRequirementsCount
```

---

### Screen 11: Badge Issuance Report (Admin)

**Route:** `/admin/badges/report`

**Endpoint:**

```
GET /api/v1/badges/report
```

**UI — Report Table:**

```
BadgeReportTable
Columns: Badge ID | Title | Type | Required Courses | Validation | Status | Total Awarded | Pending

Expandable row per badge → awardRecords[]
    Sub-columns: Student Name | Email | Award Date | Award Status
```

**Export:** Optionally add CSV export from the fetched data array.

---

## 5. Step-by-Step Feature Flows

---

### Flow A: Admin Creates a Badge

```
1. Admin navigates to /admin/badges
2. Clicks "Create Badge"
3. CreateBadgeModal opens
4. Admin fills in: title, badgeType, description, issuingAuthority, validationMethod, badgeFile URL
5. Admin selects courses from multi-select picker → courseIds[]
6. UI shows live count: "X courses selected (requiredCoursesCount will be X)"
7. Admin submits → POST /api/v1/badges/create
8. On 201: close modal, toast success, refresh GET /api/v1/badges
9. On 400: show validation error inline
10. On 403: show "You don't have permission to create badges"
```

---

### Flow B: Student Views Badges and Tracks Progress

```
1. Student navigates to /badges
2. App calls GET /api/v1/badges (authenticated)
3. API returns badges[] with progress fields appended
4. Each BadgeCard renders:
   - requiredCoursesCount (always visible)
   - progressPercentage as a progress bar
   - coursesCompletedSoFar / requiredCoursesCount
   - awardStatus chip
5. Student clicks a badge card → /badges/:badgeId
6. App calls GET /api/v1/badges/:badgeId
7. If all courses complete + automatic:
   → API auto-issues badge
   → response returns awardStatus: "Earned", awardDate populated
   → UI shows "🏅 Badge Earned!" banner
8. If all courses complete + manual:
   → awardStatus: "Pending Approval"
   → UI shows "⏳ Awaiting Admin Approval"
9. If not all courses complete:
   → Show progress ring + remaining courses list
```

---

### Flow C: Automatic Badge Issuance

```
Triggered by: Student completing the last required course

1. Course completion event fires (handled by course completion module)
2. Student next visits GET /api/v1/badges/:badgeId OR GET /api/v1/badges/:badgeId/progress
3. API checks: completedCourses ∩ requiredCourseList === requiredCoursesCount
4. If true AND validationMethod === "automatic":
   a. Badge award record created
   b. awardStatus set to "Earned"
   c. awardDate set to now()
5. API response includes awardStatus: "Earned"
6. Frontend reads awardStatus and renders Earned state
7. Badge now appears in GET /api/v1/badges/my-badges
```

---

### Flow D: Manual Badge Approval

```
1. Student completes all required courses for a badge with validationMethod === "manual"
2. On next progress check:
   → API creates a pending award record (awardStatus: "Pending Approval")
   → API response returns awardStatus: "Pending Approval"
3. Student sees "⏳ Awaiting Admin Approval" in UI
4. Admin navigates to /admin/badges/pending-approvals
5. Admin calls GET /api/v1/badges/pending-approvals → sees the student's entry
6. Admin reviews and clicks Approve
7. Admin submits POST /api/v1/badges/:badgeId/approve/:userId with validationDetails
8. API changes awardStatus to "Earned", sets awardDate
9. Student's badge status updates to "Earned" on next load
```

---

### Flow E: Admin Manually Awards a Badge (Bypass Completion Check)

```
1. Admin is on a student profile or badge management page
2. Admin triggers Manual Award action
3. ManualAwardModal opens — admin enters validationDetails
4. Submits POST /api/v1/badges/:badgeId/award/:userId
5. On 200: badge issued, show toast "Badge awarded successfully"
6. On 400 "already issued": show error "This badge has already been awarded to this student"
7. On 404: show "Badge or student not found"
```

---

### Flow F: Admin Updates Badge Courses

```
1. Admin opens CourseAssignmentPanel for a badge
2. Current requiredCourseList displayed
3. Admin selects new courses → POST /api/v1/badges/:badgeId/courses with { courseIds }
4. On success: re-fetch badge → requiredCoursesCount auto-updated by API
5. Admin removes a course → DELETE /api/v1/badges/:badgeId/courses with { courseIds }
6. On success: re-fetch badge → requiredCoursesCount decremented
7. UI always reflects updated requiredCoursesCount after each operation
```

---

### Flow G: Admin Views KPIs and Reports

```
1. Admin navigates to /admin/badges/kpis
2. App calls GET /api/v1/badges/kpis
3. KPI cards render from data object
4. Admin navigates to /admin/badges/report
5. App calls GET /api/v1/badges/report
6. Report table renders badges with expandable awardRecords per badge
7. Optional: export button serializes data[] to CSV client-side
```

---

## 6. State Derivation Rules

These are computed by the API — **never compute these on the frontend**.

| UI Label               | Source Field           | Rule                                                                            |
| ---------------------- | ---------------------- | ------------------------------------------------------------------------------- |
| Progress %             | `progressPercentage`   | `(coursesCompletedSoFar / requiredCoursesCount) * 100`                          |
| Remaining courses      | `remainingCourses`     | `requiredCoursesCount - coursesCompletedSoFar`                                  |
| Award status           | `awardStatus`          | System-derived. Never allow user/admin to manually set this via the badge form  |
| Required courses count | `requiredCoursesCount` | Auto-derived from `courseIds.length` on create/update — not a manual form field |
| Badge status           | `status`               | Only `active` or `inactive`. Deactivation is via DELETE endpoint (soft delete)  |

---

## 7. Business Logic the Frontend Must Enforce

1. **`requiredCoursesCount` must always be visible** — on every card, list row, and detail view, regardless of user role or badge status. This is a hard spec requirement.

2. **`awardStatus` is read-only** — never render a form input that lets anyone directly set the award status. It is always derived by the backend.

3. **Duplicate award guard** — before calling `POST /:badgeId/award/:userId`, the API enforces this, but the UI should also disable the "Award" button if the student's existing `awardStatus === "Earned"`.

4. **Inactive badge display** — students should only see `status === "active"` badges. Admins see all. This is handled by the API but the UI should handle it defensively.

5. **Auto-issuance side effect** — calling `GET /api/v1/badges/:badgeId` or `GET /api/v1/badges/:badgeId/progress` for a student who has completed all courses with `automatic` validation **will issue the badge**. This is intentional. Do not suppress or throttle these calls.

6. **Course count live preview** — in the CreateBadgeModal, show a live counter of selected courseIds so the admin can see what `requiredCoursesCount` will be before submitting.

7. **Deactivation ≠ deletion** — `DELETE /api/v1/badges/:badgeId` sets `status: inactive`. Award records are preserved. Show a confirmation dialog: "This will deactivate the badge. Existing awards will not be affected."

8. **`validationDetails` on approval** — always required when calling approve or manual award endpoints. Make this textarea required in the form.

---

## 8. API Quick Reference

| Method   | Endpoint                                  | Role    | UI Trigger                   |
| -------- | ----------------------------------------- | ------- | ---------------------------- |
| `GET`    | `/api/v1/badges`                          | All     | Badge list page load         |
| `POST`   | `/api/v1/badges/create`                   | Admin   | Create badge form submit     |
| `GET`    | `/api/v1/badges/kpis`                     | Admin   | KPI dashboard load           |
| `GET`    | `/api/v1/badges/report`                   | Admin   | Report page load             |
| `GET`    | `/api/v1/badges/pending-approvals`        | Admin   | Pending approvals page load  |
| `GET`    | `/api/v1/badges/my-badges`                | Student | My Badges page load          |
| `GET`    | `/api/v1/badges/:badgeId`                 | All     | Badge detail page load       |
| `PUT`    | `/api/v1/badges/:badgeId`                 | Admin   | Edit badge form submit       |
| `DELETE` | `/api/v1/badges/:badgeId`                 | Admin   | Deactivate badge button      |
| `POST`   | `/api/v1/badges/:badgeId/courses`         | Admin   | Add courses to badge         |
| `DELETE` | `/api/v1/badges/:badgeId/courses`         | Admin   | Remove courses from badge    |
| `GET`    | `/api/v1/badges/:badgeId/progress`        | Student | Progress tracker page load   |
| `POST`   | `/api/v1/badges/:badgeId/award/:userId`   | Admin   | Manual award form submit     |
| `POST`   | `/api/v1/badges/:badgeId/approve/:userId` | Admin   | Approve pending badge button |

---

_Generated for GCLMS — Badge Support Module (TC13)_
