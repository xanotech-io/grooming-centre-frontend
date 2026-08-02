# TTC01 – Interactive Dashboard Module

# Frontend Implementation & API Flow Documentation

This document explains how the frontend dashboard UI should be built and how each UI section maps directly to backend APIs.

The goal is to help the frontend AI/code assistant understand:

- what screens to create
- which APIs power each section
- how the dashboard flows work
- how filtering behaves
- how export functionality works
- how charts/KPIs should render
- how dashboard interactions are connected

---

# MODULE OVERVIEW

The Interactive Dashboard Module is a centralized analytics and visualization system for the LMS/OES platform.

The frontend should provide:

- Academic analytics dashboards
- Administrative analytics dashboards
- Performance analytics dashboards
- Attendance analytics dashboards
- KPI cards
- Charts & graphs
- Interactive filters
- Export actions
- Drill-down analytics

The backend already provides visualization-ready payloads.

The frontend responsibility is:

1. Fetch dashboard data
2. Render KPI cards
3. Render visualizations
4. Handle filtering
5. Handle exports
6. Support responsive dashboard layouts
7. Display loading and empty states

---

# COMPLETE FRONTEND FLOW

```text
User Opens Dashboard Page
            ↓
Frontend Loads Dashboard Filters
            ↓
Frontend Loads Default Dashboard
            ↓
User Applies Filters
            ↓
Frontend Refetches Dashboard Data
            ↓
Backend Computes KPIs
            ↓
Frontend Renders Charts + KPI Cards
            ↓
User Can Export Dashboard
            ↓
Frontend Calls Export API
            ↓
File Download Starts
```

---

# MAIN DASHBOARD PAGES TO CREATE

The frontend should contain:

| Page                     | Purpose                        |
| ------------------------ | ------------------------------ |
| Academic Dashboard       | Academic analytics             |
| Administrative Dashboard | Institution analytics          |
| Performance Dashboard    | Learner/instructor performance |
| Attendance Dashboard     | Attendance & engagement        |
| Dashboard Filters        | Shared filter controls         |
| Export Actions           | Export dashboard data          |

---

# SHARED DASHBOARD LAYOUT

All dashboards should follow the same layout structure.

```text
Dashboard Header
    ↓
Global Filters Section
    ↓
KPI Cards Row
    ↓
Charts & Visualizations
    ↓
Tables / Analytics Lists
    ↓
Export Actions
```

---

# STEP 1 — LOAD FILTER OPTIONS

# API

```http
GET /api/v1/dashboard-v2/filters
```

# PURPOSE

This API loads all available filter options used across all dashboards.

---

# FRONTEND SHOULD STORE

```ts
{
  courses: [],
  departments: [],
  dashboardTypes: [],
  exportFormats: []
}
```

---

# UI COMPONENTS TO BUILD

| UI Component          | Type          |
| --------------------- | ------------- |
| Department Select     | Dropdown      |
| Course Select         | Dropdown      |
| Date Range Picker     | Calendar      |
| Dashboard Type Select | Tabs/Dropdown |
| Export Format Select  | Dropdown      |

---

# FLOW

```text
Dashboard Page Loads
        ↓
Fetch Dashboard Filters
        ↓
Populate Dropdowns
        ↓
User Selects Filters
        ↓
Filters Stored In State
```

---

# STEP 2 — ACADEMIC DASHBOARD FLOW

# PAGE TO CREATE

```text
/pages/dashboard/academic
```

---

# API

```http
GET /api/v1/dashboard-v2/academic
```

---

# QUERY PARAMS

```ts
{
  departmentId?: string
  courseId?: string
  startDate?: string
  endDate?: string
}
```

---

# FRONTEND FLOW

```text
User Opens Academic Dashboard
            ↓
Frontend Calls Academic API
            ↓
Backend Aggregates Academic Data
            ↓
Backend Computes KPIs
            ↓
Frontend Receives Dashboard Payload
            ↓
Frontend Renders KPI Cards
            ↓
Frontend Renders Charts
            ↓
Frontend Renders Tables
```

