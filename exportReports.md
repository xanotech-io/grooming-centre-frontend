# TC17 – Export Reports (PDF, Excel, CSV)

## Overview

The **Export Reports module** enables authorized users to generate and download system data in multiple formats — PDF, Excel, CSV, JSON, and XML. It covers standard report generation as well as filtered data extractions, handles all output types (attendance, gradebook, assessment results, exam results, course rosters, compliance records, and more), uploads generated files to secure cloud storage (Azure Blob Storage), and returns a time-limited download link valid for 7 days. All operations are logged for auditing.

**Base URL (Production):** `https://gclms.xanotech.org`
**Base URL (Local):** `http://localhost:8089`
**Authentication:** All endpoints require `Authorization: Bearer <JWT>`

---

## Table of Contents

1. Architecture Overview
2. API Endpoints Reference
3. Operation Types
4. UI Sections and API Mapping
   - 4.1 Export / Extract Form
   - 4.2 Admin Export History Table
   - 4.3 My Exports (User Self-Service View)
   - 4.4 Export Detail View
   - 4.5 KPI Dashboard
5. Complete Step-by-Step Flow
6. Request and Response Structures
7. Export Record — Full Field Reference
8. KPI Definitions
9. Status Values and Enum Reference
10. Filter Fields Reference
11. Validation Rules
12. Error Handling

---

## 1. Architecture Overview

```
USER (Admin / Instructor / Student)
+------------------------------------------------------+
|  Export / Extract Form                               |
|  Select report type · format · filters · confirm     |
+------------------------------------------------------+
              |
              v POST /api/v1/export-reports-v2
+------------------------------------------------------+
|  Backend Processing                                  |
|  1. Validate permissions                             |
|  2. Retrieve filtered dataset                        |
|  3. Apply format-specific transformation             |
|  4. Generate file                                    |
|  5. Upload to Azure Blob Storage                     |
|  6. Return download link (7-day expiry)              |
|  7. Log operation for audit                          |
+------------------------------------------------------+
              |
              v
+------------------------------------------------------+
|  USER DOWNLOAD                                       |
|  fileUrl returned in response -> browser download    |
+------------------------------------------------------+

ADMIN VIEWS
+------------------------------------------------------+
|  KPI Dashboard    <- GET /export-reports-v2/kpis     |
|  Admin History    <- GET /export-reports-v2          |
|  Export Detail    <- GET /export-reports-v2/{id}     |
+------------------------------------------------------+

USER SELF-SERVICE
+------------------------------------------------------+
|  My Exports       <- GET /export-reports-v2/my-exports|
+------------------------------------------------------+
```

---

## 2. API Endpoints Reference

| #   | Method | Endpoint                             | Purpose                                    |
| --- | ------ | ------------------------------------ | ------------------------------------------ |
| 1   | POST   | /api/v1/export-reports-v2            | Generate and export or extract a report    |
| 2   | GET    | /api/v1/export-reports-v2            | List all export/extraction records — admin |
| 3   | GET    | /api/v1/export-reports-v2/kpis       | Combined export/import/extraction KPIs     |
| 4   | GET    | /api/v1/export-reports-v2/my-exports | Current user's export history              |
| 5   | GET    | /api/v1/export-reports-v2/{exportId} | Single export/extraction record detail     |

---

## 3. Operation Types

The module distinguishes between two operation types, both handled by the same `POST /api/v1/export-reports-v2` endpoint:

| operationType | Description                                                                                                                |
| ------------- | -------------------------------------------------------------------------------------------------------------------------- |
| export        | Standard report generation — produces a complete formatted report (PDF/Excel/CSV/JSON/XML) for a given report type         |
| extraction    | Filtered data extraction — pulls a specific subset of data using filter criteria for analysis, integration, or offline use |

Both types follow the same request/response shape and produce a downloadable file with a 7-day expiry link.

---

## 4. UI Sections and API Mapping

### 4.1 Export / Extract Form

**Location:** Export button present on any report or data view throughout the LMS. Clicking it opens the export form as a modal or panel.

**Endpoint:** `POST /api/v1/export-reports-v2`
**Trigger:** User clicks the Export button and submits the form.

#### Form Fields

