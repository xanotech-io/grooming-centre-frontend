UPDATE TO EXAMINATION PAPER
TEMPLATE & MARKING
Update 1 — Rename Exam Template → Marking Template
What's changing: TC10's "Exam Template" concept is being renamed to Marking Template
and expanded in scope. It now serves three contexts: assessments, course-based
examinations, and standalone examinations.
Input Payload Changes
Old Field New Field Change
template_i
d
marking_template_
id
Renamed
template_n
ame
marking_template_
name
Renamed
exam_type usage_scope Renamed + expanded
values
New usage_scope values: "Assessment" / "Normal Exam" / "Standalone Exam"
Expected Output
● All API responses, database records, and UI labels referencing "Exam Template" must
return marking_template terminology
● The template object returned after creation/retrieval should include
marking_template_id, marking_template_name, and usage_scope
Deliverables for Dev
● Rename all DB table/column references from exam_template → marking_template
● Update all API endpoint paths (e.g. /exam-template/create →
/marking-template/create)
● Update all frontend labels and dropdown text
● Ensure backward compatibility if old endpoint names are in use (deprecation notice or
redirect)
Update 2 — Enforce Marking Template Dependency
What's changing: No assessment or examination can be created without first selecting a
Marking Template. Question setup must be driven by the chosen template's configuration.
Input Payload Changes
Exam/Assessment creation payloads must now require marking_template_id:
{
"exam_id": "EXAM2001",
"marking_template_id": "MTP001", // NOW REQUIRED — no longer optional
"course_id": "CRS001",
"exam_date": "2025-06-01"
// question_list is NO LONGER provided manually — derived from template
}
The system should reject any exam creation request where marking_template_id is absent
or invalid.
Validation Rules (Backend Must Enforce)
● marking_template_id → required, must exist in the marking template table
● usage_scope on the template must match the creation context (e.g. a "Standalone
Exam" template cannot be used to create a course-linked exam)
● Question structure (types, quantity, difficulty, marks) is read from the template, not
supplied in the exam creation payload
Expected Output
● On success: exam object created, with marking_template_id embedded in the exam
record
● On failure (missing template): 400 Bad Request with error message: "A marking
template must be selected before creating an assessment or
examination."
Deliverables for Dev
● Add marking_template_id as a non-nullable foreign key on the
exams/assessments table
● Build a template selection step as the first screen in the exam creation flow
● Dynamically populate question setup UI based on the selected template's
question_types, question_quantity, difficulty_level, and
mark_distribution
● Backend validation middleware to block exam creation if marking_template_id is
missing or mismatched
Update 3 — Introduce Retry Count Configuration
What's changing: The Marking Template now includes a retry_count field that controls how
many attempts a student is allowed on an assessment or exam generated from that template.
Input Payload Addition
{
"marking_template_id": "MTP001",
"marking_template_name": "Midterm Marking Template",
"usage_scope": "Normal Exam",
"retry_count": 2, // NEW — number of allowed attempts (0 = no retry)
"retry_policy": "highest", // NEW — how to treat multiple attempts: "highest" | "latest" |
"average"
...
}
Field Description
retry_cou
nt
Max number of re-attempts allowed. 0 = single attempt only
retry_pol
icy
How the final score is calculated across attempts: highest,
latest, or average
Expected Output
● Template record stores and returns retry_count and retry_policy
● When a student attempts an exam, the system checks their attempt count against the
template's retry_count before allowing submission
● Exam result record should include attempt_number (e.g. 1, 2) in the result output
● If retry_count is exceeded: 403 Forbidden — "Maximum number of attempts
reached for this examination."
Deliverables for Dev
● Add retry_count (INT, default 0) and retry_policy (ENUM) columns to the
marking template table
● Add attempt_number column to the exam results/submissions table
● Build attempt-tracking logic: query count of prior submissions per student_id +
exam_id before allowing a new submission
● Apply retry_policy logic in the score calculator (already referenced in TC04) when
multiple attempts exist
Update 4 — Support All Remaining Question Types in
Exam Creation Endpoints
What's changing: TC04 lists several question types, but the current exam creation endpoints
do not fully support all of them. All types must now be handled end-to-end.
Full Question Type List (All Must Be Supported)
Type Grading Mode Notes
MCQ Automatic Single correct answer
TrueFalse Automatic Binary answer
FillBlank Automatic Exact or fuzzy match
Matching Automatic Pair matching
ShortAnsw
er
Manual Instructor-graded
Essay Manual Instructor-graded with rubric
Input Payload — Marking Template (Updated)
{
"question_types": ["MCQ", "TrueFalse", "FillBlank", "Matching", "ShortAnswer", "Essay"],
"question_quantity": {
"MCQ": 30,
"TrueFalse": 10,
"FillBlank": 10,
"Matching": 5,
"ShortAnswer": 3,
"Essay": 2
},
"mark_distribution": {
"MCQ": 30,
"TrueFalse": 10,
"FillBlank": 10,
"Matching": 10,
"ShortAnswer": 15,
"Essay": 25
}
}
Input Payload — Exam Setup (Per Question)
{
"question_id": "Q010",
"question_type": "Matching",
"pairs": [
{ "left": "H2O", "right": "Water" },
{ "left": "NaCl", "right": "Salt" }
],
"marks": 2
}
{
"question_id": "Q011",
"question_type": "FillBlank",
"question_text": "The capital of France is ___.",
"correct_answer": "Paris",
"accept_variants": ["paris"],
"marks": 1
}
Expected Output
● Auto-grading engine evaluates all four objective types and returns auto_score
● Manual question types (ShortAnswer, Essay) are flagged for instructor review and
contribute to manual_score
● Final total_score = auto_score + manual_score (already defined in TC04
output)
Deliverables for Dev
● Extend the exam question schema to support all 6 question types with type-specific
fields (MCQ / Essay / TrueFalse / FillBlank / Matching)
● Update the auto-marking engine to handle Matching and FillBlank in addition to
MCQ and TrueFalse
● Update question bank seeding/import tools to accept all types
● Update frontend question builder to render the correct input UI per question type
Update 5 — Instructor Manual Exam Review & Mark Entry
What's changing: Instructors must be able to access submitted exams, review student
answers to subjective questions (Essay, ShortAnswer), and input marks directly. This
formalises and extends the Manual Marking flow from TC04 Section 2C.
Input Payload — Instructor Mark Submission (Updated)
{
"instructor_id": "INS002",
"student_id": "STU045",
"exam_id": "EXAM1001",
"question_id": "Q011",
"question_type": "Essay",
"student_answer": "The French Revolution was...", // Read-only, displayed to instructor
"rubric": { "criteria": ["clarity", "depth"], "max_per_criteria": 5 }, // From template
"score": 8,
"max_score": 10,
"remark": "Good analysis, lacks conclusion.",
"grading_status": "Completed" // "In Progress" | "Completed"
}
Expected API Endpoints
Method Endpoint Description
GET /manual-marking/exams List of exams with pending
manual marking
GET /manual-marking/exam/{exam_id}/student
s
List of students with
ungraded subjective answers
GET /manual-marking/exam/{exam_id}/student
/{student_id}
Full submission with all
subjective answers
POST /manual-marking/submit Instructor submits score for a
question
PATCH /manual-marking/update Instructor updates a
previously submitted score
Expected Output — Student Submission View (for Instructor)
{
"exam_id": "EXAM1001",
"student_id": "STU045",
"submission_time": "2025-05-30T10:45:00Z",
"attempt_number": 1,
"questions": [
{
"question_id": "Q011",
"question_type": "Essay",
"question_text": "Discuss the causes of the French Revolution.",
"student_answer": "The French Revolution was caused by...",
"rubric": { "criteria": ["clarity", "depth"], "max_per_criteria": 5 },
"max_score": 10,
"score_assigned": null,
"grading_status": "Pending"
}
]
}
Expected Output — After Mark Submission
{
"exam_id": "EXAM1001",
"student_id": "STU045",
"question_id": "Q011",
"score": 8,
"remark": "Good analysis, lacks conclusion.",
"graded_by": "INS002",
"graded_at": "2025-05-30T14:22:00Z",
"grading_status": "Completed"
}
Once all subjective questions for a student are graded, the system should:
● Combine auto_score + manual_score → total_score
● Assign letter grade
● Set result status → "Completed"
● Log the action in the audit log (per TC04 Section 5)
Deliverables for Dev
● Build instructor manual marking dashboard (filterable by exam, grading status)
● Build per-student answer review screen showing question text, student answer, rubric,
and score input
● API endpoints for fetching pending submissions and submitting/updating marks
● Score aggregation trigger: fires when all manual questions for a student are marked
● Audit log entries for every mark submission and update
● Permission guard: only instructors assigned to the exam can access its submissions
Summary Table
Update Key Input Change Key Output Change Core Deliverable
1. Rename to
Marking
Template
marking_template_id,
usage_scope
All responses use new
naming
DB migration + API
rename
2. Template
Dependency
marking_template_id
required on exam creation
400 if missing; question
structure derived from
template
Validation
middleware +
dynamic question
UI
3. Retry Count retry_count,
retry_policy on
template
attempt_number in
results; 403 when
exceeded
Attempt tracker +
score policy logic
4. All Question
Types
Full question type schema
per type
Auto-score covers all
objective types
Extended marking
engine + question
builder
5. Manual
Review
Interface
Instructor mark payload
with student_answer
view
Graded result with
graded_by, triggers
score aggregation
Instructor
dashboard + mark
entry API