---

# KPI CARDS TO BUILD

Use the `kpis` object.

| KPI Field              | Card Title      |
| ---------------------- | --------------- |
| totalCourses           | Total Courses   |
| courseEnrollmentCount  | Enrollments     |
| courseCompletionRate   | Completion Rate |
| averageScore           | Average Score   |
| certificateIssuedCount | Certificates    |
| examAttempts           | Exam Attempts   |
| examPassRate           | Exam Pass Rate  |

---

# CHARTS TO BUILD

The `visualizations` array powers the charts.

Frontend should dynamically render chart components based on:

```ts
visualization.type;
```

Possible types:

- KPI
- BarChart
- PieChart
- LineChart
- Table
- Heatmap

---

# IMPORTANT UI SECTION

# LOW COMPLETION COURSES

Frontend should create a dedicated section for:

```text
Courses below 30% completion rate
```

This should render:

- course title
- completion percentage
- enrollment count
- warning indicator

---

# STEP 3 — ADMINISTRATIVE DASHBOARD FLOW

# PAGE TO CREATE

```text
/pages/dashboard/administrative
```

---

# API

```http
GET /api/v1/dashboard-v2/administrative
```

---

# KPI CARDS

| KPI Field         | UI Label           |
| ----------------- | ------------------ |
| totalStudents     | Total Students     |
| activeInstructors | Active Instructors |
| newEnrollments    | New Enrollments    |
| enrollmentRate    | Enrollment Rate    |
| systemUsageRate   | System Usage       |
| activeUsers       | Active Users       |
| totalRegistered   | Registered Users   |

---

# IMPORTANT VISUALS

Frontend should prioritize:

- Department performance charts
- Enrollment trend graphs
- Course popularity charts
- User activity charts

---

# FLOW

```text
User Applies Department Filter
            ↓
Frontend Refetches Admin Dashboard
            ↓
Backend Computes Operational Metrics
            ↓
Frontend Updates Charts
```

---

# STEP 4 — PERFORMANCE DASHBOARD FLOW

# PAGE TO CREATE

```text
/pages/dashboard/performance
```

---

# API

```http
GET /api/v1/dashboard-v2/performance
```

---

# KPI CARDS

| KPI Field                              | Label              |
| -------------------------------------- | ------------------ |
| quizAverageScore                       | Quiz Average       |
| examAverageScore                       | Exam Average       |
| feedbackRating.averageAssessmentScore  | Assessment Rating  |
| feedbackRating.averageAttendanceScore  | Attendance Rating  |
| feedbackRating.averageExaminationScore | Examination Rating |

---

# IMPORTANT UI SECTION

# TOP PERFORMERS TABLE

Frontend should build:

```text
Top 10 Students Table
```

Columns:

- Student Name
- Department
- Average Score
- Attendance
- Exams Passed
- Ranking

---

# FLOW

```text
Performance Dashboard Loads
            ↓
Frontend Fetches Performance API
            ↓
Backend Computes Performance Analytics
            ↓
Frontend Renders Rankings + Charts
```

---

# STEP 5 — ATTENDANCE DASHBOARD FLOW

# PAGE TO CREATE

```text
/pages/dashboard/attendance
```

---

# API

```http
GET /api/v1/dashboard-v2/attendance
```

---

# KPI CARDS

| KPI Field                    | Label              |
| ---------------------------- | ------------------ |
| attendancePercentage         | Attendance %       |
| daysPresent                  | Days Present       |
| totalAttendanceRecords       | Attendance Records |
| loginFrequency.weeklyLogins  | Weekly Logins      |
| loginFrequency.monthlyLogins | Monthly Logins     |

---

# IMPORTANT VISUALS

Frontend should include:

- Attendance trend graph
- Login activity graph
- Participation heatmap
- Daily attendance chart

---

# FLOW

