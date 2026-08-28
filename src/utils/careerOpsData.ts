import { CandidateCVFacts, CandidateProfileConfig, VoiceDNARules } from '../types/careerOps';

export const DEFAULT_CV_FACTS: CandidateCVFacts = {
  basics: {
    fullName: "Adv. Akash",
    email: "Adv.akash2356@gmail.com",
    phone: "+1 (555) 019-2834",
    location: "San Francisco, CA (Remote Open)",
    visaStatus: "US Citizen / Authorized to Work in US",
    clearanceLevel: "None",
    github: "github.com/akash-arch",
    linkedin: "linkedin.com/in/adv-akash",
    portfolio: "akash-systems.dev"
  },
  roles: [
    {
      company: "Autonomous AI Dynamics",
      role: "Lead Distributed Systems Architect",
      startDate: "2022-03",
      endDate: "Present",
      location: "San Francisco, CA (Remote)",
      metrics: [
        "Architected multi-agent DAG engine processing 1.2M daily subtasks with sub-450ms p95 latency.",
        "Reduced token latency by 35% and LLM compute costs by $180,000/yr using DSPy-inspired L3 Meta-Critic evaluation loops.",
        "Designed zero-trust OIDC identity anchors preventing 100% of unauthorized privileged executions."
      ],
      technicalAccomplishments: [
        "Constructed topological execution pipeline in TypeScript/Node.js with automated deadlock arbitration.",
        "Deployed distributed vector episodic memory store with hybrid cosine + semantic graph querying.",
        "Engineered real-time telemetry streaming and circuit breakers with automated rate throttling."
      ]
    },
    {
      company: "HyperScale Cloud Systems",
      role: "Senior Full-Stack AI Engineer",
      startDate: "2019-06",
      endDate: "2022-02",
      location: "San Jose, CA",
      metrics: [
        "Led migration of monolithic microservices to event-driven serverless architecture, improving throughput by 4x.",
        "Built high-performance React 19 UI design system serving 85,000 daily active enterprise users.",
        "Decreased client bundle size by 42% via tree-shaking and aggressive code-splitting."
      ],
      technicalAccomplishments: [
        "Implemented end-to-end WebSocket telemetry feed with 60fps canvas visualizers in React.",
        "Integrated PostgreSQL and Redis caching layers handling 12,000 queries/sec with 99.99% uptime."
      ]
    },
    {
      company: "Nexus Software Labs",
      role: "Software Engineer - Infrastructure",
      startDate: "2017-08",
      endDate: "2019-05",
      location: "Austin, TX",
      metrics: [
        "Automated CI/CD deployment pipelines cutting deployment cycle from 45 mins to 6 mins.",
        "Maintained 99.98% SLA across 40+ Kubernetes production microservices."
      ],
      technicalAccomplishments: [
        "Configured Prometheus and Grafana alerts for distributed cluster monitoring.",
        "Authored internal developer tooling in Go and TypeScript."
      ]
    }
  ],
  education: [
    {
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science & Distributed Systems",
      startYear: "2013",
      endYear: "2017"
    }
  ],
  skills_allowlist: [
    "TypeScript",
    "React 19",
    "Node.js",
    "Express",
    "Python",
    "PostgreSQL",
    "Redis",
    "Distributed Systems",
    "DAG Planning",
    "Zero-Trust Architecture",
    "OAuth / OIDC",
    "Tailwind CSS",
    "Docker",
    "Kubernetes",
    "REST APIs",
    "GraphQL",
    "Gemini API",
    "Vector Databases",
    "DSPy Prompt Optimization",
    "CI/CD Pipelines",
    "Git",
    "Linux Systems"
  ],
  forbidden_claims: [
    "No claim of managing teams larger than 12 engineers",
    "No claim of founding a Fortune 500 company",
    "No claim of holding a PhD or Active Top Secret Security Clearance",
    "No claim of writing production Rust, Haskell, or Solidity smart contracts",
    "No claim of single-handedly generating $50M+ ARR"
  ],
  verified_achievements: [
    {
      id: "achieve-01",
      title: "1.2M Daily DAG Tasks Throughput",
      metric: "1,200,000 tasks/day at 450ms p95 latency",
      context: "Built asynchronous topological worker executor at Autonomous AI Dynamics",
      technologies: ["TypeScript", "Node.js", "Redis", "Distributed Systems"]
    },
    {
      id: "achieve-02",
      title: "$180k/yr Compute Cost Reduction",
      metric: "35% latency drop, $180,000 annual token savings",
      context: "Implemented L3 Meta-Critic telemetry feedback loop to mutate redundant prompts",
      technologies: ["DSPy Prompt Optimization", "Gemini API", "Python"]
    },
    {
      id: "achieve-03",
      title: "Zero-Trust RBAC Identity Anchors",
      metric: "100% zero unauthorized executions across 45,000 authenticated sessions",
      context: "Formulated signed OIDC token verification protocol",
      technologies: ["OAuth / OIDC", "Zero-Trust Architecture", "Node.js"]
    }
  ]
};

