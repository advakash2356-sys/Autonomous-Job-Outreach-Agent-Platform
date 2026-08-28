import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Zap,
  Lock,
  Unlock,
  Activity,
  Cpu,
  Clock,
  KeyRound,
  AlertTriangle,
  Send,
  Sliders,
  ChevronDown,
  Layers,
  Terminal,
  FileCode
} from 'lucide-react';
import { GlobalTelemetry, OIDCSession, UserRole } from '../types';

interface SovereignHeaderProps {
  telemetry: GlobalTelemetry | null;
  oidcSession: OIDCSession | null;
  onToggleKillSwitch: (action: 'ENGAGE' | 'DISENGAGE') => void;
  onVerifyOIDC: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SovereignHeader: React.FC<SovereignHeaderProps> = ({
  telemetry,
  oidcSession,
  onToggleKillSwitch,
  onVerifyOIDC,
  activeTab,
  setActiveTab
}) => {
  const [showKillModal, setShowKillModal] = useState(false);
  const [showAdvancedTabs, setShowAdvancedTabs] = useState(false);
  const isKillSwitch = telemetry?.killSwitchEngaged;

  return (
    <header className="bg-black border-b border-neutral-800 text-neutral-100 sticky top-0 z-50">
      {/* Top Sovereign Anchor Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Identity Anchor & Title */}
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded border border-neutral-700 bg-neutral-900 flex items-center justify-center text-white">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800 flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-neutral-400" />
                  Adv.akash2356@gmail.com
                </span>
                {oidcSession?.isVerified ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    Verified Active
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-neutral-400" />
                    Guest Mode
                  </span>
                )}
              </div>
              <h1 className="text-sm font-semibold text-white tracking-tight flex items-center gap-2 mt-0.5">
                <span>Autonomous Job Outreach & Agent Platform</span>
              </h1>
            </div>
          </div>

          {/* Telemetry Metrics & Simple Status */}
          <div className="flex items-center space-x-3">
            {/* Live Metrics Pill Group */}
            <div className="hidden lg:flex items-center space-x-3 bg-neutral-950 px-3 py-1.5 rounded border border-neutral-800 text-xs font-mono">
              <div className="flex items-center space-x-1.5 text-neutral-300" title="Active AI Worker Nodes">
                <Cpu className="w-3.5 h-3.5 text-neutral-400" />
                <span>5 Workers</span>
              </div>
              <span className="text-neutral-800">|</span>
              <div className="flex items-center space-x-1.5 text-neutral-300" title="Tokens Consumed">
                <Zap className="w-3.5 h-3.5 text-neutral-400" />
                <span>{telemetry?.totalTokensSpent?.toLocaleString() || '142,850'} tok</span>
              </div>
              <span className="text-neutral-800">|</span>
              <div className="flex items-center space-x-1.5 text-neutral-300" title="Average Latency">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>{telemetry?.avgSystemLatencyMs || 640}ms</span>
              </div>
            </div>

            {/* Emergency Kill-Switch */}
            <button
              id="btn-emergency-killswitch"
              onClick={() => setShowKillModal(true)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-medium uppercase tracking-wider flex items-center gap-1.5 transition-colors border ${
                isKillSwitch
                  ? 'bg-white text-black border-white hover:bg-neutral-200'
                  : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-700'
              }`}
              title="Emergency system stop"
            >
              {isKillSwitch ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>KILLSWITCH ACTIVE</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-neutral-400" />
                  <span>EMERGENCY PAUSE</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-t border-neutral-800/80 pt-2 pb-2 flex-wrap gap-2">
          {/* Main User Tabs */}
          <div className="flex space-x-1.5 overflow-x-auto items-center">
            <button
              id="tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors flex items-center space-x-2 border ${
                activeTab === 'dashboard'
                  ? 'bg-white text-black border-white font-semibold'
                  : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Job Outreach & Pipeline</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                activeTab === 'dashboard' ? 'bg-neutral-200 text-black' : 'bg-neutral-900 text-neutral-500 border border-neutral-800'
              }`}>
                Pipeline
              </span>
            </button>

            <button
              id="tab-careerops"
              onClick={() => setActiveTab('careerops')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors flex items-center space-x-2 border ${
                activeTab === 'careerops'
                  ? 'bg-white text-black border-white font-semibold'
                  : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>CareerOps Engine</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                activeTab === 'careerops' ? 'bg-neutral-200 text-black' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
              }`}>
                14 Modes
              </span>
            </button>

            <button
              id="tab-orchestrator"
              onClick={() => setActiveTab('orchestrator')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors flex items-center space-x-2 border ${
                activeTab === 'orchestrator'
                  ? 'bg-white text-black border-white font-semibold'
                  : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>DAG Orchestrator</span>
            </button>

            <button
              id="tab-vault"
              onClick={() => setActiveTab('vault')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors flex items-center space-x-2 border ${
                activeTab === 'vault'
                  ? 'bg-white text-black border-white font-semibold'
                  : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-neutral-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Vault & LLM-Router</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                activeTab === 'vault' ? 'bg-neutral-200 text-black' : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
              }`}>
                Router
              </span>
            </button>

            {/* Advanced Labs Tabs */}
            {showAdvancedTabs && (
              <>
                <button
                  id="tab-workers"
                  onClick={() => setActiveTab('workers')}
                  className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors flex items-center space-x-1.5 border ${
                    activeTab === 'workers'
                      ? 'bg-white text-black border-white font-semibold'
                      : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>Worker Pool (L2)</span>
                </button>

                <button
                  id="tab-evaluator"
                  onClick={() => setActiveTab('evaluator')}
                  className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors flex items-center space-x-1.5 border ${
                    activeTab === 'evaluator'
                      ? 'bg-white text-black border-white font-semibold'
                      : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Evaluator (L3)</span>
                </button>

                <button
                  id="tab-memory"
                  onClick={() => setActiveTab('memory')}
                  className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors flex items-center space-x-1.5 border ${
                    activeTab === 'memory'
                      ? 'bg-white text-black border-white font-semibold'
                      : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <span>Persistent Memory</span>
                </button>

                <button
                  id="tab-audit"
                  onClick={() => setActiveTab('audit')}
                  className={`px-3 py-1.5 text-xs font-medium rounded whitespace-nowrap transition-colors flex items-center space-x-1.5 border ${
                    activeTab === 'audit'
                      ? 'bg-white text-black border-white font-semibold'
                      : 'bg-transparent text-neutral-400 border-transparent hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <span>Audit Logs</span>
                </button>
              </>
            )}
          </div>

          {/* Toggle Advanced Developer Tools */}
          <button
            onClick={() => setShowAdvancedTabs(!showAdvancedTabs)}
            className="text-xs font-mono px-2.5 py-1.5 rounded bg-neutral-950 hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200 border border-neutral-800 flex items-center gap-1.5 transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-neutral-400" />
            <span>{showAdvancedTabs ? 'Hide Developer Tabs' : 'More Tools (L2/L3/Audit)'}</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${showAdvancedTabs ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Emergency Kill-Switch Confirmation Modal */}
      {showKillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-neutral-950 border border-neutral-700 rounded-lg max-w-md w-full p-6 text-neutral-100 shadow-2xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded border border-neutral-700 bg-neutral-900 text-white">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  {isKillSwitch ? 'Disengage Emergency Kill-Switch?' : 'ENGAGE EMERGENCY KILL-SWITCH?'}
                </h3>
                <p className="text-xs font-mono text-neutral-400">Sovereign Administrator Command</p>
              </div>
            </div>

            <p className="text-xs text-neutral-300 mb-4 leading-relaxed">
              {isKillSwitch
                ? 'Disengaging will restore nominal runtime operations, resume active DAG task queues, and re-enable specialized worker execution loops.'
                : 'ENGAGING will immediately freeze all running agent loops, halt API spend, invoke deterministic safe-state fallbacks, and write an immutable security event log.'}
            </p>

            <div className="bg-neutral-900 p-3 rounded border border-neutral-800 text-[11px] font-mono text-neutral-400 mb-5 space-y-0.5">
              <div className="text-white font-medium">Anchor: Adv.akash2356@gmail.com</div>
              <div>Target: Global Runtime Agent Loop Freeze</div>
              <div>Scope: CEO Orchestrator + L2 Worker Pool + DSPy Engine</div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                id="btn-cancel-killswitch"
                onClick={() => setShowKillModal(false)}
                className="px-3.5 py-1.5 text-xs font-mono rounded bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-killswitch"
                onClick={() => {
                  onToggleKillSwitch(isKillSwitch ? 'DISENGAGE' : 'ENGAGE');
                  setShowKillModal(false);
                }}
                className="px-3.5 py-1.5 text-xs font-mono font-semibold rounded bg-white hover:bg-neutral-200 text-black border border-white"
              >
                {isKillSwitch ? 'Confirm Disengage (Resume)' : 'CONFIRM FREEZE'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
