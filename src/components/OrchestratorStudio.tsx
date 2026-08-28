import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  Clock,
  AlertCircle,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
  GitBranch,
  Shield,
  FileCode,
  Database,
  Terminal,
  Scale,
  RotateCcw,
  Zap,
  Check,
  ChevronRight,
  Trophy,
  Award,
  Target,
  Compass,
  Star,
  Gamepad2
} from 'lucide-react';
import {
  DAGSessionGraph,
  DAGTaskNode,
  AgentDomainType,
  StandardizedExecutionTrace,
  OIDCSession,
  MatchingBadge
} from '../types';
import { INITIAL_MATCHING_BADGES } from '../data/initialLeads';

interface OrchestratorStudioProps {
  dagGraph: DAGSessionGraph | null;
  onPlanDAG: (objective: string) => Promise<void>;
  onExecuteNode: (node: DAGTaskNode) => Promise<void>;
  onExecuteAllNodes: () => Promise<void>;
  onArbitrateConflict: (nodeId: string) => Promise<void>;
  isPlanning: boolean;
  isExecuting: boolean;
  selectedNode: DAGTaskNode | null;
  setSelectedNode: (node: DAGTaskNode | null) => void;
  oidcSession: OIDCSession | null;
}

const MISSION_PRESETS = [
  {
    title: 'Candidate-to-Lead Autonomous Match & Cover Letter Synthesis',
    desc: 'Match candidate resume skills against scraped YouTube and Instagram recruiter profiles, synthesize tailored cover emails, and update application tracking status.'
  },
  {
    title: 'Zero-Trust Security Triage & Dynamic Remediation',
    desc: 'Audit codebase vulnerabilities, verify signed OIDC tokens, generate cryptographic patches, and deploy zero-trust middleware.'
  },
  {
    title: 'High-Throughput Microservice Architecture Synthesis',
    desc: 'Decompose multi-region distributed backend with rate limiting, Redis caching layers, and strict Pydantic schemas.'
  }
];

