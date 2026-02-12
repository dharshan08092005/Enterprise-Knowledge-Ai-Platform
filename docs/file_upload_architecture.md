# File Upload & Async Processing Architecture


## 1️⃣ Overview

This document describes the document ingestion, processing, job lifecycle, RBAC, and observability components of the Enterprise Knowledge AI Platform.

### This system is designed to be:
- Scalable
- Fault-tolerant
- Auditable
- Role-aware
- RAG-ready

---

## 2️⃣ Document Upload Flow
Endpoint - POST /api/documents
Authorization - requireRole("USER", "ADMIN")

### Responsibilities:
- Accept file upload
- Store file metadata
- Create async processing job
- Log audit event

### Document Processing Flow:

    User Upload
    ↓
    Document record created (status: "uploaded")
    ↓
    Job created (type: DOCUMENT_PROCESSING, status: PENDING)
    ↓
    Audit log: DOCUMENT_UPLOAD_QUEUED

### Document Schema (Simplified):
{
  _id: ObjectId,
  title: string,
  ownerId: ObjectId,
  status: "uploaded" | "processing" | "active" | "failed",
  createdAt: Date,
  updatedAt: Date
}

---

## 3️⃣ Async Job Processing

📌 Job Types - DOCUMENT_PROCESSING
📌 Job Types - DOCUMENT_PROCESSING

### Job Schema:
{
  _id: ObjectId,
  type: "DOCUMENT_PROCESSING",
  documentId: ObjectId,
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "DEAD",
  attempts: number,
  maxAttempts: number,
  nextRunAt: Date,
  error: string | null,
  createdAt: Date,
  updatedAt: Date
}

### 🔁 Job Lifecycle:
        PENDING
        ↓
        PROCESSING
        ↓
        COMPLETED

        OR

        PROCESSING
        ↓
        PENDING (retry with backoff)
        ↓
        PROCESSING
        ↓
        DEAD (after maxAttempts)

---

## 4️⃣ Retry & Backoff Strategy:
### Policy:
Max Attempts: 3

### Backoff Formula:
- delay = baseDelay × (2 ^ attempts)

### 📌 Example:
- Attempt 1: 1 minute
- Attempt 2: 2 minutes
- Attempt 3: 4 minutes
- Attempt 4: DEAD

### 🎯 Design Goals:
- Avoid retry storms
- Prevent infinite loops
- Enable self-healing
- Maintain system stability

---

## 5️⃣ Dead Letter Queue (DLQ)

### 📌 When a Job Becomes DEAD:
- attempts >= maxAttempts
- Processing failure persists

Job state: status = "DEAD"

📌 Admin Visibility: GET /api/jobs/dead

Role: requireRole("ADMIN", "AUDITOR")

---

## 6️⃣ Admin Retry Mechanism
📌 Endpoint: POST /api/jobs/:id/retry

Role: requireRole("ADMIN")

### 🔁 What Happens:
- Reset attempts to 0
- status → PENDING
- nextRunAt → now
- error → null
- Audit log: JOB_RETRIED_BY_ADMIN

---

## 7️⃣ Knowledge Base
📌 Endpoint: GET /api/knowledge-base

Role: requireRole("USER", "ADMIN", "AUDITOR")

🎯 Purpose: Defines which documents are eligible for AI retrieval.

### 📌 Visibility Rules:
Role	Visibility
USER	Own active documents
ADMIN	All active documents
AUDITOR	All active documents

### ⚠️ Critical Rule:
- Documents not visible in /knowledge-base must never influence AI answers.

---

## 8️⃣ Documents API
📌 Endpoint: GET /api/documents

### Purpose:
- Operational visibility
- Lifecycle management
- Debugging uploads

### Includes:
- uploaded
- processing
- active
- failed

---

## 9️⃣ Audit Logs
📌 Endpoint: GET /api/audit/logs

Role: requireRole("ADMIN", "AUDITOR")

### 📌 Logged Events:
Examples:
- USER_LOGIN
- DOCUMENT_UPLOAD_QUEUED
- JOB_CREATED
- JOB_STARTED
- JOB_RETRY_SCHEDULED
- JOB_COMPLETED
- JOB_FAILED
- JOB_RETRIED_BY_ADMIN

### 📊 Purpose:
- Compliance
- Incident investigation
- Operational observability
- Explainability

---

## 🔟 RBAC Model
Roles:
- ADMIN
- USER
- AUDITOR

| Feature             | USER   | ADMIN  | AUDITOR  |
| ------------------- |--------|--------|----------|
| Upload document     | ✅    | ✅     | ❌       |
| View own documents  | ✅    | ✅     | ❌       |
| View all documents  | ❌    | ✅     | ✅       |
| View Knowledge Base | Own    | All    | All      |
| Retry DEAD jobs     | ❌    | ✅     | ❌       |
| View audit logs     | ❌    | ✅     | ✅       |
| Ask AI questions    | ✅    | ✅     | ❌       |

---

## 1️⃣1️⃣ Worker Architecture

Worker runs independently: npx ts-node workers/documentWorker.ts

### Responsibilities:
- Poll PENDING jobs
- Mark PROCESSING
- Execute task
- Handle retries
- Move to DEAD if needed
- Emit audit logs

---

## 1️⃣2️⃣ Security Guarantees:

- JWT-based authentication
- Role-based authorization
- Ownership validation
- Read-only auditor model
- No AI access outside Knowledge Base
- No retry access outside Admin

## 1️⃣3️⃣ System Design Principles:
- Separation of concerns
- Canonical audit log source
- Single responsibility per endpoint
- Async-first processing
- Fail-safe retry model
- Explainable AI boundary enforcement

## 1️⃣4️⃣ Current Status:

| Component               | Status |
| ----------------------- | ------ |
| Authentication          | ✅     |
| RBAC                    | ✅     |
| Document Upload         | ✅     |
| Async Processing        | ✅     |
| Retry & Backoff         | ✅     |
| Dead Letter Queue       | ✅     |
| Admin Retry             | ✅      |
| Knowledge Base          | ✅      |
| Audit Logs              | ✅      |
| Admin Users API         | ✅      |
| Auditor Read-Only Model | ✅      |


User uploads document → Backend saves file → Create job in DB →
Job queue → Worker picks up → 
Extract text → Chunk text → Embed text → Store in vector DB →
Update job status →
Notify user