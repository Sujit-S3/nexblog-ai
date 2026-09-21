# NexBlog AI

**Computer Science & Systems Engineering Student | Full-Stack & AI Developer**

## 1. What the project is
NexBlog AI is a full-stack content management and knowledge platform built on the MERN stack. It integrates Retrieval-Augmented Generation (RAG) and multi-agent AI workflows, bridging the gap between traditional blogging and intelligent content generation.

## 2. What problem it solves
Modern content creators spend significant time researching, drafting, and organizing information. NexBlog AI solves this by allowing users to ingest documents (PDFs, DOCX) directly into a knowledge base and use multi-agent AI workflows to autonomously draft, summarize, and evaluate content grounded in those specific documents, streamlining the entire publishing pipeline.

## 3. What I personally built
I developed this platform from scratch, focusing on:
- A responsive React SPA for content consumption and creation.
- A Node.js/Express backend that handles standard blog CRUD operations alongside complex AI tasks.
- A document ingestion pipeline for RAG, enabling AI responses grounded in user-uploaded knowledge.
- Configurable multi-agent AI workflows that support Gemini, OpenAI, and Anthropic APIs dynamically via environment configurations.
- An AI evaluation replay engine for testing prompt quality against historical user queries.

## 4. Main features
- **RAG Knowledge Base:** Ingest PDFs, DOCX, and web content; query with AI-grounded responses.
- **Multi-Agent AI Workflows:** Chained AI tasks for content generation, summarization, and evaluation.
- **AI Evaluation Pipeline:** Replay engine for testing AI response quality against historical queries.
- **Standard Blog Engine:** Full authentication, post CRUD, comments, tags, image uploads, and search.
- **Configurable AI Providers:** Supports Gemini, OpenAI, and Anthropic via environment variables.
- **Rate Limiting & Security:** Helmet, express-rate-limit, CORS allowlist configurable via `ALLOWED_ORIGINS`.

## 5. Architecture
```mermaid
graph TD
    Client[React SPA] -->|REST| API[Node.js / Express API]
    API --> DB[(MongoDB)]
    API --> AI[AI Provider (Gemini/OpenAI)]
    API --> KnowledgeBase[Document Store]
```

## 6. Technology stack
- **Frontend (`client/`):** React, Vite, Context API
- **Backend (`api/`):** Node.js, Express (ESM), Zod
- **Database:** MongoDB, Mongoose
- **AI Integration:** Gemini, OpenAI, Anthropic (provider-agnostic)
- **Security:** Helmet, express-rate-limit, bcryptjs, JWT (httpOnly cookies)
- **Testing:** Jest, Supertest

## 7. Demo
*(Add Live Demo link here if available)*

## 8. Screenshots
*(Add screenshots of the Blog Interface, AI Agent Workflows, and Knowledge Base ingestion here)*

## 9. Installation
```bash
git clone https://github.com/Sujit-S3/nexblog-ai.git
cd nexblog-ai

# Install backend dependencies
cd api
npm install

# Install frontend dependencies
cd ../client
npm install
```

## 10. Environment variables
**Backend (`api/.env`)**
```env
MONGO=mongodb://127.0.0.1:27017/nexblog
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
ALLOWED_ORIGINS=http://localhost:5173
```

**Frontend (`client/.env`)**
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
```

## 11. Testing
```bash
# API integration tests
cd api
npm test
```

## 12. Deployment
The project is configured for Vercel deployment:
- **Backend:** Deploy `api/` as a Vercel Serverless Function (`api/vercel.json`). Configure `ALLOWED_ORIGINS` to point to your frontend URL.
- **Frontend:** Deploy `client/` as a Vercel SPA (`client/vercel.json`).
