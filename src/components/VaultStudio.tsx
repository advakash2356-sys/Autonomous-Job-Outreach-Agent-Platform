import React, { useState, useEffect } from 'react';
import {
  VaultState,
  VaultCalendarEvent,
  VaultTask,
  VaultNote,
  VaultCommitRecord,
  LLMRoutedPayload,
  VaultCommitResult
} from '../types/vault';
import {
  routeDictationTranscript,
  getVaultState,
  updateVaultTaskStatus,
  deleteVaultItem,
  clearVaultState
} from '../utils/llmRouter';
import {
  Mic,
  Calendar,
  CheckSquare,
  FileText,
  GitCommit,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Trash2,
  CheckCircle2,
  Clock,
  Tag,
  ShieldCheck,
  Hash,
  Send,
  Zap
} from 'lucide-react';

const SAMPLE_DICTATIONS = [
  {
    label: "Calendar Sync + P0 Security Task + Architecture Decision",
    text: "Schedule a sync with Sarah Chen on Friday at 3pm to review the quarterly multi-agent roadmap. Also need to finish drafting the zero-trust security report by tomorrow with high priority P0, and note that we agreed to migrate all endpoints to v2."
  },
  {
    label: "Emergency Post-Mortem + Critical Bug Fix",
    text: "Urgent P0 task: Patch authentication token signature verification bug before 6pm today. Schedule an emergency post-mortem meeting next Monday at 10am with the distributed systems team to review the telemetry failure taxonomy."
  },
  {
    label: "Optimizer Briefing Note + Performance Milestones",
    text: "Dictation note: Evaluator Optimizer achieved 98.4% accuracy on synthetic regression suite. All challenger prompts promoted to production with sub-450ms latency. Remember to monitor token budget cap on high concurrency sessions."
  }
];

