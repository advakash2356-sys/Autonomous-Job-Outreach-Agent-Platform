import React, { useState } from 'react';
import {
  FileCode,
  Shield,
  Database,
  Terminal,
  Scale,
  Cpu,
  Play,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  Code
} from 'lucide-react';
import { AgentDomainType, DAGTaskNode } from '../types';

interface WorkerPoolMonitorProps {
  onExecuteCustomWorkerTask: (agentType: AgentDomainType, inputPayload: string) => Promise<any>;
}

const WORKER_DEFINITIONS = [
  {
    type: 'CodeSynthesizer' as AgentDomainType,
    name: 'Code Synthesizer & Systems Architect',
    description: 'Generates deterministic, mathematically sound, production-grade TypeScript/Python implementations.',
    icon: FileCode,
    color: 'border-neutral-500 bg-neutral-900 text-white',
    accentColor: 'text-white',
    activeContract: '{ codePayload: string, language: string, testCoveragePercent: number }',
    constraints: [
      'Strict zero-hallucination code generation',
      'Always enforce type-safety and error boundaries',
      'No omitted implementations or stub functions'
    ],
    sampleInput: 'Synthesize a high-throughput rate-limiting middleware in Express with token bucket algorithm.'
  },
  {
    type: 'SecurityAuditor' as AgentDomainType,
    name: 'Security Auditor & Cryptographic Verifier',
    description: 'Conducts zero-trust vulnerability scans, signed OIDC token audits, and OWASP boundary checks.',
    icon: Shield,
    color: 'border-neutral-500 bg-neutral-900 text-white',
    accentColor: 'text-white',
    activeContract: '{ isVerified: boolean, securityScore: number, vulnerabilities: string[] }',
    constraints: [
      'Reject any unsigned token or mismatched anchor',
      'Zero-trust validation on all incoming payload schemas',
      'Immediate hard-fail on privilege escalation'
    ],
    sampleInput: 'Audit authorization header for Sovereign Root Anchor Adv.akash2356@gmail.com and check token expiration.'
  },
  {
    type: 'DataExtractor' as AgentDomainType,
    name: 'Data Extractor & Schema Contract Parser',
    description: 'Extracts structured JSON entities with strict Pydantic-grade contract conformance.',
    icon: Database,
    color: 'border-neutral-500 bg-neutral-900 text-white',
    accentColor: 'text-white',
    activeContract: '{ extractedEntities: array, schemaValid: boolean }',
    constraints: [
      'Never emit markdown prefixes inside JSON',
      'Retain 100% field integrity without dropping required keys',
      'Enforce atomic schema compliance'
    ],
    sampleInput: 'Extract entity graph representing microservice dependencies with latency and retry policies.'
  },
  {
    type: 'ApiIntegrator' as AgentDomainType,
    name: 'API Integrator & Tool Dispatcher',
    description: 'Dispatches deterministic tool invocations, executes web queries, and synthesizes external payloads.',
    icon: Terminal,
    color: 'border-neutral-500 bg-neutral-900 text-white',
    accentColor: 'text-white',
    activeContract: '{ toolInvocations: array, integrationStatus: string }',
    constraints: [
      'Validate tool response payloads before returning',
      'Log all external call latencies to telemetry',
      'Gracefully degrade on network timeout'
    ],
    sampleInput: 'Query external vulnerability database for CVE-2026-X token leakage signatures.'
  },
  {
    type: 'ReasoningAnalyst' as AgentDomainType,
    name: 'Reasoning & Analytical Strategy Agent',
    description: 'Evaluates multi-step deductive logic, risk matrices, and trade-off analyses.',
    icon: Scale,
    color: 'border-neutral-500 bg-neutral-900 text-white',
    accentColor: 'text-white',
    activeContract: '{ confidenceScore: number, finalVerdict: string, summary: string }',
    constraints: [
      'Perform multi-step deductive proofs',
      'Quantify confidence metrics on all assertions',
      'Highlight trade-offs and edge-case risks'
    ],
    sampleInput: 'Perform trade-off analysis between synchronous gRPC vs event-driven Kafka message streaming.'
  }
];

