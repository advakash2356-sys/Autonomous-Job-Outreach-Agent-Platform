import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  TrendingUp,
  GitCommit,
  ShieldCheck,
  Zap,
  ArrowRight,
  Flame,
  Layers,
  ChevronRight,
  Check,
  Scale
} from 'lucide-react';
import {
  CriticEvaluation,
  PromptRegistryItem,
  ChampionChallengerBattle,
  FailureTaxonomyType,
  AgentDomainType
} from '../types';

interface EvaluatorStudioProps {
  onAuditTrace: (tracePayload: any) => Promise<CriticEvaluation>;
  onMutatePrompt: (agentType: AgentDomainType, feedback: string) => Promise<any>;
  onRunRegression: (champId: string, chalId: string, agentType: AgentDomainType) => Promise<ChampionChallengerBattle>;
  onPromotePrompt: (challengerId: string) => Promise<void>;
  promptRegistry: PromptRegistryItem[];
}

const FAILURE_TAXONOMY_STATS = [
  { type: 'Hallucination' as FailureTaxonomyType, count: 2, color: 'bg-neutral-900 text-neutral-200 border-neutral-800', desc: 'Unverified assertions not grounded in context' },
  { type: 'SchemaContractViolation' as FailureTaxonomyType, count: 1, color: 'bg-neutral-900 text-neutral-200 border-neutral-800', desc: 'Dropped required fields or invalid typing' },
  { type: 'InefficientReasoningPath' as FailureTaxonomyType, count: 4, color: 'bg-neutral-900 text-neutral-200 border-neutral-800', desc: 'Redundant scratchpad hops increasing latency' },
  { type: 'ConstraintDrift' as FailureTaxonomyType, count: 2, color: 'bg-neutral-900 text-neutral-200 border-neutral-800', desc: 'Negative constraint violation across turns' },
  { type: 'ContextPollution' as FailureTaxonomyType, count: 0, color: 'bg-neutral-900 text-neutral-200 border-neutral-800', desc: 'Cross-worker scratchpad leakage (Mitigated)' },
  { type: 'ExcessiveLatency' as FailureTaxonomyType, count: 3, color: 'bg-neutral-900 text-neutral-200 border-neutral-800', desc: 'Exceeded per-node budget threshold' }
];

