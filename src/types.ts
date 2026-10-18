export type SovereignIdentityAnchor = string;

export type UserRole = 'SovereignRootAdmin' | 'Auditor' | 'Guest' | 'Unauthorized';

export interface OIDCSession {
  identityAnchor: SovereignIdentityAnchor;
  token: string;
  isVerified: boolean;
  issuedAt: string;
  expiresAt: string;
  signatureHash: string;
  role: UserRole;
  ipAddress: string;
}

export type AgentDomainType = 
  | 'CodeSynthesizer'
  | 'SecurityAuditor'
  | 'DataExtractor'
  | 'ApiIntegrator'
  | 'ReasoningAnalyst';

export type DAGNodeStatus = 
  | 'pending'
  | 'running'
  | 'completed'
  | 'failed'
  | 'skipped'
  | 'arbitrating';

export interface EphemeralScratchpad {
  agentId: string;
  stepNumber: number;
  internalHypothesis: string;
  deductions: string[];
  toolPayloads: Record<string, any>[];
  intermediateOutput: string;
  confidenceScore: number;
}

export interface ToolInvocation {
  toolName: string;
  inputPayload: Record<string, any>;
  outputPayload: Record<string, any>;
  durationMs: number;
  status: 'success' | 'error';
}

export interface StandardizedExecutionTrace {
  traceId: string;
  timestamp: string;
  nodeId: string;
  agentType: AgentDomainType;
  inputState: Record<string, any>;
  scratchpad: EphemeralScratchpad;
  toolInvocations: ToolInvocation[];
  rawOutput: string;
  structuredPayload?: Record<string, any>;
  schemaValid: boolean;
  validationErrors?: string[];
  latencyMs: number;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostUsd: number;
  };
  evaluation?: CriticEvaluation;
}

export interface DAGTaskNode {
  id: string;
  title: string;
  description: string;
  agentType: AgentDomainType;
  dependencies: string[]; // Node IDs that must complete first
  inputs: Record<string, any>;
  expectedOutputSchema: string; // JSON Schema or Contract description
  tokenBudget: number;
  latencyBudgetMs: number;
  status: DAGNodeStatus;
  resultPayload?: Record<string, any>;
  rawOutput?: string;
  executionTrace?: StandardizedExecutionTrace;
  error?: string;
  retryCount: number;
  depth: number;
}

export interface DAGSessionGraph {
  sessionId: string;
  objective: string;
  createdAt: string;
  completedAt?: string;
  status: 'planning' | 'executing' | 'completed' | 'failed' | 'paused' | 'frozen_by_killswitch';
  nodes: DAGTaskNode[];
  executionOrder: string[][]; // Topological parallel execution tiers
  circuitBreakers: {
    maxRecursionLimit: number;
    currentRecursionDepth: number;
    tokenBudgetCap: number;
    tokensConsumed: number;
    timeBudgetMs: number;
    timeElapsedMs: number;
    isBudgetExceeded: boolean;
  };
  globalState: Record<string, any>;
  conflictArbitrationLog?: {
    conflictNodeId: string;
    conflictingOutputs: { agent: string; output: string }[];
    arbitrationRuling: string;
    resolvedOutput: string;
  }[];
}

export interface CriticEvaluation {
  evaluationId: string;
  traceId: string;
  timestamp: string;
  scores: {
    accuracy: number;           // 0 - 100
    compliance: number;         // 0 - 100
    reasoningDepth: number;     // 0 - 100
    instructionFidelity: number;// 0 - 100
    compositeScore: number;     // 0 - 100
  };
  verdict: 'PASSED' | 'FAILED' | 'FLAGGED_FOR_MUTATION';
  failureCategory?: FailureTaxonomyType;
  critiqueNotes: string;
  recommendedNegativeConstraints: string[];
  suggestedPromptPatch?: string;
}

export type FailureTaxonomyType = 
  | 'Hallucination'
  | 'SchemaContractViolation'
  | 'InefficientReasoningPath'
  | 'ConstraintDrift'
  | 'ContextPollution'
  | 'ExcessiveLatency';

