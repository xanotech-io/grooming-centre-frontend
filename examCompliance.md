# TC15 – Course / Exam Compliance & Non-Compliance Notification & Report

## Overview

The **Compliance & Non-Compliance Notification Module** automatically monitors course and exam completion obligations, evaluates each user's compliance status, dispatches tiered notifications (Reminders, Warnings, Final Notices, Confirmations, and Escalations), tracks delivery, and generates structured compliance reports with KPIs.

The module operates across two layers:

- **Compliance Training Assignments** — tracks which employees are assigned which courses, whether they have completed them, and how overdue they are.
- **Compliance Notifications** — dispatches and logs every notification generated from those assignment records, and provides reporting and escalation management.

**Base URL (Production):** `https://gclms.xanotech.org`
**Base URL (Local):** `http://localhost:8089`
**Authentication:** All endpoints require `Authorization: Bearer <JWT>`

---

## Table of Contents

1. Architecture Overview
2. API Endpoints Reference
3. UI Sections and API Mapping
   - 3.1 KPI Dashboard Bar
   - 3.2 Admin Notification Log Table
   - 3.3 Notification Detail View
   - 3.4 Full Compliance Report View
   - 3.5 Send Notification — Single User
   - 3.6 Auto-Evaluate and Bulk Notify
   - 3.7 Resend a Failed Notification
   - 3.8 Escalate a Non-Compliant Case
   - 3.9 Compliance Training Assignment
   - 3.10 Mark Training as Completed
   - 3.11 Training Assignment Report
   - 3.12 Employee Training View (Self-Service)
   - 3.13 My Notifications (Student / Employee View)
4. Complete Step-by-Step Workflows
5. Request and Response Structures
6. Notification Object — Full Field Reference
7. Training Assignment Object — Full Field Reference
8. KPI Definitions
9. Status and Enum Values
10. Notification Type Logic
11. Validation Rules
12. Error Handling

---

## 1. Architecture Overview

```
ADMIN / COMPLIANCE OFFICER UI
+------------------------------------------------------+
| KPI Dashboard Bar                                    |
| compliance rate · overdue · escalated · delivery     |
+------------------------------------------------------+
| Admin Notification Log   | Compliance Report View    |
| (paginated, filterable)  | KPIs + notifications +    |
|   click row              | per-recipient + escalated |
|     -> Detail View       +--------------------------+
|     + Resend + Escalate  | Send / Evaluate Panel    |
|                          | Single send · Bulk eval  |
| Training Assignment Panel|                          |
| Assign · Complete · Report                          |
+------------------------------------------------------+

STUDENT / EMPLOYEE UI
+------------------------------------------------------+
| My Notifications (compliance inbox, paginated)       |
| My Training Assignments (self-service view)          |
+------------------------------------------------------+

API Layer
  GET  /compliance-notifications/kpis              <- KPI Bar
  GET  /compliance-notifications/report            <- Report View
  GET  /compliance-notifications                   <- Admin Log Table
  GET  /compliance-notifications/{id}              <- Detail View
  POST /compliance-notifications/send              <- Single Send
  POST /compliance-notifications/evaluate          <- Bulk Evaluate
  POST /compliance-notifications/{id}/resend       <- Resend button
  POST /compliance-notifications/{id}/escalate     <- Escalate button
  GET  /compliance-notifications/my-notifications  <- Employee Inbox
  POST /api/v1/compliance-training/assign          <- Assign Training
  PATCH /api/v1/compliance-training/complete/{id}  <- Mark Complete
  GET  /api/v1/compliance-training/report          <- Training Report
  GET  /api/v1/compliance-training/user/{userId}   <- Employee View
```

---

## 2. API Endpoints Reference

### Compliance Notifications

| #   | Method | Endpoint                                   | Purpose                                                             |
| --- | ------ | ------------------------------------------ | ------------------------------------------------------------------- |
| 1   | GET    | /compliance-notifications/kpis             | Aggregate compliance and delivery KPIs                              |
| 2   | GET    | /compliance-notifications/report           | Full report: KPIs + notifications + per-recipient + escalated cases |
| 3   | GET    | /compliance-notifications                  | Paginated admin notification log with filters                       |
| 4   | GET    | /compliance-notifications/{id}             | Single notification detail                                          |
| 5   | POST   | /compliance-notifications/send             | Manually send to one user                                           |
| 6   | POST   | /compliance-notifications/evaluate         | Auto-evaluate and bulk notify                                       |
| 7   | POST   | /compliance-notifications/{id}/resend      | Retry a failed notification                                         |
| 8   | POST   | /compliance-notifications/{id}/escalate    | Escalate a non-compliant case                                       |
| 9   | GET    | /compliance-notifications/my-notifications | Employee's own compliance notifications                             |

### Compliance Training Assignments

| #   | Method | Endpoint                                            | Purpose                                   |
| --- | ------ | --------------------------------------------------- | ----------------------------------------- |
| 10  | POST   | /api/v1/compliance-training/assign                  | Assign a compliance course to an employee |
| 11  | PATCH  | /api/v1/compliance-training/complete/{assignmentId} | Record training completion                |
| 12  | GET    | /api/v1/compliance-training/report                  | Training assignment report with KPIs      |
| 13  | GET    | /api/v1/compliance-training/user/{userId}           | All training assignments for one employee |

---

## 3. UI Sections and API Mapping