export const OrchestratorStudio: React.FC<OrchestratorStudioProps> = ({
  dagGraph,
  onPlanDAG,
  onExecuteNode,
  onExecuteAllNodes,
  onArbitrateConflict,
  isPlanning,
  isExecuting,
  selectedNode,
  setSelectedNode,
  oidcSession
}) => {
  const [objectiveInput, setObjectiveInput] = useState(
    'Synthesize a resilient, zero-trust cryptographic authentication pipeline with strict Pydantic schema validation and automated OIDC token verification for Adv.akash2356@gmail.com'
  );
  const [activeInspectorTab, setActiveInspectorTab] = useState<'scratchpad' | 'tools' | 'payload' | 'trace'>('scratchpad');
  
  // Matching Game State
  const [matchedLeadsCount, setMatchedLeadsCount] = useState<number>(6);
  const [targetLeadsCount] = useState<number>(10);
  const [matchingXP, setMatchingXP] = useState<number>(1450);
  const [matchingLevel, setMatchingLevel] = useState<number>(3);
  const [badges, setBadges] = useState<MatchingBadge[]>(INITIAL_MATCHING_BADGES);
  const [isSimulatingMatch, setIsSimulatingMatch] = useState<boolean>(false);
  const [matchNotification, setMatchNotification] = useState<string | null>(null);

  const handleSimulateMatchRun = () => {
    setIsSimulatingMatch(true);
    setTimeout(() => {
      setMatchedLeadsCount(prev => {
        const nextCount = Math.min(prev + 1, targetLeadsCount);
        const newXP = matchingXP + 250;
        setMatchingXP(newXP);

        // Check if level up
        if (newXP >= 2000) {
          setMatchingLevel(4);
        }

        // Check badge unlocks
        setBadges(prevBadges => prevBadges.map(b => {
          if (b.id === 'badge-grandmaster') {
            const nextProgress = Math.min(b.progress + 1, b.target);
            const isUnlocked = nextProgress >= b.target;
            return {
              ...b,
              progress: nextProgress,
              unlocked: isUnlocked,
              unlockedAt: isUnlocked && !b.unlocked ? new Date().toISOString() : b.unlockedAt
            };
          }
          return b;
        }));

        setMatchNotification(`Successfully matched new Lead with 95% compatibility (+250 XP)!`);
        setTimeout(() => setMatchNotification(null), 3500);

        return nextCount;
      });
      setIsSimulatingMatch(false);
    }, 600);
  };

  const getAgentBadge = (type: AgentDomainType) => {
    switch (type) {
      case 'CodeSynthesizer':
        return { label: 'Code Synthesizer', color: 'bg-neutral-900 text-neutral-200 border-neutral-700', icon: FileCode };
      case 'SecurityAuditor':
        return { label: 'Security Auditor', color: 'bg-neutral-900 text-neutral-200 border-neutral-700', icon: Shield };
      case 'DataExtractor':
        return { label: 'Data Extractor', color: 'bg-neutral-900 text-neutral-200 border-neutral-700', icon: Database };
      case 'ApiIntegrator':
        return { label: 'API Integrator', color: 'bg-neutral-900 text-neutral-200 border-neutral-700', icon: Terminal };
      case 'ReasoningAnalyst':
        return { label: 'Reasoning Analyst', color: 'bg-neutral-900 text-neutral-200 border-neutral-700', icon: Scale };
      default:
        return { label: type, color: 'bg-neutral-900 text-neutral-400 border-neutral-800', icon: Cpu };
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-white" />;
      case 'running':
        return <RotateCcw className="w-4 h-4 text-neutral-400 animate-spin" />;
      case 'arbitrating':
        return <Scale className="w-4 h-4 text-neutral-300 animate-bounce" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-neutral-400" />;
      default:
        return <Clock className="w-4 h-4 text-neutral-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: L1 CEO Controller Role */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-neutral-400 text-xs font-mono mb-1">
              <Layers className="w-4 h-4" />
              <span>EXECUTIVE CONTROLLER — DIRECTED ACYCLIC GRAPH (DAG) ENGINE</span>
            </div>
            <h2 className="text-base font-semibold text-white">
              L1: CEO Orchestrator Agent Task Planning
            </h2>
            <p className="text-xs text-neutral-400 max-w-2xl mt-1">
              Deconstructs high-level objectives into parallel execution DAG nodes, allocates token/latency budgets, arbitrates inter-agent conflicts, and enforces zero-trust governance.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-plan-dag"
              disabled={isPlanning || isExecuting}
              onClick={() => onPlanDAG(objectiveInput)}
              className="px-4 py-2 rounded bg-white hover:bg-neutral-200 disabled:opacity-50 text-black text-xs font-mono font-semibold flex items-center space-x-2 transition-colors border border-white"
            >
              {isPlanning ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  <span>Generating DAG...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Deconstruct Objective to DAG</span>
                </>
              )}
            </button>

            {dagGraph && (
              <button
                id="btn-execute-all-dag"
                disabled={isExecuting || isPlanning}
                onClick={onExecuteAllNodes}
                className="px-4 py-2 rounded bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-200 text-xs font-mono font-semibold flex items-center space-x-2 border border-neutral-700 transition-colors"
              >
                {isExecuting ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin" />
                    <span>Executing DAG Tiers...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Execute All DAG Tiers</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Objective Input Area */}
        <div className="mt-4">
          <label className="block text-xs font-mono text-neutral-400 mb-1.5">
            MISSION OBJECTIVE / SYSTEM PROMPT:
          </label>
          <div className="relative">
            <textarea
              id="input-mission-objective"
              rows={2}
              value={objectiveInput}
              onChange={(e) => setObjectiveInput(e.target.value)}
              placeholder="Enter complex multi-step objective for autonomous agent orchestration..."
              className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 font-mono"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="text-[10px] uppercase font-mono text-neutral-500">Presets:</span>
            {MISSION_PRESETS.map((p, idx) => (
              <button
                key={idx}
                id={`btn-preset-${idx}`}
                onClick={() => setObjectiveInput(p.desc)}
                className="text-[11px] font-mono px-2.5 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 transition-colors"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Matching Game & Achievement Badge Progress Tracker */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded bg-neutral-900 text-white border border-neutral-700">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-white">
                  Candidate-to-Lead Matching Game & Qualification Progress
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-700 font-semibold">
                  Level {matchingLevel} Match Architect
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Autonomous matching engine scores candidate compatibility, fills progress milestones, and unlocks qualification achievement badges.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right font-mono text-xs hidden sm:block">
              <div className="text-white font-bold">{matchingXP} / 2,000 XP</div>
              <div className="text-[10px] text-neutral-500">{targetLeadsCount - matchedLeadsCount} matches to next rank</div>
            </div>
            <button
              id="btn-simulate-match-game"
              disabled={isSimulatingMatch || matchedLeadsCount >= targetLeadsCount}
              onClick={handleSimulateMatchRun}
              className="px-3.5 py-2 rounded bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-neutral-200 text-xs font-mono font-semibold flex items-center space-x-1.5 border border-neutral-700 transition-colors"
            >
              {isSimulatingMatch ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Matching Lead...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simulate Match Run (+250 XP)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Match Notification Feedback */}
        {matchNotification && (
          <div className="bg-neutral-900 border border-neutral-700 text-neutral-200 text-xs font-mono px-3.5 py-2 rounded flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4 text-white" />
              {matchNotification}
            </span>
            <span className="text-[10px] text-neutral-400 font-bold uppercase">Badge Progress Updated</span>
          </div>
        )}

        {/* Filling Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-neutral-400 font-semibold flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-neutral-400" />
              Pipeline Matching Milestone Progress
            </span>
            <span className="text-white font-bold">
              {matchedLeadsCount} / {targetLeadsCount} Matched ({Math.round((matchedLeadsCount / targetLeadsCount) * 100)}%)
            </span>
          </div>
          <div className="w-full bg-neutral-900 rounded h-2 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500 rounded"
              style={{ width: `${Math.min(Math.round((matchedLeadsCount / targetLeadsCount) * 100), 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Achievement Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {badges.map((badge) => {
            let BadgeIcon = Award;
            if (badge.icon === 'Sparkles') BadgeIcon = Sparkles;
            else if (badge.icon === 'Compass') BadgeIcon = Compass;
            else if (badge.icon === 'Target') BadgeIcon = Target;
            else if (badge.icon === 'Trophy') BadgeIcon = Trophy;

            return (
              <div
                key={badge.id}
                id={`badge-card-${badge.id}`}
                className={`p-3 rounded-lg border transition-all ${
                  badge.unlocked
                    ? 'bg-neutral-900 border-neutral-700 text-white'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-500 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className={`p-1.5 rounded ${
                    badge.unlocked ? 'bg-neutral-950 text-white border border-neutral-800' : 'bg-neutral-950 text-neutral-600'
                  }`}>
                    <BadgeIcon className="w-4 h-4" />
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    badge.unlocked
                      ? 'bg-neutral-950 text-white border border-neutral-700'
                      : 'bg-neutral-950 text-neutral-600'
                  }`}>
                    {badge.unlocked ? 'UNLOCKED' : `${badge.progress}/${badge.target}`}
                  </span>
                </div>
                <h4 className={`text-xs font-semibold ${badge.unlocked ? 'text-white' : 'text-neutral-500'}`}>
                  {badge.title}
                </h4>
                <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5 leading-snug">
                  {badge.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Orchestration Canvas */}
      {dagGraph ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Visual DAG Execution Tiers (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <GitBranch className="w-4 h-4 text-neutral-400" />
                  <h3 className="text-sm font-semibold text-white">
                    DAG Topology & Parallel Execution Tiers
                  </h3>
                </div>
                <div className="text-xs font-mono text-neutral-400 flex items-center space-x-3">
                  <span>Session: {dagGraph.sessionId.slice(0, 12)}...</span>
                  <span className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
                    {dagGraph.nodes.filter(n => n.status === 'completed').length} / {dagGraph.nodes.length} Completed
                  </span>
                </div>
              </div>

              {/* Execution Tiers Lanes */}
              <div className="space-y-6">
                {dagGraph.executionOrder.map((tierNodeIds, tierIndex) => {
                  const tierNodes = dagGraph.nodes.filter(n => tierNodeIds.includes(n.id));
                  const isTierComplete = tierNodes.every(n => n.status === 'completed');

                  return (
                    <div key={tierIndex} className="relative">
                      <div className="flex items-center justify-between text-xs font-mono mb-2 text-neutral-400">
                        <span className="flex items-center space-x-1.5 text-neutral-300 font-semibold">
                          <span>TIER {tierIndex}: Parallel Execution Group</span>
                          {isTierComplete && (
                            <span className="text-[10px] text-white bg-neutral-900 px-1.5 py-0.2 rounded border border-neutral-700">
                              PASS
                            </span>
                          )}
                        </span>
                        <span>{tierNodes.length} Subtask Nodes</span>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {tierNodes.map((node) => {
                          const badge = getAgentBadge(node.agentType);
                          const isSelected = selectedNode?.id === node.id;
                          const AgentIcon = badge.icon;

                          return (
                            <div
                              key={node.id}
                              id={`dag-node-${node.id}`}
                              onClick={() => setSelectedNode(node)}
                              className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-neutral-900 border-white'
                                  : 'bg-neutral-900/50 hover:bg-neutral-900 border-neutral-800'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs font-mono font-bold text-white">
                                      {node.id}: {node.title}
                                    </span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded border flex items-center gap-1 font-mono ${badge.color}`}>
                                      <AgentIcon className="w-3 h-3" />
                                      {badge.label}
                                    </span>
                                  </div>
                                  <p className="text-xs text-neutral-400 line-clamp-1">
                                    {node.description}
                                  </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                  <div className="flex items-center space-x-1 font-mono text-[11px] text-neutral-400">
                                    {getStatusIcon(node.status)}
                                    <span className="capitalize text-neutral-300">{node.status}</span>
                                  </div>

                                  <button
                                    id={`btn-run-node-${node.id}`}
                                    disabled={node.status === 'running' || isExecuting}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onExecuteNode(node);
                                    }}
                                    className="p-1.5 rounded bg-neutral-950 hover:bg-white hover:text-black text-neutral-300 border border-neutral-700 transition-colors"
                                    title="Execute this single node"
                                  >
                                    <Play className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Dependencies & Schema Contract */}
                              <div className="mt-2.5 pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                                <div className="flex items-center space-x-1">
                                  <span className="text-neutral-500">Deps:</span>
                                  {node.dependencies.length > 0 ? (
                                    node.dependencies.map(d => (
                                      <span key={d} className="px-1.5 py-0.2 rounded bg-neutral-950 text-neutral-300 border border-neutral-800 text-[10px]">
                                        {d}
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-white text-[10px]">None (Root)</span>
                                  )}
                                </div>

                                <div className="flex items-center space-x-3 text-neutral-400 text-[10px]">
                                  <span>Budget: {node.tokenBudget} tok</span>
                                  <span>Max: {node.latencyBudgetMs}ms</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Tier Connector Arrow */}
                      {tierIndex < dagGraph.executionOrder.length - 1 && (
                        <div className="flex justify-center my-2">
                          <div className="h-4 w-0.5 bg-neutral-700"></div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Inter-Agent Conflict Arbitration Trigger */}
              <div className="mt-6 p-3.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Scale className="w-4 h-4 text-neutral-300" />
                  <div>
                    <h4 className="text-xs font-semibold text-white">
                      Inter-Agent Conflict & Deadlock Arbitration
                    </h4>
                    <p className="text-[11px] text-neutral-400">
                      Simulate conflicting worker outputs to trigger L1 CEO Orchestrator resolution.
                    </p>
                  </div>
                </div>
                <button
                  id="btn-trigger-arbitration"
                  onClick={() => onArbitrateConflict(selectedNode?.id || 'node-1')}
                  className="px-3 py-1.5 rounded bg-white hover:bg-neutral-200 text-black text-xs font-mono font-semibold flex items-center space-x-1.5"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Arbitrate Node</span>
                </button>
              </div>
            </div>
          </div>

          {/* Node Inspector Drawer & Execution Trace (Right 5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                  <Cpu className="w-4 h-4 text-neutral-400" />
                  <span>Node Execution Inspector</span>
                </h3>
                {selectedNode && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-700">
                    {selectedNode.id}
                  </span>
                )}
              </div>

              {selectedNode ? (
                <div className="space-y-4">
                  {/* Node Header */}
                  <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">{selectedNode.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-300 border border-neutral-800">
                        {selectedNode.agentType}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400">{selectedNode.description}</p>
                    <div className="text-[11px] font-mono text-neutral-300 bg-neutral-950 p-2 rounded border border-neutral-800">
                      Contract: {selectedNode.expectedOutputSchema}
                    </div>
                  </div>

                  {/* Inspector Tabs */}
                  <div className="flex space-x-1 border-b border-neutral-800 pb-1">
                    {[
                      { id: 'scratchpad', label: 'Ephemeral Scratchpad' },
                      { id: 'tools', label: 'Tool Calls' },
                      { id: 'payload', label: 'Structured Payload' },
                      { id: 'trace', label: 'Trace Metrics' }
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setActiveInspectorTab(t.id as any)}
                        className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                          activeInspectorTab === t.id
                            ? 'bg-white text-black font-semibold'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Contents */}
                  <div className="text-xs font-mono bg-neutral-900 p-3 rounded-lg border border-neutral-800 min-h-[220px] max-h-[360px] overflow-y-auto">
                    {activeInspectorTab === 'scratchpad' && (
                      <div className="space-y-2.5 text-neutral-300">
                        {selectedNode.executionTrace?.scratchpad ? (
                          <>
                            <div className="text-white font-bold">
                              Agent: {selectedNode.executionTrace.scratchpad.agentId}
                            </div>
                            <div>
                              <span className="text-neutral-500">Hypothesis:</span>{' '}
                              {selectedNode.executionTrace.scratchpad.internalHypothesis}
                            </div>
                            <div>
                              <span className="text-neutral-500">Deductions:</span>
                              <ul className="list-disc list-inside mt-1 space-y-1 text-neutral-300">
                                {selectedNode.executionTrace.scratchpad.deductions.map((d, i) => (
                                  <li key={i}>{d}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="text-white">
                              Confidence: {selectedNode.executionTrace.scratchpad.confidenceScore}%
                            </div>
                          </>
                        ) : (
                          <div className="text-neutral-500 italic">
                            Execute this node to view isolated scratchpad deduction traces.
                          </div>
                        )}
                      </div>
                    )}

                    {activeInspectorTab === 'tools' && (
                      <div className="space-y-2 text-neutral-300">
                        {selectedNode.executionTrace?.toolInvocations && selectedNode.executionTrace.toolInvocations.length > 0 ? (
                          selectedNode.executionTrace.toolInvocations.map((tool, idx) => (
                            <div key={idx} className="p-2 rounded bg-neutral-950 border border-neutral-800 space-y-1">
                              <div className="flex items-center justify-between text-white font-mono">
                                <span>Tool: {tool.toolName}</span>
                                <span className="text-neutral-400">{tool.durationMs}ms</span>
                              </div>
                              <div className="text-[10px] text-neutral-400">
                                Input: {JSON.stringify(tool.inputPayload)}
                              </div>
                              <div className="text-[10px] text-neutral-300">
                                Output: {JSON.stringify(tool.outputPayload)}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-neutral-500 italic">No tool calls dispatched for this node.</div>
                        )}
                      </div>
                    )}

                    {activeInspectorTab === 'payload' && (
                      <div>
                        {selectedNode.resultPayload ? (
                          <pre className="text-[11px] text-neutral-200 whitespace-pre-wrap font-mono">
                            {JSON.stringify(selectedNode.resultPayload, null, 2)}
                          </pre>
                        ) : (
                          <div className="text-neutral-500 italic">Payload not yet synthesized.</div>
                        )}
                      </div>
                    )}

                    {activeInspectorTab === 'trace' && (
                      <div className="space-y-2 text-neutral-300">
                        {selectedNode.executionTrace ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-neutral-500">Trace ID:</span>
                              <span className="text-white">{selectedNode.executionTrace.traceId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-500">Latency:</span>
                              <span className="text-white">{selectedNode.executionTrace.latencyMs}ms</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-500">Tokens:</span>
                              <span className="text-white">{selectedNode.executionTrace.tokenUsage.totalTokens} tokens</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-neutral-500">Schema Valid:</span>
                              <span className={selectedNode.executionTrace.schemaValid ? 'text-white' : 'text-neutral-400'}>
                                {selectedNode.executionTrace.schemaValid ? 'PASSED (Zero Schema Drift)' : 'FAILED'}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="text-neutral-500 italic">No execution trace recorded.</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-neutral-500 text-xs font-mono">
                  Select a DAG node from the topology map to inspect its isolated state.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-neutral-950 border border-neutral-800 rounded-lg p-8">
          <Layers className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No Active DAG Plan Generated</h3>
          <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1 mb-4 font-mono">
            Input a mission objective and click "Deconstruct Objective to DAG" to initialize the L1 CEO Orchestrator planning engine.
          </p>
        </div>
      )}
    </div>
  );
};