export const EvaluatorStudio: React.FC<EvaluatorStudioProps> = ({
  onAuditTrace,
  onMutatePrompt,
  onRunRegression,
  onPromotePrompt,
  promptRegistry
}) => {
  const [selectedAgentType, setSelectedAgentType] = useState<AgentDomainType>('CodeSynthesizer');
  const [mutationFeedback, setMutationFeedback] = useState(
    'Enforce tighter mathematical guarantees, minimize reasoning hops, and reject any payload with schema drift.'
  );
  const [isMutating, setIsMutating] = useState(false);
  const [isBattling, setIsBattling] = useState(false);
  const [latestEvaluation, setLatestEvaluation] = useState<CriticEvaluation | null>(null);
  const [latestBattle, setLatestBattle] = useState<ChampionChallengerBattle | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const championPrompt = promptRegistry.find(p => p.agentType === selectedAgentType && p.status === 'Champion') || promptRegistry[0];
  const challengerPrompt = promptRegistry.find(p => p.agentType === selectedAgentType && p.status === 'Challenger');

  const handleAuditSampleTrace = async () => {
    setIsAuditing(true);
    try {
      const sampleTrace = {
        traceId: `trace-audit-sample-${Date.now()}`,
        timestamp: new Date().toISOString(),
        agentType: selectedAgentType,
        inputState: { task: `Generate production unit for ${selectedAgentType}` },
        scratchpad: {
          agentId: `${selectedAgentType}-Unit`,
          internalHypothesis: 'Verifying mathematical convergence and schema contract conformance.',
          deductions: ['Context window isolated', 'Schema contract validated', 'Zero-trust signature verified'],
          confidenceScore: 96
        },
        rawOutput: `[${selectedAgentType}] Completed algorithmic execution with zero schema violations.`,
        latencyMs: 512,
        tokenUsage: { totalTokens: 380 }
      };

      const result = await onAuditTrace(sampleTrace);
      setLatestEvaluation(result);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleTriggerMutation = async () => {
    setIsMutating(true);
    try {
      await onMutatePrompt(selectedAgentType, mutationFeedback);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsMutating(false);
    }
  };

  const handleRunBattle = async () => {
    if (!championPrompt) return;
    setIsBattling(true);
    try {
      const chalId = challengerPrompt ? challengerPrompt.id : 'prompt-challenger-synthetic';
      const battle = await onRunRegression(championPrompt.id, chalId, selectedAgentType);
      setLatestBattle(battle);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsBattling(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-5">
        <div className="flex items-center space-x-2 text-neutral-400 text-xs font-mono mb-1">
          <Sparkles className="w-4 h-4" />
          <span>RECURSIVE SELF-IMPROVEMENT & META-CRITIC</span>
        </div>
        <h2 className="text-base font-semibold text-white">
          L3: Evaluator-Optimizer Engine & Prompt Teleprompter
        </h2>
        <p className="text-xs text-neutral-400 max-w-3xl mt-1">
          Automated trace auditing via LLM-as-a-Judge, Failure Taxonomy tracking, DSPy-style prompt mutation, and Champion vs Challenger regression promotion gates.
        </p>
      </div>

      {/* Failure Taxonomy Heatmap */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-5">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
            <Flame className="w-4 h-4 text-neutral-400" />
            <span>Prioritized Failure Taxonomy Catalog</span>
          </h3>
          <span className="text-xs font-mono text-neutral-400">Total Analyzed Traces: 142</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {FAILURE_TAXONOMY_STATS.map((item) => (
            <div key={item.type} className={`p-3 rounded-lg border ${item.color} space-y-1`}>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold font-mono text-white">{item.count}</span>
                <span className="text-[10px] font-mono text-neutral-400">Taxonomy</span>
              </div>
              <h4 className="text-xs font-semibold text-white line-clamp-1">{item.type}</h4>
              <p className="text-[10px] text-neutral-400 line-clamp-2">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Target Agent Selector for Mutation & Optimization */}
      <div className="flex items-center space-x-3 bg-neutral-950 p-3 rounded-lg border border-neutral-800">
        <span className="text-xs font-mono text-neutral-400">Target Agent:</span>
        {(['CodeSynthesizer', 'SecurityAuditor', 'DataExtractor', 'ApiIntegrator', 'ReasoningAnalyst'] as AgentDomainType[]).map((agent) => (
          <button
            key={agent}
            onClick={() => setSelectedAgentType(agent)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
              selectedAgentType === agent
                ? 'bg-white text-black font-semibold'
                : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
            }`}
          >
            {agent}
          </button>
        ))}
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LLM-as-a-Judge Trace Audit (Left 5 Cols) */}
        <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Scale className="w-4 h-4 text-neutral-400" />
              <span>LLM-as-a-Judge Audit Scorecard</span>
            </h3>
            <button
              id="btn-audit-sample-trace"
              disabled={isAuditing}
              onClick={handleAuditSampleTrace}
              className="px-3 py-1.5 rounded bg-white hover:bg-neutral-200 disabled:opacity-50 text-black text-xs font-mono font-semibold flex items-center space-x-1.5 transition-colors border border-white"
            >
              {isAuditing ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Audit Live Trace</span>
                </>
              )}
            </button>
          </div>

          {latestEvaluation ? (
            <div className="space-y-4 text-xs font-mono">
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-neutral-400">Verdict:</span>{' '}
                  <span className={latestEvaluation.verdict === 'PASSED' ? 'text-white font-bold' : 'text-neutral-400 font-bold'}>
                    {latestEvaluation.verdict}
                  </span>
                </div>
                <div className="text-lg font-bold text-white">
                  {latestEvaluation.scores.compositeScore} / 100
                </div>
              </div>

              {/* 4 Rubric Bars */}
              <div className="space-y-2">
                {[
                  { label: 'Accuracy', val: latestEvaluation.scores.accuracy },
                  { label: 'Compliance (Zero-Trust)', val: latestEvaluation.scores.compliance },
                  { label: 'Reasoning Depth', val: latestEvaluation.scores.reasoningDepth },
                  { label: 'Instruction Fidelity', val: latestEvaluation.scores.instructionFidelity }
                ].map((r) => (
                  <div key={r.label} className="space-y-1">
                    <div className="flex justify-between text-neutral-300">
                      <span>{r.label}</span>
                      <span className="font-bold text-white">{r.val}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-900 rounded overflow-hidden">
                      <div className="h-full bg-white" style={{ width: `${r.val}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-neutral-900 p-3 rounded-lg border border-neutral-800 space-y-2">
                <span className="text-neutral-400 font-bold">Critic Review:</span>
                <p className="text-neutral-300 leading-relaxed">{latestEvaluation.critiqueNotes}</p>
                <div className="pt-2 border-t border-neutral-800 text-neutral-200">
                  <span className="text-neutral-400">Suggested Patch:</span> {latestEvaluation.suggestedPromptPatch}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-neutral-500 text-xs font-mono">
              Click "Audit Live Trace" to execute the L3 Meta-Critic against standardized execution metrics.
            </div>
          )}
        </div>

        {/* Mutation Engine & Champion vs Challenger Arena (Right 7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Automated Mutation Card */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-neutral-400" />
                  <span>DSPy Prompt Mutation & Teleprompter</span>
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Mutates Champion prompt to create Challenger candidate with refined negative constraints.
                </p>
              </div>

              <button
                id="btn-mutate-prompt"
                disabled={isMutating}
                onClick={handleTriggerMutation}
                className="px-3.5 py-2 rounded bg-white hover:bg-neutral-200 disabled:opacity-50 text-black text-xs font-mono font-semibold flex items-center space-x-1.5 transition-colors border border-white"
              >
                {isMutating ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Challenger...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Mutate Prompt</span>
                  </>
                )}
              </button>
            </div>

            <div>
              <label className="text-xs font-mono text-neutral-400">Teleprompter Optimization Guidance:</label>
              <textarea
                rows={2}
                value={mutationFeedback}
                onChange={(e) => setMutationFeedback(e.target.value)}
                className="w-full mt-1 bg-neutral-900 border border-neutral-800 rounded p-2.5 text-xs text-white font-mono focus:outline-none focus:border-neutral-500"
              />
            </div>
          </div>

          {/* Champion vs Challenger Arena Card */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                  <Award className="w-4 h-4 text-neutral-400" />
                  <span>Champion vs Challenger Regression Battle Arena</span>
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Runs offline regression test suite on synthetic edge cases before production promotion.
                </p>
              </div>

              <button
                id="btn-run-regression-battle"
                disabled={isBattling}
                onClick={handleRunBattle}
                className="px-4 py-2 rounded bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-mono font-semibold flex items-center space-x-1.5 border border-neutral-700 transition-colors"
              >
                {isBattling ? (
                  <>
                    <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                    <span>Running Test Suite...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-3.5 h-3.5" />
                    <span>Run Battle Suite</span>
                  </>
                )}
              </button>
            </div>

            {/* Current Candidates Banner */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-white">
                  <span className="font-bold">Incumbent Champion</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-950 text-neutral-300 border border-neutral-800">
                    {championPrompt?.version || 'v1.0.0'}
                  </span>
                </div>
                <div className="text-neutral-400 text-[11px]">Score: {championPrompt?.metrics?.avgAccuracyScore || 94.5}%</div>
                <div className="text-neutral-400 text-[11px]">Latency: {championPrompt?.metrics?.avgLatencyMs || 580}ms</div>
              </div>

              <div className="p-3 rounded-lg bg-neutral-900 border border-neutral-800 space-y-1">
                <div className="flex items-center justify-between text-white">
                  <span className="font-bold">Candidate Challenger</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-950 text-neutral-300 border border-neutral-800">
                    {challengerPrompt?.version || 'v1.1.0-mutated'}
                  </span>
                </div>
                <div className="text-neutral-400 text-[11px]">Score: {challengerPrompt?.metrics?.avgAccuracyScore || 97.2}%</div>
                <div className="text-neutral-400 text-[11px]">Latency: {challengerPrompt?.metrics?.avgLatencyMs || 490}ms</div>
              </div>
            </div>

            {/* Battle Results */}
            {latestBattle && (
              <div className="space-y-3 bg-neutral-900 p-4 rounded-lg border border-neutral-800 text-xs font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                  <span className="text-white font-bold">Regression Test Results:</span>
                  <span className={latestBattle.summary.promotedToProduction ? 'text-white font-bold' : 'text-neutral-400 font-bold'}>
                    {latestBattle.summary.promotedToProduction ? 'CHALLENGER SURPASSED THRESHOLD' : 'CHAMPION RETAINED'}
                  </span>
                </div>

                <div className="space-y-2">
                  {latestBattle.testCases.map((tc) => (
                    <div key={tc.testCaseId} className="p-2 rounded bg-neutral-950 border border-neutral-800 flex items-center justify-between">
                      <div>
                        <span className="text-neutral-200">{tc.testTitle}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px]">
                        <span className="text-neutral-400">Champ: {tc.championScore}% ({tc.championLatencyMs}ms)</span>
                        <span className="text-white font-bold">Chal: {tc.challengerScore}% ({tc.challengerLatencyMs}ms)</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-neutral-400 text-[11px] pt-1">
                  Rationale: {latestBattle.summary.promotionRationale}
                </div>

                {challengerPrompt && latestBattle.summary.promotedToProduction && (
                  <div className="pt-2">
                    <button
                      id="btn-promote-challenger"
                      onClick={() => onPromotePrompt(challengerPrompt.id)}
                      className="w-full py-2.5 rounded bg-white hover:bg-neutral-200 text-black font-bold text-xs flex items-center justify-center space-x-2 transition-colors border border-white"
                    >
                      <Check className="w-4 h-4" />
                      <span>Promote Challenger to Production Champion in System Registry</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
