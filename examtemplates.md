# Examination Paper Template Management (2.3-TC10)

## Overview

The **Examination Paper Template Management** module enables instructors and administrators to create reusable examination templates for generating unique exam papers. Instead of creating exams from scratch, users can define templates with question structures, difficulty levels, randomization rules, and exam behaviors, then generate individualized papers for each student.

## Key Features

- ✅ **Template Creation** - Create reusable exam templates with configurable sections
- ✅ **Question Structure Definition** - Support for MCQ, Essay, True/False, Fill in the Blank, Matching, and Short Answer
- ✅ **Difficulty Level Management** - Configure Easy, Medium, and Hard difficulty distributions
- ✅ **Randomization Rules** - Question shuffling, option randomization, and unique paper generation per student
- ✅ **Exam Behavior Settings** - Timer, navigation controls, calculator, and multimedia support
- ✅ **Marking Scheme Integration** - Auto-marking, negative marking, and rubric-based grading
- ✅ **Template Lifecycle Management** - Draft, publish, archive, and permanent deletion workflows
- ✅ **Paper Generation** - Generate unique examination papers from templates for each student

---

## Architecture

### Exam Types

| Exam Type | Description | Question Source |
|-----------|-------------|-----------------|
| **Standalone Exam** | Independent exam not linked to any course | General question bank |
| **Normal Exam** | Course-associated exam | Course-specific question bank |

### Template Status Lifecycle

```
DRAFT → PUBLISHED → ARCHIVED
   ↓       ↓          ↓
  Edit   Generate   Permanent
         Papers     Delete
```

---

## API Endpoints

### Core Template Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/v2/exam-templates` | Create new examination template | Bearer |
| `GET` | `/v2/exam-templates` | List all templates with filtering | Bearer |
| `GET` | `/v2/exam-templates/{templateId}` | Get template details | Bearer |
| `PATCH` | `/v2/exam-templates/{templateId}` | Update template (partial) | Bearer |
| `DELETE` | `/v2/exam-templates/{templateId}` | Archive template (soft delete) | Bearer |
| `DELETE` | `/v2/exam-templates/{templateId}/permanent` | Permanent delete | Bearer |

### Paper Generation & Preview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v2/exam-templates/{templateId}/generate` | Generate unique paper for student | Bearer |
| `GET` | `/api/v2/exam-templates/{templateId}/preview` | Preview template structure | Bearer |
| `GET` | `/api/v2/exam-templates/{templateId}/statistics` | Get template usage statistics | Bearer |

### Legacy/Standalone Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/v1/stand-alone-examination/template` | Get all exam templates (v1) | Bearer |
| `GET` | `/v1/stand-alone-examination/template/{templateId}` | Get template by ID (v1) | Bearer |
| `GET` | `/v1/stand-alone-examination/template/statistics` | Get template library statistics | Bearer |

---

## Data Models

### Examination Template Schema

```json
{
  "templateId": "uuid",
  "templateName": "Midterm Examination 2026",
  "questionsCount": 50,
  "status": "ACTIVE" | "INACTIVE",
  "createdBy": "uuid",
  "lastUpdatedBy": "uuid",
  "usageCount": 5,
  "creator": {
    "userId": "uuid",
    "firstName": "string",
    "lastName": "string",
    "email": "string"
  },
  "lastUpdater": {
    "userId": "uuid",
    "firstName": "string",
    "lastName": "string"
  },
  "createdAt": "2026-04-07T12:00:00Z",
  "updatedAt": "2026-04-07T12:00:00Z"
}
```

### Template Creation Request

```json
{
  "templateName": "Final Exam Template",
  "sections": [
    {
      "sectionId": "string",
      "sectionName": "Section A - Multiple Choice",
      "questionTypes": [
        {
          "questionType": "MCQ",
          "difficultyDistribution": {
            "easy": 10,
            "medium": 20,
            "hard": 10
          },
          "questionsCount": 40,
          "marksPerQuestion": 1,
          "negativeMarking": {
            "enabled": true,
            "deductionPerWrongAnswer": 0.25
          },
          "knowledgePoints": ["Algebra", "Calculus"]
        }
      ],
      "instructions": "Answer all questions",
      "sectionMarks": 40
    }
  ],
  "totalQuestions": 55,
  "totalMarks": 100,
  "durationMinutes": 120,
  "randomizationConfig": {
    "questionRandomization": true,
    "optionRandomization": true,
    "sectionRandomization": false,
    "seedBasedGeneration": true,
    "uniquePaperPerStudent": true
  },
  "displayConfig": {
    "description": "Final examination for Mathematics",
    "instructions": "Read carefully before answering",
    "questionsPerPage": 5,
    "allowNavigation": true,
    "allowQuestionSkipping": true,
    "spellCheckerEnabled": true,
    "themeColors": ["#ffffff", "#f0f0f0"],
    "fontOptions": ["Arial", "Times New Roman"],
    "calculatorEnabled": true,
    "timerEnabled": true,
    "timerCanBeDisabled": false,
    "pauseResumeEnabled": false,
    "multimediaSupport": true
  }
}
```

