# Autonomous-Job-Outreach-Agent-Platform

Autonomous Job Outreach & Agent Platform created by Adv. Akash Sharma.

## Features

- **Lead Dashboard:** Review and manage job outreach leads with seeded initial data.
- **CareerOps Studio:** Mode-based job evaluation (`eval` and other career operations modes) using candidate CV facts, profile configurations, Voice DNA rules, and sample job descriptions.
- **AST Verification & Scoring:** Automated verification (`CareerOpsVerifier`) and diagnostic scoring for candidate job descriptions and profile facts.
- **Orchestrator Studio:** Directed Acyclic Graph (DAG) session graphs (`DAGSessionGraph`, `DAGTaskNode`) for planning and executing multi-step agent workflows.
- **Worker Pool Monitor:** Monitoring and status oversight across distinct agent domains.
- **Evaluator Studio:** Critic evaluations, failure taxonomy tracking (Hallucination, SchemaContractViolation, InefficientReasoningPath, ConstraintDrift), prompt registry management, and champion-challenger regression battles.
- **Memory Explorer:** Inspection of episodic vector memory (`VectorEpisodicMemoryItem`) and semantic knowledge graph entities (`SemanticGraphEntity`).
- **Vault Studio:** Workspace management for vault states, calendar events, tasks, notes, and commit records.
- **Audit & Telemetry Panel:** Real-time global telemetry metrics, sovereign budget overrides (budget caps and recursion limits), and cryptographically anchored audit logging under a sovereign identity anchor (`Adv.akash2356@gmail.com`).
- **LLM Routing:** Integration with Google Gemini (`@google/genai`) and local resume processing utilities (`localResumeLLM`, `llmRouter`).

## Tech Stack

- **Runtime & Server:** Node.js, Express, tsx, esbuild
- **Frontend Framework:** React 19, React DOM
- **Build Tool:** Vite 6
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Autoprefixer
- **UI & Visualization:** Lucide React, Motion, Recharts
- **AI & SDKs:** `@google/genai`
- **Configuration & Environment:** dotenv

## Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables by creating a `.env` file based on `.env.example`:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(Note: The server defaults to port `3000` and initializes Google Gen AI using `GEMINI_API_KEY`.)*

## Usage

- **Development Mode:** Starts the integrated Express server with Vite middleware:
  ```bash
  npm run dev
  ```
- **Type Checking:**
  ```bash
  npm run lint
  ```
- **Production Build:**
  ```bash
  npm run build
  ```
- **Production Start:**
  ```bash
  npm run start
  ```
- **Clean Build Artifacts:**
  ```bash
  npm run clean
  ```

## Project Structure

```
.
├── .env.example
├── .gitignore
├── assets/
│   └── .aistudio/
│       └── .gitignore
├── index.html
├── metadata.json
├── package.json
├── server.ts
├── src/
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   ├── types.ts
│   ├── components/
│   │   ├── AuditTelemetryPanel.tsx
│   │   ├── CareerOpsStudio.tsx
│   │   ├── EvaluatorStudio.tsx
│   │   ├── LeadDashboard.tsx
│   │   ├── MemoryExplorer.tsx
│   │   ├── OrchestratorStudio.tsx
│   │   ├── SovereignHeader.tsx
│   │   ├── VaultStudio.tsx
│   │   └── WorkerPoolMonitor.tsx
│   ├── data/
│   │   └── initialLeads.ts
│   ├── types/
│   │   ├── careerOps.ts
│   │   └── vault.ts
│   └── utils/
│       ├── auditExport.ts
│       ├── careerOpsData.ts
│       ├── careerOpsVerifier.ts
│       ├── llmRouter.ts
│       └── localResumeLLM.ts
├── tsconfig.json
└── vite.config.ts

## Add your API key

AI features need a Gemini API key (free at https://aistudio.google.com/apikey). Two ways:

1. **In the app (recommended):** click the **Enter your API key** button (bottom-right). The key field is masked (Show/Hide toggle) and has a **Remove key** button.
2. **Server env var:** set `GEMINI_API_KEY` in `.env.local` / your host's secrets (see `.env.example`).

**Privacy:** a key entered in the app is stored only in your own browser (localStorage). It is never committed to git and never logged. It is attached only to requests to this app's own server, held in memory for that request, and forwarded straight to Google's Gemini API. Click **Remove key** to delete it at any time.
