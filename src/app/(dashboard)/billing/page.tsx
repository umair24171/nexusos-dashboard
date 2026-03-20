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
    features: [
      "Up to 2 agents",
      "10,000 logs/month",
      "1 API key",
      "7 day retention",
    ],
    limits: { agents: 2, logsPerMonth: 10000, apiKeys: 1, dataRetention: 7 },
  },
  {
    id: "starter",
    name: "Starter",
    price: 29,
    features: [
      "Up to 10 agents",
      "100,000 logs/month",
      "5 API keys",
      "30 day retention",
      "Priority support",
    ],
    limits: { agents: 10, logsPerMonth: 100000, apiKeys: 5, dataRetention: 30 },
  },
  {
    id: "pro",
    name: "Pro",
    price: 99,
    features: [
      "Up to 50 agents",
      "1M logs/month",
      "20 API keys",
      "90 day retention",
      "Advanced analytics",
      "Webhooks",
    ],
    limits: {
      agents: 50,
      logsPerMonth: 1000000,
      apiKeys: 20,
      dataRetention: 90,
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    features: [
      "Unlimited agents",
      "Unlimited logs",
      "Unlimited API keys",
      "1+ year retention",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
    ],
    limits: {
      agents: 999999,
      logsPerMonth: 999999999,
      apiKeys: 999999,
      dataRetention: 365,
    },
  },
];

export default function BillingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleUpgrade = async (planId: string) => {
    if (planId === "enterprise") {
      window.location.href = "mailto:sales@nexusos.com?subject=Enterprise Plan Inquiry";
      return;
    }

    setUpgrading(true);
    try {
      const response = await apiClient.post("/billing/checkout", { planId });
      window.location.href = response.data.checkoutUrl;
    } catch (error) {
      console.error("Failed to initiate checkout:", error);
      setUpgrading(false);
    }
  };

  const currentPlan = user?.plan || "free";
  const currentPlanData = plans.find((p) => p.id === currentPlan);

  if (loading) {
    return <div className="p-8 text-dark-text/60">Loading billing information...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-dark-text mb-2">Billing</h1>
        <p className="text-dark-text/60">Manage your subscription and view usage</p>
      </div>

      {/* Current Plan Card */}
      {currentPlanData && (
        <div className="bg-gradient-to-br from-accent-blue/20 to-accent-blue/5 border border-accent-blue/30 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-dark-text mb-4">
            You are on the <span className="text-accent-blue capitalize">{currentPlan}</span> plan
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-dark-bg/50 rounded-lg p-4">
              <p className="text-dark-text/60 text-sm mb-1">Active Agents</p>
              <p className="text-2xl font-bold text-dark-text">
                {user?.planLimits.agents || 0}
              </p>
            </div>
            <div className="bg-dark-bg/50 rounded-lg p-4">
              <p className="text-dark-text/60 text-sm mb-1">Logs/Month</p>
              <p className="text-2xl font-bold text-dark-text">
                {(user?.planLimits.logsPerMonth || 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-dark-bg/50 rounded-lg p-4">
              <p className="text-dark-text/60 text-sm mb-1">API Keys</p>
              <p className="text-2xl font-bold text-dark-text">
                {user?.planLimits.apiKeys || 0}
              </p>
            </div>
            <div className="bg-dark-bg/50 rounded-lg p-4">
              <p className="text-dark-text/60 text-sm mb-1">Data Retention</p>
              <p className="text-2xl font-bold text-dark-text">
                {user?.planLimits.dataRetention || 0}
                <span className="text-sm"> days</span>
              </p>
            </div>
          </div>

          {currentPlan !== "enterprise" && (
            <button
              onClick={() => handleUpgrade(currentPlan === "pro" ? "enterprise" : "pro")}
              className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors font-semibold"
            >
              Upgrade Plan
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Plan Comparison */}
      <div>
        <h2 className="text-2xl font-bold text-dark-text mb-6">Choose Your Plan</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = plan.id === currentPlan;
            const isBetter =
              (plan.id === "pro" && currentPlan === "starter") ||
              (plan.id === "starter" && currentPlan === "free") ||
              (plan.id === "pro" && currentPlan === "free");

            return (
              <div
                key={plan.id}
                className={`relative rounded-lg border transition-all ${
                  isCurrentPlan
                    ? "border-accent-blue bg-accent-blue/5"
                    : "border-dark-border bg-dark-card hover:border-accent-blue/50"
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute -top-3 left-4 px-3 py-1 bg-accent-blue text-white text-xs font-bold rounded">
                    Current Plan
                  </div>
                )}

                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-dark-text mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-dark-text">
                        {plan.price === null ? "Custom" : `$${plan.price}`}
                      </span>
                      {plan.price !== null && <span className="text-dark-text/60 text-sm">/month</span>}
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                        <span className="text-sm text-dark-text/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={isCurrentPlan || upgrading}
                    className={`w-full py-2 rounded-lg font-semibold transition-colors ${
                      isCurrentPlan
                        ? "bg-dark-sidebar text-dark-text/60 cursor-not-allowed"
                        : "bg-accent-blue text-white hover:bg-accent-blue/90"
                    }`}
                  >
                    {isCurrentPlan
                      ? "Current Plan"
                      : upgrading
                      ? "Processing..."
                      : plan.id === "enterprise"
                      ? "Contact Sales"
                      : "Upgrade"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing Information */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-dark-text mb-4">Billing & Invoices</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-dark-text/80">Next billing date</p>
            <p className="text-dark-text font-semibold">
              {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-dark-text/80">Payment method</p>
            <p className="text-dark-text font-semibold">Visa •••• 4242</p>
          </div>
          <div className="pt-3 border-t border-dark-border">
            <button className="text-accent-blue hover:text-accent-blue/80 transition-colors font-semibold text-sm">
              Manage Payment Method
            </button>
          </div>
          <div>
            <button className="text-accent-blue hover:text-accent-blue/80 transition-colors font-semibold text-sm">
              View All Invoices
            </button>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-dark-card border border-dark-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-dark-text mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-dark-text mb-2">Can I change my plan anytime?</p>
            <p className="text-dark-text/60 text-sm">
              Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <p className="font-semibold text-dark-text mb-2">What happens to my data if I downgrade?</p>
            <p className="text-dark-text/60 text-sm">
              Your data is retained according to your new plan's retention period. Older data may be archived.
            </p>
          </div>
          <div>
            <p className="font-semibold text-dark-text mb-2">Do you offer annual billing?</p>
            <p className="text-dark-text/60 text-sm">
              Contact our sales team for annual billing discounts. Email sales@nexusos.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
