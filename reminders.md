# Email Reminder Module

A system for scheduling and sending automated email notifications to students and staff about upcoming training sessions, courses, standalone exams, and deadlines. It tracks delivery, applies templates, and exposes KPI metrics and activity reports.

---

## Table of Contents

1. [Overview](#overview)
2. [End-to-End Flow](#end-to-end-flow)
   - [Phase 1 — Recipient & Training Identification](#phase-1--recipient--training-identification)
   - [Phase 2 — Reminder Scheduling](#phase-2--reminder-scheduling)
   - [Phase 3 — Email Notification Processing](#phase-3--email-notification-processing)
   - [Phase 4 — Delivery & Status Tracking](#phase-4--delivery--status-tracking)
   - [Phase 5 — KPI Monitoring & Reporting](#phase-5--kpi-monitoring--reporting)
3. [API Endpoints](#api-endpoints)
   - [Create a Reminder](#create-a-reminder)
   - [List All Reminders](#list-all-reminders)
   - [Get a Single Reminder](#get-a-single-reminder)
   - [Update a Reminder](#update-a-reminder)
   - [Cancel a Reminder](#cancel-a-reminder)
   - [Send a Reminder Immediately](#send-a-reminder-immediately)
   - [Trigger All Due Reminders (Cron)](#trigger-all-due-reminders-cron)
   - [Get My Reminders](#get-my-reminders)
   - [Track Email Open](#track-email-open)
   - [Track Email Click](#track-email-click)
   - [Get KPI Metrics](#get-kpi-metrics)
   - [Get Activity Report](#get-activity-report)
4. [Data Model](#data-model)
5. [Reminder Statuses](#reminder-statuses)
6. [Sample Payloads](#sample-payloads)
7. [KPI Metrics Output](#kpi-metrics-output)
8. [Error Reference](#error-reference)

---

## Overview

The Email Reminder Module handles the full lifecycle of a scheduled email notification:

```
Identify recipient → Link course/training → Schedule reminder → Apply template → Send email → Track delivery → Monitor KPIs
```

Key capabilities:

- Create and schedule reminders linked to a course, training, or standalone exam
- Send notifications automatically at the scheduled time (cron) or manually on demand
- Track delivery status (sent, failed, pending, cancelled)
- Measure open rate and click-through rate via embedded tracking
- Generate structured activity reports and KPI summaries

---

## End-to-End Flow

### Phase 1 — Recipient & Training Identification

When a reminder is created, the system:

1. Identifies the **recipient** using their `recipientId` (student or staff UUID)
2. Links the reminder to the relevant **course** (`courseId`) or **standalone examination** (`standAloneExaminationId`)
3. Records the **scheduled date and time** for delivery

Data captured at this stage:

| Field                     | Description                                          |
| ------------------------- | ---------------------------------------------------- |
| `recipientId`             | UUID of the user receiving the reminder              |
| `courseId`                | UUID of the linked course (optional)                 |
| `standAloneExaminationId` | UUID of the linked exam (optional)                   |
| `scheduledDate`           | ISO 8601 date-time for when the reminder should fire |

---

### Phase 2 — Reminder Scheduling

Once created, the reminder enters `pending` status. The system records:

| Field          | Description                                                   |
| -------------- | ------------------------------------------------------------- |
| `reminderId`   | Auto-generated UUID for the reminder                          |
| `templateName` | Email template to apply (e.g. `Standard Reminder`)            |
| `subject`      | Email subject line                                            |
| `redirectUrl`  | Destination URL embedded in the email body for click tracking |
| `status`       | Set to `pending` on creation                                  |

The reminder waits until its `scheduledDate` is reached. A cron job polls for due reminders using `POST /email-reminders/send-due`.

---

### Phase 3 — Email Notification Processing

At the scheduled time (or when triggered manually):

1. The system retrieves the reminder record and the recipient's contact details
2. The selected **email template** is applied to generate the email body
3. An **open-tracking pixel** (`GET /email-reminders/track/open/{reminderId}`) is embedded in the HTML
4. A **click-tracking redirect URL** (`GET /email-reminders/track/click/{reminderId}`) wraps any links
5. The email is dispatched to the recipient

---

### Phase 4 — Delivery & Status Tracking

After the send attempt, the system updates the reminder's status:

| Status      | Meaning                               |
| ----------- | ------------------------------------- |
| `pending`   | Scheduled but not yet sent            |
| `sent`      | Successfully delivered                |
| `failed`    | Delivery attempt was unsuccessful     |
| `cancelled` | Reminder was cancelled before sending |

- **Open tracking**: When the recipient opens the email, the 1×1 GIF pixel fires `GET /email-reminders/track/open/{reminderId}`, incrementing the open count.
- **Click tracking**: When the recipient clicks a link, `GET /email-reminders/track/click/{reminderId}` increments the click count and redirects to `redirectUrl`.

All delivery events are logged for reporting and troubleshooting.

---

### Phase 5 — KPI Monitoring & Reporting

The system aggregates delivery data into performance metrics, available at `GET /email-reminders/kpis`:

| KPI                    | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| `totalRemindersSent`   | Total number of reminders dispatched                 |
| `successfulDeliveries` | Count of reminders with `sent` status                |
| `failedDeliveries`     | Count of reminders with `failed` status              |
| `deliverySuccessRate`  | Percentage of successful deliveries                  |
| `openRate`             | Percentage of sent emails that were opened           |
| `clickThroughRate`     | Percentage of opened emails where a link was clicked |

A full activity log is available at `GET /email-reminders/report`.

---

## API Endpoints

### Create a Reminder

```
POST /email-reminders/create
```

Creates and schedules a new email reminder.

**Request body:**

```json
{
  "recipientId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "standAloneExaminationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "scheduledDate": "2025-11-10T09:00:00.000Z",
  "templateName": "Standard Reminder",
  "subject": "Upcoming AGR101 Workshop",
  "redirectUrl": "https://lms.example.com/courses/agr101"
}
```

> Either `courseId` or `standAloneExaminationId` should be provided, not necessarily both.

**Response:** `201 Created` — reminder record with generated `reminderId` and status `pending`.

---

### List All Reminders

```
GET /email-reminders
```

Returns a paginated list of all reminders. Supports filtering.

**Query parameters:**

| Parameter     | Type    | Description                                                |
| ------------- | ------- | ---------------------------------------------------------- |
| `status`      | string  | Filter by status: `pending`, `sent`, `failed`, `cancelled` |
| `recipientId` | uuid    | Filter by recipient                                        |
| `page`        | integer | Page number                                                |
| `limit`       | integer | Results per page                                           |

**Response:** `200 OK` — paginated list of reminder objects.

---

### Get a Single Reminder

```
GET /email-reminders/{reminderId}
```

Returns the full details of one reminder by its UUID.

**Path parameter:** `reminderId` (uuid, required)

**Response:** `200 OK` — reminder object. `404 Not Found` if the ID does not exist.

---

### Update a Reminder

```
PUT /email-reminders/{reminderId}
```

Updates a reminder that is still in `pending` status. Cannot update a reminder that has already been sent or cancelled.

**Path parameter:** `reminderId` (uuid, required)

**Request body (all fields optional):**

```json
{
  "scheduledDate": "2025-11-12T10:00:00.000Z",
  "templateName": "Standard Reminder",
  "subject": "Updated: ENG201 Lecture Reminder",
  "redirectUrl": "https://lms.example.com/courses/eng201",
  "status": "cancelled"
}
```

**Response:** `200 OK` — updated reminder object.

---

### Cancel a Reminder

```
DELETE /email-reminders/{reminderId}
```

Cancels a reminder, setting its status to `cancelled`. The reminder record is retained for reporting purposes.

**Path parameter:** `reminderId` (uuid, required)

**Response:** `200 OK` — confirmation that the reminder was cancelled.

---

### Send a Reminder Immediately

```
POST /email-reminders/{reminderId}/send
```

Bypasses the schedule and sends a specific reminder right now. Useful for manual re-sends or testing.

**Path parameter:** `reminderId` (uuid, required)

**Response:** `200 OK` — delivery result. `400 Bad Request` if the reminder has already been sent or is cancelled.

---

### Trigger All Due Reminders (Cron)

```
POST /email-reminders/send-due
```

Sends every reminder whose `scheduledDate` has passed and whose status is still `pending`. Intended to be called by a scheduled cron job.

**Response:**

```json
{
  "success": true,
  "data": {
    "total": 12,
    "sent": 11,
    "failed": 1
  }
}
```

---

### Get My Reminders

```
GET /email-reminders/my-reminders
```

Returns reminders associated with the currently authenticated user. Paginated.

**Query parameters:** `page`, `limit`

**Response:** `200 OK` — paginated list of the authenticated user's reminders.

---

### Track Email Open

```
GET /email-reminders/track/open/{reminderId}
```

Embedded as a hidden 1×1 pixel in the email HTML. When the email client loads the image, this endpoint increments the open count for the reminder.

**Path parameter:** `reminderId` (uuid, required)

**Response:** `200 OK` — returns a 1×1 transparent GIF (`image/gif`). No visible output to the user.

> Embed in email HTML as:
>
> ```html
> <img
>   src="https://api.example.com/email-reminders/track/open/{reminderId}"
>   width="1"
>   height="1"
> />
> ```

---

### Track Email Click

```
GET /email-reminders/track/click/{reminderId}
```

Wraps links inside the email. When the recipient clicks, this endpoint increments the click count and issues a `302` redirect to the reminder's `redirectUrl`.

**Path parameter:** `reminderId` (uuid, required)

**Response:** `302 Found` — redirect to `redirectUrl`.

> Wrap links in email HTML as:
>
> ```html
> <a href="https://api.example.com/email-reminders/track/click/{reminderId}"
>   >View Course</a
> >
> ```

---

### Get KPI Metrics

```
GET /email-reminders/kpis
```

Returns aggregate performance metrics across all reminders.

**Response:**

```json
{
  "success": true,
  "data": {
    "totalRemindersSent": 250,
    "successfulDeliveries": 240,
    "failedDeliveries": 10,
    "deliverySuccessRate": 96,
    "openRate": 82,
    "clickThroughRate": 45
  }
}
```

---

### Get Activity Report

```
GET /email-reminders/report
```

Returns a full structured activity log of all reminder events. Intended for admin dashboards and audit exports.

**Response:** `200 OK` — detailed report data (structure varies by implementation).

---

## Data Model

| Field                     | Type     | Description                                          |
| ------------------------- | -------- | ---------------------------------------------------- |
| `reminderId`              | uuid     | Unique identifier for the reminder                   |
| `recipientId`             | uuid     | User receiving the reminder                          |
| `courseId`                | uuid     | Linked course (optional)                             |
| `standAloneExaminationId` | uuid     | Linked standalone exam (optional)                    |
| `scheduledDate`           | ISO 8601 | Date and time the reminder is due to send            |
| `templateName`            | string   | Email template applied (e.g. `Standard Reminder`)    |
| `subject`                 | string   | Email subject line                                   |
| `redirectUrl`             | string   | Destination URL for click tracking                   |
| `status`                  | enum     | `pending` / `sent` / `failed` / `cancelled`          |
| `sentBy`                  | string   | Who triggered the send — `System` (cron) or admin ID |
| `openCount`               | integer  | Number of times the tracking pixel was loaded        |
| `clickCount`              | integer  | Number of times the tracking link was clicked        |

---

## Reminder Statuses

```
pending → sent
pending → failed
pending → cancelled
failed  → (retry via POST /{reminderId}/send) → sent
```

| Status      | Description                                |
| ----------- | ------------------------------------------ |
| `pending`   | Created and waiting for its scheduled time |
| `sent`      | Successfully delivered to the recipient    |
| `failed`    | Delivery attempted but unsuccessful        |
| `cancelled` | Manually cancelled before sending          |

---

## Sample Payloads

**Successful reminder record:**

```json
{
  "reminderId": "REM-001",
  "recipientId": "STU-001",
  "courseTraining": "AGR101 Workshop",
  "scheduledDate": "2025-11-10T09:00:00Z",
  "sentBy": "System",
  "status": "sent",
  "templateUsed": "Standard Reminder"
}
```

**Failed reminder record:**

```json
{
  "reminderId": "REM-002",
  "recipientId": "STU-002",
  "courseTraining": "ENG201 Lecture",
  "scheduledDate": "2025-11-12T09:00:00Z",
  "sentBy": "System",
  "status": "failed",
  "templateUsed": "Standard Reminder"
}
```

---

## KPI Metrics Output

```json
{
  "totalRemindersSent": 250,
  "successfulDeliveries": 240,
  "failedDeliveries": 10,
  "deliverySuccessRate": 96,
  "openRate": 82,
  "clickThroughRate": 45
}
```

---

## Error Reference

| HTTP Code | Meaning                                          |
| --------- | ------------------------------------------------ |
| `400`     | Bad request — reminder already sent or cancelled |
| `404`     | Reminder not found for the given `reminderId`    |
| `302`     | Redirect (click tracking only)                   |

---

> **Cron setup tip:** Call `POST /email-reminders/send-due` on a recurring schedule (e.g. every 5 minutes) to ensure reminders fire close to their scheduled time. The endpoint is idempotent — already-sent reminders are skipped automatically.
