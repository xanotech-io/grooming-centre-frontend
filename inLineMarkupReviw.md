# TC05 – In-Line Markup for Feedback/Review

> **Module:** TC05 | **Tag:** `TC05 - Inline Markup` | **Base Path:** `/api/v1/inline-markup-v2`
> **Servers:** `http://localhost:8089` (dev) · `https://gclms.xanotech.org` (production)
> **Auth:** Bearer JWT required on all endpoints

---

## Overview

The In-Line Markup Module enables instructors and reviewers to provide contextual, annotated feedback directly inside student submissions — no external tools required. Feedback is anchored to exact text positions or document areas, managed through a three-state lifecycle, and supports full threaded discussion between instructor and student. Upon final grade publication, all markups are automatically archived for audit and analytics.

**Core flow in one line:**
`Open Submission → Create Markup → Set Status → Student Replies → Resolve → Archive`

---

## Table of Contents

1. [Key Concepts](#1-key-concepts)
2. [Data Model](#2-data-model)
3. [Lifecycle State Machine](#3-lifecycle-state-machine)
4. [Step-by-Step Flow](#4-step-by-step-flow)
5. [API Endpoints](#5-api-endpoints)
6. [Comment Type Rules](#6-comment-type-rules)
7. [Highlight Color Reference](#7-highlight-color-reference)
8. [Threading Rules](#8-threading-rules)
9. [Sample Payloads](#9-sample-payloads)
10. [Error Reference](#10-error-reference)

---

## 1. Key Concepts

| Concept          | Description                                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Markup**       | A single feedback item anchored to a specific location in a student submission                                                  |
| **Comment Type** | The format of the markup: `Text Comment`, `Highlight`, `Annotation` (Draw), or `Voice Note`                                     |
| **Status**       | The lifecycle state: `Draft` → `Published` → `Resolved`                                                                         |
| **Thread**       | A parent markup plus all its nested replies, linked by `threadParentId`                                                         |
| **Anchor**       | A `text_range` (start/end index) or bounding box that pins the markup to a document location                                    |
| **Bounding Box** | Pixel coordinates `(x, y, width, height)` for drawn annotations — rendered as an overlay, never modifying the original document |
| **Archive**      | Read-only state applied to all markups when a final grade is published                                                          |

---

## 2. Data Model

### MarkupRecord — Core Fields

| Field            | Type               | Description                                                                               |
| ---------------- | ------------------ | ----------------------------------------------------------------------------------------- |
| `markupId`       | `uuid`             | Auto-generated unique identifier                                                          |
| `reviewer`       | `uuid \| null`     | Instructor/assessor ID; `null` for student replies                                        |
| `studentId`      | `uuid`             | Student whose submission is being reviewed                                                |
| `documentType`   | `enum`             | `Assignment`, `Exam`, `Project`, `Discussion`                                             |
| `submissionId`   | `uuid`             | The submission being reviewed                                                             |
| `commentType`    | `enum`             | `Text Comment`, `Highlight`, `Annotation`, `Voice Note`                                   |
| `anchorLocation` | `object \| null`   | `{ type, start_index, end_index, anchor_text }` — required for Text Comment and Highlight |
| `highlightColor` | `enum \| null`     | `Yellow`, `Green`, `Red`, `Blue` — required when `commentType = Highlight`                |
| `drawingShape`   | `enum \| null`     | `Rectangle`, `Circle`, `Arrow`, `Freehand` — required when `commentType = Annotation`     |
| `boundingBox`    | `object \| null`   | `{ x, y, width, height }` — required when `commentType = Annotation`                      |
| `content`        | `string`           | The feedback text or rich-text body                                                       |
| `status`         | `enum`             | `Draft`, `Published`, `Resolved`                                                          |
| `threadParentId` | `uuid \| null`     | Links a reply to its parent markup; `null` for top-level items                            |
| `publishedAt`    | `datetime \| null` | Timestamp when the markup became visible to the student                                   |
| `resolvedAt`     | `datetime \| null` | Timestamp when the item was resolved                                                      |
| `isEdited`       | `boolean`          | Set to `true` when a published markup is subsequently edited                              |
| `isArchived`     | `boolean`          | Set to `true` after final grade publication                                               |
| `remark`         | `string \| null`   | Internal reviewer note — never visible to the student                                     |

---

## 3. Lifecycle State Machine

```
                    ┌──────────────────────────────────────────────────┐
                    │                                                  │
         CREATE     ▼          PUBLISH              RESOLVE           │  RE-OPEN
  ──────────► [ DRAFT ] ──────────────► [ PUBLISHED ] ──────────► [ RESOLVED ]
               (instructor             (student notified,          (timestamps
                only, fully            instructor can              recorded,
                editable,              edit with                   read-only
                invisible              "Edited" flag)              to student)
                to student)
                    │
                    │ DELETE (only from Draft)
                    ▼
                 [DELETED]

  On Final Grade Publication:
  All statuses ──────────────────────────────────────────► [ ARCHIVED ] (read-only)
```

**Allowed transitions:**

| From        | To          | Who                   | Side Effect                          |
| ----------- | ----------- | --------------------- | ------------------------------------ |
| _(new)_     | `Draft`     | Instructor            | —                                    |
| `Draft`     | `Published` | Instructor            | Sets `publishedAt`; notifies student |
| `Published` | `Resolved`  | Student or Instructor | Sets `resolvedAt`                    |
| `Resolved`  | `Published` | Instructor            | Clears `resolvedAt`                  |
| `Draft`     | _(deleted)_ | Instructor            | Cascades to delete all replies       |
| Any         | `Archived`  | System (grade event)  | Marks `isArchived = true`; read-only |

---

## 4. Step-by-Step Flow

### Phase 1 — Document Access

1. Instructor opens a student submission from the grading queue.
2. System loads the document viewer, rendering submission content alongside any previously saved markups.
3. Instructor selects a markup tool from the toolbar (`Text Comment`, `Highlight`, or `Draw`).

---

### Phase 2 — Markup Creation

Three paths depending on selected tool:

#### Path A: Text Comment

1. Instructor clicks or selects a text location in the document.
2. A comment panel opens; instructor types rich-text feedback (bold, italic, lists, links).
3. `anchorLocation` is captured with `start_index`, `end_index`, and `anchor_text`.
4. Instructor chooses **Save as Draft** or **Publish immediately**.
5. `POST /api/v1/inline-markup-v2` is called with `commentType: "Text Comment"`.

#### Path B: Highlight

1. Instructor selects a text range; system applies a `Yellow` highlight by default.
2. Instructor optionally changes color: Yellow (caution) · Green (praise) · Red (critical) · Blue (informational).
3. Instructor optionally attaches a text comment to the highlight.
4. `POST /api/v1/inline-markup-v2` is called with `commentType: "Highlight"` and `highlightColor`.

#### Path C: Annotation (Draw)

1. Instructor selects a drawing shape: `Rectangle`, `Circle`, `Arrow`, or `Freehand`.
2. Instructor draws directly on the document overlay.
3. System captures the `boundingBox` coordinates `(x, y, width, height)`.
4. **Original document content is not modified** — annotations render as a separate overlay layer.
5. Instructor optionally attaches a text label.
6. `POST /api/v1/inline-markup-v2` is called with `commentType: "Annotation"`, `drawingShape`, and `boundingBox`.

---

### Phase 3 — Status Management

1. All new markups default to **Draft** (invisible to student, fully editable).
2. Instructor reviews draft markups and publishes individually or in bulk.
   - Individual: `PATCH /api/v1/inline-markup-v2/{markupId}/status` → `{ "status": "Published" }`
   - Bulk: `POST /api/v1/inline-markup-v2/submission/{submissionId}/publish-all`
3. On publish, `publishedAt` is recorded and a notification is sent to the student.
4. Published markups remain editable; the UI displays an **"Edited"** indicator (`isEdited: true`) while preserving the original `publishedAt` timestamp.

---

### Phase 4 — Threaded Discussion

1. Student sees all `Published` markups in the document viewer.
2. Student clicks **Reply** on any markup item.
3. `POST /api/v1/inline-markup-v2/{markupId}/reply` is called with the reply `content`.
4. A child record is created with `threadParentId` pointing to the parent markup.
5. Replies inherit the parent's `documentType` and `studentId`.
6. Replies are displayed chronologically with visual indentation.
7. Instructor can respond to student replies; thread continues until resolved.

---

### Phase 5 — Bulk Operations

| Operation            | Endpoint                               | Description                                                                                          |
| -------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Publish all drafts   | `POST .../submission/{id}/publish-all` | Publishes all draft top-level markups in one call; sends a single notification to the student        |
| Get feedback summary | `GET .../submission/{id}/summary`      | Returns status breakdown, type breakdown, highlight color breakdown, and full markup list            |
| Navigate markups     | _(client-side)_                        | Student filters by `All / Unresolved / Resolved` using the `status` query param on the list endpoint |

---

### Phase 6 — Resolution

1. Student reviews feedback, makes revisions, then clicks **Resolve** on individual items or all at once.
2. `PATCH /api/v1/inline-markup-v2/{markupId}/status` → `{ "status": "Resolved" }`
3. `resolvedAt` is recorded; the markup is visually distinguished (grayed out / checkmark).
4. Instructor can **re-open** a resolved item: `PATCH .../status` → `{ "status": "Published" }` (clears `resolvedAt`).

---

### Phase 7 — Archival

1. Final grade is published in the gradebook.
2. System automatically triggers `POST /api/v1/inline-markup-v2/submission/{submissionId}/archive`.
3. Optional `gradeId` links each markup to the corresponding grade record.
4. All markups and replies become **read-only** (`isArchived: true`).
5. Archived markups remain accessible for audit purposes and learning analytics.

---

## 5. API Endpoints

All endpoints require `Authorization: Bearer <JWT>`.

---

### `POST /api/v1/inline-markup-v2`

**Create a new markup on a student submission**

Creates a markup anchored to a specific submission. Status defaults to `Draft` unless `"Published"` is explicitly passed.

**Request Body** (`application/json`):

| Field            | Type     | Required    | Notes                                                   |
| ---------------- | -------- | ----------- | ------------------------------------------------------- |
| `studentId`      | `uuid`   | ✅          |                                                         |
| `documentType`   | `enum`   | ✅          | `Assignment`, `Exam`, `Project`, `Discussion`           |
| `submissionId`   | `uuid`   | ✅          |                                                         |
| `commentType`    | `enum`   | ✅          | `Text Comment`, `Highlight`, `Annotation`, `Voice Note` |
| `anchorLocation` | `object` | Conditional | Required for `Text Comment` and `Highlight`             |
| `highlightColor` | `enum`   | Conditional | Required for `Highlight`; defaults to `Yellow`          |
| `drawingShape`   | `enum`   | Conditional | Required for `Annotation`                               |
| `boundingBox`    | `object` | Conditional | Required for `Annotation`                               |
| `content`        | `string` | ✅          | Feedback text                                           |
| `status`         | `enum`   | ❌          | Defaults to `Draft`                                     |
| `remark`         | `string` | ❌          | Internal reviewer note                                  |

**Responses:**

- `201 Created` — Markup created; returns `MarkupRecord`
- `400 Bad Request` — Missing required fields
- `401 Unauthorized`
- `500 Internal Server Error`

---

### `GET /api/v1/inline-markup-v2/submission/{submissionId}`

**Get all top-level markups for a submission**

Returns all top-level markups (non-replies) with their nested reply threads.

- Students only see `Published` and `Resolved` markups — `Draft` items are hidden.
- Replies are ordered chronologically.

**Path Parameters:**

| Param          | Type   | Required |
| -------------- | ------ | -------- |
| `submissionId` | `uuid` | ✅       |

**Query Parameters:**

| Param             | Type     | Values                                                  | Description                         |
| ----------------- | -------- | ------------------------------------------------------- | ----------------------------------- |
| `status`          | `enum`   | `Draft`, `Published`, `Resolved`                        | Filter by lifecycle state           |
| `commentType`     | `enum`   | `Text Comment`, `Highlight`, `Annotation`, `Voice Note` | Filter by type                      |
| `includeArchived` | `string` | `true`, `false` (default: `false`)                      | Include post-grade archived markups |

**Responses:**

- `200 OK` — `{ success, data: { submission_id, total, markups[] } }`
- `401 Unauthorized`
- `500 Internal Server Error`

---

### `GET /api/v1/inline-markup-v2/submission/{submissionId}/summary`

**Generate a structured feedback summary for a submission**

Returns aggregated statistics and the full markup list. Useful for generating a printable feedback report.

**Path Parameters:**

| Param          | Type   | Required |
| -------------- | ------ | -------- |
| `submissionId` | `uuid` | ✅       |

**Response `data` shape:**

| Field                       | Type       | Description                             |
| --------------------------- | ---------- | --------------------------------------- |
| `reportName`                | `string`   | `"Inline Markup Feedback Summary"`      |
| `generatedAt`               | `datetime` | Report generation timestamp             |
| `submission_id`             | `uuid`     |                                         |
| `total_markups`             | `integer`  |                                         |
| `status_breakdown`          | `object`   | `{ Draft, Published, Resolved }` counts |
| `type_breakdown`            | `object`   | Count per `commentType`                 |
| `highlight_color_breakdown` | `object`   | Count per highlight color               |
| `unresolved_count`          | `integer`  |                                         |
| `resolved_count`            | `integer`  |                                         |
| `markups`                   | `array`    | Full list of `MarkupRecord` objects     |

**Responses:**

- `200 OK`
- `401 Unauthorized`
- `500 Internal Server Error`

---

### `POST /api/v1/inline-markup-v2/submission/{submissionId}/publish-all`

**Bulk publish all draft markups for a submission**

Sets all `Draft` top-level markups to `Published` in a single operation. Sends a **single** notification to the student. Skips replies and already-archived markups.

**Path Parameters:**

| Param          | Type   | Required |
| -------------- | ------ | -------- |
| `submissionId` | `uuid` | ✅       |

**Responses:**

- `200 OK` — `{ success, data: { published_count } }`
- `401 Unauthorized`
- `500 Internal Server Error`

---

### `POST /api/v1/inline-markup-v2/submission/{submissionId}/archive`

**Archive all markups for a submission upon grade publication**

Marks all markups and replies as archived (`isArchived: true`). Archived markups are read-only. Optionally links markups to the grade record.

**Path Parameters:**

| Param          | Type   | Required |
| -------------- | ------ | -------- |
| `submissionId` | `uuid` | ✅       |

**Request Body** (optional):

| Field     | Type   | Description                               |
| --------- | ------ | ----------------------------------------- |
| `gradeId` | `uuid` | ID of the grade record to link markups to |

**Responses:**

- `200 OK` — `{ success, data: { archived_count } }`
- `401 Unauthorized`
- `500 Internal Server Error`

---

### `GET /api/v1/inline-markup-v2/{markupId}`

**Get a single markup with its full reply thread**

**Path Parameters:**

| Param      | Type   | Required |
| ---------- | ------ | -------- |
| `markupId` | `uuid` | ✅       |

**Responses:**

- `200 OK` — `{ success, data: MarkupWithReplies }`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

---

### `PATCH /api/v1/inline-markup-v2/{markupId}`

**Edit the content of an existing markup**

Updates content, remark, anchor location, highlight color, or bounding box. Sets `isEdited: true`. The original `publishedAt` timestamp is preserved.

**Path Parameters:**

| Param      | Type   | Required |
| ---------- | ------ | -------- |
| `markupId` | `uuid` | ✅       |

**Request Body** (all fields optional):

| Field            | Type     | Description                      |
| ---------------- | -------- | -------------------------------- |
| `content`        | `string` | Updated feedback text            |
| `remark`         | `string` | Updated internal reviewer note   |
| `anchorLocation` | `object` | Updated text range anchor        |
| `highlightColor` | `enum`   | `Yellow`, `Green`, `Red`, `Blue` |
| `boundingBox`    | `object` | Updated bounding box coordinates |

**Responses:**

- `200 OK` — Returns updated `MarkupRecord`
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

---

### `DELETE /api/v1/inline-markup-v2/{markupId}`

**Delete a Draft markup**

Permanently deletes a markup. **Only `Draft` markups can be deleted.** Published or Resolved markups must be retracted via a status update first. Deleting a parent markup **cascades** to delete all its replies.

**Path Parameters:**

| Param      | Type   | Required |
| ---------- | ------ | -------- |
| `markupId` | `uuid` | ✅       |

**Responses:**

- `200 OK` — Markup deleted
- `400 Bad Request` — Markup is not in `Draft` status
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

---

### `PATCH /api/v1/inline-markup-v2/{markupId}/status`

**Update the lifecycle status of a markup**

Transitions a markup between lifecycle states. Valid transitions:

- `Draft` → `Published` — student receives notification; `publishedAt` is set
- `Published` → `Resolved` — `resolvedAt` is set
- `Resolved` → `Published` — re-opens the item; `resolvedAt` is cleared

**Path Parameters:**

| Param      | Type   | Required |
| ---------- | ------ | -------- |
| `markupId` | `uuid` | ✅       |

**Request Body:**

| Field    | Type   | Required | Values                           |
| -------- | ------ | -------- | -------------------------------- |
| `status` | `enum` | ✅       | `Draft`, `Published`, `Resolved` |

**Responses:**

- `200 OK` — Returns updated `MarkupRecord`
- `400 Bad Request` — Invalid status value
- `401 Unauthorized`
- `404 Not Found`
- `500 Internal Server Error`

---

### `POST /api/v1/inline-markup-v2/{markupId}/reply`

**Add a threaded reply to a markup**

Creates a child markup linked to the parent via `threadParentId`. Both instructors and students can reply. Replies inherit `documentType`, `studentId`, and `submissionId` from the parent. Replies are automatically `Published`.

**Path Parameters:**

| Param      | Type   | Required | Description                   |
| ---------- | ------ | -------- | ----------------------------- |
| `markupId` | `uuid` | ✅       | The parent markup to reply to |

**Request Body:**

| Field         | Type     | Required    | Notes                                                            |
| ------------- | -------- | ----------- | ---------------------------------------------------------------- |
| `content`     | `string` | ✅          | Reply text                                                       |
| `commentType` | `enum`   | ❌          | `Text Comment` (default) or `Voice Note`                         |
| `studentId`   | `uuid`   | Conditional | Required if instructor is replying on behalf of a student thread |

**Responses:**

- `201 Created` — Returns new `MarkupRecord`
- `400 Bad Request` — `content` is required
- `401 Unauthorized`
- `404 Not Found` — Parent markup not found
- `500 Internal Server Error`

---

## 6. Comment Type Rules

### Text Comment

- `anchorLocation` must be provided with `type: "text_range"`, `start_index`, `end_index`, and `anchor_text`.
- `highlightColor`, `drawingShape`, and `boundingBox` must be `null`.

### Highlight

- `anchorLocation` must be provided (text range only).
- `highlightColor` is required; defaults to `Yellow` if omitted.
- An associated text `content` is optional but recommended.
- `drawingShape` and `boundingBox` must be `null`.

### Annotation (Draw)

- `boundingBox` `{ x, y, width, height }` must be provided.
- `drawingShape` must be provided: `Rectangle`, `Circle`, `Arrow`, or `Freehand`.
- The original document content **must not** be modified — annotations render as a separate overlay layer.
- `anchorLocation` and `highlightColor` must be `null`.

### Voice Note

- Used for audio feedback; handled via a separate media upload flow.
- Can appear as a reply `commentType`.

---

## 7. Highlight Color Reference

| Color    | Semantic Meaning          | Use Case                                         |
| -------- | ------------------------- | ------------------------------------------------ |
| `Yellow` | Caution / Needs Attention | General comments, areas requiring revision       |
| `Green`  | Praise / Strong Work      | Well-written passages, correct methodology       |
| `Red`    | Critical / Error          | Factual errors, missing citations, logical flaws |
| `Blue`   | Informational / Reference | Suggestions, additional reading, context notes   |

---

## 8. Threading Rules

- A **top-level markup** has `threadParentId: null`.
- A **reply** has `threadParentId` set to the parent markup's `markupId`.
- Replies inherit `documentType`, `studentId`, and `submissionId` from the parent.
- Reply `status` is managed **independently** of the parent.
- Replies are automatically set to `Published` on creation.
- The GET endpoints return top-level markups with their replies nested under a `replies` array, ordered chronologically.
- Deleting a parent markup cascades and deletes all its replies.

---

## 9. Sample Payloads

### Create a Text Comment (Published)

```json
POST /api/v1/inline-markup-v2

{
  "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "documentType": "Assignment",
  "submissionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "commentType": "Text Comment",
  "anchorLocation": {
    "type": "text_range",
    "start_index": 412,
    "end_index": 589,
    "anchor_text": "The author argues that economic growth necessarily..."
  },
  "content": "This argument lacks a supporting citation. Please reference at least one peer-reviewed source.",
  "status": "Published",
  "remark": "Critical gap — flagged for resubmission review"
}
```

### Create a Green Highlight with Praise

```json
POST /api/v1/inline-markup-v2

{
  "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "documentType": "Assignment",
  "submissionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "commentType": "Highlight",
  "anchorLocation": {
    "type": "text_range",
    "start_index": 210,
    "end_index": 290,
    "anchor_text": "the results clearly demonstrate a causal relationship"
  },
  "highlightColor": "Green",
  "content": "Excellent phrasing — this is a well-supported causal claim.",
  "status": "Published"
}
```

### Create a Rectangle Annotation

```json
POST /api/v1/inline-markup-v2

{
  "studentId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "documentType": "Project",
  "submissionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "commentType": "Annotation",
  "drawingShape": "Rectangle",
  "boundingBox": { "x": 120, "y": 340, "width": 200, "height": 50 },
  "content": "This section needs a supporting diagram.",
  "status": "Draft"
}
```

### Student Reply

```json
POST /api/v1/inline-markup-v2/{markupId}/reply

{
  "content": "Thank you — I have added a citation from Smith et al. (2023). Please let me know if this addresses the concern.",
  "commentType": "Text Comment"
}
```

### Publish All Drafts

```json
POST /api/v1/inline-markup-v2/submission/{submissionId}/publish-all

{}
```

### Archive on Grade Publication

```json
POST /api/v1/inline-markup-v2/submission/{submissionId}/archive

{
  "gradeId": "b9c8d7e6-f5a4-3210-fedc-ba9876543210"
}
```

---

## 10. Error Reference

| HTTP Code | Meaning               | Common Cause                                                                                |
| --------- | --------------------- | ------------------------------------------------------------------------------------------- |
| `400`     | Bad Request           | Missing required fields; attempting to delete a non-Draft markup; invalid status transition |
| `401`     | Unauthorized          | Missing or expired Bearer JWT                                                               |
| `404`     | Not Found             | `markupId` or `submissionId` does not exist                                                 |
| `500`     | Internal Server Error | Unexpected server-side failure                                                              |

---

## Endpoint Quick Reference

| Method   | Endpoint                                                         | Description                    |
| -------- | ---------------------------------------------------------------- | ------------------------------ |
| `POST`   | `/api/v1/inline-markup-v2`                                       | Create a markup                |
| `GET`    | `/api/v1/inline-markup-v2/submission/{submissionId}`             | List markups for a submission  |
| `GET`    | `/api/v1/inline-markup-v2/submission/{submissionId}/summary`     | Feedback summary report        |
| `POST`   | `/api/v1/inline-markup-v2/submission/{submissionId}/publish-all` | Bulk publish all drafts        |
| `POST`   | `/api/v1/inline-markup-v2/submission/{submissionId}/archive`     | Archive all markups            |
| `GET`    | `/api/v1/inline-markup-v2/{markupId}`                            | Get single markup with replies |
| `PATCH`  | `/api/v1/inline-markup-v2/{markupId}`                            | Edit markup content            |
| `DELETE` | `/api/v1/inline-markup-v2/{markupId}`                            | Delete a Draft markup          |
| `PATCH`  | `/api/v1/inline-markup-v2/{markupId}/status`                     | Update markup lifecycle status |
| `POST`   | `/api/v1/inline-markup-v2/{markupId}/reply`                      | Add a threaded reply           |
