"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { Alert, AlertRule } from "@/types";
import { severityColor, severityBgColor, formatTimeAgo } from "@/lib/utils";
import { Bell, CheckCircle2, Plus, Trash2 } from "lucide-react";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [newRule, setNewRule] = useState({
    type: "rate_limit_exceeded",
    threshold: 100,
    enabled: true,
  });

  useEffect(() => {
    loadAlerts();
    loadRules();
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await apiClient.get("/alerts");
      setAlerts(response.data);
    } catch (error) {
      console.error("Failed to load alerts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadRules = async () => {
    try {
      const response = await apiClient.get("/alerts/rules");
      setAlertRules(response.data);
    } catch (error) {
      console.error("Failed to load alert rules:", error);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await apiClient.patch(`/alerts/${alertId}`, { resolved: true });
      loadAlerts();
    } catch (error) {
      console.error("Failed to resolve alert:", error);
    }
  };

  const handleAddRule = async () => {
    try {
      await apiClient.post("/alerts/rules", newRule);
      setNewRule({ type: "rate_limit_exceeded", threshold: 100, enabled: true });
      setShowRuleForm(false);
      loadRules();
    } catch (error) {
      console.error("Failed to add alert rule:", error);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await apiClient.delete(`/alerts/rules/${ruleId}`);
      loadRules();
    } catch (error) {
      console.error("Failed to delete alert rule:", error);
    }
  };

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const resolvedAlerts = alerts.filter((a) => a.resolved);

  if (loading) {
    return <div className="p-8 text-dark-text/60">Loading alerts...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-text mb-2">Alerts</h1>
        <p className="text-dark-text/60">Manage system alerts and alert rules</p>
      </div>

      {/* Active Alerts */}
      <div>
        <h2 className="text-xl font-bold text-dark-text mb-4">Active Alerts ({activeAlerts.length})</h2>

        {activeAlerts.length === 0 ? (
          <div className="bg-dark-card border border-dark-border rounded-lg p-8 text-center">
            <Bell className="w-8 h-8 text-dark-text/30 mx-auto mb-2" />
            <p className="text-dark-text/60">No active alerts</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeAlerts.map((alert) => {
              const severityBgClass = severityBgColor(alert.severity);
              const severityTextClass = severityColor(alert.severity);
              return (
                <div
                  key={alert.id}
                  className="bg-dark-card border border-dark-border rounded-lg p-4 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`text-xs font-bold uppercase px-2 py-1 rounded ${severityBgClass} ${severityTextClass}`}
                      >
                        {alert.severity}
                      </span>
                      <p className="font-semibold text-dark-text">{alert.agentName}</p>
                      <p className="text-sm text-dark-text/60">{alert.type}</p>
                    </div>
                    <p className="text-sm text-dark-text/80 mb-2">{alert.message}</p>
                    <p className="text-xs text-dark-text/40">{formatTimeAgo(alert.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => handleResolveAlert(alert.id)}
                    className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 rounded hover:bg-green-500/20 transition-colors text-sm font-medium whitespace-nowrap ml-4"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Resolve
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Alert Rules */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-dark-text">Alert Rules</h2>
          <button
            onClick={() => setShowRuleForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Rule
          </button>
        </div>

        {alertRules.length === 0 ? (
          <div className="bg-dark-card border border-dark-border rounded-lg p-8 text-center">
            <p className="text-dark-text/60">No alert rules configured</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alertRules.map((rule) => (
              <div
                key={rule.id}
                className="bg-dark-card border border-dark-border rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex-1">
                  <p className="font-semibold text-dark-text capitalize">{rule.type}</p>
                  <p className="text-sm text-dark-text/60">
                    Threshold: {rule.threshold} | Condition: {rule.condition}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      rule.enabled
                        ? "bg-green-500/10 text-green-400"
                        : "bg-gray-500/10 text-gray-400"
                    }`}
                  >
                    {rule.enabled ? "Enabled" : "Disabled"}
                  </span>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="flex items-center gap-2 px-3 py-1 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-colors text-sm font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Resolved Alerts */}
      {resolvedAlerts.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-dark-text mb-4">Resolved Alerts ({resolvedAlerts.length})</h2>
          <div className="space-y-2">
            {resolvedAlerts.slice(0, 5).map((alert) => (
              <div
                key={alert.id}
                className="bg-dark-card border border-dark-border rounded-lg p-4 flex items-center justify-between opacity-60"
              >
                <div className="flex-1">
                  <p className="text-sm text-dark-text">{alert.agentName}</p>
                  <p className="text-xs text-dark-text/60">{alert.message}</p>
                </div>
                <p className="text-xs text-dark-text/40">{formatTimeAgo(alert.resolvedAt || "")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Rule Modal */}
      {showRuleForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-dark-text mb-4">Add Alert Rule</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Rule Type</label>
                <select
                  value={newRule.type}
                  onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-dark-text focus:border-accent-blue transition-colors"
                >
                  <option value="rate_limit_exceeded">Rate Limit Exceeded</option>
                  <option value="token_limit_exceeded">Token Limit Exceeded</option>
                  <option value="agent_timeout">Agent Timeout</option>
                  <option value="high_error_rate">High Error Rate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Threshold</label>
                <input
                  type="number"
                  value={newRule.threshold}
                  onChange={(e) => setNewRule({ ...newRule, threshold: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-dark-text focus:border-accent-blue transition-colors"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRule.enabled}
                    onChange={(e) => setNewRule({ ...newRule, enabled: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-medium text-dark-text">Enabled</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRuleForm(false)}
                className="flex-1 px-4 py-2 bg-dark-sidebar border border-dark-border rounded text-dark-text hover:bg-dark-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddRule}
                className="flex-1 px-4 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue/90 transition-colors font-semibold"
              >
                Create Rule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