| Field                    | Type              | Required | Allowed Values             | Description                                                |
| ------------------------ | ----------------- | -------- | -------------------------- | ---------------------------------------------------------- |
| operationType            | string            | No       | export, extraction         | Defaults to export if omitted                              |
| reportType               | string            | Yes      | See full list below        | Type of LMS data to export                                 |
| exportFormat             | string            | Yes      | pdf, excel, csv, json, xml | Output file format                                         |
| reportName               | string            | No       | —                          | Custom label for this export; defaults to report type name |
| filters.courseId         | UUID              | No       | —                          | Scope to a specific course                                 |
| filters.studentId        | UUID              | No       | —                          | Scope to a specific student                                |
| filters.gradebookId      | UUID              | No       | —                          | Scope to a specific gradebook                              |
| filters.departmentId     | UUID              | No       | —                          | Scope to a department                                      |
| filters.startDate        | date (YYYY-MM-DD) | No       | —                          | Data from this date                                        |
| filters.endDate          | date (YYYY-MM-DD) | No       | —                          | Data up to this date                                       |
| filters.attendanceStatus | string            | No       | —                          | Filter attendance records by status                        |
| filters.deliveryMode     | string            | No       | —                          | Filter by course delivery mode                             |
| filters.status           | string            | No       | —                          | Filter records by status                                   |

#### Supported reportType Values

| Value               | Report                                       |
| ------------------- | -------------------------------------------- |
| attendance          | Student attendance records                   |
| gradebook           | Course gradebook data                        |
| assessment          | Assessment results and analytics             |
| exam_results        | Examination result data                      |
| course_roster       | Enrolled students per course                 |
| student_records     | Student profile and academic records         |
| course_information  | Course metadata and structure                |
| compliance_records  | Compliance training and notification records |
| performance_reports | Student/instructor performance summaries     |
| user_records        | Platform user account data                   |

#### Sample Request

```json
POST /api/v1/export-reports-v2

{
  "operationType": "export",
  "reportType": "attendance",
  "exportFormat": "pdf",
  "reportName": "October Attendance Report",
  "filters": {
    "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "startDate": "2026-10-01",
    "endDate": "2026-10-31"
  }
}
```

#### Sample Response (201 Created)

```json
{
  "success": true,
  "message": "Export generated successfully",
  "data": {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "operationType": "export",
    "reportType": "attendance",
    "reportName": "October Attendance Report",
    "exportFormat": "pdf",
    "exportedBy": "user-uuid",
    "exporter": {
      "id": "user-uuid",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com"
    },
    "filters": {
      "courseId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "startDate": "2026-10-01",
      "endDate": "2026-10-31"
    },
    "status": "completed",
    "fileName": "October_Attendance_Report_20261031_110500.pdf",
    "fileUrl": "https://secure-storage.blob.core.windows.net/reports/download/abc123",
    "fileSizeMb": 3.4,
    "expiryDate": "2026-11-07",
    "totalRecords": 240,
    "errorMessage": null,
    "createdAt": "2026-10-31T11:05:00Z",
    "updatedAt": "2026-10-31T11:05:00Z"
  }
}
```

#### UI Behavior After Successful Export

1. Show success toast: _"Export ready. Your file is available for download."_
2. Display a **Download** button that opens `fileUrl` in a new tab.
3. Show expiry notice: _"This link expires on [expiryDate]."_
4. Append the new record to the user's My Exports list.

#### Response Codes

| Code | UI Behavior                                                             |
| ---- | ----------------------------------------------------------------------- |
| 201  | Show download link with expiry notice                                   |
| 400  | Show inline form validation error from message field                    |
| 401  | Redirect to login                                                       |
| 500  | Show error banner: "Export failed. Please try again." with Retry button |

---

### 4.2 Admin Export History Table

**Location:** Admin-only "Export History" or "Data Operations" management page.

**Endpoint:** `GET /api/v1/export-reports-v2`
**Role:** Admin only
**Trigger:** On page load and on any filter change.

#### Filter Controls

| Control        | Query Param   | Allowed Values             |
| -------------- | ------------- | -------------------------- |
| Operation Type | operationType | export, extraction         |
| Report Type    | reportType    | Full list from Section 4.1 |
| Status         | status        | pending, completed, failed |
| Format         | exportFormat  | pdf, excel, csv, json, xml |
| Page           | page          | Integer (default 1)        |
| Limit          | limit         | Integer (default 20)       |