### 3.1 KPI Dashboard Bar

**Endpoint:** `GET /compliance-notifications/kpis`
**Trigger:** On page load. No parameters — returns system-wide totals.

#### Cards Displayed

| Card                       | Field                           | Format   | Description                                      |
| -------------------------- | ------------------------------- | -------- | ------------------------------------------------ |
| Total Notifications        | total_notifications             | Integer  | All compliance notification records              |
| Compliant Users            | compliant_count                 | Integer  | Users with compliant status                      |
| Non-Compliant Users        | non_compliant_count             | Integer  | Users flagged non-compliant                      |
| Overdue                    | overdue_count                   | Integer  | Assignments past due — red if > 0                |
| Escalated Cases            | escalated_count                 | Integer  | escalationFlag: true — red if > 0                |
| Delivery Success           | delivery_success_count          | Integer  | Successfully sent notifications                  |
| Delivery Failed            | delivery_failed_count           | Integer  | Failed attempts — amber if > 0                   |
| Compliance Rate            | compliance_rate_percent         | XX%      | (compliant / total) x 100                        |
| On-Time Completion         | on_time_completion_rate_percent | XX%      | Completions on/before due date / total compliant |
| Delivery Success Rate      | delivery_success_rate_percent   | XX%      | (Sent / (Sent + Failed)) x 100                   |
| Escalation Rate            | escalation_rate_percent         | XX%      | (escalated / non_compliant) x 100                |
| Avg Days to Compliance     | avg_days_to_compliance          | X.X days | Mean days between due date and completion        |
| Compliance Completion Rate | complianceCompletionRate        | XX%      | % of employees who completed assigned training   |
| Non-Compliance Ratio       | nonComplianceRatio              | XX%      | % who have not completed mandatory training      |

#### Breakdown Chips

| Section    | Field                | Display                                                                  |
| ---------- | -------------------- | ------------------------------------------------------------------------ |
| By Type    | by_notification_type | Chip per type: Reminder, Warning, Final Notice, Confirmation, Escalation |
| By Channel | by_channel           | Chip per channel: Email, In-App, Both                                    |

#### Sample Request

```
GET /compliance-notifications/kpis
Authorization: Bearer <token>
```

#### Sample Response (200 OK)

```json
{
  "success": true,
  "data": {
    "total_notifications": 120,
    "compliant_count": 85,
    "non_compliant_count": 35,
    "overdue_count": 18,
    "escalated_count": 6,
    "delivery_success_count": 115,
    "delivery_failed_count": 5,
    "compliance_rate_percent": 70.8,
    "on_time_completion_rate_percent": 82.4,
    "delivery_success_rate_percent": 95.8,
    "escalation_rate_percent": 17.1,
    "avg_days_to_compliance": 4.3,
    "by_notification_type": {
      "Reminder": 45,
      "Warning": 30,
      "Final Notice": 20,
      "Confirmation": 18,
      "Escalation": 7
    },
    "by_channel": { "Email": 80, "In-App": 25, "Both": 15 },
    "complianceCompletionRate": 71,
    "overdueCount": 18,
    "nonComplianceRatio": 29
  }
}
```

#### Rendering Rules

- compliance_rate_percent < 70% -> amber; < 50% -> red
- overdue_count > 0 -> orange badge
- escalated_count > 0 -> red badge
- delivery_failed_count > 0 -> amber badge
- All cards show skeleton placeholders while loading

---

### 3.2 Admin Notification Log Table

**Endpoint:** `GET /compliance-notifications`
**Trigger:** On page load, on any filter change, and on pagination navigation.

#### Filter Controls

| Control           | Query Param              | Allowed Values                                            |
| ----------------- | ------------------------ | --------------------------------------------------------- |
| Compliance Status | complianceStatus         | Compliant, Non-Compliant                                  |
| Completion Status | completionStatus         | Completed, Incomplete, Overdue, Failed, In Progress       |
| Notification Type | notificationType         | Reminder, Warning, Final Notice, Confirmation, Escalation |
| Delivery Status   | deliveryStatus           | Sent, Failed                                              |
| Entity Type       | entityType               | Course, Exam                                              |
| Recipient         | recipientId (UUID)       | Student/employee search                                   |
| Escalated Only    | escalationFlag (boolean) | Toggle: show only escalated                               |
| Start Date        | startDate (YYYY-MM-DD)   | Notifications sent on or after                            |
| End Date          | endDate (YYYY-MM-DD)     | Notifications sent on or before                           |

#### Table Columns

| Column            | Field                                    | Notes                                            |
| ----------------- | ---------------------------------------- | ------------------------------------------------ |
| Recipient         | recipient.firstName + recipient.lastName | —                                                |
| Course / Exam     | entityTitle                              | —                                                |
| Entity Type       | entityType                               | Badge: Course (blue) / Exam (purple)             |
| Compliance Status | complianceStatus                         | Badge: green / red                               |
| Completion Status | completionStatus                         | Colored badge — see Section 9                    |
| Notification Type | notificationType                         | Tiered urgency badge                             |
| Channel           | notificationChannel                      | Email / In-App / Both                            |
| Delivery Status   | deliveryStatus                           | Green (Sent) / Red (Failed)                      |
| Sent At           | sentAt                                   | Formatted datetime                               |
| Due Date          | dueDate                                  | Red if past today                                |
| Reminder Count    | reminderCount                            | Shows repeat attempts                            |
| Escalated         | escalationFlag                           | Warning icon if true                             |
| Actions           | —                                        | Resend (if Failed) · Escalate (if Non-Compliant) |

