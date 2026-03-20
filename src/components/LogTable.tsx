"use client";

import { AuditLog } from "@/types";
import { formatDate, formatDuration } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

interface LogTableProps {
  logs:     AuditLog[];
  loading?: boolean;
}

export default function LogTable({ logs, loading = false }: LogTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="bg-dark-card border border-dark-border p-8 font-mono text-xs text-nx-muted text-center">
        loading logs...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-dark-card border border-dark-border p-8 font-mono text-xs text-nx-muted text-center">
        $ no logs found
      </div>
    );
  }

  return (
    <div className="bg-dark-card border border-dark-border overflow-hidden">
      {/* ── Table header ── */}
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-[11px]">
          <thead>
            <tr className="border-b border-dark-border">
              <th className="w-6 px-3 py-2.5" />
              <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-nx-muted font-medium">
                Timestamp
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-nx-muted font-medium">
                Agent
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-nx-muted font-medium">
                Event
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-nx-muted font-medium">
                Tool
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-nx-muted font-medium">
                Duration
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-widest text-nx-muted font-medium">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <>
                <tr
                  key={log.id}
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  className={`border-b border-dark-border/50 cursor-pointer transition-colors ${
                    log.success ? "log-row-success" : "log-row-error"
                  }`}
                >
                  {/* Expand chevron */}
                  <td className="px-3 py-2">
                    <ChevronRight
                      className={`w-3 h-3 text-nx-muted transition-transform ${
                        expandedId === log.id ? "rotate-90" : ""
                      }`}
                    />
                  </td>

                  {/* Timestamp */}
                  <td className="px-3 py-2 text-nx-muted whitespace-nowrap tabular-nums">
                    {formatDate(log.timestamp)}
                  </td>

                  {/* Agent */}
                  <td className="px-3 py-2 text-dark-text font-medium">{log.agentName}</td>

                  {/* Event */}
                  <td className="px-3 py-2 text-dark-text/70">{log.event}</td>

                  {/* Tool */}
                  <td className="px-3 py-2 text-accent-blue/80">{log.action?.tool ?? "—"}</td>

                  {/* Duration */}
                  <td className="px-3 py-2 text-nx-muted tabular-nums whitespace-nowrap">
                    {log.duration ? formatDuration(log.duration) : "—"}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2">
                    {log.success ? (
                      <span className="text-nx-green font-semibold">SUCCESS</span>
                    ) : (
                      <span className="text-nx-red font-semibold">FAILED</span>
                    )}
                  </td>
                </tr>

                {/* Expanded row */}
                {expandedId === log.id && (
                  <tr key={`${log.id}-expanded`} className="border-b border-dark-border/50">
                    <td colSpan={7} className="px-6 py-4 bg-dark-bg/40">
                      <div className="space-y-3 text-[11px]">
                        {/* Trace ID */}
                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-nx-muted block mb-1">
                            Trace ID
                          </span>
                          <span className="text-accent-blue/80 break-all">{log.traceId}</span>
                        </div>

                        {log.action?.input && (
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-nx-muted block mb-1">
                              Input
                            </span>
                            <pre className="text-dark-text/60 bg-dark-card p-2 border border-dark-border overflow-x-auto">
                              {JSON.stringify(log.action.input, null, 2)}
                            </pre>
                          </div>
                        )}

                        {log.action?.output && (
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-nx-muted block mb-1">
                              Output
                            </span>
                            <pre className="text-dark-text/60 bg-dark-card p-2 border border-dark-border overflow-x-auto">
                              {JSON.stringify(log.action.output, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