export const DEFAULT_PROFILE_CONFIG: CandidateProfileConfig = {
  seniority_levels: ["Staff", "Lead", "Principal", "Senior"],
  target_roles: [
    "Staff AI Systems Architect",
    "Lead Distributed Systems Engineer",
    "Senior Full-Stack AI Platform Lead",
    "Principal Software Engineer"
  ],
  compensation: {
    minimum_base_usd: 195000,
    target_base_usd: 240000,
    minimum_total_usd: 280000,
    currency: "USD"
  },
  locations: {
    primary: "San Francisco Bay Area, CA / Remote",
    remote_ok: true,
    relocation_ok: false,
    acceptable_timezones: ["PST", "MST", "CST", "EST"]
  },
  red_flags: {
    banned_technologies: ["PHP", "COBOL", "Visual Basic", "Flash", "Legacy SOAP"],
    banned_keywords: ["rockstar ninja", "unpaid overtime", "family culture", "wear all hats without equity", "strict return to office 5 days"],
    companies_blacklist: ["ShadyCryptoHoldings", "SpamAdsMediaNet"]
  }
};

export const DEFAULT_VOICE_DNA: VoiceDNARules = {
  banned_buzzwords: [
    "spearheaded",
    "orchestrated",
    "transformative journey",
    "synergy",
    "rockstar",
    "ninja",
    "passionate guru",
    "game-changer",
    "leverage best-in-class",
    "thought leader"
  ],
  structural_rule: "Google X-Y-Z Formula: 'Accomplished [X] as measured by [Y] by doing [Z]'. Lead with active technical verbs, quantified outcomes, and explicit architectural patterns.",
  tone: "technical",
  custom_guidelines: [
    "No fluffy adjectives or self-congratulatory claims.",
    "Ground every assertion in verifiable technical metrics.",
    "Format resumes in clean ATS-compliant Markdown with standard headers (# Experience, # Technical Skills, # Education).",
    "Never hallucinate unverified libraries or languages not present in skills_allowlist."
  ]
};

export const SAMPLE_JOB_DESCRIPTIONS = [
  {
    id: "jd-01",
    title: "Staff AI Systems Architect",
    company: "Aetheria Intelligence",
    location: "San Francisco, CA (Remote)",
    salaryRange: "$220,000 - $260,000 + Equity (0.15% - 0.25%)",
    text: `About the Role:
Aetheria Intelligence is seeking a Staff AI Systems Architect to lead the design and execution of our autonomous agent orchestration engine. You will architect high-throughput DAG execution systems, zero-trust security protocols, and real-time observability pipelines.

Key Responsibilities:
- Design distributed multi-agent task planning systems executing millions of asynchronous requests daily.
- Implement strict schema verification, token cost optimization, and dynamic prompt evaluation loops.
- Partner with security teams to establish sovereign RBAC and cryptographic identity anchors.
- Mentor senior engineers in TypeScript, Node.js, and distributed system design patterns.

Requirements:
- 6+ years of experience in distributed systems, backend engineering, and high-concurrency architectures.
- Deep expertise with TypeScript, Node.js, Express, and PostgreSQL/Redis caching layers.
- Hands-on experience with LLM APIs (Gemini/OpenAI) and automated prompt evaluation / DSPy-style optimization.
- Strong grounding in zero-trust architecture, OAuth/OIDC, and containerized deployments (Docker/Kubernetes).
- Proven track record of delivering measurable latency and cost optimizations.`
  },
  {
    id: "jd-02",
    title: "Lead Distributed Platform Engineer",
    company: "Vortex Scale Labs",
    location: "Remote (US/Canada)",
    salaryRange: "$205,000 - $245,000 + Performance Bonus",
    text: `About the Role:
Vortex Scale Labs is hiring a Lead Distributed Platform Engineer to scale our core event-driven infrastructure. You will own our microservices backbone, data pipelines, and telemetry dashboards.

Responsibilities:
- Build fault-tolerant event streams handling 50k+ events/sec with sub-50ms processing.
- Maintain and enhance our TypeScript/Node microservices with automated circuit breakers and retry policies.
- Build developer-facing observability UIs in React and modern Tailwind CSS.
- Optimize database query performance across sharded PostgreSQL instances.

Qualifications:
- 5+ years of software engineering experience with deep TypeScript & Node.js mastery.
- Experience building production React applications and real-time WebSocket feeds.
- Strong knowledge of distributed storage, caching strategies (Redis), and CI/CD pipelines.
- Bachelor's degree in Computer Science or equivalent practical experience.`
  },
  {
    id: "jd-03",
    title: "Senior Full-Stack AI Engineer",
    company: "Cognitive Nexus",
    location: "San Francisco, CA / Hybrid",
    salaryRange: "$195,000 - $230,000 + Equity",
    text: `Cognitive Nexus is building next-generation enterprise AI assistants. We need a Senior Full-Stack AI Engineer to ship end-to-end features spanning React frontend interfaces and backend agent orchestrators.

What You'll Do:
- Build responsive, modern web interfaces in React 19 and Tailwind CSS.
- Develop backend APIs in Node.js/TypeScript connecting to vector databases and LLM endpoints.
- Ensure strict zero-trust data privacy and SOC2 compliance across all client interactions.

What We Look For:
- 4+ years of full-stack engineering experience (React, TypeScript, Node.js, PostgreSQL).
- Experience integrating LLM APIs and prompt optimization workflows.
- Pragmatic problem solver who writes clean, testable, type-safe code.`
  }
];
