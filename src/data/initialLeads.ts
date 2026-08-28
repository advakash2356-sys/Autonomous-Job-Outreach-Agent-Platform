import { JobLead, MatchingBadge } from '../types';

export const INITIAL_JOB_LEADS: JobLead[] = [
  {
    id: 'lead-yt-01',
    recruiterName: 'Alex Rivera',
    companyOrChannel: 'TechLead Pulse (YouTube)',
    platform: 'YouTube',
    profileUrl: 'https://youtube.com/@techleadpulse',
    contactEmail: 'alex.rivera@techleadpulse.io',
    roleOrTopic: 'Senior Full-Stack AI Engineer',
    videoOrPostTitle: 'We are hiring 3 Senior Full-Stack Engineers to build autonomous agent runtimes! (Link in description)',
    scrapedAt: '2026-08-22T14:30:00Z',
    applicationStatus: 'Sent',
    emailStatus: 'Initial Interview',
    matchScore: 94,
    matchedSkills: ['TypeScript', 'React', 'Agent DAG Planning', 'Node.js', 'Express', 'Distributed Systems'],
    notes: 'Recruiter Alex mentioned looking for engineers with experience in DAG task orchestration and zero-trust auth.',
    generatedCoverEmail: `Subject: Senior Full-Stack AI Engineer Role — Autonomous Agent Framework Architect

Hi Alex,

I saw your recent YouTube announcement regarding the Senior Full-Stack AI Engineer openings at TechLead Pulse. Your focus on building deterministic DAG execution graphs and zero-trust authentication mirrors the exact autonomous agent framework I architected.

In my recent project, I built an enterprise-grade agent orchestration framework with:
- Topological parallel DAG task execution with cyclic dependency prevention
- Zero-trust RBAC with signed OIDC validation anchored to sovereign admin identities
- L3 Evaluator-Optimizer recursive prompt mutation loops with DSPy-style benchmarking

I would love to walk you through a live demonstration of my agent DAG engine and discuss how I can contribute to your infrastructure immediately.

Best regards,
Adv. Akash
Adv.akash2356@gmail.com`,
    sentAt: '2026-08-22T16:00:00Z',
    lastUpdated: '2026-08-23T01:10:00Z'
  },
  {
    id: 'lead-ig-02',
    recruiterName: 'Elena Rostova',
    companyOrChannel: 'ScaleAI Creators (Instagram)',
    platform: 'Instagram',
    profileUrl: 'https://instagram.com/scaleai.creators',
    contactEmail: 'elena@scalecreators.dev',
    roleOrTopic: 'Lead Frontend / Design Systems Architect',
    videoOrPostTitle: 'Hiring Alert: Looking for UI/UX-focused React & Tailwind maestros for our creator dashboard redesign. DM or email portfolio!',
    scrapedAt: '2026-08-22T18:15:00Z',
    applicationStatus: 'Drafted',
    emailStatus: 'Pending',
    matchScore: 88,
    matchedSkills: ['React 19', 'Tailwind CSS', 'Accessible UI', 'Design Systems', 'Micro-interactions'],
    notes: 'Elena emphasized high aesthetic polish, zero-slop UI design, and responsive data visualization components.',
    generatedCoverEmail: `Subject: Lead Frontend Architect Application — High-Fidelity UI & Design Systems

Hi Elena,

I noticed your Instagram hiring alert for the Lead Frontend Architect role at ScaleAI Creators. As someone who rigorously builds anti-slop, mathematically spaced user interfaces in React and Tailwind CSS, your vision for the creator dashboard redesign resonates strongly.

My recent projects strictly enforce mathematical step-ratios, zero-trust state handling, and dense responsive layouts without unnecessary bloat. 

Looking forward to connecting and sharing interactive preview demos!

Best,
Adv. Akash
Adv.akash2356@gmail.com`,
    lastUpdated: '2026-08-22T20:00:00Z'
  },
  {
    id: 'lead-yt-03',
    recruiterName: 'Marcus Vance',
    companyOrChannel: 'CloudNative Frontier (YouTube)',
    platform: 'YouTube',
    profileUrl: 'https://youtube.com/@cloudnativefrontier',
    contactEmail: 'marcus.v@cloudnativefrontier.com',
    roleOrTopic: 'Systems & Backend Reliability Engineer',
    videoOrPostTitle: 'Episode #142: Building Sovereign Cloud Systems + We Are Hiring Remote Backend Engineers',
    scrapedAt: '2026-08-21T11:00:00Z',
    applicationStatus: 'Responded',
    emailStatus: 'Initial Interview',
    matchScore: 91,
    matchedSkills: ['Node.js', 'Express', 'Zero-Trust Security', 'Telemetry & Metrics', 'Cloud Containers'],
    notes: 'Initial response received. Scheduled 30-min technical architecture call for Monday.',
    sentAt: '2026-08-21T14:20:00Z',
    lastUpdated: '2026-08-22T19:40:00Z'
  },
  {
    id: 'lead-ig-04',
    recruiterName: 'Sophia Lin',
    companyOrChannel: 'NextGen Founders Studio (Instagram)',
    platform: 'Instagram',
    profileUrl: 'https://instagram.com/nextgenfounders.studio',
    contactEmail: 'sophia@nextgenfounders.vc',
    roleOrTopic: 'AI Solutions Engineer / Prototyper',
    videoOrPostTitle: 'Reels: 3 startups in our portfolio are looking for fast-moving AI prototype engineers who ship daily. Drop your email below!',
    scrapedAt: '2026-08-21T09:30:00Z',
    applicationStatus: 'Sent',
    emailStatus: 'No Response',
    matchScore: 82,
    matchedSkills: ['Rapid Prototyping', 'Gemini API', 'TypeScript', 'Full-Stack'],
    notes: 'Follow-up email planned in 2 business days if no reply.',
    sentAt: '2026-08-21T10:45:00Z',
    lastUpdated: '2026-08-22T10:45:00Z'
  },
  {
    id: 'lead-yt-05',
    recruiterName: 'Devon Wright',
    companyOrChannel: 'DataEngine Weekly (YouTube)',
    platform: 'YouTube',
    profileUrl: 'https://youtube.com/@dataengineweekly',
    contactEmail: 'devon@dataengineweekly.io',
    roleOrTopic: 'Senior Data & LLM Pipeline Engineer',
    videoOrPostTitle: 'Live Stream: Evaluating Multi-Agent Memory & RAG Retrieval at Scale (We are hiring engineers!)',
    scrapedAt: '2026-08-20T16:00:00Z',
    applicationStatus: 'Sent',
    emailStatus: 'Rejected',
    matchScore: 76,
    matchedSkills: ['Vector Embeddings', 'Cosine Similarity', 'Episodic Memory', 'Data Extraction'],
    notes: 'Position filled internally, but Devon requested keeping resume on file for Q4 expansion.',
    sentAt: '2026-08-20T17:15:00Z',
    lastUpdated: '2026-08-22T08:30:00Z'
  },
  {
    id: 'lead-ig-06',
    recruiterName: 'Maya Patel',
    companyOrChannel: 'CyberOps Network (Instagram)',
    platform: 'Instagram',
    profileUrl: 'https://instagram.com/cyberops_network',
    contactEmail: 'careers@cyberopsnetwork.sec',
    roleOrTopic: 'Security & Zero-Trust Governance Engineer',
    videoOrPostTitle: 'Story: Urgent opening for DevSecOps engineer with strong cryptographic audit & RBAC implementation chops.',
    scrapedAt: '2026-08-23T01:20:00Z',
    applicationStatus: 'Drafted',
    emailStatus: 'Pending',
    matchScore: 96,
    matchedSkills: ['Zero-Trust RBAC', 'Cryptographic Signatures', 'OIDC Token Validation', 'Emergency Kill-Switch Protocols'],
    notes: 'Extremely high match for sovereign admin security protocols.',
    lastUpdated: '2026-08-23T01:20:00Z'
  }
];

