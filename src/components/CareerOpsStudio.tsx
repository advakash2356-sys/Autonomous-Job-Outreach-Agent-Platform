import React, { useState, useEffect } from 'react';
import {
  CandidateCVFacts,
  CandidateProfileConfig,
  VoiceDNARules,
  CareerOpsMode,
  CareerOpsExecutionResponse,
  CareerOpsScoringResult,
  DiagnosticBlocks,
  STARRStory,
  ASTVerificationResult
} from '../types/careerOps';
import {
  DEFAULT_CV_FACTS,
  DEFAULT_PROFILE_CONFIG,
  DEFAULT_VOICE_DNA,
  SAMPLE_JOB_DESCRIPTIONS
} from '../utils/careerOpsData';
import { CareerOpsVerifier } from '../utils/careerOpsVerifier';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  Sliders,
  Send,
  Copy,
  Download,
  Fingerprint,
  RefreshCw,
  Database,
  Target,
  BarChart3,
  MessageSquare,
  Award,
  DollarSign,
  TrendingUp,
  Cpu,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Info
} from 'lucide-react';

interface CareerOpsStudioProps {
  onNotify: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const CareerOpsStudio: React.FC<CareerOpsStudioProps> = ({ onNotify }) => {
  const [selectedMode, setSelectedMode] = useState<CareerOpsMode>('eval');
  const [jobTitle, setJobTitle] = useState('Staff AI Systems Architect');
  const [companyName, setCompanyName] = useState('Aetheria Intelligence');
  const [rawJD, setRawJD] = useState(SAMPLE_JOB_DESCRIPTIONS[0].text);
  const [jdFingerprint, setJdFingerprint] = useState('');
  const [customQuestion, setCustomQuestion] = useState('');
  const [customQuestionsList, setCustomQuestionsList] = useState<string[]>([
    "Why are you the ideal candidate for this role?",
    "Describe a complex distributed systems challenge you solved."
  ]);

  // Contracts State
  const [cvFacts, setCvFacts] = useState<CandidateCVFacts>(DEFAULT_CV_FACTS);
  const [profileConfig, setProfileConfig] = useState<CandidateProfileConfig>(DEFAULT_PROFILE_CONFIG);
  const [voiceDNA, setVoiceDNA] = useState<VoiceDNARules>(DEFAULT_VOICE_DNA);
  const [showContractsModal, setShowContractsModal] = useState(false);
  const [activeContractTab, setActiveContractTab] = useState<'facts' | 'profile' | 'voice'>('facts');
  const [contractsJsonText, setContractsJsonText] = useState('');

  // Execution & Results State
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<CareerOpsExecutionResponse | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'scoring' | 'diagnostics' | 'resume' | 'starr' | 'outreach' | 'offer' | 'verifier'>('scoring');

  // Load contracts & fingerprint on mount
  useEffect(() => {
    fetchContracts();
    updateFingerprint(rawJD);
  }, []);

  const updateFingerprint = (text: string) => {
    const fp = CareerOpsVerifier.computeJDFingerprint(text);
    setJdFingerprint(fp);
  };

  const fetchContracts = async () => {
    try {
      const res = await fetch('/api/careerops/contracts');
      if (res.ok) {
        const data = await res.json();
        if (data.cvFacts) setCvFacts(data.cvFacts);
        if (data.profileConfig) setProfileConfig(data.profileConfig);
        if (data.voiceDNA) setVoiceDNA(data.voiceDNA);
      }
    } catch (e) {
      console.error('Failed to fetch contracts', e);
    }
  };

  const handleSelectPreset = (preset: typeof SAMPLE_JOB_DESCRIPTIONS[0]) => {
    setJobTitle(preset.title);
    setCompanyName(preset.company);
    setRawJD(preset.text);
    updateFingerprint(preset.text);
    onNotify(`Loaded preset: ${preset.title} at ${preset.company}`, 'info');
  };

  const handleExecuteMode = async (modeToRun?: CareerOpsMode) => {
    const targetMode = modeToRun || selectedMode;
    setIsExecuting(true);
    try {
      const res = await fetch('/api/careerops/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: targetMode,
          rawJD,
          jobTitle,
          companyName,
          customQuestions: customQuestionsList
        })
      });

      if (!res.ok) throw new Error('Execution failed');

      const data: CareerOpsExecutionResponse = await res.json();
      setResult(data);

