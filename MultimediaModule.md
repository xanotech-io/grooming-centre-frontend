# Question Multimedia Module — Developer README (AI-Optimized)

> **Purpose:** Maps every UI screen to its API endpoint(s), defines the full data flow, and provides step-by-step implementation instructions for the Question Bank with Multimedia & Formatting feature in GCLMS (TC07).

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Entity & Data Model Reference](#2-entity--data-model-reference)
3. [Role-Based Access Matrix](#3-role-based-access-matrix)
4. [UI Screens → Endpoint Mapping](#4-ui-screens--endpoint-mapping)
5. [Step-by-Step Feature Flows](#5-step-by-step-feature-flows)
6. [Media Validation Rules](#6-media-validation-rules)
7. [Content Format & Rendering Rules](#7-content-format--rendering-rules)
8. [Business Logic the Frontend Must Enforce](#8-business-logic-the-frontend-must-enforce)
9. [API Quick Reference](#9-api-quick-reference)

---

## 1. Module Overview

This module allows instructors to create exam questions that go beyond plain text — supporting rich HTML, LaTeX equations, and multiple media attachments (images, audio, video) per question, with full accessibility metadata.

**Two independent concerns:**

```
A) Question Content
   Plain text OR rich HTML content OR LaTeX equation
   → contentFormat determines what the student sees (displayContent)
   → formattingEnabled is auto-set to true when any media is attached

B) Media Attachments
   One or more media items per question (image / audio / video)
   → each item has its own accessibility metadata (altText, transcript)
   → ordered by sortOrder
   → validated by MIME type and file size on the API
```

**Content Formats:** `plain` | `html`

**Question Types:** `mcq` | `essay` | `true_false` | `fill_in_the_blank` | `matching` | `listening`

**Difficulty Levels:** `Easy` | `Medium` | `Hard`

**Media Types:** `image` | `audio` | `video`

---

## 2. Entity & Data Model Reference

### Question Object (full)

| Field               | Type           | Description                                                   |
| ------------------- | -------------- | ------------------------------------------------------------- |
| `id`                | UUID           | Question unique identifier                                    |
| `examinationId`     | UUID           | Examination this question belongs to                          |
| `question`          | string         | Plain text version of the question                            |
| `contentHtml`       | string \| null | Rich HTML version of the question                             |
| `contentFormat`     | string         | `plain` or `html` — controls what renders as `displayContent` |
| `latexEquation`     | string \| null | LaTeX string for mathematical equations                       |
| `formattingEnabled` | boolean        | Auto-set to `true` when media is attached or HTML is used     |
| `questionType`      | string         | `mcq`, `essay`, `true_false`, etc.                            |
| `difficultyLevel`   | string         | `Easy`, `Medium`, `Hard`                                      |
| `marks`             | number         | Points awarded for this question                              |
| `section`           | string \| null | Optional section label within the exam                        |
| `rubric`            | string \| null | Grading rubric for essay/open-ended questions                 |
| `correctAnswer`     | string \| null | Correct answer for auto-graded types                          |
| `active`            | boolean        | Whether question is active                                    |
| `media`             | MediaItem[]    | Array of media attachments ordered by `sortOrder`             |
| `options`           | Option[]       | MCQ answer options                                            |
| `createdAt`         | ISO date       |                                                               |
| `updatedAt`         | ISO date       |                                                               |

### MediaItem Object

| Field             | Type           | Description                                         |
| ----------------- | -------------- | --------------------------------------------------- |
| `id`              | UUID           | Media item unique identifier                        |
| `questionId`      | UUID           | Parent question reference                           |
| `mediaType`       | string         | `image`, `audio`, or `video`                        |
| `url`             | string         | CDN URL of the media file                           |
| `publicId`        | string         | CDN public ID (e.g. `lms/questions/cell_structure`) |
| `altText`         | string \| null | Accessibility description for images                |
| `transcript`      | string \| null | Text transcript for audio/video                     |
| `mimeType`        | string         | e.g. `image/png`, `audio/mpeg`, `video/mp4`         |
| `fileSizeBytes`   | number         | File size in bytes (max 5MB = 5,242,880 bytes)      |
| `durationSeconds` | number \| null | Duration for audio/video only                       |
| `thumbnailUrl`    | string \| null | Thumbnail for video previews                        |
| `sortOrder`       | number         | Display order (0-indexed, lower = first)            |
| `isAccessible`    | boolean        | Whether accessibility metadata is provided          |
| `uploadedBy`      | UUID           | Instructor who uploaded it                          |
| `createdAt`       | ISO date       |                                                     |
| `updatedAt`       | ISO date       |                                                     |

### Option Object (MCQ)

| Field         | Type    | Description                                                        |
| ------------- | ------- | ------------------------------------------------------------------ |
| `id`          | UUID    | Option ID                                                          |
| `name`        | string  | Option text                                                        |
| `optionIndex` | string  | Label: `A`, `B`, `C`, `D` etc.                                     |
| `isAnswer`    | boolean | Whether this is the correct answer — **hidden in student preview** |
| `active`      | boolean | Whether option is active                                           |

### Preview Question Object (student-facing)

| Field             | Type                          | Description                                                              |
| ----------------- | ----------------------------- | ------------------------------------------------------------------------ |
| `id`              | UUID                          | Question ID                                                              |
| `questionType`    | string                        | Question type                                                            |
| `difficultyLevel` | string                        | Difficulty                                                               |
| `marks`           | number                        | Points                                                                   |
| `section`         | string \| null                | Section label                                                            |
| `contentFormat`   | string                        | `plain` or `html`                                                        |
| `displayContent`  | string                        | Resolved content — plain text or sanitized HTML based on `contentFormat` |
| `media`           | MediaItem[]                   | Media (no `uploadedBy`, no CDN `publicId`)                               |
| `options`         | `{ id, name, optionIndex }[]` | MCQ options **without** `isAnswer` field                                 |

### Exam Stats Object

| Field                            | Type                      | Description                                    |
| -------------------------------- | ------------------------- | ---------------------------------------------- |
| `totalQuestions`                 | number                    | All questions in the examination               |
| `multimediaQuestions`            | number                    | Questions with `formattingEnabled = true`      |
| `plainQuestions`                 | number                    | Questions with no media or formatting          |
| `multimediaUsageRate`            | number                    | `(multimediaQuestions / totalQuestions) * 100` |
| `mediaTypeBreakdown`             | `{ image, audio, video }` | Count per media type                           |
| `kpis.multimediaUsageRateTarget` | string                    | `"≥ 20%"`                                      |
| `kpis.multimediaUsageRateMet`    | boolean                   | Whether KPI target is hit                      |

---

## 3. Role-Based Access Matrix

| Feature                         | Instructor | Admin | Student          |
| ------------------------------- | ---------- | ----- | ---------------- |
| Create multimedia question      | ✅         | ✅    | ❌               |
| List questions for exam         | ✅         | ✅    | ❌               |
| Get single question (full)      | ✅         | ✅    | ❌               |
| Update question content         | ✅         | ✅    | ❌               |
| Preview question (student view) | ✅         | ✅    | ✅ (during exam) |
| Add media to question           | ✅         | ✅    | ❌               |
| List media for question         | ✅         | ✅    | ❌               |
| Update media metadata           | ✅         | ✅    | ❌               |
| Delete media from question      | ✅         | ✅    | ❌               |
| View exam multimedia stats      | ✅         | ✅    | ❌               |

---

## 4. UI Screens → Endpoint Mapping

---

### Screen 1: Question Bank List (per Examination)

**Route:** `/instructor/examinations/:examinationId/questions`

**Purpose:** List all multimedia questions for a given exam with pagination.

**Endpoint:**

```
GET /question-multimedia-v2/examination/:examinationId?page=1&limit=20
```

**UI Components:**

```
QuestionBankPage
├── Pagination controls (page, limit)
├── Stats bar → links to stats endpoint (see Screen 5)
│
└── QuestionTable
    Columns: # | Question (truncated) | Type | Difficulty | Marks | Media | Formatting | Actions
    "Media" column: show media type chips from question.media[]
        → e.g. 🖼 Image · 🔊 Audio
    "Formatting" column: formattingEnabled chip (Yes/No)
    Actions per row:
    ├── Edit → Screen 2
    ├── Preview → Screen 3
    └── Manage Media → Screen 4
```

**Data mapping:**

```
response.data.questions[]  → table rows
response.data.total        → pagination total
response.data.totalPages   → pagination page count
```

---

### Screen 2: Create / Edit Question Page

**Route (create):** `/instructor/examinations/:examinationId/questions/new`
**Route (edit):** `/instructor/examinations/:examinationId/questions/:questionId/edit`

**Purpose:** Full question editor with rich text, LaTeX, and media attachment management.

**Endpoints used:**

```
POST /question-multimedia-v2                         → create
GET  /question-multimedia-v2/:questionId             → pre-fill on edit
PUT  /question-multimedia-v2/:questionId             → update content/metadata
POST /question-multimedia-v2/:questionId/media       → attach new media
GET  /question-multimedia-v2/:questionId/media       → load existing media list
PUT  /question-multimedia-v2/:questionId/media/:id   → update media metadata
DELETE /question-multimedia-v2/:questionId/media/:id → remove media
```

**UI Layout:**

```
QuestionEditorPage
│
├── Section A: Question Metadata
│   ├── questionType    → select: mcq | essay | true_false | fill_in_the_blank | matching | listening
│   ├── difficultyLevel → select: Easy | Medium | Hard
│   ├── marks           → number input
│   ├── section         → text input (optional)
│   └── rubric          → textarea (optional, shown for essay/open-ended types)
│
├── Section B: Content Editor
│   ├── contentFormat toggle → "Plain Text" | "HTML"
│   │
│   ├── If contentFormat === "plain":
│   │   └── question → plain textarea
│   │
│   └── If contentFormat === "html":
│       ├── contentHtml → Rich Text Editor (TipTap / Quill / similar)
│       │   Toolbar: Bold, Italic, Lists, Tables, Links, Code
│       └── latexEquation → LaTeX input field (optional)
│           Preview: render equation using KaTeX or MathJax
│
├── Section C: MCQ Options (only shown when questionType === "mcq")
│   └── Options builder:
│       ├── Add/remove option rows
│       ├── Each row: optionIndex (A/B/C/D auto-assigned) + name input + "correct" radio
│       └── correctAnswer → derived from selected "correct" radio value
│
├── Section D: Media Attachments
│   ├── "Add Media" button → opens AddMediaModal
│   └── MediaList (ordered by sortOrder)
│       Each MediaItem card:
│       ├── Thumbnail/icon (image preview or audio/video icon)
│       ├── mediaType chip
│       ├── url (shortened)
│       ├── fileSizeBytes formatted (e.g. "200 KB")
│       ├── durationSeconds (audio/video only)
│       ├── altText input (inline edit) → PUT /:questionId/media/:id
│       ├── transcript textarea (audio/video) → PUT /:questionId/media/:id
│       ├── isAccessible toggle → PUT /:questionId/media/:id
│       ├── sortOrder drag handle → PUT /:questionId/media/:id
│       └── Delete button → DELETE /:questionId/media/:id
│
└── Footer
    ├── "Preview as Student" → opens Preview Drawer (Screen 3)
    ├── "Save" → POST (create) or PUT (update)
    └── Cancel
```

---

### AddMediaModal (sub-component of Screen 2)

**Endpoint:** `POST /question-multimedia-v2/:questionId/media`

**Form fields:**

```
{
  mediaType:       select → image | audio | video (required)
  url:             string — CDN URL after upload (required)
  mimeType:        string — auto-detected from file or manually set (required)
  fileSizeBytes:   number — from uploaded file metadata (required)
  durationSeconds: number — for audio/video only (optional)
  altText:         string — required for image, optional for audio/video
  transcript:      string — required for audio/video, optional for image
  isAccessible:    boolean toggle (default: true)
  sortOrder:       number — auto-set to current media count (appended last)
}
```

> **Upload flow:** The file is uploaded to CDN FIRST (via a separate upload endpoint or pre-signed URL flow). The CDN URL is then passed to this endpoint. This endpoint does NOT accept file binary — it accepts the CDN URL.

> After `POST /media` succeeds, call `GET /:questionId/media` to refresh the MediaList.

---

### Screen 3: Question Preview (Student View)

**Route:** `/instructor/examinations/:examinationId/questions/:questionId/preview`
**Also accessible as a drawer/modal from the editor.**

**Purpose:** Show exactly what the student sees — no correct answer indicators.

**Endpoint:**

```
GET /question-multimedia-v2/:questionId/preview
```

**What the preview endpoint strips:**

- `options[].isAnswer` → not returned (options only have `id`, `name`, `optionIndex`)
- `correctAnswer` → not returned
- For matching questions: only left-side pairs exposed
- `displayContent` is pre-resolved based on `contentFormat`

**UI:**

```
QuestionPreviewPanel
├── Header: "Student Preview" badge + difficultyLevel + marks
├── Section label (if present)
│
├── Content area:
│   If contentFormat === "plain": render displayContent as plain text
│   If contentFormat === "html":  render displayContent as sanitized HTML
│   If latexEquation present:     render below content using KaTeX/MathJax
│
├── Media display (ordered by sortOrder):
│   image → <img src={url} alt={altText} />
│   audio → <audio controls src={url} /> + transcript collapsible
│   video → <video controls src={url} poster={thumbnailUrl} /> + transcript collapsible
│
└── Answer input area (by questionType):
    mcq          → radio buttons with option labels (no correct indicator)
    essay        → textarea
    true_false   → True / False radio
    fill_blank   → text input
    matching     → drag-and-drop or dropdown matching UI
    listening    → audio player + answer input below
```

---

### Screen 4: Media Manager (per Question)

**Route:** `/instructor/examinations/:examinationId/questions/:questionId/media`
**Also accessible as a tab within the editor.**

**Purpose:** Standalone view of all media attached to a question — manage order, metadata, and deletions.

**Endpoints used:**

```
GET    /question-multimedia-v2/:questionId/media             → load media list
POST   /question-multimedia-v2/:questionId/media             → add new media
PUT    /question-multimedia-v2/:questionId/media/:mediaId    → update metadata
DELETE /question-multimedia-v2/:questionId/media/:mediaId    → remove media
```

**UI:**

```
MediaManagerPage
├── Question title (read-only header from parent question)
├── "Add Media" button → AddMediaModal
├── Total media count: "{total} media items"
│
└── MediaGrid (ordered by sortOrder)
    Each MediaCard:
    ├── Visual preview:
    │   image → thumbnail img
    │   audio → waveform icon + durationSeconds
    │   video → thumbnailUrl or video icon + durationSeconds
    ├── mediaType chip | mimeType | fileSizeBytes
    ├── Editable fields (inline or in edit drawer):
    │   ├── altText (image)
    │   ├── transcript (audio/video)
    │   ├── isAccessible toggle
    │   └── sortOrder — reorder via drag OR up/down arrows
    ├── "Save changes" → PUT /:questionId/media/:mediaId
    └── "Remove" → DELETE /:questionId/media/:mediaId
        Confirmation: "Remove this media? This cannot be undone."
```

**Auto-effect on delete:**

> If the deleted item was the last media on the question AND `contentFormat === "plain"`, the API automatically resets `formattingEnabled = false`. The UI should reflect this on the next question fetch.

---

### Screen 5: Exam Multimedia Stats

**Route:** `/instructor/examinations/:examinationId/stats` (or a stats tab on the question bank page)

**Endpoint:**

```
GET /question-multimedia-v2/examination/:examinationId/stats
```

**UI — KPI Cards:**

```
MultimediaStatsPanel
├── Total Questions          → data.totalQuestions
├── Multimedia Questions     → data.multimediaQuestions
├── Plain Questions          → data.plainQuestions
├── Multimedia Usage Rate    → data.multimediaUsageRate%
│   KPI target indicator:
│   ├── Green check ✅ if data.kpis.multimediaUsageRateMet === true
│   └── Red warning ⚠️ if false ("Target: ≥ 20% — currently X%")
│
└── Media Type Breakdown (bar chart or chips)
    ├── 🖼 Images:  data.mediaTypeBreakdown.image
    ├── 🔊 Audio:   data.mediaTypeBreakdown.audio
    └── 🎥 Video:   data.mediaTypeBreakdown.video
```

---

## 5. Step-by-Step Feature Flows

---

### Flow A: Instructor Creates a Plain Text Question (No Media)

```
1. Instructor navigates to /examinations/:examinationId/questions/new
2. Selects questionType, difficultyLevel, marks
3. Leaves contentFormat as "plain"
4. Types question in plain textarea
5. If questionType === "mcq": adds options, marks one as correct
6. Clicks "Save" → POST /question-multimedia-v2
   Body: { examinationId, question, contentFormat: "plain", questionType, difficultyLevel, marks }
   Note: No media array → formattingEnabled will be false
7. On 201: navigate to question list or stay on editor with success toast
8. On 400: show inline validation error
```

---

### Flow B: Instructor Creates an HTML + Media Question

```
1. Instructor navigates to /examinations/:examinationId/questions/new
2. Selects questionType: "mcq", difficultyLevel: "Medium", marks: 2
3. Switches contentFormat toggle to "HTML"
4. Types/pastes rich HTML into the rich text editor
5. Optionally adds a LaTeX equation in the latexEquation field
6. Adds media:
   a. Clicks "Add Media"
   b. Uploads image to CDN → gets back CDN URL
   c. Fills in: mediaType: "image", url, mimeType: "image/png", fileSizeBytes,
      altText: "Diagram of a plant cell", isAccessible: true, sortOrder: 0
   d. Submits → media added inline to the media array
7. Submits the full question → POST /question-multimedia-v2
   Body includes: contentHtml, contentFormat: "html", media: [{ ... }]
   Note: formattingEnabled is automatically set to true by API because media is present
8. On 201: question created with media attached
```

---

### Flow C: Instructor Adds Media to an Existing Question

```
1. Instructor is on the question editor for an existing question (:questionId)
2. Page calls GET /question-multimedia-v2/:questionId to load current state
3. Instructor clicks "Add Media" in Section D
4. AddMediaModal opens
5. Instructor uploads file to CDN → gets back CDN URL
6. Fills in media metadata fields
7. Submits → POST /question-multimedia-v2/:questionId/media
8. On 201: close modal, call GET /:questionId/media to refresh MediaList
9. formattingEnabled is now true on the parent question (set automatically by API)
10. On 400 "unsupported MIME type": show error "File type not allowed. See accepted formats."
11. On 400 "file too large": show error "File exceeds 5MB limit."
```

---

### Flow D: Instructor Reorders Media Items

```
1. Instructor is on MediaManagerPage or the media section of the editor
2. Drags a media card to a new position
3. UI recomputes sortOrder values for all cards based on new array positions
4. For each card whose sortOrder changed:
   → PUT /question-multimedia-v2/:questionId/media/:mediaId
   Body: { sortOrder: newValue }
5. On 200 for all: refresh media list to confirm order
Note: Send one PUT per changed item — there is no bulk reorder endpoint
```

---

### Flow E: Instructor Updates Media Accessibility Metadata

```
1. Instructor is on the media card for an audio clip
2. Realises transcript is missing / altText is wrong
3. Edits the transcript textarea inline
4. Clicks "Save changes" on the card
5. → PUT /question-multimedia-v2/:questionId/media/:mediaId
   Body: { transcript: "Full transcript text...", isAccessible: true }
6. On 200: show inline "Saved" confirmation on the card
7. On 404: show "Media item not found"
```

---

### Flow F: Instructor Removes a Media Item

```
1. Instructor clicks "Remove" on a MediaCard
2. Confirmation dialog: "Remove this media? This cannot be undone."
3. Instructor confirms → DELETE /question-multimedia-v2/:questionId/media/:mediaId
4. On 200:
   a. Remove card from MediaList immediately (optimistic UI)
   b. Re-fetch GET /:questionId to check if formattingEnabled changed
   c. If it changed to false (last media deleted + plain format): update editor state
5. On 404: show "Media item not found"
```

---

### Flow G: Instructor Previews a Question Before Saving

```
1. Instructor clicks "Preview as Student" in the editor footer
2. If question is unsaved: save first (POST or PUT), then preview
3. Instructor navigates to or opens drawer for GET /:questionId/preview
4. Preview renders:
   - displayContent resolved from contentFormat
   - LaTeX rendered via KaTeX/MathJax if latexEquation present
   - media items rendered in order (img/audio/video tags)
   - MCQ options shown WITHOUT correct answer indicators
5. Instructor closes preview → returns to editor
```

---

### Flow H: Instructor Updates Question Content (Edit)

```
1. Instructor opens existing question in editor
2. Page calls GET /question-multimedia-v2/:questionId (full data pre-fill)
3. Instructor modifies: contentHtml, difficultyLevel, marks, rubric
4. Clicks "Save" → PUT /question-multimedia-v2/:questionId
   Body: { contentHtml, difficultyLevel, marks, rubric }
   Note: Only send fields being changed — all fields are optional in PUT
5. On 200: toast "Question updated", refresh editor with returned data
6. On 400 "Invalid contentFormat": show "Invalid content format value"
7. On 404: show "Question not found"
```

---

### Flow I: Admin Monitors Multimedia KPIs

```
1. Admin navigates to /examinations/:examinationId/stats
2. App calls GET /question-multimedia-v2/examination/:examinationId/stats
3. KPI cards render
4. If multimediaUsageRateMet === false:
   → Show warning: "Multimedia usage below target (currently X%). Add multimedia
     questions to improve assessment quality."
5. If multimediaUsageRateMet === true:
   → Show green KPI indicator
```

---

## 6. Media Validation Rules

### File Size

- **Maximum:** 5MB per file = 5,242,880 bytes
- Validate `fileSizeBytes` before submitting to API
- Show error if exceeded: "File exceeds the 5MB size limit"

### Allowed MIME Types by Media Type

| mediaType | Allowed mimeType values                                               |
| --------- | --------------------------------------------------------------------- |
| `image`   | `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/svg+xml` |
| `audio`   | `audio/mpeg`, `audio/wav`, `audio/ogg`, `audio/webm`, `audio/aac`     |
| `video`   | `video/mp4`, `video/webm`, `video/ogg`, `video/quicktime`             |

### Client-Side Validation Checklist (before calling POST /media)

```
1. mediaType is one of: image | audio | video
2. mimeType matches the allowed list for the selected mediaType
3. fileSizeBytes <= 5,242,880
4. url is a valid CDN URL (starts with https://)
5. For image: altText is strongly recommended (warn if missing, don't block)
6. For audio/video: transcript is strongly recommended (warn if missing, don't block)
7. isAccessible: if altText (image) or transcript (audio/video) is provided, set true
```

### What Cannot Be Changed After Upload

> Once a media item is created, `url`, `mediaType`, and `mimeType` cannot be updated via `PUT /:questionId/media/:mediaId`. To change the file, delete the media item and add a new one.

Fields updatable via PUT: `altText`, `transcript`, `sortOrder`, `isAccessible`, `thumbnailUrl`

---

## 7. Content Format & Rendering Rules

### `contentFormat` field

| Value   | What renders as `displayContent` in preview | Editor to use                   |
| ------- | ------------------------------------------- | ------------------------------- |
| `plain` | Raw `question` string                       | Plain textarea                  |
| `html`  | Sanitized `contentHtml` string              | Rich text editor (TipTap/Quill) |

### `latexEquation` field

- Independent of `contentFormat` — can be set on any question
- Render using **KaTeX** (preferred for performance) or **MathJax**
- Displayed below the main content in both editor and student preview
- Example value: `\\frac{d}{dx}\\left( \\int_{0}^{x} f(u)\\,du\\right)=f(x)`

### `formattingEnabled` field

- **Never set this manually in a form** — it is auto-managed by the API:
  - Set to `true` when any media is attached
  - Reset to `false` when last media is deleted AND `contentFormat === "plain"`
- Use it in the UI only for display purposes (e.g. "Formatting: Yes/No" column)

### `displayContent` (preview only)

- Only present in the preview endpoint response
- Pre-resolved by the API — render it directly without switching on `contentFormat`
- For HTML: render as `dangerouslySetInnerHTML` with sanitization (DOMPurify)

---

## 8. Business Logic the Frontend Must Enforce

1. **Either `question` or `contentHtml` must be provided on create** — never submit a question with both empty. Validate before `POST`.

2. **`formattingEnabled` is read-only in forms** — never expose it as a checkbox. It is auto-set by the API based on media presence.

3. **Media URL comes from CDN, not from this endpoint** — this module does not handle binary file uploads. The file must be uploaded to CDN separately first; only the resulting URL is sent here.

4. **`sortOrder` for new media = current media count** — when adding a new media item, default `sortOrder` to `media.length` (appended last). The instructor can reorder after.

5. **`isAnswer` hidden in student preview** — when rendering the preview, MCQ `options` from the preview endpoint do NOT have `isAnswer`. Never add this field to the student-facing view.

6. **LaTeX requires a renderer library** — do not render LaTeX as raw text. Import KaTeX (`katex`) or use MathJax. Render it in both the editor (live preview) and the student preview.

7. **Rich HTML must be sanitized on render** — use DOMPurify before using `dangerouslySetInnerHTML` with any `contentHtml` or `displayContent` value.

8. **Reordering media requires one PUT per changed item** — there is no bulk reorder endpoint. On drag-and-drop, diff the old vs new positions and PUT only the changed items.

9. **Delete confirmation is mandatory** — always show a confirmation dialog before `DELETE /media/:mediaId`. Media deletion is permanent.

10. **Rubric field only relevant for open-ended types** — only show the `rubric` textarea when `questionType` is `essay` or similar open-ended types, not for MCQ or True/False.

11. **Options builder only for MCQ** — the options section in the editor is only shown and submitted when `questionType === "mcq"`. For other types, do not send an `options` array.

12. **KPI warning threshold** — if `multimediaUsageRate < 20`, show a warning on the stats page. The target is `≥ 20%` per spec.

---

## 9. API Quick Reference

| Method   | Endpoint                                                   | Role             | UI Trigger                            |
| -------- | ---------------------------------------------------------- | ---------------- | ------------------------------------- |
| `POST`   | `/question-multimedia-v2`                                  | Instructor       | Create question form submit           |
| `GET`    | `/question-multimedia-v2/examination/:examinationId`       | Instructor/Admin | Question bank list page load          |
| `GET`    | `/question-multimedia-v2/examination/:examinationId/stats` | Instructor/Admin | Stats panel load                      |
| `GET`    | `/question-multimedia-v2/:questionId`                      | Instructor       | Editor pre-fill on edit               |
| `PUT`    | `/question-multimedia-v2/:questionId`                      | Instructor       | Edit question form submit             |
| `GET`    | `/question-multimedia-v2/:questionId/preview`              | All              | Preview button click                  |
| `GET`    | `/question-multimedia-v2/:questionId/media`                | Instructor       | Media manager load + after add/delete |
| `POST`   | `/question-multimedia-v2/:questionId/media`                | Instructor       | Add media form submit                 |
| `PUT`    | `/question-multimedia-v2/:questionId/media/:mediaId`       | Instructor       | Save media metadata / reorder         |
| `DELETE` | `/question-multimedia-v2/:questionId/media/:mediaId`       | Instructor       | Remove media (after confirmation)     |

---

_Generated for GCLMS — Question Bank with Multimedia Module (TC07)_