export const INITIAL_MATCHING_BADGES: MatchingBadge[] = [
  {
    id: 'badge-first-match',
    title: 'First Contact',
    description: 'Match candidate credentials against your first scraped recruiter lead',
    icon: 'Sparkles',
    unlocked: true,
    progress: 1,
    target: 1,
    unlockedAt: '2026-08-20T16:05:00Z'
  },
  {
    id: 'badge-platform-hunter',
    title: 'Cross-Platform Scout',
    description: 'Extract leads from both YouTube and Instagram channels',
    icon: 'Compass',
    unlocked: true,
    progress: 2,
    target: 2,
    unlockedAt: '2026-08-21T09:35:00Z'
  },
  {
    id: 'badge-high-match',
    title: '90%+ Compatibility Ace',
    description: 'Score 90% or higher match compatibility with 3 different job leads',
    icon: 'Target',
    unlocked: true,
    progress: 3,
    target: 3,
    unlockedAt: '2026-08-22T14:35:00Z'
  },
  {
    id: 'badge-interview-catalyst',
    title: 'Interview Catalyst',
    description: 'Convert application outreach into active initial interview stages',
    icon: 'Award',
    unlocked: true,
    progress: 2,
    target: 2,
    unlockedAt: '2026-08-22T19:45:00Z'
  },
  {
    id: 'badge-grandmaster',
    title: 'Outreach Grandmaster',
    description: 'Reach 10 matched leads with tailored cover emails in local pipeline',
    icon: 'Trophy',
    unlocked: false,
    progress: 6,
    target: 10
  }
];
