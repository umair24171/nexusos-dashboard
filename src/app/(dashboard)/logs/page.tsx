"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { AuditLog } from "@/types";
import LogTable from "@/components/LogTable";
import { Search, Download } from "lucide-react";

export default function LogsPage() {
  const [logs, setLogs]                     = useState<AuditLog[]>([]);
  const [filteredLogs, setFiltered]         = useState<AuditLog[]>([]);
  const [loading, setLoading]               = useState(true);
  const [searchTerm, setSearchTerm]         = useState("");
  const [agentFilter, setAgentFilter]       = useState("");
  const [statusFilter, setStatusFilter]     = useState<"all" | "success" | "failed">("all");
  const [dateRange, setDateRange]           = useState({ start: "", end: "" });
  const [agents, setAgents]                 = useState<any[]>([]);

  useEffect(() => { loadLogs(); loadAgents(); }, []);
  useEffect(() => { filterLogs(); }, [logs, searchTerm, agentFilter, statusFilter, dateRange]);

  const loadLogs = async () => {
    try {
      const r = await apiClient.get("/logs");
      setLogs(r.data.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const loadAgents = async () => {
    try {
      const r = await apiClient.get("/agents");
      setAgents(r.data.data ?? []);
    } catch (e) { console.error(e); }
  };

  const filterLogs = () => {
    let f = logs;
    if (searchTerm)      f = f.filter(l =>
      l.traceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.event.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (agentFilter)     f = f.filter(l => l.agentId === agentFilter);
    if (statusFilter !== "all") f = f.filter(l => l.success === (statusFilter === "success"));
    if (dateRange.start) f = f.filter(l => new Date(l.timestamp) >= new Date(dateRange.start));
    if (dateRange.end)   {
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59);
      f = f.filter(l => new Date(l.timestamp) <= end);
    }
    setFiltered(f);
  };

  const handleExport = (format: "csv" | "json") => {
    let content = "";
    const filename = `logs-${new Date().toISOString().split("T")[0]}`;
    if (format === "json") {
      content = JSON.stringify(filteredLogs, null, 2);
    } else {
      const headers = ["Timestamp", "Agent", "Event", "Tool", "Status", "Duration"];
      const rows = filteredLogs.map(l => [
        l.timestamp, l.agentName, l.event, l.action.tool,
        l.success ? "Success" : "Failed", l.duration ? `${l.duration}ms` : "-",
      ]);
      content = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    }
    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${filename}.${format}`;
    a.click();
  };

  if (loading) {
    return (
      <div className="p-8 font-mono text-xs text-accent-blue">
        $ loading logs<span className="animate-[cursor-blink_1s_step-end_infinite] text-accent-blue">▊</span>
      </div>
    );
  }

  const filterInputCls  = "w-full px-3 py-2 bg-dark-card border border-dark-border font-mono text-xs text-dark-text placeholder-nx-muted focus:border-accent-blue/50 transition-colors";
  const filterSelectCls = "w-full px-3 py-2 bg-dark-card border border-dark-border font-mono text-xs text-dark-text focus:border-accent-blue/50 transition-colors";

  return (
    <div className="p-8 space-y-6 animate-enter">

      {/* ── Header ── */}
      <div>
        <h1 className="font-mono text-2xl font-bold text-dark-text mb-1">Logs</h1>
        <p className="font-mono text-xs text-nx-muted">
          {filteredLogs.length} of {logs.length} entries
        </p>
      </div>

      {/* ── Filters ── */}
      <div className="border border-dark-border bg-dark-card p-4 space-y-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-nx-muted">Filters</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-nx-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="search trace, agent, event..."
              className={`${filterInputCls} pl-9`}
            />
          </div>

          {/* Agent */}
          <select
            value={agentFilter}
            onChange={e => setAgentFilter(e.target.value)}
            className={filterSelectCls}
          >
            <option value="">all agents</option>
            {agents.map(a => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className={filterSelectCls}
          >
            <option value="all">all status</option>
            <option value="success">success</option>
            <option value="failed">failed</option>
          </select>
        </div>

        {/* Date range */}
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            value={dateRange.start}
            onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
            className={filterInputCls}
          />
          <input
            type="date"
            value={dateRange.end}
            onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
            className={filterInputCls}
          />
        </div>
      </div>

      {/* ── Export ── */}
      <div className="flex gap-3">
        {(["csv", "json"] as const).map(fmt => (
          <button
            key={fmt}
            onClick={() => handleExport(fmt)}
            className="flex items-center gap-1.5 px-4 py-2 border border-dark-border font-mono text-xs text-nx-muted hover:border-accent-blue/40 hover:text-dark-text transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Export {fmt.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      <LogTable logs={filteredLogs} />
    </div>
  );
}