#### Sample Request

```
GET /compliance-notifications
  ?complianceStatus=Non-Compliant
  &completionStatus=Overdue
  &entityType=Course
  &page=1&limit=20
Authorization: Bearer <token>
```

#### Sample Response (200 OK)

```json
{
  "success": true,
  "data": {
    "total": 18,
    "page": 1,
    "totalPages": 1,
    "data": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "recipientId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
        "entityType": "Course",
        "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
        "examId": null,
        "entityTitle": "Workplace Ethics",
        "complianceStatus": "Non-Compliant",
        "completionStatus": "Overdue",
        "dueDate": "2026-04-30T00:00:00Z",
        "completionDate": null,
        "notificationType": "Final Notice",
        "notificationChannel": "Email",
        "sentBy": null,
        "deliveryStatus": "Sent",
        "reminderCount": 2,
        "escalationFlag": false,
        "remarks": null,
        "templateUsed": "Standard Compliance",
        "failureReason": null,
        "sentAt": "2026-05-01T09:00:00Z",
        "recipient": {
          "id": "...",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com"
        },
        "course": { "id": "...", "title": "Workplace Ethics" },
        "exam": null,
        "createdAt": "2026-05-01T09:00:00Z"
      }
    ]
  }
}
```

---

### 3.3 Notification Detail View

**Endpoint:** `GET /compliance-notifications/{id}`
**Trigger:** User clicks a row in the admin log table.
**Path param:** id — notification UUID

#### Content Rendered

| Label               | Field                                    | Notes                               |
| ------------------- | ---------------------------------------- | ----------------------------------- |
| Notification ID     | id                                       | Full UUID                           |
| Recipient Name      | recipient.firstName + recipient.lastName | —                                   |
| Recipient Email     | recipient.email                          | —                                   |
| Entity Type         | entityType                               | Course or Exam badge                |
| Course / Exam Title | entityTitle                              | —                                   |
| Compliance Status   | complianceStatus                         | Colored badge                       |
| Completion Status   | completionStatus                         | Colored badge                       |
| Due Date            | dueDate                                  | Red if past today                   |
| Completion Date     | completionDate                           | — if null                           |
| Notification Type   | notificationType                         | Urgency badge                       |
| Channel             | notificationChannel                      | —                                   |
| Sent By             | sentBy                                   | "System" if null; admin name if set |
| Delivery Status     | deliveryStatus                           | Badge                               |
| Failure Reason      | failureReason                            | Red text if not null                |
| Sent At             | sentAt                                   | Formatted datetime                  |
| Reminder Count      | reminderCount                            | Retry history                       |
| Escalated           | escalationFlag                           | Warning banner if true              |
| Template Used       | templateUsed                             | —                                   |
| Remarks             | remarks                                  | Admin notes                         |

**Conditional action buttons:**

- Resend button: shown only when deliveryStatus === "Failed"
- Escalate button: shown only when complianceStatus === "Non-Compliant" AND escalationFlag === false

#### Response Codes

| Code | UI Behavior                                    |
| ---- | ---------------------------------------------- |
| 200  | Render detail panel                            |
| 401  | Redirect to login                              |
| 403  | Show "Access denied"                           |
| 404  | Show "Notification not found" with Back button |
| 500  | Show error banner with Retry                   |

---

### 3.4 Full Compliance Report View

**Endpoint:** `GET /compliance-notifications/report`
**Trigger:** On report tab load and when date range filter changes.

#### Filter Controls

| Control    | Query Param             | Description                |
| ---------- | ----------------------- | -------------------------- |
| Start Date | start_date (YYYY-MM-DD) | Notifications on or after  |
| End Date   | end_date (YYYY-MM-DD)   | Notifications on or before |

#### Report Sections Rendered

**Section 1 — KPI Summary**
Uses data.kpis — same fields as KPI Dashboard Bar (Section 3.1), scoped to the selected date range.

**Section 2 — Notifications (up to 100)**
Uses data.notifications[] — read-only table of recent notifications within the date range.
Columns: Recipient, Entity, Compliance Status, Notification Type, Channel, Delivery Status, Sent At, Escalated.

**Section 3 — Per-Recipient Compliance Summary (top 20 by volume)**
Uses data.recipient_compliance_summary[] — shows which users received the most notifications, their compliance status, and reminder counts.

**Section 4 — Escalated Cases**
Uses data.escalated_cases[] — all notifications where escalationFlag: true. Gives compliance officers a consolidated view of all unresolved escalations.

#### Sample Request

```
GET /compliance-notifications/report?start_date=2026-01-01&end_date=2026-03-31
Authorization: Bearer <token>
```

#### Sample Response Structure (200 OK)

```json
{
  "success": true,
  "data": {
    "kpis": { ... },
    "notifications": [ ... ],
    "recipient_compliance_summary": [ ... ],
    "escalated_cases": [ ... ]
  }
}
```

---

### 3.5 Send Notification — Single User

**Endpoint:** `POST /compliance-notifications/send`
**Trigger:** Admin fills in the form and clicks Send.

The backend automatically derives complianceStatus and completionStatus from existing training assignment records. Admins do not enter these manually.

#### Form Fields

