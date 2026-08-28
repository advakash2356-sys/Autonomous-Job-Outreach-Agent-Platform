import React, { useState } from 'react';
import {
  Brain,
  Search,
  Database,
  GitCommit,
  RotateCcw,
  Sparkles,
  Layers,
  Network,
  Tag,
  CheckCircle2,
  Clock,
  KeyRound,
  Shield,
  FileCode
} from 'lucide-react';
import {
  VectorEpisodicMemoryItem,
  SemanticGraphEntity,
  PromptRegistryItem,
  DAGSessionGraph
} from '../types';

interface MemoryExplorerProps {
  episodicStore: VectorEpisodicMemoryItem[];
  semanticGraph: SemanticGraphEntity[];
  promptRegistry: PromptRegistryItem[];
  currentDAG: DAGSessionGraph | null;
  onSearchEpisodic: (query: string) => Promise<VectorEpisodicMemoryItem[]>;
  onRollbackPrompt: (promptId: string) => Promise<void>;
}

export const MemoryExplorer: React.FC<MemoryExplorerProps> = ({
  episodicStore,
  semanticGraph,
  promptRegistry,
  currentDAG,
  onSearchEpisodic,
  onRollbackPrompt
}) => {
  const [activeTier, setActiveTier] = useState<'working' | 'episodic' | 'semantic' | 'registry'>('episodic');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VectorEpisodicMemoryItem[]>(episodicStore);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRegistryItem, setSelectedRegistryItem] = useState<PromptRegistryItem | null>(promptRegistry[0] || null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(episodicStore);
      return;
    }
    setIsSearching(true);
    try {
      const res = await onSearchEpisodic(searchQuery);
      setSearchResults(res);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-5">
        <div className="flex items-center space-x-2 text-neutral-400 text-xs font-mono mb-1">
          <Brain className="w-4 h-4" />
          <span>PERSISTENT MULTI-TIER MEMORY ARCHITECTURE</span>
        </div>
        <h2 className="text-base font-semibold text-white">
          Multi-Tier Memory & Versioned System Prompt Registry
        </h2>
        <p className="text-xs text-neutral-400 max-w-3xl mt-1">
          Four synchronized tiers: Working Memory (active DAG state), Episodic Memory (vector few-shot similarity store), Semantic Memory (knowledge graph), and System Registry (Git-versioned prompts with instant rollback).
        </p>

        {/* Memory Tier Nav */}
        <div className="flex space-x-2 border-t border-neutral-800 pt-3 mt-4 overflow-x-auto">
          {[
            { id: 'episodic', label: 'Episodic Memory (Vector Store)', count: episodicStore.length },
            { id: 'working', label: 'Working Memory (Active DAG State)', count: currentDAG?.nodes.length || 0 },
            { id: 'semantic', label: 'Semantic Memory (Knowledge Graph)', count: semanticGraph.length },
            { id: 'registry', label: 'System Registry (Versioned Prompts)', count: promptRegistry.length }
          ].map(tier => (
            <button
              key={tier.id}
              onClick={() => setActiveTier(tier.id as any)}
              className={`px-3.5 py-1.5 text-xs font-mono rounded transition-colors flex items-center space-x-2 ${
                activeTier === tier.id
                  ? 'bg-white text-black font-semibold'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800'
              }`}
            >
              <span>{tier.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                activeTier === tier.id ? 'bg-neutral-200 text-black' : 'bg-neutral-950 text-neutral-400'
              }`}>
                {tier.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tier 1: Episodic Vector Store View */}
      {activeTier === 'episodic' && (
        <div className="space-y-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search vector memory by semantic query, tags (e.g., 'ZeroTrust', 'Microservices', 'Schema')..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded pl-9 pr-3 py-2 text-xs text-white font-mono placeholder-neutral-500 focus:outline-none focus:border-neutral-500"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-4 py-2 rounded bg-white hover:bg-neutral-200 text-black text-xs font-mono font-semibold transition-colors border border-white"
            >
              {isSearching ? 'Querying...' : 'Cosine Search'}
            </button>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {searchResults.map((item) => (
              <div key={item.id} className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold font-mono text-white line-clamp-1">{item.title}</span>
                  {item.similarityScore && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-300 border border-neutral-800">
                      Score: {item.similarityScore}
                    </span>
                  )}
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">{item.summary}</p>

                <div className="p-2 rounded bg-neutral-900 border border-neutral-800 font-mono text-[10px] text-neutral-400">
                  <div className="text-neutral-200 font-semibold mb-1">Vector Embedding Preview:</div>
                  <div className="text-neutral-500 truncate">[{item.embeddingPreview.join(', ')}]</div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {item.tags.map((t) => (
                    <span key={t} className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tier 2: Working Memory View */}
      {activeTier === 'working' && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Layers className="w-4 h-4 text-neutral-400" />
              <span>Active Working Memory State & DAG Execution Context</span>
            </h3>
            <span className="text-xs font-mono text-neutral-400">
              Session: {currentDAG?.sessionId || 'None'}
            </span>
          </div>

          {currentDAG ? (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-neutral-900 rounded border border-neutral-800 text-neutral-300">
                <span className="text-white font-semibold">Active Objective:</span> {currentDAG.objective}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentDAG.nodes.map((n) => (
                  <div key={n.id} className="p-3 bg-neutral-900 rounded border border-neutral-800 space-y-1">
                    <div className="flex justify-between text-neutral-200 font-bold">
                      <span>{n.id}: {n.title}</span>
                      <span className="text-white">{n.status}</span>
                    </div>
                    <p className="text-neutral-400 text-[11px]">{n.description}</p>
                    <div className="text-neutral-500 text-[10px] pt-1">
                      Budget: {n.tokenBudget} tokens | Latency: {n.latencyBudgetMs}ms
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-neutral-500 text-center py-12 text-xs font-mono">
              No active session currently loaded in working memory.
            </div>
          )}
        </div>
      )}

      {/* Tier 3: Semantic Knowledge Graph View */}
      {activeTier === 'semantic' && (
        <div className="bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
              <Network className="w-4 h-4 text-neutral-400" />
              <span>Semantic Knowledge Graph & Policy Schema Registry</span>
            </h3>
            <span className="text-xs font-mono text-neutral-400">Entities: {semanticGraph.length}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {semanticGraph.map((entity) => (
              <div key={entity.id} className="p-4 bg-neutral-900 rounded-lg border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-200">{entity.label}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-950 text-neutral-400 border border-neutral-800">
                    {entity.type}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">{entity.description}</p>

                {entity.relations.length > 0 && (
                  <div className="pt-2 border-t border-neutral-800 space-y-1">
                    <span className="text-[10px] uppercase font-mono text-neutral-500">Relations:</span>
                    {entity.relations.map((rel, idx) => (
                      <div key={idx} className="text-[10px] font-mono text-neutral-300">
                        ↳ {rel.relationType} → <span className="text-neutral-200">{rel.targetId}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tier 4: System Registry & Prompt Version Timeline */}
      {activeTier === 'registry' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Prompt Version List (Left 5 Cols) */}
          <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-3">
            <h3 className="text-sm font-semibold text-white flex items-center space-x-2 border-b border-neutral-800 pb-3">
              <GitCommit className="w-4 h-4 text-neutral-400" />
              <span>Versioned System Prompts</span>
            </h3>

            <div className="space-y-2 max-h-[420px] overflow-y-auto">
              {promptRegistry.map((item) => {
                const isSelected = selectedRegistryItem?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedRegistryItem(item)}
                    className={`p-3 rounded border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-neutral-900 border-white text-white'
                        : 'bg-neutral-950 hover:bg-neutral-900 border-neutral-800 text-neutral-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="font-semibold text-white">{item.version}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                        item.status === 'Champion'
                          ? 'bg-white text-black font-semibold'
                          : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <div className="text-xs text-neutral-300 font-mono mt-1">{item.agentType}</div>
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-neutral-400 mt-1">
                      <span>Commit: {item.gitCommitHash}</span>
                      <span>Score: {item.metrics.avgAccuracyScore}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Prompt Details & 1-Click Rollback (Right 7 Cols) */}
          <div className="lg:col-span-7 bg-neutral-950 border border-neutral-800 rounded-lg p-5 space-y-4">
            {selectedRegistryItem ? (
              <div className="space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{selectedRegistryItem.agentType} Prompt Spec</h4>
                    <span className="text-[11px] text-neutral-400">
                      Commit: {selectedRegistryItem.gitCommitHash} ({selectedRegistryItem.version})
                    </span>
                  </div>

                  {selectedRegistryItem.status !== 'Champion' && (
                    <button
                      id="btn-rollback-prompt"
                      onClick={() => onRollbackPrompt(selectedRegistryItem.id)}
                      className="px-3 py-1.5 rounded bg-white hover:bg-neutral-200 text-black font-semibold text-xs flex items-center space-x-1.5 transition-colors border border-white"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>1-Click Rollback to this Version</span>
                    </button>
                  )}
                </div>

                <div>
                  <label className="text-[10px] uppercase text-neutral-400">System Instruction Text:</label>
                  <div className="mt-1 p-3 rounded bg-neutral-900 border border-neutral-800 text-neutral-200 whitespace-pre-wrap leading-relaxed">
                    {selectedRegistryItem.systemPromptText}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase text-neutral-400">Negative Constraints:</label>
                  <ul className="mt-1 space-y-1 text-neutral-300">
                    {selectedRegistryItem.negativeConstraints.map((c, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-neutral-500 font-bold">✕</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-neutral-900 rounded border border-neutral-800 text-[11px] text-neutral-400 space-y-1">
                  <div>Author Anchor: {selectedRegistryItem.author}</div>
                  <div>Historical Runs: {selectedRegistryItem.metrics.totalRuns}</div>
                  <div>Pass Rate: {selectedRegistryItem.metrics.passRatePercent}%</div>
                </div>
              </div>
            ) : (
              <div className="text-neutral-500 text-center py-16">
                Select a versioned prompt to inspect or trigger sovereign rollback.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
