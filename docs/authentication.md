# 🔐 Authentication & Session Management
## Enterprise Knowledge AI Platform

---

## 1. Overview

This document describes the **authentication, authorization, and session management system** implemented in the backend of the **Enterprise Knowledge AI Platform**.

The system is designed to be:
- Secure by default
- Stateless at the API layer
- Auditable and compliant
- Enterprise-grade (not demo-level)

This document acts as:
- A **technical reference**
- A **future self-guide**
- An **interview & review explanation**

---

## 2. Authentication Architecture

### Token Strategy

| Token Type | Purpose | Lifetime | Storage |
|-----------|--------|----------|--------|
| Access Token (JWT) | API authorization | Short-lived | Client (localStorage) |
| Refresh Token | Session continuity | Long-lived | httpOnly Cookie + DB |

### Core Principles

- Backend APIs are **stateless**
- Access tokens are **never stored server-side**
- Refresh tokens are **stored, revocable, and rotated**
- All auth actions are **audited**

---

## 3. Signup Flow

POST /api/auth/signup
### Flow
1. Validate email uniqueness
2. Assign default role (`USER`)
3. Hash password using bcrypt
4. Create user in database
5. Generate access token
6. Log audit event

### Security Guarantees
- Passwords are never stored in plaintext
- Roles are assigned server-side
- Audit log recorded (`USER_SIGNUP`)

---

## 4. Login Flow
POST /api/auth/login

### Flow
1. Find user by email
2. Verify account is active
3. Compare hashed password
4. Generate access token (JWT)
5. Generate refresh token
6. Store refresh token in database
7. Send refresh token as httpOnly cookie
8. Log audit events

### Audit Events
- `USER_LOGIN` – successful login
- `LOGIN_FAILED` – failed login attempt

---

## 5. Access Token (JWT)

### Payload Structure
```json
{
  "userId": "<user_id>",
  "role": "USER"
}

### Characteristics

- Short-lived
- Signed using secret key
- Sent via Authorization header
- Used only for authorization

Authorization: Bearer <access_token>


---

## 6. /auth/me – Identity Verification
Endpoint GET /api/auth/me

### Purpose

- Validate access token
- Restore session after page refresh
- Provide user identity to frontend

### Protection

- Requires authentication middleware
- Reads identity from JWT payload

---

## 7. Authentication Middleware

### Responsibilities

- Extract JWT from Authorization header
- Verify signature and expiration
- Validate expected payload fields
- Attach safe req.user object

### Guarantees

- No trust in client-provided roles
- No business logic inside middleware
- Centralized security enforcement

---

## 8. Audit Logging System
Collection : auditlogs

### Logged Events

- USER_SIGNUP
- USER_LOGIN
- LOGIN_FAILED
- (Extensible for future features)

### Design Principles

- Append-only
- Non-blocking (failures don’t affect main flow)
- Sensitive data is never logged
- Centralized logging utility

---

## 9. Rate Limiting (Auth Protection)

### Purpose
- Prevent brute-force attacks
- Prevent credential stuffing
- Prevent automated signups

| Endpoint       | Limit                   |
| -------------- | ----------------------- |
| `/auth/login`  | 5 attempts / 15 minutes |
| `/auth/signup` | 10 attempts / hour      |

### Implementation
- express-rate-limit
- Applied only to authentication routes

---

## 10. Refresh Token System

### Why Refresh Tokens Are Used
- Access tokens expire quickly
- Refresh tokens enable silent renewal
- Sessions can be revoked server-side

---

## 11. Refresh Token Storage

Collection : refreshtokens

### Schema Highlights
- token (unique)
- userId
- expiresAt
- revoked
- Timestamps

### Security
- Stored server-side
- Sent as httpOnly cookies
- Never accessible to JavaScript

---

## 12. /auth/refresh – Access Token Renewal

### Endpoint
POST /api/auth/refresh

### Flow
- Read refresh token from cookie
- Validate token in database
- Check expiry and revoked status
- Load user and role
- Rotate refresh token
- Issue new access token
- Send new refresh token cookie

---

## 13. Refresh Token Rotation

### Why Rotation Is Critical
- Prevents replay attacks
- Detects token theft
- Enforces single-use refresh tokens

### Behavior
- Old refresh token is revoked
- New refresh token is issued
- Reuse of old token is rejected

---

## 14. Logout Flow

### Endpoint
POST /api/auth/logout

### Flow
- Read refresh token from cookie
- Revoke refresh token in database
- Clear refresh token cookie
- End session

### Result
- Refresh endpoint fails after logout
- Session is fully terminated server-side

---

## 15. Security Checklist (Current State)

| Feature             | Status |
| ------------------- | ------ |
| Password hashing    | ✅      |
| JWT authentication  | ✅      |
| Role assignment     | ✅      |
| `/auth/me`          | ✅      |
| Audit logging       | ✅      |
| Rate limiting       | ✅      |
| Refresh tokens      | ✅      |
| Token rotation      | ✅      |
| Logout & revocation | ✅      |

---

## 16. Key Design Decisions

- Stateless access tokens for scalability
- Stateful refresh tokens for security
- Server-controlled roles
- Centralized audit logging
- Route-specific rate limiting
- Token rotation to prevent replay attacks