#### Table Columns

| Column      | Field                                  | Display Notes                                                    |
| ----------- | -------------------------------------- | ---------------------------------------------------------------- |
| Report Name | reportName                             | —                                                                |
| Report Type | reportType                             | Badge                                                            |
| Operation   | operationType                          | Badge: Export (blue) / Extraction (purple)                       |
| Format      | exportFormat                           | Badge: colored per format                                        |
| Exported By | exporter.firstName + exporter.lastName | —                                                                |
| Records     | totalRecords                           | Integer                                                          |
| File Size   | fileSizeMb                             | XX MB                                                            |
| Status      | status                                 | Badge: green (completed) / amber (pending) / red (failed)        |
| Created At  | createdAt                              | Formatted datetime                                               |
| Expiry      | expiryDate                             | Red if past today                                                |
| Download    | fileUrl                                | Download icon — disabled if link expired or status not completed |
| Error       | errorMessage                           | Tooltip icon shown if not null                                   |

#### Sample Request

```
GET /api/v1/export-reports-v2
  ?operationType=export&status=completed&exportFormat=pdf
  &page=1&limit=20
Authorization: Bearer <token>
```

#### Sample Response (200 OK)

```json
{
  "success": true,
  "data": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3,
    "exports": [
      {
        "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        "operationType": "export",
        "reportType": "attendance",
        "reportName": "October Attendance Report",
        "exportFormat": "pdf",
        "exportedBy": "user-uuid",
        "exporter": { "id": "...", "firstName": "Jane", "lastName": "Smith", "email": "..." },
        "filters": { ... },
        "status": "completed",
        "fileName": "October_Attendance_Report_20261031.pdf",
        "fileUrl": "https://secure-storage.blob.core.windows.net/.../abc123",
        "fileSizeMb": 3.4,
        "expiryDate": "2026-11-07",
        "totalRecords": 240,
        "errorMessage": null,
        "createdAt": "2026-10-31T11:05:00Z",
        "updatedAt": "2026-10-31T11:05:00Z"
      }
    ]
  }
}
```

---

### 4.3 My Exports (User Self-Service View)

**Location:** User's personal "My Exports" or "Download History" section.

**Endpoint:** `GET /api/v1/export-reports-v2/my-exports`
**Trigger:** On load and on filter change. Backend scopes automatically to the authenticated user — no userId parameter is sent.

#### Filter Controls (same as admin table)

| Control        | Query Param   | Allowed Values             |
| -------------- | ------------- | -------------------------- |
| Operation Type | operationType | export, extraction         |
| Report Type    | reportType    | Full list from Section 4.1 |
| Status         | status        | pending, completed, failed |
| Format         | exportFormat  | pdf, excel, csv, json, xml |
| Page           | page          | Integer (default 1)        |
| Limit          | limit         | Integer (default 20)       |

#### List Columns

| Column      | Field        | Display Notes                                              |
| ----------- | ------------ | ---------------------------------------------------------- |
| Report Name | reportName   | —                                                          |
| Report Type | reportType   | Badge                                                      |
| Format      | exportFormat | Badge                                                      |
| Status      | status       | Colored badge                                              |
| File Size   | fileSizeMb   | XX MB                                                      |
| Records     | totalRecords | —                                                          |
| Created     | createdAt    | Formatted datetime                                         |
| Expires     | expiryDate   | Red if past today; "Expired" label if link no longer valid |
| Download    | fileUrl      | Download button — disabled if expired or failed            |

#### Sample Request

```
GET /api/v1/export-reports-v2/my-exports
  ?status=completed&page=1&limit=20
Authorization: Bearer <token>
```

---

### 4.4 Export Detail View

**Location:** Opens when a user clicks a row in the admin history table or the My Exports list.

**Endpoint:** `GET /api/v1/export-reports-v2/{exportId}`
**Trigger:** User clicks an export record row.
**Access:** Admins can view any record. Other users can only view their own.

#### Content Rendered

