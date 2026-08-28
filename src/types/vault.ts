export interface VaultCalendarEvent {
  id: string;
  title: string;
  date: string; // e.g. "2026-08-28" or "2026-10-15"
  time?: string; // e.g. "15:00"
  isoDateTime?: string; // e.g. "2026-08-28T15:00:00.000Z"
  durationMinutes?: number;
  participants: string[];
  locationOrLink?: string;
  description: string;
  category: 'Meeting' | 'Deadline' | 'Milestone' | 'Reminder' | 'Call' | 'Review' | 'General';
  sourceCommitId?: string;
}

export interface VaultTask {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  status: 'pending' | 'in_progress' | 'completed';
  assignee?: string;
  tags: string[];
  estimatedMinutes?: number;
  sourceCommitId?: string;
  createdAt: string;
}

export interface VaultNote {
  id: string;
  title: string;
  category: string;
  summaryText: string;
  keyTakeaways: string[];
  bulletPoints: string[];
  entitiesMentioned: string[];
  actionableNextSteps: string[];
  sourceCommitId?: string;
  createdAt: string;
}

export interface LLMRoutedPayload {
  summaryNotes: VaultNote[];
  calendarEvents: VaultCalendarEvent[];
  tasks: VaultTask[];
  detectedIntents: string[];
  routingDestinations: ('vault_calendar' | 'vault_tasks' | 'vault_notes')[];
  confidenceScore: number;
  rawTranscript: string;
  processingLatencyMs?: number;
}

export interface VaultCommitRecord {
  commitId: string;
  timestamp: string;
  rawTranscript: string;
  signatureHash: string;
  eventsCount: number;
  tasksCount: number;
  notesCount: number;
  intents: string[];
  confidenceScore: number;
  status: 'COMMITTED' | 'REVERTED';
}

export interface VaultState {
  version: string;
  lastUpdated: string;
  events: VaultCalendarEvent[];
  tasks: VaultTask[];
  notes: VaultNote[];
  commits: VaultCommitRecord[];
  stats: {
    totalTranscriptsProcessed: number;
    totalEvents: number;
    totalTasks: number;
    totalNotes: number;
    activePendingTasks: number;
  };
}

export interface LLMRouterOptions {
  referenceDate?: string;
  actorAnchor?: string;
  silent?: boolean;
  priorityOverride?: 'P0' | 'P1' | 'P2' | 'P3';
}

export interface VaultCommitResult {
  success: boolean;
  commitId: string;
  timestamp: string;
  parsed: LLMRoutedPayload;
  vaultState: VaultState;
  signatureHash: string;
  message?: string;
}
