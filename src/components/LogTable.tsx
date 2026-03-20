"use client";

import { AuditLog } from "@/types";
import { formatDate, formatDuration } from "@/lib/utils";
import { ChevronDown, CheckCircle2, XCircle } from "lucide-react";
import { useState } from "react";

interface LogTableProps {
  logs: AuditLog[];
  loading?: boolean;
}

export default function LogTable({ logs, loading = false }: LogTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="bg-dark-card rounded-lg p-8 text-center">
        <p className="text-dark-text/60">Loading logs...</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-dark-card rounded-lg p-8 text-center">
        <p className="text-dark-text/60">No logs found</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-dark-sidebar/50 border-b border-dark-border">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-dark-text/80"></th>
              <th className="px-4 py-3 text-left font-semibold text-dark-text/80">Timestamp</th>
              <th className="px-4 py-3 text-left font-semibold text-dark-text/80">Agent</th>
              <th className="px-4 py-3 text-left font-semibold text-dark-text/80">Event</th>
              <th className="px-4 py-3 text-left font-semibold text-dark-text/80">Tool</th>
              <th className="px-4 py-3 text-left font-semibold text-dark-text/80">Duration</th>
              <th className="px-4 py-3 text-left font-semibold text-dark-text/80">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-border">
            {logs.map((log) => (
              <tr
                key={log.id}
                className="hover:bg-dark-sidebar/30 transition-colors cursor-pointer"
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              >
                <td className="px-4 py-3">
                  <ChevronDown
                    className={`w-4 h-4 text-dark-text/60 transition-transform ${
                      expandedId === log.id ? "rotate-180" : ""
                    }`}
                  />
                </td>
                <td className="px-4 py-3 text-dark-text/80 whitespace-nowrap text-xs">
                  {formatDate(log.timestamp)}
                </td>
                <td className="px-4 py-3 text-dark-text font-medium">{log.agentName}</td>
                <td className="px-4 py-3 text-dark-text/80">{log.event}</td>
                <td className="px-4 py-3 text-accent-blue">{log.action.tool}</td>
                <td className="px-4 py-3 text-dark-text/80 whitespace-nowrap">
                  {log.duration ? formatDuration(log.duration) : "-"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {log.success ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-xs font-medium">Success</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-red-400 text-xs font-medium">Failed</span>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {expandedId && (
        <div className="border-t border-dark-border bg-dark-sidebar/50 p-4">
          {logs.find((l) => l.id === expandedId) && (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-dark-text/60 uppercase">Trace ID</p>
                <p className="text-sm text-dark-text font-mono break-all">{logs.find((l) => l.id === expandedId)?.traceId}</p>
              </div>

              {logs.find((l) => l.id === expandedId)?.action.input && (
                <div>
                  <p className="text-xs font-semibold text-dark-text/60 uppercase">Input</p>
                  <pre className="text-xs bg-dark-bg p-2 rounded text-dark-text/80 overflow-x-auto">
                    {JSON.stringify(logs.find((l) => l.id === expandedId)?.action.input, null, 2)}
                  </pre>
                </div>
              )}

              {logs.find((l) => l.id === expandedId)?.action.output && (
                <div>
                  <p className="text-xs font-semibold text-dark-text/60 uppercase">Output</p>
                  <pre className="text-xs bg-dark-bg p-2 rounded text-dark-text/80 overflow-x-auto">
                    {JSON.stringify(logs.find((l) => l.id === expandedId)?.action.output, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
