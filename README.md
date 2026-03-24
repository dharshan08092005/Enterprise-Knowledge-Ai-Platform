# 📘 Enterprise Knowledge AI Platform

- Secure • Explainable • Compliant AI for Enterprise Knowledge

A production-grade, full-stack Retrieval-Augmented Generation (RAG) platform that enables enterprises to securely ingest internal documents and generate grounded, citation-backed AI responses — with full RBAC enforcement and audit traceability.

## 🚀 Problem Statement

Modern enterprises generate massive internal knowledge:

- Policy documents
- SOPs & compliance guidelines
- HR manuals
- Technical documentation
- Security playbooks
- Contracts & meeting notes

However, this knowledge is:

- Scattered across systems
- Stored in PDFs and DOCX files
- Difficult to search semantically
- Hard to govern securely
- Unsafe to expose directly to LLMs

Traditional document systems and basic AI chatbots fail to provide:

- Secure access control
- Citation-backed answers
- Compliance-grade audit logs
- Operational reliability
- Protection against hallucination

## 🎯 Solution

The Enterprise Knowledge AI Platform provides:

- Secure document ingestion
- Async processing with retry logic
- Token-aware chunking
- Vector-based semantic retrieval
- Role-based access control (RBAC)
- Citation-backed AI responses
- Full audit logging

Admin & Auditor dashboards

## 🏗 System Architecture Overview

### 🔍 Query & Response Flow

```text
User
  ↓
Authentication & RBAC
  ↓
Knowledge Base Authorization Filter
  ↓
Vector Search (Top-K Chunks)
  ↓
LLM Prompt Construction
  ↓
AI Response + Citations
  ↓
Query Logs + Audit Logs
```

### 🔍 Query & Response Flow

```text
User
  ↓
Authentication & RBAC
  ↓
Knowledge Base Authorization Filter
  ↓
Vector Search (Top-K Chunks)
  ↓
LLM Prompt Construction
  ↓
AI Response + Citations
  ↓
Query Logs + Audit Logs
```

## 🔐 Security by Design
Role-Based Access Control (RBAC)

Roles:

- USER
- ADMIN
- AUDITOR

### Authorization is enforced at:
- Document visibility
- Vector retrieval filtering
- Admin actions
- Audit log access

### Golden Rule:

If a document is not visible to the user, it cannot influence AI answers.

### 🧠 Advanced RAG Design
- Chunk-based retrieval
- Token-aware chunking
- Overlap preservation
- Metadata-aware filtering
- Strict LLM grounding
- No unrestricted AI reasoning

### Prevents:
- Hallucinations
- Context overflow
- Unauthorized data exposure

### 📊 Observability & Compliance
#### Audit Logs
Tracks:
- User login
- Document upload
- Job processing
- Admin retries
- System failures
- Query Logs

Tracks:
- User question
- Retrieved documents
- Model used
- Response time
- Token usage

Supports:
- Compliance audits
- Debugging
- AI evaluation
- Governance reviews

## 🛠 Tech Stack
### Frontend
- React (Vite + TypeScript)
- Tailwind CSS
- Axios
- React Router

### Backend
- Node.js
- Express
- TypeScript
- JWT Authentication
- RBAC Middleware
- Multer (File Uploads)
- AI Layer
- pdf-parse
- gpt-tokenizer
- Embedding API
- Vector Database (Pinecone / Weaviate)
- LLM API (OpenAI / Gemini)

### Data Layer
- MongoDB
- Async Worker Architecture
- Indexed Queries

## 📂 Project Structure
```text
backend/
├── controllers/
├── middleware/
├── models/
├── services/
├── workers/
├── utils/
├── config/

frontend/
├── pages/
├── components/
├── routes/
├── services/
├── lib/
```

## ⚙️ Getting Started
1️⃣ Clone Repository
- git clone https://github.com/yourusername/enterprise-knowledge-ai.git
- cd enterprise-knowledge-ai

2️⃣ Backend Setup
- cd backend
- npm install
- npm run dev


Create .env:

- PORT=5000
- MONGO_URI=mongodb://127.0.0.1:27017/enterprise_ai
- JWT_SECRET=your_secret

3️⃣ Frontend Setup
- cd frontend
- npm install
- npm run dev

🔄 Background Worker

Runs document ingestion pipeline:
- npm run worker


Features:

- Exponential retry
- Dead-letter handling
- Stage tracking
- Audit logging

📈 Key Features

- ✅ Secure document ingestion
- ✅ Async reliability
- ✅ Retry with exponential backoff
- ✅ Dead-letter handling
- ✅ Token-aware chunking
- ✅ Vector search
- ✅ Citation-backed answers
- ✅ Full audit traceability
- ✅ Admin & Auditor separation

🔍 Explainability

### Every AI response can be traced to:
- Specific document
- Specific chunk
- Specific retrieval step
- Specific model
- Specific timestamp
- No black-box reasoning.
