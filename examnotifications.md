# TC05 – Instant Notification of Exam Schedules & Results

## Overview

The **Instant Notification Module** automatically informs students when exam schedules are published or when exam results are released. It supports three delivery channels (Email, SMS, System/in-app), tracks delivery status and student acknowledgment, and exposes KPI and report endpoints for administrators. Individual students can view and acknowledge their own notifications through a dedicated self-service view.

This document describes the complete end-to-end flow for both the **Admin UI** and the **Student UI**: how each section maps to its API endpoint, what is sent and received, how actions are triggered, and how validations and errors are handled.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [API Endpoints Reference](#2-api-endpoints-reference)
3. [User Roles & View Separation](#3-user-roles--view-separation)
4. [Admin UI — Sections and API Mapping](#4-admin-ui--sections-and-api-mapping)
   - [4.1 KPI Dashboard Bar](#41-kpi-dashboard-bar)
   - [4.2 Notification Log Table (Admin)](#42-notification-log-table-admin)
   - [4.3 Notification Detail View](#43-notification-detail-view)
   - [4.4 Report View](#44-report-view)
   - [4.5 Send Notification — Single Student](#45-send-notification--single-student)
   - [4.6 Bulk Notify Exam Participants](#46-bulk-notify-exam-participants)
   - [4.7 Resend Failed Notification](#47-resend-failed-notification)
5. [Student UI — Sections and API Mapping](#5-student-ui--sections-and-api-mapping)
   - [5.1 My Notifications List](#51-my-notifications-list)
   - [5.2 Mark as Read (Acknowledgment)](#52-mark-as-read-acknowledgment)
6. [Complete Step-by-Step User Flows](#6-complete-step-by-step-user-flows)
   - [6.1 Admin Flow — Bulk Notify on Exam Schedule Publish](#61-admin-flow--bulk-notify-on-exam-schedule-publish)
   - [6.2 Admin Flow — Send Single Notification Manually](#62-admin-flow--send-single-notification-manually)
   - [6.3 Admin Flow — Monitor and Resend Failed Notifications](#63-admin-flow--monitor-and-resend-failed-notifications)
   - [6.4 Student Flow — View and Acknowledge Notifications](#64-student-flow--view-and-acknowledge-notifications)
7. [Request & Response Structures](#7-request--response-structures)
8. [Notification Object — Full Field Reference](#8-notification-object--full-field-reference)
9. [KPI Definitions](#9-kpi-definitions)
10. [Status, Type & Channel Values](#10-status-type--channel-values)
11. [Validation Rules](#11-validation-rules)
12. [Error Handling](#12-error-handling)
13. [Pagination](#13-pagination)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            ADMIN UI                                         │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  KPI Dashboard Bar                                                  │    │
│  │  success rate · failed rate · acknowledgment rate · avg proc. time │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌──────────────────────────┐   ┌──────────────────────────────────────┐    │
│  │  Notification Log Table  │   │  Report View                         │    │
│  │  (filterable, paginated) │   │  KPIs + recent + per-recipient       │    │
│  │      │ click row         │   │  + per-exam summaries                │    │
│  │      ▼                   │   └──────────────────────────────────────┘    │
│  │  Notification Detail     │                                               │
│  │  + Resend button         │   ┌──────────────────────────────────────┐    │
│  └──────────────────────────┘   │  Send / Bulk Notify Panel            │    │
│                                 │  (manual dispatch forms)             │    │
│                                 └──────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           STUDENT UI                                        │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  My Notifications List  (filterable, paginated)                     │    │
│  │      │ click / open notification                                    │    │
│  │      ▼                                                              │    │
│  │  Notification Detail  →  Mark as Read action                       │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           API Layer                                         │
│                                                                             │
│  GET    /exam-notifications/kpis              ◄── KPI Dashboard Bar        │
│  GET    /exam-notifications/report            ◄── Report View               │
│  GET    /exam-notifications                   ◄── Admin Log Table           │
│  GET    /exam-notifications/{id}              ◄── Detail View (both roles)  │
│  POST   /exam-notifications/send              ◄── Send Single Notification  │
│  POST   /exam-notifications/notify-exam       ◄── Bulk Notify Panel         │
│  POST   /exam-notifications/{id}/resend       ◄── Resend button             │
│  GET    /exam-notifications/my-notifications  ◄── Student Notifications     │
│  PUT    /exam-notifications/{id}/read         ◄── Mark as Read              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. API Endpoints Reference

| #   | Method | Endpoint                               | Role            | Purpose                                               |
| --- | ------ | -------------------------------------- | --------------- | ----------------------------------------------------- |
| 1   | `GET`  | `/exam-notifications/kpis`             | Admin           | Aggregate KPI bar metrics                             |
| 2   | `GET`  | `/exam-notifications/report`           | Admin           | Full report: KPIs + recent + per-recipient + per-exam |
| 3   | `GET`  | `/exam-notifications`                  | Admin           | Paginated notification log with filters               |
| 4   | `GET`  | `/exam-notifications/{id}`             | Admin / Student | Single notification detail                            |
| 5   | `POST` | `/exam-notifications/send`             | Admin           | Send notification to one student                      |
| 6   | `POST` | `/exam-notifications/notify-exam`      | Admin           | Bulk notify all participants of an exam               |
| 7   | `POST` | `/exam-notifications/{id}/resend`      | Admin           | Retry a failed notification                           |
| 8   | `GET`  | `/exam-notifications/my-notifications` | Student         | Student's own notification list                       |
| 9   | `PUT`  | `/exam-notifications/{id}/read`        | Student         | Mark notification as read                             |

---

## 3. User Roles & View Separation

| Role        | Accessible Endpoints                      | UI Views                                                                                 |
| ----------- | ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Admin**   | All endpoints                             | KPI bar, Log Table, Report View, Detail View, Send form, Bulk Notify form, Resend button |
| **Student** | `my-notifications`, `/{id}`, `/{id}/read` | My Notifications list, Notification detail, Mark as Read                                 |

Students must not see the Admin UI. Admins can view any notification via `/{id}`. A student calling `/{id}/read` for a notification that belongs to another student receives a `403 Forbidden`.

---

## 4. Admin UI — Sections and API Mapping

### 4.1 KPI Dashboard Bar

**Location:** Top of the Admin Notification Management page.

**API Endpoint:** `GET /exam-notifications/kpis`

**Trigger:** On page load. No parameters accepted — returns KPIs across all notifications in the system.

#### KPI Cards Displayed

| Card                  | Field                                 | Display Format | Description                                |
| --------------------- | ------------------------------------- | -------------- | ------------------------------------------ |
| Total Notifications   | `total_notifications`                 | Integer        | All notification records                   |
| Sent                  | `sent_count`                          | Integer        | Successfully delivered                     |
| Failed                | `failed_count`                        | Integer        | Failed delivery attempts                   |
| Read                  | `read_count`                          | Integer        | Notifications acknowledged by students     |
| Delivery Success Rate | `delivery_success_rate_percent`       | `XX%`          | `sent_count / total_notifications × 100`   |
| Failed Rate           | `failed_notification_rate_percent`    | `XX%`          | `failed_count / total_notifications × 100` |
| Acknowledgment Rate   | `student_acknowledgment_rate_percent` | `XX%`          | `read_count / sent_count × 100`            |
| Avg Processing Time   | `avg_processing_time_seconds`         | `X.Xs`         | Mean time from creation to dispatch        |

#### Breakdown Indicators

| Section    | Field                                                       | Display                                |
| ---------- | ----------------------------------------------------------- | -------------------------------------- |
| By Type    | `by_type.Schedule` / `by_type.Result`                       | Two stat chips showing counts per type |
| By Channel | `by_channel.Email` / `by_channel.SMS` / `by_channel.System` | Stat chips per channel                 |

#### Sample Request

```http
GET /exam-notifications/kpis
```

#### Sample Response (`200 OK`)

```json
{
  "total_notifications": 77,
  "sent_count": 70,
  "failed_count": 5,
  "read_count": 55,
  "delivery_success_rate_percent": 90.9,
  "failed_notification_rate_percent": 6.5,
  "student_acknowledgment_rate_percent": 78.6,
  "avg_processing_time_seconds": 2.4,
  "by_type": {
    "Schedule": 45,
    "Result": 32
  },
  "by_channel": {
    "Email": 50,
    "SMS": 0,
    "System": 27
  }
}
```

#### UI Rendering Rules

- `failed_notification_rate_percent` > 10% → card value renders in red with a warning icon.
- `student_acknowledgment_rate_percent` < 50% → renders in amber.
- `delivery_success_rate_percent` ≥ 95% → renders in green.
- While loading, each card shows a skeleton placeholder.
- This endpoint takes no filter parameters; the KPI bar always reflects system-wide totals. Date-scoped KPIs are available through the Report View (Section 4.4).

---

### 4.2 Notification Log Table (Admin)

**Location:** Main content area of the admin page, below the KPI bar.

**API Endpoint:** `GET /exam-notifications`

**Trigger:** On page load, on any filter change, and on pagination navigation.

#### Filter Controls

| Control           | Type                  | Maps To (Query Param)    | Description                           |
| ----------------- | --------------------- | ------------------------ | ------------------------------------- |
| Notification Type | Dropdown              | `notificationType`       | `Schedule` or `Result`                |
| Status            | Dropdown              | `status`                 | `Pending`, `Sent`, `Failed`           |
| Delivery Channel  | Dropdown              | `deliveryChannel`        | `Email`, `SMS`, `System`              |
| Recipient         | Student search / UUID | `recipientId`            | Filter to one student's notifications |
| Exam              | Exam search / UUID    | `examId`                 | Filter to one exam's notifications    |
| Sent By           | Dropdown              | `sentByType`             | `System` or `Admin`                   |
| Start Date        | Date picker           | `startDate` (YYYY-MM-DD) | Notification sent on or after         |
| End Date          | Date picker           | `endDate` (YYYY-MM-DD)   | Notification sent on or before        |

#### Table Columns

| Column          | Field                                        | Display Notes                                                         |
| --------------- | -------------------------------------------- | --------------------------------------------------------------------- |
| Notification ID | `id`                                         | Truncated UUID; full value in tooltip. Clickable — opens detail view. |
| Recipient       | `recipient.firstName` + `recipient.lastName` | —                                                                     |
| Exam            | `examTitle`                                  | —                                                                     |
| Type            | `notificationType`                           | Badge: Schedule (blue) / Result (purple)                              |
| Channel         | `deliveryChannel`                            | Badge: Email / SMS / System                                           |
| Sent By         | `sentByType`                                 | `System` or `Admin`                                                   |
| Status          | `status`                                     | Colored badge (see Section 10)                                        |
| Sent At         | `sentAt`                                     | Formatted: `May 20, 2026, 11:06 AM`                                   |
| Read At         | `readAt`                                     | `—` if null; formatted date if set                                    |
| Failure Reason  | `failureReason`                              | Show in amber tooltip icon if not null                                |
| Actions         | —                                            | **Resend** button (visible only when `status: "Failed"`)              |

#### Sample Request

```http
GET /exam-notifications
  ?notificationType=Schedule
  &status=Failed
  &startDate=2026-01-01
  &endDate=2026-03-31
  &page=1
  &limit=20
```

#### Sample Response (`200 OK`)

```json
{
  "total": 5,
  "page": 1,
  "totalPages": 1,
  "data": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "recipientId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
      "examId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
      "notificationType": "Schedule",
      "examTitle": "Microfinance Midterm",
      "examStartTime": "2026-06-15T09:00:00.000Z",
      "scoreInfo": null,
      "sentByType": "System",
      "status": "Failed",
      "deliveryChannel": "Email",
      "sentAt": "2026-05-20T11:06:59.324Z",
      "readAt": null,
      "failureReason": "Invalid email address",
      "recipient": {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "jane.doe@example.com"
      },
      "sender": {},
      "exam": {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
        "title": "Microfinance Midterm",
        "startTime": "2026-06-15T09:00:00.000Z",
        "duration": 90
      }
    }
  ]
}
```

---

### 4.3 Notification Detail View

**Location:** Opens as a side panel or full page when a row is clicked in the log table.

**API Endpoint:** `GET /exam-notifications/{id}`

**Trigger:** User clicks a notification row or ID in the admin log table.

#### Content Rendered

| Label                      | Field                                        | Notes                      |
| -------------------------- | -------------------------------------------- | -------------------------- |
| Notification ID            | `id`                                         | Full UUID                  |
| Recipient Name             | `recipient.firstName` + `recipient.lastName` | —                          |
| Recipient Email            | `recipient.email`                            | —                          |
| Exam                       | `exam.title`                                 | —                          |
| Exam Start Time            | `exam.startTime`                             | Formatted datetime         |
| Exam Duration              | `exam.duration`                              | In minutes                 |
| Notification Type          | `notificationType`                           | Badge                      |
| Delivery Channel           | `deliveryChannel`                            | Badge                      |
| Sent By                    | `sentByType`                                 | —                          |
| Status                     | `status`                                     | Colored badge              |
| Sent At                    | `sentAt`                                     | Formatted datetime         |
| Read At                    | `readAt`                                     | `Not yet read` if null     |
| Failure Reason             | `failureReason`                              | Rendered in red if present |
| Score (Result type only)   | `scoreInfo.score` / `scoreInfo.totalMarks`   | `XX / XX`                  |
| Grade (Result type only)   | `scoreInfo.grade`                            | —                          |
| Remarks (Result type only) | `scoreInfo.remarks`                          | —                          |

**Conditional display rule:** `scoreInfo` fields are shown only when `notificationType === "Result"`. When `notificationType === "Schedule"`, the score block is hidden entirely.

**Resend button** is shown in the detail panel when `status === "Failed"`. Clicking it calls `POST /exam-notifications/{id}/resend` (see Section 4.7).

#### Response Codes

| Code  | UI Behavior                                                |
| ----- | ---------------------------------------------------------- |
| `200` | Render detail panel                                        |
| `404` | Show "Notification not found" empty state with Back button |

---

### 4.4 Report View

**Location:** Accessible via a dedicated "Report" tab or link within the admin notification management page.

**API Endpoint:** `GET /exam-notifications/report`

**Trigger:** On report tab load, and when the date range filter changes.

#### Filter Controls

| Control    | Type        | Maps To                   | Description                             |
| ---------- | ----------- | ------------------------- | --------------------------------------- |
| Start Date | Date picker | `start_date` (YYYY-MM-DD) | Include notifications sent on or after  |
| End Date   | Date picker | `end_date` (YYYY-MM-DD)   | Include notifications sent on or before |

#### Report Sections Rendered

**Section 1 — KPI Summary**

Uses `kpis` object from the response. Same fields as the KPI Dashboard Bar (Section 4.1), but scoped to the selected date range.

**Section 2 — Recent Notifications (up to 50)**

Uses `recent_notifications[]`. Renders as a read-only table:

| Column    | Field                                        |
| --------- | -------------------------------------------- |
| Recipient | `recipient.firstName` + `recipient.lastName` |
| Exam      | `examTitle`                                  |
| Type      | `notificationType`                           |
| Channel   | `deliveryChannel`                            |
| Status    | `status`                                     |
| Sent At   | `sentAt`                                     |
| Read At   | `readAt`                                     |

**Section 3 — Per-Recipient Activity (top 20)**

If returned by the endpoint. Shows which students received the most notifications, their delivery success, and acknowledgment status.

**Section 4 — Per-Exam Notification Summary (top 10)**

If returned by the endpoint. Shows which exams generated the most notifications and their aggregate delivery outcomes.

#### Sample Request

```http
GET /exam-notifications/report?start_date=2026-01-01&end_date=2026-03-31
```

#### Sample Response Structure (`200 OK`)

```json
{
  "kpis": {
    "total_notifications": 45,
    "sent_count": 40,
    "failed_count": 3,
    "read_count": 30,
    "delivery_success_rate_percent": 88.9,
    "failed_notification_rate_percent": 6.7,
    "student_acknowledgment_rate_percent": 75.0,
    "avg_processing_time_seconds": 1.9,
    "by_type": { "Schedule": 25, "Result": 20 },
    "by_channel": { "Email": 30, "SMS": 0, "System": 15 }
  },
  "recent_notifications": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "recipientId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
      "examId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
      "notificationType": "Result",
      "examTitle": "Microfinance Midterm",
      "examStartTime": "2026-02-15T09:00:00.000Z",
      "scoreInfo": {
        "score": 78,
        "totalMarks": 100,
        "grade": "B",
        "remarks": "Good performance"
      },
      "sentByType": "System",
      "status": "Sent",
      "deliveryChannel": "Email",
      "sentAt": "2026-02-20T10:00:00.000Z",
      "readAt": "2026-02-20T14:30:00.000Z",
      "failureReason": null,
      "recipient": {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
        "firstName": "Jane",
        "lastName": "Doe",
        "email": "jane.doe@example.com"
      },
      "sender": {},
      "exam": {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
        "title": "Microfinance Midterm",
        "startTime": "2026-02-15T09:00:00.000Z",
        "duration": 90
      }
    }
  ]
}
```

---

### 4.5 Send Notification — Single Student

**Location:** A "Send Notification" button / form accessible from the admin page toolbar or from within a student's profile.

**API Endpoint:** `POST /exam-notifications/send`

**Trigger:** Admin fills in the send form and clicks **Send**.

#### Form Fields

| Field             | Type                        | Required | Allowed Values           | Description                          |
| ----------------- | --------------------------- | -------- | ------------------------ | ------------------------------------ |
| Recipient         | Student search / UUID input | Yes      | Valid student UUID       | The student to notify                |
| Exam              | Exam search / UUID input    | Yes      | Valid exam UUID          | The exam the notification relates to |
| Notification Type | Dropdown                    | Yes      | `Schedule`, `Result`     | Purpose of the notification          |
| Delivery Channel  | Dropdown                    | Yes      | `Email`, `SMS`, `System` | How the notification is sent         |

> **Important:** For `notificationType: "Result"`, the student's grade is automatically fetched from the gradebook by the backend. The admin does not enter score information manually.

#### Request Body

```json
{
  "recipientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "examId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "notificationType": "Schedule",
  "deliveryChannel": "Email"
}
```

#### Sample Response (`201 Created`)

The full notification object is returned. The UI uses this to:

- Show a success toast: _"Notification sent to [Recipient Name]."_
- Optionally append the new row to the top of the notification log table without a full re-fetch.
- Display the returned `status` (initially `"Pending"`, transitions to `"Sent"` or `"Failed"` asynchronously).

#### Response Codes

| Code  | UI Behavior                                                              |
| ----- | ------------------------------------------------------------------------ |
| `201` | Show success toast; optionally refresh log table                         |
| `400` | Show inline form validation errors                                       |
| `404` | Show error: _"Recipient or exam not found. Please check and try again."_ |

---

### 4.6 Bulk Notify Exam Participants

**Location:** An "Notify All Participants" button available on the Exam management page or the notification admin page. Opens a confirmation modal before dispatching.

**API Endpoint:** `POST /exam-notifications/notify-exam`

**Trigger:** Admin selects an exam, chooses notification type and channel, and confirms the bulk send.

#### Form / Modal Fields

| Field             | Type               | Required | Allowed Values           | Description                                                     |
| ----------------- | ------------------ | -------- | ------------------------ | --------------------------------------------------------------- |
| Exam              | Exam search / UUID | Yes      | Valid exam UUID          | Target exam                                                     |
| Notification Type | Dropdown           | Yes      | `Schedule`, `Result`     | Use `Schedule` on schedule publish; `Result` on results release |
| Delivery Channel  | Dropdown           | Yes      | `Email`, `SMS`, `System` | Channel for all notifications                                   |

#### Confirmation Modal Content

Before calling the API, the UI shows a confirmation modal:

> _"You are about to send a [Schedule / Result] notification to all active participants of [Exam Title] via [Channel]. This action cannot be undone. Continue?"_

#### Request Body

```json
{
  "examId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "notificationType": "Result",
  "deliveryChannel": "System"
}
```

#### Sample Response (`201 Created`)

```json
{
  "sent": 95,
  "failed": 3,
  "total": 98,
  "notificationIds": ["3fa85f64-5717-4562-b3fc-2c963f66afa6", "..."]
}
```

The UI renders a results summary toast or inline banner:

> _"Notifications dispatched: 95 sent, 3 failed out of 98 participants."_

If `failed > 0`, a link is shown: _"View failed notifications"_ — this pre-filters the admin log table to `status=Failed` and the relevant `examId`.

#### Response Codes

| Code  | UI Behavior                                                   |
| ----- | ------------------------------------------------------------- |
| `201` | Show dispatch summary banner                                  |
| `404` | Show error: _"Exam not found or has no active participants."_ |

---

### 4.7 Resend Failed Notification

**Location:** Resend button in the notification log table (row-level action) and in the Notification Detail panel. Only visible when `status === "Failed"`.

**API Endpoint:** `POST /exam-notifications/{id}/resend`

**Trigger:** Admin clicks the **Resend** button on a failed notification row or in its detail panel.

#### Path Parameter

| Parameter | Type | Required | Description                            |
| --------- | ---- | -------- | -------------------------------------- |
| `id`      | UUID | Yes      | ID of the failed notification to retry |

No request body is required.

#### Sample Request

```http
POST /exam-notifications/3fa85f64-5717-4562-b3fc-2c963f66afa6/resend
```

#### Sample Response (`200 OK`)

The full updated notification object is returned. The UI:

- Updates the row's status badge in the log table.
- Shows a success toast: _"Notification resent successfully."_
- Hides the Resend button if the new status is no longer `"Failed"`.

#### Response Codes

| Code  | UI Behavior                                                                      |
| ----- | -------------------------------------------------------------------------------- |
| `200` | Update row in table; show success toast                                          |
| `400` | Show error: _"This notification cannot be resent — it is not in Failed status."_ |
| `404` | Show error: _"Notification not found."_                                          |

---

## 5. Student UI — Sections and API Mapping

### 5.1 My Notifications List

**Location:** The student's notification inbox, accessible from their personal dashboard or via a bell icon / notification nav item.

**API Endpoint:** `GET /exam-notifications/my-notifications`

**Trigger:** On student page load and on filter change. The backend scopes results to the authenticated student automatically — no `recipientId` parameter is sent by the UI.

#### Filter Controls

| Control           | Type     | Maps To            | Description                 |
| ----------------- | -------- | ------------------ | --------------------------- |
| Notification Type | Dropdown | `notificationType` | `Schedule` or `Result`      |
| Status            | Dropdown | `status`           | `Pending`, `Sent`, `Failed` |

#### List / Card Columns

| Field                     | Display Notes                                           |
| ------------------------- | ------------------------------------------------------- |
| `examTitle`               | Exam name — clickable, opens detail                     |
| `notificationType`        | Badge: Schedule (blue) / Result (purple)                |
| `deliveryChannel`         | Icon or badge: Email / SMS / System                     |
| `status`                  | Colored badge                                           |
| `sentAt`                  | Relative time (e.g., _"2 hours ago"_) or formatted date |
| `readAt`                  | Unread indicator (bold row / dot) if `readAt` is null   |
| `scoreInfo` (Result only) | Show `score / totalMarks` and `grade` inline            |

**Unread indicator:** Any notification where `readAt` is null and `status === "Sent"` is rendered with a visual unread marker (bold text, colored left border, or an unread dot). The unread count is shown in the bell icon badge.

#### Sample Request

```http
GET /exam-notifications/my-notifications?notificationType=Result&status=Sent&page=1&limit=20
```

#### Sample Response (`200 OK`)

```json
{
  "total": 8,
  "page": 1,
  "totalPages": 1,
  "data": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "recipientId": "3fa85f64-5717-4562-b3fc-2c963f66afa7",
      "examId": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
      "notificationType": "Result",
      "examTitle": "Microfinance Midterm",
      "examStartTime": "2026-02-15T09:00:00.000Z",
      "scoreInfo": {
        "score": 78,
        "totalMarks": 100,
        "grade": "B",
        "remarks": "Good performance"
      },
      "sentByType": "System",
      "status": "Sent",
      "deliveryChannel": "System",
      "sentAt": "2026-02-20T10:00:00.000Z",
      "readAt": null,
      "failureReason": null,
      "recipient": { ... },
      "sender": {},
      "exam": { ... }
    }
  ]
}
```

---

### 5.2 Mark as Read (Acknowledgment)

**Location:** Triggered automatically when a student opens a notification detail, or manually via a "Mark as Read" button on an unread notification card.

**API Endpoint:** `PUT /exam-notifications/{id}/read`

**Trigger:**

- **Automatic:** When the student opens a notification detail view and `readAt` is null — the read call fires immediately on open.
- **Manual:** When the student clicks a "Mark as Read" button directly on the list card.

#### Path Parameter

| Parameter | Type | Required | Description                            |
| --------- | ---- | -------- | -------------------------------------- |
| `id`      | UUID | Yes      | ID of the notification to mark as read |

No request body is required.

#### Sample Request

```http
PUT /exam-notifications/3fa85f64-5717-4562-b3fc-2c963f66afa6/read
```

#### Sample Response (`200 OK`)

The full updated notification object is returned with `readAt` now populated. The UI:

- Removes the unread indicator from the notification card in the list.
- Updates the bell icon unread count.
- Stores the `readAt` timestamp for display in the detail view.

#### Response Codes

| Code  | UI Behavior                                                                                                       |
| ----- | ----------------------------------------------------------------------------------------------------------------- |
| `200` | Remove unread indicator; update bell count                                                                        |
| `403` | Silent — student tried to mark another student's notification. Do not expose this error visibly; log it silently. |
| `404` | Show brief error toast: _"Notification not found."_                                                               |

---

## 6. Complete Step-by-Step User Flows

### 6.1 Admin Flow — Bulk Notify on Exam Schedule Publish

```
1. Exam schedule is published in the LMS
   → System or admin navigates to the notification dispatch panel

2. Admin selects the exam from the Exam dropdown

3. Admin sets:
   - Notification Type: "Schedule"
   - Delivery Channel: "Email"  (or "System", or both via separate calls)

4. Admin clicks "Notify All Participants"
   → Confirmation modal appears:
      "Send Schedule notification to all participants of [Exam Title] via Email?"

5. Admin confirms
   → POST /exam-notifications/notify-exam
      Body: { examId, notificationType: "Schedule", deliveryChannel: "Email" }

6. Response returns: { sent: 95, failed: 3, total: 98 }
   → Success banner: "95 sent, 3 failed"
   → If failed > 0: "View failed notifications" link pre-filters log table

7. Admin reviews the log table
   → GET /exam-notifications?examId={uuid}&status=Failed
   → Sees 3 rows with status "Failed" and failureReason values

8. Admin clicks Resend on each failed row
   → POST /exam-notifications/{id}/resend  (one call per failed notification)
   → Rows update to "Sent" or remain "Failed"

9. Admin checks KPI bar
   → GET /exam-notifications/kpis
   → delivery_success_rate_percent updates to reflect successful resends
```

### 6.2 Admin Flow — Send Single Notification Manually

```
1. Admin clicks "Send Notification" button in the toolbar

2. Send form opens. Admin fills in:
   - Recipient: selects a student
   - Exam: selects an exam
   - Notification Type: "Result"
   - Delivery Channel: "System"

3. Admin clicks Send
   → Client validates all fields are populated (see Validation Rules)
   → POST /exam-notifications/send
      Body: { recipientId, examId, notificationType: "Result", deliveryChannel: "System" }

4. Backend automatically fetches the student's grade from the gradebook
   → Returns the full notification object with scoreInfo populated

5. UI shows success toast: "Notification sent to [Student Name]"
   → New notification optionally prepended to the log table
```

### 6.3 Admin Flow — Monitor and Resend Failed Notifications

```
1. Admin opens the Admin Notification page
   → GET /exam-notifications/kpis  (on load)
   → KPI bar shows failed_notification_rate_percent

2. Admin notices a high failed rate and filters the log table:
   → GET /exam-notifications?status=Failed

3. Admin clicks a failed notification row
   → GET /exam-notifications/{id}
   → Detail panel opens; failureReason shown in red

4. Admin clicks Resend
   → POST /exam-notifications/{id}/resend
   → Status badge updates; Resend button disappears if no longer Failed

5. Admin generates a report for auditing
   → Navigates to Report tab
   → Sets date range: start_date, end_date
   → GET /exam-notifications/report?start_date=...&end_date=...
   → Reviews KPI summary, recent notifications table
```

### 6.4 Student Flow — View and Acknowledge Notifications

```
1. Student logs in and sees bell icon badge with unread count

2. Student clicks bell / navigates to My Notifications
   → GET /exam-notifications/my-notifications?page=1&limit=20
   → List renders; unread items highlighted

3. Student clicks a "Result" notification for "Microfinance Midterm"
   → GET /exam-notifications/{id}  (detail view opens)
   → Immediately fires:
      PUT /exam-notifications/{id}/read
   → readAt is set; unread indicator removed; bell count decrements

4. Student reads: Score 78/100, Grade B, Remarks "Good performance"

5. Student filters to see only Schedule notifications
   → GET /exam-notifications/my-notifications?notificationType=Schedule
   → List updates to show only upcoming exam schedule notifications
```

---

## 7. Request & Response Structures

### POST `/exam-notifications/send` — Request Body

| Field              | Type   | Required | Allowed Values           |
| ------------------ | ------ | -------- | ------------------------ |
| `recipientId`      | UUID   | Yes      | Valid student UUID       |
| `examId`           | UUID   | Yes      | Valid exam UUID          |
| `notificationType` | string | Yes      | `Schedule`, `Result`     |
| `deliveryChannel`  | string | Yes      | `Email`, `SMS`, `System` |

### POST `/exam-notifications/notify-exam` — Request Body

| Field              | Type   | Required | Allowed Values           |
| ------------------ | ------ | -------- | ------------------------ |
| `examId`           | UUID   | Yes      | Valid exam UUID          |
| `notificationType` | string | Yes      | `Schedule`, `Result`     |
| `deliveryChannel`  | string | Yes      | `Email`, `SMS`, `System` |

### GET `/exam-notifications` — Query Parameters

| Parameter          | Type    | Required | Default | Description                 |
| ------------------ | ------- | -------- | ------- | --------------------------- |
| `notificationType` | string  | No       | —       | `Schedule` or `Result`      |
| `status`           | string  | No       | —       | `Pending`, `Sent`, `Failed` |
| `deliveryChannel`  | string  | No       | —       | `Email`, `SMS`, `System`    |
| `recipientId`      | UUID    | No       | —       | Filter to one student       |
| `examId`           | UUID    | No       | —       | Filter to one exam          |
| `sentByType`       | string  | No       | —       | `System` or `Admin`         |
| `startDate`        | date    | No       | —       | YYYY-MM-DD                  |
| `endDate`          | date    | No       | —       | YYYY-MM-DD                  |
| `page`             | integer | No       | `1`     | Page number                 |
| `limit`            | integer | No       | `20`    | Records per page            |

### GET `/exam-notifications/my-notifications` — Query Parameters

| Parameter          | Type    | Required | Default | Description                 |
| ------------------ | ------- | -------- | ------- | --------------------------- |
| `notificationType` | string  | No       | —       | `Schedule` or `Result`      |
| `status`           | string  | No       | —       | `Pending`, `Sent`, `Failed` |
| `page`             | integer | No       | `1`     | Page number                 |
| `limit`            | integer | No       | `20`    | Records per page            |

### GET `/exam-notifications/report` — Query Parameters

| Parameter    | Type              | Required | Description         |
| ------------ | ----------------- | -------- | ------------------- |
| `start_date` | date (YYYY-MM-DD) | No\*     | Report window start |
| `end_date`   | date (YYYY-MM-DD) | No\*     | Report window end   |

\*If one date is provided, both are required.

---

## 8. Notification Object — Full Field Reference

The following object shape is returned by all read endpoints (`GET`, `POST /send`, `POST /resend`, `PUT /read`) and appears inside list arrays.

| Field                  | Type             | Description                                           |
| ---------------------- | ---------------- | ----------------------------------------------------- |
| `id`                   | UUID             | Unique notification identifier                        |
| `recipientId`          | UUID             | Student receiving the notification                    |
| `examId`               | UUID             | Linked exam identifier                                |
| `notificationType`     | string           | `Schedule` or `Result`                                |
| `examTitle`            | string           | Human-readable exam name                              |
| `examStartTime`        | ISO 8601         | Exam start datetime                                   |
| `scoreInfo`            | object \| null   | Populated for Result notifications; null for Schedule |
| `scoreInfo.score`      | number           | Student's raw score                                   |
| `scoreInfo.totalMarks` | number           | Maximum marks for the exam                            |
| `scoreInfo.grade`      | string           | Letter or label grade                                 |
| `scoreInfo.remarks`    | string           | Instructor remarks                                    |
| `sentByType`           | string           | `System` or `Admin`                                   |
| `status`               | string           | `Pending`, `Sent`, or `Failed`                        |
| `deliveryChannel`      | string           | `Email`, `SMS`, or `System`                           |
| `sentAt`               | ISO 8601         | Timestamp when notification was dispatched            |
| `readAt`               | ISO 8601 \| null | Timestamp when student marked as read; null if unread |
| `failureReason`        | string \| null   | Reason for failed delivery; null if not failed        |
| `recipient.id`         | UUID             | Student UUID                                          |
| `recipient.firstName`  | string           | Student first name                                    |
| `recipient.lastName`   | string           | Student last name                                     |
| `recipient.email`      | string           | Student email address                                 |
| `sender`               | object           | Sender identity (admin or system); shape may vary     |
| `exam.id`              | UUID             | Exam UUID                                             |
| `exam.title`           | string           | Exam title                                            |
| `exam.startTime`       | ISO 8601         | Exam start datetime                                   |
| `exam.duration`        | integer          | Exam duration in minutes                              |

---

## 9. KPI Definitions

| KPI                         | Formula                                                 | Description                                     |
| --------------------------- | ------------------------------------------------------- | ----------------------------------------------- |
| Delivery Success Rate       | `sent_count / total_notifications × 100`                | % of notifications successfully delivered       |
| Failed Notification Rate    | `failed_count / total_notifications × 100`              | % of notifications that failed delivery         |
| Student Acknowledgment Rate | `read_count / sent_count × 100`                         | % of sent notifications that students have read |
| Avg Processing Time         | Mean of `(sentAt − createdAt)` across all notifications | Average seconds from generation to dispatch     |

---

## 10. Status, Type & Channel Values

### `status` — Badge Colors

| Value     | Badge Color | Description                |
| --------- | ----------- | -------------------------- |
| `Pending` | Gray        | Queued; not yet dispatched |
| `Sent`    | Green       | Successfully delivered     |
| `Failed`  | Red         | Delivery attempt failed    |

### `notificationType` — Badge Colors

| Value      | Badge Color | Description                          |
| ---------- | ----------- | ------------------------------------ |
| `Schedule` | Blue        | Exam schedule published notification |
| `Result`   | Purple      | Exam results released notification   |

### `deliveryChannel` — Icons / Badges

| Value    | Icon          | Description                               |
| -------- | ------------- | ----------------------------------------- |
| `Email`  | Envelope icon | Sent to student's registered email        |
| `SMS`    | Phone icon    | Sent to student's registered phone number |
| `System` | Bell icon     | In-app / system notification              |

### `sentByType`

| Value    | Description                               |
| -------- | ----------------------------------------- |
| `System` | Triggered automatically by a system event |
| `Admin`  | Triggered manually by an administrator    |

---

## 11. Validation Rules

### Client-Side — Send Form (`POST /send`)

| Rule            | Condition                                                                      | Message                                               |
| --------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------- |
| Required fields | `recipientId`, `examId`, `notificationType`, `deliveryChannel` must all be set | _"All fields are required."_                          |
| UUID format     | `recipientId` and `examId` must be valid UUIDs                                 | Enforced by search/dropdown; no free-text UUID entry. |
| Enum values     | `notificationType` and `deliveryChannel` must match allowed values             | Enforced by dropdowns.                                |

### Client-Side — Bulk Notify Form (`POST /notify-exam`)

| Rule                  | Condition                                                       | Message                                           |
| --------------------- | --------------------------------------------------------------- | ------------------------------------------------- |
| Required fields       | `examId`, `notificationType`, `deliveryChannel` must all be set | _"All fields are required."_                      |
| Confirmation required | Modal must be confirmed before the API call is made             | Clicking Cancel dismisses; does not call the API. |

### Client-Side — Resend (`POST /{id}/resend`)

| Rule         | Condition                                                   | Message                                                                                                                          |
| ------------ | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Status check | Resend button should only render when `status === "Failed"` | Do not show the button for Sent or Pending notifications. If somehow called on a non-Failed notification, the API returns `400`. |

### Client-Side — Date Filters

| Rule                    | Condition                                                | Message                                          |
| ----------------------- | -------------------------------------------------------- | ------------------------------------------------ |
| Date range completeness | One date provided without the other                      | _"Please provide both a start and end date."_    |
| Date range order        | `endDate` / `end_date` before `startDate` / `start_date` | _"End date must be on or after the start date."_ |

### Server-Side (API-level)

- `400` is returned for missing required fields, invalid enums, and constraint violations (e.g., resending a non-Failed notification). The UI surfaces `error.message` from the response body as an inline form error or toast.
- `403` on `PUT /{id}/read` when the authenticated student is not the notification's recipient — handled silently (do not surface to user).
- `404` on `POST /notify-exam` when the exam has no active participants — UI shows an error toast.

---

## 12. Error Handling

| HTTP Status     | Endpoint(s)                                      | UI Behavior                                                                      |
| --------------- | ------------------------------------------------ | -------------------------------------------------------------------------------- |
| `200` / `201`   | All                                              | Render data or show success feedback                                             |
| `400`           | `/send`, `/{id}/resend`                          | Show inline form validation error or toast with `error.message`                  |
| `403`           | `/{id}/read`                                     | Silent — log to console; do not display to student                               |
| `404`           | `/{id}`, `/send`, `/notify-exam`, `/{id}/resend` | Show contextual empty state or error toast (see per-endpoint notes)              |
| `401`           | All                                              | Clear session; redirect to login page                                            |
| `500`           | All                                              | Show error banner: _"Something went wrong. Please try again."_ with Retry button |
| Network timeout | All                                              | Show error banner with Retry; preserve last successfully loaded data             |

### Independent Error Boundaries

- KPI bar, log table, and report view each manage their own loading/error state independently.
- A failure in `/kpis` does not block the log table from rendering.
- A failed resend call does not close the detail panel — it shows an inline error within the panel.

---

## 13. Pagination

### Admin Log Table — `/exam-notifications`

| Control                 | Behavior                            |
| ----------------------- | ----------------------------------- |
| Previous / Next buttons | Navigate between pages              |
| Page indicator          | `Page X of totalPages`              |
| Records per page        | Options: `10`, `20` (default), `50` |
| Any filter change       | Resets to page 1                    |

### Student Notifications — `/my-notifications`

| Control                              | Behavior               |
| ------------------------------------ | ---------------------- |
| Previous / Next (or infinite scroll) | Navigate or load more  |
| Page indicator                       | `Page X of totalPages` |
| Default limit                        | `20`                   |
| Filter change                        | Resets to page 1       |

### Non-paginated Endpoints

`/kpis`, `/send`, `/notify-exam`, `/{id}`, `/{id}/read`, `/{id}/resend` — these return single objects or aggregate results. No pagination parameters apply.

The `/report` endpoint returns a fixed maximum of 50 recent notifications and top-20/10 summaries. It does not support pagination — for full paginated history, use the `/exam-notifications` admin list endpoint.

---

## Appendix A — Sample API Call Sequences

### Admin: Bulk notify on results release

```
1. Admin opens Bulk Notify panel
   → (no API call yet)

2. Admin fills form and confirms
   → POST /exam-notifications/notify-exam
      { examId: "...", notificationType: "Result", deliveryChannel: "System" }
   ← { sent: 92, failed: 2, total: 94 }

3. Admin clicks "View failed notifications" link
   → GET /exam-notifications?examId={uuid}&status=Failed

4. Admin resends each failed notification
   → POST /exam-notifications/{id1}/resend
   → POST /exam-notifications/{id2}/resend

5. Admin refreshes KPI bar
   → GET /exam-notifications/kpis
```

### Student: Receive and read a Schedule notification

```
1. Student loads notifications page
   → GET /exam-notifications/my-notifications?page=1&limit=20

2. Student sees unread Schedule notification for "Microfinance Midterm"

3. Student clicks the notification
   → GET /exam-notifications/{id}       (detail view opens)
   → PUT /exam-notifications/{id}/read  (fires immediately on open)

4. Unread indicator removed; bell count decrements by 1
```

---

## Appendix B — Notification Content by Type

The backend generates notification content automatically based on the `notificationType`. The UI displays the relevant fields from the notification object.

### Schedule Notification — Key Fields to Display

| Field            | Label              |
| ---------------- | ------------------ |
| `examTitle`      | Exam Name          |
| `exam.startTime` | Exam Date & Time   |
| `exam.duration`  | Duration (minutes) |

### Result Notification — Key Fields to Display

| Field                                      | Label              |
| ------------------------------------------ | ------------------ |
| `examTitle`                                | Exam Name          |
| `scoreInfo.score` / `scoreInfo.totalMarks` | Score              |
| `scoreInfo.grade`                          | Grade              |
| `scoreInfo.remarks`                        | Instructor Remarks |

`scoreInfo` is `null` for Schedule notifications and must not be rendered. Always check `notificationType` before rendering the score block.
