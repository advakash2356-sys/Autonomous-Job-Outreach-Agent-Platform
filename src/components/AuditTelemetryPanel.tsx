import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  KeyRound,
  FileCheck,
  Sliders,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
  Hash
} from 'lucide-react';
import { AuditLogEntry, GlobalTelemetry, SovereignIdentityAnchor } from '../types';

interface AuditTelemetryPanelProps {
  auditLogs: AuditLogEntry[];
  telemetry: GlobalTelemetry | null;
  onOverrideBudget: (newCap: number, newRecursion: number) => Promise<void>;
  rootAnchor: SovereignIdentityAnchor;
}

export const AuditTelemetryPanel: React.FC<AuditTelemetryPanelProps> = ({
  auditLogs,
  telemetry,
  onOverrideBudget,
  rootAnchor
}) => {
  const [budgetCapInput, setBudgetCapInput] = useState(8000);
  const [recursionLimitInput, setRecursionLimitInput] = useState(5);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState('');

  const handleUpdatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await onOverrideBudget(budgetCapInput, recursionLimitInput);
      setUpdateMessage('Sovereign budget policy updated and cryptographically recorded.');
      setTimeout(() => setUpdateMessage(''), 4000);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-5">
        <div className="flex items-center space-x-2 text-neutral-400 text-xs font-mono mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>ZERO-TRUST AUDIT TRAIL & TELEMETRY</span>
        </div>
        <h2 className="text-base font-semibold text-white">
          Cryptographic Security Logs & Sovereign Budget Controls
        </h2>
        <p className="text-xs text-neutral-400 max-w-3xl mt-1">
          Immutable event ledger with SHA-256 signature verification, Zero-Trust 403 hard-fail auditing, and dynamic circuit-breaker policy controls.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sovereign Policy & Circuit Breakers (Left 4 Cols) */}
        <div className="lg:col-span-4 bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center space-x-2 border-b border-neutral-800 pb-3">
            <Sliders className="w-4 h-4 text-neutral-400" />
            <h3 className="text-sm font-semibold text-white">Sovereign Budget & Policy Override</h3>
          </div>

          <form onSubmit={handleUpdatePolicy} className="space-y-4 text-xs font-mono">
            <div>
              <label className="text-neutral-400">Max Token Budget Cap per Session:</label>
              <input
                type="number"
                value={budgetCapInput}
                onChange={(e) => setBudgetCapInput(Number(e.target.value))}
                className="w-full mt-1 bg-neutral-900 border border-neutral-800 rounded p-2.5 text-white focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div>
              <label className="text-neutral-400">Max DAG Recursion Depth Limit (Default: 5):</label>
              <input
                type="number"
                value={recursionLimitInput}
                onChange={(e) => setRecursionLimitInput(Number(e.target.value))}
                max={5}
                min={1}
                className="w-full mt-1 bg-neutral-900 border border-neutral-800 rounded p-2.5 text-white focus:outline-none focus:border-neutral-500"
              />
            </div>

            <div className="p-3 bg-neutral-900 rounded border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
              <div>Sovereign Identity: {rootAnchor}</div>
              <div>Circuit Breaker: Auto-freeze on &gt;5 recursion depth</div>
              <div>Fallback: Graceful heuristic degradation</div>
            </div>

            <button
              type="submit"
              disabled={isUpdating}
              className="w-full py-2 rounded bg-white hover:bg-neutral-200 text-black font-semibold text-xs transition-colors border border-white flex items-center justify-center space-x-2"
            >
              {isUpdating ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <FileCheck className="w-3.5 h-3.5" />}
              <span>Apply Sovereign Policy Override</span>
            </button>

            {updateMessage && (
              <div className="text-white text-center text-[11px] font-semibold">
                {updateMessage}
              </div>
            )}
          </form>
        </div>

        {/* Cryptographic Audit Trail Table (Right 8 Cols) */}
        <div className="lg:col-span-8 bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Hash className="w-4 h-4 text-neutral-400" />
              <span>Immutable Cryptographic Audit Ledger</span>
            </h3>
            <span className="text-xs font-mono text-neutral-400">{auditLogs.length} Events Recorded</span>
          </div>

          <div className="space-y-3 max-h-[460px] overflow-y-auto font-mono text-xs">
            {auditLogs.map((log) => {
              const isAllowed = log.status === 'ALLOWED';
              const isBlocked = log.status === 'BLOCKED_403';
              const isEmergency = log.status === 'EMERGENCY_TRIGGERED';

              return (
                <div
                  key={log.id}
                  className="p-3.5 rounded bg-neutral-900 border border-neutral-800 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                        isAllowed
                          ? 'bg-neutral-800 text-white border border-neutral-700'
                          : isBlocked
                          ? 'bg-neutral-950 text-neutral-400 border border-neutral-700'
                          : isEmergency
                          ? 'bg-white text-black font-bold'
                          : 'bg-neutral-800 text-neutral-300 border border-neutral-700'
                      }`}>
                        {log.status}
                      </span>
                      <span className="text-white font-semibold">{log.action}</span>
                    </div>

                    <span className="text-[10px] text-neutral-500">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <p className="text-neutral-300 text-[11px] leading-relaxed">{log.details}</p>

                  <div className="pt-1.5 border-t border-neutral-800 flex items-center justify-between text-[10px] text-neutral-500">
                    <span>Actor: {log.actor}</span>
                    <span className="text-neutral-400 truncate max-w-xs">
                      SHA256: {log.signatureHash.slice(0, 24)}...
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
