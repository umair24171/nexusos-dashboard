"use client";

import { Agent } from "@/types";
import { formatTimeAgo, statusColor } from "@/lib/utils";
import { ExternalLink, Pause2, Play } from "lucide-react";
import Link from "next/link";

interface AgentCardProps {
  agent: Agent;
  onPause?: (agentId: string) => void;
  onResume?: (agentId: string) => void;
  loading?: boolean;
}

export default function AgentCard({ agent, onPause, onResume, loading = false }: AgentCardProps) {
  const statusColorClass = statusColor(agent.status);

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-4 hover:border-accent-blue/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-dark-text mb-1">{agent.name}</h3>
          <p className="text-sm text-dark-text/60 line-clamp-2">{agent.description || "No description"}</p>
        </div>
        <Link href={`/agents/${agent.id}`}>
          <button className="text-accent-blue hover:text-accent-blue/80 transition-colors">
            <ExternalLink className="w-5 h-5" />
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div>
          <p className="text-dark-text/60">Status</p>
          <p className={`font-semibold ${statusColorClass} capitalize`}>{agent.status}</p>
        </div>
        <div>
          <p className="text-dark-text/60">Framework</p>
          <p className="font-semibold text-dark-text">{agent.metadata.framework}</p>
        </div>
        <div>
          <p className="text-dark-text/60">Environment</p>
          <p className="font-semibold text-dark-text capitalize">{agent.metadata.environment}</p>
        </div>
        <div>
          <p className="text-dark-text/60">Last Seen</p>
          <p className="font-semibold text-dark-text text-xs">{formatTimeAgo(agent.stats.lastSeen)}</p>
        </div>
      </div>

      <div className="flex gap-2">
        {agent.status === "active" ? (
          <button
            onClick={() => onPause?.(agent.id)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            <Pause2 className="w-4 h-4" />
            Pause
          </button>
        ) : agent.status === "paused" ? (
          <button
            onClick={() => onResume?.(agent.id)}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20 disabled:opacity-50 transition-colors text-sm font-medium"
          >
            <Play className="w-4 h-4" />
            Resume
          </button>
        ) : null}
      </div>
    </div>
  );
}