| Field               | Type   | Required    | Allowed Values                                            | Description                        |
| ------------------- | ------ | ----------- | --------------------------------------------------------- | ---------------------------------- |
| recipientId         | UUID   | Yes         | —                                                         | User to notify                     |
| entityType          | string | Yes         | Course, Exam                                              | Course or exam notification        |
| courseId            | UUID   | Conditional | —                                                         | Required when entityType is Course |
| examId              | UUID   | Conditional | —                                                         | Required when entityType is Exam   |
| notificationType    | string | Yes         | Reminder, Warning, Final Notice, Confirmation, Escalation | Message urgency                    |
| notificationChannel | string | No          | Email, In-App, Both                                       | Delivery channel                   |
| remarks             | string | No          | —                                                         | Admin notes                        |
| templateUsed        | string | No          | —                                                         | Template identifier                |

#### Sample Request

```json
POST /compliance-notifications/send

{
  "recipientId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
  "entityType": "Course",
  "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
  "notificationType": "Warning",
  "notificationChannel": "Email",
  "remarks": "Second warning — due date in 2 days."
}
```

Returns the full Notification Object on 201 Created.

#### Response Codes

| Code | UI Behavior                                                            |
| ---- | ---------------------------------------------------------------------- |
| 201  | Toast: "Notification sent to [Name]." Optionally prepend to log table. |
| 400  | Inline form validation error                                           |
| 403  | Access denied                                                          |
| 404  | "Recipient or course/exam not found."                                  |
| 500  | Error banner with Retry                                                |

---

### 3.6 Auto-Evaluate and Bulk Notify

**Endpoint:** `POST /compliance-notifications/evaluate`
**Trigger:** Admin configures evaluation parameters and clicks Run Evaluation.

Scans all complianceTrainingAssignment records (Courses) or standAloneExaminationParticipant records (Exams), automatically determines the correct notification type for each user, and dispatches notifications in bulk.

#### Configuration Fields

| Field               | Type    | Required | Description                                               |
| ------------------- | ------- | -------- | --------------------------------------------------------- |
| entityType          | string  | No       | Course or Exam; both evaluated if omitted                 |
| notificationChannel | string  | No       | Email, In-App, or Both                                    |
| daysAhead           | integer | No       | Days before due date to start notifying; 0 = overdue only |
| escalateAfterDays   | integer | No       | Days overdue before automatic escalation                  |
| templateUsed        | string  | No       | Template identifier                                       |

#### Sample Request

```json
POST /compliance-notifications/evaluate

{
  "entityType": "Course",
  "notificationChannel": "Both",
  "daysAhead": 7,
  "escalateAfterDays": 14
}
```

#### Sample Response (201 Created)

```json
{
  "success": true,
  "message": "Compliance evaluation complete",
  "data": {
    "total": 98,
    "sent": 90,
    "failed": 4,
    "skipped": 4,
    "notificationIds": ["uuid1", "uuid2", "..."]
  }
}
```

**UI behavior after evaluate:**

- Show banner: "90 sent, 4 failed, 4 skipped out of 98 evaluated."
- If failed > 0: show link "View failed notifications" pre-filtered to deliveryStatus=Failed
- skipped = users whose due date is far enough away that no notification is warranted yet

---

### 3.7 Resend a Failed Notification

**Endpoint:** `POST /compliance-notifications/{id}/resend`
**Trigger:** Admin clicks Resend on a Failed row or in the detail panel.
**Path param:** id — notification UUID. No request body.

Retries delivery and increments reminderCount by 1.

#### Sample Request

```
POST /compliance-notifications/3fa85f64-5717-4562-b3fc-2c963f66afa6/resend
Authorization: Bearer <token>
```

Returns the full updated Notification Object.

#### Response Codes

| Code | UI Behavior                                                                                 |
| ---- | ------------------------------------------------------------------------------------------- |
| 200  | Update delivery status badge; toast "Notification resent."; hide Resend if no longer Failed |
| 400  | "This notification cannot be resent."                                                       |
| 404  | "Notification not found."                                                                   |

---

### 3.8 Escalate a Non-Compliant Case

**Endpoint:** `POST /compliance-notifications/{id}/escalate`
**Trigger:** Admin clicks Escalate on a Non-Compliant row or in the detail panel.

Sets escalationFlag: true, changes notificationType to Escalation, increments reminderCount, and resends.

#### Request Body

| Field   | Type   | Required | Description           |
| ------- | ------ | -------- | --------------------- |
| remarks | string | No       | Reason for escalation |

#### Sample Request

```json
POST /compliance-notifications/3fa85f64-5717-4562-b3fc-2c963f66afa6/escalate

{
  "remarks": "14 days overdue — escalating to department head."
}
```

Returns the full updated Notification Object with escalationFlag: true and notificationType: "Escalation".

#### Response Codes

| Code | UI Behavior                                                                   |
| ---- | ----------------------------------------------------------------------------- |
| 200  | Warning icon on row; type badge changes to Escalation; Escalate button hidden |
| 400  | "Only Non-Compliant notifications can be escalated."                          |
| 404  | "Notification not found."                                                     |

---

### 3.9 Compliance Training Assignment

**Endpoint:** `POST /api/v1/compliance-training/assign`
**Role:** Admin or Super Admin only

Assigns a course as mandatory or optional compliance training to an employee with a due date. Only one assignment per employee per course is allowed.

#### Form Fields