export interface PromptRegistryItem {
  id: string;
  version: string;
  gitCommitHash: string;
  agentType: AgentDomainType | 'CEO_Orchestrator' | 'Evaluator_Critic';
  systemPromptText: string;
  negativeConstraints: string[];
  fewShotExemplarIds: string[];
  status: 'Champion' | 'Challenger' | 'Archived';
  metrics: {
    avgAccuracyScore: number;
    avgLatencyMs: number;
    totalRuns: number;
    passRatePercent: number;
  };
  author: string;
  createdAt: string;
}

export interface RegressionTestCase {
  id: string;
  title: string;
  category: 'EdgeCase' | 'HistoricalFailure' | 'SchemaStrictness' | 'Adversarial';
  inputObjective: string;
  expectedKeywords: string[];
  bannedPatterns: string[];
  targetLatencyMaxMs: number;
}

export interface ChampionChallengerBattle {
  id: string;
  timestamp: string;
  agentType: AgentDomainType;
  championPromptId: string;
  challengerPromptId: string;
  testCases: {
    testCaseId: string;
    testTitle: string;
    championScore: number;
    challengerScore: number;
    championLatencyMs: number;
    challengerLatencyMs: number;
    championPassed: boolean;
    challengerPassed: boolean;
  }[];
  summary: {
    championAvgScore: number;
    challengerAvgScore: number;
    championAvgLatency: number;
    challengerAvgLatency: number;
    promotedToProduction: boolean;
    promotionRationale: string;
  };
}

export interface VectorEpisodicMemoryItem {
  id: string;
  title: string;
  summary: string;
  embeddingPreview: number[];
  similarityScore?: number;
  fullTrace: string;
  tags: string[];
  qualityScore: number;
  timestamp: string;
}

export interface SemanticGraphEntity {
  id: string;
  label: string;
  type: 'Agent' | 'SchemaContract' | 'Policy' | 'Tool' | 'SecurityRule';
  description: string;
  relations: { targetId: string; relationType: string }[];
}

export interface GlobalTelemetry {
  systemStatus: 'NOMINAL' | 'EVALUATING' | 'MUTATING' | 'FROZEN_KILLSWITCH' | 'BUDGET_THROTTLED';
  activeNodesCount: number;
  totalTracesLogged: number;
  totalTokensSpent: number;
  totalCostUsd: number;
  avgSystemLatencyMs: number;
  evaluatorAccuracyAverage: number;
  activePromptsCount: number;
  killSwitchEngaged: boolean;
  killSwitchEngagedAt?: string;
  killSwitchEngagedBy?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  ipAddress: string;
  status: 'ALLOWED' | 'BLOCKED_403' | 'OVERRIDDEN' | 'EMERGENCY_TRIGGERED';
  details: string;
  signatureHash: string;
}

export interface EmailCadenceStep {
  stepNumber: number;
  delayDays: number;
  label: string;
  scheduledFor: string;
  status: 'Scheduled' | 'Sent' | 'Skipped';
  subjectTemplate: string;
  bodyTemplate: string;
}

export interface CandidateParsedProfile {
  fullName: string;
  email: string;
  phone?: string;
  technicalSkills: string[];
  experienceYears: number;
  suggestedRoles: string[];
  executiveSummary: string;
  keyAchievements: string[];
  parsedAt: string;
}

export interface JobLead {
  id: string;
  recruiterName: string;
  companyOrChannel: string;
  platform: 'YouTube' | 'Instagram';
  profileUrl: string;
  contactEmail: string;
  roleOrTopic: string;
  videoOrPostTitle: string;
  scrapedAt: string;
  applicationStatus: 'Drafted' | 'Sent' | 'Responded';
  emailStatus: 'Pending' | 'No Response' | 'Initial Interview' | 'Rejected' | 'Offer';
  matchScore: number;
  matchedSkills: string[];
  notes?: string;
  generatedCoverEmail?: string;
  generatedSubject?: string;
  sentAt?: string;
  dispatchProofId?: string;
  cadenceSteps?: EmailCadenceStep[];
  followUpDueAt?: string;
  lastUpdated: string;
}

export interface MatchingBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  target: number;
  unlockedAt?: string;
}

export interface ResumeProfile {
  fileName: string;
  extractedText: string;
  skills: string[];
  experienceSummary: string;
  uploadedAt: string;
}

export * from './types/vault';
