# 📘 Enterprise Knowledge AI Platform

> **Secure • Explainable • Compliant AI for Enterprise Knowledge Management**

A production-grade, full-stack **Retrieval-Augmented Generation (RAG)** platform that enables enterprises to securely ingest internal documents, generate grounded and citation-backed AI responses, and collaborate through AI-powered channels — all with full **RBAC enforcement**, **multi-tenancy isolation**, and **audit traceability**.

---

## 📑 Table of Contents

1. [Abstract](#-abstract)
2. [Problem Statement](#-problem-statement)
3. [Solution Overview](#-solution-overview)
4. [System Architecture](#-system-architecture)
5. [Tech Stack](#-tech-stack)
6. [Project Structure](#-project-structure)
7. [Database Schema Design](#-database-schema-design)
8. [Core Modules & Features](#-core-modules--features)
9. [RAG Pipeline (Document Processing)](#-rag-pipeline-document-processing)
10. [AI & Embedding Architecture](#-ai--embedding-architecture)
11. [Security Architecture](#-security-architecture)
12. [Real-Time Communication](#-real-time-communication)
13. [API Reference](#-api-reference)
14. [Frontend Architecture](#-frontend-architecture)
15. [Observability & Compliance](#-observability--compliance)
16. [Getting Started](#-getting-started)
17. [Environment Variables](#-environment-variables)
18. [Future Scope](#-future-scope)
19. [Keywords](#-keywords)

---

## 📝 Abstract

Artificial Intelligence has transformed decision-making in modern enterprises, yet most organizations still struggle with fragmented knowledge silos, manual document tracking, and inefficient information retrieval. Existing systems lack intelligent document lifecycle management, semantic search capabilities, and natural language interaction, resulting in delayed responses and reduced productivity.

This project introduces the **Enterprise Knowledge AI Platform**, an automated, AI-driven system designed to centralize, govern, and democratize corporate knowledge. The platform addresses key challenges in enterprise knowledge management through intelligent document indexing, automated version control (Smart Superseding), and advanced semantic search powered by Retrieval-Augmented Generation (RAG).

The system is built on a modern full-stack architecture comprising **React.js** with **TypeScript** and **Tailwind CSS** for a dynamic, responsive frontend; **Node.js** and **Express.js** for high-performance, type-safe backend services; **MongoDB** for flexible metadata and session storage; **Pinecone Vector Database** for high-speed semantic similarity search; and **Google Gemini AI** as the core intelligence engine powering natural language interactions and context-aware information retrieval.

The platform effectively automates the knowledge lifecycle—from secure document ingestion and asynchronous processing to intelligent deactivation and superseding of outdated files. Key outcomes include real-time collaboration via WebSocket-powered channels with an integrated AI assistant (@KnowledgeBot), role-based access control enforced at every layer (API, vector search, and UI), and comprehensive audit logging for compliance. The natural language query engine with conversation memory enhanced accessibility and usability, while multi-tenant architecture with Bring-Your-Own-Key (BYOK) AI configuration enables scalable enterprise deployment.

In conclusion, the Enterprise Knowledge AI Platform serves as a scalable and intelligent alternative to traditional document management systems. By bridging the gap between raw data and actionable knowledge through AI, it significantly enhances organizational agility, improves information accuracy, and simplifies the user experience. Future developments include mobile access, multi-format summarization, advanced sentiment analysis, and deeper collaborative tool integrations.

**Keywords:** Enterprise Knowledge Management, Retrieval-Augmented Generation (RAG), Semantic Search, Natural Language Processing, Document Lifecycle Automation, Vector Databases, Gemini AI, Role-Based Access Control (RBAC), Multi-Tenant Architecture, Real-Time Collaboration, Audit Compliance, Full-Stack Development.

---

## 🚀 Problem Statement

Modern enterprises generate massive volumes of internal knowledge:

- 📄 Policy documents & SOPs
- 📋 HR manuals & compliance guidelines
- 🔧 Technical documentation & API specs
- 🔒 Security playbooks & incident reports
- 📝 Contracts, meeting notes & internal memos

### However, this knowledge suffers from critical issues:

| Problem | Impact |
|---------|--------|
| **Scattered across systems** | Employees waste 20–30% of time searching for information |
| **Stored in unstructured PDFs/DOCX files** | Keyword search fails to understand intent |
| **No semantic search capability** | Relevant documents are missed even when they exist |
| **Weak access governance** | Sensitive documents may be exposed to unauthorized users |
| **Unsafe LLM exposure** | Generic AI chatbots hallucinate or leak data |
| **No version control** | Outdated documents lead to incorrect decisions |
| **No audit trail** | Compliance requirements cannot be met |

### Traditional systems and basic AI chatbots fail to provide:

- ❌ Secure, role-based access control at the vector search level
- ❌ Citation-backed, grounded answers (no hallucination prevention)
- ❌ Compliance-grade audit logs for every interaction
- ❌ Automated document lifecycle management
- ❌ Multi-tenant isolation for enterprise deployment
- ❌ Real-time collaborative knowledge discovery

---

## 🎯 Solution Overview

The **Enterprise Knowledge AI Platform** provides a comprehensive, AI-powered solution:

### Core Capabilities

| Capability | Description |
|-----------|-------------|
| **Secure Document Ingestion** | PDF upload with S3/local storage, async processing with retry logic |
| **Intelligent RAG Pipeline** | PDF extraction → Token-aware chunking → Embedding generation → Vector storage |
| **AI-Powered Q&A (Ask AI)** | Natural language querying with conversation memory and citation-backed responses |
| **Smart Superseding** | Automatic version detection, old document deactivation, and Pinecone vector purging |
| **Document Lifecycle Management** | Upload → Processing → Active → Deactivated/Superseded status transitions |
| **Real-Time Collaboration** | WebSocket-powered messaging channels with integrated @KnowledgeBot AI assistant |
| **Multi-Tenant Architecture** | Organization-level data isolation with BYOK AI model configuration |
| **Role-Based Access Control** | Four-tier RBAC enforced at API, vector search, and UI levels |
| **Comprehensive Audit Logging** | Every action tracked — logins, uploads, queries, status changes, failures |
| **Dynamic Branding** | Organization-specific theme colors and identity customization |
| **Admin Control Panel** | System settings, user management, organization management, audit review |

---

## 🏗 System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite + TypeScript)        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │Dashboard │ │ Ask AI   │ │Knowledge │ │Documents │ │Channels  │ │
│  │(3 views) │ │(Chat UI) │ │  Base    │ │ Manager  │ │(Collab)  │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐              │
│  │  Admin   │ │  Audit   │ │ Settings │ │  Org/Dept│              │
│  │  Panel   │ │  Logs    │ │  Page    │ │ Manager  │              │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘              │
└─────────────────────┬───────────────────────┬──────────────────────┘
                      │ REST API (Axios)      │ WebSocket (Socket.IO)
┌─────────────────────▼───────────────────────▼──────────────────────┐
│                    BACKEND (Node.js + Express + TypeScript)        │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    MIDDLEWARE LAYER                          │   │
│  │  ┌───────┐ ┌─────┐ ┌───────────┐ ┌────────┐ ┌───────────┐ │   │
│  │  │ Auth  │ │RBAC │ │Rate Limit │ │ Error  │ │  Upload   │ │   │
│  │  │(JWT)  │ │     │ │           │ │Handler │ │(Multer/S3)│ │   │
│  │  └───────┘ └─────┘ └───────────┘ └────────┘ └───────────┘ │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    CONTROLLER LAYER (12 Controllers)        │   │
│  │  Auth │ Chat │ Document │ Job │ KnowledgeBase │ Admin │ ... │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    SERVICE LAYER (AI Pipeline)               │   │
│  │  ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌─────────────────┐ │   │
│  │  │Extraction│ │Chunking │ │Embeddings│ │  LLM (Gemini)   │ │   │
│  │  │(PDF Parse│ │(Token-  │ │(Ollama / │ │  RAG Response   │ │   │
│  │  │  + S3)   │ │ aware)  │ │ Gemini)  │ │  + Citations    │ │   │
│  │  └──────────┘ └─────────┘ └──────────┘ └─────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────┐  ┌────────────────────────────────────────┐  │
│  │  BACKGROUND       │  │         SOCKET.IO SERVER               │  │
│  │  DOCUMENT WORKER  │  │  (Channels + @KnowledgeBot AI)        │  │
│  │  (Polling Loop)   │  │  (JWT Auth on WebSocket)               │  │
│  └──────────────────┘  └────────────────────────────────────────┘  │
└───────────┬────────────────────┬──────────────────────┬────────────┘
            │                    │                      │
    ┌───────▼────────┐  ┌───────▼───────────┐  ┌───────▼────────────┐
    │   MongoDB      │  │  Pinecone Vector  │  │   AWS S3 / Local   │
    │  (Metadata,    │  │   Database        │  │   File Storage     │
    │   Sessions,    │  │  (Embeddings,     │  │  (PDF documents)   │
    │   Audit Logs)  │  │   RBAC Filters)   │  │                    │
    └────────────────┘  └───────────────────┘  └────────────────────┘
```

### Query & Response Flow (RAG)

```
User sends a question via "Ask AI" chat
  │
  ▼
Authentication & JWT Validation
  │
  ▼
Organization Context Extraction (Multi-Tenancy)
  │
  ▼
Query Embedding Generation (Ollama / Gemini)
  │
  ▼
Vector Similarity Search (Pinecone) with RBAC Filters
  │   ├─ organizationId isolation
  │   ├─ accessScope filtering (public/organization/department/restricted)
  │   ├─ Document status filtering (only "active" documents)
  │   └─ User ownership / department membership checks
  │
  ▼
Top-K Context Chunks Retrieved
  │
  ▼
Conversation History Loaded (last 10 messages)
  │
  ▼
LLM Prompt Construction (Gemini) with:
  │   ├─ Document context chunks
  │   ├─ Conversation history for follow-up understanding
  │   └─ Grounding instructions (anti-hallucination)
  │
  ▼
AI Response + Citation Sources Generated
  │
  ▼
Chat Session Persisted to MongoDB
  │
  ▼
Audit Log Entry Created
  │
  ▼
Response returned to user with sources
```

### Document Ingestion Pipeline

```
User uploads PDF via UI
  │
  ▼
Multer middleware validates file (PDF only, max 10MB)
  │
  ▼
File stored → AWS S3 (if configured) or Local disk
  │
  ▼
Document metadata saved to MongoDB (status: "uploaded")
  │
  ▼
Async Job created (type: DOCUMENT_PROCESSING)
  │
  ▼
Background Worker picks up job (polling every 2 seconds)
  │
  ▼
Step 1: EXTRACTION — pdf-parse extracts text + page count
  │       ├─ Supports S3 streaming (fetches buffer via AWS SDK)
  │       └─ Supports local file reading
  │
  ▼
Step 2: CHUNKING — Token-aware splitting (500 tokens, 100 overlap)
  │       ├─ Paragraph-based splitting with sentence fallback
  │       └─ Overlap preservation for context continuity
  │
  ▼
Step 3: EMBEDDING — Vector generation for each chunk
  │       ├─ Ollama (nomic-embed-text) — local, free
  │       └─ Google Gemini (text-embedding-004) — cloud, BYOK
  │
  ▼
Step 4: VECTOR UPSERT — Chunks stored in Pinecone with metadata
  │       ├─ organizationId, documentId, accessScope, ownerId
  │       └─ departmentId, status ("active")
  │
  ▼
Step 5: VERSION CONTROL — Smart Superseding
  │       ├─ Find older docs with same fileName in organization
  │       ├─ Mark old versions as "superseded"
  │       └─ Purge old version vectors from Pinecone
  │
  ▼
Document status updated to "active" — now searchable by AI
```

---

## 🛠 Tech Stack

### Frontend

| Technology | Purpose | Version |
|-----------|---------|---------|
| **React.js** | UI library | 18.2+ |
| **TypeScript** | Type safety | 5.9+ |
| **Vite** | Build tool & dev server | 7.2+ |
| **Tailwind CSS** | Utility-first styling | 4.1+ |
| **React Router DOM** | Client-side routing | 6.22+ |
| **Axios** | HTTP client | 1.13+ |
| **Socket.IO Client** | Real-time WebSocket communication | 4.8+ |
| **Framer Motion** | UI animations & transitions | 12.38+ |
| **Lucide React** | Icon library | 0.563+ |
| **Tabler Icons** | Additional icon set | 3.36+ |
| **Heroicons** | Heroicons icon integration | 2.2+ |
| **React Markdown** | Markdown rendering for AI responses | 10.1+ |
| **date-fns** | Date formatting | 4.1+ |
| **clsx / tailwind-merge** | Conditional class merging | Latest |

### Backend

| Technology | Purpose | Version |
|-----------|---------|---------|
| **Node.js** | Runtime environment | 18+ |
| **Express.js** | Web framework | 5.2+ |
| **TypeScript** | Type-safe backend | 5.9+ |
| **Mongoose** | MongoDB ODM | 9.1+ |
| **JSON Web Tokens (jsonwebtoken)** | Authentication | 9.0+ |
| **bcrypt** | Password hashing | 6.0+ |
| **Multer** | File upload handling | 2.0+ |
| **multer-s3** | Direct S3 streaming uploads | 3.0+ |
| **@aws-sdk/client-s3** | AWS S3 integration | 3.1014+ |
| **Socket.IO** | Real-time WebSocket server | 4.8+ |
| **cookie-parser** | HTTP cookie parsing | 1.4+ |
| **cors** | Cross-Origin Resource Sharing | 2.8+ |
| **morgan** | HTTP request logging | 1.10+ |
| **express-rate-limit** | Rate limiting / brute-force protection | 8.2+ |
| **nodemon** | Development auto-restart | 3.1+ |

### AI & ML Services

| Technology | Purpose |
|-----------|---------|
| **Google Gemini AI** (`@google/generative-ai`) | LLM for RAG response generation (gemini-1.5-flash) |
| **Google Gemini Embeddings** | Cloud embedding generation (text-embedding-004, gemini-embedding-001) |
| **Ollama** | Local embedding generation (nomic-embed-text) |
| **pdf-parse** | PDF text extraction |
| **gpt-tokenizer** | Token counting for chunk sizing |

### Data Layer

| Technology | Purpose |
|-----------|---------|
| **MongoDB** | Primary database — metadata, users, sessions, audit logs, settings |
| **Pinecone** | Vector database — semantic similarity search with RBAC metadata filters |
| **AWS S3** | Cloud file storage for uploaded documents |
| **Local Disk** | Fallback file storage when S3 is not configured |

---

## 📂 Project Structure

```
Enterprise-Knowledge-Ai-Platform/
│
├── backend/                          # Node.js + Express API Server
│   ├── app.ts                        # Express app configuration (CORS, middleware, routes)
│   ├── server.ts                     # HTTP server + Socket.IO initialization
│   ├── socket.ts                     # WebSocket server (channels, @KnowledgeBot AI)
│   │
│   ├── config/
│   │   ├── db.ts                     # MongoDB connection with retry logic
│   │   └── seedRoles.ts              # Initial role seeding (ADMIN, ORG_ADMIN, AUDITOR, USER)
│   │
│   ├── constants/
│   │   ├── auditActions.ts           # Audit action type constants
│   │   └── jobTypes.ts               # Background job type constants
│   │
│   ├── controllers/                  # Route handlers / business logic
│   │   ├── auth.controller.ts        # Signup, Login, Refresh Token, Logout, GetMe
│   │   ├── chat.controller.ts        # Ask AI (RAG query), Session management
│   │   ├── document.controller.ts    # CRUD, status toggle, document viewing/streaming
│   │   ├── job.controller.ts         # Job status, retry, listing
│   │   ├── knowledgeBase.controller.ts # Knowledge base document listing
│   │   ├── organization.controller.ts # Organization CRUD, BYOK AI settings
│   │   ├── department.controller.ts  # Department management
│   │   ├── channel.controller.ts     # Channel CRUD for real-time messaging
│   │   ├── adminLogs.controller.ts   # Audit log retrieval
│   │   ├── adminUser.controller.ts   # Admin user management (create, update, deactivate)
│   │   ├── settings.controller.ts    # Global system settings (singleton pattern)
│   │   └── user.controller.ts        # User profile operations
│   │
│   ├── middleware/
│   │   ├── auth.ts                   # JWT authentication middleware
│   │   ├── rbac.ts                   # Role-based access control middleware
│   │   ├── requireRole.ts            # Role requirement guard
│   │   ├── rateLimiter.ts            # Login (5/15min) & Signup (10/hour) rate limits
│   │   ├── upload.ts                 # Multer file upload (S3 or local, PDF-only filter)
│   │   └── errorHandler.ts           # Global error handler
│   │
│   ├── models/                       # Mongoose schemas (14 models)
│   │   ├── Users.ts                  # User schema (email, password, org, dept, role, isActive)
│   │   ├── Roles.ts                  # Role schema (ADMIN, ORG_ADMIN, AUDITOR, USER)
│   │   ├── Organization.ts           # Multi-tenant org (AI settings, embedding settings, theme)
│   │   ├── Department.ts             # Department (unique per org)
│   │   ├── Document.ts               # Document lifecycle (6 status states, versioning, S3/local)
│   │   ├── DocumentText.ts           # Extracted raw text storage
│   │   ├── DocumentChunk.ts          # Token-counted chunks with embedding status
│   │   ├── Job.ts                    # Async job queue (PENDING → PROCESSING → COMPLETED/DEAD)
│   │   ├── ChatSession.ts            # AI chat sessions with message history + sources
│   │   ├── Channel.ts                # Real-time messaging channels (public/private)
│   │   ├── Message.ts                # Channel messages (human + bot with sources)
│   │   ├── AuditLog.ts               # Append-only compliance audit log
│   │   ├── SystemSettings.ts         # Global platform config (singleton pattern)
│   │   └── refreshToken.ts           # Refresh token storage with revocation
│   │
│   ├── routes/                       # Express route definitions (12 route files)
│   │   ├── index.ts                  # Central route aggregator
│   │   ├── auth.routes.ts            # /api/auth/* (login, signup, refresh, logout, me)
│   │   ├── document.routes.ts        # /api/documents/* (CRUD, status, view/stream)
│   │   ├── chat.routes.ts            # /api/chat/* (query, sessions CRUD)
│   │   ├── job.routes.ts             # /api/jobs/* (list, retry, status)
│   │   ├── knowledgeBase.routes.ts   # /api/knowledge-base/* (document listing)
│   │   ├── organization.routes.ts    # /api/organizations/* (CRUD, settings, AI test)
│   │   ├── department.routes.ts      # /api/departments/*
│   │   ├── channels.routes.ts        # /api/channels/* (channel CRUD)
│   │   ├── admin.routes.ts           # /api/admin/* (audit logs, settings)
│   │   ├── admin.user.routes.ts      # /api/admin/users/* (user management)
│   │   └── user.routes.ts            # /api/users/* (profile)
│   │
│   ├── services/                     # AI/ML pipeline services
│   │   ├── extraction/
│   │   │   └── pdfExtractor.ts       # PDF text extraction (supports Buffer + file path)
│   │   ├── chunking/
│   │   │   └── chunker.ts            # Token-aware text chunking (500 tokens, 100 overlap)
│   │   ├── embeddings/
│   │   │   ├── ollamaEmbedder.ts     # Universal embedder (Ollama + Google Gemini support)
│   │   │   └── geminiEmbedder.ts     # Gemini-native batch embedder with retry logic
│   │   ├── llm/
│   │   │   └── geminiChat.ts         # RAG response generation (Gemini with conversation memory)
│   │   └── vectorDb/
│   │       └── pineconeService.ts    # Pinecone CRUD (upsert, search with RBAC, delete)
│   │
│   ├── workers/
│   │   └── documentWorker.ts         # Background document processing (polling, retry, dead-letter)
│   │
│   ├── utils/
│   │   ├── auditLogger.ts            # Centralized audit event logger
│   │   ├── jwt.ts                    # JWT sign utility
│   │   ├── password.ts               # bcrypt hash/compare
│   │   ├── refreshToken.ts           # Cryptographic refresh token generator
│   │   └── tokenCounter.ts           # GPT tokenizer wrapper for chunk sizing
│   │
│   ├── roles_initial_data.json       # Seed data for the 4 system roles
│   └── .env                          # Environment variables (not committed)
│
├── frontend/                         # React + Vite + TypeScript SPA
│   └── src/
│       ├── App.tsx                   # Root application component
│       ├── main.tsx                  # Application entry point
│       ├── index.css                 # Global styles + Tailwind base + design tokens
│       │
│       ├── routes/
│       │   └── AppRoutes.tsx         # Central route definitions (auth + protected)
│       │
│       ├── layouts/
│       │   ├── AuthLayout.tsx        # Public layout for login/signup
│       │   ├── ProtectedLayout.tsx   # Authentication guard wrapper
│       │   └── DashboardLayout.tsx   # Main app shell (sidebar + navbar + content)
│       │
│       ├── components/
│       │   ├── NavBar.tsx            # Top navigation bar with user menu + org branding
│       │   ├── SideBar.tsx           # Role-aware collapsible sidebar navigation
│       │   └── ui/
│       │       └── CustomSelect.tsx  # Reusable styled select component
│       │
│       ├── pages/
│       │   ├── auth/
│       │   │   ├── LoginPage.tsx     # Login with JWT + refresh token
│       │   │   └── SignUp.tsx        # Signup with optional org creation
│       │   │
│       │   ├── dashboard/
│       │   │   ├── DashboardPage.tsx # Role-based dashboard switcher
│       │   │   ├── AdminDashboard.tsx    # Global admin analytics view
│       │   │   ├── AuditorDashboard.tsx  # Compliance-focused audit view
│       │   │   └── UserDashboard.tsx     # User's personal document analytics
│       │   │
│       │   ├── ask/
│       │   │   └── AskAi.tsx        # AI chat interface with session management
│       │   │
│       │   ├── knowledge/
│       │   │   └── KnowledgeBase.tsx # Org-wide document explorer + status management
│       │   │
│       │   ├── documents/
│       │   │   └── DocumentsPage.tsx # Personal document management + upload
│       │   │
│       │   ├── channels/
│       │   │   ├── ChannelList.tsx   # Channel browser + creation UI
│       │   │   └── ChannelChat.tsx   # Real-time chat with @KnowledgeBot support
│       │   │
│       │   ├── admin/
│       │   │   ├── ManageUsersPage.tsx    # User CRUD with role assignment
│       │   │   ├── ManageAuditorsPage.tsx # Auditor management
│       │   │   ├── AuditLogsPage.tsx      # Filterable audit log viewer
│       │   │   ├── AdminSettingsPage.tsx  # System configuration panel
│       │   │   ├── OrganizationsPage.tsx  # Multi-tenant org management
│       │   │   └── DepartmentsPage.tsx    # Department management
│       │   │
│       │   ├── settings/
│       │   │   └── SettingsPage.tsx  # Org-level AI & branding settings
│       │   │
│       │   └── models/
│       │       └── ModelsPage.tsx    # AI model configuration
│       │
│       ├── services/                 # API service layer (Axios wrappers)
│       │   ├── authService.ts        # Auth API calls
│       │   ├── chatService.ts        # Chat API calls
│       │   ├── documentService.ts    # Document API calls
│       │   ├── knowledgeBaseService.ts # KB API calls
│       │   ├── adminService.ts       # Admin API calls
│       │   ├── organizationService.ts # Organization API calls
│       │   ├── departmentService.ts  # Department API calls
│       │   ├── channelService.ts     # Channel API calls
│       │   └── userService.ts        # User API calls
│       │
│       └── lib/
│           ├── auth.ts              # Auth context & token management
│           ├── ThemeContext.tsx      # Dynamic theming (light/dark + org accent)
│           └── utils.ts             # Class name utilities (cn helper)
│
├── docs/                             # Technical documentation
│   ├── authentication.md            # Auth flow documentation
│   ├── file_upload_architecture.md  # Upload pipeline docs
│   └── text_extraction.md          # Extraction process docs
│
├── package.json                      # Root workspace configuration
├── requirements.txt                  # Python dependencies (if applicable)
└── .gitignore                        # Git ignore rules
```

---

## 💾 Database Schema Design

### Entity Relationship Overview

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Organization   │────<│    Department    │     │      Role        │
│                  │     │                  │     │ (ADMIN,ORG_ADMIN │
│ name, slug       │     │ name, orgId      │     │  AUDITOR, USER)  │
│ aiSettings       │     │ description      │     └────────┬─────────┘
│ embeddingSettings│     └──────────────────┘              │
│ themeColor       │                                       │
│ subscriptionPlan │     ┌──────────────────┐              │
│ maxUsers         │────<│      User        │──────────────┘
└──────────────────┘     │ email, password  │
                         │ name, isActive   │
                         │ orgId, deptId    │
                         │ roleId           │
                         └───────┬──────────┘
                                 │
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
          ▼                      ▼                      ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│    Document      │  │  ChatSession     │  │    Channel       │
│ title, fileName  │  │ title, messages[]│  │ name, isPrivate  │
│ status (6 states)│  │  ├─ role         │  │ members[]        │
│ version          │  │  ├─ content      │  │ organizationId   │
│ accessScope      │  │  └─ sources[]    │  └──────────┬───────┘
│ s3Key / filePath │  └──────────────────┘             │
│ supersededBy     │                                    ▼
└───────┬──────────┘                         ┌──────────────────┐
        │                                    │    Message       │
        ├──────────────────┐                 │ content          │
        ▼                  ▼                 │ isBot            │
┌──────────────┐  ┌──────────────┐           │ sources[]        │
│ DocumentText │  │DocumentChunk │           └──────────────────┘
│ text         │  │ text         │
│ pageCount    │  │ tokenCount   │           ┌──────────────────┐
└──────────────┘  │ embeddingStatus          │    AuditLog      │
                  │ embeddingModel│           │ action           │
                  └──────────────┘           │ resourceType     │
                                             │ metadata (mixed) │
┌──────────────────┐  ┌──────────────────┐   └──────────────────┘
│      Job         │  │  RefreshToken    │
│ type, status     │  │ token, expiresAt │
│ attempts (0-3)   │  │ revoked          │   ┌──────────────────┐
│ nextRunAt        │  └──────────────────┘   │ SystemSettings   │
│ error, payload   │                          │ (Singleton)      │
└──────────────────┘                          │ database, llm    │
                                              │ embedding, vectorDb │
                                              │ storage, security│
                                              │ email, general   │
                                              └──────────────────┘
```

### Document Status Lifecycle

```
                  ┌──────────┐
                  │ uploaded  │ ← Initial state after file upload
                  └─────┬────┘
                        │
                        ▼
                  ┌──────────┐
                  │processing │ ← Worker picks up the job
                  └─────┬────┘
                        │
              ┌─────────┴─────────┐
              │                   │
              ▼                   ▼
        ┌──────────┐        ┌──────────┐
        │  active   │        │  failed   │ ← After max retries (3)
        └─────┬────┘        └──────────┘
              │
    ┌─────────┴──────────┐
    │                    │
    ▼                    ▼
┌────────────┐   ┌──────────────┐
│deactivated │   │  superseded   │ ← Automatic when new version uploaded
│ (manual)   │   │ (automatic)   │
└────────────┘   └──────────────┘
```

### Job Status State Machine

```
PENDING ──→ PROCESSING ──→ COMPLETED ✅
   ▲              │
   │              ▼
   └── RETRY ◄── FAILED (attempt < maxAttempts)
                    │
                    ▼  (attempt >= maxAttempts)
                  DEAD ☠️ (Dead-letter state)
```

---

## 🧩 Core Modules & Features

### 1. Authentication & Authorization

| Feature | Implementation |
|---------|---------------|
| **User Signup** | Email/password with bcrypt hashing; optional organization creation |
| **User Login** | JWT access token + httpOnly refresh token cookie |
| **Token Refresh** | Automatic token rotation with old token revocation |
| **Secure Logout** | Refresh token revocation + cookie clearing |
| **Rate Limiting** | Login: 5 attempts/15min; Signup: 10/hour per IP |
| **Session Validation** | GET /api/auth/me for frontend auth state recovery |

### 2. Multi-Tenant Organization Management

| Feature | Implementation |
|---------|---------------|
| **Organization Creation** | During signup (first user becomes ORG_ADMIN) |
| **Subscription Plans** | Free, Pro, Enterprise tiers |
| **BYOK AI Configuration** | Per-org AI provider, API key, and model settings |
| **BYOK Embedding Config** | Per-org embedding provider (Ollama / Google) and model |
| **Dynamic Theming** | Organization-level accent color (themeColor) |
| **User Capacity** | Configurable maxUsers per organization |
| **Domain Binding** | Optional domain association for SSO readiness |

### 3. Department Management

| Feature | Implementation |
|---------|---------------|
| **Department CRUD** | Create, list, update departments within an organization |
| **Unique Naming** | Compound unique index (name + organizationId) |
| **User Assignment** | Users can be assigned to departments |
| **Document Scoping** | Documents can be scoped to department-level access |

### 4. Document Management

| Feature | Implementation |
|---------|---------------|
| **PDF Upload** | Multer with S3 streaming (multer-s3) or local disk fallback |
| **Access Scopes** | `public`, `organization`, `department`, `restricted` |
| **Version Tracking** | Automatic version increment per (orgId, fileName) |
| **Status Lifecycle** | 6 states: uploaded → processing → active → deactivated/superseded/failed |
| **Deactivation Toggle** | Manual mute — instantly purges Pinecone vectors |
| **Reactivation** | Re-triggers full processing pipeline |
| **Secure Viewing** | Portal-based document streaming with RBAC enforcement |
| **Deletion** | Cascade deletion of Pinecone vectors |

### 5. AI-Powered Chat (Ask AI)

| Feature | Implementation |
|---------|---------------|
| **RAG-Powered Q&A** | Query → Embed → Vector search → LLM response |
| **Conversation Memory** | Chat sessions with full message history |
| **Multi-Session Support** | Create, switch, delete chat sessions |
| **Citation Sources** | Each response includes source document IDs and relevance scores |
| **Context Window** | Last 10 messages included for conversation continuity |
| **Markdown Responses** | AI responses rendered with full Markdown support |
| **RBAC-Filtered Search** | Vector search respects user's access scope |

### 6. Knowledge Base

| Feature | Implementation |
|---------|---------------|
| **Organization-Wide View** | All documents accessible within the organization |
| **Status Management** | Activate/deactivate documents from the knowledge base |
| **Version Visibility** | See document versions and superseding chain |
| **Smart Superseding** | Automatic detection and handling of file versions |

### 7. Real-Time Channels (Collaboration)

| Feature | Implementation |
|---------|---------------|
| **Channel CRUD** | Create public/private channels within organizations |
| **Real-Time Messaging** | Socket.IO WebSocket-based instant messaging |
| **JWT Socket Auth** | WebSocket connections authenticated via JWT tokens |
| **@KnowledgeBot AI** | Mention `@AI` or `@KnowledgeBot` in any channel for AI responses |
| **RBAC-Aware Bot** | AI bot responses respect the requesting user's document access scope |
| **Bot Typing Indicator** | Real-time typing animation when AI is processing |
| **Message Persistence** | All messages (human + bot) stored in MongoDB |

### 8. Admin Control Panel

| Feature | Implementation |
|---------|---------------|
| **User Management** | Create, update, deactivate users; assign roles and departments |
| **Auditor Management** | Dedicated auditor role management |
| **Organization Management** | CRUD operations, subscription plan assignment |
| **Global System Settings** | Database, LLM, embedding, vectorDB, storage, security, email configuration |
| **Sensitive Field Masking** | API keys and secrets display only last 4 characters |
| **Connection Testing** | Verify service connectivity from the admin panel |

### 9. Role-Based Dashboards

| Role | Dashboard Features |
|------|-------------------|
| **Admin** | Global platform analytics, all organizations overview |
| **ORG_ADMIN** | Organization-level document stats, user activity |
| **Auditor** | Compliance-focused audit log viewer, activity analytics |
| **User** | Personal document stats, recent uploads, AI chat history |

---

## 🧠 RAG Pipeline (Document Processing)

### Pipeline Stages (Executed by Background Worker)

```
Stage 1: EXTRACTION
├─ Input: PDF file (from S3 buffer or local path)
├─ Tool: pdf-parse library
├─ Output: Raw text string + page count
└─ Validation: Text must be ≥ 20 characters

Stage 2: CHUNKING
├─ Input: Raw extracted text
├─ Tool: Custom token-aware chunker
├─ Parameters: maxTokens=500, overlapTokens=100
├─ Strategy: Paragraph-first, sentence-fallback splitting
├─ Output: Array of { text, tokenCount } chunks
└─ Storage: DocumentChunk collection (embeddingStatus: "pending")

Stage 3: EMBEDDING
├─ Input: Chunk text array
├─ Tool: Ollama (nomic-embed-text) OR Google Gemini (text-embedding-004)
├─ Batch Size: 20 chunks per API call
├─ Output: Array of number[] vectors
├─ Retry: Exponential backoff for rate limits
└─ Storage: Chunk embeddingStatus updated to "embedded"

Stage 4: VECTOR UPSERT
├─ Input: Chunk IDs + embedding vectors + metadata
├─ Tool: Pinecone SDK v7
├─ Metadata: organizationId, documentId, accessScope, ownerId, departmentId, status
└─ Output: Vectors searchable in Pinecone index

Stage 5: VERSION CONTROL (Smart Superseding)
├─ Query: Find older documents with same fileName in organization
├─ Action: Mark old versions as "superseded"
├─ Cleanup: Delete old version vectors from Pinecone
└─ Link: Old document.supersededBy → new document._id
```

### Worker Architecture

| Feature | Implementation |
|---------|---------------|
| **Polling Interval** | 2-second polling loop |
| **Job Locking** | `findOneAndUpdate` atomic claim (prevents double-processing) |
| **FIFO Processing** | Jobs processed in creation order (`sort: { createdAt: 1 }`) |
| **Exponential Backoff** | Retry delays: 4s → 8s → 16s |
| **Max Attempts** | 3 attempts before dead-letter |
| **Dead-Letter Handling** | Jobs moved to DEAD state; document marked as "failed" |
| **Cleanup on Failure** | Pinecone vectors purged on terminal failure |
| **Graceful Shutdown** | SIGINT/SIGTERM handlers with MongoDB disconnect |
| **Connection Recovery** | Auto-reconnect on MongoDB network errors |
| **Stage Tracking** | Job records current stage (initializing → extraction → chunking → embedding → completed) |

---

## 🤖 AI & Embedding Architecture

### Embedding Providers

| Provider | Model | Dimensions | Use Case |
|----------|-------|-----------|----------|
| **Ollama** (Local) | nomic-embed-text | 768 | Free, privacy-first, no API key needed |
| **Google Gemini** | text-embedding-004 | 768 | Cloud-hosted, high quality, BYOK |
| **Google Gemini** | gemini-embedding-001 | 768 | Batch embedding with native API |

### LLM Configuration

| Setting | Default | Configurable |
|---------|---------|-------------|
| **Provider** | Google Gemini | Per-organization (BYOK) |
| **Model** | gemini-1.5-flash | Per-organization |
| **API Key** | Environment variable | Per-organization (stored encrypted) |
| **Max Tokens** | 4096 | Via system settings |
| **Temperature** | 0.7 | Via system settings |

### RAG Prompt Engineering

The system uses a carefully crafted prompt pattern:

```
You are a helpful Enterprise AI Knowledge Assistant.
You are tasked with answering the user's question based on the provided
document context and conversation history below.

--- DOCUMENT CONTEXT ---
[Document Chunk 1]: <text>
[Document Chunk 2]: <text>
...

--- CONVERSATION HISTORY ---
User: <previous message>
Assistant: <previous response>
...

--- CURRENT USER QUESTION ---
<user's question>

--- ANSWER ---
```

**Anti-Hallucination Measures:**
- LLM is grounded strictly to provided document context
- If answer is not in context, system acknowledges the gap
- Citation sources are returned with relevance scores
- Only "active" documents contribute to AI context

---

## 🔐 Security Architecture

### Authentication Flow

```
Login Request
  │
  ▼
Validate credentials (bcrypt compare)
  │
  ▼
Generate JWT Access Token (contains: userId, role, organizationId)
  │
  ▼
Generate Cryptographic Refresh Token
  │
  ▼
Store Refresh Token in MongoDB (with expiration + revocation flag)
  │
  ▼
Set httpOnly cookie (refreshToken) — prevents XSS access
  │
  ▼
Return JWT in response body
```

### RBAC Enforcement Layers

| Layer | Mechanism |
|-------|-----------|
| **API Routes** | `requireRole(["ADMIN", "ORG_ADMIN"])` middleware guards |
| **Controller Logic** | Organization isolation + ownership checks |
| **Vector Search** | Pinecone metadata filters enforce access scope |
| **Document Viewing** | Portal-based streaming re-checks RBAC before serving |
| **WebSocket** | JWT verification on Socket.IO handshake |
| **Frontend** | Role-aware sidebar, route guards, conditional UI |

### Role Hierarchy

| Role | Scope | Capabilities |
|------|-------|-------------|
| **ADMIN** | Global | All operations across all organizations |
| **ORG_ADMIN** | Organization | Full access within their organization |
| **AUDITOR** | Organization | Read-only access to documents and audit logs |
| **USER** | Personal + Shared | Own documents + shared organization knowledge |

### Access Scope Matrix (Documents)

| Scope | ADMIN | ORG_ADMIN | AUDITOR | USER (owner) | USER (same dept) | USER (other) |
|-------|-------|-----------|---------|---------------|-------------------|---------------|
| `public` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `organization` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `department` | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| `restricted` | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |

### Golden Rule

> **If a document is not visible to the user, it cannot influence AI answers.**
>
> Vector search filters enforce the same access scope as the document management UI. This prevents unauthorized data from leaking through AI responses.

### Additional Security Measures

- **Password Hashing**: bcrypt with automatic salt generation
- **Rate Limiting**: Brute-force protection on auth endpoints
- **Token Rotation**: Refresh tokens are single-use with automatic rotation
- **Sensitive Field Masking**: API keys show only last 4 characters in admin UI
- **CORS Configuration**: Strict origin policy
- **Input Validation**: File type restrictions (PDF only), size limits (10MB)
- **Graceful Error Handling**: No stack traces leaked to clients

---

## 📡 Real-Time Communication

### Socket.IO Architecture

```
Client connects with JWT token
  │
  ▼
Server verifies JWT via io.use() middleware
  │
  ▼
User joins organization-scoped channels
  │
  ▼
Messages broadcasted to channel room
  │
  ▼
@AI / @KnowledgeBot mention triggers:
  ├─ bot_typing event emitted
  ├─ Query embedded via Gemini
  ├─ Pinecone search with user's RBAC scope
  ├─ RAG response generated
  ├─ Bot message saved to DB
  ├─ Bot response broadcasted
  └─ bot_typing cleared
```

### Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_channel` | Client → Server | Join a specific channel room |
| `leave_channel` | Client → Server | Leave a channel room |
| `send_message` | Client → Server | Send a message to a channel |
| `receive_message` | Server → Client | Broadcast received message to room |
| `bot_typing` | Server → Client | KnowledgeBot typing indicator |
| `error` | Server → Client | Error notification |

---

## 📖 API Reference

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Register user + optional org creation | ❌ |
| POST | `/api/auth/login` | Login with email/password | ❌ |
| POST | `/api/auth/refresh` | Refresh access token via cookie | ❌ (Cookie) |
| POST | `/api/auth/logout` | Logout + revoke refresh token | ❌ (Cookie) |
| GET | `/api/auth/me` | Get current user context | ✅ JWT |

### Documents (`/api/documents`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/documents` | Upload PDF document | ✅ JWT |
| GET | `/api/documents` | List user's documents | ✅ JWT |
| GET | `/api/documents/:id` | Get document by ID | ✅ JWT |
| PATCH | `/api/documents/:id/status` | Toggle active/deactivated | ✅ JWT |
| GET | `/api/documents/:id/view` | Stream document content | ✅ JWT |
| DELETE | `/api/documents/:id` | Delete document + vectors | ✅ JWT |

### Chat (`/api/chat`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/chat` | Send RAG-powered query | ✅ JWT |
| GET | `/api/chat/sessions` | List user's chat sessions | ✅ JWT |
| GET | `/api/chat/sessions/:id` | Get full session with messages | ✅ JWT |
| DELETE | `/api/chat/sessions/:id` | Delete a chat session | ✅ JWT |

### Knowledge Base (`/api/knowledge-base`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/knowledge-base` | List organization's documents | ✅ JWT |

### Organizations (`/api/organizations`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/organizations` | List all organizations | ✅ ADMIN |
| POST | `/api/organizations` | Create organization | ✅ ADMIN |
| PUT | `/api/organizations/:id` | Update organization | ✅ ADMIN |
| GET | `/api/organizations/me` | Get my organization settings | ✅ JWT |
| PUT | `/api/organizations/me/settings` | Update org AI/branding settings | ✅ ORG_ADMIN |
| POST | `/api/organizations/me/test-ai` | Test AI configuration | ✅ ORG_ADMIN |

### Departments (`/api/departments`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/departments` | List departments | ✅ JWT |
| POST | `/api/departments` | Create department | ✅ ORG_ADMIN |

### Jobs (`/api/jobs`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/jobs` | List processing jobs | ✅ JWT |
| POST | `/api/jobs/:id/retry` | Retry a failed/dead job | ✅ ADMIN |

### Channels (`/api/channels`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/channels` | List channels | ✅ JWT |
| POST | `/api/channels` | Create a channel | ✅ JWT |

### Admin (`/api/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/audit-logs` | Get audit logs | ✅ ADMIN/AUDITOR |
| GET | `/api/admin/settings` | Get system settings | ✅ ADMIN |
| PUT | `/api/admin/settings` | Update system settings | ✅ ADMIN |
| POST | `/api/admin/settings/test-connection` | Test service connection | ✅ ADMIN |

### Admin Users (`/api/admin/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/users` | List all users | ✅ ADMIN/ORG_ADMIN |
| POST | `/api/admin/users` | Create a user | ✅ ADMIN/ORG_ADMIN |
| PUT | `/api/admin/users/:id` | Update user | ✅ ADMIN/ORG_ADMIN |
| PATCH | `/api/admin/users/:id/toggle` | Activate/deactivate user | ✅ ADMIN/ORG_ADMIN |

---

## 🎨 Frontend Architecture

### Routing Structure

```
/login                → LoginPage (public)
/signup               → SignUp (public)
/                     → DashboardPage (role-based: Admin/Auditor/User)
/ask                  → AskAI (RAG-powered chat interface)
/knowledge            → KnowledgeBase (org-wide document explorer)
/documents            → DocumentsPage (personal document manager)
/channels             → ChannelList (collaboration channels)
/channels/:channelId  → ChannelChat (real-time messaging + @AI)
/settings             → SettingsPage (org AI + branding config)
/models               → ModelsPage (AI model management)
/manage-users         → ManageUsersPage (admin)
/manage-auditors      → ManageAuditorsPage (admin)
/audit                → AuditLogsPage (admin/auditor)
/admin-settings       → AdminSettingsPage (global admin)
/manage-organizations → OrganizationsPage (global admin)
/manage-departments   → DepartmentsPage (org admin)
```

### Layout Architecture

```
<BrowserRouter>
  <Routes>
    ┌── AuthLayout (public)
    │   ├── /login  → LoginPage
    │   └── /signup → SignUp
    │
    └── ProtectedLayout (JWT guard)
        └── DashboardLayout (sidebar + navbar + dynamic content)
            ├── /             → DashboardPage
            ├── /ask          → AskAI
            ├── /knowledge    → KnowledgeBase
            ├── /documents    → DocumentsPage
            ├── /channels     → ChannelList / ChannelChat
            ├── /settings     → SettingsPage
            ├── /models       → ModelsPage
            └── /admin-*      → Admin pages
  </Routes>
</BrowserRouter>
```

### State Management

| Concern | Approach |
|---------|---------|
| **Authentication** | React Context (`auth.ts`) with JWT token + user metadata |
| **Theming** | React Context (`ThemeContext.tsx`) with light/dark + org accent color |
| **API Communication** | Axios instance with JWT interceptor |
| **Real-Time State** | Socket.IO client with event-driven updates |
| **Local Component State** | React useState/useEffect hooks |

### Design System

- **Framework**: Tailwind CSS 4.x
- **Animations**: Framer Motion for page transitions and micro-interactions
- **Icons**: Lucide React + Tabler Icons + Heroicons
- **Typography**: System font stack with custom weight configurations
- **Color System**: Dynamic accent colors from organization settings
- **Theme Support**: Full light/dark mode with CSS custom properties
- **Responsive**: Mobile-first responsive design with collapsible sidebar

---

## 📊 Observability & Compliance

### Audit Logging

The platform maintains an **append-only audit log** that tracks:

| Category | Events Tracked |
|----------|---------------|
| **Authentication** | USER_SIGNUP, USER_LOGIN, AUTH_LOGIN_FAILED, LOGIN_FAILED |
| **Documents** | DOCUMENT_UPLOAD_QUEUED, DOCUMENT_DELETED, DOCUMENT_STATUS_UPDATED, DOCUMENT_VIEWED |
| **Jobs** | JOB_CREATED, JOB_STARTED, JOB_COMPLETED, JOB_FAILED, JOB_RETRY_SCHEDULED |
| **Chat** | CHAT_QUERY (with query text + chunks retrieved count) |
| **Settings** | SETTINGS_UPDATED (with sections changed) |

### Audit Log Schema

Each audit entry contains:
- `userId` — Who performed the action
- `organizationId` — Organization context
- `action` — Action type constant
- `resourceType` — Category (auth, document, job, chat, settings)
- `resourceId` — Target resource identifier
- `metadata` — Flexible JSON payload with action-specific details
- `createdAt` — Timestamp (auto-generated)

### Compliance Support

| Requirement | Implementation |
|-------------|---------------|
| **Who did what** | userId + action tracking |
| **When** | Automatic timestamps on all log entries |
| **What was affected** | resourceType + resourceId |
| **Context** | Flexible metadata field for IP, error reasons, etc. |
| **Immutability** | Append-only collection design |
| **Accessibility** | Filterable audit log viewer for ADMIN/AUDITOR roles |

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** 18+ and **npm**
- **MongoDB** instance (local or Atlas)
- **Pinecone** account with an index created
- **Google Gemini API Key** (for AI responses)
- **Ollama** (optional, for local embeddings) OR **Google Gemini Embedding API Key**
- **AWS S3** (optional, for cloud file storage)

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/Enterprise-Knowledge-Ai-Platform.git
cd Enterprise-Knowledge-Ai-Platform
```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in `/backend`:

```env
# Server
PORT=8000

# MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/enterprise_ai

# Authentication
JWT_SECRET=your_super_secret_jwt_key

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Pinecone Vector Database
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX=your_pinecone_index_name

# AWS S3 (Optional — falls back to local storage if not set)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name
```

Start the backend server:

```bash
npm run dev
```

### 3️⃣ Start Background Worker

In a separate terminal:

```bash
cd backend
npx ts-node workers/documentWorker.ts
```

### 4️⃣ Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173` by default.

### 5️⃣ Initial Role Seeding

On first startup, the backend automatically seeds the four system roles (ADMIN, ORG_ADMIN, AUDITOR, USER) from `roles_initial_data.json`.

---

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | ✅ | Backend server port (default: 8000) |
| `MONGO_URI` | ✅ | MongoDB connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT signing |
| `GEMINI_API_KEY` | ✅ | Google Gemini AI API key (fallback for orgs without BYOK) |
| `PINECONE_API_KEY` | ✅ | Pinecone vector database API key |
| `PINECONE_INDEX` | ✅ | Pinecone index name |
| `AWS_ACCESS_KEY_ID` | ❌ | AWS S3 access key (optional, enables cloud storage) |
| `AWS_SECRET_ACCESS_KEY` | ❌ | AWS S3 secret key |
| `AWS_REGION` | ❌ | AWS region (default: us-east-1) |
| `AWS_S3_BUCKET_NAME` | ❌ | S3 bucket name for document storage |

---

## 🔭 Future Scope

| Feature | Description |
|---------|-------------|
| **Mobile Application** | React Native companion app for on-the-go knowledge access |
| **Multi-Format Support** | Extend beyond PDF to DOCX, PPTX, XLSX, Markdown, CSV |
| **Automated Summarization** | AI-generated document summaries upon upload |
| **Advanced Analytics** | Query trends, knowledge gap analysis, usage heatmaps |
| **SSO Integration** | SAML/OAuth2 for enterprise identity providers |
| **Multi-Branch Support** | Hierarchical organization structures |
| **Advanced Sentiment Analysis** | Analyze internal knowledge trends and sentiment |
| **Collaborative Annotations** | In-document commenting and highlighting |
| **Workflow Automation** | Document approval workflows and notifications |
| **Email Notifications** | SMTP/SendGrid integration for alerts (schema ready) |
| **Scheduled Reporting** | Automated compliance reports and data exports |
| **Multi-Language Support** | i18n for global enterprise deployment |
| **Fine-Tuned Models** | Organization-specific model fine-tuning capabilities |

---

## 🏷 Keywords

Enterprise Knowledge Management, Retrieval-Augmented Generation (RAG), Semantic Search, Natural Language Processing (NLP), Document Lifecycle Automation, Vector Databases, Pinecone, Google Gemini AI, Ollama, Full-Stack Development, React.js, Node.js, Express.js, TypeScript, MongoDB, Mongoose, Socket.IO, WebSocket, Real-Time Collaboration, Role-Based Access Control (RBAC), Multi-Tenant Architecture, Bring-Your-Own-Key (BYOK), JWT Authentication, Token-Aware Chunking, PDF Text Extraction, Asynchronous Job Queue, Dead-Letter Handling, Exponential Backoff, Smart Superseding, Document Versioning, Audit Logging, Compliance, RESTful API, AWS S3, Multer, Tailwind CSS, Framer Motion, Vite, Business Intelligence, Data Visualization.

---

## 📜 License

This project is licensed under the ISC License.

---

<p align="center">
  <b>Enterprise Knowledge AI Platform</b> — Bridging the gap between raw data and actionable knowledge through AI.
</p>