| Label           | Field                                  | Notes                                                    |
| --------------- | -------------------------------------- | -------------------------------------------------------- |
| Export ID       | id                                     | Full UUID                                                |
| Report Name     | reportName                             | —                                                        |
| Operation Type  | operationType                          | Badge                                                    |
| Report Type     | reportType                             | Badge                                                    |
| Format          | exportFormat                           | Badge                                                    |
| Exported By     | exporter.firstName + exporter.lastName | —                                                        |
| Exporter Email  | exporter.email                         | —                                                        |
| Status          | status                                 | Colored badge                                            |
| Total Records   | totalRecords                           | Integer                                                  |
| File Size       | fileSizeMb                             | XX MB                                                    |
| File Name       | fileName                               | —                                                        |
| Download Link   | fileUrl                                | Download button; shows expiry warning if close to expiry |
| Expiry Date     | expiryDate                             | Red if within 24 hours; "Expired" if past                |
| Filters Applied | filters                                | Key-value display of all active filter criteria          |
| Error Message   | errorMessage                           | Shown in red if not null; only appears on failed exports |
| Created At      | createdAt                              | Formatted datetime                                       |
| Updated At      | updatedAt                              | Formatted datetime                                       |

#### Response Codes

| Code | UI Behavior                                     |
| ---- | ----------------------------------------------- |
| 200  | Render detail panel                             |
| 401  | Redirect to login                               |
| 404  | Show "Export record not found" with Back button |
| 500  | Show error banner with Retry                    |

---

### 4.5 KPI Dashboard

**Location:** Admin-only KPI section at the top of the Export Reports management page, or within the platform-wide analytics dashboard.

**Endpoint:** `GET /api/v1/export-reports-v2/kpis`
**Trigger:** On page load. Optionally filtered by date range.

#### Filter Controls

| Control    | Query Param            | Description                            |
| ---------- | ---------------------- | -------------------------------------- |
| Start Date | startDate (YYYY-MM-DD) | Operations from this date (inclusive)  |
| End Date   | endDate (YYYY-MM-DD)   | Operations up to this date (inclusive) |

#### KPI Cards Displayed

**Overall**

| Card                 | Field           | Format  | Description                                 |
| -------------------- | --------------- | ------- | ------------------------------------------- |
| Total Operations     | totalOperations | Integer | Combined export + extraction + import count |
| Overall Success Rate | successRate     | XX%     | (successful ops / total ops) x 100          |

**Export / Extraction KPIs** (from data.exports)

| Card                | Field                 | Format  | Description                          |
| ------------------- | --------------------- | ------- | ------------------------------------ |
| Total Exports       | exports.total         | Integer | All export and extraction operations |
| Successful          | exports.successful    | Integer | Completed without error              |
| Failed              | exports.failed        | Integer | Red badge if > 0                     |
| Export Success Rate | exports.successRate   | XX%     | (successful / total) x 100           |
| Avg File Size       | exports.avgFileSizeMb | X.X MB  | Average size of generated files      |

**Import KPIs** (from data.imports — shown for reference; primary focus for TC17 is exports)

| Card                 | Field                       | Description                          |
| -------------------- | --------------------------- | ------------------------------------ |
| Total Imports        | imports.total               | All import operations                |
| Import Success Rate  | imports.successRate         | (successful / total) x 100           |
| Total Rows Processed | imports.totalRowsProcessed  | Rows across all imports              |
| Data Accuracy Rate   | imports.dataAccuracyRate    | (successful rows / total rows) x 100 |
| Avg Processing Time  | imports.avgProcessingTimeMs | In milliseconds                      |

#### Sample Request

```
GET /api/v1/export-reports-v2/kpis?startDate=2026-01-01&endDate=2026-03-31
Authorization: Bearer <token>
```

#### Sample Response (200 OK)

```json
{
  "success": true,
  "data": {
    "totalOperations": 310,
    "successRate": 94,
    "exports": {
      "total": 180,
      "successful": 172,
      "failed": 8,
      "successRate": 96,
      "avgFileSizeMb": 4.7
    },
    "imports": {
      "total": 130,
      "successful": 121,
      "failed": 9,
      "successRate": 93,
      "totalRowsProcessed": 48000,
      "dataAccuracyRate": 98,
      "avgProcessingTimeMs": 2340
    }
  }
}
```

