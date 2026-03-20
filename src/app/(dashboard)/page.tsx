"use client";

import { useEffect, useState } from "react";
import { Zap, AlertCircle, FileText, Flame } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { User, Agent, Alert } from "@/types";
import LiveFeed from "@/components/LiveFeed";
import UsageChart from "@/components/UsageChart";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAlerts: 0,
    logsToday: 0,
    tokensUsed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (userData && userData !== "undefined" && userData !== "null") {
          try {
            setUser(JSON.parse(userData));
          } catch {
            localStorage.removeItem("user");
          }
        }

        const [agentsRes, alertsRes] = await Promise.all([
          apiClient.get("/agents"),
          apiClient.get("/alerts"),
        ]);

        setStats({
          totalAgents: agentsRes.data?.length ?? 0,
          activeAlerts: (alertsRes.data as Alert[])?.filter((a: Alert) => !a.resolved).length ?? 0,
          logsToday: 0,
          tokensUsed: 0,
        });
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const statCards = [
    {
      label: "Total Agents",
      value: stats.totalAgents,
      icon: Zap,
      color: "text-blue-400",
    },
    {
      label: "Active Alerts",
      value: stats.activeAlerts,
      icon: AlertCircle,
      color: "text-yellow-400",
    },
    {
      label: "Logs Today",
      value: stats.logsToday,
      icon: FileText,
      color: "text-green-400",
    },
    {
      label: "Tokens Used",
      value: stats.tokensUsed.toLocaleString(),
      icon: Flame,
      color: "text-red-400",
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark-text mb-2">Dashboard</h1>
        <p className="text-dark-text/60">
          Welcome back, {user?.name || "User"}! Here's your system overview.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="bg-dark-card border border-dark-border rounded-lg p-6 hover:border-accent-blue/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-dark-text/60">{card.label}</h3>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-3xl font-bold text-dark-text">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link href="/agents">
          <button className="px-6 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors font-semibold">
            Register Agent
          </button>
        </Link>
        <Link href="/api-keys">
          <button className="px-6 py-2 bg-dark-card border border-dark-border text-dark-text rounded-lg hover:border-accent-blue transition-colors font-semibold">
            Create API Key
          </button>
        </Link>
      </div>

      {/* Live Feed & Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveFeed limit={20} />
        </div>
        <div>
          <UsageChart
            used={stats.tokensUsed}
            limit={user?.planLimits?.logsPerMonth || 10000}
            label="Daily Tokens"
          />
        </div>
      </div>
    </div>
  );
}
