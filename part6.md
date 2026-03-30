I'll cross-reference the Role Management module (TC17) from the scoping document with the API specification and create a comprehensive README.
Markdown
Copy
Code
Preview
# Role Management API Documentation

## Module Overview
**Module 2.20: Role Management (TC17)**
- **Task Code**: TC17
- **Tag**: `Role Management`
- **Description**: Manage access, roles and security - no module tag [2.20-TC17]

**Scoping Document Reference**: Section 11.22-TC17 (Page 68-69)

---

## Scoping Document Requirements

### Key Data Elements (from PRD)

| Field | Description |
|-------|-------------|
| Role ID | Unique identifier for the role |
| User ID | User assigned to role |
| Role Name | Role type (Admin / Instructor / Student / Supervisor / Academic_Admin) |
| Access Level | Read / Write / Full Access |
| Assigned By | Admin assigning role |
| Status | Active / Inactive |

### Key Performance Indicators (KPIs)
- Number of role changes per month
- Access violations detected
- Compliance with security policies

---

## API Endpoints

### 1. Create Role

**Scoping Document Mapping**: TC17 - Create role with permissions

```http
POST /api/v2/roles
Authentication: Bearer Token (bearerAuth)
Request Body:
JSON
Copy
{
  "roleName": "string",
  "description": "string",
  "roleType": "ADMIN",
  "permissions": ["string"],
  "isActive": true
}
Role Type Enum: ADMIN, INSTRUCTOR, STUDENT, SUPERVISOR, ACADEMIC_ADMIN
Response (201 Created):
JSON
Copy
{
  "success": true,
  "message": "Role created successfully",
  "data": {
    "roleId": "string (uuid)",
    "roleName": "Course Administrator",
    "description": "Manages course content and enrollments",
    "roleType": "ADMIN",
    "permissions": [
      "COURSE_CREATE",
      "COURSE_EDIT",
      "USER_MANAGE",
      "REPORT_VIEW"
    ],
    "isActive": true,
    "createdAt": "2025-11-01T10:00:00Z"
  }
}
HTTP Status Codes:
201 - Role created successfully
400 - Invalid request parameters
401 - Unauthorized
409 - Role already exists
500 - Server error
2. Get All Roles
Scoping Document Mapping: TC17 - Retrieve all roles with pagination
http
Copy
GET /api/v2/roles
Authentication: Bearer Token (bearerAuth)
Query Parameters:
Table
Parameter	Type	Default	Description
page	integer	1	Page number
limit	integer	10	Items per page
Response (200 OK):
JSON
Copy
{
  "success": true,
  "message": "Roles retrieved successfully",
  "data": {
    "rows": [
      {
        "roleId": "550e8400-e29b-41d4-a716-446655440000",
        "roleName": "System Admin",
        "description": "Full system access",
        "roleType": "ADMIN",
        "permissions": ["FULL_ACCESS"],
        "isActive": true,
        "userCount": 5
      },
      {
        "roleId": "550e8400-e29b-41d4-a716-446655440001",
        "roleName": "Instructor",
        "description": "Course delivery and grading",
        "roleType": "INSTRUCTOR",
        "permissions": ["COURSE_MANAGE", "GRADE_EDIT"],
        "isActive": true,
        "userCount": 25
      }
    ],
    "count": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
HTTP Status Codes:
200 - Roles retrieved successfully
400 - Invalid request parameters
401 - Unauthorized
500 - Server error
3. Get Role by ID
Scoping Document Mapping: TC17 - Retrieve specific role with permissions
http
Copy
GET /api/v2/roles/{id}
Authentication: Bearer Token (bearerAuth)
Path Parameters:
Table
Parameter	Type	Required	Description
id	string (uuid)	Yes	Role ID
Response (200 OK):
JSON
Copy
{
  "success": true,
  "message": "Role retrieved successfully",
  "data": {
    "roleId": "550e8400-e29b-41d4-a716-446655440000",
    "roleName": "Academic Admin",
    "description": "Academic oversight and reporting",
    "roleType": "ACADEMIC_ADMIN",
    "permissions": [
      "COURSE_APPROVE",
      "INSTRUCTOR_MANAGE",
      "REPORT_GENERATE",
      "CURRICULUM_EDIT"
    ],
    "isActive": true,
    "createdAt": "2025-01-15T08:30:00Z",
    "updatedAt": "2025-10-20T14:22:00Z",
    "assignedUsers": 12
  }
}
HTTP Status Codes:
200 - Role retrieved successfully
401 - Unauthorized
404 - Role not found
500 - Server error
4. Update Role
Scoping Document Mapping: TC17 - Update role's basic information
http
Copy
PATCH /api/v2/roles/{id}
Authentication: Bearer Token (bearerAuth)
Path Parameters:
Table
Parameter	Type	Required	Description
id	string (uuid)	Yes	Role ID
Request Body:
JSON
Copy
{
  "roleName": "Senior Instructor",
  "description": "Senior faculty with advanced permissions",
  "roleType": "INSTRUCTOR",
  "isActive": true
}
Response (200 OK):
JSON
Copy
{
  "success": true,
  "message": "Role updated successfully",
  "data": {
    "roleId": "550e8400-e29b-41d4-a716-446655440001",
    "roleName": "Senior Instructor",
    "description": "Senior faculty with advanced permissions",
    "roleType": "INSTRUCTOR",
    "permissions": ["COURSE_MANAGE", "GRADE_EDIT", "MENTOR_ASSIGN"],
    "isActive": true,
    "updatedAt": "2025-11-15T09:45:00Z"
  }
}
HTTP Status Codes:
200 - Role updated successfully
400 - Invalid request
401 - Unauthorized
404 - Role not found
500 - Server error
5. Delete Role
Scoping Document Mapping: TC17 - Delete role and remove from users
http
Copy
DELETE /api/v2/roles/{id}
Authentication: Bearer Token (bearerAuth)
Path Parameters:
Table
Parameter	Type	Required	Description
id	string (uuid)	Yes	Role ID
Response (200 OK):
JSON
Copy
{
  "success": true,
  "message": "Role deleted successfully",
  "data": {
    "roleId": "550e8400-e29b-41d4-a716-446655440002",
    "deletedAt": "2025-11-20T16:30:00Z",
    "affectedUsers": 3,
    "note": "Role removed from 3 users"
  }
}
HTTP Status Codes:
200 - Role deleted successfully
401 - Unauthorized
404 - Role not found
500 - Server error
6. Update Role Permissions
Scoping Document Mapping: TC17 - Update permissions for a role (Access Level management)
http
Copy
PATCH /api/v2/roles/{id}/permissions
Authentication: Bearer Token (bearerAuth)
Path Parameters:
Table
Parameter	Type	Required	Description
id	string (uuid)	Yes	Role ID
Request Body:
JSON
Copy
{
  "permissions": [
    "COURSE_VIEW",
    "COURSE_EDIT",
    "USER_VIEW",
    "REPORT_EXPORT"
  ],
  "action": "REPLACE"
}
Action Enum: ADD, REMOVE, REPLACE
Response (200 OK):
JSON
Copy
{
  "success": true,
  "message": "Permissions updated successfully",
  "data": {
    "roleId": "550e8400-e29b-41d4-a716-446655440000",
    "roleName": "Department Head",
    "permissions": [
      "COURSE_VIEW",
      "COURSE_EDIT",
      "USER_VIEW",
      "REPORT_EXPORT"
    ],
    "previousPermissions": [
      "COURSE_VIEW",
      "USER_VIEW"
    ],
    "updatedBy": "admin-001",
    "updatedAt": "2025-11-18T11:20:00Z"
  }
}
HTTP Status Codes:
200 - Permissions updated successfully
400 - Invalid request
401 - Unauthorized
404 - Role not found
500 - Server error
7. Assign Role to User
Scoping Document Mapping: TC17 - Assigns a role to a user (Role Assignment)
http
Copy
POST /api/v2/users/{userId}/roles
Authentication: Bearer Token (bearerAuth)
Path Parameters:
Table
Parameter	Type	Required	Description
userId	string (uuid)	Yes	User ID
Request Body:
JSON
Copy
{
  "roleId": "550e8400-e29b-41d4-a716-446655440000",
  "assignmentDate": "2025-11-15T09:00:00Z"
}
Response (201 Created):
JSON
Copy
{
  "success": true,
  "message": "Role assigned to user successfully",
  "data": {
    "assignmentId": "660e8400-e29b-41d4-a716-446655440010",
    "userId": "user-123",
    "userName": "John Doe",
    "roleId": "550e8400-e29b-41d4-a716-446655440000",
    "roleName": "Instructor",
    "roleType": "INSTRUCTOR",
    "accessLevel": "WRITE",
    "assignedBy": "admin-001",
    "assignmentDate": "2025-11-15T09:00:00Z",
    "status": "Active"
  }
}
HTTP Status Codes:
201 - Role assigned to user successfully
400 - Invalid request parameters
404 - User or role not found
409 - User already has this role
500 - Server error
8. Get User Roles
Scoping Document Mapping: TC17 - Retrieve all roles assigned to a user
http
Copy
GET /api/v2/users/{userId}/roles
Authentication: Bearer Token (bearerAuth)
Path Parameters:
Table
Parameter	Type	Required	Description
userId	string (uuid)	Yes	User ID
Response (200 OK):
JSON
Copy
{
  "success": true,
  "message": "User roles retrieved successfully",
  "data": {
    "userId": "user-123",
    "userName": "Jane Smith",
    "roles": [
      {
        "assignmentId": "660e8400-e29b-41d4-a716-446655440010",
        "roleId": "550e8400-e29b-41d4-a716-446655440000",
        "roleName": "Instructor",
        "roleType": "INSTRUCTOR",
        "permissions": ["COURSE_MANAGE", "GRADE_EDIT"],
        "accessLevel": "WRITE",
        "assignedBy": "admin-001",
        "assignmentDate": "2025-09-01T08:00:00Z",
        "status": "Active"
      },
      {
        "assignmentId": "660e8400-e29b-41d4-a716-446655440011",
        "roleId": "550e8400-e29b-41d4-a716-446655440003",
        "roleName": "Supervisor",
        "roleType": "SUPERVISOR",
        "permissions": ["CONTENT_APPROVE", "WORKFLOW_MANAGE"],
        "accessLevel": "FULL_ACCESS",
        "assignedBy": "admin-002",
        "assignmentDate": "2025-10-15T10:30:00Z",
        "status": "Active"
      }
    ],
    "totalRoles": 2
  }
}
HTTP Status Codes:
200 - User roles retrieved successfully
401 - Unauthorized
404 - User not found
500 - Server error
9. Remove Role from User
Scoping Document Mapping: TC17 - Removes a role from a user
http
Copy
DELETE /api/v2/users/{userId}/roles/{roleId}
Authentication: Bearer Token (bearerAuth)
Path Parameters:
Table
Parameter	Type	Required	Description
userId	string (uuid)	Yes	User ID
roleId	string (uuid)	Yes	Role ID
Response (200 OK):
JSON
Copy
{
  "success": true,
  "message": "Role removed from user successfully",
  "data": {
    "userId": "user-123",
    "userName": "John Doe",
    "roleId": "550e8400-e29b-41d4-a716-446655440000",
    "roleName": "Instructor",
    "removedBy": "admin-001",
    "removedAt": "2025-11-20T14:30:00Z",
    "remainingRoles": 1
  }
}
HTTP Status Codes:
200 - Role removed from user successfully
401 - Unauthorized
404 - User or role not found
500 - Server error
10. Get Role Assignments
Scoping Document Mapping: TC17 - Retrieve role assignments with pagination
http
Copy
GET /api/v2/role-assignments
Authentication: Bearer Token (bearerAuth)
Query Parameters:
Table
Parameter	Type	Default	Description
roleId	string (uuid)	No	Filter by specific role
page	integer	1	Page number
limit	integer	10	Items per page
Response (200 OK):
JSON
Copy
{
  "success": true,
  "message": "Role assignments retrieved successfully",
  "data": {
    "rows": [
      {
        "assignmentId": "660e8400-e29b-41d4-a716-446655440010",
        "userId": "user-123",
        "userName": "John Doe",
        "userEmail": "john.doe@groomingcentre.com",
        "roleId": "550e8400-e29b-41d4-a716-446655440000",
        "roleName": "Instructor",
        "roleType": "INSTRUCTOR",
        "assignedBy": "admin-001",
        "assignmentDate": "2025-09-01T08:00:00Z",
        "status": "Active"
      },
      {
        "assignmentId": "660e8400-e29b-41d4-a716-446655440011",
        "userId": "user-456",
        "userName": "Mary Johnson",
        "userEmail": "mary.j@groomingcentre.com",
        "roleId": "550e8400-e29b-41d4-a716-446655440001",
        "roleName": "Student",
        "roleType": "STUDENT",
        "assignedBy": "admin-002",
        "assignmentDate": "2025-10-10T09:15:00Z",
        "status": "Active"
      }
    ],
    "count": 2,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
HTTP Status Codes:
200 - Role assignments retrieved successfully
400 - Invalid request parameters
401 - Unauthorized
500 - Server error
Data Models
Role Schema
JSON
Copy
{
  "roleId": "string (uuid)",
  "roleName": "string",
  "description": "string",
  "roleType": "ADMIN | INSTRUCTOR | STUDENT | SUPERVISOR | ACADEMIC_ADMIN",
  "permissions": ["string"],
  "isActive": "boolean",
  "createdAt": "string (date-time)",
  "updatedAt": "string (date-time)"
}
Role Assignment Schema
JSON
Copy
{
  "assignmentId": "string (uuid)",
  "userId": "string (uuid)",
  "userName": "string",
  "roleId": "string (uuid)",
  "roleName": "string",
  "roleType": "string",
  "accessLevel": "READ | WRITE | FULL_ACCESS",
  "assignedBy": "string",
  "assignmentDate": "string (date-time)",
  "status": "Active | Inactive"
}
Permission Update Schema
JSON
Copy
{
  "permissions": ["string"],
  "action": "ADD | REMOVE | REPLACE"
}
Access Levels
Table
Level	Description	Typical Permissions
READ	View-only access	View courses, view reports, view user profiles
WRITE	Edit and create	Create courses, edit content, grade assignments
FULL_ACCESS	Complete control	All permissions including delete, approve, configure
Role Types
Table
Role Type	Code	Description
ADMIN	System Administrator	Full system access and configuration
INSTRUCTOR	Teacher/Facilitator	Course delivery, grading, content management
STUDENT	Learner	Course access, assessment participation
SUPERVISOR	Academic Supervisor	Content approval, instructor oversight
ACADEMIC_ADMIN	Academic Administrator	Curriculum management, reporting, enrollments
Sample Workflow: Complete Role Assignment
Step 1: Create a New Role
bash
Copy
curl -X POST https://api.groomingcentre.com/api/v2/roles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "roleName": "Course Supervisor",
    "description": "Supervises course content and instructor activities",
    "roleType": "SUPERVISOR",
    "permissions": ["CONTENT_APPROVE", "INSTRUCTOR_MANAGE", "COURSE_REVIEW"],
    "isActive": true
  }'
Step 2: Assign Role to User
bash
Copy
curl -X POST https://api.groomingcentre.com/api/v2/users/user-789/roles \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "roleId": "550e8400-e29b-41d4-a716-446655440005",
    "assignmentDate": "2025-11-20T10:00:00Z"
  }'
Step 3: Verify User Roles
bash
Copy
curl -X GET https://api.groomingcentre.com/api/v2/users/user-789/roles \
  -H "Authorization: Bearer <token>"
Error Responses
Standard Error Format
JSON
Copy
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ROLE_NOT_FOUND",
    "details": "The specified role ID does not exist"
  }
}
Common Error Codes
Table
Code	HTTP Status	Description
ROLE_NOT_FOUND	404	Role does not exist
USER_NOT_FOUND	404	User does not exist
ROLE_EXISTS	409	Role name already in use
ROLE_ALREADY_ASSIGNED	409	User already has this role
INVALID_PERMISSIONS	400	Invalid permission strings provided
UNAUTHORIZED	401	Invalid or missing authentication
