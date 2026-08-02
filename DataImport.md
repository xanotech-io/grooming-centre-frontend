# TC06 – Data Import, Export & Extraction Interface

> **Module:** Unified Data Import, Export & Extraction Interface  
> **API Base URL:** `/api/v1/export-reports-v2`  
> **Version:** Unified v2  
> **Access Control:** Role-based (Admin / Instructor / Authenticated User)

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Architecture & API Summary](#2-architecture--api-summary)
3. [Complete Workflow: Step-by-Step](#3-complete-workflow-step-by-step)
   - [Phase 1 – Authentication & Initialization](#phase-1--authentication--initialization)
   - [Phase 2 – Operation Type Selection (UI → API)](#phase-2--operation-type-selection-ui--api)
   - [Phase 3 – Import Flow](#phase-3--import-flow)
   - [Phase 4 – Export Flow](#phase-4--export-flow)
   - [Phase 5 – Extraction Flow](#phase-5--extraction-flow)
   - [Phase 6 – Validation & Status Tracking](#phase-6--validation--status-tracking)
   - [Phase 7 – KPI Dashboard](#phase-7--kpi-dashboard)
4. [API Endpoint Reference](#4-api-endpoint-reference)
5. [UI Section ↔ Endpoint Mapping](#5-ui-section--endpoint-mapping)
6. [Request & Response Structures](#6-request--response-structures)
7. [Validation Rules](#7-validation-rules)
8. [Status & Error Handling](#8-status--error-handling)
9. [Field Definitions](#9-field-definitions)
10. [Role-Based Access Matrix](#10-role-based-access-matrix)
11. [KPI Definitions](#11-kpi-definitions)
12. [Developer Notes](#12-developer-notes)

---

## 1. Module Overview

The **TC06 Unified Data Import, Export & Extraction Interface** is an LMS administrative module that enables authorized users to:

| Capability  | Description                                                |
| ----------- | ---------------------------------------------------------- |
| **Import**  | Bulk-upload structured data (CSV/Excel) into the LMS       |
| **Export**  | Generate and download LMS reports in multiple formats      |
| **Extract** | Pull filtered, on-demand datasets directly from the LMS UI |

All operations are **permission-gated**, **audit-logged**, and **validated** before processing. Files are archived to Azure Blob Storage, and every operation produces a traceable record with status, record counts, and validation outcomes.

**Supported Data Types:**  
Student Records · Course Information · Assessment Scores · Attendance Logs · Compliance Records · Performance Reports · User Records · Gradebook · Exam Results · Course Roster

**Supported File Formats:**  
CSV · Excel (`.xlsx`) · PDF · JSON · XML

---

## 2. Architecture & API Summary

```
User Interface (LMS UI)
        │
        ▼
┌───────────────────────────────────────────┐
│         /api/v1/export-reports-v2         │
│                                           │
│  POST   /               → Export/Extract  │
│  GET    /               → List all ops    │
│  GET    /my-exports     → User's exports  │
│  GET    /{exportId}     → Single export   │
│                                           │
│  POST   /import         → Upload & Import │
│  GET    /import         → List imports    │
│  GET    /import/my-imports → User imports │
│  GET    /import/{importId} → Single import│
│                                           │
│  GET    /kpis           → KPI Dashboard   │
└───────────────────────────────────────────┘
        │
        ▼
  Azure Blob Storage (file archival)
```

---

## 3. Complete Workflow: Step-by-Step

### Phase 1 – Authentication & Initialization

**UI Location:** Login screen / Session validation banner

Before any data operation can begin, the system verifies the user's session and role. This happens automatically on module load — no explicit API call is required from the user, but the bearer token must be present in all subsequent requests.

**What happens in the UI:**

- The module checks for a valid session token
- The user's role is evaluated (`admin`, `instructor`, `user`)
- Available actions are rendered based on role permissions (see [Role-Based Access Matrix](#10-role-based-access-matrix))
- If unauthenticated, the UI redirects to login and all API calls return `401 Unauthorized`

**Developer note:** Include the `Authorization: Bearer <token>` header on every request. Missing or expired tokens return `401` with no response body from any endpoint in this module.

---

### Phase 2 – Operation Type Selection (UI → API)

**UI Location:** Main dashboard — "New Operation" button or tabbed navigation

The user selects one of three operation types. This selection determines which API path and form the UI renders:

```
┌─────────────────────────────────────────────┐
│          Select Operation Type              │
│                                             │
│   [ Import ]   [ Export ]   [ Extract ]     │
└─────────────────────────────────────────────┘
```

| Selection   | UI Form Rendered                 | API Endpoint Triggered                   |
| ----------- | -------------------------------- | ---------------------------------------- |
| **Import**  | File upload form + field mapping | `POST /import`                           |
| **Export**  | Report type + format selector    | `POST /` (operationType: `"export"`)     |
| **Extract** | Filter panel + format selector   | `POST /` (operationType: `"extraction"`) |

A unique **Operation ID** is assigned by the backend upon submission of any of these forms. It is returned in the response as `data.id`.

---

### Phase 3 – Import Flow

**UI Location:** Import tab → Upload panel

#### Step 3.1 – File Selection

The user selects a CSV or Excel file from their local machine. The UI should display:

- File name
- Detected file size
- Format selector pre-filled based on file extension (`.csv` → `csv`, `.xlsx` → `excel`)

#### Step 3.2 – Field Mapping (Optional)

The UI displays a column mapper where users can align external column names to internal LMS field names. This is submitted as a JSON string in `dataMapping`.

Example mapping UI interaction:

```
External Column     →    Internal LMS Field
─────────────────────────────────────────────
Student_Email       →    User.Email
Score               →    AssessmentScore
Full_Name           →    Student.DisplayName
```

This produces the `dataMapping` request field:

```json
{
  "Student_Email": "User.Email",
  "Score": "AssessmentScore"
}
```

#### Step 3.3 – Target Module Selection

A dropdown lets the user specify which LMS module receives the imported data (e.g., `"Student Records"`, `"Assessment Scores"`, `"Attendance Logs"`).

#### Step 3.4 – Submission

The user clicks **"Upload & Import"**. The UI sends a `multipart/form-data` POST request.

**API Call:**

```
POST /api/v1/export-reports-v2/import
Content-Type: multipart/form-data
```

**Form fields submitted:**

| Field          | Required | Description                                |
| -------------- | -------- | ------------------------------------------ |
| `file`         | ✅       | The CSV or Excel binary                    |
| `fileFormat`   | ✅       | `"csv"` or `"excel"`                       |
| `reportName`   | Optional | Human-readable label; defaults to filename |
| `targetModule` | Optional | Target LMS module name                     |
| `dataMapping`  | Optional | JSON string for column remapping           |

#### Step 3.5 – Processing & Response

After submission, the backend:

1. Uploads the original file to Azure Blob Storage (for audit)
2. Parses the file structure and column headers
3. Validates each row (required fields, data types, duplicates)
4. Returns a full per-row validation report

**The UI renders:**

- A summary bar: Total Rows · Successful · Failed · Warnings
- A row-level error table (if `failedRows > 0`)
- A warning table (if `warningRows > 0`)
- The assigned Import ID (`data.id`) for future reference
- A status badge: `pending` → `validating` → `completed` / `failed` / `partial`

**Success Response (`201`):**

```json
{
  "success": true,
  "message": "Import processed successfully",
  "data": {
    "id": "3fa85f64-...",
    "reportName": "students_oct.csv",
    "fileFormat": "csv",
    "sourceFile": "students_oct.csv",
    "fileUrl": "https://blob.azure.com/...",
    "targetModule": "Student Records",
    "uploadedBy": "uuid-of-user",
    "uploader": {
      "firstName": "Jane",
      "lastName": "Admin",
      "email": "jane@lms.edu"
    },
    "status": "completed",
    "totalRows": 1200,
    "successfulRows": 1198,
    "failedRows": 2,
    "warningRows": 5,
    "validationErrors": [
      { "row": 45, "issue": "Missing required field: email" },
      { "row": 312, "issue": "Duplicate student ID detected" }
    ],
    "processingTimeMs": 3400,
    "summary": {
      "total_rows": 1200,
      "successful_rows": 1198,
      "failed_rows": 2,
      "warning_rows": 5
    }
  }
}
```

---

### Phase 4 – Export Flow

**UI Location:** Export tab → Report configuration panel

#### Step 4.1 – Report Configuration

The user configures the export via a form:

```
┌────────────────────────────────────────────┐
│  Report Type:  [ Attendance ▾ ]            │
│  Format:       [ PDF ▾ ]                   │
│  Report Name:  [ June 2025 Attendance ]    │
│  Course ID:    [ uuid-here ]               │
│  Start Date:   [ 2025-06-01 ]              │
│  End Date:     [ 2025-06-30 ]              │
│                                            │
│              [ Generate Export ]           │
└────────────────────────────────────────────┘
```

#### Step 4.2 – Submission

**API Call:**

```
POST /api/v1/export-reports-v2
Content-Type: application/json
```

**Request Body:**

```json
{
  "operationType": "export",
  "reportType": "attendance",
  "exportFormat": "pdf",
  "reportName": "June 2025 Attendance",
  "filters": {
    "courseId": "uuid-here",
    "startDate": "2025-06-01",
    "endDate": "2025-06-30"
  }
}
```

#### Step 4.3 – Response & Download

The backend generates the report, uploads it to Azure Blob Storage, and returns a time-limited download URL.

**Success Response (`201`):**

```json
{
  "success": true,
  "message": "Export generated successfully",
  "data": {
    "id": "3fa85f64-...",
    "operationType": "export",
    "reportType": "attendance",
    "reportName": "June 2025 Attendance",
    "exportFormat": "pdf",
    "exportedBy": "uuid-of-user",
    "exporter": {
      "firstName": "John",
      "lastName": "Admin",
      "email": "john@lms.edu"
    },
    "filters": {
      "courseId": "uuid-here",
      "startDate": "2025-06-01",
      "endDate": "2025-06-30"
    },
    "status": "completed",
    "fileName": "attendance_june2025.pdf",
    "fileUrl": "https://blob.azure.com/exports/attendance_june2025.pdf",
    "fileSizeMb": 1.4,
    "expiryDate": "2026-05-26",
    "totalRecords": 2500,
    "createdAt": "2026-05-19T08:49:00Z"
  }
}
```

**The UI renders:**

- A success notification with a **"Download"** button linking to `data.fileUrl`
- An expiry notice: _"Download link expires on [expiryDate]"_
- The Export ID for audit reference
- The record count and file size

> ⚠️ **File URL Expiry:** All download links expire after **7 days**. The UI should display the expiry date prominently and disable the download button once expired.

---

### Phase 5 – Extraction Flow

**UI Location:** Extract tab → Filter & extract panel

The extraction flow is nearly identical to export, but uses `operationType: "extraction"` and is intended for filtered, ad-hoc data pulls rather than pre-defined report templates.

#### Step 5.1 – Filter Configuration

The user defines extraction filters dynamically:

```
┌────────────────────────────────────────────┐
│  Data Type:    [ Performance Reports ▾ ]   │
│  Format:       [ PDF ▾ ]                   │
│  Name:         [ Q3 Instructor Extract ]   │
│  Instructor:   [ Instructor-004 ]          │
│  Start Date:   [ 2025-09-01 ]              │
│  End Date:     [ 2025-11-30 ]              │
│                                            │
│             [ Run Extraction ]             │
└────────────────────────────────────────────┘
```

#### Step 5.2 – Submission

**API Call:**

```
POST /api/v1/export-reports-v2
Content-Type: application/json
```

**Request Body:**

```json
{
  "operationType": "extraction",
  "reportType": "performance_reports",
  "exportFormat": "pdf",
  "reportName": "Q3 Instructor Extract",
  "filters": {
    "instructorId": "Instructor-004",
    "startDate": "2025-09-01",
    "endDate": "2025-11-30"
  }
}
```

The response structure is identical to the export response. The UI handles it the same way, differentiated only by the `operationType` label in the audit log display.

---

### Phase 6 – Validation & Status Tracking

**UI Location:** Operation History table / Operation detail drawer

#### Viewing All Operations (Admin)

Admins can see all operations across the system via paginated list endpoints.

**API Call — All Exports/Extractions:**

```
GET /api/v1/export-reports-v2?operationType=export&status=completed&page=1&limit=20
```

**API Call — All Imports:**

```
GET /api/v1/export-reports-v2/import?status=completed&fileFormat=csv&page=1&limit=20
```

**Available filter parameters:**

| Parameter       | Export/Extract Endpoint                  | Import Endpoint                                               |
| --------------- | ---------------------------------------- | ------------------------------------------------------------- |
| `operationType` | `export` / `extraction`                  | —                                                             |
| `reportType`    | All report types                         | —                                                             |
| `status`        | `pending` / `completed` / `failed`       | `pending` / `validating` / `completed` / `failed` / `partial` |
| `exportFormat`  | `pdf` / `excel` / `csv` / `json` / `xml` | `csv` / `excel`                                               |
| `page`          | integer (default: 1)                     | integer (default: 1)                                          |
| `limit`         | integer (default: 20)                    | integer (default: 20)                                         |

#### Viewing Personal Operations

Non-admin users see only their own history:

```
GET /api/v1/export-reports-v2/my-exports
GET /api/v1/export-reports-v2/import/my-imports
```

Both endpoints accept the same filter parameters as their admin counterparts.

#### Viewing a Single Record

Clicking any row in the history table opens a detail drawer:

```
GET /api/v1/export-reports-v2/{exportId}
GET /api/v1/export-reports-v2/import/{importId}
```

The detail view shows:

- Full operation metadata (ID, type, performed by, timestamp)
- Validation status and remarks
- Row-level error list (imports only)
- Source file URL and name (imports only)
- Download link (exports/extractions only, if not expired)
- Processing duration

---

### Phase 7 – KPI Dashboard

**UI Location:** Dashboard / Analytics tab

The KPI panel is populated by a single endpoint that aggregates all import and export/extraction metrics.

**API Call:**

```
GET /api/v1/export-reports-v2/kpis?startDate=2025-01-01&endDate=2025-12-31
```

Both `startDate` and `endDate` are optional. When omitted, the API returns all-time KPIs.

**Response:**

```json
{
  "success": true,
  "data": {
    "totalOperations": 142,
    "successRate": 94.4,
    "exports": {
      "total": 87,
      "successful": 83,
      "failed": 4,
      "successRate": 95.4,
      "avgFileSizeMb": 2.1
    },
    "imports": {
      "total": 55,
      "successful": 51,
      "failed": 4,
      "successRate": 92.7,
      "totalRowsProcessed": 48200,
      "dataAccuracyRate": 98.3,
      "avgProcessingTimeMs": 4100
    }
  }
}
```

**UI renders the following KPI cards:**

| KPI Card                   | Source Field                      | Format                  |
| -------------------------- | --------------------------------- | ----------------------- |
| Total Operations           | `totalOperations`                 | Count                   |
| Overall Success Rate       | `successRate`                     | Percentage              |
| Total Exports              | `exports.total`                   | Count                   |
| Export Success Rate        | `exports.successRate`             | Percentage              |
| Avg Export File Size       | `exports.avgFileSizeMb`           | MB                      |
| Total Imports              | `imports.total`                   | Count                   |
| Import Success Rate        | `imports.successRate`             | Percentage              |
| Total Rows Processed       | `imports.totalRowsProcessed`      | Count                   |
| Data Accuracy Rate         | `imports.dataAccuracyRate`        | Percentage              |
| Avg Import Processing Time | `imports.avgProcessingTimeMs`     | ms → display as seconds |
| Failed Transfers           | `exports.failed + imports.failed` | Count                   |

---

## 4. API Endpoint Reference

| Method | Path                 | Description                              | Auth | Role           |
| ------ | -------------------- | ---------------------------------------- | ---- | -------------- |
| `POST` | `/`                  | Generate export or extraction            | ✅   | Any            |
| `GET`  | `/`                  | List all exports/extractions (paginated) | ✅   | Admin          |
| `GET`  | `/my-exports`        | List authenticated user's exports        | ✅   | Any            |
| `GET`  | `/{exportId}`        | Get single export/extraction record      | ✅   | Admin or owner |
| `POST` | `/import`            | Upload and process bulk import           | ✅   | Any            |
| `GET`  | `/import`            | List all imports (paginated)             | ✅   | Admin          |
| `GET`  | `/import/my-imports` | List authenticated user's imports        | ✅   | Any            |
| `GET`  | `/import/{importId}` | Get single import record                 | ✅   | Admin or owner |
| `GET`  | `/kpis`              | Get aggregated KPIs                      | ✅   | Admin          |

---

## 5. UI Section ↔ Endpoint Mapping

```
┌─────────────────────────────────────────────────────────────────────┐
│  UI Section               │  User Action              │  API Call   │
├───────────────────────────┼───────────────────────────┼─────────────┤
│ New Export form           │ Submit export config       │ POST /      │
│ New Extraction form       │ Submit extraction filters  │ POST /      │
│ Import upload panel       │ Upload CSV/Excel file      │ POST /import│
│ All Operations table      │ View / filter operations   │ GET /       │
│ My Exports table          │ View personal exports      │ GET /my-exports│
│ Operation detail drawer   │ Click row in history table │ GET /{id}   │
│ All Imports table         │ View / filter imports      │ GET /import │
│ My Imports table          │ View personal imports      │ GET /import/my-imports│
│ Import detail drawer      │ Click row in import table  │ GET /import/{id}│
│ KPI dashboard             │ Load dashboard / date filter│ GET /kpis  │
│ Download button           │ Click download             │ External URL (Azure Blob)│
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Request & Response Structures

### Export / Extraction Request

```json
{
  "operationType": "export | extraction",
  "reportType": "attendance | gradebook | assessment | exam_results | course_roster | student_records | course_information | compliance_records | performance_reports | user_records",
  "exportFormat": "pdf | excel | csv | json | xml",
  "reportName": "string (optional)",
  "filters": {
    "courseId": "uuid (optional)",
    "startDate": "YYYY-MM-DD (optional)",
    "endDate": "YYYY-MM-DD (optional)"
  }
}
```

### Export / Extraction Response Object

```json
{
  "id": "uuid",
  "operationType": "export | extraction",
  "reportType": "string",
  "reportName": "string",
  "exportFormat": "string",
  "exportedBy": "uuid",
  "exporter": {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "email": "string"
  },
  "filters": {},
  "status": "pending | completed | failed",
  "fileName": "string",
  "fileUrl": "string (Azure Blob URL)",
  "fileSizeMb": 0.0,
  "expiryDate": "YYYY-MM-DD",
  "totalRecords": 0,
  "errorMessage": "string | null",
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601"
}
```

### Import Request (`multipart/form-data`)

| Field          | Type   | Required | Notes                       |
| -------------- | ------ | -------- | --------------------------- |
| `file`         | binary | ✅       | CSV or Excel file           |
| `fileFormat`   | string | ✅       | `"csv"` or `"excel"`        |
| `reportName`   | string | Optional | Defaults to filename        |
| `targetModule` | string | Optional | Destination LMS module      |
| `dataMapping`  | string | Optional | JSON-encoded column mapping |

### Import Response Object

```json
{
  "id": "uuid",
  "reportName": "string",
  "fileFormat": "csv | excel",
  "sourceFile": "string (original filename)",
  "fileUrl": "string (archived Azure Blob URL)",
  "targetModule": "string",
  "dataMapping": { "ExternalCol": "InternalField" },
  "uploadedBy": "uuid",
  "uploader": {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "email": "string"
  },
  "status": "pending | validating | completed | failed | partial",
  "totalRows": 0,
  "successfulRows": 0,
  "failedRows": 0,
  "warningRows": 0,
  "validationErrors": [{ "row": 45, "issue": "Missing required field: email" }],
  "processedData": [{}],
  "processingTimeMs": 0,
  "errorMessage": "string | null",
  "createdAt": "ISO 8601",
  "updatedAt": "ISO 8601",
  "summary": {
    "total_rows": 0,
    "successful_rows": 0,
    "failed_rows": 0,
    "warning_rows": 0
  },
  "errors": [{ "row": 0, "issue": "string" }],
  "warnings": [{ "row": 0, "issue": "string" }],
  "dashboard_update": {
    "status": "Updated",
    "refresh_time": "ISO 8601"
  }
}
```

---

## 7. Validation Rules

All validation occurs server-side before processing. The UI should surface these errors clearly.

### Import Validations

| Rule                  | Description                                                                   | Error Type                       |
| --------------------- | ----------------------------------------------------------------------------- | -------------------------------- |
| File structure        | File must be parseable CSV or Excel                                           | Hard fail (400)                  |
| Required fields       | All mandatory columns must be present                                         | `validationErrors` per row       |
| Data type consistency | Numeric fields must not contain text; dates must be valid                     | `validationErrors` per row       |
| Duplicate detection   | System checks for duplicate records within the file and against existing data | `validationErrors` or `warnings` |
| Column mapping        | If `dataMapping` provided, all referenced columns must exist                  | Hard fail (400)                  |
| File format match     | `fileFormat` field must match actual file extension                           | Hard fail (400)                  |
| Permission            | User must have permission to import the specified `targetModule`              | `401` / `403`                    |

### Export / Extraction Validations

| Rule            | Description                                         | Error Type      |
| --------------- | --------------------------------------------------- | --------------- |
| `operationType` | Must be `"export"` or `"extraction"`                | Hard fail (400) |
| `reportType`    | Must be one of the supported enum values            | Hard fail (400) |
| `exportFormat`  | Must be one of the supported enum values            | Hard fail (400) |
| Date range      | `endDate` must not precede `startDate`              | Hard fail (400) |
| Permission      | User must have access to the requested `reportType` | `401` / `403`   |

### Validation Status Values

| Status           | Meaning                                | UI Display      |
| ---------------- | -------------------------------------- | --------------- |
| `passed`         | All validation checks cleared          | ✅ Green badge  |
| `failed`         | One or more critical validation errors | ❌ Red badge    |
| `pending review` | Warnings present but not blocking      | ⚠️ Yellow badge |

---

## 8. Status & Error Handling

### Operation Status Lifecycle

**Export / Extraction:**

```
pending → completed
pending → failed
```

**Import:**

```
pending → validating → completed
pending → validating → failed
pending → validating → partial   (some rows succeeded, some failed)
```

### HTTP Error Codes

| Code  | Meaning                                          | UI Response                                |
| ----- | ------------------------------------------------ | ------------------------------------------ |
| `201` | Created – operation initiated successfully       | Show success state with operation ID       |
| `200` | OK – data retrieved                              | Render list or detail view                 |
| `400` | Bad Request – missing fields or validation error | Display `message` field from response body |
| `401` | Unauthorized – missing or expired token          | Redirect to login                          |
| `404` | Not Found – operation ID does not exist          | Show "Record not found" in detail view     |
| `500` | Internal Server Error                            | Show generic error message; prompt retry   |

### Error Response Body (`400`)

```json
{
  "success": false,
  "message": "Descriptive error string shown to user"
}
```

---

## 9. Field Definitions

| Field                       | Type     | Description                                                 |
| --------------------------- | -------- | ----------------------------------------------------------- |
| `id`                        | UUID     | Unique identifier for the operation (Import ID / Export ID) |
| `operationType`             | enum     | `import`, `export`, or `extraction`                         |
| `reportType`                | enum     | Type of LMS data being processed                            |
| `exportFormat`              | enum     | Output file format                                          |
| `fileFormat`                | enum     | Input file format (import only)                             |
| `reportName`                | string   | Human-readable label for the operation                      |
| `sourceFile`                | string   | Original filename of uploaded import file                   |
| `fileUrl`                   | string   | Azure Blob URL for archived or generated file               |
| `fileSizeMb`                | float    | Size of generated export file in MB                         |
| `expiryDate`                | date     | Date after which `fileUrl` is no longer valid (7 days)      |
| `exportedBy` / `uploadedBy` | UUID     | ID of the user who performed the operation                  |
| `exporter` / `uploader`     | object   | Full name and email of the performing user                  |
| `filters`                   | object   | Filter criteria applied to export/extraction                |
| `status`                    | enum     | Current operation status                                    |
| `totalRows`                 | int      | Total number of rows in import file                         |
| `successfulRows`            | int      | Rows that passed validation and were imported               |
| `failedRows`                | int      | Rows that failed validation                                 |
| `warningRows`               | int      | Rows imported with non-blocking issues                      |
| `validationErrors`          | array    | Per-row validation error details                            |
| `totalRecords`              | int      | Number of records in export output                          |
| `processingTimeMs`          | int      | Time taken to complete the operation in milliseconds        |
| `errorMessage`              | string   | Top-level error description for failed operations           |
| `dataMapping`               | object   | Column name remapping applied during import                 |
| `targetModule`              | string   | LMS module that received imported data                      |
| `createdAt` / `updatedAt`   | ISO 8601 | Operation timestamps                                        |

---

## 10. Role-Based Access Matrix

| Feature                          | Admin | Instructor    | Standard User |
| -------------------------------- | ----- | ------------- | ------------- |
| Create Export                    | ✅    | ✅            | ✅            |
| Create Extraction                | ✅    | ✅            | ✅            |
| Upload Import                    | ✅    | ✅            | ✅            |
| View own exports                 | ✅    | ✅            | ✅            |
| View own imports                 | ✅    | ✅            | ✅            |
| View ALL exports (`GET /`)       | ✅    | ❌            | ❌            |
| View ALL imports (`GET /import`) | ✅    | ❌            | ❌            |
| View any export by ID            | ✅    | ❌ (own only) | ❌ (own only) |
| View any import by ID            | ✅    | ❌ (own only) | ❌ (own only) |
| View KPI dashboard               | ✅    | ❌            | ❌            |

---

## 11. KPI Definitions

### Import KPIs

| KPI                         | Calculation                                   | Purpose                         |
| --------------------------- | --------------------------------------------- | ------------------------------- |
| **Import Success Rate (%)** | `(successful / total) × 100`                  | Measures import reliability     |
| **Data Accuracy Rate (%)**  | `(successfulRows / totalRowsProcessed) × 100` | Measures row-level data quality |
| **Avg Processing Time**     | Mean of `processingTimeMs` across all imports | Measures import performance     |
| **Failed Imports Count**    | Count of imports where `status = "failed"`    | Monitors recurring failures     |

### Export / Extraction KPIs

| KPI                         | Calculation                                   | Purpose                     |
| --------------------------- | --------------------------------------------- | --------------------------- |
| **Export Success Rate (%)** | `(successful / total) × 100`                  | Measures export reliability |
| **Avg File Size (MB)**      | Mean of `fileSizeMb` across completed exports | Monitors output volume      |
| **Failed Exports Count**    | Count of exports where `status = "failed"`    | Tracks generation failures  |

### General KPIs

| KPI                             | Calculation                                    | Purpose                 |
| ------------------------------- | ---------------------------------------------- | ----------------------- |
| **Overall Success Rate (%)**    | `(all successful ops / totalOperations) × 100` | Top-level health metric |
| **Total Operations**            | Count of all imports + exports + extractions   | Volume monitoring       |
| **Failed Transfers per Period** | Sum of all failed operations in date range     | SLA monitoring          |

---

## 12. Developer Notes

### File Handling

- All uploaded import files are archived to **Azure Blob Storage** immediately on receipt, regardless of validation outcome. This ensures the original file is always retrievable for debugging failed imports.
- All generated export/extraction files are uploaded to Azure Blob Storage and the `fileUrl` is returned in the response. Direct file streaming is not used.
- Download links **expire after 7 days** (`expiryDate`). The UI must check this date before rendering a download button and show a clear expiry notice.
- The `sourceFile` field always stores the original filename. Never overwrite this with a generated or normalized name.

### Pagination

All list endpoints are paginated. Default: `page=1`, `limit=20`. The response always includes:

```json
{
  "total": 142,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

Implement "Load More" or numbered pagination controls in the UI using these fields.

### Partial Imports

A `status` of `"partial"` means some rows were imported and some were rejected. The `validationErrors` array will contain the rejected rows. The UI should:

- Display both the success count and the error count prominently
- Allow the user to download a filtered error report
- Not treat `partial` as a full failure — the successful rows have been committed

### Duplicate Control

The API performs duplicate detection during import. Duplicate rows are surfaced in `validationErrors` with the issue text `"Duplicate [entity] detected"`. The UI should not re-submit the same file without user acknowledgment.

### Timezone Handling

All timestamps (`createdAt`, `updatedAt`, `expiryDate`, `refresh_time`) are returned in **ISO 8601 UTC**. The UI is responsible for converting to the user's local timezone for display.

### Large Dataset Handling

For imports with `totalRows > 5,000`, the UI should:

- Display an indeterminate progress indicator after submission
- Poll `GET /import/{importId}` every 3–5 seconds until `status` transitions out of `"validating"` or `"pending"`
- Show partial row counts as they become available if the API supports streaming

### Audit Traceability

Every operation record permanently stores:

- The performing user's ID and full name
- The original filename (imports)
- The timestamp of the operation
- The validation outcome and all error details

These records must never be deleted or anonymized. They serve as the audit trail for compliance and troubleshooting.

### KPI Date Filtering

The `/kpis` endpoint accepts optional `startDate` and `endDate` query parameters (format: `YYYY-MM-DD`). The UI date picker for the KPI dashboard should default to the current calendar month and allow custom range selection.

---

_Document Version: 1.0 · Aligned with API `/api/v1/export-reports-v2` (Unified v2) · Last Updated: May 2026_