      // Automatically switch to the most relevant view tab
      if (targetMode === 'eval' || targetMode === 're-eval' || targetMode === 'scan') {
        setActiveResultTab('scoring');
      } else if (targetMode === 'tailor') {
        setActiveResultTab('resume');
      } else if (targetMode === 'interview-prep') {
        setActiveResultTab('starr');
      } else if (targetMode === 'contacto' || targetMode === 'apply' || targetMode === 'network') {
        setActiveResultTab('outreach');
      } else if (targetMode === 'offer-prep' || targetMode === 'negotiate' || targetMode === 'benchmark') {
        setActiveResultTab('offer');
      } else if (targetMode === 'audit') {
        setActiveResultTab('verifier');
      }

      onNotify(`Mode '${targetMode}' executed. AST Verification: ${data.verification.isCompliant ? '100% Compliant' : 'Warnings Detected'}`, data.verification.isCompliant ? 'success' : 'info');
    } catch (e: any) {
      onNotify(`CareerOps Error: ${e.message}`, 'error');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSaveContracts = async () => {
    try {
      let updatedFacts = cvFacts;
      let updatedProfile = profileConfig;
      let updatedVoice = voiceDNA;

      if (activeContractTab === 'facts') {
        updatedFacts = JSON.parse(contractsJsonText);
        setCvFacts(updatedFacts);
      } else if (activeContractTab === 'profile') {
        updatedProfile = JSON.parse(contractsJsonText);
        setProfileConfig(updatedProfile);
      } else if (activeContractTab === 'voice') {
        updatedVoice = JSON.parse(contractsJsonText);
        setVoiceDNA(updatedVoice);
      }

      const res = await fetch('/api/careerops/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cvFacts: updatedFacts,
          profileConfig: updatedProfile,
          voiceDNA: updatedVoice
        })
      });

      if (res.ok) {
        onNotify('Candidate Ground Truth Contract successfully saved & synchronized!', 'success');
        setShowContractsModal(false);
      }
    } catch (e: any) {
      onNotify(`Invalid JSON Syntax: ${e.message}`, 'error');
    }
  };

  const openContractsEditor = (tab: 'facts' | 'profile' | 'voice') => {
    setActiveContractTab(tab);
    if (tab === 'facts') setContractsJsonText(JSON.stringify(cvFacts, null, 2));
    if (tab === 'profile') setContractsJsonText(JSON.stringify(profileConfig, null, 2));
    if (tab === 'voice') setContractsJsonText(JSON.stringify(voiceDNA, null, 2));
    setShowContractsModal(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    onNotify(`Copied ${label} to clipboard!`, 'success');
  };

  const downloadMarkdownFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify(`Downloaded ${filename}`, 'success');
  };

  const modesList: { id: CareerOpsMode; label: string; icon: any; category: string; description: string }[] = [
    { id: 'eval', label: 'Evaluate & Score', icon: BarChart3, category: 'Strategy & Fit', description: 'Fast-fail gatekeeper + 5-dimensional weighted scoring (0-5.0) & Blocks A-H.' },
    { id: 'tailor', label: 'Tailor ATS CV', icon: FileText, category: 'Artifacts', description: 'Synthesize fact-whitelisted ATS Markdown CV with Google X-Y-Z formula.' },
    { id: 'apply', label: 'Application Q&A', icon: MessageSquare, category: 'Artifacts', description: 'Generate high-converting 150-250 word answers citing verifiable metrics.' },
    { id: 'contacto', label: 'Contacto 3-Sentence', icon: Send, category: 'Artifacts', description: '3-sentence high-impact cold outreach pitch to Hiring Manager.' },
    { id: 'interview-prep', label: 'STAR+R Stories', icon: Award, category: 'Interview & Offer', description: 'Top 5 STAR+R interview stories and technical architectural defense deep dives.' },
    { id: 'offer-prep', label: 'Offer Evaluation', icon: DollarSign, category: 'Interview & Offer', description: 'Equity valuation, base market percentiles, and terms assessment.' },
    { id: 'negotiate', label: 'Negotiate Counter', icon: TrendingUp, category: 'Interview & Offer', description: 'Target counter-offer figure, leverage pillars, and exact script.' },
    { id: 'audit', label: 'AST Hallucination Audit', icon: ShieldCheck, category: 'Governance', description: 'Strict AST whitelist scanner checking skills, forbidden claims, and Voice DNA.' },
    { id: 're-eval', label: 'Re-Evaluate Scope', icon: RefreshCw, category: 'Strategy & Fit', description: 'Recalculate match score and gap mitigations after role updates.' },
    { id: 'benchmark', label: 'Market Benchmark', icon: Target, category: 'Strategy & Fit', description: 'P25, P50, P75, P90 compensation percentiles & equity guidance.' },
    { id: 'scan', label: 'JD Fingerprint Scan', icon: Fingerprint, category: 'Strategy & Fit', description: 'Strip boilerplate and compute 64-bit SimHash fingerprint.' },
    { id: 'network', label: 'Warm Intro Network', icon: ExternalLink, category: 'Artifacts', description: 'Alumni and connection warm intro request templates.' },
    { id: 'debrief', label: 'Interview Debrief', icon: BookOpen, category: 'Interview & Offer', description: 'Interview remediation plan and tailored follow-up thank-you note.' },
    { id: 'profile-sync', label: 'Profile Fact Sync', icon: Database, category: 'Governance', description: 'Append newly verified metrics into the candidate ground truth fact store.' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner: Engine Status & Ground Truth Contract Control */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded border border-neutral-700 bg-neutral-900 flex items-center justify-center text-white">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-semibold text-white tracking-tight">CareerOps Engine</h1>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-neutral-900 text-neutral-300 border border-neutral-700 rounded">
                  AST Verified
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-neutral-900 text-neutral-400 border border-neutral-800 rounded">
                  14 Operational Modes
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 font-mono">
                Candidate Ground Truth: <span className="text-white font-medium">{cvFacts.basics.fullName}</span> ({cvFacts.skills_allowlist.length} Whitelisted Skills • 5-Dim 0-5.0 Rubric)
              </p>
            </div>
          </div>

          {/* Data Contract Quick Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => openContractsEditor('facts')}
              className="px-3 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono border border-neutral-700 flex items-center space-x-1.5 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-neutral-400" />
              <span>cv-facts.json ({cvFacts.skills_allowlist.length})</span>
            </button>
            <button
              onClick={() => openContractsEditor('profile')}
              className="px-3 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono border border-neutral-700 flex items-center space-x-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-neutral-400" />
              <span>profile.yml (${profileConfig.compensation.minimum_base_usd / 1000}k+)</span>
            </button>
            <button
              onClick={() => openContractsEditor('voice')}
              className="px-3 py-1.5 rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono border border-neutral-700 flex items-center space-x-1.5 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
              <span>voice-dna.md (Anti-Slop)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Input Workspace & Operational Modes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Mode Selector & JD Inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* 1. Mode Selector */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-neutral-400" />
                <span>Select Execution Mode</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-500">14 Core Modes</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {modesList.map(m => {
                const Icon = m.icon;
                const isSelected = selectedMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMode(m.id)}
                    className={`p-2.5 rounded text-left transition-colors border flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white text-black border-white font-medium'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : 'text-neutral-400'}`} />
                      <span className="text-xs font-medium truncate">{m.label}</span>
                    </div>
                    <span className={`text-[10px] mt-1 line-clamp-1 font-mono ${isSelected ? 'text-neutral-700' : 'text-neutral-500'}`}>{m.category}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Target Job Details & Presets */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-neutral-400" />
                <span>Target Role & Presets</span>
              </span>
              <span className="text-[10px] font-mono text-neutral-400">Fingerprint: <span className="text-white font-bold">{jdFingerprint.slice(0, 8)}</span></span>
            </div>

            {/* Presets Bar */}
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_JOB_DESCRIPTIONS.map(preset => (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className="px-2.5 py-1 text-[11px] font-mono rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 transition-colors"
                >
                  {preset.company} ({preset.title.split(' ')[0]})
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Job Title</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neutral-500 font-sans"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-neutral-400 block mb-1">Company Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neutral-500 font-sans"
                />
              </div>
            </div>

            {/* Raw Job Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono text-neutral-400">Raw Job Description (Text)</label>
                <span className="text-[10px] font-mono text-neutral-500">{rawJD.length} chars</span>
              </div>
              <textarea
                value={rawJD}
                onChange={e => {
                  setRawJD(e.target.value);
                  updateFingerprint(e.target.value);
                }}
                rows={6}
                placeholder="Paste Job Description here..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-xs text-neutral-200 font-mono focus:outline-none focus:border-neutral-500 resize-y leading-relaxed"
              />
            </div>

            {/* Mode Specific Inputs (e.g. for apply mode) */}
            {selectedMode === 'apply' && (
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <label className="text-[11px] font-mono text-neutral-400 block">Custom Application Questions</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={e => setCustomQuestion(e.target.value)}
                    placeholder="Add specific question (e.g., Why this company?)"
                    className="flex-1 bg-neutral-900 border border-neutral-800 rounded px-2.5 py-1 text-xs text-neutral-200 focus:outline-none focus:border-neutral-500"
                  />
                  <button
                    onClick={() => {
                      if (customQuestion.trim()) {
                        setCustomQuestionsList([...customQuestionsList, customQuestion.trim()]);
                        setCustomQuestion('');
                      }
                    }}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded border border-neutral-700 font-mono"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {customQuestionsList.map((q, idx) => (
                    <div key={idx} className="flex items-center justify-between text-[11px] bg-neutral-900 px-2 py-1 rounded border border-neutral-800">
                      <span className="truncate text-neutral-300 font-mono">{q}</span>
                      <button
                        onClick={() => setCustomQuestionsList(customQuestionsList.filter((_, i) => i !== idx))}
                        className="text-neutral-400 hover:text-white ml-2 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={() => handleExecuteMode()}
              disabled={isExecuting}
              className={`w-full py-2.5 rounded font-mono font-medium text-xs flex items-center justify-center space-x-2 transition-colors border ${
                isExecuting
                  ? 'bg-neutral-800 text-neutral-400 border-neutral-700 cursor-not-allowed'
                  : 'bg-white hover:bg-neutral-200 text-black border-white font-semibold'
              }`}
            >
              {isExecuting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Mode '{selectedMode}' & Verifying AST...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute {modesList.find(m => m.id === selectedMode)?.label}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Execution Output Canvas (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Result Sub-Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between bg-neutral-950 border border-neutral-800 rounded-lg p-2 gap-1.5">
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setActiveResultTab('scoring')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-colors flex items-center space-x-1.5 border ${
                  activeResultTab === 'scoring'
                    ? 'bg-white text-black border-white font-semibold'
                    : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-neutral-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>5-Dim Fit ({result?.scoring?.globalScore?.toFixed(2) || '0.0'})</span>
              </button>

              <button
                onClick={() => setActiveResultTab('diagnostics')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-colors flex items-center space-x-1.5 border ${
                  activeResultTab === 'diagnostics'
                    ? 'bg-white text-black border-white font-semibold'
                    : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-neutral-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Blocks A-H</span>
              </button>

              <button
                onClick={() => setActiveResultTab('resume')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-colors flex items-center space-x-1.5 border ${
                  activeResultTab === 'resume'
                    ? 'bg-white text-black border-white font-semibold'
                    : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-neutral-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Tailored CV</span>
              </button>

              <button
                onClick={() => setActiveResultTab('starr')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-colors flex items-center space-x-1.5 border ${
                  activeResultTab === 'starr'
                    ? 'bg-white text-black border-white font-semibold'
                    : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>STAR+R Stories</span>
              </button>

              <button
                onClick={() => setActiveResultTab('outreach')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-colors flex items-center space-x-1.5 border ${
                  activeResultTab === 'outreach'
                    ? 'bg-white text-black border-white font-semibold'
                    : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>Outreach & Q&A</span>
              </button>

              <button
                onClick={() => setActiveResultTab('offer')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-colors flex items-center space-x-1.5 border ${
                  activeResultTab === 'offer'
                    ? 'bg-white text-black border-white font-semibold'
                    : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-neutral-900'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Comp & Offer</span>
              </button>

              <button
                onClick={() => setActiveResultTab('verifier')}
                className={`px-3 py-1.5 rounded text-xs font-mono transition-colors flex items-center space-x-1.5 border ${
                  activeResultTab === 'verifier'
                    ? 'bg-white text-black border-white font-semibold'
                    : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-neutral-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AST Audit ({result?.verification?.voiceDNAScore || 100}%)</span>
              </button>
            </div>

            {/* Quick 1-Click Initial Evaluator trigger if no result yet */}
            {!result && (
              <button
                onClick={() => handleExecuteMode('eval')}
                className="px-2.5 py-1 text-[11px] font-mono text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded transition-colors"
              >
                ▶ Run Match Score
              </button>
            )}
          </div>

          {/* Results Canvas Body */}
          <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-5 min-h-[500px]">
            {/* View 1: 5-Dimensional Fit & Fast Fail */}
            {activeResultTab === 'scoring' && (
              <div className="space-y-6">
                {result?.scoring ? (
                  <>
                    {/* Score Header Card */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-white font-mono">{result.scoring.globalScore.toFixed(2)}</span>
                          <span className="text-sm text-neutral-500 font-mono">/ 5.00</span>
                          <span className="px-2.5 py-0.5 rounded text-xs font-bold font-mono uppercase tracking-wider bg-neutral-800 text-white border border-neutral-700">
                            {result.scoring.verdict}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">
                          Role: <span className="text-white font-medium">{jobTitle}</span> at <span className="text-white font-medium">{companyName}</span>
                        </p>
                      </div>

                      {/* Fast-Fail Gatekeeper Indicators */}
                      <div className="flex flex-wrap gap-1.5 text-[11px] font-mono">
                        <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                          <span>Visa / Auth</span>
                        </div>
                        <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                          <span>Location</span>
                        </div>
                        <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                          <span>Comp Band</span>
                        </div>
                        <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-neutral-950 border border-neutral-800 text-neutral-300">
                          <CheckCircle2 className="w-3 h-3 text-white" />
                          <span>Blacklist Free</span>
                        </div>
                      </div>
                    </div>

                    {/* 5-Dimensional Breakdown */}
                    <div className="space-y-3">
                      <h3 className="text-xs font-mono text-neutral-400 uppercase tracking-wider">5-Dimensional Weighted Matrix</h3>
                      
                      {Object.entries(result.scoring.dimensions).map(([key, rawDim]) => {
                        const dim = rawDim as {
                          name: string;
                          score: number;
                          weight: number;
                          weightedScore: number;
                          reasoning: string;
                          strengths: string[];
                          gaps: string[];
                        };
                        return (
                        <div key={key} className="bg-neutral-900 border border-neutral-800 rounded-lg p-3.5 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="font-semibold text-white">{dim.name}</span>
                              <span className="text-[10px] font-mono text-neutral-500">({Math.round(dim.weight * 100)}% weight)</span>
                            </div>
                            <div className="flex items-center space-x-2 font-mono">
                              <span className="text-white font-bold">{dim.score.toFixed(1)} / 5.0</span>
                              <span className="text-neutral-500 text-[10px]">({dim.weightedScore.toFixed(2)} pts)</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="w-full bg-neutral-950 rounded h-1.5 overflow-hidden">
                            <div
                              className="bg-white h-1.5 rounded transition-all duration-500"
                              style={{ width: `${(dim.score / 5.0) * 100}%` }}
                            />
                          </div>

                          <p className="text-xs text-neutral-400 leading-relaxed">{dim.reasoning}</p>

                          {dim.strengths && dim.strengths.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {dim.strengths.map((s, i) => (
                                <span key={i} className="px-2 py-0.5 text-[10px] rounded bg-neutral-950 text-neutral-300 border border-neutral-800 font-mono">
                                  ✓ {s}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                    <BarChart3 className="w-10 h-10 text-neutral-600" />
                    <p className="text-xs text-neutral-400 font-mono">No evaluation report generated yet.</p>
                    <button
                      onClick={() => handleExecuteMode('eval')}
                      className="px-4 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-mono font-semibold rounded transition-colors"
                    >
                      Run 5-Dimensional Evaluation Now
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* View 2: Diagnostic Blocks A through H */}
            {activeResultTab === 'diagnostics' && (
              <div className="space-y-5">
                {result?.diagnostics ? (
                  <>
                    {/* Block A: Executive Summary */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-2">
                      <div className="flex items-center space-x-2 text-xs font-mono text-neutral-300">
                        <span className="font-bold text-white">BLOCK A</span>
                        <span>•</span>
                        <span>Executive Match Summary</span>
                      </div>
                      <p className="text-xs text-neutral-300 leading-relaxed">{result.diagnostics.blockA_ExecutiveSummary.overview}</p>
                      <div className="pt-2 border-t border-neutral-800 text-xs text-neutral-300 font-mono">
                        Recommendation: {result.diagnostics.blockA_ExecutiveSummary.recommendedAction}
                      </div>
                    </div>

                    {/* Block B: Hard Requirements vs Evidence Matrix */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                        <span>BLOCK B: Hard Requirements vs Candidate Evidence Matrix</span>
                        <span>{result.diagnostics.blockB_RequirementsMatrix.length} Items Audited</span>
                      </div>
                      <div className="space-y-2">
                        {result.diagnostics.blockB_RequirementsMatrix.map((item, idx) => (
                          <div key={idx} className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 space-y-1.5">
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-xs font-semibold text-white">{item.requirement}</span>
                              <span className="px-2 py-0.5 text-[10px] font-mono rounded uppercase font-bold shrink-0 bg-neutral-950 text-neutral-300 border border-neutral-700">
                                {item.status.replace('_', ' ')} ({item.confidence}%)
                              </span>
                            </div>
                            <p className="text-xs text-neutral-400 font-mono">
                              <span className="text-neutral-500">Evidence:</span> {item.candidateEvidence}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Block C & D: Critical Gaps & Tailoring Angles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Block C */}
                      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3.5 space-y-2">
                        <span className="text-xs font-mono text-neutral-300 font-bold block">BLOCK C: Gaps & Truthful Mitigations</span>
                        {result.diagnostics.blockC_CriticalGaps.map((gap, i) => (
                          <div key={i} className="text-xs space-y-1 border-b border-neutral-800 pb-2 last:border-0 last:pb-0">
                            <div className="text-white font-medium">{gap.gapDescription}</div>
                            <div className="text-neutral-400 text-[11px] font-mono"><span className="text-neutral-300">Mitigation:</span> {gap.truthfulMitigation}</div>
                          </div>
                        ))}
                      </div>

                      {/* Block D */}
                      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3.5 space-y-2">
                        <span className="text-xs font-mono text-neutral-300 font-bold block">BLOCK D: Top Tailoring Angles</span>
                        {result.diagnostics.blockD_TailoringAngles.map((angle, i) => (
                          <div key={i} className="text-xs space-y-1 border-b border-neutral-800 pb-2 last:border-0 last:pb-0">
                            <div className="text-white font-semibold">#{angle.rank} {angle.initiativeTitle}</div>
                            <div className="text-neutral-400 text-[11px]">{angle.relevanceToJD}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Block H: Interview Defense Strategy */}
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-3">
                      <span className="text-xs font-mono text-neutral-300 font-bold block">BLOCK H: Technical Interview Defense Strategy</span>
                      <div className="space-y-3">
                        {result.diagnostics.blockH_InterviewDefenseStrategy.map((strat, i) => (
                          <div key={i} className="space-y-1 bg-neutral-950 p-3 rounded border border-neutral-800 text-xs">
                            <div className="text-white font-medium">Q: "{strat.anticipatedToughQuestion}"</div>
                            <div className="text-neutral-400 leading-relaxed">Defense: {strat.suggestedDefense}</div>
                            <div className="text-neutral-300 font-mono text-[11px]">Metric Proof: {strat.relevantMetricProof}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 text-neutral-500 text-xs font-mono">
                    Run 'Evaluate & Score' mode to view complete Blocks A through H diagnostic matrix.
                  </div>
                )}
              </div>
            )}

            {/* View 3: Tailored ATS Markdown CV */}
            {activeResultTab === 'resume' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-mono text-neutral-300 uppercase">ATS-Compliant Tailored Resume</h3>
                    <p className="text-[11px] text-neutral-500 font-mono">Google X-Y-Z formula • Strictly fact-whitelisted • No forbidden claims</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => copyToClipboard(result?.tailoredCVMarkdown || '', 'Tailored Resume')}
                      className="px-3 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono rounded border border-neutral-700 flex items-center space-x-1.5"
                    >
                      <Copy className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Copy Markdown</span>
                    </button>
                    <button
                      onClick={() => downloadMarkdownFile(result?.tailoredCVMarkdown || '', `Tailored_Resume_${companyName.replace(/\s+/g, '_')}.md`)}
                      className="px-3 py-1 bg-white hover:bg-neutral-200 text-black text-xs font-mono font-semibold rounded flex items-center space-x-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .md</span>
                    </button>
                  </div>
                </div>

                {result?.tailoredCVMarkdown ? (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5 font-mono text-xs text-neutral-200 whitespace-pre-wrap leading-relaxed max-h-[600px] overflow-y-auto">
                    {result.tailoredCVMarkdown}
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-3">
                    <FileText className="w-10 h-10 text-neutral-600 mx-auto" />
                    <p className="text-xs text-neutral-400 font-mono">No tailored resume generated yet.</p>
                    <button
                      onClick={() => handleExecuteMode('tailor')}
                      className="px-4 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-mono font-semibold rounded"
                    >
                      Generate Tailored ATS CV Now
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* View 4: STAR+R Interview Stories */}
            {activeResultTab === 'starr' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-mono text-neutral-300 uppercase">STAR+R Interview Story Bank</h3>
                    <p className="text-[11px] text-neutral-500 font-mono">Situation • Task • Action • Result • Reflection (Citing verifiable metrics)</p>
                  </div>
                  <button
                    onClick={() => handleExecuteMode('interview-prep')}
                    className="px-3 py-1 bg-white hover:bg-neutral-200 text-black text-xs font-mono font-semibold rounded"
                  >
                    Refresh Stories
                  </button>
                </div>

                {result?.interviewPrep?.starrStories ? (
                  <div className="space-y-4">
                    {result.interviewPrep.starrStories.map((story, i) => (
                      <div key={story.id || i} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white font-mono">#{i + 1} {story.title}</span>
                          <div className="flex gap-1">
                            {story.tags?.map((t, idx) => (
                              <span key={idx} className="px-2 py-0.5 text-[10px] rounded bg-neutral-950 text-neutral-400 border border-neutral-800 font-mono">{t}</span>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                            <span className="text-neutral-500 font-mono text-[10px] block">SITUATION & TASK</span>
                            <p className="text-neutral-300 mt-1">{story.situation} {story.task}</p>
                          </div>
                          <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                            <span className="text-neutral-500 font-mono text-[10px] block">ACTION TAKEN</span>
                            <p className="text-neutral-300 mt-1">{story.action}</p>
                          </div>
                        </div>

                        <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800 text-xs space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-mono text-[10px] font-bold">RESULT:</span>
                            <span className="text-neutral-200 font-medium">{story.result}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-neutral-400 font-mono text-[10px] font-bold">REFLECTION:</span>
                            <span className="text-neutral-400 text-[11px]">{story.reflection}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-3">
                    <Award className="w-10 h-10 text-neutral-600 mx-auto" />
                    <p className="text-xs text-neutral-400 font-mono">No STAR+R stories compiled yet.</p>
                    <button
                      onClick={() => handleExecuteMode('interview-prep')}
                      className="px-4 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-mono font-semibold rounded"
                    >
                      Compile STAR+R Story Bank
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* View 5: Outreach & Application Q&A */}
            {activeResultTab === 'outreach' && (
              <div className="space-y-5">
                {/* 3-Sentence Cold Outreach */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-mono text-white font-bold">
                      <Send className="w-4 h-4" />
                      <span>3-Sentence Contacto Pitch to Hiring Manager</span>
                    </div>
                    {result?.coldOutreachDraft && (
                      <button
                        onClick={() => copyToClipboard(result.coldOutreachDraft?.body3Sentences || '', 'Cold Outreach')}
                        className="px-2.5 py-1 bg-neutral-950 hover:bg-neutral-800 text-neutral-300 text-[11px] font-mono rounded border border-neutral-700 flex items-center space-x-1"
                      >
                        <Copy className="w-3 h-3 text-neutral-400" />
                        <span>Copy</span>
                      </button>
                    )}
                  </div>

                  {result?.coldOutreachDraft ? (
                    <div className="space-y-2">
                      <div className="text-xs font-mono text-neutral-400">
                        <span className="text-neutral-500">Subject:</span> {result.coldOutreachDraft.subject}
                      </div>
                      <div className="bg-neutral-950 p-3 rounded border border-neutral-800 text-xs text-neutral-200 leading-relaxed whitespace-pre-wrap font-mono">
                        {result.coldOutreachDraft.body3Sentences}
                      </div>
                      <div className="text-[11px] font-mono text-neutral-400">
                        Hook: {result.coldOutreachDraft.technicalHook}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500 font-mono">Run 'Contacto 3-Sentence' mode to generate a high-relevance outreach pitch.</p>
                  )}
                </div>

                {/* Application Form Answers */}
                {result?.applicationAnswers && result.applicationAnswers.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono text-neutral-400 uppercase">Application Form Answers (150-250 words)</h4>
                    {result.applicationAnswers.map((ans, i) => (
                      <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">Q: {ans.question}</span>
                          <span className="text-[10px] font-mono text-neutral-500">{ans.wordCount} words</span>
                        </div>
                        <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-wrap font-mono">{ans.answer}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {ans.metricsCited.map((m, idx) => (
                            <span key={idx} className="px-2 py-0.5 text-[10px] rounded bg-neutral-950 text-neutral-300 border border-neutral-700 font-mono">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* View 6: Compensation & Negotiation Playbook */}
            {activeResultTab === 'offer' && (
              <div className="space-y-5">
                {result?.benchmarks && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-3">
                    <span className="text-xs font-mono text-white font-bold block">Market Compensation Benchmarks</span>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                        <span className="text-[10px] font-mono text-neutral-500">25th Percentile</span>
                        <div className="text-sm font-bold text-neutral-200 font-mono mt-0.5">${result.benchmarks.p25Usd / 1000}k</div>
                      </div>
                      <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                        <span className="text-[10px] font-mono text-neutral-500">50th Median</span>
                        <div className="text-sm font-bold text-neutral-200 font-mono mt-0.5">${result.benchmarks.p50Usd / 1000}k</div>
                      </div>
                      <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                        <span className="text-[10px] font-mono text-neutral-500">75th Target</span>
                        <div className="text-sm font-bold text-white font-mono mt-0.5">${result.benchmarks.p75Usd / 1000}k</div>
                      </div>
                      <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                        <span className="text-[10px] font-mono text-neutral-500">90th Top Tier</span>
                        <div className="text-sm font-bold text-white font-mono mt-0.5">${result.benchmarks.p90Usd / 1000}k</div>
                      </div>
                    </div>
                    <p className="text-[11px] font-mono text-neutral-400">Equity Guidance: {result.benchmarks.equityGuidance}</p>
                  </div>
                )}

                {result?.negotiationPlaybook && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-white font-bold">Negotiation Counter Strategy</span>
                      <span className="text-xs font-mono text-neutral-300 font-bold">Target: ${result.negotiationPlaybook.targetCounterAmountUsd?.toLocaleString()} USD</span>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono text-neutral-400">Core Leverage Pillars:</span>
                      {result.negotiationPlaybook.leveragePillars?.map((p, i) => (
                        <div key={i} className="text-xs text-neutral-300 flex items-start space-x-1.5 font-mono">
                          <span className="text-white font-bold">•</span>
                          <span>{p}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[11px] font-mono text-neutral-400">Counter Email Script:</span>
                      <div className="bg-neutral-950 p-3 rounded border border-neutral-800 text-xs text-neutral-200 font-mono whitespace-pre-wrap leading-relaxed">
                        {result.negotiationPlaybook.emailScript}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* View 7: AST Verification & Hallucination Inspector */}
            {activeResultTab === 'verifier' && (
              <div className="space-y-5">
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded border border-neutral-700 bg-neutral-950 flex items-center justify-center text-white">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono">
                        {result?.verification?.isCompliant ? '100% Ground Truth Adherence' : 'Verification Status Flagged'}
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5 font-mono">
                        {result?.verification?.details || 'AST Scanner enforces zero-hallucination skill allowlist and Voice DNA purity.'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-white">{result?.verification?.voiceDNAScore || 100}%</span>
                    <span className="text-[10px] text-neutral-500 font-mono block">Voice DNA Purity</span>
                  </div>
                </div>

                {/* Whitelisted Skills Covered */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-2">
                  <span className="text-xs font-mono text-white font-bold block">Verified Ground Truth Skills Allowed & Cited</span>
                  <div className="flex flex-wrap gap-1.5">
                    {cvFacts.skills_allowlist.map((skill, i) => {
                      const isCited = result?.verification?.allowedSkillsCovered?.includes(skill);
                      return (
                        <span
                          key={i}
                          className={`px-2 py-0.5 text-[10px] font-mono rounded border ${
                            isCited
                              ? 'bg-neutral-950 text-white border-neutral-500 font-bold'
                              : 'bg-neutral-950 text-neutral-500 border-neutral-800'
                          }`}
                        >
                          {isCited ? '✓ ' : ''}{skill}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Forbidden Claims Guard */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-2">
                  <span className="text-xs font-mono text-neutral-300 font-bold block">Forbidden Claims Invariant (Hard Blockers)</span>
                  <div className="space-y-1 text-xs text-neutral-400 font-mono">
                    {cvFacts.forbidden_claims.map((claim, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-white shrink-0" />
                        <span>{claim}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Interactive Candidate Ground Truth Editor */}
      {showContractsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-700 rounded-lg max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4 text-white" />
                <h3 className="text-sm font-bold text-white font-mono">
                  Edit Candidate Ground Truth: <span className="text-neutral-300">{activeContractTab}</span>
                </h3>
              </div>
              <button
                onClick={() => setShowContractsModal(false)}
                className="text-neutral-400 hover:text-white text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto">
              <p className="text-xs text-neutral-400 mb-2 font-mono">
                {activeContractTab === 'facts' && 'cv-facts.json: Immutable candidate ground truth whitelist, roles, and verified metrics.'}
                {activeContractTab === 'profile' && 'profile.yml: Seniority targets, compensation thresholds, and company blacklists.'}
                {activeContractTab === 'voice' && 'voice-dna.md: Banned buzzwords, Google X-Y-Z formula, and anti-slop rules.'}
              </p>
              <textarea
                value={contractsJsonText}
                onChange={e => setContractsJsonText(e.target.value)}
                rows={18}
                className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-xs font-mono text-neutral-200 focus:outline-none focus:border-neutral-500 leading-relaxed"
              />
            </div>

            <div className="p-4 border-t border-neutral-800 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowContractsModal(false)}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono rounded border border-neutral-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContracts}
                className="px-4 py-2 bg-white hover:bg-neutral-200 text-black text-xs font-mono font-semibold rounded border border-white"
              >
                Save & Synchronize Contract
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
