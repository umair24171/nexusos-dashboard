"use client";

import { Agent } from "@/types";
import { formatTimeAgo } from "@/lib/utils";
import { ExternalLink, Pause, Play } from "lucide-react";
import Link from "next/link";

interface AgentCardProps {
  agent:     Agent;
  onPause?:  (agentId: string) => void;
  onResume?: (agentId: string) => void;
  loading?:  boolean;
}

const STATUS = {
  active: {
    dot:   "bg-nx-green status-dot-active",
    text:  "text-nx-green",
    label: "active",
  },
  paused: {
    dot:   "bg-nx-yellow status-dot-paused",
    text:  "text-nx-yellow",
    label: "paused",
  },
  killed: {
    dot:   "bg-nx-red status-dot-killed",
    text:  "text-nx-red",
    label: "killed",
  },
} as const;

export default function AgentCard({ agent, onPause, onResume, loading = false }: AgentCardProps) {
  const s = STATUS[agent.status as keyof typeof STATUS] ?? STATUS.active;

  return (
    <div className="bg-dark-card border border-dark-border hover:border-accent-blue/30 transition-all duration-200 p-4 group">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {/* Pulsing status dot */}
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
          <div className="min-w-0">
            <h3 className="font-mono text-sm font-semibold text-dark-text truncate">
              {agent.name}
            </h3>
            <p className="font-mono text-[11px] text-nx-muted mt-0.5 truncate">
              {agent.description || "no description"}
            </p>
          </div>
        </div>
        <Link href={`/agents/${agent.agentId}`}>
          <button className="text-nx-muted hover:text-accent-blue transition-colors flex-shrink-0 ml-2">
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </Link>
      </div>

      {/* ── Meta grid ── */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 font-mono mb-4">
        <div>
          <p className="text-[9px] text-nx-muted uppercase tracking-widest mb-0.5">framework</p>
          <p className="text-xs text-dark-text">{agent.metadata?.framework || "—"}</p>
        </div>
        <div>
          <p className="text-[9px] text-nx-muted uppercase tracking-widest mb-0.5">env</p>
          <p className="text-xs text-dark-text capitalize">{agent.metadata?.environment || "—"}</p>
        </div>
        <div>
          <p className="text-[9px] text-nx-muted uppercase tracking-widest mb-0.5">status</p>
          <p className={`text-xs font-medium ${s.text}`}>{s.label}</p>
        </div>
        <div>
          <p className="text-[9px] text-nx-muted uppercase tracking-widest mb-0.5">last seen</p>
          <p className="text-xs text-dark-text">{agent.stats?.lastSeenAt ? formatTimeAgo(agent.stats.lastSeenAt) : "never"}</p>
        </div>
      </div>

      {/* ── Actions ── */}
      <div className="pt-3 border-t border-dark-border flex gap-2">
        {agent.status === "active" && (
          <button
            onClick={() => onPause?.(agent.id)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 font-mono text-[11px] text-nx-yellow border border-nx-yellow/25 hover:border-nx-yellow/60 hover:bg-nx-yellow/5 transition-all disabled:opacity-40"
          >
            <Pause className="w-3 h-3" />
            pause
          </button>
        )}
        {agent.status === "paused" && (
          <button
            onClick={() => onResume?.(agent.id)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-1.5 py-1.5 font-mono text-[11px] text-nx-green border border-nx-green/25 hover:border-nx-green/60 hover:bg-nx-green/5 transition-all disabled:opacity-40"
          >
            <Play className="w-3 h-3" />
            resume
          </button>
        )}
        {/* Kill switch always shown */}
        <button
          className="kill-switch flex items-center justify-center px-3 py-1.5 font-mono text-[11px]"
          onClick={() => {
            if (confirm(`Kill agent "${agent.name}"? This cannot be undone.`)) {
              // kill action would go here
            }
          }}
        >
          kill
        </button>
      </div>
    </div>
  );
}