| Field        | Type              | Required | Description                     |
| ------------ | ----------------- | -------- | ------------------------------- |
| userId       | UUID              | Yes      | Employee to assign training to  |
| courseId     | UUID              | Yes      | The compliance course           |
| assignedDate | date (YYYY-MM-DD) | Yes      | Assignment effective date       |
| dueDate      | date (YYYY-MM-DD) | Yes      | Completion deadline             |
| trainingType | string            | No       | Mandatory (default) or Optional |
| notes        | string            | No       | Admin notes                     |

#### Sample Request

```json
POST /api/v1/compliance-training/assign

{
  "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
  "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
  "assignedDate": "2026-01-15",
  "dueDate": "2026-03-15",
  "trainingType": "Mandatory",
  "notes": "Required for annual data privacy compliance."
}
```

#### Sample Response (201 Created)

```json
{
  "success": true,
  "message": "Training assigned successfully",
  "data": {
    "id": "assignment-uuid",
    "userId": "employee-uuid",
    "courseId": "course-uuid",
    "assignedBy": "admin-uuid",
    "assignedDate": "2026-01-15",
    "dueDate": "2026-03-15",
    "trainingType": "Mandatory",
    "status": "Pending",
    "overdueDays": 0,
    "completionDate": null,
    "score": null,
    "certificateIssued": false,
    "verifiedBy": null,
    "notes": "Required for annual data privacy compliance.",
    "employee": { ... },
    "course": { ... },
    "createdAt": "2026-01-15T08:00:00Z",
    "updatedAt": "2026-01-15T08:00:00Z"
  }
}
```

---

### 3.10 Mark Training as Completed

**Endpoint:** `PATCH /api/v1/compliance-training/complete/{assignmentId}`
**Trigger:** Admin clicks Mark as Complete on a training assignment row.
**Path param:** assignmentId — training assignment UUID

#### Form Fields

| Field             | Type              | Required | Description                                |
| ----------------- | ----------------- | -------- | ------------------------------------------ |
| completionDate    | date (YYYY-MM-DD) | Yes      | Date training was completed                |
| score             | integer           | No       | Score achieved                             |
| certificateIssued | boolean           | No       | Whether a certificate was issued           |
| verifiedBy        | UUID              | No       | Compliance officer who verified completion |

#### Sample Request

```json
PATCH /api/v1/compliance-training/complete/assignment-uuid

{
  "completionDate": "2026-03-10",
  "score": 88,
  "certificateIssued": true,
  "verifiedBy": "3fa85f64-5717-4562-b3fc-2c963f66afb1"
}
```

After completion, the assignment status changes to Completed and overdueDays becomes 0. A Confirmation notification can then be sent via POST /compliance-notifications/send with notificationType: "Confirmation".

---

### 3.11 Training Assignment Report

**Endpoint:** `GET /api/v1/compliance-training/report`
**Role:** Admin or Super Admin

#### Filter Controls

| Filter        | Query Param            | Description                 |
| ------------- | ---------------------- | --------------------------- |
| Department    | departmentId (UUID)    | Scope to one department     |
| Course        | courseId (UUID)        | Scope to one course         |
| Employee      | userId (UUID)          | Scope to one employee       |
| Status        | status                 | Pending, Completed, Overdue |
| Training Type | trainingType           | Mandatory, Optional         |
| Start Date    | startDate (YYYY-MM-DD) | Assigned on or after        |
| End Date      | endDate (YYYY-MM-DD)   | Assigned on or before       |

#### Sample Request

```
GET /api/v1/compliance-training/report
  ?status=Overdue&trainingType=Mandatory
  &startDate=2026-01-01&endDate=2026-03-31
Authorization: Bearer <token>
```

#### Sample Response Structure (200 OK)

```json
{
  "success": true,
  "message": "Report generated",
  "data": {
    "records": [ ... ],
    "kpis": {
      "complianceCompletionRate": 71,
      "overdueCount": 18,
      "nonComplianceRatio": 29
    }
  }
}
```

Assignment status is computed dynamically on every response — it is not stored in the database:

- Completed: completionDate is set
- Overdue: today > dueDate and no completionDate
- Pending: otherwise

---

### 3.12 Employee Training View (Self-Service)

**Endpoint:** `GET /api/v1/compliance-training/user/{userId}`
**Access:** Any authenticated user can view their own; admins can view any employee's.

Returns all training assignments for the specified employee with computed status and overdueDays.

---

### 3.13 My Notifications (Student / Employee View)

**Endpoint:** `GET /compliance-notifications/my-notifications`
**Trigger:** On load and on filter change. Backend scopes to the authenticated user — no recipientId is sent by the UI.

#### Filter Controls

| Control           | Query Param      | Allowed Values                                            |
| ----------------- | ---------------- | --------------------------------------------------------- |
| Compliance Status | complianceStatus | Compliant, Non-Compliant                                  |
| Notification Type | notificationType | Reminder, Warning, Final Notice, Confirmation, Escalation |
| Page              | page             | Integer (default 1)                                       |
| Limit             | limit            | Integer (default 20)                                      |

#### List Columns

| Field            | Display Notes                                         |
| ---------------- | ----------------------------------------------------- |
| entityTitle      | Course or exam name                                   |
| entityType       | Badge                                                 |
| complianceStatus | Colored badge                                         |
| completionStatus | Colored badge                                         |
| notificationType | Warning / Final Notice highlighted prominently        |
| dueDate          | Red if past today                                     |
| sentAt           | Relative time or formatted date                       |
| deliveryStatus   | Shown in red if Failed — prompt user to contact admin |