#### UI Rendering Rules

- exports.failed > 0 → red badge on the Failed card
- exports.successRate < 90% → amber; < 75% → red
- expiryDate past today on any record → show "Expired" label on that record; disable download button

---

## 5. Complete Step-by-Step Flow

### Standard Export (Small File — Immediate Download)

```
1. User navigates to a report view (e.g., Attendance Report for Course X)
   Current filters already applied in the UI (courseId, date range, etc.)

2. User clicks Export button
   Export form/modal opens

3. User selects:
   - operationType: "export"
   - reportType: "attendance"
   - exportFormat: "pdf"
   - reportName: "October Attendance Report" (optional)
   Filters (courseId, startDate, endDate) pre-populated from current view

4. User clicks Confirm Export
   -> POST /api/v1/export-reports-v2
      Body: {
        operationType: "export",
        reportType: "attendance",
        exportFormat: "pdf",
        reportName: "October Attendance Report",
        filters: { courseId: "...", startDate: "2026-10-01", endDate: "2026-10-31" }
      }

5. Backend processes synchronously (small dataset):
   - Validates user permissions
   - Retrieves filtered attendance records
   - Transforms data to PDF format
   - Uploads to Azure Blob Storage
   - Returns download link

6. <- 201: { status: "completed", fileUrl: "...", expiryDate: "2026-11-07", fileSizeMb: 3.4 }

7. UI shows:
   - Success toast: "Export ready."
   - Download button opens fileUrl
   - Expiry notice: "Link expires Nov 7, 2026"
   - New record appears in My Exports list
```

---

### Data Extraction (Filtered Subset for Integration)

```
1. Admin needs a filtered CSV of all overdue compliance records
   Opens Export form

2. Admin selects:
   - operationType: "extraction"
   - reportType: "compliance_records"
   - exportFormat: "csv"
   - filters: { status: "Overdue", startDate: "2026-01-01", endDate: "2026-03-31" }

3. Admin clicks Confirm
   -> POST /api/v1/export-reports-v2
      Body: {
        operationType: "extraction",
        reportType: "compliance_records",
        exportFormat: "csv",
        filters: { status: "Overdue", startDate: "2026-01-01", endDate: "2026-03-31" }
      }

4. <- 201: { status: "completed", fileUrl: "...", totalRecords: 47, fileSizeMb: 0.2 }

5. Admin downloads CSV and imports into external compliance tracking tool
```

---

### Admin Reviews Export History

```
1. Admin opens Export History page
   -> GET /api/v1/export-reports-v2?page=1&limit=20

2. Admin filters to failed exports
   -> GET /api/v1/export-reports-v2?status=failed&page=1&limit=20
   <- Table shows failed records with errorMessage tooltip

3. Admin clicks a failed record for details
   -> GET /api/v1/export-reports-v2/{exportId}
   <- Detail panel shows errorMessage in red

4. Admin re-triggers the export by clicking Retry
   -> POST /api/v1/export-reports-v2  (same reportType, format, filters)
   <- New export record created; previous failed record remains in history

5. Admin reviews KPIs for the quarter
   -> GET /api/v1/export-reports-v2/kpis
      ?startDate=2026-01-01&endDate=2026-03-31
   <- successRate, avgFileSizeMb, format distribution
```

---

### User Views Their Own Export History

```
1. User navigates to My Exports section
   -> GET /api/v1/export-reports-v2/my-exports?page=1&limit=20
   <- List of exports scoped to this user

2. User sees an export with expiryDate in the past
   Download button shows "Expired" — disabled

3. User needs the file again
   Opens export form and re-generates with the same settings
   -> POST /api/v1/export-reports-v2 (same request body as original)
   <- New record with fresh 7-day download link
```

---

## 6. Request and Response Structures

### POST /api/v1/export-reports-v2 — Request Body