export function VaultStudio({
  sovereignAnchor,
  onNotify
}: {
  sovereignAnchor: string;
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}) {
  const [vaultState, setVaultState] = useState<VaultState | null>(null);
  const [transcriptInput, setTranscriptInput] = useState<string>('');
  const [isRouting, setIsRouting] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'events' | 'tasks' | 'notes' | 'commits'>('all');
  const [lastCommitResult, setLastCommitResult] = useState<VaultCommitResult | null>(null);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');

  useEffect(() => {
    loadVault();

    // Listen for custom reactive vault update events
    const handleVaultUpdate = (e: any) => {
      if (e.detail) {
        setVaultState(e.detail);
      }
    };
    window.addEventListener('vault_state_updated', handleVaultUpdate);
    return () => window.removeEventListener('vault_state_updated', handleVaultUpdate);
  }, []);

  const loadVault = async () => {
    try {
      const state = await getVaultState();
      setVaultState(state);
    } catch (e) {
      console.error('Failed to load vault state', e);
    }
  };

  const handleExecuteRouter = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = transcriptInput.trim();
    if (!text) {
      onNotify('Please enter or dictate a transcript first', 'error');
      return;
    }

    setIsRouting(true);
    try {
      const result = await routeDictationTranscript(text, {
        actorAnchor: sovereignAnchor,
        referenceDate: new Date().toISOString()
      });

      setLastCommitResult(result);
      setVaultState(result.vaultState);
      setTranscriptInput('');
      onNotify(
        `LLM-Router successfully committed ${result.parsed.calendarEvents.length} events, ${result.parsed.tasks.length} tasks, and ${result.parsed.summaryNotes.length} notes.`,
        'success'
      );
    } catch (err: any) {
      console.error('LLM-Router execution failed', err);
      onNotify(`Routing error: ${err.message || 'Unknown error'}`, 'error');
    } finally {
      setIsRouting(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      const updated = await updateVaultTaskStatus(taskId, nextStatus);
      setVaultState(updated);
      onNotify(`Task status updated to ${nextStatus}`, 'info');
    } catch (err) {
      console.error('Failed to toggle task', err);
    }
  };

  const handleDeleteItem = async (type: 'events' | 'tasks' | 'notes', id: string) => {
    try {
      const updated = await deleteVaultItem(type, id);
      setVaultState(updated);
      onNotify('Item removed from Vault', 'info');
    } catch (err) {
      console.error('Failed to delete item', err);
    }
  };

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to reset the Sovereign Vault state?')) {
      await clearVaultState();
      const fresh = await getVaultState();
      setVaultState(fresh);
      setLastCommitResult(null);
      onNotify('Sovereign Vault reset completed', 'info');
    }
  };

  const simulateDictationRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    setIsRecording(true);
    const sample = SAMPLE_DICTATIONS[Math.floor(Math.random() * SAMPLE_DICTATIONS.length)].text;
    let idx = 0;
    setTranscriptInput('');

    const interval = setInterval(() => {
      if (idx < sample.length) {
        setTranscriptInput(prev => prev + sample.charAt(idx));
        idx += 3;
      } else {
        clearInterval(interval);
        setIsRecording(false);
      }
    }, 40);
  };

  const filteredTasks = (vaultState?.tasks || []).filter(t => {
    if (taskFilter === 'pending') return t.status !== 'completed';
    if (taskFilter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-neutral-400 text-xs font-mono mb-1">
              <Zap className="w-4 h-4" />
              <span>INVISIBLE LLM-ROUTER & SOVEREIGN VAULT</span>
            </div>
            <h2 className="text-base font-semibold text-white">
              Deterministic Dictation Parsing & Vault State Engine
            </h2>
            <p className="text-xs text-neutral-400 max-w-3xl mt-1">
              Extracts calendar dates, action tasks, and structured summary notes directly from spoken or written transcripts without context leakage, then commits results atomically to the sovereign state.
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <button
              onClick={loadVault}
              className="px-3 py-1.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 flex items-center space-x-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Sync Vault</span>
            </button>
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700 flex items-center space-x-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>

        {/* Vault Stats Metric Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-neutral-800/80 font-mono text-xs">
          <div className="bg-neutral-900/60 p-2.5 rounded border border-neutral-800">
            <div className="text-neutral-500 text-[10px]">TOTAL COMMITS</div>
            <div className="text-sm font-bold text-white mt-0.5">{vaultState?.stats.totalTranscriptsProcessed || 0}</div>
          </div>
          <div className="bg-neutral-900/60 p-2.5 rounded border border-neutral-800">
            <div className="text-neutral-500 text-[10px]">CALENDAR EVENTS</div>
            <div className="text-sm font-bold text-white mt-0.5">{vaultState?.stats.totalEvents || 0}</div>
          </div>
          <div className="bg-neutral-900/60 p-2.5 rounded border border-neutral-800">
            <div className="text-neutral-500 text-[10px]">ACTION TASKS</div>
            <div className="text-sm font-bold text-white mt-0.5">
              {vaultState?.stats.totalTasks || 0}{' '}
              <span className="text-neutral-400 text-[11px]">({vaultState?.stats.activePendingTasks || 0} pending)</span>
            </div>
          </div>
          <div className="bg-neutral-900/60 p-2.5 rounded border border-neutral-800">
            <div className="text-neutral-500 text-[10px]">SUMMARY NOTES</div>
            <div className="text-sm font-bold text-white mt-0.5">{vaultState?.stats.totalNotes || 0}</div>
          </div>
        </div>
      </div>

      {/* Dictation Input & LLM-Router Execution Panel */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Mic className={`w-4 h-4 ${isRecording ? 'text-white animate-pulse' : 'text-neutral-400'}`} />
            <h3 className="text-sm font-semibold text-white">Spoken Dictation & Raw Transcript Router</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={simulateDictationRecording}
              className={`px-3 py-1 text-xs font-mono rounded border flex items-center space-x-1.5 transition-colors ${
                isRecording
                  ? 'bg-neutral-800 text-white border-neutral-600 animate-pulse'
                  : 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isRecording ? 'Listening / Streaming...' : 'Simulate Dictation Mic'}</span>
            </button>
          </div>
        </div>

        {/* Quick Sample Selector */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono text-neutral-400">Quick Test Exemplars:</div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_DICTATIONS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setTranscriptInput(sample.text)}
                className="text-[11px] font-mono px-2.5 py-1 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors text-left"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input & Submit */}
        <form onSubmit={handleExecuteRouter} className="space-y-3">
          <div className="relative">
            <textarea
              value={transcriptInput}
              onChange={e => setTranscriptInput(e.target.value)}
              placeholder="Speak or paste raw dictation transcript here... (e.g., 'Schedule a sync with Sarah on Friday at 3pm, need to draft security audit by tomorrow with P0 priority, and note that we agreed on v2 API migration')"
              rows={3}
              className="w-full bg-neutral-900 border border-neutral-800 rounded p-3 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] font-mono text-neutral-500">
              Deterministic parsing model: <span className="text-neutral-300">gemini-3.7-flash</span> (with zero-fail offline fallback)
            </div>

            <button
              type="submit"
              disabled={isRouting || !transcriptInput.trim()}
              className="px-4 py-2 rounded bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-colors border border-white flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRouting ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                  <span>Routing to Vault...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Execute LLM-Router</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Last Commit Trace */}
        {lastCommitResult && (
          <div className="mt-4 p-4 rounded bg-neutral-900 border border-neutral-800 space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span className="font-semibold text-white">Deterministic Ingest Committed to Vault</span>
              </div>
              <span className="text-[10px] text-neutral-500">
                Latency: {lastCommitResult.parsed.processingLatencyMs || 240}ms
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
              <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                <div className="text-neutral-500 text-[10px]">DETECTED INTENTS</div>
                <div className="text-neutral-200 mt-1 flex flex-wrap gap-1">
                  {lastCommitResult.parsed.detectedIntents.map((intent, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px] text-white">
                      {intent}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                <div className="text-neutral-500 text-[10px]">ROUTING DESTINATIONS</div>
                <div className="text-neutral-200 mt-1 flex flex-wrap gap-1">
                  {lastCommitResult.parsed.routingDestinations.map((dest, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-neutral-800 rounded text-[10px] text-white">
                      {dest}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-neutral-950 p-2.5 rounded border border-neutral-800">
                <div className="text-neutral-500 text-[10px]">SHA-256 SIGNATURE</div>
                <div className="text-neutral-400 mt-1 truncate text-[10px]">
                  {lastCommitResult.signatureHash}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sovereign Vault State Browser */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-4">
        {/* Sub-tab Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-800 pb-3 gap-3">
          <div className="flex items-center space-x-2 font-mono text-xs">
            <button
              onClick={() => setActiveSubTab('all')}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeSubTab === 'all'
                  ? 'bg-white text-black font-semibold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              Unified View
            </button>
            <button
              onClick={() => setActiveSubTab('events')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center space-x-1.5 ${
                activeSubTab === 'events'
                  ? 'bg-white text-black font-semibold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar ({vaultState?.events.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('tasks')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center space-x-1.5 ${
                activeSubTab === 'tasks'
                  ? 'bg-white text-black font-semibold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Tasks ({vaultState?.tasks.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('notes')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center space-x-1.5 ${
                activeSubTab === 'notes'
                  ? 'bg-white text-black font-semibold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Notes ({vaultState?.notes.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('commits')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center space-x-1.5 ${
                activeSubTab === 'commits'
                  ? 'bg-white text-black font-semibold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Commit Ledger ({vaultState?.commits.length || 0})</span>
            </button>
          </div>

          {activeSubTab === 'tasks' && (
            <div className="flex items-center space-x-2 font-mono text-xs">
              <span className="text-neutral-500 text-[11px]">Filter:</span>
              <button
                onClick={() => setTaskFilter('all')}
                className={`px-2 py-0.5 rounded text-[11px] ${taskFilter === 'all' ? 'bg-neutral-800 text-white' : 'text-neutral-500'}`}
              >
                All
              </button>
              <button
                onClick={() => setTaskFilter('pending')}
                className={`px-2 py-0.5 rounded text-[11px] ${taskFilter === 'pending' ? 'bg-neutral-800 text-white' : 'text-neutral-500'}`}
              >
                Pending
              </button>
              <button
                onClick={() => setTaskFilter('completed')}
                className={`px-2 py-0.5 rounded text-[11px] ${taskFilter === 'completed' ? 'bg-neutral-800 text-white' : 'text-neutral-500'}`}
              >
                Completed
              </button>
            </div>
          )}
        </div>

        {/* 1. CALENDAR EVENTS SECTION */}
        {(activeSubTab === 'all' || activeSubTab === 'events') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>Extracted Calendar Events & Milestones</span>
              </h4>
              <span className="text-[11px] font-mono text-neutral-500">{vaultState?.events.length || 0} scheduled</span>
            </div>

            {(!vaultState?.events || vaultState.events.length === 0) ? (
              <div className="p-6 text-center text-xs font-mono text-neutral-500 bg-neutral-900 rounded border border-neutral-800">
                No calendar events currently in vault. Dictate or type a date/meeting above.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                {vaultState.events.map(event => (
                  <div key={event.id} className="p-4 rounded bg-neutral-900 border border-neutral-800 space-y-2 relative group">
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 font-bold">
                          {event.category}
                        </span>
                        <h5 className="font-semibold text-white text-sm pt-1">{event.title}</h5>
                      </div>
                      <button
                        onClick={() => handleDeleteItem('events', event.id)}
                        className="text-neutral-500 hover:text-white transition-colors"
                        title="Delete from Vault"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-neutral-300 text-[11px] leading-relaxed">{event.description}</p>

                    <div className="pt-2 border-t border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center space-x-1 text-white font-semibold">
                          <Clock className="w-3 h-3 text-neutral-400" />
                          <span>{event.date} {event.time ? `at ${event.time}` : ''}</span>
                        </span>
                        <span className="text-neutral-500 text-[10px]">{event.durationMinutes || 45} mins</span>
                      </div>
                      {event.participants && event.participants.length > 0 && (
                        <div className="text-[10px] text-neutral-400 truncate">
                          Participants: {event.participants.join(', ')}
                        </div>
                      )}
                      {event.locationOrLink && (
                        <div className="text-[10px] text-neutral-500 truncate">
                          Location: {event.locationOrLink}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. ACTION TASKS SECTION */}
        {(activeSubTab === 'all' || activeSubTab === 'tasks') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-neutral-400" />
                <span>Extracted Action Tasks & Deliverables</span>
              </h4>
              <span className="text-[11px] font-mono text-neutral-500">{filteredTasks.length} items</span>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="p-6 text-center text-xs font-mono text-neutral-500 bg-neutral-900 rounded border border-neutral-800">
                No tasks match current filter. Dictate a task above to extract.
              </div>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                {filteredTasks.map(task => {
                  const isCompleted = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded bg-neutral-900 border transition-colors flex items-start justify-between gap-3 ${
                        isCompleted ? 'border-neutral-800/60 opacity-60' : 'border-neutral-800'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <button
                          onClick={() => handleToggleTask(task.id, task.status)}
                          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isCompleted
                              ? 'bg-white text-black border-white'
                              : 'bg-neutral-950 border-neutral-700 hover:border-white'
                          }`}
                        >
                          {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold font-mono ${
                              task.priority === 'P0' ? 'bg-white text-black font-bold' :
                              task.priority === 'P1' ? 'bg-neutral-800 text-white border border-neutral-700' :
                              'bg-neutral-950 text-neutral-400 border border-neutral-800'
                            }`}>
                              {task.priority}
                            </span>
                            <span className={`text-xs font-semibold ${isCompleted ? 'line-through text-neutral-500' : 'text-white'}`}>
                              {task.title}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-neutral-400 text-[11px] leading-relaxed">{task.description}</p>
                          )}

                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-500 pt-1">
                            {task.dueDate && <span>Due: {task.dueDate}</span>}
                            {task.assignee && <span>Assignee: {task.assignee}</span>}
                            {task.tags && task.tags.map((tg, i) => (
                              <span key={i} className="px-1.5 py-0.2 bg-neutral-950 border border-neutral-800 rounded text-neutral-400">
                                #{tg}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteItem('tasks', task.id)}
                        className="text-neutral-500 hover:text-white transition-colors ml-2"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. SUMMARY NOTES SECTION */}
        {(activeSubTab === 'all' || activeSubTab === 'notes') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5 text-neutral-400" />
                <span>Synthesized Summary Notes & Decisions</span>
              </h4>
              <span className="text-[11px] font-mono text-neutral-500">{vaultState?.notes.length || 0} entries</span>
            </div>

            {(!vaultState?.notes || vaultState.notes.length === 0) ? (
              <div className="p-6 text-center text-xs font-mono text-neutral-500 bg-neutral-900 rounded border border-neutral-800">
                No summary notes in vault yet. Dictate insights above.
              </div>
            ) : (
              <div className="space-y-3 font-mono text-xs">
                {vaultState.notes.map(note => (
                  <div key={note.id} className="p-4 rounded bg-neutral-900 border border-neutral-800 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-0.5">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 font-bold">
                          {note.category}
                        </span>
                        <h5 className="font-semibold text-white text-sm pt-1">{note.title}</h5>
                      </div>
                      <button
                        onClick={() => handleDeleteItem('notes', note.id)}
                        className="text-neutral-500 hover:text-white transition-colors"
                        title="Delete Note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="bg-neutral-950 p-3 rounded border border-neutral-800 text-[11px] text-neutral-300 leading-relaxed">
                      {note.summaryText}
                    </div>

                    {note.keyTakeaways && note.keyTakeaways.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Key Takeaways:</div>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px] text-neutral-300">
                          {note.keyTakeaways.map((tk, i) => (
                            <li key={i}>{tk}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {note.entitiesMentioned && note.entitiesMentioned.length > 0 && (
                      <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500">
                        <span>Entities: {note.entitiesMentioned.join(', ')}</span>
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. IMMUTABLE COMMITS LEDGER SECTION */}
        {(activeSubTab === 'all' || activeSubTab === 'commits') && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <GitCommit className="w-3.5 h-3.5 text-neutral-400" />
                <span>Immutable Cryptographic Vault Commit Ledger</span>
              </h4>
              <span className="text-[11px] font-mono text-neutral-500">{vaultState?.commits.length || 0} commits recorded</span>
            </div>

            {(!vaultState?.commits || vaultState.commits.length === 0) ? (
              <div className="p-6 text-center text-xs font-mono text-neutral-500 bg-neutral-900 rounded border border-neutral-800">
                No commits recorded yet.
              </div>
            ) : (
              <div className="space-y-2 font-mono text-xs max-h-72 overflow-y-auto">
                {vaultState.commits.map(commit => (
                  <div key={commit.commitId} className="p-3 rounded bg-neutral-900 border border-neutral-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-800 text-white font-bold">
                          {commit.status}
                        </span>
                        <span className="text-white font-semibold text-[11px]">{commit.commitId}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500">
                        {new Date(commit.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-neutral-300 text-[11px] italic">"{commit.rawTranscript}"</p>

                    <div className="pt-1 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500">
                      <span>
                        Committed: {commit.eventsCount} events, {commit.tasksCount} tasks, {commit.notesCount} notes
                      </span>
                      <span className="text-neutral-400 truncate max-w-xs">
                        SHA256: {commit.signatureHash.slice(0, 20)}...
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