---

## 4. Complete Step-by-Step Workflows

### 4.1 Admin Assigns Training and Auto-Evaluates Compliance

```
1. Admin assigns training to an employee
   -> POST /api/v1/compliance-training/assign
      Body: { userId, courseId, assignedDate, dueDate, trainingType: "Mandatory" }
   <- 201: assignment created with status "Pending"

2. Days pass — admin opens Evaluate & Notify panel, configures:
   - entityType: "Course"
   - daysAhead: 7        (notify users with < 7 days left)
   - escalateAfterDays: 14 (auto-escalate if 14+ days overdue)
   - notificationChannel: "Both"

3. Admin clicks Run Evaluation
   -> POST /compliance-notifications/evaluate
      Body: { entityType: "Course", notificationChannel: "Both",
              daysAhead: 7, escalateAfterDays: 14 }
   <- 201: { total: 98, sent: 90, failed: 4, skipped: 4 }

4. Results banner: "90 sent, 4 failed, 4 skipped — 3 cases auto-escalated"

5. Admin clicks "View failed notifications"
   -> GET /compliance-notifications?deliveryStatus=Failed
   <- Table pre-filtered to 4 failed rows

6. Admin resends each failed notification
   -> POST /compliance-notifications/{id}/resend (one per failed record)

7. KPI bar refreshes
   -> GET /compliance-notifications/kpis
```

---

### 4.2 Admin Manually Sends a Single Notification

```
1. Admin opens Send Notification form

2. Admin fills in:
   - recipientId: employee UUID
   - entityType: "Course"
   - courseId: course UUID
   - notificationType: "Final Notice"
   - notificationChannel: "Email"
   - remarks: "Third notice — action required by end of day Friday."

3. Admin clicks Send
   -> POST /compliance-notifications/send
   <- 201: full notification object returned

4. Toast: "Notification sent to John Doe"
   New row prepended to log table
```

---

### 4.3 Admin Escalates an Overdue Non-Compliant Case

```
1. Admin filters log table to overdue, non-compliant, non-escalated
   -> GET /compliance-notifications
      ?complianceStatus=Non-Compliant&completionStatus=Overdue&escalationFlag=false

2. Admin clicks a row -> detail panel opens
   -> GET /compliance-notifications/{id}

3. Admin reviews reminderCount (e.g., 3 previous reminders)
   Clicks Escalate, enters:
   "21 days overdue — escalating to department head."

4. Admin confirms
   -> POST /compliance-notifications/{id}/escalate
      Body: { remarks: "21 days overdue — escalating to department head." }
   <- 200: escalationFlag: true, notificationType: "Escalation"

5. Row updates: warning icon appears, type badge -> Escalation
   Escalate button disappears
```

---

### 4.4 Admin Monitors via Reports and KPIs

```
1. Admin opens Report tab, sets date range
   -> GET /compliance-notifications/report
      ?start_date=2026-01-01&end_date=2026-03-31
   <- { kpis, notifications (up to 100), recipient_compliance_summary, escalated_cases }

2. Reviews KPI summary: compliance rate, overdue count, escalation rate

3. Reviews recent notifications table for operational detail

4. Reviews escalated_cases section for unresolved cases

5. Cross-references with training report
   -> GET /api/v1/compliance-training/report
      ?status=Overdue&trainingType=Mandatory
   <- { records, kpis: { complianceCompletionRate, overdueCount, nonComplianceRatio } }
```

---

### 4.5 Employee Views Their Own Notifications

```
1. Employee opens compliance inbox
   -> GET /compliance-notifications/my-notifications?page=1&limit=20
   <- Notifications scoped to this user

2. Employee sees "Final Notice" badge for "Workplace Ethics" course
   Due date is red — past today

3. Employee completes the course in the LMS

4. Admin records completion
   -> PATCH /api/v1/compliance-training/complete/{assignmentId}
      Body: { completionDate: "2026-05-20", score: 91, certificateIssued: true }

5. Admin sends Confirmation notification
   -> POST /compliance-notifications/send
      Body: { recipientId, entityType: "Course", courseId,
              notificationType: "Confirmation", notificationChannel: "In-App" }

6. Employee's inbox now shows Confirmation badge — case resolved
```

---

## 5. Request and Response Structures

### POST /compliance-notifications/send — Request Body

| Field               | Type   | Required    | Allowed Values                                            |
| ------------------- | ------ | ----------- | --------------------------------------------------------- |
| recipientId         | UUID   | Yes         | —                                                         |
| entityType          | string | Yes         | Course, Exam                                              |
| courseId            | UUID   | Conditional | Required when entityType is Course                        |
| examId              | UUID   | Conditional | Required when entityType is Exam                          |
| notificationType    | string | Yes         | Reminder, Warning, Final Notice, Confirmation, Escalation |
| notificationChannel | string | No          | Email, In-App, Both                                       |
| remarks             | string | No          | —                                                         |
| templateUsed        | string | No          | —                                                         |

### POST /compliance-notifications/evaluate — Request Body

