# Exam Paper Configuration Module — Developer README (AI-Optimized)

> **Purpose:** Maps every UI screen to its API endpoint(s), defines the full data flow, and provides step-by-step implementation instructions for the Customize Question Paper Features module in GCLMS (TC09).

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Entity & Data Model Reference](#2-entity--data-model-reference)
3. [Role-Based Access Matrix](#3-role-based-access-matrix)
4. [Critical Rule: Draft vs Published Lock](#4-critical-rule-draft-vs-published-lock)
5. [UI Screens → Endpoint Mapping](#5-ui-screens--endpoint-mapping)
6. [Step-by-Step Feature Flows](#6-step-by-step-feature-flows)
7. [Runtime Rules Derivation Reference](#7-runtime-rules-derivation-reference)
8. [Business Logic the Frontend Must Enforce](#8-business-logic-the-frontend-must-enforce)
9. [API Quick Reference](#9-api-quick-reference)

---

## 1. Module Overview

This module controls how an examination _behaves_ — not what questions it contains. Instructors configure paper-level settings that govern the student exam runtime experience.

**Three endpoints, three concerns:**

```
1. POST /:examinationId/publish   → lock & publish exam settings
2. GET  /:examinationId/preview   → view resolved config + runtime rules (draft or published)
3. GET  /kpis                     → system-wide configuration statistics (Admin only)
```

> **Important:** Paper configuration fields (sections, navigation, UI, tools, accessibility, randomization, submission) live on the Examination entity itself. They are edited via the main examination edit endpoint (not in this module). This module's role is to **preview**, **publish/lock**, and **report KPIs** on those settings.

**Paper Statuses:** `draft` | `published` | `archived`

**Navigation Modes:** `free` | `forward-only` | `section-locked`

---

## 2. Entity & Data Model Reference

### Examination Paper Config Fields (stored on Examination entity)

These fields are set via the examination create/edit endpoint and read by this module:

| Field                   | Type                | Description                                                |
| ----------------------- | ------------------- | ---------------------------------------------------------- |
| `examinationId`         | UUID                | Examination unique identifier                              |
| `title`                 | string              | Exam title                                                 |
| `paperStatus`           | string              | `draft`, `published`, or `archived`                        |
| `isLocked`              | boolean             | `true` once published — all config fields become read-only |
| `configuredSections`    | Section[]           | Array of exam sections                                     |
| `navigationMode`        | string              | `free`, `forward-only`, or `section-locked`                |
| `timeLimitMinutes`      | number              | Total exam duration in minutes                             |
| `randomization`         | RandomizationConfig | Question/option shuffle settings                           |
| `uiSettings`            | UISettings          | Theme, font, layout                                        |
| `toolsEnabled`          | ToolsConfig         | Calculator, spellchecker, scratchpad                       |
| `accessibilitySettings` | AccessibilityConfig | Font scaling, dyslexia font, contrast, screen reader       |
| `submissionSettings`    | SubmissionConfig    | Confirmation dialog, auto-submit                           |

### Section Object

| Field             | Type           | Description                                  |
| ----------------- | -------------- | -------------------------------------------- |
| `section_name`    | string         | e.g. `"Section A"`                           |
| `questions_count` | number         | Number of questions in this section          |
| `time_limit`      | number \| null | Per-section time limit in minutes (optional) |

### RandomizationConfig Object

| Field            | Type    | Description                               |
| ---------------- | ------- | ----------------------------------------- |
| `question_order` | boolean | Shuffle question order for each student   |
| `option_order`   | boolean | Shuffle MCQ option order for each student |

### UISettings Object

| Field                | Type    | Description                                          |
| -------------------- | ------- | ---------------------------------------------------- |
| `theme`              | string  | `"default"`, `"dark"`, `"light"`, `"high-contrast"`  |
| `font_size`          | number  | Base font size in px (e.g. `16`)                     |
| `font_family`        | string  | `"default"`, `"dyslexia"`, `"serif"`, `"sans-serif"` |
| `progress_indicator` | boolean | Show progress bar during exam                        |

### ToolsConfig Object

| Field          | Type    | Description                         |
| -------------- | ------- | ----------------------------------- |
| `calculator`   | string  | `"none"`, `"basic"`, `"scientific"` |
| `spellchecker` | boolean | Enable spellcheck on text inputs    |
| `scratchpad`   | boolean | Enable in-exam scratch notes panel  |

### AccessibilitySettings Object

| Field           | Type    | Description                        |
| --------------- | ------- | ---------------------------------- |
| `font_scaling`  | boolean | Allow students to scale font size  |
| `dyslexia_font` | boolean | Apply dyslexia-friendly font       |
| `high_contrast` | boolean | Enable high-contrast mode          |
| `screen_reader` | boolean | Optimise layout for screen readers |

### SubmissionSettings Object

| Field                 | Type    | Description                        |
| --------------------- | ------- | ---------------------------------- |
| `confirmation_dialog` | boolean | Show "Are you sure?" before submit |
| `auto_submit`         | boolean | Auto-submit exam when time expires |

### AppliedSettings Object (publish response only)

| Field                  | Type        | Description                         |
| ---------------------- | ----------- | ----------------------------------- |
| `navigationMode`       | string      | Applied navigation mode             |
| `timeLimitMinutes`     | number      | Applied time limit                  |
| `randomizationEnabled` | boolean     | Whether any randomization is active |
| `uiTheme`              | string      | Applied theme                       |
| `tools`                | ToolsConfig | Applied tools snapshot              |
| `autoSubmit`           | boolean     | Applied auto-submit rule            |

### RuntimeRules Object (preview + publish response)

| Field                       | Type    | Description                                   |
| --------------------------- | ------- | --------------------------------------------- |
| `back_navigation_allowed`   | boolean | Derived from `navigationMode`                 |
| `question_skipping`         | boolean | Derived from `navigationMode`                 |
| `section_locked_navigation` | boolean | Derived from `navigationMode`                 |
| `timer_enforced`            | boolean | `true` if `timeLimitMinutes > 0`              |
| `auto_submit`               | boolean | From `submissionSettings.auto_submit`         |
| `confirmation_required`     | boolean | From `submissionSettings.confirmation_dialog` |

### KPI Data Object

| Field                    | Type   | Description                                     |
| ------------------------ | ------ | ----------------------------------------------- |
| `totalExaminations`      | number | All examinations in the system                  |
| `publishedExaminations`  | number | Examinations with `paperStatus === "published"` |
| `draftExaminations`      | number | Examinations with `paperStatus === "draft"`     |
| `archivedExaminations`   | number | Archived examinations                           |
| `randomizationUsageRate` | number | % of exams with randomization enabled           |
| `customizedPapersCount`  | number | Count of fully customized published papers      |

---

## 3. Role-Based Access Matrix

| Feature                                        | Instructor     | Admin | Super Admin | Student |
| ---------------------------------------------- | -------------- | ----- | ----------- | ------- |
| View/edit exam config (via exam edit endpoint) | ✅ (own exams) | ✅    | ✅          | ❌      |
| Preview config + runtime rules                 | ✅             | ✅    | ✅          | ❌      |
| Publish exam (lock config)                     | ❌             | ✅    | ✅          | ❌      |
| View KPI stats                                 | ❌             | ✅    | ✅          | ❌      |
| Interact with exam runtime (as configured)     | ❌             | ❌    | ❌          | ✅      |

> **Note on Publish:** Instructors can configure settings but **cannot publish** — only Admin and Super Admin can call `POST /:examinationId/publish`. The UI must reflect this: show the "Publish" button only to Admin/Super Admin roles.

> **Publish Blockers (403):** An examination cannot be published if it has an active workflow in `Pending`, `Rejected`, or `Escalated` status. The UI must handle this case and show a clear message.

---

## 4. Critical Rule: Draft vs Published Lock

This is the single most important rule in this module.

```
paperStatus === "draft"     → all configuration fields are EDITABLE
paperStatus === "published" → all configuration fields are LOCKED (read-only)
```

**What "locked" means for the UI:**

- All config form fields render as **read-only display values**, not inputs
- The "Save / Update" button is hidden or disabled
- The "Publish" button is replaced with a "Published" status badge
- The preview is still accessible (and shows the locked config)
- A banner should be shown: "This exam has been published. Settings are locked."

**`isLocked` field:**

- Returned by the preview endpoint
- Use this boolean to gate all edit UI — `isLocked === true` → render read-only mode

---

## 5. UI Screens → Endpoint Mapping

---

### Screen 1: Exam Paper Configuration Panel

**Route:** `/instructor/examinations/:examinationId/configure`
**Also accessible as a tab within the Examination detail page.**

**Purpose:** The main settings editor where instructors configure all paper behavior fields. This panel reads from and writes to the **examination edit endpoint** (not this module's endpoints). This module provides the **preview** and **publish** actions within this panel.

**Endpoints used from THIS module:**

```
GET  /api/v1/exam-paper-config-v2/:examinationId/preview   → load current config + runtime rules
POST /api/v1/exam-paper-config-v2/:examinationId/publish   → publish and lock (Admin only)
```

**Endpoints from the Examination module (used alongside):**

```
GET  /api/v1/examinations/:examinationId    → load exam + current config field values
PUT  /api/v1/examinations/:examinationId    → save configuration changes (draft only)
```

**UI Layout:**

```
ExamPaperConfigPanel
│
├── Status Banner (conditional)
│   ├── paperStatus === "draft"     → blue info banner: "Draft — settings can still be edited"
│   └── paperStatus === "published" → amber lock banner: "Published — settings are locked"
│
├── Section 1: Exam Sections
│   ├── "Add Section" button (draft only)
│   └── SectionList (up to 10 sections)
│       Each SectionRow:
│       ├── section_name  → text input
│       ├── questions_count → number input
│       └── time_limit    → number input (minutes, optional)
│
├── Section 2: Navigation & Time
│   ├── navigationMode → radio group:
│   │   ○ Free (students can move anywhere)
│   │   ○ Forward-Only (no going back)
│   │   ○ Section-Locked (must complete section before moving)
│   └── timeLimitMinutes → number input (minutes)
│       → 0 means no time limit
│
├── Section 3: Randomization
│   ├── question_order → toggle (Shuffle question order)
│   └── option_order   → toggle (Shuffle MCQ option order)
│
├── Section 4: UI Settings
│   ├── theme          → select: Default | Dark | Light | High-Contrast
│   ├── font_size      → number input (px) or slider (12–24)
│   ├── font_family    → select: Default | Dyslexia | Serif | Sans-Serif
│   └── progress_indicator → toggle (Show progress bar)
│
├── Section 5: Tools
│   ├── calculator     → select: None | Basic | Scientific
│   ├── spellchecker   → toggle
│   └── scratchpad     → toggle
│
├── Section 6: Accessibility
│   ├── font_scaling   → toggle (Allow students to scale font)
│   ├── dyslexia_font  → toggle
│   ├── high_contrast  → toggle
│   └── screen_reader  → toggle
│
├── Section 7: Submission Settings
│   ├── confirmation_dialog → toggle (Require submit confirmation)
│   └── auto_submit         → toggle (Auto-submit on time expiry)
│
├── Runtime Rules Preview Panel (read-only, always visible)
│   └── Derived from current settings (see Section 7 — RuntimeRules)
│       Shows what will be enforced during the student exam:
│       ├── Back navigation: Allowed / Not Allowed
│       ├── Question skipping: Allowed / Not Allowed
│       ├── Section-locked: Yes / No
│       ├── Timer enforced: Yes / No
│       ├── Auto-submit: Yes / No
│       └── Confirmation required: Yes / No
│
└── Footer Actions
    ├── "Save as Draft" → PUT /examinations/:examinationId (draft only, hidden when published)
    ├── "Preview as Student" → GET /exam-paper-config-v2/:examinationId/preview → opens Screen 2
    └── "Publish Exam" → POST /exam-paper-config-v2/:examinationId/publish
        (only visible to Admin / Super Admin)
        (hidden when paperStatus === "published")
```

**On load:**

1. Call `GET /examinations/:examinationId` → populate all form fields
2. Call `GET /exam-paper-config-v2/:examinationId/preview` → populate the RuntimeRules preview panel
3. Check `isLocked` from preview response → if `true`, set all inputs to read-only

---

### Screen 2: Configuration Preview Panel

**Triggered from:** "Preview as Student" button on Screen 1
**Rendered as:** Full-page modal or slide-over drawer

**Purpose:** Show the instructor exactly how the exam will behave at runtime — with all settings resolved and runtime rules derived. Works for both draft and published exams.

**Endpoint:**

```
GET /api/v1/exam-paper-config-v2/:examinationId/preview
```

**UI Layout:**

```
ConfigPreviewPanel
│
├── Header
│   ├── Exam title
│   ├── paperStatus chip (Draft / Published)
│   └── isLocked indicator (🔒 Locked / ✏️ Editable)
│
├── Configuration Summary — 2-column display
│   Left column (settings as configured):
│   ├── Sections: list of section_name + questions_count + time_limit
│   ├── Navigation Mode: {navigationMode}
│   ├── Time Limit: {timeLimitMinutes} minutes (or "No time limit" if 0)
│   ├── Randomization: Questions {on/off} · Options {on/off}
│   ├── UI: Theme {theme} · Font {font_size}px · Font Family {font_family}
│   │       · Progress Indicator {on/off}
│   ├── Tools: Calculator {none/basic/scientific} · Spellcheck {on/off} · Scratchpad {on/off}
│   ├── Accessibility: Font Scaling {on/off} · Dyslexia Font {on/off}
│   │                  High Contrast {on/off} · Screen Reader {on/off}
│   └── Submission: Confirmation {on/off} · Auto-Submit {on/off}
│
│   Right column (runtime rules — what will actually be enforced):
│   ├── ✅/❌ Back navigation allowed
│   ├── ✅/❌ Question skipping allowed
│   ├── ✅/❌ Section-locked navigation
│   ├── ✅/❌ Timer enforced
│   ├── ✅/❌ Auto-submit on expiry
│   └── ✅/❌ Confirmation required on submit
│
└── Footer
    ├── "Close Preview" → back to Screen 1
    └── "Publish" button (Admin only, draft only)
        → POST /exam-paper-config-v2/:examinationId/publish
```

---

### Screen 3: Publish Confirmation & Result

**Triggered from:** "Publish Exam" button (Screen 1 or Screen 2 footer)

**Purpose:** Confirm publish action, then show the locked applied settings and audit log.

**Endpoint:**

```
POST /api/v1/exam-paper-config-v2/:examinationId/publish
```

**UI Flow:**

```
Step 1 — Confirmation Dialog (before API call)
"Publish this examination?
 Once published, all configuration settings will be locked and cannot be changed.
 Students will be able to access this exam according to its schedule."
[Cancel]  [Confirm & Publish]

Step 2 — API call on confirm
→ POST /exam-paper-config-v2/:examinationId/publish

Step 3 — On 200: PublishSuccessPanel
├── ✅ "Examination Published Successfully"
├── paperStatus chip → "Published"
│
├── Applied Settings summary (from response.data.appliedSettings):
│   ├── Navigation Mode
│   ├── Time Limit
│   ├── Randomization Enabled: {true/false}
│   ├── UI Theme
│   ├── Tools snapshot
│   └── Auto Submit
│
├── Runtime Rules enforced (from response.data.runtimeRules):
│   (same display as preview panel runtime rules column)
│
├── Audit Log:
│   ├── Published By: {auditLog.publishedBy} (resolve to user name if possible)
│   └── Timestamp: {auditLog.timestamp} formatted
│
└── "Return to Examination" button

Step 4 — On 400 "already published":
→ Toast error: "This examination has already been published."
→ Redirect to Screen 1 in read-only mode

Step 5 — On 403 workflow blocker:
→ Error panel: "This examination cannot be published because it has an active
  approval workflow in Pending, Rejected, or Escalated status.
  Resolve the workflow before publishing."
→ Show link to the workflow/approval screen
```

---

### Screen 4: KPI Dashboard (Admin)

**Route:** `/admin/exam-config/kpis`
**Also accessible as a stats panel on the admin examinations overview page.**

**Endpoint:**

```
GET /api/v1/exam-paper-config-v2/kpis
```

**UI — KPI Cards:**

```
ExamConfigKPIDashboard
├── Total Examinations         → data.totalExaminations
├── Published Examinations     → data.publishedExaminations
├── Draft Examinations         → data.draftExaminations
├── Archived Examinations      → data.archivedExaminations
├── Randomization Usage Rate   → data.randomizationUsageRate%
│   KPI indicator:
│   ├── Show as a gauge or percentage bar
│   └── No hard target in spec — display value + trend if historical data exists
└── Customized Papers Count    → data.customizedPapersCount
    Label: "Fully Customized Published Papers"
```

---

## 6. Step-by-Step Feature Flows

---

### Flow A: Instructor Configures an Exam Paper (Draft)

```
1. Instructor navigates to /examinations/:examinationId/configure
2. Page calls:
   a. GET /examinations/:examinationId → populate form fields
   b. GET /exam-paper-config-v2/:examinationId/preview → populate runtime rules panel
3. Check isLocked:
   → false (draft) → render all inputs as editable
   → true (published) → skip to Screen 1 read-only mode
4. Instructor configures settings across Sections 1–7 of the form
5. Runtime Rules Preview Panel updates in real-time as instructor changes:
   → navigationMode → recalculate back_navigation_allowed, question_skipping, section_locked_navigation
   → timeLimitMinutes > 0 → timer_enforced = true
   → submissionSettings → update confirmation_required and auto_submit
   (See Section 7 for derivation rules — this is computed client-side for the live preview)
6. Instructor clicks "Save as Draft"
   → PUT /examinations/:examinationId with updated config fields
7. On 200: toast "Settings saved", stay on the config page
8. On 400: show inline validation errors
```

---

### Flow B: Instructor Previews the Exam Configuration

```
1. Instructor clicks "Preview as Student" on the config panel
2. App calls GET /api/v1/exam-paper-config-v2/:examinationId/preview
3. ConfigPreviewPanel opens (modal or drawer)
4. Render all settings from the response:
   - configuredSections, navigationMode, timeLimitMinutes, randomization,
     uiSettings, toolsEnabled, accessibilitySettings, submissionSettings
5. Render runtime rules from response.data.runtimeRules (these come from API — use directly)
6. Instructor reviews the full picture
7. If satisfied: click "Publish" (Admin) or close and return to edit
```

---

### Flow C: Admin Publishes an Examination

```
1. Admin is on the config panel or preview panel
2. Admin clicks "Publish Exam"
3. Confirmation dialog opens:
   "Publishing will lock all settings. This cannot be undone. Continue?"
4. Admin clicks "Confirm & Publish"
5. App calls POST /api/v1/exam-paper-config-v2/:examinationId/publish
6. On 200:
   a. Show PublishSuccessPanel with appliedSettings + runtimeRules + auditLog
   b. Update local exam state: paperStatus = "published", isLocked = true
   c. Re-render Screen 1 in read-only mode with the locked banner
7. On 400 "already published":
   a. Toast: "Examination is already published"
   b. Re-fetch exam state and render read-only
8. On 403 workflow blocker:
   a. Show: "Cannot publish — this examination has an active workflow that must be resolved first"
   b. Provide link to the workflow/approvals page
9. On 404: "Examination not found"
```

---

### Flow D: Instructor Views a Published (Locked) Exam Config

```
1. Instructor navigates to /examinations/:examinationId/configure
2. Page calls:
   a. GET /examinations/:examinationId
   b. GET /exam-paper-config-v2/:examinationId/preview
3. isLocked === true (paperStatus === "published")
4. Render the config panel in full read-only mode:
   - All inputs replaced with display values
   - "Save as Draft" button hidden
   - "Publish" button replaced with "Published ✅" badge
   - Amber lock banner: "This exam has been published. Settings are locked."
5. Instructor can still click "Preview as Student" to view the preview
6. No edits are possible
```

---

### Flow E: Admin Views KPI Dashboard

```
1. Admin navigates to /admin/exam-config/kpis
2. App calls GET /api/v1/exam-paper-config-v2/kpis
3. Render KPI cards:
   - totalExaminations, publishedExaminations, draftExaminations, archivedExaminations
   - randomizationUsageRate as a percentage bar
   - customizedPapersCount
4. No user interaction needed — this is a read-only stats view
5. Add a refresh button to re-call the endpoint on demand
```

---

## 7. Runtime Rules Derivation Reference

The preview endpoint returns `runtimeRules` from the API — always use the API response for the final preview display.

For the **live client-side preview** (updating as the instructor types), derive rules using this logic:

| Runtime Rule                | Derived From                             | Logic                                                     |
| --------------------------- | ---------------------------------------- | --------------------------------------------------------- |
| `back_navigation_allowed`   | `navigationMode`                         | `true` only if `navigationMode === "free"`                |
| `question_skipping`         | `navigationMode`                         | `true` if `navigationMode === "free"` or `"forward-only"` |
| `section_locked_navigation` | `navigationMode`                         | `true` only if `navigationMode === "section-locked"`      |
| `timer_enforced`            | `timeLimitMinutes`                       | `true` if `timeLimitMinutes > 0`                          |
| `auto_submit`               | `submissionSettings.auto_submit`         | Direct passthrough                                        |
| `confirmation_required`     | `submissionSettings.confirmation_dialog` | Direct passthrough                                        |

**Navigation mode breakdown:**

| Mode             | Back Allowed | Skip Questions | Section Locked |
| ---------------- | ------------ | -------------- | -------------- |
| `free`           | ✅ Yes       | ✅ Yes         | ❌ No          |
| `forward-only`   | ❌ No        | ✅ Yes         | ❌ No          |
| `section-locked` | ❌ No        | ❌ No          | ✅ Yes         |

---

## 8. Business Logic the Frontend Must Enforce

1. **`isLocked` gates all editing** — on page load, read `isLocked` from the preview endpoint. If `true`, render every config field as a read-only display value. Never rely on the route alone to determine edit access.

2. **"Publish" button is Admin/Super Admin only** — instructors can configure but not publish. Gate this button on the user's role from the auth context. Instructors should see a "Submit for Review" or "Request Publish" flow if applicable, not the publish button.

3. **Publish is irreversible** — always show a confirmation dialog before calling `POST /publish`. The dialog must clearly state that settings will be locked permanently.

4. **Sections limit is 1–10** — enforce maximum 10 sections in the SectionList UI. Disable "Add Section" button when 10 sections exist.

5. **`timeLimitMinutes = 0` means no time limit** — render this as "No time limit" in preview/read-only mode, not as "0 minutes".

6. **Live runtime rules preview** — as the instructor changes `navigationMode`, `timeLimitMinutes`, or `submissionSettings`, update the RuntimeRules Preview Panel immediately using the derivation logic in Section 7. Do not call the API for this live update — derive client-side.

7. **Use API runtimeRules for final display** — after calling `GET /preview` or `POST /publish`, always render `runtimeRules` from the API response (not client-derived values) in the modal/success screens.

8. **403 workflow blocker must be surfaced clearly** — this is a user-actionable error, not a generic "something went wrong". Show a specific message and link to the workflow resolution page.

9. **`calculator` field has three states** — it is a string enum (`"none"`, `"basic"`, `"scientific"`), not a boolean. Render it as a select/radio group, not a toggle.

10. **Per-section time limits are optional** — the `time_limit` field on each section is nullable. If not set, the overall `timeLimitMinutes` governs the full exam. Show this as "(using exam-level limit)" when `time_limit` is null on a section.

11. **Accessibility and UI settings are additive** — `dyslexia_font` (UISettings) and `dyslexia_font` (AccessibilitySettings) may coexist. If both are set, the UI renders the font — they're not redundant toggles in different sections. Display them in their respective sections without merging.

12. **KPI page is Admin-only** — do not render navigation to `/admin/exam-config/kpis` for instructor roles.

---

## 9. API Quick Reference

| Method | Endpoint                                              | Role                | UI Trigger                                      |
| ------ | ----------------------------------------------------- | ------------------- | ----------------------------------------------- |
| `GET`  | `/api/v1/exam-paper-config-v2/:examinationId/preview` | Instructor / Admin  | Config panel load + "Preview as Student" button |
| `POST` | `/api/v1/exam-paper-config-v2/:examinationId/publish` | Admin / Super Admin | "Confirm & Publish" button                      |
| `GET`  | `/api/v1/exam-paper-config-v2/kpis`                   | Admin / Super Admin | KPI dashboard load                              |

**Supporting endpoints (from Examination module — used alongside this module):**

| Method | Endpoint                              | Role               | UI Trigger                    |
| ------ | ------------------------------------- | ------------------ | ----------------------------- |
| `GET`  | `/api/v1/examinations/:examinationId` | Instructor / Admin | Config panel pre-fill on load |
| `PUT`  | `/api/v1/examinations/:examinationId` | Instructor / Admin | "Save as Draft" button        |

---

_Generated for GCLMS — Exam Paper Configuration Module (TC09)_
