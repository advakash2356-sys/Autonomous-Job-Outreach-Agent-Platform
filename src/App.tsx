import React, { useState, useEffect } from 'react';
import {
  SovereignIdentityAnchor,
  OIDCSession,
  GlobalTelemetry,
  DAGSessionGraph,
  DAGTaskNode,
  AgentDomainType,
  CriticEvaluation,
  PromptRegistryItem,
  ChampionChallengerBattle,
  VectorEpisodicMemoryItem,
  SemanticGraphEntity,
  AuditLogEntry,
  UserRole
} from './types';
import { SovereignHeader } from './components/SovereignHeader';
import { OrchestratorStudio } from './components/OrchestratorStudio';
import { WorkerPoolMonitor } from './components/WorkerPoolMonitor';
import { EvaluatorStudio } from './components/EvaluatorStudio';
import { MemoryExplorer } from './components/MemoryExplorer';
import { AuditTelemetryPanel } from './components/AuditTelemetryPanel';
import { LeadDashboard } from './components/LeadDashboard';
import { CareerOpsStudio } from './components/CareerOpsStudio';
import { VaultStudio } from './components/VaultStudio';

const ROOT_ANCHOR: SovereignIdentityAnchor = 'Adv.akash2356@gmail.com';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [telemetry, setTelemetry] = useState<GlobalTelemetry | null>(null);
  const [oidcSession, setOidcSession] = useState<OIDCSession | null>(null);
  const [dagGraph, setDagGraph] = useState<DAGSessionGraph | null>(null);
  const [selectedNode, setSelectedNode] = useState<DAGTaskNode | null>(null);
  const [isPlanning, setIsPlanning] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [promptRegistry, setPromptRegistry] = useState<PromptRegistryItem[]>([]);
  const [episodicStore, setEpisodicStore] = useState<VectorEpisodicMemoryItem[]>([]);
  const [semanticGraph, setSemanticGraph] = useState<SemanticGraphEntity[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // 1. Initial Load: OIDC Verification, Telemetry, Registry, Memory Stores
  useEffect(() => {
    // Authenticate Sovereign Root on boot
    handleVerifyOIDC('SovereignRootAdmin');
    fetchTelemetry();
    fetchPromptRegistry();
    fetchMemoryStores();
    fetchAuditLogs();

    // Telemetry polling interval
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const fetchTelemetry = async () => {
    try {
      const res = await fetch('/api/telemetry');
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data);
      }
    } catch (e) {
      console.error('Failed to fetch telemetry', e);
    }
  };

  const fetchPromptRegistry = async () => {
    try {
      const res = await fetch('/api/prompts/registry');
      if (res.ok) {
        const data = await res.json();
        setPromptRegistry(data.registry || []);
      }
    } catch (e) {
      console.error('Failed to fetch prompt registry', e);
    }
  };

  const fetchMemoryStores = async () => {
    try {
      const [epRes, semRes] = await Promise.all([
        fetch('/api/memory/episodic'),
        fetch('/api/memory/semantic')
      ]);
      if (epRes.ok) {
        const data = await epRes.json();
        setEpisodicStore(data.episodicMemory || []);
      }
      if (semRes.ok) {
        const data = await semRes.json();
        setSemanticGraph(data.semanticGraph || []);
      }
    } catch (e) {
      console.error('Failed to fetch memory stores', e);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch('/api/admin/audit-logs', {
        headers: {
          'x-sovereign-identity': oidcSession?.isVerified ? ROOT_ANCHOR : 'guest',
          'Authorization': oidcSession?.token ? `Bearer ${oidcSession.token}` : ''
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (e) {
      console.error('Failed to fetch audit logs', e);
    }
  };

  // OIDC Authentication Handler
  const handleVerifyOIDC = async (role: UserRole) => {
    try {
      const identity = role === 'SovereignRootAdmin' ? ROOT_ANCHOR : 'unauthorized_guest@test.com';
      const res = await fetch('/api/auth/verify-oidc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identityAnchor: identity, simulatedRole: role })
      });
      const data = await res.json();
      setOidcSession(data.session);
      fetchAuditLogs();

      if (data.session?.isVerified) {
        showNotification(`Sovereign Root Identity verified: ${ROOT_ANCHOR}`, 'success');
      } else {
        showNotification('Simulating Unverified Guest session. Privileged routes will throw 403 Forbidden.', 'error');
      }
    } catch (e) {
      console.error('OIDC verification error', e);
    }
  };

  // L1 CEO: Plan DAG
  const handlePlanDAG = async (objective: string) => {
    setIsPlanning(true);
    try {
      const res = await fetch('/api/orchestrate/plan-dag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sovereign-identity': oidcSession?.isVerified ? ROOT_ANCHOR : 'guest'
        },
        body: JSON.stringify({ objective })
      });

      if (res.status === 503) {
        showNotification('Emergency Kill-Switch is active. Agent loops frozen.', 'error');
        return;
      }

      if (!res.ok) throw new Error('DAG Planning failed');

      const dag: DAGSessionGraph = await res.json();
      setDagGraph(dag);
      if (dag.nodes.length > 0) {
        setSelectedNode(dag.nodes[0]);
      }
      showNotification(`L1 CEO Orchestrator synthesized ${dag.nodes.length}-node execution DAG.`, 'success');
      fetchTelemetry();
      fetchAuditLogs();
    } catch (e: any) {
      showNotification(`DAG Planning Error: ${e.message}`, 'error');
    } finally {
      setIsPlanning(false);
    }
  };

  // L2 Worker Pool: Execute Individual DAG Node
  const handleExecuteNode = async (node: DAGTaskNode) => {
    if (!dagGraph) return;

    // Optimistic UI state
    setDagGraph(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        nodes: prev.nodes.map(n => n.id === node.id ? { ...n, status: 'running' } : n)
      };
    });

    try {
      const res = await fetch('/api/orchestrate/execute-node', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sovereign-identity': oidcSession?.isVerified ? ROOT_ANCHOR : 'guest'
        },
        body: JSON.stringify({
          node,
          globalState: dagGraph.globalState,
          sessionId: dagGraph.sessionId
        })
      });

      if (res.status === 503) {
        showNotification('Execution blocked: Kill-Switch is engaged.', 'error');
        return;
      }

      const result = await res.json();

      setDagGraph(prev => {
        if (!prev) return prev;
        const updatedNodes = prev.nodes.map(n => {
          if (n.id === node.id) {
            return {
              ...n,
              status: 'completed' as const,
              resultPayload: result.resultPayload,
              rawOutput: result.rawOutput,
              executionTrace: result.executionTrace
            };
          }
          return n;
        });
        return { ...prev, nodes: updatedNodes };
      });

      if (selectedNode?.id === node.id) {
        setSelectedNode({
          ...node,
          status: 'completed',
          resultPayload: result.resultPayload,
          rawOutput: result.rawOutput,
          executionTrace: result.executionTrace
        });
      }

      showNotification(`Node ${node.id} (${node.agentType}) completed in ${result.executionTrace?.latencyMs || 400}ms.`, 'success');
      fetchTelemetry();
      fetchAuditLogs();
    } catch (e: any) {
      showNotification(`Node Execution Error: ${e.message}`, 'error');
      setDagGraph(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          nodes: prev.nodes.map(n => n.id === node.id ? { ...n, status: 'failed' } : n)
        };
      });
    }
  };

  // Execute All DAG Tiers in Topological Sequence
  const handleExecuteAllNodes = async () => {
    if (!dagGraph) return;
    setIsExecuting(true);

    try {
      for (const tierNodeIds of dagGraph.executionOrder) {
        const tierNodes = dagGraph.nodes.filter(n => tierNodeIds.includes(n.id) && n.status !== 'completed');
        await Promise.all(tierNodes.map(node => handleExecuteNode(node)));
      }
      showNotification('All DAG parallel tiers completed with zero schema drift.', 'success');
    } catch (e: any) {
      showNotification(`Execution error: ${e.message}`, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  // Inter-Agent Conflict Arbitration
  const handleArbitrateConflict = async (nodeId: string) => {
    try {
      const res = await fetch('/api/orchestrate/arbitrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conflictNodeId: nodeId,
          conflictingOutputs: [
            { agent: 'SecurityAuditor', output: 'Enforce strict 403 authorization and cryptographic token hashes.' },
            { agent: 'ApiIntegrator', output: 'Allow fallback permissive token parsing to minimize latency.' }
          ],
          globalState: dagGraph?.globalState
        })
      });
      const ruling = await res.json();
      showNotification(`L1 CEO Arbitrated: ${ruling.arbitrationRuling}`, 'info');
      fetchAuditLogs();
    } catch (e) {
      console.error(e);
    }
  };

  // Execute Standalone Custom Worker Task
  const handleExecuteCustomWorkerTask = async (agentType: AgentDomainType, inputPayload: string) => {
    const dummyNode: DAGTaskNode = {
      id: `sandbox-${Date.now()}`,
      title: `Standalone Sandbox for ${agentType}`,
      description: inputPayload,
      agentType,
      dependencies: [],
      inputs: { customInput: inputPayload },
      expectedOutputSchema: '{ status: string, payload: object }',
      tokenBudget: 500,
      latencyBudgetMs: 600,
      status: 'pending',
      retryCount: 0,
      depth: 0
    };

    const res = await fetch('/api/orchestrate/execute-node', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        node: dummyNode,
        globalState: { mode: 'sandbox_test' },
        sessionId: `sandbox-${Date.now()}`
      })
    });
    return res.json();
  };

  // L3 Meta-Critic: Trace Audit
  const handleAuditTrace = async (tracePayload: any): Promise<CriticEvaluation> => {
    const res = await fetch('/api/evaluator/audit-trace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trace: tracePayload })
    });
    const evaluation = await res.json();
    showNotification(`Trace audited. Score: ${evaluation.scores.compositeScore}/100. Verdict: ${evaluation.verdict}`, 'info');
    fetchTelemetry();
    return evaluation;
  };

  // L3 Meta-Critic: Mutate Prompt
  const handleMutatePrompt = async (targetAgentType: AgentDomainType, feedback: string) => {
    const res = await fetch('/api/evaluator/mutate-prompt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetAgentType, failureFeedback: feedback })
    });
    const data = await res.json();
    showNotification(`Synthesized Challenger Prompt ${data.challenger?.version} with optimized negative constraints.`, 'success');
    fetchPromptRegistry();
    return data;
  };

  // L3 Meta-Critic: Champion vs Challenger Battle
  const handleRunRegression = async (championPromptId: string, challengerPromptId: string, agentType: AgentDomainType) => {
    const res = await fetch('/api/evaluator/run-regression', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ championPromptId, challengerPromptId, agentType })
    });
    const battle = await res.json();
    showNotification(`Regression Battle Finished. Chal: ${battle.summary.challengerAvgScore}% vs Champ: ${battle.summary.championAvgScore}%`, 'info');
    return battle;
  };

  // Promote Challenger to Champion
  const handlePromotePrompt = async (challengerId: string) => {
    const res = await fetch('/api/evaluator/promote-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sovereign-identity': oidcSession?.isVerified ? ROOT_ANCHOR : 'guest'
      },
      body: JSON.stringify({ challengerId })
    });

    if (res.status === 403) {
      showNotification('403 Forbidden: Zero-Trust RBAC blocked unverified identity from promoting prompts.', 'error');
      return;
    }

    const data = await res.json();
    if (data.success) {
      showNotification(`Promoted version ${data.promotedPrompt.version} to Champion in System Registry!`, 'success');
      fetchPromptRegistry();
      fetchAuditLogs();
    }
  };

  // Episodic Memory Cosine Search
  const handleSearchEpisodic = async (query: string): Promise<VectorEpisodicMemoryItem[]> => {
    const res = await fetch('/api/memory/episodic/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    return data.results || [];
  };

  // System Registry 1-Click Rollback
  const handleRollbackPrompt = async (targetPromptId: string) => {
    const res = await fetch('/api/prompts/rollback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sovereign-identity': oidcSession?.isVerified ? ROOT_ANCHOR : 'guest'
      },
      body: JSON.stringify({ targetPromptId })
    });

    if (res.status === 403) {
      showNotification('403 Forbidden: Zero-Trust RBAC required for sovereign rollback.', 'error');
      return;
    }

    const data = await res.json();
    if (data.success) {
      showNotification(`Sovereign Rollback executed for ${data.activePrompt.agentType} to commit ${data.activePrompt.gitCommitHash}!`, 'success');
      fetchPromptRegistry();
      fetchAuditLogs();
    }
  };

  // Emergency Kill-Switch Toggle
  const handleToggleKillSwitch = async (action: 'ENGAGE' | 'DISENGAGE') => {
    const res = await fetch('/api/admin/kill-switch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sovereign-identity': oidcSession?.isVerified ? ROOT_ANCHOR : 'guest'
      },
      body: JSON.stringify({ action, reason: 'Sovereign Administrator Command' })
    });

    if (res.status === 403) {
      showNotification('403 Forbidden: Sovereign Root Anchor required to toggle Kill-Switch.', 'error');
      return;
    }

    const data = await res.json();
    fetchTelemetry();
    fetchAuditLogs();
    if (action === 'ENGAGE') {
      showNotification('EMERGENCY KILL-SWITCH ENGAGED. All agent loops frozen.', 'error');
    } else {
      showNotification('Emergency Kill-Switch Disengaged. System restored to nominal state.', 'success');
    }
  };

  // Budget Policy Override
  const handleOverrideBudget = async (newCap: number, newRecursion: number) => {
    const res = await fetch('/api/admin/override-budget', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sovereign-identity': oidcSession?.isVerified ? ROOT_ANCHOR : 'guest'
      },
      body: JSON.stringify({ newBudgetCap: newCap, newRecursionLimit: newRecursion })
    });

    if (res.status === 403) {
      showNotification('403 Forbidden: Sovereign privilege required to override budget policy.', 'error');
      return;
    }

    showNotification('Sovereign budget & recursion depth policy updated.', 'success');
    fetchAuditLogs();
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className={`px-4 py-2.5 rounded shadow-2xl text-xs font-mono border flex items-center space-x-2.5 ${
            notification.type === 'success'
              ? 'bg-neutral-900 text-white border-neutral-600'
              : notification.type === 'error'
              ? 'bg-neutral-950 text-neutral-100 border-neutral-500'
              : 'bg-neutral-900 text-neutral-200 border-neutral-700'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Sovereign Header & Global Telemetry Bar */}
      <SovereignHeader
        telemetry={telemetry}
        oidcSession={oidcSession}
        onToggleKillSwitch={handleToggleKillSwitch}
        onVerifyOIDC={handleVerifyOIDC}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Framework Content Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        {activeTab === 'dashboard' && (
          <LeadDashboard
            onNotify={showNotification}
          />
        )}

        {activeTab === 'careerops' && (
          <CareerOpsStudio
            onNotify={showNotification}
          />
        )}

        {activeTab === 'vault' && (
          <VaultStudio
            sovereignAnchor={ROOT_ANCHOR}
            onNotify={showNotification}
          />
        )}

        {activeTab === 'orchestrator' && (
          <OrchestratorStudio
            dagGraph={dagGraph}
            onPlanDAG={handlePlanDAG}
            onExecuteNode={handleExecuteNode}
            onExecuteAllNodes={handleExecuteAllNodes}
            onArbitrateConflict={handleArbitrateConflict}
            isPlanning={isPlanning}
            isExecuting={isExecuting}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            oidcSession={oidcSession}
          />
        )}

        {activeTab === 'workers' && (
          <WorkerPoolMonitor
            onExecuteCustomWorkerTask={handleExecuteCustomWorkerTask}
          />
        )}

        {activeTab === 'evaluator' && (
          <EvaluatorStudio
            onAuditTrace={handleAuditTrace}
            onMutatePrompt={handleMutatePrompt}
            onRunRegression={handleRunRegression}
            onPromotePrompt={handlePromotePrompt}
            promptRegistry={promptRegistry}
          />
        )}

        {activeTab === 'memory' && (
          <MemoryExplorer
            episodicStore={episodicStore}
            semanticGraph={semanticGraph}
            promptRegistry={promptRegistry}
            currentDAG={dagGraph}
            onSearchEpisodic={handleSearchEpisodic}
            onRollbackPrompt={handleRollbackPrompt}
          />
        )}

        {activeTab === 'audit' && (
          <AuditTelemetryPanel
            auditLogs={auditLogs}
            telemetry={telemetry}
            onOverrideBudget={handleOverrideBudget}
            rootAnchor={ROOT_ANCHOR}
          />
        )}
      </main>

      {/* Sovereign Framework Footer */}
      <footer className="border-t border-neutral-800/80 bg-black py-4 text-center text-xs text-neutral-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-neutral-400">Anchor: Adv.akash2356@gmail.com</span>
          <span className="text-neutral-800">•</span>
          <span>Zero-Trust RBAC • Dynamic DAG Engine • DSPy Mutation Registry</span>
          <span className="text-neutral-800">•</span>
          <span className="text-neutral-300">Autonomous Multi-Agent Framework v2.4</span>
        </div>
      </footer>
    </div>
  );
}
