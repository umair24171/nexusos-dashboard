"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { User } from "@/types";
import { Check, ArrowRight } from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Free",
    price: 0,
    features: ["2 agents", "10K logs/month", "1 API key", "7-day retention"],
    limits: { agents: 2, logsPerMonth: 10000, apiKeys: 1, dataRetention: 7 },
  },
  {
    id: "starter",
    name: "Starter",
    price: 29,
    features: ["10 agents", "100K logs/month", "5 API keys", "30-day retention", "Email alerts"],
    limits: { agents: 10, logsPerMonth: 100000, apiKeys: 5, dataRetention: 30 },
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    popular: true,
    features: ["50 agents", "1M logs/month", "20 API keys", "90-day retention", "Webhooks", "Analytics"],
    limits: { agents: 50, logsPerMonth: 1000000, apiKeys: 20, dataRetention: 90 },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    features: ["Unlimited agents", "Unlimited logs", "Unlimited keys", "1yr retention", "SLA", "Dedicated support"],
    limits: { agents: 999999, logsPerMonth: 999999999, apiKeys: 999999, dataRetention: 365 },
  },
];

export default function BillingPage() {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw && raw !== "undefined" && raw !== "null") {
      try { setUser(JSON.parse(raw)); } catch { localStorage.removeItem("user"); }
    }
    setLoading(false);
  }, []);

  const handleUpgrade = async (planId: string) => {
    if (planId === "enterprise") {
      window.location.href = "mailto:sales@nexusos.com?subject=Enterprise Plan";
      return;
    }
    setUpgrading(true);
    try {
      const r = await apiClient.post("/billing/checkout", { planId });
      window.location.href = r.data?.checkoutUrl;
    } catch (e) { console.error(e); setUpgrading(false); }
  };

  const currentPlan     = user?.plan || "free";
  const currentPlanData = plans.find(p => p.id === currentPlan);

  if (loading) {
    return (
      <div className="p-8 font-mono text-xs text-accent-blue">
        $ loading billing<span className="animate-[cursor-blink_1s_step-end_infinite] text-accent-blue">▊</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 animate-enter">

      {/* ── Header ── */}
      <div>
        <h1 className="font-mono text-2xl font-bold text-dark-text mb-1">Billing</h1>
        <p className="font-mono text-xs text-nx-muted">Manage your subscription</p>
      </div>

      {/* ── Current Plan ── */}
      {currentPlanData && (
        <div className="border border-accent-blue/25 bg-accent-blue/[0.03] p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-nx-muted mb-2">Current Plan</p>
          <div className="flex items-baseline gap-3 mb-4">
            <h2 className="font-mono text-2xl font-bold text-accent-blue capitalize">{currentPlan}</h2>
            <span className="font-mono text-sm text-nx-muted">
              {currentPlanData.price === null
                ? "Enterprise"
                : currentPlanData.price === 0
                ? "free forever"
                : `$${currentPlanData.price}/mo`}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {[
              { label: "Agents",     value: user?.planLimits?.agents?.toLocaleString() ?? "—"     },
              { label: "Logs/Month", value: user?.planLimits?.logsPerMonth?.toLocaleString() ?? "—" },
              { label: "API Keys",   value: user?.planLimits?.apiKeys?.toLocaleString() ?? "—"    },
              { label: "Retention",  value: `${user?.planLimits?.dataRetention ?? 0}d`            },
            ].map(({ label, value }) => (
              <div key={label} className="bg-dark-bg border border-dark-border p-3">
                <p className="font-mono text-[9px] uppercase tracking-widest text-nx-muted mb-1">{label}</p>
                <p className="font-mono text-lg font-bold text-dark-text tabular-nums">{value}</p>
              </div>
            ))}
          </div>

          {currentPlan !== "enterprise" && (
            <button
              onClick={() => handleUpgrade(currentPlan === "pro" ? "enterprise" : "pro")}
              className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-black font-mono text-xs font-bold hover:bg-accent-blue/90 transition-colors"
            >
              Upgrade Plan
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ── Plan Grid ── */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-nx-muted mb-4">
          Choose Your Plan
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map(plan => {
            const isCurrent = plan.id === currentPlan;
            const isPro     = plan.id === "pro";
            return (
              <div
                key={plan.id}
                className={`relative border p-5 transition-all duration-200 ${
                  isCurrent
                    ? "border-accent-blue/40 bg-accent-blue/[0.03]"
                    : isPro
                    ? "border-accent-blue/20 bg-dark-card shadow-cyan-sm"
                    : "border-dark-border bg-dark-card hover:border-dark-border/80"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-accent-blue text-black font-mono text-[9px] font-bold uppercase tracking-widest">
                    Most Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-accent-blue text-black font-mono text-[9px] font-bold uppercase">
                    Current
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="font-mono text-sm font-bold text-dark-text mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-bold text-dark-text">
                      {plan.price === null ? "Custom" : `$${plan.price}`}
                    </span>
                    {plan.price !== null && (
                      <span className="font-mono text-xs text-nx-muted">/mo</span>
                    )}
                  </div>
                </div>

                <ul className="space-y-1.5 mb-5">
                  {plan.features.map((f, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-3 h-3 text-accent-blue mt-0.5 flex-shrink-0" />
                      <span className="font-mono text-[11px] text-dark-text/70">{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent || upgrading}
                  className={`w-full py-2 font-mono text-xs font-bold transition-colors ${
                    isCurrent
                      ? "bg-dark-bg border border-dark-border text-nx-muted cursor-default"
                      : isPro
                      ? "bg-accent-blue text-black hover:bg-accent-blue/90"
                      : "border border-dark-border text-nx-muted hover:border-accent-blue/40 hover:text-dark-text"
                  }`}
                >
                  {isCurrent ? "current plan" : upgrading ? "processing..." : plan.id === "enterprise" ? "contact sales" : "upgrade"}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Billing Info ── */}
      <div className="border border-dark-border bg-dark-card p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-nx-muted mb-4">Billing & Invoices</p>
        <div className="space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-nx-muted">Next billing date</span>
            <span className="text-dark-text">
              {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-nx-muted">Payment method</span>
            <span className="text-dark-text">Visa •••• 4242</span>
          </div>
          <div className="flex gap-4 pt-2 border-t border-dark-border">
            <button className="text-accent-blue/80 hover:text-accent-blue transition-colors">
              Manage Payment
            </button>
            <button className="text-accent-blue/80 hover:text-accent-blue transition-colors">
              View Invoices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
