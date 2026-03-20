"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { AuditLog } from "@/types";
import LogTable from "@/components/LogTable";
import { Search, Download, Calendar } from "lucide-react";

export default function LogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "failed">("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    loadLogs();
    loadAgents();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, agentFilter, eventTypeFilter, statusFilter, dateRange]);

  const loadLogs = async () => {
    try {
      const response = await apiClient.get("/logs");
      setLogs(response.data);
    } catch (error) {
      console.error("Failed to load logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAgents = async () => {
    try {
      const response = await apiClient.get("/agents");
      setAgents(response.data);
    } catch (error) {
      console.error("Failed to load agents:", error);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(
        (l) =>
          l.traceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          l.event.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (agentFilter) {
      filtered = filtered.filter((l) => l.agentId === agentFilter);
    }

    if (eventTypeFilter) {
      filtered = filtered.filter((l) => l.event === eventTypeFilter);
    }

    if (statusFilter !== "all") {
      const isSuccess = statusFilter === "success";
      filtered = filtered.filter((l) => l.success === isSuccess);
    }

    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter((l) => new Date(l.timestamp) >= startDate);
    }

    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59);
      filtered = filtered.filter((l) => new Date(l.timestamp) <= endDate);
    }

    setFilteredLogs(filtered);
  };

  const handleExport = (format: "csv" | "json") => {
    let content = "";
    const filename = `logs-${new Date().toISOString().split("T")[0]}`;

    if (format === "json") {
      content = JSON.stringify(filteredLogs, null, 2);
    } else {
      const headers = ["Timestamp", "Agent", "Event", "Tool", "Status", "Duration"];
      const rows = filteredLogs.map((log) => [
        log.timestamp,
        log.agentName,
        log.event,
        log.action.tool,
        log.success ? "Success" : "Failed",
        log.duration ? `${log.duration}ms` : "-",
      ]);

      content = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    }

    const blob = new Blob([content], { type: format === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.${format}`;
    link.click();
  };

  if (loading) {
    return <div className="p-8 text-dark-text/60">Loading logs...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-dark-text mb-2">Logs</h1>
        <p className="text-dark-text/60">View and filter agent activity logs</p>
      </div>

      {/* Filters */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">Search Trace ID</label>
            <div className="relative">
              <Search className="absolute left-3 top-2 w-5 h-5 text-dark-text/40" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded text-dark-text placeholder-dark-text/40 focus:border-accent-blue transition-colors"
              />
            </div>
          </div>

          {/* Agent Filter */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">Agent</label>
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded text-dark-text focus:border-accent-blue transition-colors"
            >
              <option value="">All Agents</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 bg-dark-bg border border-dark-border rounded text-dark-text focus:border-accent-blue transition-colors"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">Start Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2 w-5 h-5 text-dark-text/40 pointer-events-none" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded text-dark-text focus:border-accent-blue transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-text mb-2">End Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-2 w-5 h-5 text-dark-text/40 pointer-events-none" />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full pl-10 pr-4 py-2 bg-dark-bg border border-dark-border rounded text-dark-text focus:border-accent-blue transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => handleExport("csv")}
          className="flex items-center gap-2 px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text hover:border-accent-blue transition-colors font-semibold"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
        <button
          onClick={() => handleExport("json")}
          className="flex items-center gap-2 px-4 py-2 bg-dark-card border border-dark-border rounded-lg text-dark-text hover:border-accent-blue transition-colors font-semibold"
        >
          <Download className="w-4 h-4" />
          Export JSON
        </button>
      </div>

      {/* Logs Table */}
      <div>
        <p className="text-sm text-dark-text/60 mb-4">
          Showing {filteredLogs.length} of {logs.length} logs
        </p>
        <LogTable logs={filteredLogs} />
      </div>
    </div>
  );
}
