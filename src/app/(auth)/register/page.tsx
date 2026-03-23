"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";

function RegisterForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const planParam    = searchParams.get("plan");
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: "", orgName: "",
  });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const r = await apiClient.post("/auth/register", {
        name: formData.name, email: formData.email,
        password: formData.password, orgName: formData.orgName,
      });
      const { accessToken, refreshToken, user } = r.data;
      localStorage.setItem("accessToken",  accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user",         JSON.stringify(user));
      // If user came from a paid plan CTA, send them straight to billing
      router.push(planParam && planParam !== "free" ? "/billing" : "/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { id: "name",            label: "Full Name",    type: "text",     placeholder: "Jane Smith"        },
    { id: "email",           label: "Email",        type: "email",    placeholder: "you@example.com"   },
    { id: "orgName",         label: "Organization", type: "text",     placeholder: "Acme Corp (optional)" },
    { id: "password",        label: "Password",     type: "password", placeholder: "••••••••"          },
    { id: "confirmPassword", label: "Confirm",      type: "password", placeholder: "••••••••"          },
  ];

  return (
    <div className="min-h-screen bg-dark-bg dot-grid flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-enter">

        {/* ── Logo ── */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 border border-accent-blue flex items-center justify-center">
            <span className="font-mono text-accent-blue text-sm font-bold">NX</span>
          </div>
          <span className="font-mono text-sm tracking-[0.2em] text-dark-text uppercase">nexusos</span>
        </div>

        {/* ── Card ── */}
        <div className="bg-dark-card border border-dark-border p-6 space-y-5">
          <div>
            <h1 className="font-mono text-lg font-bold text-dark-text mb-0.5">Create account</h1>
            <p className="font-mono text-[11px] text-nx-muted">Start monitoring your AI agents</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {fields.map(f => (
              <div key={f.id}>
                <label className="font-mono text-[10px] uppercase tracking-widest text-nx-muted block mb-1.5">
                  {f.label}
                </label>
                <input
                  id={f.id}
                  name={f.id}
                  type={f.type}
                  value={formData[f.id as keyof typeof formData]}
                  onChange={handleChange}
                  required={f.id !== "orgName"}
                  placeholder={f.placeholder}
                  className="nx-input"
                />
              </div>
            ))}

            {error && (
              <div className="border border-nx-red/30 bg-nx-red/5 px-3 py-2">
                <p className="font-mono text-[11px] text-nx-red">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent-blue text-black font-mono text-xs font-bold hover:bg-accent-blue/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 mt-1"
            >
              {loading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> creating account...</>
              ) : (
                "Create Account →"
              )}
            </button>
          </form>

          <p className="font-mono text-[11px] text-nx-muted text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-accent-blue/80 hover:text-accent-blue transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