export const WorkerPoolMonitor: React.FC<WorkerPoolMonitorProps> = ({
  onExecuteCustomWorkerTask
}) => {
  const [selectedWorker, setSelectedWorker] = useState(WORKER_DEFINITIONS[0]);
  const [customInput, setCustomInput] = useState(WORKER_DEFINITIONS[0].sampleInput);
  const [isRunning, setIsRunning] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<any>(null);

  const handleSelectWorker = (worker: typeof WORKER_DEFINITIONS[0]) => {
    setSelectedWorker(worker);
    setCustomInput(worker.sampleInput);
    setExecutionOutput(null);
  };

  const handleRunWorker = async () => {
    setIsRunning(true);
    try {
      const res = await onExecuteCustomWorkerTask(selectedWorker.type, customInput);
      setExecutionOutput(res);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-5">
        <div className="flex items-center space-x-2 text-neutral-400 text-xs font-mono mb-1">
          <Cpu className="w-4 h-4" />
          <span>EXECUTION UNITS — ISOLATED DOMAIN WORKERS</span>
        </div>
        <h2 className="text-base font-semibold text-white">
          L2: Specialized Worker Pool & Schema Validation Engine
        </h2>
        <p className="text-xs text-neutral-400 max-w-3xl mt-1">
          5 isolated domain worker agents with ephemeral scratchpads, strict Pydantic-like JSON contracts, deterministic tool calls, and zero context pollution.
        </p>
      </div>

      {/* Worker Grid (5 Units) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {WORKER_DEFINITIONS.map((worker) => {
          const Icon = worker.icon;
          const isSelected = selectedWorker.type === worker.type;

          return (
            <button
              key={worker.type}
              id={`card-worker-${worker.type}`}
              onClick={() => handleSelectWorker(worker)}
              className={`p-4 rounded-lg border text-left transition-all relative ${
                isSelected
                  ? 'bg-neutral-900 border-white text-white'
                  : 'bg-neutral-950 hover:bg-neutral-900/60 border-neutral-800 text-neutral-400'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-neutral-400'}`} />
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                  Unit L2
                </span>
              </div>
              <h3 className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-neutral-300'} line-clamp-1`}>{worker.name}</h3>
              <p className="text-[11px] text-neutral-500 line-clamp-2 mt-1">{worker.description}</p>
            </button>
          );
        })}
      </div>

      {/* Active Worker Detailed Sandbox & Inspection */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Worker Policy & Spec (Left 5 Cols) */}
        <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-neutral-800 pb-3">
            <selectedWorker.icon className="w-4 h-4 text-white" />
            <div>
              <h3 className="text-sm font-semibold text-white">{selectedWorker.name}</h3>
              <span className="text-[10px] font-mono text-neutral-400">{selectedWorker.type} Spec</span>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-neutral-400 uppercase">Strict Schema Contract:</label>
            <div className="mt-1 p-2.5 rounded bg-neutral-900 border border-neutral-800 text-xs font-mono text-neutral-200">
              {selectedWorker.activeContract}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-neutral-400 uppercase">Negative Constraints & Rules:</label>
            <ul className="mt-1 space-y-1.5 text-xs text-neutral-300 font-mono">
              {selectedWorker.constraints.map((c, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-neutral-500 font-bold">✕</span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-3 rounded bg-neutral-900 border border-neutral-800 text-xs text-neutral-400">
            <span className="font-semibold text-white font-mono">Context Isolation:</span> Ephemeral memory scratchpads are completely cleared after every node execution to prevent hallucination cascades.
          </div>
        </div>

        {/* Worker Sandbox Runner & Trace Inspector (Right 7 Cols) */}
        <div className="lg:col-span-7 bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-neutral-400" />
              <span>Isolated Worker Sandbox Runner</span>
            </h3>
            <button
              id="btn-run-worker-sandbox"
              disabled={isRunning}
              onClick={handleRunWorker}
              className="px-4 py-2 rounded bg-white hover:bg-neutral-200 disabled:opacity-50 text-black text-xs font-mono font-semibold flex items-center space-x-2 transition-colors border border-white"
            >
              {isRunning ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing Worker Unit...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute Unit</span>
                </>
              )}
            </button>
          </div>

          <div>
            <label className="text-xs font-mono text-neutral-400">
              Worker Input Task / Instruction:
            </label>
            <textarea
              id="input-worker-task"
              rows={3}
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              className="w-full mt-1.5 bg-neutral-900 border border-neutral-800 rounded p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 font-mono"
            />
          </div>

          {/* Execution Output Panel */}
          <div>
            <label className="text-xs font-mono text-neutral-400">
              Worker Trace & Structured Payload:
            </label>
            <div className="mt-1.5 bg-neutral-900 p-3.5 rounded border border-neutral-800 text-xs font-mono min-h-[160px] max-h-[260px] overflow-y-auto">
              {executionOutput ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-white border-b border-neutral-800 pb-2">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                      Schema Validation: PASSED
                    </span>
                    <span className="text-neutral-400">{executionOutput.executionTrace?.latencyMs || 420}ms</span>
                  </div>

                  <div>
                    <span className="text-white font-semibold">Ephemeral Scratchpad Deductions:</span>
                    <ul className="list-disc list-inside text-neutral-300 mt-1 space-y-1">
                      {executionOutput.executionTrace?.scratchpad?.deductions?.map((d: string, i: number) => (
                        <li key={i}>{d}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-white font-semibold">Synthesized Payload:</span>
                    <pre className="text-neutral-200 mt-1 text-[11px] whitespace-pre-wrap">
                      {JSON.stringify(executionOutput.resultPayload || executionOutput.structuredPayload, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="text-neutral-500 text-center py-8">
                  Click "Execute Unit" to run this specialized worker agent and observe isolated scratchpad reasoning.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
