# TC13 — IP-Based Authentication and Authorization

## Developer README

> **Module Tag:** `IP Auth Policy`
> **PRD Reference:** TC13 – IP-Based Authentication and Authorization
> **Base URL (Production):** `https://gclms.xanotech.org`
> **Base URL (Local):** `http://localhost:8089`
> **Authentication:** All endpoints require a Bearer JWT token via `Authorization: Bearer <token>`

---

## Table of Contents

1. [Overview](#overview)
2. [Module Endpoints](#module-endpoints)
3. [End-to-End Flow](#end-to-end-flow)
4. [Step-by-Step Integration Guide](#step-by-step-integration-guide)
   - [Step 1 — Authenticate](#step-1--authenticate)
   - [Step 2 — Create an IP Access Policy](#step-2--create-an-ip-access-policy)
   - [Step 3 — List All IP Policies](#step-3--list-all-ip-policies)
   - [Step 4 — Get a Single Policy by ID](#step-4--get-a-single-policy-by-id)
   - [Step 5 — Activate a Policy](#step-5--activate-a-policy)
   - [Step 6 — Get the Currently Active Policy](#step-6--get-the-currently-active-policy)
   - [Step 7 — Test an IP Against the Active Policy](#step-7--test-an-ip-against-the-active-policy)
   - [Step 8 — Update a Policy](#step-8--update-a-policy)
   - [Step 9 — Deactivate a Policy](#step-9--deactivate-a-policy)
   - [Step 10 — Delete a Policy](#step-10--delete-a-policy)
   - [Step 11 — View Authentication Attempt Logs](#step-11--view-authentication-attempt-logs)
   - [Step 12 — Get Security KPIs](#step-12--get-security-kpis)
   - [Step 13 — Request a Temporary Access Exception](#step-13--request-a-temporary-access-exception)
   - [Step 14 — View My Exception Requests](#step-14--view-my-exception-requests)
   - [Step 15 — Admin Lists All Exception Requests](#step-15--admin-lists-all-exception-requests)
   - [Step 16 — Admin Approves or Denies an Exception](#step-16--admin-approves-or-denies-an-exception)
5. [rolePolicies Configuration Reference](#rolepolicies-configuration-reference)
6. [Request & Response Schema Reference](#request--response-schema-reference)
7. [Filtering & Query Parameters](#filtering--query-parameters)
8. [Error Handling](#error-handling)

---

## Overview

The IP Auth Policy module adds a network-level security layer to the LMS. Every login attempt is validated against an active IP policy before standard authentication proceeds. The policy defines per-role IP allowlists, global IP blocklists, VPN/trusted network ranges, brute-force thresholds, and rate limits.

Only **one policy can be active at a time**. Activating a new policy automatically deactivates the previous one.

**The complete lifecycle is:**

```
Create policy (draft) → Activate policy → Every login validated against it
→ Denied attempts logged → Users request exceptions → Admin approves/denies
→ Monitor via logs and KPIs
```

---

## Module Endpoints

All 15 endpoints that belong to this module:

| #   | Method   | Path                                                   | Description                                        | Roles             |
| --- | -------- | ------------------------------------------------------ | -------------------------------------------------- | ----------------- |
| 1   | `POST`   | `/api/v1/ip-policy-v2`                                 | Create an IP access policy                         | Admin             |
| 2   | `GET`    | `/api/v1/ip-policy-v2`                                 | List all IP policies (paginated)                   | Admin             |
| 3   | `GET`    | `/api/v1/ip-policy-v2/active`                          | Get the currently active policy                    | Admin             |
| 4   | `GET`    | `/api/v1/ip-policy-v2/kpis`                            | Get IP authentication KPIs                         | Admin             |
| 5   | `GET`    | `/api/v1/ip-policy-v2/logs`                            | Get authentication attempt logs (paginated)        | Admin             |
| 6   | `GET`    | `/api/v1/ip-policy-v2/check`                           | Test if an IP is permitted under the active policy | Admin             |
| 7   | `GET`    | `/api/v1/ip-policy-v2/{policyId}`                      | Get a single policy by ID                          | Admin             |
| 8   | `PATCH`  | `/api/v1/ip-policy-v2/{policyId}`                      | Update a policy                                    | Admin             |
| 9   | `DELETE` | `/api/v1/ip-policy-v2/{policyId}`                      | Delete a policy (blocked if active)                | Admin             |
| 10  | `POST`   | `/api/v1/ip-policy-v2/{policyId}/activate`             | Activate a policy                                  | Admin             |
| 11  | `POST`   | `/api/v1/ip-policy-v2/{policyId}/deactivate`           | Deactivate a policy                                | Admin             |
| 12  | `POST`   | `/api/v1/ip-policy-v2/exceptions`                      | Request a temporary IP access exception            | All authenticated |
| 13  | `GET`    | `/api/v1/ip-policy-v2/exceptions`                      | List all exception requests (admin)                | Admin             |
| 14  | `GET`    | `/api/v1/ip-policy-v2/exceptions/my-requests`          | Get own exception requests                         | All authenticated |
| 15  | `PATCH`  | `/api/v1/ip-policy-v2/exceptions/{exceptionId}/review` | Approve or deny an exception                       | Admin             |

---

## End-to-End Flow

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 1: Admin Creates an IP Access Policy                                   │
│                                                                              │
│  POST /api/v1/ip-policy-v2                                                   │
│                                                                              │
│  Defines:                                                                    │
│    - name / description                                                      │
│    - rolePolicies  → per-role IP allowlists, VPN flag, rate limits          │
│    - blockedIps    → globally blocked IPs or CIDR ranges                    │
│    - trustedNetworks → VPN / trusted CIDR ranges (bypass allowlists)        │
│    - bruteForceThreshold → failed attempts before IP block (default: 5)     │
│    - rateLimitWindowMinutes → rolling window for brute-force count (def: 15)│
│    - impossibleTravelDetection → flag logins from distant locations (bool)  │
│    - status → draft (default) — not enforced until activated                │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 2: Admin Activates the Policy                                          │
│                                                                              │
│  POST /api/v1/ip-policy-v2/{policyId}/activate                               │
│                                                                              │
│  System:                                                                     │
│    - Sets this policy status → active                                        │
│    - Automatically deactivates any previously active policy                 │
│    - From this point every login attempt is validated against this policy    │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 3: Every Login Attempt Is Validated                                    │
│                                                                              │
│  On each login the system:                                                   │
│    1. Captures IP address, role, device info                                │
│    2. Checks IP against blockedIps → if match → DENIED                      │
│    3. Checks if IP is in trustedNetworks → if match → ALLOWED (VPN bypass)  │
│    4. Checks rolePolicies[role].allowed_ips                                  │
│         - ["any"] → ALLOWED                                                  │
│         - specific IPs / CIDR ranges → match required or DENIED             │
│    5. Checks brute-force counter for the IP                                  │
│         - count ≥ bruteForceThreshold → BLOCKED                             │
│    6. Decision logged to ipAuthLog with authStatus, denialReason, alerts     │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 4: Denied User Requests a Temporary Exception                          │
│                                                                              │
│  POST /api/v1/ip-policy-v2/exceptions                                        │
│                                                                              │
│  User submits:                                                               │
│    - ipAddress → the IP that needs temporary access                         │
│    - reason    → business justification                                      │
│                                                                              │
│  Status set to pending. Admin notified.                                      │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 5: Admin Reviews and Approves or Denies the Exception                  │
│                                                                              │
│  PATCH /api/v1/ip-policy-v2/exceptions/{exceptionId}/review                  │
│                                                                              │
│  Approved:                                                                   │
│    - expiresAt required → exception auto-voids after this datetime          │
│    - IP is permitted until expiry regardless of the active policy           │
│  Denied:                                                                     │
│    - Optional reviewNote explains the reason                                 │
└───────────────────────────────────┬──────────────────────────────────────────┘
                                    │
                                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│  STEP 6: Admin Monitors Activity                                             │
│                                                                              │
│  GET /api/v1/ip-policy-v2/logs    → full paginated auth attempt log         │
│  GET /api/v1/ip-policy-v2/kpis    → denied rate, brute force count, etc.   │
│  GET /api/v1/ip-policy-v2/check   → test any IP against the active policy  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Step-by-Step Integration Guide

### Step 1 — Authenticate

All endpoints require a valid JWT.

```http
POST /api/v1/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "YourPassword"
}
```

**Response:**

```json
{
  "status": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "sessionId": "c1d2e3f4-a5b6-7890-cdef-123456789012"
  }
}
```

Use `Authorization: Bearer <token>` on every subsequent request.

---

### Step 2 — Create an IP Access Policy

Only **Admin** role can create policies. New policies start as `draft` and are not enforced until activated.

```http
POST /api/v1/ip-policy-v2
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Main Campus Policy",
  "description": "Restricts Admin to campus network; all others unrestricted",
  "rolePolicies": {
    "Admin": {
      "allowed_ips": ["192.168.1.0/24"],
      "vpn_allowed": true,
      "rate_limit": 30
    },
    "Instructor": {
      "allowed_ips": ["any"],
      "rate_limit": 20
    },
    "Student": {
      "allowed_ips": ["any"],
      "rate_limit": 10
    }
  },
  "blockedIps": ["185.23.44.0/24"],
  "trustedNetworks": ["10.0.0.0/8"],
  "bruteForceThreshold": 5,
  "rateLimitWindowMinutes": 15,
  "impossibleTravelDetection": true,
  "status": "draft"
}
```

**Success Response — `201 Created`:**

```json
{
  "success": true,
  "message": "IP policy created successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Main Campus Policy",
    "description": "Restricts Admin to campus network; all others unrestricted",
    "rolePolicies": {
      "Admin": {
        "allowed_ips": ["192.168.1.0/24"],
        "vpn_allowed": true,
        "rate_limit": 30
      },
      "Instructor": { "allowed_ips": ["any"], "rate_limit": 20 },
      "Student": { "allowed_ips": ["any"], "rate_limit": 10 }
    },
    "blockedIps": ["185.23.44.0/24"],
    "trustedNetworks": ["10.0.0.0/8"],
    "bruteForceThreshold": 5,
    "rateLimitWindowMinutes": 15,
    "impossibleTravelDetection": true,
    "status": "draft",
    "creator": {
      "id": "uuid-admin-1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    "createdAt": "2026-05-21T09:00:00.000Z",
    "updatedAt": "2026-05-21T09:00:00.000Z"
  }
}
```

---

### Step 3 — List All IP Policies

```http
GET /api/v1/ip-policy-v2
Authorization: Bearer <token>
```

**With filters:**

```http
GET /api/v1/ip-policy-v2?status=draft&page=1&limit=20
Authorization: Bearer <token>
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "total": 4,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "policies": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Main Campus Policy",
        "status": "draft",
        "bruteForceThreshold": 5,
        "impossibleTravelDetection": true,
        "createdAt": "2026-05-21T09:00:00.000Z"
      },
      {
        "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "name": "Remote Access Policy",
        "status": "active",
        "bruteForceThreshold": 3,
        "impossibleTravelDetection": false,
        "createdAt": "2026-04-10T08:00:00.000Z"
      }
    ]
  }
}
```

---

### Step 4 — Get a Single Policy by ID

```http
GET /api/v1/ip-policy-v2/{policyId}
Authorization: Bearer <token>
```

**Example:**

```http
GET /api/v1/ip-policy-v2/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer <token>
```

**Success Response — `200 OK`:** Returns the full `IpPolicy` object including `rolePolicies`, `blockedIps`, `trustedNetworks`, and creator details.

**`404`** is returned when the `policyId` does not exist.

---

### Step 5 — Activate a Policy

Activating a policy enforces it immediately on all subsequent login attempts. Any previously active policy is automatically deactivated.

```http
POST /api/v1/ip-policy-v2/{policyId}/activate
Authorization: Bearer <token>
```

**Example:**

```http
POST /api/v1/ip-policy-v2/a1b2c3d4-e5f6-7890-abcd-ef1234567890/activate
Authorization: Bearer <token>
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Main Campus Policy",
    "status": "active",
    "updatedAt": "2026-05-21T10:00:00.000Z"
  }
}
```

> Only one policy can be `active` at a time. All other policies remain `draft` or `inactive`.

---

### Step 6 — Get the Currently Active Policy

Use this to confirm which policy is currently being enforced, or to display it in a security dashboard.

```http
GET /api/v1/ip-policy-v2/active
Authorization: Bearer <token>
```

**Success Response — `200 OK`:** Returns the full `IpPolicy` object for the active policy.

**`404`** is returned when no policy is currently active — login attempts proceed without IP enforcement until a policy is activated.

---

### Step 7 — Test an IP Against the Active Policy

Use this utility endpoint to validate any IP address before deployment, or to investigate a specific IP during a security review.

```http
GET /api/v1/ip-policy-v2/check?ipAddress=102.89.45.12&role=Admin
Authorization: Bearer <token>
```

**Query Parameters:**

| Parameter   | Required | Description                                                     |
| ----------- | -------- | --------------------------------------------------------------- |
| `ipAddress` | **Yes**  | IPv4 address to test, e.g. `192.168.1.50`                       |
| `role`      | No       | Role to evaluate against, e.g. `Admin`, `Instructor`, `Student` |

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "ipAddress": "102.89.45.12",
    "role": "Admin",
    "allowed": false,
    "reason": "IP 102.89.45.12 is not in the allowed range 192.168.1.0/24 for role Admin",
    "isBruteForce": false,
    "alertGenerated": true,
    "policyId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
  }
}
```

**`400`** is returned when `ipAddress` query parameter is missing.

---

### Step 8 — Update a Policy

All fields are optional — only send what needs to change. Changes to an **active** policy take effect immediately.

**Example — add an IP to the blocklist:**

```http
PATCH /api/v1/ip-policy-v2/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer <token>
Content-Type: application/json

{
  "blockedIps": ["185.23.44.0/24", "203.45.67.0/24"]
}
```

**Example — lower the brute-force threshold:**

```http
PATCH /api/v1/ip-policy-v2/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer <token>
Content-Type: application/json

{
  "bruteForceThreshold": 3
}
```

**Example — restrict Instructor role to a specific network:**

```http
PATCH /api/v1/ip-policy-v2/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer <token>
Content-Type: application/json

{
  "rolePolicies": {
    "Admin": {
      "allowed_ips": ["192.168.1.0/24"],
      "vpn_allowed": true
    },
    "Instructor": {
      "allowed_ips": ["192.168.2.0/24"],
      "rate_limit": 20
    },
    "Student": {
      "allowed_ips": ["any"],
      "rate_limit": 10
    }
  }
}
```

**Success Response — `200 OK`:** Returns the updated `IpPolicy` object.

---

### Step 9 — Deactivate a Policy

Suspends IP enforcement. Login attempts will no longer be validated against any policy until a new one is activated.

```http
POST /api/v1/ip-policy-v2/{policyId}/deactivate
Authorization: Bearer <token>
```

**Example:**

```http
POST /api/v1/ip-policy-v2/a1b2c3d4-e5f6-7890-abcd-ef1234567890/deactivate
Authorization: Bearer <token>
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Main Campus Policy",
    "status": "inactive",
    "updatedAt": "2026-05-21T11:00:00.000Z"
  }
}
```

---

### Step 10 — Delete a Policy

Permanently removes the policy. **Cannot delete an active policy** — deactivate it first.

```http
DELETE /api/v1/ip-policy-v2/{policyId}
Authorization: Bearer <token>
```

**Example:**

```http
DELETE /api/v1/ip-policy-v2/a1b2c3d4-e5f6-7890-abcd-ef1234567890
Authorization: Bearer <token>
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "message": "IP policy deleted successfully"
}
```

**`403` response when trying to delete an active policy:**

```json
{
  "success": false,
  "message": "Cannot delete an active policy. Deactivate it first."
}
```

---

### Step 11 — View Authentication Attempt Logs

Returns a paginated log of every login attempt that was validated against an IP policy — including allowed, denied, and blocked outcomes.

```http
GET /api/v1/ip-policy-v2/logs
Authorization: Bearer <token>
```

**With filters:**

```http
GET /api/v1/ip-policy-v2/logs
  ?authStatus=denied
  &role=Admin
  &isBruteForce=true
  &startDate=2026-05-01
  &endDate=2026-05-21
  &page=1
  &limit=20
Authorization: Bearer <token>
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "total": 142,
    "page": 1,
    "limit": 20,
    "totalPages": 8,
    "logs": [
      {
        "id": "uuid-log-1",
        "userId": "uuid-user-1",
        "user": {
          "id": "uuid-user-1",
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "jane.smith@example.com"
        },
        "ipAddress": "102.89.45.12",
        "role": "Admin",
        "authStatus": "denied",
        "denialReason": "IP not in allowed range 192.168.1.0/24 for role Admin",
        "deviceInfo": {
          "device_type": "laptop",
          "os": "Windows 11",
          "browser": "Chrome"
        },
        "policyId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "alertGenerated": true,
        "isBruteForce": false,
        "attemptCount": 1,
        "createdAt": "2026-05-21T08:15:00.000Z"
      }
    ]
  }
}
```

---

### Step 12 — Get Security KPIs

Returns aggregate security metrics for monitoring and compliance reporting.

```http
GET /api/v1/ip-policy-v2/kpis
Authorization: Bearer <token>
```

**With date range:**

```http
GET /api/v1/ip-policy-v2/kpis?startDate=2026-05-01&endDate=2026-05-21
Authorization: Bearer <token>
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "totalAttempts": 1850,
    "allowedAttempts": 1700,
    "deniedAttempts": 150,
    "unauthorizedAccessRate": 8,
    "securityAlertFrequency": 12,
    "bruteForceDetections": 3,
    "byStatus": [
      { "status": "allowed", "count": 1700 },
      { "status": "denied", "count": 140 },
      { "status": "blocked", "count": 10 }
    ],
    "ipLoginDistribution": [
      { "role": "Admin", "authStatus": "allowed", "count": 420 },
      { "role": "Admin", "authStatus": "denied", "count": 130 },
      { "role": "Instructor", "authStatus": "allowed", "count": 580 },
      { "role": "Student", "authStatus": "allowed", "count": 700 }
    ]
  }
}
```

| KPI Field                | Formula                                         |
| ------------------------ | ----------------------------------------------- |
| `unauthorizedAccessRate` | `(deniedAttempts ÷ totalAttempts) × 100`        |
| `securityAlertFrequency` | Count of attempts where `alertGenerated = true` |
| `bruteForceDetections`   | Count of attempts where `isBruteForce = true`   |
| `ipLoginDistribution`    | Access breakdown by role and authStatus         |

---

### Step 13 — Request a Temporary Access Exception

Any authenticated user (Student, Instructor, Admin) can submit this when denied access from a network that is not in the active policy.

```http
POST /api/v1/ip-policy-v2/exceptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "ipAddress": "102.89.45.12",
  "reason": "Travelling to a client site this week, need access from hotel network"
}
```

**Success Response — `201 Created`:**

```json
{
  "success": true,
  "message": "Exception request submitted successfully",
  "data": {
    "id": "uuid-exception-1",
    "ipAddress": "102.89.45.12",
    "reason": "Travelling to a client site this week, need access from hotel network",
    "status": "pending",
    "requestedBy": "uuid-user-1",
    "requester": {
      "id": "uuid-user-1",
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane.smith@example.com"
    },
    "reviewedBy": null,
    "reviewedAt": null,
    "expiresAt": null,
    "reviewNote": null,
    "createdAt": "2026-05-21T09:30:00.000Z"
  }
}
```

---

### Step 14 — View My Exception Requests

Users can track the status of their own submitted exception requests.

```http
GET /api/v1/ip-policy-v2/exceptions/my-requests
Authorization: Bearer <token>
```

**With status filter:**

```http
GET /api/v1/ip-policy-v2/exceptions/my-requests?status=pending&page=1&limit=20
Authorization: Bearer <token>
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "total": 2,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "exceptions": [
      {
        "id": "uuid-exception-1",
        "ipAddress": "102.89.45.12",
        "reason": "Travelling to a client site this week",
        "status": "pending",
        "expiresAt": null,
        "reviewNote": null,
        "createdAt": "2026-05-21T09:30:00.000Z"
      }
    ]
  }
}
```

---

### Step 15 — Admin Lists All Exception Requests

Admin view of all exception requests across all users. Filterable by status.

```http
GET /api/v1/ip-policy-v2/exceptions
Authorization: Bearer <token>
```

**Filter to pending requests only:**

```http
GET /api/v1/ip-policy-v2/exceptions?status=pending&page=1&limit=20
Authorization: Bearer <token>
```

**Success Response — `200 OK`:**

```json
{
  "success": true,
  "data": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1,
    "exceptions": [
      {
        "id": "uuid-exception-1",
        "ipAddress": "102.89.45.12",
        "reason": "Travelling to a client site this week",
        "status": "pending",
        "requestedBy": "uuid-user-1",
        "requester": {
          "id": "uuid-user-1",
          "firstName": "Jane",
          "lastName": "Smith",
          "email": "jane.smith@example.com"
        },
        "reviewedBy": null,
        "reviewer": null,
        "expiresAt": null,
        "createdAt": "2026-05-21T09:30:00.000Z"
      }
    ]
  }
}
```

---

### Step 16 — Admin Approves or Denies an Exception

Only **Admin** can review exception requests. When approving, `expiresAt` is required — the exception is automatically voided after that datetime.

**Approve with a 3-day window:**

```http
PATCH /api/v1/ip-policy-v2/exceptions/{exceptionId}/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved",
  "expiresAt": "2026-05-24T23:59:00Z",
  "reviewNote": "Confirmed travelling for client project — access granted until Friday"
}
```

**Deny a request:**

```http
PATCH /api/v1/ip-policy-v2/exceptions/{exceptionId}/review
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "denied",
  "reviewNote": "Please use the company VPN instead of requesting a direct IP exception"
}
```

**Success Response — `200 OK` (approved):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-exception-1",
    "ipAddress": "102.89.45.12",
    "status": "approved",
    "expiresAt": "2026-05-24T23:59:00.000Z",
    "reviewNote": "Confirmed travelling for client project — access granted until Friday",
    "reviewedBy": "uuid-admin-1",
    "reviewer": {
      "id": "uuid-admin-1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com"
    },
    "reviewedAt": "2026-05-21T10:00:00.000Z"
  }
}
```

**`400`** is returned when `status` is `approved` but `expiresAt` is missing.
**`403`** is returned when the exception has already been reviewed.

---

## rolePolicies Configuration Reference

The `rolePolicies` object maps each role name to its network access rules.

```json
"rolePolicies": {
  "RoleName": {
    "allowed_ips": ["192.168.1.0/24"],
    "vpn_allowed": true,
    "rate_limit": 30
  }
}
```

| Field         | Type       | Description                                                                                  |
| ------------- | ---------- | -------------------------------------------------------------------------------------------- |
| `allowed_ips` | `string[]` | List of allowed IPv4 addresses or CIDR ranges. Use `["any"]` to allow all IPs for this role  |
| `vpn_allowed` | `boolean`  | When `true`, connections from `trustedNetworks` bypass the `allowed_ips` check for this role |
| `rate_limit`  | `integer`  | Maximum requests per minute for this role (informational — enforced by rate limiter)         |

### Common Patterns

| Scenario                          | `allowed_ips`                     | `vpn_allowed` |
| --------------------------------- | --------------------------------- | ------------- |
| Restrict Admin to campus LAN only | `["192.168.1.0/24"]`              | `false`       |
| Admin can use campus OR VPN       | `["192.168.1.0/24"]`              | `true`        |
| Instructor unrestricted           | `["any"]`                         | `false`       |
| Multiple office locations         | `["10.0.0.0/8", "172.16.0.0/12"]` | `true`        |

---

## Request & Response Schema Reference

### `IpPolicyRequest` — used by `POST` and `PATCH`

```
{
  name:                     string                           (required on POST)
  description:              string | null
  rolePolicies:             {                                (optional)
    [roleName]: {
      allowed_ips:          string[]   // IPs/CIDRs or ["any"]
      vpn_allowed:          boolean
      rate_limit:           integer
    }
  }
  blockedIps:               string[]   // globally blocked IPs/CIDRs
  trustedNetworks:          string[]   // VPN / trusted CIDR ranges
  bruteForceThreshold:      integer    default=5
  rateLimitWindowMinutes:   integer    default=15
  impossibleTravelDetection:boolean    default=false
  status:                   "draft" | "active" | "inactive"  default="draft"
}
```

### `IpPolicy` — Response Object

```
{
  id:                       UUID
  name:                     string
  description:              string | null
  rolePolicies:             object | null
  blockedIps:               string[] | null
  trustedNetworks:          string[] | null
  bruteForceThreshold:      integer
  rateLimitWindowMinutes:   integer
  impossibleTravelDetection:boolean
  status:                   "draft" | "active" | "inactive"
  creator:                  { id, firstName, lastName, email } | null
  createdAt:                datetime
  updatedAt:                datetime
}
```

### `IpAuthLog` — Returned in Logs Response

```
{
  id:             UUID
  userId:         UUID | null
  user:           { id, firstName, lastName, email } | null
  ipAddress:      string
  role:           string | null
  authStatus:     "allowed" | "denied" | "blocked"
  denialReason:   string | null
  deviceInfo:     { device_type, os, browser } | null
  policyId:       UUID | null
  alertGenerated: boolean
  isBruteForce:   boolean
  attemptCount:   integer
  createdAt:      datetime
}
```

### `IpAccessException` — Returned in Exceptions Responses

```
{
  id:           UUID
  ipAddress:    string
  reason:       string
  status:       "pending" | "approved" | "denied"
  requestedBy:  UUID
  requester:    { id, firstName, lastName, email }
  reviewedBy:   UUID | null
  reviewer:     { id, firstName, lastName, email } | null
  reviewedAt:   datetime | null
  expiresAt:    datetime | null
  reviewNote:   string | null
  createdAt:    datetime
}
```

### `IpAuthKpis` — Returned by KPI Endpoint

```
{
  totalAttempts:            integer
  allowedAttempts:          integer
  deniedAttempts:           integer
  unauthorizedAccessRate:   integer     // (denied ÷ total) × 100
  securityAlertFrequency:   integer
  bruteForceDetections:     integer
  byStatus:                 [{ status: string, count: integer }]
  ipLoginDistribution:      [{ role: string, authStatus: string, count: integer }]
}
```

---

## Filtering & Query Parameters

### `GET /api/v1/ip-policy-v2` — List Policies

| Parameter | Type    | Description                            |
| --------- | ------- | -------------------------------------- |
| `status`  | enum    | `draft`, `active`, `inactive`          |
| `search`  | string  | Case-insensitive search on policy name |
| `page`    | integer | Page number (default: `1`)             |
| `limit`   | integer | Records per page (default: `20`)       |

### `GET /api/v1/ip-policy-v2/logs` — Auth Attempt Logs

| Parameter        | Type    | Description                                |
| ---------------- | ------- | ------------------------------------------ |
| `ipAddress`      | string  | Filter by IP address (partial match)       |
| `authStatus`     | enum    | `allowed`, `denied`, `blocked`             |
| `role`           | string  | Filter by user role                        |
| `isBruteForce`   | boolean | `true` = brute-force flagged attempts only |
| `alertGenerated` | boolean | `true` = alert-generating attempts only    |
| `startDate`      | date    | Filter from this date (YYYY-MM-DD)         |
| `endDate`        | date    | Filter to this date (YYYY-MM-DD)           |
| `page`           | integer | Page number (default: `1`)                 |
| `limit`          | integer | Records per page (default: `20`)           |

### `GET /api/v1/ip-policy-v2/kpis` — KPIs

| Parameter   | Type | Description                 |
| ----------- | ---- | --------------------------- |
| `startDate` | date | Start of aggregation window |
| `endDate`   | date | End of aggregation window   |

### `GET /api/v1/ip-policy-v2/check` — IP Test

| Parameter   | Type   | Required | Description              |
| ----------- | ------ | -------- | ------------------------ |
| `ipAddress` | string | **Yes**  | IPv4 address to test     |
| `role`      | string | No       | Role to evaluate against |

### `GET /api/v1/ip-policy-v2/exceptions` and `my-requests`

| Parameter | Type    | Description                      |
| --------- | ------- | -------------------------------- |
| `status`  | enum    | `pending`, `approved`, `denied`  |
| `page`    | integer | Page number (default: `1`)       |
| `limit`   | integer | Records per page (default: `20`) |

---

## Error Handling

| HTTP Status   | Meaning                | Recommended Action                                                                         |
| ------------- | ---------------------- | ------------------------------------------------------------------------------------------ |
| `200` / `201` | Success                | Render response                                                                            |
| `400`         | Validation error       | Check required fields; verify CIDR format; ensure `expiresAt` is set when approving        |
| `401`         | Missing or invalid JWT | Re-authenticate                                                                            |
| `403`         | Action not permitted   | Cannot delete active policy — deactivate first; or exception already reviewed              |
| `404`         | Resource not found     | Verify `policyId` or `exceptionId` UUID; check `/active` returns 404 when no active policy |
| `500`         | Server error           | Retry; log for investigation                                                               |

### Common Errors

| Error                       | Cause                                                       | Fix                                                                 |
| --------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------- |
| `403` on DELETE             | Policy is currently `active`                                | Call `POST /{policyId}/deactivate` first, then delete               |
| `403` on exception review   | Exception already has `approved` or `denied` status         | Check `status` before calling review                                |
| `400` — missing `expiresAt` | Approving an exception without setting expiry               | Always include `expiresAt` when `status: "approved"`                |
| `400` — invalid IP format   | `ipAddress` or `blockedIps` entry is not valid IPv4 or CIDR | Use valid IPv4 (`102.89.45.12`) or CIDR (`192.168.1.0/24`) notation |
| `404` on `/active`          | No policy is currently active                               | Activate a policy via `POST /{policyId}/activate`                   |