| Field         | Type   | Required | Allowed Values                                                                                                                                             | Description                                |
| ------------- | ------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| operationType | string | No       | export, extraction                                                                                                                                         | Defaults to export                         |
| reportType    | string | Yes      | attendance, gradebook, assessment, exam_results, course_roster, student_records, course_information, compliance_records, performance_reports, user_records | Data type to export                        |
| exportFormat  | string | Yes      | pdf, excel, csv, json, xml                                                                                                                                 | Output format                              |
| reportName    | string | No       | —                                                                                                                                                          | Custom label; defaults to report type name |
| filters       | object | No       | See Section 10                                                                                                                                             | Scoping criteria for data retrieval        |

### GET /api/v1/export-reports-v2 and /my-exports — Query Parameters

| Parameter     | Type    | Default | Description                |
| ------------- | ------- | ------- | -------------------------- |
| operationType | string  | —       | export or extraction       |
| reportType    | string  | —       | Any supported report type  |
| status        | string  | —       | pending, completed, failed |
| exportFormat  | string  | —       | pdf, excel, csv, json, xml |
| page          | integer | 1       | Page number                |
| limit         | integer | 20      | Records per page           |

### GET /api/v1/export-reports-v2/kpis — Query Parameters

| Parameter | Type              | Required | Description                |
| --------- | ----------------- | -------- | -------------------------- |
| startDate | date (YYYY-MM-DD) | No       | Operations from this date  |
| endDate   | date (YYYY-MM-DD) | No       | Operations up to this date |

### Standard Response Envelope

```json
{ "success": true, "message": "...", "data": { ... } }
{ "success": false, "message": "Error description" }
```

---

## 7. Export Record — Full Field Reference

Every export endpoint returns this object shape.

| Field         | Type            | Description                                             |
| ------------- | --------------- | ------------------------------------------------------- |
| id            | UUID            | Unique operation identifier                             |
| operationType | string          | export or extraction                                    |
| reportType    | string          | Data type that was exported                             |
| reportName    | string          | Label for this operation                                |
| exportFormat  | string          | pdf, excel, csv, json, or xml                           |
| exportedBy    | UUID            | User ID who initiated the operation                     |
| exporter      | object          | { id, firstName, lastName, email }                      |
| filters       | object or null  | Filter criteria applied — see Section 10                |
| status        | string          | pending, completed, or failed                           |
| fileName      | string or null  | Stored filename in Azure Blob Storage                   |
| fileUrl       | string or null  | Download URL — expires after 7 days                     |
| fileSizeMb    | number or null  | File size in megabytes                                  |
| expiryDate    | date or null    | Date the download link expires (7 days from generation) |
| totalRecords  | integer or null | Number of records in the exported file                  |
| errorMessage  | string or null  | Populated when status is failed                         |
| createdAt     | ISO 8601        | Operation timestamp                                     |
| updatedAt     | ISO 8601        | Last update timestamp                                   |

---

## 8. KPI Definitions

| KPI                        | Formula                                              | Field                       |
| -------------------------- | ---------------------------------------------------- | --------------------------- |
| Total Operations           | Count of all export + extraction + import operations | totalOperations             |
| Overall Success Rate       | (successful ops / total ops) x 100                   | successRate                 |
| Export Success Rate        | (exports.successful / exports.total) x 100           | exports.successRate         |
| Failed Exports             | Count of operations with status failed               | exports.failed              |
| Avg File Size              | Mean fileSizeMb across all completed exports         | exports.avgFileSizeMb       |
| Import Success Rate        | (imports.successful / imports.total) x 100           | imports.successRate         |
| Data Accuracy Rate         | (successful rows / total rows processed) x 100       | imports.dataAccuracyRate    |
| Avg Import Processing Time | Mean processing time in milliseconds                 | imports.avgProcessingTimeMs |

---

## 9. Status Values and Enum Reference

### status — Badge Colors

| Value     | Color | Meaning                                              |
| --------- | ----- | ---------------------------------------------------- |
| pending   | Amber | Export initiated; processing in progress             |
| completed | Green | File generated successfully; download link available |
| failed    | Red   | Export failed; errorMessage populated                |

### operationType — Badge Colors

| Value      | Color  | Meaning                                          |
| ---------- | ------ | ------------------------------------------------ |
| export     | Blue   | Standard formatted report generation             |
| extraction | Purple | Filtered data subset for analysis or integration |

### exportFormat — Badge Colors

