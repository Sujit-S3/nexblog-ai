# NexBlog AI

AI-powered content platform with RAG, multi-agent workflows, and a full-stack publishing system.

## Overview

NexBlog AI is a full-stack content management and knowledge platform that integrates Retrieval-Augmented Generation (RAG) and multi-agent AI workflows with a standard MERN blogging architecture. It enables document ingestion, AI-assisted content generation, and interactive knowledge queries on top of a solid publishing backbone.

## Key Features

- **RAG Knowledge Base:** Ingest PDFs, DOCX, and web content; query with AI-grounded responses.
- **Multi-Agent AI Workflows:** Chained AI tasks for content generation, summarization, and evaluation.
- **AI Evaluation Pipeline:** Replay engine for testing AI response quality against historical queries.
- **Standard Blog Engine:** Full authentication, post CRUD, comments, tags, image uploads, and search.
- **Configurable AI Providers:** Supports Gemini, OpenAI, and Anthropic via environment variables.
- **Rate Limiting & Security:** Helmet, express-rate-limit, CORS allowlist configurable via `ALLOWED_ORIGINS`.

## Architecture

```mermaid
graph TD
    Client[React SPA] -->|REST| API[Node.js / Express API]
    API --> DB[(MongoDB)]
    API --> AI[AI Provider (Gemini/OpenAI)]
    API --> KnowledgeBase[Document Store]
```

## Tech Stack

### Frontend (`client/`)
- **Framework:** React + Vite
- **State / Data:** Context API

### Backend (`api/`)
- **Server:** Node.js, Express (ESM)
- **Database:** MongoDB, Mongoose
- **AI:** Gemini, OpenAI, Anthropic (provider-agnostic)
- **Security:** Helmet, express-rate-limit, bcryptjs, JWT (httpOnly cookies)
- **Validation:** Zod
- **Testing:** Jest + Supertest
- **Queue:** BullMQ (optional)

## Project Structure

```
nexblog-ai/
├── api/           # Node.js / Express Backend
│   ├── src/       # Route handlers, models, services, AI pipelines
│   └── __tests__/ # Jest integration tests
├── client/        # React Frontend SPA
├── docs/          # Engineering documentation
└── e2e/           # End-to-end tests
```

## Installation

### Prerequisites
- Node.js (v20+)
- MongoDB (local or Atlas)

### Clone the Repository
```bash
git clone https://github.com/Sujit-S3/nexblog-ai.git
cd nexblog-ai
```

## Environment Variables

### Backend (`api/.env`)
```env
MONGO=mongodb://127.0.0.1:27017/nexblog
JWT_SECRET=your_jwt_secret_key_here
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
ALLOWED_ORIGINS=http://localhost:5173
```

### Frontend (`client/.env`)
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
```

## Running Locally

1. **Start the Backend:**
```bash
cd api
npm install
npm run dev
```

2. **Start the Frontend:**
```bash
cd client
npm install
npm run dev
```

Or from the root:
```bash
npm run build  # installs all deps + builds frontend
npm run dev    # starts the API only
```

## Testing

```bash
# API integration tests
cd api && npm test
```

## Deployment

The project is configured for Vercel deployment.

- **Backend:** Deploy `api/` as a Vercel Serverless Function (`api/vercel.json`).
- **Frontend:** Deploy `client/` as a Vercel SPA (`client/vercel.json`).
- Configure `ALLOWED_ORIGINS` in the backend to your deployed frontend URL.

## Security

- Passwords hashed with `bcryptjs`.
- JWTs in `httpOnly` cookies.
- CORS restricted via configurable `ALLOWED_ORIGINS`.
- `helmet` for secure HTTP headers.
- Rate limiting on all API routes.

## Future Improvements

- Add vector database (e.g., Qdrant or Pinecone) for more scalable RAG.
- Introduce a streaming AI response interface.
- Add a dedicated admin panel for knowledge base management.

## License

MIT License
