import { CandidateCVFacts, VoiceDNARules, ASTVerificationResult } from '../types/careerOps';

export class CareerOpsVerifier {
  private cvFacts: CandidateCVFacts;
  private voiceDNA: VoiceDNARules;

  constructor(cvFacts: CandidateCVFacts, voiceDNA: VoiceDNARules) {
    this.cvFacts = cvFacts;
    this.voiceDNA = voiceDNA;
  }

  /**
   * Computes a 64-bit Hex Hash / SimHash Fingerprint of a raw Job Description
   */
  public static computeJDFingerprint(rawJD: string): string {
    if (!rawJD || rawJD.trim().length === 0) return '0000000000000000';
    // Clean and normalize text
    const clean = rawJD.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
    
    // 64-bit FNV-1a style hash simulation for SimHash representation
    let h1 = 0x811c9dc5;
    let h2 = 0x811c9dc5 ^ 0x55555555;
    for (let i = 0; i < clean.length; i++) {
      const code = clean.charCodeAt(i);
      h1 = Math.imul(h1 ^ code, 0x01000193);
      h2 = Math.imul(h2 ^ (code + i), 0x01000193);
    }
    const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
    const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
    return `${hex1}${hex2}`.toUpperCase();
  }

  /**
   * Scans text for unauthorized technical skills not present in Candidate Ground Truth allowlist
   */
  public scanForUnauthorizedSkills(generatedText: string): { unauthorized: string[]; allowedFound: string[] } {
    if (!generatedText) return { unauthorized: [], allowedFound: [] };

    // Common technical buzzwords/languages that might be hallucinated
    const potentialTechDictionary = [
      'Rust', 'Go', 'Golang', 'Java', 'C++', 'C#', '.NET', 'Scala', 'Kotlin', 'Swift', 'PHP', 'Ruby',
      'Solidity', 'Web3', 'Ethereum', 'Smart Contracts', 'Haskell', 'Elixir', 'Erlang', 'Perl',
      'Cassandra', 'DynamoDB', 'MongoDB', 'Neo4j', 'Snowflake', 'BigQuery', 'Apache Spark', 'Flink',
      'Kafka', 'RabbitMQ', 'AWS Lambda', 'GCP Vertex AI', 'Azure OpenAI', 'Terraform', 'Ansible',
      'Helm', 'Vault', 'Consul', 'Istio', 'Envoy', 'TensorFlow', 'PyTorch', 'HuggingFace', 'LangChain',
      'LlamaIndex', 'ChromaDB', 'Pinecone', 'Qdrant', 'Milvus', 'WebAssembly', 'Wasm', 'Next.js',
      'Nuxt.js', 'Angular', 'Vue.js', 'Svelte', 'Solid.js', 'Remix', 'Gatsby', 'Django', 'Flask',
      'FastAPI', 'Spring Boot', 'Laravel', 'Rails', 'ASP.NET', 'GraphQL'
    ];

    const normalizedAllowlist = this.cvFacts.skills_allowlist.map(s => s.toLowerCase().trim());
    const lowerText = generatedText.toLowerCase();

    const unauthorized: string[] = [];
    const allowedFound: string[] = [];

    // Find allowed skills actually cited
    this.cvFacts.skills_allowlist.forEach(skill => {
      const regex = new RegExp(`\\b${this.escapeRegex(skill.toLowerCase())}\\b`, 'i');
      if (regex.test(lowerText)) {
        allowedFound.push(skill);
      }
    });

    // Check potential unlisted techs
    potentialTechDictionary.forEach(tech => {
      const isAllowed = normalizedAllowlist.some(allowed => 
        allowed === tech.toLowerCase() || 
        (tech.toLowerCase() === 'golang' && allowed === 'go') ||
        (tech.toLowerCase() === 'go' && allowed === 'golang')
      );

      if (!isAllowed) {
        const regex = new RegExp(`\\b${this.escapeRegex(tech.toLowerCase())}\\b`, 'i');
        if (regex.test(lowerText)) {
          unauthorized.push(tech);
        }
      }
    });

    return { unauthorized: Array.from(new Set(unauthorized)), allowedFound: Array.from(new Set(allowedFound)) };
  }

  /**
   * Scans text for forbidden claims
   */
  public scanForForbiddenClaims(generatedText: string): string[] {
    if (!generatedText) return [];
    const detected: string[] = [];
    const lower = generatedText.toLowerCase();

    const claimChecks = [
      { pattern: /managed (\d{2,}|tens of|hundreds of) engineers/i, desc: "Managing >12 engineers" },
      { pattern: /founded (a |the )?fortune 500/i, desc: "Founding a Fortune 500 company" },
      { pattern: /\bph\.?d\b|top secret clearance/i, desc: "Holding PhD or Top Secret Clearance" },
      { pattern: /\$50m\+? arr/i, desc: "Single-handedly generating $50M+ ARR" },
      { pattern: /production (solidity|rust|haskell) smart contracts/i, desc: "Production Rust/Solidity claim" }
    ];

    claimChecks.forEach(check => {
      if (check.pattern.test(lower)) {
        detected.push(check.desc);
      }
    });

    return detected;
  }

  /**
   * Scans for banned Voice DNA buzzwords & slop
   */
  public scanForBannedBuzzwords(generatedText: string): string[] {
    if (!generatedText) return [];
    const lower = generatedText.toLowerCase();
    const detected: string[] = [];

    this.voiceDNA.banned_buzzwords.forEach(word => {
      const regex = new RegExp(`\\b${this.escapeRegex(word.toLowerCase())}\\b`, 'i');
      if (regex.test(lower)) {
        detected.push(word);
      }
    });

    return Array.from(new Set(detected));
  }

  /**
   * Comprehensive AST and Hallucination Verification
   */
  public verify(generatedContent: string): ASTVerificationResult {
    const { unauthorized, allowedFound } = this.scanForUnauthorizedSkills(generatedContent);
    const forbiddenClaims = this.scanForForbiddenClaims(generatedContent);
    const bannedWords = this.scanForBannedBuzzwords(generatedContent);

    // Compute Voice DNA Purity Score (100 base, deductions for slop and unauthorized tech)
    let score = 100;
    score -= bannedWords.length * 12;
    score -= unauthorized.length * 15;
    score -= forbiddenClaims.length * 25;
    score = Math.max(0, Math.min(100, score));

    const isCompliant = unauthorized.length === 0 && forbiddenClaims.length === 0 && bannedWords.length === 0;

    let details = 'Pristine Ground Truth Adherence: Zero hallucinated skills, zero forbidden claims, and 100% Voice DNA compliance.';
    if (!isCompliant) {
      const issues: string[] = [];
      if (unauthorized.length > 0) issues.push(`Unauthorized technical skills: ${unauthorized.join(', ')}`);
      if (forbiddenClaims.length > 0) issues.push(`Forbidden claims violated: ${forbiddenClaims.join(', ')}`);
      if (bannedWords.length > 0) issues.push(`Banned buzzwords detected: ${bannedWords.join(', ')}`);
      details = `Verification Warning: ${issues.join(' | ')}`;
    }

    return {
      isCompliant,
      unauthorizedSkillsFound: unauthorized,
      forbiddenClaimsFound: forbiddenClaims,
      bannedWordsDetected: bannedWords,
      voiceDNAScore: score,
      allowedSkillsCovered: allowedFound,
      auditTimestamp: new Date().toISOString(),
      details
    };
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
