export type CareerOpsMode =
  | 'eval'
  | 'tailor'
  | 'apply'
  | 'contacto'
  | 'interview-prep'
  | 'offer-prep'
  | 'negotiate'
  | 'audit'
  | 'debrief'
  | 're-eval'
  | 'network'
  | 'benchmark'
  | 'scan'
  | 'profile-sync';

// 1. Candidate Ground Truth Data Contract (cv-facts.json)
export interface CandidateCVFacts {
  basics: {
    fullName: string;
    email: string;
    phone?: string;
    location: string;
    visaStatus: string;
    clearanceLevel?: string;
    github?: string;
    linkedin?: string;
    portfolio?: string;
  };
  roles: {
    company: string;
    role: string;
    startDate: string;
    endDate: string;
    location: string;
    metrics: string[];
    technicalAccomplishments: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    startYear: string;
    endYear: string;
  }[];
  skills_allowlist: string[];
  forbidden_claims: string[];
  verified_achievements: {
    id: string;
    title: string;
    metric: string;
    context: string;
    technologies: string[];
  }[];
}

// 2. Candidate Search & Preference Config (profile.yml)
export interface CandidateProfileConfig {
  seniority_levels: string[];
  target_roles: string[];
  compensation: {
    minimum_base_usd: number;
    target_base_usd: number;
    minimum_total_usd: number;
    currency: string;
  };
  locations: {
    primary: string;
    remote_ok: boolean;
    relocation_ok: boolean;
    acceptable_timezones: string[];
  };
  red_flags: {
    banned_technologies: string[];
    banned_keywords: string[];
    companies_blacklist: string[];
  };
}

// 3. Candidate Voice DNA & Tone Rules (voice-dna.md)
export interface VoiceDNARules {
  banned_buzzwords: string[];
  structural_rule: string;
  tone: 'direct' | 'technical' | 'visionary' | 'executive';
  custom_guidelines: string[];
}

// Fast-Fail & 5-Dimensional Scoring
export interface FastFailGatekeeperResult {
  passed: boolean;
  disqualificationReason?: string;
  visaMatch: boolean;
  locationMatch: boolean;
  salaryMatch: boolean;
  blacklistCheck: boolean;
}

export interface DimensionScore {
  name: string;
  score: number; // 0.0 to 5.0
  weight: number; // 0.0 to 1.0 (sums to 1.0)
  weightedScore: number;
  reasoning: string;
  strengths: string[];
  gaps: string[];
}

export type FitVerdict = 'GREENLIGHT' | 'CONSIDER' | 'REJECT' | 'DISQUALIFIED';

export interface CareerOpsScoringResult {
  fastFail: FastFailGatekeeperResult;
  globalScore: number; // 0.0 to 5.0
  verdict: FitVerdict;
  dimensions: {
    technicalStackFit: DimensionScore;
    domainContextFit: DimensionScore;
    seniorityScopeFit: DimensionScore;
    trajectoryArchetype: DimensionScore;
    compLogisticsFit: DimensionScore;
  };
}

// Diagnostic Blocks A through H
export interface RequirementEvidenceItem {
  requirement: string;
  category: 'Must-Have' | 'Nice-To-Have';
  status: 'EXACT_MATCH' | 'PARTIAL_MATCH' | 'GAP';
  candidateEvidence: string;
  confidence: number;
}

export interface CriticalGapItem {
  gapDescription: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  truthfulMitigation: string;
  transferableProof: string;
}

export interface TailoringAngle {
  rank: number;
  initiativeTitle: string;
  relevanceToJD: string;
  highlightedMetrics: string[];
}

export interface DiagnosticBlocks {
  blockA_ExecutiveSummary: {
    overview: string;
    keyVerdictRationale: string;
    recommendedAction: string;
  };
  blockB_RequirementsMatrix: RequirementEvidenceItem[];
  blockC_CriticalGaps: CriticalGapItem[];
  blockD_TailoringAngles: TailoringAngle[];
  blockE_JDRedFlags: {
    culturalWarnings: string[];
    scopeCreepRisks: string[];
    techDebtIndicators: string[];
  };
  blockF_PreApplyStrategicHooks: string[];
  blockG_RecruiterOutreachAngle: {
    hook: string;
    personalizedPitch: string;
    suggestedSubject: string;
  };
  blockH_InterviewDefenseStrategy: {
    anticipatedToughQuestion: string;
    suggestedDefense: string;
    relevantMetricProof: string;
  }[];
}

// STAR+R Story Structure
export interface STARRStory {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  reflection: string;
  verifiedMetrics: string[];
  tags: string[];
}

// AST Verification & Hallucination Audit Result
export interface ASTVerificationResult {
  isCompliant: boolean;
  unauthorizedSkillsFound: string[];
  forbiddenClaimsFound: string[];
  bannedWordsDetected: string[];
  voiceDNAScore: number; // 0-100
  allowedSkillsCovered: string[];
  auditTimestamp: string;
  details: string;
}

// Unified Execution Response
export interface CareerOpsExecutionResponse {
  mode: CareerOpsMode;
  executionId: string;
  timestamp: string;
  jdFingerprint: string;
  jobTitle?: string;
  companyName?: string;
  scoring?: CareerOpsScoringResult;
  diagnostics?: DiagnosticBlocks;
  tailoredCVMarkdown?: string;
  applicationAnswers?: {
    question: string;
    answer: string;
    wordCount: number;
    metricsCited: string[];
  }[];
  coldOutreachDraft?: {
    subject: string;
    body3Sentences: string;
    technicalHook: string;
    targetRecipient: string;
  };
  interviewPrep?: {
    architecturalDeepDives: {
      topic: string;
      question: string;
      frameworkGuide: string;
    }[];
    starrStories: STARRStory[];
  };
  offerAnalysis?: {
    offerScore: number;
    baseSalaryAnalysis: string;
    equityValuationRationale: string;
    bonusTermsAssessment: string;
    marketPercentile: string;
    redFlagsInTerms: string[];
  };
  negotiationPlaybook?: {
    targetCounterAmountUsd: number;
    leveragePillars: string[];
    emailScript: string;
    liveCallTalkingPoints: string[];
  };
  benchmarks?: {
    role: string;
    location: string;
    p25Usd: number;
    p50Usd: number;
    p75Usd: number;
    p90Usd: number;
    equityGuidance: string;
  };
  verification: ASTVerificationResult;
}
