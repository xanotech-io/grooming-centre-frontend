# Question Batch Import Module — Developer README (AI-Optimized)

> **Purpose:** Maps every UI screen to its API endpoint(s), defines the full data flow, and provides step-by-step implementation instructions for the Upload and Batch Import Exam Questions feature in GCLMS (TC13).

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Entity & Data Model Reference](#2-entity--data-model-reference)
3. [Role-Based Access Matrix](#3-role-based-access-matrix)
4. [Template Column Specification](#4-template-column-specification)
5. [UI Screens → Endpoint Mapping](#5-ui-screens--endpoint-mapping)
6. [Step-by-Step Feature Flows](#6-step-by-step-feature-flows)
7. [Upload Status & Validation Rules](#7-upload-status--validation-rules)
8. [Business Logic the Frontend Must Enforce](#8-business-logic-the-frontend-must-enforce)
9. [API Quick Reference](#9-api-quick-reference)

---

## 1. Module Overview

This module lets instructors and admins populate an examination's question bank in bulk by uploading a structured Excel or CSV file, instead of creating questions one by one.

**End-to-end flow:**

```
Download template → Fill questions → Upload file (+ optional ZIP)
→ System validates → Valid rows imported → Error rows skipped
→ Batch record created → Report generated → User reviews + fixes
```

**Two file inputs on upload:**

```
file     (required) → .xlsx or .csv — the question rows
mediaZip (optional) → .zip — image files referenced via media_reference column
```

**Upload Statuses:** `pending` | `processing` | `success` | `partial_success` | `failed`

**Per-row Error Types:** `error` (row skipped) | `warning` (row imported with notice)

---

## 2. Entity & Data Model Reference

### BatchUpload Object (list view)

| Field                | Type             | Description                                                         |
| -------------------- | ---------------- | ------------------------------------------------------------------- |
| `id`                 | UUID             | Batch upload unique identifier (`uploadId`)                         |
| `examinationId`      | UUID             | Target examination                                                  |
| `courseId`           | UUID             | Associated course                                                   |
| `moduleId`           | UUID \| null     | Associated module (if mapped)                                       |
| `uploadedBy`         | UUID             | User who submitted the upload                                       |
| `fileName`           | string           | Original filename e.g. `questions_batch_1.xlsx`                     |
| `fileType`           | string           | `excel` or `csv`                                                    |
| `defaultDifficulty`  | string \| null   | Fallback difficulty: `Easy`, `Medium`, `Hard`                       |
| `multimediaIncluded` | boolean          | Whether a ZIP was uploaded                                          |
| `uploadStatus`       | string           | `pending`, `processing`, `success`, `partial_success`, `failed`     |
| `totalRows`          | number           | Total question rows in file                                         |
| `validRows`          | number           | Rows that passed all validation                                     |
| `errorRows`          | number           | Rows that failed validation (skipped)                               |
| `importedCount`      | number           | Rows actually imported (may be less than validRows due to slot cap) |
| `completedAt`        | ISO date \| null | When processing finished                                            |
| `createdAt`          | ISO date         | When upload was initiated                                           |
| `course`             | `{ id, title }`  | Course reference                                                    |
| `examination`        | `{ id, title }`  | Examination reference                                               |

### BatchUpload Detail Object (adds to list view)

| Field                 | Type           | Description                                    |
| --------------------- | -------------- | ---------------------------------------------- |
| `multimediaZipName`   | string \| null | ZIP filename if uploaded                       |
| `multimediaProcessed` | boolean        | Whether ZIP assets have been extracted (async) |
| `importErrors`        | ImportError[]  | Full per-row error/warning log                 |

### ImportError Object

| Field        | Type           | Description                                                         |
| ------------ | -------------- | ------------------------------------------------------------------- |
| `id`         | UUID           | Error record ID                                                     |
| `rowNumber`  | number         | Row in the uploaded file (1-indexed)                                |
| `errorType`  | string         | `error` (row skipped) or `warning` (row imported with notice)       |
| `field`      | string         | Column that caused the issue e.g. `correct_answer`, `question_text` |
| `message`    | string         | Human-readable error description                                    |
| `suggestion` | string \| null | How to fix it                                                       |

### Upload Summary Object (from upload + report endpoints)

| Field               | Type   | Description                                                     |
| ------------------- | ------ | --------------------------------------------------------------- |
| `totalRows`         | number | Total rows in file                                              |
| `validRows`         | number | Rows passing validation                                         |
| `errorRows`         | number | Rows with errors (skipped)                                      |
| `importedCount`     | number | Rows actually inserted into question bank                       |
| `skippedDueToSlots` | number | Valid rows skipped because exam question slot limit was reached |

---

## 3. Role-Based Access Matrix

| Feature                 | Instructor | Admin | Super Admin |
| ----------------------- | ---------- | ----- | ----------- |
| Download template       | ✅         | ✅    | ✅          |
| Upload question file    | ✅         | ✅    | ✅          |
| List batch uploads      | Own only   | All   | All         |
| Get single batch detail | Own only   | All   | All         |
| Get batch report        | Own only   | All   | All         |
| Delete batch record     | ❌         | ✅    | ✅          |

> **Deleting a batch record does NOT delete the imported questions** — it only removes the upload audit record and its error log. Make this clear in the confirmation dialog.

---

## 4. Template Column Specification

This is what the downloaded `.xlsx` template contains. The frontend must reference these exact column names in help text, previews, and error messages.

| Column             | Required        | Applies To           | Description                                                                                     |
| ------------------ | --------------- | -------------------- | ----------------------------------------------------------------------------------------------- |
| `question_text`    | **Yes**         | All types            | Full question statement — must be non-empty                                                     |
| `question_type`    | No              | All                  | `mcq` / `essay` / `true_false` / `fill_blank` / `matching` / `short_answer` — defaults to `mcq` |
| `difficulty_level` | No              | All                  | `Easy` / `Medium` / `Hard` — falls back to `defaultDifficulty` if blank                         |
| `marks`            | No              | All                  | Positive integer — defaults to `1`                                                              |
| `section`          | No              | All                  | Section or topic label                                                                          |
| `tags`             | No              | All                  | Comma-separated e.g. `"algorithms,searching"`                                                   |
| `rubric`           | No              | Essay / Short Answer | Grading rubric text                                                                             |
| `option_a`         | **Conditional** | MCQ only             | Text for option A — required for MCQ                                                            |
| `option_b`         | **Conditional** | MCQ only             | Text for option B — required for MCQ                                                            |
| `option_c`         | No              | MCQ only             | Optional option C                                                                               |
| `option_d`         | No              | MCQ only             | Optional option D                                                                               |
| `correct_answer`   | **Conditional** | MCQ + True/False     | MCQ: `A`/`B`/`C`/`D` · True/False: `A`=True, `B`=False                                          |
| `media_reference`  | No              | All                  | Filename of image inside companion ZIP e.g. `cell_diagram.png`                                  |

> **Do not modify header row names** — the parser maps columns by exact header name. Altered headers cause the entire file to fail parsing.

---

## 5. UI Screens → Endpoint Mapping

---

### Screen 1: Batch Import Landing / Upload Page

**Route:** `/instructor/examinations/:examinationId/questions/import`

**Purpose:** The primary entry point — download template, upload file, and initiate import.

**Endpoints used:**

```
GET  /api/v1/question-batch-import-v2/template/download   → download Excel template
POST /api/v1/question-batch-import-v2/upload              → upload + import
```

**UI Layout:**

```
BatchImportPage
│
├── Step 1 — Download Template
│   ├── "Download Excel Template" button
│   │   → GET /template/download
│   │   → Triggers browser file download (.xlsx)
│   └── Help text: "Fill in the Questions sheet. Do not rename column headers."
│       Link: "View column guide" → expands column reference table (see Section 4)
│
├── Step 2 — Prepare Your File
│   └── Info panel showing required vs optional columns summary
│       Column types highlighted per question type:
│       ├── MCQ: option_a, option_b, correct_answer required
│       ├── True/False: correct_answer = A (True) or B (False)
│       └── Essay/Short Answer: rubric recommended, no options needed
│
├── Step 3 — Upload
│   │
│   ├── BatchSettingsSection
│   │   ├── examinationId   → read from route param (hidden, not a visible field)
│   │   └── defaultDifficulty → select: Easy | Medium | Hard | (leave blank = null)
│   │       Help: "Applied to rows where difficulty_level column is empty"
│   │
│   ├── FileUploadZone (primary file)
│   │   ├── Accept: .xlsx, .csv only
│   │   ├── Show file name + size after selection
│   │   ├── "Clear" button to deselect
│   │   └── Client-side validation:
│   │       - File type must be .xlsx or .csv
│   │       - File must not be empty
│   │
│   ├── MediaZipUploadZone (optional)
│   │   ├── Accept: .zip only
│   │   ├── Label: "Upload media ZIP (optional)"
│   │   ├── Help: "Include image files referenced in the media_reference column"
│   │   └── Show ZIP filename after selection
│   │
│   └── "Import Questions" button → POST /upload (multipart/form-data)
│       Disabled until primary file is selected
│       Shows spinner + "Processing..." during upload
│
└── After submission → navigate to Screen 3 (Import Result) with returned uploadId
```

---

### Screen 2: Batch Upload History List

**Route:** `/instructor/examinations/:examinationId/questions/import/history`
**Also accessible from:** Admin panel at `/admin/question-imports`

**Purpose:** List all batch upload records with status, summary counts, and quick access to reports.

**Endpoint:**

```
GET /api/v1/question-batch-import-v2
     ?examinationId=:uuid
     &uploadStatus=:status   (optional filter)
     &page=1
     &limit=20
```

**UI Layout:**

```
BatchUploadHistoryPage
│
├── Filters row
│   ├── examinationId filter (Admin: any exam; Instructor: pre-filtered to own)
│   ├── uploadStatus filter → select: All | pending | processing | success | partial_success | failed
│   └── courseId filter (Admin only)
│
└── UploadsTable
    Columns: File Name | Exam | Course | Status | Total | Valid | Errors | Imported | Uploaded By | Date | Actions

    Status chip colors:
    ├── pending        → grey
    ├── processing     → blue (animated)
    ├── success        → green
    ├── partial_success → amber
    └── failed         → red

    Actions per row:
    ├── View Report    → /import/history/:uploadId/report (Screen 4)
    ├── View Details   → GET /:uploadId (Screen 3 in read mode)
    └── Delete         → DELETE /:uploadId (Admin only)
        Confirmation: "Delete this upload record?
                       Imported questions will NOT be deleted — only the upload log."
│
└── Pagination controls
    (pagination.total, pagination.page, pagination.totalPages from response)
```

---

### Screen 3: Import Result / Batch Detail Page

**Route:** `/instructor/examinations/:examinationId/questions/import/:uploadId`

**Purpose:** Shown immediately after upload completes AND accessible later from history. Displays the summary counts and full per-row error/warning log.

**Endpoint:**

```
GET /api/v1/question-batch-import-v2/:uploadId
```

**UI Layout:**

```
ImportResultPage
│
├── ResultSummaryHeader
│   ├── uploadStatus chip (success / partial_success / failed)
│   ├── fileName + fileType
│   ├── examination.title + course.title
│   ├── defaultDifficulty (if set)
│   ├── multimediaIncluded chip (if true)
│   │   └── multimediaProcessed: "Media processing: Complete ✅" or "Pending ⏳"
│   └── completedAt timestamp
│
├── KPI Summary Row (4 metric cards)
│   ├── Total Rows      → data.totalRows
│   ├── ✅ Imported     → data.importedCount
│   ├── ⚠️ Warnings    → count of importErrors where errorType === "warning"
│   └── ❌ Errors       → data.errorRows
│
├── ImportErrorsTable (if importErrors.length > 0)
│   Filter tabs: All | Errors | Warnings
│   Columns: Row # | Error Type | Field | Message | Suggestion
│   Row styling:
│   ├── errorType === "error"   → red row / ❌ chip
│   └── errorType === "warning" → amber row / ⚠️ chip
│
├── Action Buttons
│   ├── "Download Full Report" → GET /:uploadId/report (links to Screen 4 or downloads)
│   ├── "Upload Fixed File"    → returns to Screen 1 (pre-filled with same examinationId)
│   └── "View Imported Questions" → navigates to question bank for this exam
│
└── Note (if skippedDueToSlots > 0):
    "⚠️ {skippedDueToSlots} valid rows were not imported because the examination
     has reached its maximum question limit."
```

---

### Screen 4: Validation & Import Report Page

**Route:** `/instructor/examinations/:examinationId/questions/import/:uploadId/report`

**Purpose:** Structured report view for a completed batch upload — mirrors Screen 3 but with a report-optimized layout and additional context fields. Can be retrieved at any point after upload completion.

**Endpoint:**

```
GET /api/v1/question-batch-import-v2/:uploadId/report
```

**UI Layout:**

```
ImportReportPage
│
├── Report Header
│   ├── uploadId (truncated UUID)
│   ├── fileName + fileType
│   ├── uploadStatus chip
│   ├── examination.title + course.title
│   ├── defaultDifficulty
│   ├── multimediaIncluded + multimediaZipName + multimediaProcessed
│   ├── createdAt + completedAt
│   └── "Export Report" button → client-side CSV export of errors/warnings array
│
├── Summary Section
│   ├── totalRows    → {n} rows in file
│   ├── validRows    → {n} passed validation
│   ├── errorRows    → {n} skipped (errors)
│   └── importedCount → {n} successfully imported
│
├── Errors Section (only if errors[].length > 0)
│   Label: "Rows Skipped — Fix and Re-upload"
│   Table: Row | Field | Error | Suggestion
│   Each row is a question that was NOT imported
│
├── Warnings Section (only if warnings[].length > 0)
│   Label: "Rows Imported with Notices"
│   Table: Row | Field | Message
│   Each row WAS imported but had a non-blocking issue (e.g. duplicate detected)
│
└── Footer
    ├── "Upload Corrected File" → Screen 1
    └── "Back to History"       → Screen 2
```

---

## 6. Step-by-Step Feature Flows

---

### Flow A: Instructor Downloads Template and Prepares File

```
1. Instructor navigates to /examinations/:examinationId/questions/import
2. Instructor clicks "Download Excel Template"
3. App calls GET /api/v1/question-batch-import-v2/template/download
4. Browser triggers .xlsx file download
5. Instructor opens the file:
   - "Questions" sheet: fills in rows following column spec
   - "Instructions" sheet: reads field guidance
6. Instructor prepares any image files in a folder (for ZIP upload if needed)
7. If using media_reference column: instructor zips the images into a single .zip file
8. Instructor saves the .xlsx file
```

---

### Flow B: Instructor Uploads a Question File (No Media)

```
1. Instructor is on Screen 1 (/import)
2. Selects defaultDifficulty if needed (e.g. "Medium")
3. Selects .xlsx or .csv file in the FileUploadZone
4. Client-side validation:
   - File extension is .xlsx or .csv → ✅ proceed
   - File is not empty → ✅ proceed
5. Leaves mediaZip empty
6. Clicks "Import Questions"
7. App submits POST /upload as multipart/form-data:
   - file: the selected Excel/CSV
   - examinationId: from route param
   - defaultDifficulty: from select (omit if not selected)
8. Button shows spinner: "Processing..."
9. On 201:
   a. Extract uploadId from response.data.uploadId
   b. Navigate to /import/:uploadId (Screen 3)
   c. Render result using response data immediately (no extra fetch needed)
10. On 400 "Unsupported file type":
    → toast: "Please upload an Excel (.xlsx) or CSV (.csv) file"
    → stay on Screen 1
11. On 400 "No valid course rows":
    → toast: "No valid question rows found. Check that your file has a question_text column."
12. On 404 "Examination not found":
    → toast: "Examination not found. Please check the examination ID."
```

---

### Flow C: Instructor Uploads with Multimedia ZIP

```
1. Instructor is on Screen 1
2. Fills standard settings (defaultDifficulty, file selection)
3. In the .xlsx file, media_reference column contains filenames: e.g. "cell_diagram.png"
4. Instructor selects the .zip archive in MediaZipUploadZone
   - Client-side: accept only .zip files
5. Clicks "Import Questions"
6. App submits POST /upload with both:
   - file: the .xlsx
   - mediaZip: the .zip
   - examinationId + defaultDifficulty
7. On 201:
   a. Navigate to Screen 3
   b. Check multimediaIncluded === true in response
   c. Check multimediaProcessed:
      → false: show "⏳ Media processing in progress — ZIP extraction is async and may take a moment"
      → true:  show "✅ Media processed"
8. Instructor can refresh Screen 3 / Screen 4 to check multimediaProcessed status
```

---

### Flow D: Instructor Reviews Import Results

```
1. Import completes → instructor is on Screen 3 (/import/:uploadId)
2. App calls GET /api/v1/question-batch-import-v2/:uploadId to load full detail
3. Reads summary: totalRows, importedCount, errorRows
4. Checks uploadStatus:
   - "success"        → all rows imported, no errors
   - "partial_success" → some rows imported, some skipped
   - "failed"         → no rows imported

5. If errorRows > 0:
   - ImportErrorsTable shows all rows with errorType === "error"
   - Each row shows: rowNumber, field, message, suggestion
   - Instructor notes which rows to fix

6. If warnings present:
   - importErrors where errorType === "warning" — rows WERE imported
   - e.g. "Similar question already exists" — instructor reviews if it's a true duplicate

7. If skippedDueToSlots > 0:
   - Show notice: "X valid rows skipped — examination question slot limit reached"
   - Instructor may need to increase exam question limit before re-uploading

8. Instructor clicks "Download Full Report" → Screen 4 (full report with export)
9. Instructor clicks "Upload Fixed File" → returns to Screen 1 to fix and re-upload
```

---

### Flow E: Instructor Fixes Errors and Re-Uploads

```
1. Instructor reviews error rows from Screen 3 or Screen 4
2. Opens original .xlsx file
3. Navigates to flagged row numbers
4. Fixes issues per suggestions:
   - row 45 "Correct answer 'E' not valid" → changes correct_answer to A/B/C/D
   - row 67 "Missing question_text" → adds the question text
5. Saves corrected file
6. Returns to Screen 1 (via "Upload Fixed File" button or navigation)
7. Uploads the corrected file (same exam, same settings)
8. New batch record created (new uploadId)
9. New result shown on Screen 3

Note: Re-uploading creates a NEW batch record — it does not replace or retry
the old one. Questions from the original successful rows are already imported
and are not re-imported (duplicate detection warns but still imports).
```

---

### Flow F: Admin Views All Batch Uploads

```
1. Admin navigates to /admin/question-imports
2. App calls GET /api/v1/question-batch-import-v2 (no examinationId filter)
   → Returns all uploads across all instructors/courses
3. Admin uses filters: uploadStatus, examinationId, courseId
4. Clicks "View Report" on any row → Screen 4 for that uploadId
5. Admin clicks "Delete" on a completed/failed record
6. Confirmation dialog: "Delete this upload record?
   Imported questions will NOT be removed — only this log entry is deleted."
7. Admin confirms → DELETE /api/v1/question-batch-import-v2/:uploadId
8. On 200: remove row from table, toast "Upload record deleted"
9. On 403: show "Admin or Super Admin role required"
```

---

### Flow G: Export Report as CSV

```
This is a client-side operation — no additional API call needed.

1. Instructor/Admin is on Screen 4 (report page)
2. Clicks "Export Report"
3. Frontend serializes response.data.errors and response.data.warnings arrays
   into a CSV:
   Row,Type,Field,Error/Message,Suggestion
   45,Error,correct_answer,"Correct answer 'E' not found in options A-D","Use A/B/C/D"
   12,Warning,question_text,"Similar question already exists",""
4. Triggers browser file download as "{fileName}_report.csv"
5. No API call — purely client-side from the already-fetched report data
```

---

## 7. Upload Status & Validation Rules

### Upload Status Meanings

| Status            | Meaning                                                | UI Treatment        |
| ----------------- | ------------------------------------------------------ | ------------------- |
| `pending`         | Upload received, not yet processed                     | Grey chip + spinner |
| `processing`      | File being parsed and validated                        | Blue animated chip  |
| `success`         | All rows imported successfully                         | Green chip          |
| `partial_success` | Some rows imported, some skipped                       | Amber chip          |
| `failed`          | No rows imported (file-level error or all rows failed) | Red chip            |

### Per-Row Validation Rules (enforced by API)

| Rule                                               | Applies To | Error if violated                                            |
| -------------------------------------------------- | ---------- | ------------------------------------------------------------ |
| `question_text` must be non-empty                  | All types  | Row skipped (error)                                          |
| `question_type` must be a known value              | All types  | Defaults to `mcq` if blank; error if unrecognised            |
| `difficulty_level` must be Easy/Medium/Hard        | All types  | Falls back to `defaultDifficulty`; null if neither set       |
| `marks` must be a positive integer                 | All types  | Defaults to `1` if blank; error if negative/non-integer      |
| `option_a` + `option_b` required for MCQ           | MCQ only   | Row skipped (error)                                          |
| `correct_answer` required for MCQ                  | MCQ only   | Row skipped (error)                                          |
| `correct_answer` must reference a non-empty option | MCQ only   | Row skipped (error) — e.g. choosing D when option_d is empty |
| True/False `correct_answer` must be A or B         | True/False | Row skipped (error)                                          |
| Duplicate question text in question bank           | All types  | Row imported with warning (not skipped)                      |

### Slot Cap Rule

- The examination has an `amountOfQuestions` limit
- If valid imported rows would exceed this limit, excess rows are skipped
- `summary.skippedDueToSlots` shows how many were skipped for this reason
- These are NOT counted as `errorRows` — they were valid but couldn't be inserted

---

## 8. Business Logic the Frontend Must Enforce

1. **File type restriction — two separate upload zones** — the primary file zone accepts only `.xlsx` and `.csv`. The media ZIP zone accepts only `.zip`. Reject anything else client-side before the API call.

2. **`examinationId` comes from the route, not a form field** — always read it from the URL param and pass it as a form field in the multipart body. Never show it as an editable input.

3. **Immediately use the `POST /upload` response for Screen 3** — the upload endpoint returns the full result including errors/warnings in the 201 response. Navigate to Screen 3 and render directly from this response. Only call `GET /:uploadId` when loading Screen 3 from history (not immediately after upload).

4. **`error` rows are skipped; `warning` rows are imported** — this distinction is critical for the UI. Never show warnings in the "Errors — fix and re-upload" section. Keep them visually and structurally separate.

5. **`skippedDueToSlots` is not an error** — show it as an informational notice, not in the error table. The rows were valid; the exam just has no remaining slots.

6. **Re-upload creates a new batch, not a retry** — there is no retry endpoint in this module. Each upload is independent. Do not imply that re-uploading will "patch" the old batch.

7. **Delete confirmation must state questions are preserved** — the delete action only removes the upload audit record. The confirmation dialog must explicitly say imported questions are not affected.

8. **`multimediaProcessed` may be false immediately after upload** — ZIP processing is async. Poll or prompt the user to refresh if `multimediaIncluded === true` and `multimediaProcessed === false`.

9. **Do not rename template column headers** — surface this in help text on Screen 1. A common mistake is renaming `option_a` to "Option A" or similar, which breaks parsing.

10. **Instructor sees own uploads only; Admin sees all** — the `GET /` list endpoint handles scoping server-side, but the UI should still reflect this: instructors get no filter for "uploaded by", admins get all records.

11. **Export is client-side** — the report export (CSV) is built from the already-fetched API data. No separate download endpoint exists for the report. Serialize `errors[]` and `warnings[]` from the report response locally.

---

## 9. API Quick Reference

| Method   | Endpoint                                             | Role                | UI Trigger                         |
| -------- | ---------------------------------------------------- | ------------------- | ---------------------------------- |
| `GET`    | `/api/v1/question-batch-import-v2/template/download` | All                 | "Download Excel Template" button   |
| `POST`   | `/api/v1/question-batch-import-v2/upload`            | Instructor / Admin  | "Import Questions" form submit     |
| `GET`    | `/api/v1/question-batch-import-v2`                   | Instructor / Admin  | Batch history list page load       |
| `GET`    | `/api/v1/question-batch-import-v2/:uploadId`         | Instructor / Admin  | Import result detail page load     |
| `DELETE` | `/api/v1/question-batch-import-v2/:uploadId`         | Admin / Super Admin | Delete button (after confirmation) |
| `GET`    | `/api/v1/question-batch-import-v2/:uploadId/report`  | Instructor / Admin  | Report page load + export source   |

---

_Generated for GCLMS — Question Batch Import Module (TC13 / Question Bank)_
