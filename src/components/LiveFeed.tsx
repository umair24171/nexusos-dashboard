"use client";

import { useEffect, useRef, useState } from "react";
import { AuditLog } from "@/types";
import { wsClient } from "@/lib/ws";

interface LiveFeedProps {
  limit?: number;
}

export default function LiveFeed({ limit = 30 }: LiveFeedProps) {
  const [logs, setLogs]           = useState<AuditLog[]>([]);
  const [connected, setConnected] = useState(false);
  const scrollRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const socket = wsClient.connect();

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("subscribe", { channel: "logs" });
    });

    socket.on("disconnect", () => setConnected(false));

    socket.on("log", (log: AuditLog) => {
      setLogs((prev) => [log, ...prev].slice(0, limit));
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("log");
    };
  }, [limit]);

  function fmtTime(ts: string) {
    return new Date(ts).toLocaleTimeString("en-US", {
      hour:   "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  }

  return (
    <div className="bg-dark-card border border-dark-border overflow-hidden">

      {/* ── Terminal title bar ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-dark-border bg-dark-bg/60">
        <div className="flex items-center gap-3">
          {/* macOS-style dots */}
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-nx-red/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-nx-yellow/60" />
            <span className="w-2.5 h-2.5 rounded-full bg-nx-green/60" />
          </div>
          <span className="font-mono text-[11px] text-nx-muted">~/nexusos/live-feed.log</span>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full live-dot ${
              connected ? "bg-accent-blue" : "bg-nx-muted"
            }`}
          />
          <span className={`font-mono text-[10px] uppercase tracking-widest ${
            connected ? "text-accent-blue" : "text-nx-muted"
          }`}>
            {connected ? "live" : "connecting"}
          </span>
        </div>
      </div>

      {/* ── Log stream ── */}
      <div
        ref={scrollRef}
        className="font-mono text-[11px] leading-5 h-80 overflow-y-auto p-3 space-y-px"
      >
        {logs.length === 0 ? (
          <div className="flex items-center gap-2 py-2 px-1 text-nx-muted">
            <span className="text-accent-blue">$</span>
            <span>waiting for agent events</span>
            <span className="text-accent-blue animate-[cursor-blink_1s_step-end_infinite]">▊</span>
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-baseline gap-3 px-1 py-0.5 hover:bg-dark-bg/40 rounded-sm transition-colors"
            >
              {/* Timestamp */}
              <span className="text-nx-muted flex-shrink-0 tabular-nums w-16">
                {fmtTime(log.timestamp)}
              </span>

              {/* Status */}
              <span
                className={`flex-shrink-0 w-8 font-semibold ${
                  log.success ? "text-nx-green" : "text-nx-red"
                }`}
              >
                {log.success ? "OK" : "ERR"}
              </span>

              {/* Agent */}
              <span className="text-accent-blue/70 flex-shrink-0 max-w-[90px] truncate">
                {log.agentName}
              </span>

              {/* Event */}
              <span className="text-dark-text/60 truncate flex-1">
                {log.event}
              </span>

              {/* Tool */}
              {log.action?.tool && (
                <span className="text-nx-muted flex-shrink-0 text-[10px] hidden sm:block">
                  [{log.action.tool}]
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