```text
User Selects Date Range
            ↓
Frontend Refetches Attendance Data
            ↓
Backend Computes Attendance Metrics
            ↓
Frontend Updates Attendance Visuals
```

---

# STEP 6 — SYSTEM KPI DASHBOARD FLOW

# API

```http
GET /api/v1/dashboard-v2/kpis
```

---

# PURPOSE

This endpoint powers global dashboard analytics.

---

# KPI CARDS

| KPI Field                    | Label                  |
| ---------------------------- | ---------------------- |
| activeDashboardUsers         | Active Dashboard Users |
| avgEngagementDurationMs      | Avg Engagement (ms)    |
| avgEngagementDurationSeconds | Avg Engagement (sec)   |

---

# UI LOCATION

These KPIs should appear:

- dashboard overview page
- admin analytics overview
- top-level dashboard summary

---

# STEP 7 — EXPORT FLOW

# API

```http
POST /api/v1/dashboard-v2/export
```

---

# EXPORT UI TO BUILD

| UI Component    | Purpose          |
| --------------- | ---------------- |
| Export Button   | Trigger export   |
| Format Dropdown | PDF/Excel/CSV    |
| Loading Modal   | Export progress  |
| Success Toast   | Download success |

---

# EXPORT REQUEST

```json
{
  "dashboardType": "academic",
  "exportFormat": "PDF",
  "filters": {
    "departmentId": "uuid",
    "courseId": "uuid",
    "startDate": "2025-01-01",
    "endDate": "2025-12-31"
  }
}
```

---

# EXPORT FLOW

```text
User Clicks Export
            ↓
Frontend Opens Format Selector
            ↓
User Selects PDF/Excel/CSV
            ↓
Frontend Sends Export Request
            ↓
Backend Generates File
            ↓
Frontend Receives File Download
            ↓
Browser Downloads File
```

---

# GLOBAL FILTERING FLOW

All dashboard pages should use shared filters.

---

# FILTER STATE

```ts
{
  departmentId: "",
  courseId: "",
  startDate: "",
  endDate: ""
}
```

---

# FILTER BEHAVIOR

```text
User Changes Filter
        ↓
Frontend Updates Query Params
        ↓
Frontend Refetches Current Dashboard
        ↓
Dashboard Updates Automatically
```

---

# LOADING STATES

Frontend should implement:

| State           | UI                       |
| --------------- | ------------------------ |
| Initial Loading | Skeleton loaders         |
| Empty Data      | Empty state illustration |
| Error State     | Retry component          |
| Refetching      | Spinner overlay          |

---

# RESPONSIVE DESIGN REQUIREMENTS

Dashboard must support:

- Desktop layouts
- Tablet layouts
- Mobile responsiveness

---

# RECOMMENDED LAYOUT

```text
Desktop:
4 KPI cards per row

Tablet:
2 KPI cards per row

Mobile:
1 KPI card per row
```

---

# RECOMMENDED FRONTEND COMPONENT STRUCTURE

```text
DashboardLayout
    ├── DashboardHeader
    ├── DashboardFilters
    ├── KPISection
    ├── VisualizationSection
    ├── TablesSection
    ├── ExportSection
    └── Empty/Error States
```

---

# IMPORTANT IMPLEMENTATION NOTES

- Visualization rendering must be dynamic
- Dashboard data should be cacheable
- Filters must sync with URL query params
- Charts should update without page reload
- Dashboard requests should support refetching
- Export actions should preserve filters
- KPI cards should support loading skeletons
- Dashboard UI should support drill-down interactions

---

# FINAL COMPLETE FLOW

```text
Dashboard Opens
        ↓
Fetch Filter Metadata
        ↓
Fetch Dashboard Data
        ↓
Render KPI Cards
        ↓
Render Visualizations
        ↓
Apply Filters
        ↓
Refetch Dashboard
        ↓
Update Charts Dynamically
        ↓
Export Dashboard
        ↓
Download Generated File
```
