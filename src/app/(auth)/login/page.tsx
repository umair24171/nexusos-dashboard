"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const r = await apiClient.post("/auth/login", { email, password });
      const { accessToken, refreshToken, user } = r.data;
      localStorage.setItem("accessToken",  accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("user",         JSON.stringify(user));
      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="font-mono text-lg font-bold text-dark-text mb-0.5">Sign in</h1>
            <p className="font-mono text-[11px] text-nx-muted">Agent Control Tower</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-nx-muted block mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="nx-input"
              />
            </div>

            <div>
              <label className="font-mono text-[10px] uppercase tracking-widest text-nx-muted block mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="nx-input"
              />
            </div>

            {error && (
              <div className="border border-nx-red/30 bg-nx-red/5 px-3 py-2">
                <p className="font-mono text-[11px] text-nx-red">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-accent-blue text-black font-mono text-xs font-bold hover:bg-accent-blue/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-3.5 h-3.5 animate-spin" /> signing in...</>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          <p className="font-mono text-[11px] text-nx-muted text-center">
            No account?{" "}
            <Link href="/register" className="text-accent-blue/80 hover:text-accent-blue transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
