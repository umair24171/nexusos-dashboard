"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Agent } from "@/types";
import AgentCard from "@/components/AgentCard";
import { Search, Plus } from "lucide-react";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused" | "killed">("all");
  const [showModal, setShowModal] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<{ agentId: string; agentSecret: string } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    framework: "python",
    environment: "development" as const,
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  useEffect(() => {
    filterAgents();
  }, [agents, searchTerm, statusFilter]);

  const loadAgents = async () => {
    try {
      const response = await apiClient.get("/agents");
      setAgents(response.data);
    } catch (error) {
      console.error("Failed to load agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterAgents = () => {
    let filtered = agents;

    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }

    setFilteredAgents(filtered);
  };

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const response = await apiClient.post("/agents", formData);
      setCreatedAgent({
        agentId: response.data.agentId,
        agentSecret: response.data.agentSecret,
      });
      setShowCredentials(true);
      setFormData({ name: "", description: "", framework: "python", environment: "development" });
      loadAgents();
    } catch (error) {
      console.error("Failed to create agent:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const handlePauseResume = async (agentId: string, newStatus: "paused" | "active") => {
    try {
      await apiClient.patch(`/agents/${agentId}`, { status: newStatus });
      loadAgents();
    } catch (error) {
      console.error("Failed to update agent:", error);
    }
  };

  if (loading) {
    return <div className="p-8 text-dark-text/60">Loading agents...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text mb-2">Agents</h1>
          <p className="text-dark-text/60">Manage and monitor your AI agents</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          Register New Agent
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-dark-text/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search agents..."
            className="w-full pl-10 pr-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text placeholder-dark-text/40 focus:border-accent-blue transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text focus:border-accent-blue transition-colors"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="paused">Paused</option>
          <option value="killed">Killed</option>
        </select>
      </div>

      {/* Agents Grid */}
      {filteredAgents.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-lg p-12 text-center">
          <p className="text-dark-text/60">
            {agents.length === 0 ? "No agents yet. Register one to get started!" : "No agents matching your filters"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onPause={() => handlePauseResume(agent.id, "paused")}
              onResume={() => handlePauseResume(agent.id, "active")}
            />
          ))}
        </div>
      )}

      {/* Register Agent Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-dark-text mb-4">Register New Agent</h2>

            <form onSubmit={handleCreateAgent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Agent Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-dark-text placeholder-dark-text/40 focus:border-accent-blue transition-colors"
                  placeholder="My Agent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-dark-text placeholder-dark-text/40 focus:border-accent-blue transition-colors resize-none"
                  rows={3}
                  placeholder="What does this agent do?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Framework</label>
                <select
                  value={formData.framework}
                  onChange={(e) => setFormData({ ...formData, framework: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-dark-text focus:border-accent-blue transition-colors"
                >
                  <option value="python">Python</option>
                  <option value="nodejs">Node.js</option>
                  <option value="go">Go</option>
                  <option value="rust">Rust</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Environment</label>
                <select
                  value={formData.environment}
                  onChange={(e) => setFormData({ ...formData, environment: e.target.value as any })}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-dark-text focus:border-accent-blue transition-colors"
                >
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-dark-sidebar border border-dark-border rounded text-dark-text hover:bg-dark-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue/90 disabled:opacity-50 transition-colors font-semibold"
                >
                  {formLoading ? "Creating..." : "Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredentials && createdAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-accent-blue rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-dark-text mb-2">Agent Created Successfully</h2>
            <p className="text-dark-text/60 text-sm mb-4">
              Save these credentials securely. They will not be shown again.
            </p>

            <div className="space-y-3 mb-6">
              <div>
                <p className="text-xs text-dark-text/60 mb-1">Agent ID</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={createdAgent.agentId}
                    readOnly
                    className="flex-1 px-3 py-2 bg-dark-bg border border-dark-border rounded text-dark-text font-mono text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(createdAgent.agentId)}
                    className="px-3 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue/90 transition-colors text-sm font-semibold"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs text-dark-text/60 mb-1">Agent Secret</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={createdAgent.agentSecret}
                    readOnly
                    className="flex-1 px-3 py-2 bg-dark-bg border border-dark-border rounded text-dark-text font-mono text-sm"
                  />
                  <button
                    onClick={() => navigator.clipboard.writeText(createdAgent.agentSecret)}
                    className="px-3 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue/90 transition-colors text-sm font-semibold"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowCredentials(false);
                setCreatedAgent(null);
              }}
              className="w-full px-4 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue/90 transition-colors font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