| Value | Color  |
| ----- | ------ |
| pdf   | Red    |
| excel | Green  |
| csv   | Teal   |
| json  | Orange |
| xml   | Gray   |

### reportType — Display Labels

| Value               | Display Label       |
| ------------------- | ------------------- |
| attendance          | Attendance          |
| gradebook           | Gradebook           |
| assessment          | Assessment          |
| exam_results        | Exam Results        |
| course_roster       | Course Roster       |
| student_records     | Student Records     |
| course_information  | Course Information  |
| compliance_records  | Compliance Records  |
| performance_reports | Performance Reports |
| user_records        | User Records        |

---

## 10. Filter Fields Reference

The filters object in the export request accepts the following optional fields. All are optional — include only what is relevant to the reportType being exported.

| Field            | Type              | Description                                                       |
| ---------------- | ----------------- | ----------------------------------------------------------------- |
| courseId         | UUID              | Scope data to a specific course                                   |
| studentId        | UUID              | Scope data to a specific student                                  |
| gradebookId      | UUID              | Scope data to a specific gradebook                                |
| departmentId     | UUID              | Scope data to a specific department                               |
| startDate        | date (YYYY-MM-DD) | Include records from this date                                    |
| endDate          | date (YYYY-MM-DD) | Include records up to this date                                   |
| attendanceStatus | string            | Filter attendance records by status (e.g., Present, Absent, Late) |
| deliveryMode     | string            | Filter by course delivery mode (e.g., online, in-person, hybrid)  |
| status           | string            | Filter records by their status field                              |

---

## 11. Validation Rules

### Client-Side (before API call)

| Rule                    | Condition                                          | Message                                                 |
| ----------------------- | -------------------------------------------------- | ------------------------------------------------------- |
| reportType required     | reportType not selected                            | "Please select a report type."                          |
| exportFormat required   | exportFormat not selected                          | "Please select an export format."                       |
| Date range completeness | startDate provided without endDate (or vice versa) | "Please provide both start and end dates."              |
| Date range order        | endDate before startDate                           | "End date must be on or after start date."              |
| Download link expired   | expiryDate is past today                           | Disable download button; show "Expired" label           |
| Retry on failed         | Show Retry button only when status === "failed"    | Re-submit with the same reportType, format, and filters |

### Server-Side (API returns 400)

| Scenario                             | Response                                      |
| ------------------------------------ | --------------------------------------------- |
| reportType missing or invalid        | 400 with message describing the invalid value |
| exportFormat missing or invalid      | 400 with message describing the invalid value |
| User lacks permission for reportType | 401 or 403 depending on auth state            |

### Permission Notes

- **Admins** can export all reportType values and view all records via `GET /export-reports-v2`.
- **Instructors** can export course-scoped report types (attendance, gradebook, assessment, exam_results, course_roster) filtered to their own courses.
- **Students** can export personal reports (student_records) scoped to their own data where permitted.
- The backend enforces permissions — the UI should show only the reportType options the user's role is allowed to export, but must handle 403 responses gracefully regardless.

---

## 12. Error Handling

| HTTP Status     | Endpoint(s)     | UI Behavior                                                                    |
| --------------- | --------------- | ------------------------------------------------------------------------------ |
| 201             | POST            | Show download button + expiry notice + success toast                           |
| 200             | GET             | Render table or detail panel                                                   |
| 400             | POST            | Show inline form validation error from message field                           |
| 401             | All             | Clear session; redirect to login                                               |
| 404             | GET /{exportId} | Show "Export record not found" with Back button                                |
| 500             | All             | Show error banner: "Something went wrong. Please try again." with Retry button |
| Network timeout | All             | Show retry banner; preserve current form state and filters                     |

### Retry on Failed Exports

When a record has status failed:

- Show a **Retry** button in the admin table row and in the detail view.
- Clicking Retry re-submits `POST /api/v1/export-reports-v2` with the same `reportType`, `exportFormat`, and `filters` as the original failed operation.
- The original failed record is preserved in history; a new record is created for the retry attempt.

### Expired Download Links

- Once `expiryDate` is past today, the download button is disabled and labeled "Expired".
- The user must re-generate the export via `POST /api/v1/export-reports-v2` to get a fresh link.
- The original expired record remains in history for audit purposes.
