"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Alert, AlertRule } from "@/types";
import { formatTimeAgo } from "@/lib/utils";
import { Bell, CheckCircle2, Plus, Trash2, X } from "lucide-react";

const SEVERITY_STYLES = {
  critical: { text: "text-nx-red",    border: "border-nx-red/30",    bg: "bg-nx-red/5"    },
  high:     { text: "text-nx-red",    border: "border-nx-red/20",    bg: "bg-nx-red/5"    },
  medium:   { text: "text-nx-yellow", border: "border-nx-yellow/30", bg: "bg-nx-yellow/5" },
  low:      { text: "text-nx-muted",  border: "border-dark-border",  bg: "bg-dark-card"   },
} as const;

function getSeverityStyle(severity: string) {
  return SEVERITY_STYLES[severity as keyof typeof SEVERITY_STYLES] ?? SEVERITY_STYLES.low;
}

export default function AlertsPage() {
  const [alerts, setAlerts]         = useState<Alert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showRuleForm, setShowForm] = useState(false);
  const [newRule, setNewRule]       = useState({ type: "rate_limit_exceeded", threshold: 100, enabled: true });

  useEffect(() => { loadAlerts(); loadRules(); }, []);

  const loadAlerts = async () => {
    try { const r = await apiClient.get("/alerts"); setAlerts(r.data ?? []); }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadRules = async () => {
    try { const r = await apiClient.get("/alerts/rules"); setAlertRules(r.data ? Object.entries(r.data).map(([type, v]: [string, any]) => ({ id: type, type, ...v })) : []); }
    catch (e) { console.error(e); }
  };

  const handleResolve = async (alertId: string) => {
    try { await apiClient.patch(`/alerts/${alertId}`, { resolved: true }); loadAlerts(); }
    catch (e) { console.error(e); }
  };

  const handleAddRule = async () => {
    try {
      await apiClient.post("/alerts/rules", newRule);
      setNewRule({ type: "rate_limit_exceeded", threshold: 100, enabled: true });
      setShowForm(false);
      loadRules();
    } catch (e) { console.error(e); }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try { await apiClient.delete(`/alerts/rules/${ruleId}`); loadRules(); }
    catch (e) { console.error(e); }
  };

  const activeAlerts   = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  if (loading) {
    return (
      <div className="p-8 font-mono text-xs text-accent-blue">
        $ loading alerts<span className="animate-[cursor-blink_1s_step-end_infinite] text-accent-blue">▊</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-enter">

      {/* ── Header ── */}
      <div>
        <h1 className="font-mono text-2xl font-bold text-dark-text mb-1">Alerts</h1>
        <p className="font-mono text-xs text-nx-muted">
          {activeAlerts.length} active · {resolvedAlerts.length} resolved
        </p>
      </div>

      {/* ── Active Alerts ── */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-nx-muted mb-3">
          Active ({activeAlerts.length})
        </p>
        {activeAlerts.length === 0 ? (
          <div className="border border-dark-border p-8 text-center">
            <Bell className="w-6 h-6 text-nx-muted mx-auto mb-2" />
            <p className="font-mono text-xs text-nx-muted">no active alerts</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeAlerts.map(alert => {
              const s = getSeverityStyle(alert.severity);
              return (
                <div
                  key={alert.id}
                  className={`border ${s.border} ${s.bg} p-4 flex items-start justify-between`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5 flex-wrap">
                      <span className={`font-mono text-[10px] uppercase tracking-widest font-bold ${s.text}`}>
                        {alert.severity}
                      </span>
                      <span className="font-mono text-xs text-dark-text font-medium">{alert.agentName}</span>
                      <span className="font-mono text-[11px] text-nx-muted">{alert.type}</span>
                    </div>
                    <p className="font-mono text-xs text-dark-text/70 mb-1">{alert.message}</p>
                    <p className="font-mono text-[10px] text-nx-muted">{formatTimeAgo(alert.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-nx-green/30 text-nx-green hover:border-nx-green/60 hover:bg-nx-green/5 font-mono text-[11px] transition-all ml-4 flex-shrink-0"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    resolve
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Alert Rules ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-nx-muted">
            Alert Rules ({alertRules.length})
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-blue text-black font-mono text-[11px] font-bold hover:bg-accent-blue/90 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Rule
          </button>
        </div>

        {alertRules.length === 0 ? (
          <div className="border border-dark-border p-6 font-mono text-xs text-nx-muted text-center">
            $ no alert rules configured
          </div>
        ) : (
          <div className="border border-dark-border overflow-hidden">
            {alertRules.map((rule, i) => (
              <div
                key={rule.id}
                className={`flex items-center justify-between px-4 py-3 font-mono ${
                  i !== alertRules.length - 1 ? "border-b border-dark-border/50" : ""
                } ${i % 2 === 0 ? "bg-dark-bg" : "bg-dark-card/30"}`}
              >
                <div>
                  <p className="text-xs text-dark-text capitalize mb-0.5">{rule.type.replace(/_/g, " ")}</p>
                  <p className="text-[10px] text-nx-muted">threshold: {rule.threshold}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[10px] uppercase tracking-wider font-semibold ${
                    rule.enabled ? "text-nx-green" : "text-nx-muted"
                  }`}>
                    {rule.enabled ? "enabled" : "disabled"}
                  </span>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="kill-switch p-1.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Resolved (collapsed list) ── */}
      {resolvedAlerts.length > 0 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-nx-muted mb-3">
            Resolved ({resolvedAlerts.length})
          </p>
          <div className="space-y-1 opacity-50">
            {resolvedAlerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="flex items-center justify-between border border-dark-border px-4 py-2.5">
                <div>
                  <p className="font-mono text-xs text-dark-text">{alert.agentName}</p>
                  <p className="font-mono text-[10px] text-nx-muted">{alert.message}</p>
                </div>
                <p className="font-mono text-[10px] text-nx-muted">
                  {formatTimeAgo(alert.resolvedAt || "")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Add Rule Modal ── */}
      {showRuleForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
              <span className="font-mono text-sm font-semibold text-dark-text">Add Alert Rule</span>
              <button onClick={() => setShowForm(false)} className="text-nx-muted hover:text-dark-text">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-nx-muted block mb-1.5">
                  Rule Type
                </label>
                <select
                  value={newRule.type}
                  onChange={e => setNewRule({ ...newRule, type: e.target.value })}
                  className="nx-select"
                >
                  <option value="rate_limit_exceeded">Rate Limit Exceeded</option>
                  <option value="token_limit_exceeded">Token Limit Exceeded</option>
                  <option value="agent_timeout">Agent Timeout</option>
                  <option value="high_error_rate">High Error Rate</option>
                </select>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-nx-muted block mb-1.5">
                  Threshold
                </label>
                <input
                  type="number"
                  value={newRule.threshold}
                  onChange={e => setNewRule({ ...newRule, threshold: parseInt(e.target.value) })}
                  className="nx-input"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newRule.enabled}
                  onChange={e => setNewRule({ ...newRule, enabled: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#00FFD1]"
                />
                <span className="font-mono text-xs text-dark-text">enabled</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 border border-dark-border font-mono text-xs text-nx-muted hover:border-nx-muted transition-colors"
                >
                  cancel
                </button>
                <button
                  onClick={handleAddRule}
                  className="flex-1 py-2 bg-accent-blue text-black font-mono text-xs font-bold hover:bg-accent-blue/90 transition-colors"
                >
                  create rule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