### Template Statistics

```json
{
  "templatesCreatedThisMonth": 20,
  "templatesCreatedLastMonth": 19,
  "creationGrowthPercent": 5.3,
  "usageFrequency": "HIGH" | "MEDIUM" | "LOW",
  "averageUsageCount": 12.5,
  "updateComplianceRate": 85
}
```

---

## Business Rules

### Template Creation Rules

1. **Unique Naming**: Template names must be unique within the organization
2. **Question Count Validation**: Total questions must equal sum of section questions
3. **Marks Validation**: Total marks must equal sum of section marks
4. **Difficulty Distribution**: Sum of difficulty levels must equal questions count per type
5. **Time Allocation**: Duration must be sufficient for question count (min 1 min/question)

### Exam Type Logic

| Field | Standalone Exam | Normal Exam |
|-------|-----------------|-------------|
| `courseId` | Null | Required |
| Question Bank | General | Course-specific |
| Template Reuse | Cross-course | Within course only |
| Access Control | Admin/Instructor | Course instructors |

### Randomization Rules

- **Full Randomization**: Questions + options shuffled, unique seed per student
- **Partial Randomization**: Only questions shuffled
- **Question Shuffle**: Section-wise question shuffling only
- **Option Shuffle**: MCQ options shuffled only

---

## Usage Examples

### 1. Create a New Template

```bash
curl -X POST "https://gclms.xanotech.org/api/v2/exam-templates" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "templateName": "Midterm Mathematics 2026",
    "sections": [
      {
        "sectionName": "Multiple Choice",
        "questionTypes": [{
          "questionType": "MCQ",
          "questionsCount": 30,
          "marksPerQuestion": 2,
          "difficultyDistribution": {"easy": 10, "medium": 15, "hard": 5}
        }],
        "sectionMarks": 60
      },
      {
        "sectionName": "Essay Questions",
        "questionTypes": [{
          "questionType": "ESSAY",
          "questionsCount": 2,
          "marksPerQuestion": 20,
          "difficultyDistribution": {"hard": 2}
        }],
        "sectionMarks": 40
      }
    ],
    "totalQuestions": 32,
    "totalMarks": 100,
    "durationMinutes": 120,
    "randomizationConfig": {
      "questionRandomization": true,
      "optionRandomization": true,
      "uniquePaperPerStudent": true
    },
    "displayConfig": {
      "allowNavigation": true,
      "timerEnabled": true,
      "calculatorEnabled": true
    }
  }'
```

### 2. Generate Paper from Template

```bash
curl -X POST "https://gclms.xanotech.org/api/api/v2/exam-templates/{templateId}/generate" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "uuid",
    "examId": "uuid"
  }'
```

### 3. List Templates with Filtering

```bash
# Get all active templates
curl -X GET "https://gclms.xanotech.org/api/v2/exam-templates?status=PUBLISHED&page=1&limit=10" \
  -H "Authorization: Bearer <jwt_token>"

# Search by name
curl -X GET "https://gclms.xanotech.org/api/v2/exam-templates?search=Mathematics&sortBy=createdAt&sortOrder=DESC" \
  -H "Authorization: Bearer <jwt_token>"
```

---

## Integration Points

### Related Modules

| Module | Integration Type | Description |
|--------|-----------------|-------------|
| **Question Banks** | Data Source | Provides questions based on type/difficulty |
| **Examination Paper Marking** | Downstream | Uses templates for marking scheme application |
| **MIS Reports** | Analytics | Template usage and effectiveness reporting |
| **Audit Trail** | Compliance | Tracks template modifications |
| **Notifications** | Alerts | Template publication and update notifications |

### Workflow Integration

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Question Bank  │────▶│  Template Mgmt   │────▶│  Paper Generate │
│  (Questions)    │     │  (Structure)     │     │  (Unique Paper) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │  Marking Scheme  │
                       │  (Auto/Manual)   │
                       └──────────────────┘
```

---

## Error Handling

### Common HTTP Status Codes

| Code | Scenario | Resolution |
|------|----------|------------|
| `400` | Invalid question count/marks totals | Verify section totals match aggregate |
| `401` | Unauthorized | Check JWT token validity |
| `403` | Forbidden - insufficient permissions | Verify user role (Admin/Instructor) |
| `404` | Template not found | Verify templateId exists |
| `409` | Duplicate template name | Use unique template name |
| `422` | Invalid difficult<response clipped><NOTE>Result is longer than **10000 characters**, will be **truncated**.</NOTE>