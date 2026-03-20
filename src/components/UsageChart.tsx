"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface UsageChartProps {
  used: number;
  limit: number;
  label?: string;
}

export default function UsageChart({ used, limit, label = "Usage" }: UsageChartProps) {
  const data = [
    {
      name: label,
      used,
      remaining: Math.max(0, limit - used),
    },
  ];

  const percentage = Math.round((used / limit) * 100);
  const color = percentage > 90 ? "#ef4444" : percentage > 70 ? "#eab308" : "#22c55e";

  return (
    <div className="bg-dark-card border border-dark-border rounded-lg p-6">
      <div className="mb-6">
        <div className="flex items-end justify-between mb-2">
          <h3 className="text-lg font-semibold text-dark-text">{label}</h3>
          <span className="text-2xl font-bold" style={{ color }}>
            {percentage}%
          </span>
        </div>
        <p className="text-sm text-dark-text/60">
          {used.toLocaleString()} / {limit.toLocaleString()}
        </p>
      </div>

      <div className="h-4 bg-dark-bg rounded-full overflow-hidden border border-dark-border mb-4">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${Math.min(100, percentage)}%`,
            backgroundColor: color,
          }}
        />
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="name" stroke="#f1f5f9" />
          <YAxis stroke="#f1f5f9" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid #334155",
              borderRadius: "4px",
            }}
            labelStyle={{ color: "#f1f5f9" }}
          />
          <Bar dataKey="used" fill={color} name="Used" />
          <Bar dataKey="remaining" fill="#334155" name="Remaining" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
