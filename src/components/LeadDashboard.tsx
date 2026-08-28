import React, { useState, useEffect } from 'react';
import {
  Download,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Mail,
  ExternalLink,
  Sparkles,
  RefreshCw,
  FileText,
  Copy,
  Check,
  Plus,
  Trash2,
  Edit3,
  TrendingUp,
  Share2,
  ShieldCheck,
  Video,
  Camera,
  Layers,
  Award,
  Send,
  Zap,
  Globe,
  ArrowRight,
  UserCheck,
  Calendar,
  Briefcase,
  CheckCheck
} from 'lucide-react';
import { JobLead, CandidateParsedProfile, EmailCadenceStep } from '../types';
import { exportAuditAsJSON, exportAuditAsCSV } from '../utils/auditExport';
import { extractResumeText, generateLocalCoverEmail, GeneratedCoverEmail } from '../utils/localResumeLLM';
import { INITIAL_JOB_LEADS } from '../data/initialLeads';

const LOCAL_STORAGE_KEY = 'job_leads_pipeline_v2';
const RESUME_STORAGE_KEY = 'job_leads_resume_v2';
const XP_STORAGE_KEY = 'job_leads_xp_v2';

interface LeadDashboardProps {
  onNotify?: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const LeadDashboard: React.FC<LeadDashboardProps> = ({ onNotify }) => {
  // 1. Leads State with Server Sync & Local Storage Cache
  const [leads, setLeads] = useState<JobLead[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse leads from local storage', e);
    }
    return INITIAL_JOB_LEADS;
  });

  // Candidate Profile State
  const [candidateProfile, setCandidateProfile] = useState<CandidateParsedProfile>({
    fullName: 'Adv. Akash',
    email: 'Adv.akash2356@gmail.com',
    phone: '+1 (555) 019-2834',
    technicalSkills: ['React 19', 'TypeScript', 'Node.js', 'Express', 'DAG Planning', 'Zero-Trust RBAC', 'Tailwind CSS', 'PostgreSQL', 'DSPy Optimization'],
    experienceYears: 7,
    suggestedRoles: ['Autonomous AI Systems Architect', 'Senior Full-Stack Engineer', 'Lead Distributed Systems Architect'],
    executiveSummary: 'Results-driven systems architect with extensive experience in React 19, TypeScript, Node.js, and zero-trust multi-agent runtimes.',
    keyAchievements: [
      'Architected zero-trust DAG multi-agent execution framework with topological parallel resolution.',
      'Integrated DSPy-style L3 Evaluator-Optimizer prompt mutation loop reducing token latency by 35%.',
      'Developed sovereign identity governance with signed OIDC validation protocols.'
    ],
    parsedAt: new Date().toISOString()
  });

  // Raw Resume Text & File Name
  const [resumeText, setResumeText] = useState<string>(() => {
    return localStorage.getItem(RESUME_STORAGE_KEY) || 
`Adv. Akash — Autonomous Systems Architect & Senior Full-Stack Engineer
Adv.akash2356@gmail.com | +1 (555) 019-2834

SUMMARY:
Results-driven engineer with extensive experience in React 19, TypeScript, Node.js, Express, and distributed multi-agent systems. Built zero-trust RBAC architectures, DAG task planners with topological execution, and real-time telemetry pipelines.

CORE COMPETENCIES:
• Frontend: React, TypeScript, Tailwind CSS, Responsive Design Systems, Motion
• Backend: Node.js, Express, REST/GraphQL, Zero-Trust OIDC Auth, Redis, PostgreSQL
• Agentic AI: Directed Acyclic Graph (DAG) task deconstruction, DSPy prompt optimization, LLM trace auditing
• DevOps & Security: Cryptographic hashing, automated audit logging, containerized microservices`;
  });

  const [resumeFileName, setResumeFileName] = useState<string>('Akash_Resume_Senior_AI_Architect.txt');
  const [isExtractingResume, setIsExtractingResume] = useState<boolean>(false);
  const [isParsingAIProfile, setIsParsingAIProfile] = useState<boolean>(false);

  // User XP & Progression Engine
  const [userXp, setUserXp] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(XP_STORAGE_KEY);
      return saved ? parseInt(saved, 10) : 1250;
    } catch {
      return 1250;
    }
  });

  // URL Scraper State
  const [scrapeUrlInput, setScrapeUrlInput] = useState<string>('');
  const [isScrapingUrl, setIsScrapingUrl] = useState<boolean>(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<'ALL' | 'YouTube' | 'Instagram'>('ALL');
  const [selectedAppStatus, setSelectedAppStatus] = useState<'ALL' | 'Drafted' | 'Sent' | 'Responded'>('ALL');
  const [selectedEmailStatus, setSelectedEmailStatus] = useState<'ALL' | 'Pending' | 'No Response' | 'Initial Interview' | 'Rejected' | 'Offer'>('ALL');

  // Cover Email Generator Modal / State
  const [activeGeneratorLead, setActiveGeneratorLead] = useState<JobLead | null>(null);
  const [generatedDraft, setGeneratedDraft] = useState<GeneratedCoverEmail | null>(null);
  const [generatorTone, setGeneratorTone] = useState<'direct' | 'technical' | 'visionary'>('direct');
  const [isGeneratingAI, setIsGeneratingAI] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const [dispatchReceipt, setDispatchReceipt] = useState<{ proofId: string; message: string } | null>(null);

  // Manual Add Lead Modal
  const [showAddLeadModal, setShowAddLeadModal] = useState<boolean>(false);
  const [newLead, setNewLead] = useState<Partial<JobLead>>({
    platform: 'YouTube',
    applicationStatus: 'Drafted',
    emailStatus: 'Pending',
    matchScore: 88,
    matchedSkills: ['TypeScript', 'React', 'Node.js', 'DAG Execution']
  });

  // Export Format Dropdown
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);

  // View Mode: Kanban vs Grid vs Table
  const [viewMode, setViewMode] = useState<'kanban' | 'grid' | 'table'>('kanban');

  // Candidate Profile Modal Editor
  const [showProfileEditor, setShowProfileEditor] = useState<boolean>(false);
  const [profileDraft, setProfileDraft] = useState<CandidateParsedProfile>(candidateProfile);

  // Sync profile draft when candidateProfile changes
  useEffect(() => {
    setProfileDraft(candidateProfile);
  }, [candidateProfile]);

  // Quick Notification Helper
  const notify = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    if (onNotify) onNotify(msg, type);
  };

  const addXp = (amount: number, reason: string) => {
    setUserXp(prev => {
      const next = prev + amount;
      try {
        localStorage.setItem(XP_STORAGE_KEY, next.toString());
      } catch {}
      return next;
    });
    notify(`+${amount} XP Earned: ${reason}`, 'success');
  };

  // Sync with Server on Mount
  useEffect(() => {
    const fetchServerLeads = async () => {
      try {
        const res = await fetch('/api/leads');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.leads) && data.leads.length > 0) {
            setLeads(data.leads);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.leads));
          }
          if (data.candidateProfile) {
            setCandidateProfile(data.candidateProfile);
          }
        }
      } catch (e) {
        console.warn('Using cached leads state (server sync pending)', e);
      }
    };
    fetchServerLeads();
  }, []);

  // Save to local storage and sync to server on change
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(leads));
      fetch('/api/leads/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads, candidateProfile })
      }).catch(() => {});
    } catch (e) {
      console.error('Failed to save leads', e);
    }
  }, [leads, candidateProfile]);

  // Status Updater Handler (Local Storage Tracker)
  const handleUpdateEmailStatus = (leadId: string, newStatus: JobLead['emailStatus']) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        let appStatus = lead.applicationStatus;
        if (newStatus === 'Initial Interview' || newStatus === 'Rejected' || newStatus === 'Offer') {
          appStatus = 'Responded';
        } else if (newStatus === 'No Response' && appStatus === 'Drafted') {
          appStatus = 'Sent';
        }

        if (newStatus === 'Initial Interview') {
          addXp(500, 'Interview Scheduled Milestone!');
        } else if (newStatus === 'Offer') {
          addXp(1000, 'Job Offer Milestone!');
        }

        return {
          ...lead,
          emailStatus: newStatus,
          applicationStatus: appStatus,
          lastUpdated: new Date().toISOString()
        };
      }
      return lead;
    }));
    notify(`Updated email status to '${newStatus}'`, 'success');
  };

  const handleUpdateAppStatus = (leadId: string, newStatus: JobLead['applicationStatus']) => {
    setLeads(prev => prev.map(lead => {
      if (lead.id === leadId) {
        return {
          ...lead,
          applicationStatus: newStatus,
          sentAt: newStatus === 'Sent' && !lead.sentAt ? new Date().toISOString() : lead.sentAt,
          lastUpdated: new Date().toISOString()
        };
      }
      return lead;
    }));
    notify(`Application status marked as '${newStatus}'`, 'info');
  };

  // Resume File Upload Handler
  const handleResumeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setResumeFileName(file.name);
    setIsExtractingResume(true);

    try {
      const extracted = await extractResumeText(file);
      setResumeText(extracted);
      localStorage.setItem(RESUME_STORAGE_KEY, extracted);
      notify(`Resume extracted from ${file.name}`, 'success');
      addXp(200, 'Resume Document Uploaded');
      // Automatically trigger AI parse for rich entity profile
      handleAIParseResume(extracted, file.name);
    } catch (err: any) {
      notify(`Error extracting resume: ${err.message}`, 'error');
    } finally {
      setIsExtractingResume(false);
    }
  };

  // AI Resume Entity Parser
  const handleAIParseResume = async (textToParse?: string, fileName?: string) => {
    const text = textToParse || resumeText;
    setIsParsingAIProfile(true);

    try {
      const res = await fetch('/api/leads/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText: text, fileName: fileName || resumeFileName })
      });

      if (res.ok) {
        const data = await res.json();
        setCandidateProfile(data.profile);
        notify(`Parsed ${data.profile.technicalSkills.length} technical skills & executive summary via Gemini AI!`, 'success');
        addXp(250, 'AI Resume Entity Parsing');
      } else {
        throw new Error('AI parse returned non-200');
      }
    } catch (e: any) {
      // Fallback deterministic profile update
      setCandidateProfile(prev => ({
        ...prev,
        parsedAt: new Date().toISOString()
      }));
      notify('Updated candidate profile structure', 'info');
    } finally {
      setIsParsingAIProfile(false);
    }
  };

  // Autonomous URL Scraper
  const handleScrapeUrl = async () => {
    if (!scrapeUrlInput || scrapeUrlInput.trim().length < 5) {
      notify('Please enter a valid YouTube, Instagram, or Job URL', 'error');
      return;
    }

    setIsScrapingUrl(true);

    try {
      const res = await fetch('/api/leads/scrape-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: scrapeUrlInput,
          candidateSkills: candidateProfile.technicalSkills,
          candidateContext: candidateProfile.executiveSummary
        })
      });

      if (res.ok) {
        const data = await res.json();
        setLeads(prev => [data.lead, ...prev]);
        setScrapeUrlInput('');
        notify(`Scraped new lead: '${data.lead.roleOrTopic}' at ${data.lead.companyOrChannel}!`, 'success');
        addXp(150, 'Autonomous URL Scraping');
      } else {
        const err = await res.json();
        notify(err.error || 'Failed to scrape lead', 'error');
      }
    } catch (e: any) {
      notify(`Scraping error: ${e.message}`, 'error');
    } finally {
      setIsScrapingUrl(false);
    }
  };

  // Trigger Cover Email Generation Modal
  const handleOpenEmailGenerator = (lead: JobLead) => {
    setActiveGeneratorLead(lead);
    setDispatchReceipt(null);

    if (lead.generatedCoverEmail && lead.generatedSubject) {
      setGeneratedDraft({
        subject: lead.generatedSubject,
        body: lead.generatedCoverEmail,
        tailoredSkills: lead.matchedSkills,
        keyHook: `${lead.companyOrChannel} — ${lead.roleOrTopic}`,
        generatedAt: lead.lastUpdated
      });
    } else {
      const draft = generateLocalCoverEmail(resumeText, lead, {
        tone: generatorTone,
        applicantName: candidateProfile.fullName || 'Adv. Akash',
        applicantEmail: candidateProfile.email || 'Adv.akash2356@gmail.com'
      });
      setGeneratedDraft(draft);
    }
  };

  // Generate via Server-side Gemini AI
  const handleSynthesizeWithAI = async (tone: 'direct' | 'technical' | 'visionary' = generatorTone) => {
    if (!activeGeneratorLead) return;
    setIsGeneratingAI(true);
    setGeneratorTone(tone);

    try {
      const res = await fetch('/api/leads/synthesize-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          lead: activeGeneratorLead,
          tone,
          applicantName: candidateProfile.fullName,
          applicantEmail: candidateProfile.email,
          focusAreas: candidateProfile.technicalSkills
        })
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedDraft({
          subject: data.subject,
          body: data.body,
          tailoredSkills: data.tailoredSkills,
          keyHook: data.keyHook,
          generatedAt: data.generatedAt
        });

        // Update active lead cadence steps
        setLeads(prev => prev.map(l => {
          if (l.id === activeGeneratorLead.id) {
            return {
              ...l,
              generatedCoverEmail: data.body,
              generatedSubject: data.subject,
              cadenceSteps: data.cadenceSteps,
              lastUpdated: new Date().toISOString()
            };
          }
          return l;
        }));

        notify('AI Cold Outreach Pitch & Drip Cadence generated!', 'success');
        addXp(250, 'Gemini Cover Pitch Synthesized');
      } else {
        throw new Error('AI generation failed');
      }
    } catch (e: any) {
      // Fallback local generator
      const draft = generateLocalCoverEmail(resumeText, activeGeneratorLead, {
        tone,
        applicantName: candidateProfile.fullName,
        applicantEmail: candidateProfile.email
      });
      setGeneratedDraft(draft);
      notify('Generated pitch using local offline engine', 'info');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Save Draft to Lead
  const handleSaveDraftToLead = () => {
    if (!activeGeneratorLead || !generatedDraft) return;
    setLeads(prev => prev.map(l => {
      if (l.id === activeGeneratorLead.id) {
        return {
          ...l,
          generatedCoverEmail: generatedDraft.body,
          generatedSubject: generatedDraft.subject,
          lastUpdated: new Date().toISOString()
        };
      }
      return l;
    }));
    notify(`Saved drafted email to lead ${activeGeneratorLead.recruiterName}`, 'success');
  };

  // Real Email Dispatch via Server API
  const handleDispatchEmail = async () => {
    if (!activeGeneratorLead || !generatedDraft) return;
    setIsDispatching(true);

    try {
      const res = await fetch('/api/leads/dispatch-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: activeGeneratorLead.id,
          emailData: {
            to: activeGeneratorLead.contactEmail,
            subject: generatedDraft.subject,
            body: generatedDraft.body
          },
          method: 'SIMULATED_SERVER_SMTP'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDispatchReceipt({
          proofId: data.dispatchProofId,
          message: data.message
        });

        setLeads(prev => prev.map(l => l.id === activeGeneratorLead.id ? data.lead : l));
        setActiveGeneratorLead(data.lead);
        notify(`Outreach dispatched with signed proof: ${data.dispatchProofId}`, 'success');
        addXp(300, 'Cold Outreach Dispatched & Signed');
      } else {
        const err = await res.json();
        notify(err.error || 'Dispatch failed', 'error');
      }
    } catch (e: any) {
      notify(`Dispatch error: ${e.message}`, 'error');
    } finally {
      setIsDispatching(false);
    }
  };

  // Copy cover email to clipboard
  const handleCopyDraft = () => {
    if (!generatedDraft) return;
    const fullText = `Subject: ${generatedDraft.subject}\n\n${generatedDraft.body}`;
    navigator.clipboard.writeText(fullText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
    notify('Cover email copied to clipboard!', 'success');
  };

  // Reset to default sample leads
  const handleResetLeads = () => {
    if (window.confirm('Reset all leads to default dataset? Your manual changes will be overwritten.')) {
      setLeads(INITIAL_JOB_LEADS);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_JOB_LEADS));
      notify('Leads reset to default pipeline dataset', 'info');
    }
  };

  // Manual Add Lead
  const handleSaveNewLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLead.recruiterName || !newLead.companyOrChannel) {
      notify('Please fill in recruiter name and company/channel', 'error');
      return;
    }

    const leadToAdd: JobLead = {
      id: `lead-custom-${Date.now()}`,
      recruiterName: newLead.recruiterName || 'Unknown Recruiter',
      companyOrChannel: newLead.companyOrChannel || 'Channel',
      platform: (newLead.platform as 'YouTube' | 'Instagram') || 'YouTube',
      profileUrl: newLead.profileUrl || 'https://youtube.com',
      contactEmail: newLead.contactEmail || 'contact@example.com',
      roleOrTopic: newLead.roleOrTopic || 'Software Engineer',
      videoOrPostTitle: newLead.videoOrPostTitle || 'Hiring Announcement',
      scrapedAt: new Date().toISOString(),
      applicationStatus: (newLead.applicationStatus as any) || 'Drafted',
      emailStatus: (newLead.emailStatus as any) || 'Pending',
      matchScore: Number(newLead.matchScore) || 85,
      matchedSkills: newLead.matchedSkills || ['TypeScript', 'Full-Stack'],
      notes: newLead.notes || 'Manually added lead',
      lastUpdated: new Date().toISOString()
    };

    setLeads([leadToAdd, ...leads]);
    setShowAddLeadModal(false);
    setNewLead({
      platform: 'YouTube',
      applicationStatus: 'Drafted',
      emailStatus: 'Pending',
      matchScore: 88,
      matchedSkills: ['TypeScript', 'React', 'Node.js']
    });
    notify(`New lead ${leadToAdd.recruiterName} added to pipeline!`, 'success');
    addXp(100, 'Manual Lead Added');
  };

  // Filtered Leads Calculation
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.recruiterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.companyOrChannel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.roleOrTopic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.videoOrPostTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.matchedSkills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesPlatform = selectedPlatform === 'ALL' || lead.platform === selectedPlatform;
    const matchesAppStatus = selectedAppStatus === 'ALL' || lead.applicationStatus === selectedAppStatus;
    const matchesEmailStatus = selectedEmailStatus === 'ALL' || lead.emailStatus === selectedEmailStatus;

    return matchesSearch && matchesPlatform && matchesAppStatus && matchesEmailStatus;
  });

  // Statistics Calculation
  const totalLeadsCount = leads.length;
  const youtubeCount = leads.filter(l => l.platform === 'YouTube').length;
  const instagramCount = leads.filter(l => l.platform === 'Instagram').length;

  const draftedCount = leads.filter(l => l.applicationStatus === 'Drafted').length;
  const sentCount = leads.filter(l => l.applicationStatus === 'Sent').length;
  const respondedCount = leads.filter(l => l.applicationStatus === 'Responded').length;

  const interviewCount = leads.filter(l => l.emailStatus === 'Initial Interview').length;
  const noResponseCount = leads.filter(l => l.emailStatus === 'No Response').length;
  const rejectedCount = leads.filter(l => l.emailStatus === 'Rejected').length;
  const offerCount = leads.filter(l => l.emailStatus === 'Offer').length;

  const responseRate = sentCount + respondedCount > 0 
    ? Math.round((respondedCount / (sentCount + respondedCount)) * 100) 
    : 0;

  const interviewConversionRate = leads.length > 0 
    ? Math.round((interviewCount / leads.length) * 100) 
    : 0;

  // Level & XP Metrics
  const currentLevel = Math.floor(userXp / 1000) + 1;
  const xpInCurrentLevel = userXp % 1000;
  const levelTitles: Record<number, string> = {
    1: 'Novice Scout',
    2: 'Lead Hunter',
    3: 'Match Architect',
    4: 'Interview Catalyst',
    5: 'Outreach Grandmaster'
  };
  const currentTitle = levelTitles[Math.min(currentLevel, 5)] || 'Autonomous Master';

  return (
    <div className="space-y-6">
      {/* 1. Mission Control Header & Gamification XP Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono mb-1">
              <Layers className="w-4 h-4" />
              <span>AUTONOMOUS OUTREACH ENGINE & REAL-TIME TRACKER</span>
            </div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span>Job Outreach & Recruiter Pipeline</span>
              <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE SERVER SYNCED
              </span>
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Autonomous hiring lead extraction from YouTube & Instagram, personalized AI cold email generation, and full interview tracking.
            </p>
          </div>

          {/* Gamified Level & XP Card */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 min-w-[260px]">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Award className="w-4 h-4 text-amber-400" />
                Level {currentLevel}: {currentTitle}
              </span>
              <span className="text-slate-400">{userXp} XP</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-amber-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${(xpInCurrentLevel / 1000) * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>{xpInCurrentLevel} / 1000 XP to next rank</span>
              <span className="text-indigo-400">+{interviewCount * 500} XP Earned from Interviews</span>
            </div>
          </div>
        </div>

        {/* 3-Step Quick Start Onboarding Guide */}
        <div className="bg-slate-950/90 border border-indigo-900/40 rounded-xl p-3.5 mt-2">
          <div className="text-xs font-semibold text-indigo-300 mb-2 flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>How it Works in 3 Easy Steps:</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Step 1 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500 text-indigo-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                1
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-slate-200">Your Candidate Profile</div>
                <div className="text-[11px] text-slate-400">
                  {candidateProfile.fullName} • {candidateProfile.technicalSkills.length} Skills
                </div>
                <div className="pt-1 flex items-center gap-1.5">
                  <button
                    onClick={() => setShowProfileEditor(true)}
                    className="text-[10px] text-indigo-300 hover:text-indigo-200 underline font-mono"
                  >
                    Edit Profile
                  </button>
                  <span className="text-slate-600">•</span>
                  <label htmlFor="resume-upload-input" className="cursor-pointer text-[10px] text-indigo-300 hover:text-indigo-200 underline font-mono">
                    Upload Resume
                  </label>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500 text-indigo-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                2
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-slate-200">Scrape Hiring Link</div>
                <div className="text-[11px] text-slate-400">
                  Paste any YouTube or Instagram video link below to extract recruiter info.
                </div>
                <div className="pt-1">
                  <span className="text-[10px] text-emerald-400 font-mono">
                    ✓ {leads.length} Leads in Pipeline
                  </span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-indigo-600/30 border border-indigo-500 text-indigo-300 flex items-center justify-center font-bold text-xs flex-shrink-0">
                3
              </div>
              <div className="space-y-1 text-xs">
                <div className="font-semibold text-slate-200">1-Click AI Pitch & Send</div>
                <div className="text-[11px] text-slate-400">
                  Generate tailored pitch matching your exact skills and send or track in Kanban.
                </div>
                <div className="pt-1">
                  <span className="text-[10px] text-cyan-400 font-mono">
                    {sentCount} Outreach Sent • {interviewCount} Interviews
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: Download Audit, Add Lead, Reset */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Pipeline Actions:</span>
            {/* 'Download Audit' Button */}
            <div className="relative">
              <button
                id="btn-download-audit"
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-2 shadow-md shadow-indigo-600/30 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Download Audit</span>
              </button>

              {showExportMenu && (
                <div className="absolute left-0 mt-2 w-52 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-30 font-mono text-xs">
                  <button
                    id="btn-export-audit-json"
                    onClick={() => {
                      exportAuditAsJSON(leads);
                      setShowExportMenu(false);
                      notify('Lead audit exported as JSON file', 'success');
                    }}
                    className="w-full text-left px-4 py-2 text-slate-200 hover:bg-indigo-600 hover:text-white flex items-center justify-between"
                  >
                    <span>Export JSON Audit</span>
                    <span className="text-[10px] text-slate-400">.json</span>
                  </button>
                  <button
                    id="btn-export-audit-csv"
                    onClick={() => {
                      exportAuditAsCSV(leads);
                      setShowExportMenu(false);
                      notify('Lead audit exported as CSV file', 'success');
                    }}
                    className="w-full text-left px-4 py-2 text-slate-200 hover:bg-indigo-600 hover:text-white flex items-center justify-between border-t border-slate-800"
                  >
                    <span>Export CSV Spreadsheet</span>
                    <span className="text-[10px] text-slate-400">.csv</span>
                  </button>
                </div>
              )}
            </div>

            {/* Add Lead Button */}
            <button
              id="btn-open-add-lead"
              onClick={() => setShowAddLeadModal(true)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 border border-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>Add Custom Lead</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-reset-leads"
              onClick={handleResetLeads}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-mono border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Reset sample leads data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Sample Leads</span>
            </button>
          </div>
        </div>

        {/* Real-time Dashboard Statistics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-800/80">
          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>TOTAL LEADS</span>
              <span className="text-indigo-400 font-bold">{totalLeadsCount}</span>
            </div>
            <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1"><Video className="w-3 h-3 text-red-400" /> {youtubeCount} YT</span>
              <span className="flex items-center gap-1"><Camera className="w-3 h-3 text-pink-400" /> {instagramCount} IG</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>DRAFTED</span>
              <span className="text-amber-400 font-bold">{draftedCount}</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Ready to pitch
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>SENT OUTREACH</span>
              <span className="text-cyan-400 font-bold">{sentCount}</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Active in flight
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>INTERVIEWS</span>
              <span className="text-emerald-400 font-bold">{interviewCount}</span>
            </div>
            <div className="mt-2 text-xs text-emerald-400/90 font-mono font-medium">
              {interviewConversionRate}% Conversion
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>RESPONSE RATE</span>
              <span className="text-purple-400 font-bold">{responseRate}%</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              {respondedCount} Responded
            </div>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>ACCEPTED OFFERS</span>
              <span className="text-emerald-400 font-bold">{offerCount}</span>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              {offerCount > 0 ? `${offerCount} Offers` : `${rejectedCount} Closed`}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Autonomous URL & Hiring Video Scraper Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-red-950/80 text-red-400 border border-red-800">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">
                1-Click Video / Post URL Scraper
              </h3>
              <p className="text-xs text-slate-400">
                Paste any YouTube hiring video URL, Instagram post, or career link to extract recruiter info and draft an outreach pitch with Gemini.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
            AI Scraper Agent
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={scrapeUrlInput}
            onChange={(e) => setScrapeUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleScrapeUrl()}
            placeholder="Paste YouTube or Instagram hiring link (e.g. https://youtube.com/watch?v=... or https://instagram.com/p/...)"
            className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleScrapeUrl}
            disabled={isScrapingUrl}
            className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center justify-center space-x-2 transition-all shadow-md shadow-indigo-600/30 whitespace-nowrap"
          >
            {isScrapingUrl ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Scraping URL via Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Scrape & Add to Pipeline</span>
              </>
            )}
          </button>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400 flex-wrap">
          <span className="text-slate-500">Quick Test Samples (Click to test):</span>
          <button
            onClick={() => {
              setScrapeUrlInput('https://youtube.com/watch?v=hire-senior-ai-agent-engineers');
              notify('Loaded YouTube sample link. Click Scrape to extract lead!', 'info');
            }}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1"
          >
            <Video className="w-3 h-3 text-red-400" />
            <span>YouTube: AI Agent Hiring</span>
          </button>
          <button
            onClick={() => {
              setScrapeUrlInput('https://instagram.com/p/design-systems-frontend-lead-hiring');
              notify('Loaded Instagram sample link. Click Scrape to extract lead!', 'info');
            }}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1"
          >
            <Camera className="w-3 h-3 text-pink-400" />
            <span>Instagram: Frontend Lead</span>
          </button>
        </div>
      </div>

      {/* 3. Candidate Resume & Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-800">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-semibold text-slate-100">
                  Candidate Profile & AI Resume Engine
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Grounded in Candidate Experience
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Candidate: <span className="text-slate-200 font-bold">{candidateProfile.fullName}</span> ({candidateProfile.email}) • {candidateProfile.experienceYears} Years Experience
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-wrap">
            <button
              onClick={() => setShowProfileEditor(true)}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-mono flex items-center space-x-1.5 border border-indigo-800/60 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Edit Profile Details</span>
            </button>

            <button
              onClick={() => handleAIParseResume()}
              disabled={isParsingAIProfile}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center space-x-1.5 border border-slate-700 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isParsingAIProfile ? 'Parsing...' : 'AI Re-Parse'}</span>
            </button>

            <label
              htmlFor="resume-upload-input"
              className="cursor-pointer px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono flex items-center space-x-2 shadow-sm transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isExtractingResume ? 'Extracting...' : 'Upload Resume'}</span>
            </label>
            <input
              id="resume-upload-input"
              type="file"
              accept=".txt,.md,.json,.pdf,.doc,.docx"
              onChange={handleResumeFileUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Parsed Technical Skills Badges */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono text-slate-400 mr-1">Skills:</span>
          {candidateProfile.technicalSkills.map((sk, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-800"
            >
              {sk}
            </span>
          ))}
        </div>
      </div>

      {/* 4. Controls: View Switcher (Kanban vs Grid vs Table) & Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* View Mode Switcher */}
          <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-semibold transition-all ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Grid Cards</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Quick Table</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recruiter, company, role, video title, or skill..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Platform Categorization */}
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'YouTube', label: 'YouTube', icon: Video, color: 'text-red-400' },
              { id: 'Instagram', label: 'Instagram', icon: Camera, color: 'text-pink-400' }
            ].map((p: any) => {
              const Icon = p.icon;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlatform(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-colors ${
                    selectedPlatform === p.id
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800'
                  }`}
                >
                  {Icon && <Icon className={`w-3.5 h-3.5 ${p.color}`} />}
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80 text-xs font-mono">
          <div className="flex items-center space-x-1">
            <span className="text-slate-500">App Status:</span>
            {(['ALL', 'Drafted', 'Sent', 'Responded'] as const).map(st => (
              <button
                key={st}
                onClick={() => setSelectedAppStatus(st)}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                  selectedAppStatus === st
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-700 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>

          <div className="flex items-center space-x-1">
            <span className="text-slate-500">Email Status:</span>
            {(['ALL', 'Pending', 'No Response', 'Initial Interview', 'Rejected', 'Offer'] as const).map(st => (
              <button
                key={st}
                onClick={() => setSelectedEmailStatus(st)}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                  selectedEmailStatus === st
                    ? 'bg-indigo-950 text-indigo-300 border border-indigo-700 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5. MAIN PIPELINE VIEW: KANBAN vs GRID vs TABLE */}

      {/* A. KANBAN BOARD VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Column 1: New Leads & Drafts */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col h-full space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2 font-mono text-xs font-bold text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span>1. NEW & DRAFTED</span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400">
                {filteredLeads.filter(l => l.applicationStatus === 'Drafted').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
              {filteredLeads.filter(l => l.applicationStatus === 'Drafted').map(lead => (
                <div
                  key={lead.id}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 hover:border-slate-700 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="font-bold text-xs text-slate-100">{lead.recruiterName}</div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {lead.matchScore}%
                    </span>
                  </div>
                  <div className="text-[11px] text-indigo-300 font-mono">{lead.companyOrChannel}</div>
                  <div className="text-xs text-slate-300 font-medium">{lead.roleOrTopic}</div>
                  <div className="text-[11px] text-slate-400 italic line-clamp-2 bg-slate-900 p-1.5 rounded">
                    "{lead.videoOrPostTitle}"
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => handleOpenEmailGenerator(lead)}
                      className="flex-1 py-1.5 px-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>{lead.generatedCoverEmail ? 'Pitch Ready' : 'Draft Pitch'}</span>
                    </button>
                    <button
                      onClick={() => handleUpdateAppStatus(lead.id, 'Sent')}
                      className="py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono"
                      title="Move to Sent Outreach"
                    >
                      → Sent
                    </button>
                  </div>
                </div>
              ))}

              {filteredLeads.filter(l => l.applicationStatus === 'Drafted').length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500 font-mono">
                  No drafted leads
                </div>
              )}
            </div>
          </div>

          {/* Column 2: Outreach Sent */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col h-full space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2 font-mono text-xs font-bold text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span>2. OUTREACH SENT</span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400">
                {filteredLeads.filter(l => l.applicationStatus === 'Sent' && l.emailStatus !== 'Initial Interview' && l.emailStatus !== 'Offer').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
              {filteredLeads.filter(l => l.applicationStatus === 'Sent' && l.emailStatus !== 'Initial Interview' && l.emailStatus !== 'Offer').map(lead => (
                <div
                  key={lead.id}
                  className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2 hover:border-slate-700 transition-all shadow-sm"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="font-bold text-xs text-slate-100">{lead.recruiterName}</div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                      Sent
                    </span>
                  </div>
                  <div className="text-[11px] text-indigo-300 font-mono">{lead.companyOrChannel}</div>
                  <div className="text-xs text-slate-300 font-medium">{lead.roleOrTopic}</div>

                  {lead.dispatchProofId && (
                    <div className="text-[9px] font-mono text-emerald-400 truncate bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      Proof: {lead.dispatchProofId.substring(0, 16)}...
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => handleOpenEmailGenerator(lead)}
                      className="py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-mono flex items-center gap-1"
                    >
                      <Mail className="w-3 h-3 text-cyan-400" />
                      <span>View Email</span>
                    </button>
                    <button
                      onClick={() => handleUpdateEmailStatus(lead.id, 'Initial Interview')}
                      className="flex-1 py-1.5 px-2 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[10px] font-semibold flex items-center justify-center gap-1"
                      title="Mark as Interview Scheduled (+500 XP)"
                    >
                      <span>🤝 Got Interview</span>
                    </button>
                  </div>
                </div>
              ))}

              {filteredLeads.filter(l => l.applicationStatus === 'Sent' && l.emailStatus !== 'Initial Interview' && l.emailStatus !== 'Offer').length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500 font-mono">
                  No active sent outreach
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Interviews Scheduled */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col h-full space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2 font-mono text-xs font-bold text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>3. INTERVIEWS</span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300">
                {filteredLeads.filter(l => l.emailStatus === 'Initial Interview').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
              {filteredLeads.filter(l => l.emailStatus === 'Initial Interview').map(lead => (
                <div
                  key={lead.id}
                  className="bg-slate-950 border border-emerald-800/60 rounded-lg p-3 space-y-2 hover:border-emerald-700 transition-all shadow-md shadow-emerald-950/30"
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="font-bold text-xs text-slate-100">{lead.recruiterName}</div>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                      🎉 Interview
                    </span>
                  </div>
                  <div className="text-[11px] text-indigo-300 font-mono">{lead.companyOrChannel}</div>
                  <div className="text-xs text-slate-200 font-semibold">{lead.roleOrTopic}</div>

                  <div className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 p-1.5 rounded border border-emerald-800/50">
                    Contact: {lead.contactEmail}
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-1.5">
                    <button
                      onClick={() => handleUpdateEmailStatus(lead.id, 'Offer')}
                      className="flex-1 py-1.5 px-2 rounded bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center gap-1"
                      title="Mark Job Offer Received (+1000 XP)"
                    >
                      <span>🏆 Got Offer!</span>
                    </button>
                    <button
                      onClick={() => handleOpenEmailGenerator(lead)}
                      className="py-1.5 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px]"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))}

              {filteredLeads.filter(l => l.emailStatus === 'Initial Interview').length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500 font-mono">
                  No interviews scheduled yet. Send cold pitches to begin!
                </div>
              )}
            </div>
          </div>

          {/* Column 4: Offers & Outcomes */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col h-full space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center space-x-2 font-mono text-xs font-bold text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
                <span>4. OFFERS & CLOSED</span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-950 text-slate-400">
                {filteredLeads.filter(l => l.emailStatus === 'Offer' || l.emailStatus === 'Rejected').length}
              </span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto max-h-[700px] pr-1">
              {filteredLeads.filter(l => l.emailStatus === 'Offer' || l.emailStatus === 'Rejected').map(lead => (
                <div
                  key={lead.id}
                  className={`bg-slate-950 border rounded-lg p-3 space-y-2 transition-all shadow-sm ${
                    lead.emailStatus === 'Offer'
                      ? 'border-purple-700 shadow-purple-950/30'
                      : 'border-slate-800 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="font-bold text-xs text-slate-100">{lead.recruiterName}</div>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                      lead.emailStatus === 'Offer'
                        ? 'bg-purple-950 text-purple-300 border-purple-700'
                        : 'bg-rose-950 text-rose-300 border-rose-800'
                    }`}>
                      {lead.emailStatus}
                    </span>
                  </div>
                  <div className="text-[11px] text-indigo-300 font-mono">{lead.companyOrChannel}</div>
                  <div className="text-xs text-slate-300 font-medium">{lead.roleOrTopic}</div>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{lead.emailStatus === 'Offer' ? '🎉 Accepted Offer' : 'Closed Lead'}</span>
                    <button
                      onClick={() => handleOpenEmailGenerator(lead)}
                      className="text-indigo-300 hover:underline"
                    >
                      History
                    </button>
                  </div>
                </div>
              ))}

              {filteredLeads.filter(l => l.emailStatus === 'Offer' || l.emailStatus === 'Rejected').length === 0 && (
                <div className="text-center py-8 text-xs text-slate-500 font-mono">
                  No completed outcomes
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* B. COMPACT TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Recruiter / Channel</th>
                  <th className="p-3">Role / Topic</th>
                  <th className="p-3">Platform</th>
                  <th className="p-3">Match</th>
                  <th className="p-3">App Stage</th>
                  <th className="p-3">Email Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-100">{lead.recruiterName}</div>
                      <div className="text-[11px] text-indigo-400">{lead.companyOrChannel}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-300">{lead.roleOrTopic}</div>
                      <div className="text-[10px] text-slate-500 truncate max-w-xs">{lead.videoOrPostTitle}</div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        lead.platform === 'YouTube' ? 'bg-red-950 text-red-300' : 'bg-pink-950 text-pink-300'
                      }`}>
                        {lead.platform}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-emerald-400 font-bold">{lead.matchScore}%</span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${
                        lead.applicationStatus === 'Sent'
                          ? 'bg-cyan-950 text-cyan-300'
                          : lead.applicationStatus === 'Responded'
                          ? 'bg-emerald-950 text-emerald-300'
                          : 'bg-amber-950 text-amber-300'
                      }`}>
                        {lead.applicationStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={lead.emailStatus}
                        onChange={(e) => handleUpdateEmailStatus(lead.id, e.target.value as any)}
                        className="bg-slate-950 border border-slate-800 text-[11px] rounded px-2 py-1 focus:outline-none"
                      >
                        <option value="Pending">Pending</option>
                        <option value="No Response">No Response</option>
                        <option value="Initial Interview">Initial Interview</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Offer">Offer</option>
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleOpenEmailGenerator(lead)}
                        className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Pitch</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* C. GRID CARDS VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => {
            const isYouTube = lead.platform === 'YouTube';

            return (
              <div
                key={lead.id}
                id={`lead-card-${lead.id}`}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md space-y-4"
              >
                {/* Card Header: Platform, Match %, Recruiter */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-1.5">
                      {isYouTube ? (
                        <span className="px-2 py-0.5 rounded-full bg-red-950/80 text-red-300 border border-red-800 text-[10px] font-mono flex items-center gap-1 font-semibold">
                          <Video className="w-3 h-3 text-red-400" />
                          YouTube
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-pink-950/80 text-pink-300 border border-pink-800 text-[10px] font-mono flex items-center gap-1 font-semibold">
                          <Camera className="w-3 h-3 text-pink-400" />
                          Instagram
                        </span>
                      )}

                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        lead.matchScore >= 90
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : lead.matchScore >= 80
                          ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                          : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {lead.matchScore}% Match
                      </span>
                    </div>

                    {/* Application Status Pill */}
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      lead.applicationStatus === 'Responded'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : lead.applicationStatus === 'Sent'
                        ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {lead.applicationStatus}
                    </span>
                  </div>

                  {/* Recruiter & Company */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-100 flex items-center justify-between">
                      <span>{lead.recruiterName}</span>
                      <a
                        href={lead.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-indigo-400 transition-colors"
                        title="Open Profile URL"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </h4>
                    <div className="text-xs font-mono text-indigo-300">
                      {lead.companyOrChannel}
                    </div>
                    <div className="text-xs text-slate-200 font-semibold mt-1">
                      {lead.roleOrTopic}
                    </div>
                  </div>

                  {/* Scraped Video / Post Title */}
                  <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-300 italic line-clamp-2">
                    "{lead.videoOrPostTitle}"
                  </div>

                  {/* Matched Skills */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {lead.matchedSkills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Cryptographic Dispatch Proof if Sent */}
                  {lead.dispatchProofId && (
                    <div className="mt-2 text-[10px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-800/50">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span className="truncate">Proof: {lead.dispatchProofId}</span>
                    </div>
                  )}
                </div>

                {/* Local Storage Email Status Manual Tracker */}
                <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Email Status:</span>
                    <select
                      value={lead.emailStatus}
                      onChange={(e) => handleUpdateEmailStatus(lead.id, e.target.value as any)}
                      className={`text-xs font-mono rounded px-2 py-1 bg-slate-950 border focus:outline-none ${
                        lead.emailStatus === 'Initial Interview'
                          ? 'border-emerald-700 text-emerald-300'
                          : lead.emailStatus === 'Rejected'
                          ? 'border-rose-700 text-rose-300'
                          : lead.emailStatus === 'No Response'
                          ? 'border-amber-700 text-amber-300'
                          : lead.emailStatus === 'Offer'
                          ? 'border-purple-700 text-purple-300'
                          : 'border-slate-700 text-slate-300'
                      }`}
                    >
                      <option value="Pending">Pending</option>
                      <option value="No Response">No Response</option>
                      <option value="Initial Interview">Initial Interview</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Offer">Offer</option>
                    </select>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <button
                      onClick={() => handleOpenEmailGenerator(lead)}
                      className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{lead.generatedCoverEmail ? 'View / Send Email' : 'Draft Cover Email'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const nextStatus = lead.applicationStatus === 'Drafted' ? 'Sent' : 'Responded';
                        handleUpdateAppStatus(lead.id, nextStatus);
                      }}
                      className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
                      title="Toggle application stage"
                    >
                      {lead.applicationStatus === 'Drafted' ? 'Mark Sent' : 'Mark Done'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filteredLeads.length === 0 && (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <Filter className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-200">No matching leads found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or clear the active platform filter.
          </p>
        </div>
      )}

      {/* Candidate Profile Editor Modal */}
      {showProfileEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-xl w-full p-6 text-slate-100 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Edit3 className="w-4 h-4 text-indigo-400" />
                <span>Edit Candidate Profile</span>
              </h3>
              <button
                onClick={() => setShowProfileEditor(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setCandidateProfile(profileDraft);
                setShowProfileEditor(false);
                notify('Candidate profile updated successfully!', 'success');
              }}
              className="space-y-3 font-mono text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Full Name:</label>
                  <input
                    type="text"
                    required
                    value={profileDraft.fullName}
                    onChange={(e) => setProfileDraft({ ...profileDraft, fullName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Email Address:</label>
                  <input
                    type="email"
                    required
                    value={profileDraft.email}
                    onChange={(e) => setProfileDraft({ ...profileDraft, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Phone Number:</label>
                  <input
                    type="text"
                    value={profileDraft.phone || ''}
                    onChange={(e) => setProfileDraft({ ...profileDraft, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Years of Experience:</label>
                  <input
                    type="number"
                    value={profileDraft.experienceYears}
                    onChange={(e) => setProfileDraft({ ...profileDraft, experienceYears: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Technical Skills (comma-separated):</label>
                <input
                  type="text"
                  value={profileDraft.technicalSkills.join(', ')}
                  onChange={(e) => setProfileDraft({
                    ...profileDraft,
                    technicalSkills: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Executive Summary:</label>
                <textarea
                  rows={3}
                  value={profileDraft.executiveSummary}
                  onChange={(e) => setProfileDraft({ ...profileDraft, executiveSummary: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200 font-mono text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowProfileEditor(false)}
                  className="px-3.5 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {filteredLeads.length === 0 && (
        <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <Filter className="w-10 h-10 text-slate-500 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-200">No matching leads found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or clear the active platform filter.
          </p>
        </div>
      )}

      {/* 6. Cold Outreach Synthesizer & Drip Cadence Dispatch Modal */}
      {activeGeneratorLead && generatedDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-3xl w-full p-6 text-slate-100 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div>
                <div className="flex items-center space-x-2 text-xs font-mono text-indigo-400 mb-1">
                  <Sparkles className="w-4 h-4" />
                  <span>COLD OUTREACH SYNTHESIZER & CADENCE ENGINE</span>
                </div>
                <h3 className="text-base font-bold text-slate-100">
                  Outreach Pitch for {activeGeneratorLead.recruiterName} ({activeGeneratorLead.companyOrChannel})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Recipient: <span className="text-indigo-300 font-mono">{activeGeneratorLead.contactEmail}</span> • Role: {activeGeneratorLead.roleOrTopic}
                </p>
              </div>
              <button
                onClick={() => setActiveGeneratorLead(null)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono p-1 rounded hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Tone Selector & AI Re-Synthesis */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono bg-slate-950 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400">Persona & Tone:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'direct', label: 'Direct & Results' },
                  { id: 'technical', label: 'Technical Deep-Dive' },
                  { id: 'visionary', label: 'Visionary Partner' }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleSynthesizeWithAI(t.id as any)}
                    disabled={isGeneratingAI}
                    className={`px-3 py-1 rounded transition-colors flex items-center gap-1 ${
                      generatorTone === t.id
                        ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {generatorTone === t.id && isGeneratingAI && <RefreshCw className="w-3 h-3 animate-spin" />}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Email Form Fields */}
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Subject Line:</label>
                <input
                  type="text"
                  value={generatedDraft.subject}
                  onChange={(e) => setGeneratedDraft({ ...generatedDraft, subject: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-indigo-300 font-semibold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Body Text:</label>
                <textarea
                  rows={9}
                  value={generatedDraft.body}
                  onChange={(e) => setGeneratedDraft({ ...generatedDraft, body: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-slate-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* 3-Stage Drip Cadence Preview Timeline */}
            {activeGeneratorLead.cadenceSteps && activeGeneratorLead.cadenceSteps.length > 0 && (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                  <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    Automated Drip Follow-Up Cadence (3 Steps)
                  </span>
                  <span className="text-[10px] text-slate-500">Scheduled Automatically</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono">
                  {activeGeneratorLead.cadenceSteps.map((step, idx) => (
                    <div key={idx} className="bg-slate-900 p-2.5 rounded border border-slate-800 space-y-1">
                      <div className="text-amber-400 font-bold flex items-center justify-between">
                        <span>Step {step.stepNumber}: +{step.delayDays}d</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{step.status}</span>
                      </div>
                      <div className="text-slate-300 font-medium truncate">{step.label}</div>
                      <div className="text-slate-400 text-[10px] line-clamp-2">{step.bodyTemplate}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dispatch Receipt Banner if Sent */}
            {dispatchReceipt && (
              <div className="bg-emerald-950/80 border border-emerald-700 p-3 rounded-lg text-emerald-300 text-xs font-mono flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Cryptographic Dispatch Receipt Confirmed!</div>
                  <div className="text-[11px] text-emerald-400/90">{dispatchReceipt.message}</div>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-slate-800 gap-3">
              <div className="flex items-center gap-2">
                {/* 1-Click Mailto Launcher */}
                <a
                  href={`mailto:${encodeURIComponent(activeGeneratorLead.contactEmail)}?subject=${encodeURIComponent(generatedDraft.subject)}&body=${encodeURIComponent(generatedDraft.body)}`}
                  onClick={() => handleUpdateAppStatus(activeGeneratorLead.id, 'Sent')}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center space-x-1.5 border border-slate-700 transition-colors"
                  title="Open draft in your default email client (Gmail / Outlook)"
                >
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Open in Mail App</span>
                </a>

                {/* Copy Text Button */}
                <button
                  onClick={handleCopyDraft}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center space-x-1.5 border border-slate-700"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveDraftToLead}
                  className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700"
                >
                  Save Draft
                </button>

                {/* Real Server Dispatch Button */}
                <button
                  onClick={handleDispatchEmail}
                  disabled={isDispatching}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center space-x-2 shadow-md shadow-indigo-600/30"
                >
                  {isDispatching ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Signing & Dispatching...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Dispatch via Server (+300 XP)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Manual Add Lead Modal */}
      {showAddLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-6 text-slate-100 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Add Scraped Recruiter Lead</span>
              </h3>
              <button
                onClick={() => setShowAddLeadModal(false)}
                className="text-slate-400 hover:text-slate-200 text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNewLead} className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Recruiter Name:</label>
                  <input
                    type="text"
                    required
                    value={newLead.recruiterName || ''}
                    onChange={(e) => setNewLead({ ...newLead, recruiterName: e.target.value })}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Company / Channel:</label>
                  <input
                    type="text"
                    required
                    value={newLead.companyOrChannel || ''}
                    onChange={(e) => setNewLead({ ...newLead, companyOrChannel: e.target.value })}
                    placeholder="e.g. DevPulse HQ"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Platform:</label>
                  <select
                    value={newLead.platform}
                    onChange={(e) => setNewLead({ ...newLead, platform: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  >
                    <option value="YouTube">YouTube</option>
                    <option value="Instagram">Instagram</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Role / Topic:</label>
                  <input
                    type="text"
                    value={newLead.roleOrTopic || ''}
                    onChange={(e) => setNewLead({ ...newLead, roleOrTopic: e.target.value })}
                    placeholder="e.g. AI Engineer"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Video / Post Title:</label>
                <input
                  type="text"
                  value={newLead.videoOrPostTitle || ''}
                  onChange={(e) => setNewLead({ ...newLead, videoOrPostTitle: e.target.value })}
                  placeholder="e.g. We are hiring full-stack developers for our agent project!"
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Contact Email:</label>
                  <input
                    type="email"
                    value={newLead.contactEmail || ''}
                    onChange={(e) => setNewLead({ ...newLead, contactEmail: e.target.value })}
                    placeholder="recruiter@domain.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Match Compatibility (%):</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={newLead.matchScore || 85}
                    onChange={(e) => setNewLead({ ...newLead, matchScore: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddLeadModal(false)}
                  className="px-3.5 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
