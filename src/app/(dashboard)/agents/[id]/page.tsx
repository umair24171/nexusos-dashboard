"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { Agent, AuditLog } from "@/types";
import { statusColor, formatTimeAgo } from "@/lib/utils";
import LogTable from "@/components/LogTable";
import KillSwitch from "@/components/KillSwitch";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

interface AgentDetailPageProps {
  params: {
    id: string;
  };
}

export default function AgentDetailPage({ params }: AgentDetailPageProps) {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedPermissions, setEditedPermissions] = useState<any>(null);

  useEffect(() => {
    loadAgent();
  }, [params.id]);

  const loadAgent = async () => {
    try {
      const [agentRes, logsRes] = await Promise.all([
        apiClient.get(`/agents/${params.id}`),
        apiClient.get(`/agents/${params.id}/logs`),
      ]);
      setAgent(agentRes.data);
      setLogs(logsRes.data);
      setEditedPermissions(agentRes.data.permissions);
    } catch (error) {
      console.error("Failed to load agent:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePermissions = async () => {
    if (!agent) return;
    setSaving(true);

    try {
      await apiClient.patch(`/agents/${agent.id}`, {
        permissions: editedPermissions,
      });
      setAgent({ ...agent, permissions: editedPermissions });
    } catch (error) {
      console.error("Failed to save permissions:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleKillAgent = async () => {
    try {
      await apiClient.delete(`/agents/${params.id}`);
      router.push("/agents");
    } catch (error) {
      console.error("Failed to kill agent:", error);
    }
  };

  if (loading) {
    return <div className="p-8 font-mono text-xs text-accent-blue">$ loading agent<span className="animate-[cursor-blink_1s_step-end_infinite]">▊</span></div>;
  }

  if (!agent) {
    return (
      <div className="p-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-accent-blue hover:text-accent-blue/80 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <p className="text-dark-text/60">Agent not found</p>
      </div>
    );
  }

  const statusColorClass = statusColor(agent.status);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-accent-blue hover:text-accent-blue/80 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Agents
        </button>
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-3xl font-bold text-dark-text">{agent.name}</h1>
          <span className={`text-sm font-semibold ${statusColorClass} capitalize`}>{agent.status}</span>
          <span className="text-xs bg-accent-blue/10 text-accent-blue px-3 py-1 rounded">
            {agent.metadata.framework}
          </span>
        </div>
        <p className="text-dark-text/60">{agent.description || "No description"}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-dark-card border border-dark-border rounded-lg p-4">
          <p className="text-dark-text/60 text-sm mb-1">Total Actions</p>
          <p className="text-2xl font-bold text-dark-text">{agent.stats.totalActions}</p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-lg p-4">
          <p className="text-dark-text/60 text-sm mb-1">Tokens Used</p>
          <p className="text-2xl font-bold text-dark-text">{agent.stats.tokensUsed.toLocaleString()}</p>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-lg p-4">
          <p className="text-dark-text/60 text-sm mb-1">Last Seen</p>
          <p className="text-sm font-semibold text-dark-text">{formatTimeAgo(agent.stats.lastSeen)}</p>
        </div>
      </div>

      {/* Permissions Editor */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-bold text-dark-text">Permissions</h2>

        <div>
          <label className="block text-sm font-medium text-dark-text/80 mb-2">Allowed Tools</label>
          <div className="flex flex-wrap gap-2">
            {editedPermissions?.allowedTools?.map((tool: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-dark-bg border border-dark-border rounded px-3 py-1"
              >
                <span className="text-sm text-dark-text">{tool}</span>
                <button
                  onClick={() => {
                    const updated = editedPermissions.allowedTools.filter(
                      (_: any, i: number) => i !== idx
                    );
                    setEditedPermissions({ ...editedPermissions, allowedTools: updated });
                  }}
                  className="text-red-400 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add tool and press Enter"
            onKeyPress={(e) => {
              if (e.key === "Enter" && e.currentTarget.value) {
                setEditedPermissions({
                  ...editedPermissions,
                  allowedTools: [...(editedPermissions?.allowedTools || []), e.currentTarget.value],
                });
                e.currentTarget.value = "";
              }
            }}
            className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-dark-text placeholder-dark-text/40 focus:border-accent-blue transition-colors mt-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text/80 mb-2">Blocked Tools</label>
          <div className="flex flex-wrap gap-2">
            {editedPermissions?.blockedTools?.map((tool: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-dark-bg border border-dark-border rounded px-3 py-1"
              >
                <span className="text-sm text-dark-text">{tool}</span>
                <button
                  onClick={() => {
                    const updated = editedPermissions.blockedTools.filter(
                      (_: any, i: number) => i !== idx
                    );
                    setEditedPermissions({ ...editedPermissions, blockedTools: updated });
                  }}
                  className="text-red-400 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add tool and press Enter"
            onKeyPress={(e) => {
              if (e.key === "Enter" && e.currentTarget.value) {
                setEditedPermissions({
                  ...editedPermissions,
                  blockedTools: [...(editedPermissions?.blockedTools || []), e.currentTarget.value],
                });
                e.currentTarget.value = "";
              }
            }}
            className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-dark-text placeholder-dark-text/40 focus:border-accent-blue transition-colors mt-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-text/80 mb-2">
              Requests Per Minute
            </label>
            <input
              type="number"
              value={editedPermissions?.rateLimits?.requestsPerMinute || 0}
              onChange={(e) =>
                setEditedPermissions({
                  ...editedPermissions,
                  rateLimits: {
                    ...editedPermissions?.rateLimits,
                    requestsPerMinute: parseInt(e.target.value),
                  },
                })
              }
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-dark-text focus:border-accent-blue transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-text/80 mb-2">
              Tokens Per Day
            </label>
            <input
              type="number"
              value={editedPermissions?.rateLimits?.tokensPerDay || 0}
              onChange={(e) =>
                setEditedPermissions({
                  ...editedPermissions,
                  rateLimits: {
                    ...editedPermissions?.rateLimits,
                    tokensPerDay: parseInt(e.target.value),
                  },
                })
              }
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-dark-text focus:border-accent-blue transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-text/80 mb-2">Allowed Domains</label>
          <div className="flex flex-wrap gap-2">
            {editedPermissions?.allowedDomains?.map((domain: string, idx: number) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-dark-bg border border-dark-border rounded px-3 py-1"
              >
                <span className="text-sm text-dark-text">{domain}</span>
                <button
                  onClick={() => {
                    const updated = editedPermissions.allowedDomains.filter(
                      (_: any, i: number) => i !== idx
                    );
                    setEditedPermissions({ ...editedPermissions, allowedDomains: updated });
                  }}
                  className="text-red-400 hover:text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Add domain and press Enter"
            onKeyPress={(e) => {
              if (e.key === "Enter" && e.currentTarget.value) {
                setEditedPermissions({
                  ...editedPermissions,
                  allowedDomains: [...(editedPermissions?.allowedDomains || []), e.currentTarget.value],
                });
                e.currentTarget.value = "";
              }
            }}
            className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-dark-text placeholder-dark-text/40 focus:border-accent-blue transition-colors mt-2"
          />
        </div>

        <button
          onClick={handleSavePermissions}
          disabled={saving}
          className="w-full px-4 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue/90 disabled:opacity-50 transition-colors font-semibold flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Permissions
            </>
          )}
        </button>
      </div>

      {/* Logs */}
      <div>
        <h2 className="text-xl font-bold text-dark-text mb-4">Activity Log</h2>
        <LogTable logs={logs} />
      </div>

      {/* Kill Switch */}
      <div>
        <h2 className="text-xl font-bold text-dark-text mb-4">Danger Zone</h2>
        <div className="max-w-xs">
          <KillSwitch
            agentName={agent.name}
            agentId={agent.id}
            onConfirm={handleKillAgent}
          />
        </div>
      </div>
    </div>
  );
}
