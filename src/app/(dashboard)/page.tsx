"use client";

import { useEffect, useState } from "react";
import { Zap, AlertCircle, FileText, Flame } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { User, Alert } from "@/types";
import LiveFeed from "@/components/LiveFeed";
import UsageChart from "@/components/UsageChart";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function DashboardPage() {
  const [user, setUser]   = useState<User | null>(null);
  const [stats, setStats] = useState({
    totalAgents:  0,
    activeAlerts: 0,
    logsToday:    0,
    tokensUsed:   0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = localStorage.getItem("user");
        if (raw && raw !== "undefined" && raw !== "null") {
          try { setUser(JSON.parse(raw)); } catch { localStorage.removeItem("user"); }
        }

        const [agentsRes, alertsRes] = await Promise.all([
          apiClient.get("/agents"),
          apiClient.get("/alerts"),
        ]);

        setStats({
          totalAgents:  agentsRes.data?.length ?? 0,
          activeAlerts: (alertsRes.data as Alert[])?.filter((a: Alert) => !a.resolved).length ?? 0,
          logsToday:    0,
          tokensUsed:   0,
        });
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const firstName = user?.name?.split(" ")[0] || "there";

  const statCards = [
    { label: "Total Agents",  value: stats.totalAgents,             icon: Zap         },
    { label: "Active Alerts", value: stats.activeAlerts,            icon: AlertCircle },
    { label: "Logs Today",    value: stats.logsToday,               icon: FileText    },
    { label: "Tokens Used",   value: stats.tokensUsed.toLocaleString(), icon: Flame   },
  ];

  return (
    <div className="p-8 space-y-8 animate-enter">

      {/* ── Header ── */}
      <div>
        <h1 className="font-mono text-2xl font-bold text-dark-text tracking-tight mb-1">
          {getGreeting()},{" "}
          <span className="text-accent-blue glow-cyan-text">{firstName}</span>
        </h1>
        <p className="font-mono text-xs text-nx-muted">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month:   "long",
            day:     "numeric",
            year:    "numeric",
          })}
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className="bg-dark-card border border-dark-border p-5 hover:border-accent-blue/25 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="font-mono text-[10px] uppercase tracking-widest text-nx-muted">
                  {card.label}
                </p>
                <Icon className="w-3.5 h-3.5 text-nx-muted group-hover:text-accent-blue/60 transition-colors" />
              </div>
              <p className="font-mono text-3xl font-bold text-accent-blue tabular-nums">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Quick Actions ── */}
      <div className="flex items-center gap-4">
        <Link href="/agents">
          <button className="px-5 py-2 bg-accent-blue text-black font-mono text-xs font-bold hover:bg-accent-blue/90 transition-colors duration-150">
            + Register Agent
          </button>
        </Link>
        <Link href="/api-keys">
          <button className="px-5 py-2 border border-dark-border text-nx-muted font-mono text-xs hover:border-accent-blue/40 hover:text-dark-text transition-all duration-150">
            Create API Key
          </button>
        </Link>
      </div>

      {/* ── Live Feed + Usage ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <LiveFeed limit={30} />
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
