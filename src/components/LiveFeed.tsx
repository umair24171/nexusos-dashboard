"use client";

import { useEffect, useState } from "react";
import { AuditLog } from "@/types";
import { wsClient } from "@/lib/ws";
import { formatTimeAgo } from "@/lib/utils";
import { CheckCircle2, XCircle, Activity } from "lucide-react";

interface LiveFeedProps {
  limit?: number;
}

export default function LiveFeed({ limit = 20 }: LiveFeedProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = wsClient.connect();

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("subscribe", { channel: "logs" });
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    socket.on("log", (log: AuditLog) => {
      setLogs((prev) => {
        const updated = [log, ...prev];
        return updated.slice(0, limit);
      });
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("log");
    };
  }, [limit]);

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-dark-text">Live Activity Feed</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-400" : "bg-gray-500"}`} />
          <span className="text-xs text-dark-text/60">
            {connected ? "Connected" : "Connecting..."}
          </span>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-8 h-8 text-dark-text/30 mx-auto mb-2" />
            <p className="text-dark-text/60 text-sm">Waiting for activity...</p>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 p-3 bg-dark-sidebar/30 rounded hover:bg-dark-sidebar/50 transition-colors"
            >
              <div className="mt-1">
                {log.success ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="text-sm font-semibold text-dark-text">{log.agentName}</p>
                  <span className="text-xs text-accent-blue bg-accent-blue/10 px-2 py-1 rounded">
                    {log.action.tool}
                  </span>
                </div>
                <p className="text-xs text-dark-text/60 mt-1">{log.event}</p>
                <p className="text-xs text-dark-text/40 mt-1">{formatTimeAgo(log.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
