"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Agent } from "@/types";
import AgentCard from "@/components/AgentCard";
import { Search, Plus, X } from "lucide-react";

export default function AgentsPage() {
  const [agents, setAgents]               = useState<Agent[]>([]);
  const [filteredAgents, setFiltered]     = useState<Agent[]>([]);
  const [loading, setLoading]             = useState(true);
  const [searchTerm, setSearchTerm]       = useState("");
  const [statusFilter, setStatusFilter]   = useState<"all" | "active" | "paused" | "killed">("all");
  const [showModal, setShowModal]         = useState(false);
  const [showCredentials, setShowCreds]   = useState(false);
  const [createdAgent, setCreatedAgent]   = useState<{ agentId: string; agentSecret: string } | null>(null);
  const [formData, setFormData]           = useState({
    name: "", description: "", framework: "python", environment: "development" as const,
  });
  const [formLoading, setFormLoading]     = useState(false);
  const [copied, setCopied]               = useState<"id" | "secret" | null>(null);

  useEffect(() => { loadAgents(); }, []);
  useEffect(() => { filterAgents(); }, [agents, searchTerm, statusFilter]);

  const loadAgents = async () => {
    try {
      const r = await apiClient.get("/agents");
      setAgents(r.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filterAgents = () => {
    let f = agents;
    if (searchTerm) f = f.filter(a =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (statusFilter !== "all") f = f.filter(a => a.status === statusFilter);
    setFiltered(f);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const r = await apiClient.post("/agents", formData);
      setCreatedAgent({ agentId: r.data?.agent?.agentId, agentSecret: r.data?.agentSecret });
      setShowModal(false);
      setShowCreds(true);
      setFormData({ name: "", description: "", framework: "python", environment: "development" });
      loadAgents();
    } catch (e) { console.error(e); }
    finally { setFormLoading(false); }
  };

  const handlePauseResume = async (agentId: string, newStatus: "paused" | "active") => {
    try { await apiClient.patch(`/agents/${agentId}`, { status: newStatus }); loadAgents(); }
    catch (e) { console.error(e); }
  };

  const copyText = (text: string, field: "id" | "secret") => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="p-8 font-mono text-xs text-accent-blue">
        $ loading agents<span className="animate-[cursor-blink_1s_step-end_infinite] text-accent-blue">▊</span>
      </div>
    );
  }

  const modalInputCls = "nx-input";

  return (
    <div className="p-8 space-y-6 animate-enter">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold text-dark-text mb-1">Agents</h1>
          <p className="font-mono text-xs text-nx-muted">
            {agents.length} registered · {agents.filter(a => a.status === "active").length} active
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-black font-mono text-xs font-bold hover:bg-accent-blue/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Register Agent
        </button>
      </div>

      {/* ── Filters ── */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nx-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="search agents..."
            className="w-full pl-9 pr-4 py-2 bg-dark-card border border-dark-border font-mono text-xs text-dark-text placeholder-nx-muted focus:border-accent-blue/50 transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 bg-dark-card border border-dark-border font-mono text-xs text-dark-text focus:border-accent-blue/50 transition-colors"
        >
          <option value="all">all status</option>
          <option value="active">active</option>
          <option value="paused">paused</option>
          <option value="killed">killed</option>
        </select>
      </div>

      {/* ── Grid ── */}
      {filteredAgents.length === 0 ? (
        <div className="border border-dark-border p-12 text-center font-mono text-xs text-nx-muted">
          {agents.length === 0
            ? "$ no agents registered yet — register one to get started"
            : "$ no agents match your filters"}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onPause={() => handlePauseResume(agent.id, "paused")}
              onResume={() => handlePauseResume(agent.id, "active")}
            />
          ))}
        </div>
      )}

      {/* ── Register Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border w-full max-w-md">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
              <span className="font-mono text-sm font-semibold text-dark-text">Register New Agent</span>
              <button onClick={() => setShowModal(false)} className="text-nx-muted hover:text-dark-text">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-nx-muted block mb-1.5">
                  Agent Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="my-agent-001"
                  className={modalInputCls}
                />
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-nx-muted block mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="what does this agent do?"
                  rows={2}
                  className="nx-input resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-nx-muted block mb-1.5">
                    Framework
                  </label>
                  <select
                    value={formData.framework}
                    onChange={e => setFormData({ ...formData, framework: e.target.value })}
                    className="nx-select"
                  >
                    <option value="python">Python</option>
                    <option value="nodejs">Node.js</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                  </select>
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-nx-muted block mb-1.5">
                    Environment
                  </label>
                  <select
                    value={formData.environment}
                    onChange={e => setFormData({ ...formData, environment: e.target.value as any })}
                    className="nx-select"
                  >
                    <option value="development">dev</option>
                    <option value="staging">staging</option>
                    <option value="production">production</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 border border-dark-border font-mono text-xs text-nx-muted hover:border-nx-muted transition-colors"
                >
                  cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-2 bg-accent-blue text-black font-mono text-xs font-bold hover:bg-accent-blue/90 disabled:opacity-50 transition-colors"
                >
                  {formLoading ? "creating..." : "register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Credentials Modal ── */}
      {showCredentials && createdAgent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-accent-blue/40 w-full max-w-md shadow-cyan-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
              <span className="font-mono text-sm font-semibold text-accent-blue">Agent Created</span>
              <button
                onClick={() => { setShowCreds(false); setCreatedAgent(null); }}
                className="text-nx-muted hover:text-dark-text"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="font-mono text-[11px] text-nx-red border border-nx-red/20 bg-nx-red/5 px-3 py-2">
                ⚠ Save these credentials now — they will not be shown again.
              </p>

              {[
                { label: "Agent ID",     value: createdAgent.agentId,     field: "id" as const },
                { label: "Agent Secret", value: createdAgent.agentSecret, field: "secret" as const },
              ].map(({ label, value, field }) => (
                <div key={field}>
                  <label className="font-mono text-[10px] uppercase tracking-widest text-nx-muted block mb-1.5">
                    {label}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={value}
                      readOnly
                      className="flex-1 px-3 py-2 bg-dark-bg border border-dark-border font-mono text-[11px] text-dark-text/80"
                    />
                    <button
                      onClick={() => copyText(value, field)}
                      className="px-3 py-2 border border-dark-border font-mono text-[11px] text-nx-muted hover:border-accent-blue hover:text-accent-blue transition-all"
                    >
                      {copied === field ? "copied!" : "copy"}
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={() => { setShowCreds(false); setCreatedAgent(null); }}
                className="w-full py-2 bg-accent-blue text-black font-mono text-xs font-bold hover:bg-accent-blue/90 transition-colors mt-2"
              >
                done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