| Field               | Type    | Required | Description                                      |
| ------------------- | ------- | -------- | ------------------------------------------------ |
| entityType          | string  | No       | Course or Exam; both if omitted                  |
| notificationChannel | string  | No       | Email, In-App, Both                              |
| daysAhead           | integer | No       | Days before due date to notify; 0 = overdue only |
| escalateAfterDays   | integer | No       | Days overdue before auto-escalation              |
| templateUsed        | string  | No       | Template identifier                              |

### POST /api/v1/compliance-training/assign — Request Body

| Field        | Type   | Required | Description           |
| ------------ | ------ | -------- | --------------------- |
| userId       | UUID   | Yes      | Employee              |
| courseId     | UUID   | Yes      | Compliance course     |
| assignedDate | date   | Yes      | YYYY-MM-DD            |
| dueDate      | date   | Yes      | YYYY-MM-DD            |
| trainingType | string | No       | Mandatory or Optional |
| notes        | string | No       | Admin notes           |

### GET /compliance-notifications — Query Parameters

| Parameter        | Type    | Default | Description                                         |
| ---------------- | ------- | ------- | --------------------------------------------------- |
| complianceStatus | string  | —       | Compliant or Non-Compliant                          |
| completionStatus | string  | —       | Completed, Incomplete, Overdue, Failed, In Progress |
| notificationType | string  | —       | Notification tier                                   |
| deliveryStatus   | string  | —       | Sent or Failed                                      |
| entityType       | string  | —       | Course or Exam                                      |
| recipientId      | UUID    | —       | Filter to one user                                  |
| escalationFlag   | boolean | —       | true = escalated cases only                         |
| startDate        | date    | —       | YYYY-MM-DD                                          |
| endDate          | date    | —       | YYYY-MM-DD                                          |
| page             | integer | 1       | —                                                   |
| limit            | integer | 20      | —                                                   |

### Standard Response Envelope

```json
{ "success": true, "data": { ... } }
{ "success": false, "message": "Error description" }
```

---

## 6. Notification Object — Full Field Reference

All notification endpoints return this object shape.

| Field               | Type             | Description                                                  |
| ------------------- | ---------------- | ------------------------------------------------------------ |
| id                  | UUID             | Unique notification identifier                               |
| recipientId         | UUID             | User receiving the notification                              |
| entityType          | string           | Course or Exam                                               |
| courseId            | UUID or null     | Linked course; null for exam notifications                   |
| examId              | UUID or null     | Linked exam; null for course notifications                   |
| entityTitle         | string           | Denormalized course or exam title                            |
| complianceStatus    | string           | Compliant or Non-Compliant — derived from assignment records |
| completionStatus    | string           | Completed, Incomplete, Overdue, Failed, In Progress          |
| dueDate             | ISO 8601 or null | Compliance completion deadline                               |
| completionDate      | ISO 8601 or null | Date user actually completed the course/exam                 |
| notificationType    | string           | Reminder, Warning, Final Notice, Confirmation, Escalation    |
| notificationChannel | string           | Email, In-App, Both                                          |
| sentBy              | UUID or null     | Admin user ID; null = system-generated                       |
| deliveryStatus      | string           | Sent or Failed                                               |
| reminderCount       | integer          | Total reminder/resend attempts on this notification          |
| escalationFlag      | boolean          | true = case has been escalated                               |
| remarks             | string or null   | Admin notes                                                  |
| templateUsed        | string           | Notification template identifier                             |
| failureReason       | string or null   | Reason for failed delivery                                   |
| sentAt              | ISO 8601 or null | Dispatch timestamp                                           |
| recipient           | object           | { id, firstName, lastName, email }                           |
| course              | object or null   | { id, title } — null for exam notifications                  |
| exam                | object or null   | { id, title } — null for course notifications                |
| createdAt           | ISO 8601         | Record creation timestamp                                    |

---

## 7. Training Assignment Object — Full Field Reference

| Field             | Type            | Description                                           |
| ----------------- | --------------- | ----------------------------------------------------- |
| id                | UUID            | Assignment identifier                                 |
| userId            | UUID            | Employee assigned the training                        |
| courseId          | UUID            | Compliance course                                     |
| assignedBy        | UUID            | Admin who created the assignment                      |
| assignedDate      | date            | Assignment effective date                             |
| dueDate           | date            | Completion deadline                                   |
| trainingType      | string          | Mandatory or Optional                                 |
| status            | string          | Pending, Completed, or Overdue — computed, not stored |
| overdueDays       | integer         | Days past due date; 0 if not overdue                  |
| completionDate    | date or null    | Date training was completed                           |
| score             | integer or null | Score achieved                                        |
| certificateIssued | boolean         | Whether a certificate was issued                      |
| verifiedBy        | UUID or null    | Compliance officer who verified                       |
| notes             | string or null  | Admin notes                                           |
| employee          | object          | Linked employee details                               |
| course            | object          | Linked course details                                 |
| createdAt         | ISO 8601        | Record creation timestamp                             |
| updatedAt         | ISO 8601        | Last update timestamp                                 |

Status computation rule (not persisted in database):

- Completed: completionDate is set
- Overdue: today > dueDate AND no completionDate
- Pending: otherwise

---

## 8. KPI Definitions

| KPI                        | Formula                                                  | Endpoint                |
| -------------------------- | -------------------------------------------------------- | ----------------------- |
| Compliance Rate            | compliant_count / total_notifications x 100              | /kpis                   |
| On-Time Completion Rate    | Completions on/before dueDate / total compliant x 100    | /kpis                   |
| Delivery Success Rate      | delivery_success_count / (success + failed) x 100        | /kpis                   |
| Escalation Rate            | escalated_count / non_compliant_count x 100              | /kpis                   |
| Avg Days to Compliance     | Mean of (completionDate - dueDate) for compliant records | /kpis                   |
| Compliance Completion Rate | % of employees who completed assigned training           | /kpis, /training/report |
| Non-Compliance Ratio       | % who have not completed mandatory training              | /kpis, /training/report |
| Overdue Count              | Assignments past dueDate with no completionDate          | /kpis, /training/report |

---

## 9. Status and Enum Values

### complianceStatus — Badge Colors

| Value         | Color | Meaning                                     |
| ------------- | ----- | ------------------------------------------- |
| Compliant     | Green | User completed within requirements          |
| Non-Compliant | Red   | User has not met the completion requirement |

### completionStatus — Badge Colors

| Value       | Color    | Meaning                          |
| ----------- | -------- | -------------------------------- |
| Completed   | Green    | Course/exam finished             |
| In Progress | Blue     | Started but not finished         |
| Incomplete  | Amber    | Not started or partial           |
| Overdue     | Red      | Past due date without completion |
| Failed      | Dark Red | Exam or assessment failed        |

### notificationType — Badge Colors and Auto-Select Logic

| Value        | Color  | When Applied                                           |
| ------------ | ------ | ------------------------------------------------------ |
| Reminder     | Blue   | Due date > 3 days away                                 |
| Warning      | Amber  | Due date 1–3 days away                                 |
| Final Notice | Orange | Due date is tomorrow or has just passed                |
| Confirmation | Green  | User completed — now compliant                         |
| Escalation   | Red    | Set manually or auto-triggered after escalateAfterDays |

### notificationChannel

| Value  | Meaning                         |
| ------ | ------------------------------- |
| Email  | Sent to user's registered email |
| In-App | In-platform notification only   |
| Both   | Sent via both Email and In-App  |

### trainingType (Assignment)

| Value     | Meaning                                              |
| --------- | ---------------------------------------------------- |
| Mandatory | Must be completed; triggers non-compliance if missed |
| Optional  | Recommended but not required for compliance          |

### Assignment status (Computed)

| Value     | Condition                           |
| --------- | ----------------------------------- |
| Pending   | No completionDate; today <= dueDate |
| Completed | completionDate is set               |
| Overdue   | No completionDate; today > dueDate  |

---

## 10. Notification Type Logic

The /evaluate endpoint auto-selects notificationType using this logic. Admins using /send should follow the same rules:

```
if completionDate is set:
  -> notificationType = "Confirmation"

else if today > dueDate + escalateAfterDays:
  -> notificationType = "Escalation"  AND  escalationFlag = true

else if today > dueDate:
  -> notificationType = "Final Notice"

else if daysUntilDue <= 3:
  -> notificationType = "Warning"

else if daysUntilDue <= daysAhead (configured threshold):
  -> notificationType = "Reminder"

else:
  -> skip (no notification sent — threshold not yet reached)
```

skipped in the evaluate response counts users whose due date is too far away for any notification to apply.

---

## 11. Validation Rules

### Client-Side

| Rule                    | Condition                                                                          | Message                                           |
| ----------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------- |
| Entity ID required      | entityType is Course and courseId is empty                                         | "Please select a course."                         |
| Entity ID required      | entityType is Exam and examId is empty                                             | "Please select an exam."                          |
| Resend button guard     | Render only when deliveryStatus === "Failed"                                       | Do not show for Sent notifications                |
| Escalate button guard   | Render only when complianceStatus === "Non-Compliant" AND escalationFlag === false | Hide for Compliant or already-escalated           |
| Date range completeness | One date provided without the other (start_date/end_date)                          | "Please provide both start and end dates."        |
| Date range order        | end_date before start_date                                                         | "End date must be on or after start date."        |
| Assignment due date     | dueDate must be after assignedDate                                                 | "Due date must be after the assigned date."       |
| daysAhead               | Must be a non-negative integer                                                     | "Days ahead must be 0 or greater."                |
| escalateAfterDays       | Must be a positive integer                                                         | "Escalation threshold must be a positive number." |
| Duplicate assignment    | One assignment per employee per course — server-side                               | Show 400 error from API response                  |

---

## 12. Error Handling

| HTTP Status     | Endpoint(s)                                   | UI Behavior                                                        |
| --------------- | --------------------------------------------- | ------------------------------------------------------------------ |
| 200 / 201       | All                                           | Show success feedback; refresh affected section                    |
| 400             | /send, /evaluate, /resend, /escalate, /assign | Show inline error from message field                               |
| 401             | All                                           | Clear session; redirect to login                                   |
| 403             | All admin endpoints                           | "You don't have permission to perform this action."                |
| 404             | /{id}, /send, /resend, /escalate              | "Not found" empty state or error toast                             |
| 500             | All                                           | Error banner: "Something went wrong. Please try again." with Retry |
| Network timeout | All                                           | Retry banner; preserve current filter/form state                   |

### Independent Error Boundaries

- KPI bar, log table, and report view each manage their own loading/error state independently.
- A failure in /kpis does not prevent the log table from loading.
- A failed resend or escalate call shows an error within the detail panel only — it does not close the panel or affect the table.
- The training assignment report and notification report are independent — a failure in one does not affect the other.
