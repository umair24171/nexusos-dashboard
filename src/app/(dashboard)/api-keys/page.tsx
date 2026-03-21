"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { ApiKey } from "@/types";
import { maskApiKey, formatDate } from "@/lib/utils";
import { Plus, Copy, Trash2, X } from "lucide-react";

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys]         = useState<ApiKey[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showCreateModal, setCreate]  = useState(false);
  const [showKeyModal, setShowKey]    = useState(false);
  const [keyName, setKeyName]         = useState("");
  const [createdKey, setCreatedKey]   = useState<string | null>(null);
  const [creating, setCreating]       = useState(false);
  const [copied, setCopied]           = useState(false);

  useEffect(() => { loadApiKeys(); }, []);

  const loadApiKeys = async () => {
    try {
      const r = await apiClient.get("/keys");
      setApiKeys(r.data.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const r = await apiClient.post("/keys", { name: keyName });
      setCreatedKey(r.data.data?.key);
      setCreate(false);
      setShowKey(true);
      setKeyName("");
      loadApiKeys();
    } catch (e) { console.error(e); }
    finally { setCreating(false); }
  };

  const handleRevoke = async (keyId: string) => {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    try { await apiClient.delete(`/keys/${keyId}`); loadApiKeys(); }
    catch (e) { console.error(e); }
  };

  const copyKey = () => {
    if (!createdKey) return;
    navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="p-8 font-mono text-xs text-accent-blue">
        $ loading api keys<span className="animate-[cursor-blink_1s_step-end_infinite] text-accent-blue">▊</span>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 animate-enter">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-2xl font-bold text-dark-text mb-1">API Keys</h1>
          <p className="font-mono text-xs text-nx-muted">Programmatic access credentials</p>
        </div>
        <button
          onClick={() => setCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-black font-mono text-xs font-bold hover:bg-accent-blue/90 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Key
        </button>
      </div>

      {/* ── Table ── */}
      <div className="border border-dark-border overflow-hidden">
        <table className="w-full font-mono text-[11px]">
          <thead>
            <tr className="border-b border-dark-border bg-dark-card/60">
              {["Name", "Key Prefix", "Created", "Last Used", "Status", "Action"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-[9px] uppercase tracking-widest text-nx-muted font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {apiKeys.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-nx-muted">
                  $ no api keys — create one to get started
                </td>
              </tr>
            ) : (
              apiKeys.map((key, i) => (
                <tr
                  key={key.id}
                  className={`border-b border-dark-border/50 transition-colors hover:bg-dark-card/50 ${
                    i % 2 === 0 ? "bg-dark-bg" : "bg-dark-card/30"
                  }`}
                >
                  <td className="px-4 py-3 text-dark-text font-medium">{key.name}</td>
                  <td className="px-4 py-3 text-accent-blue/80">{maskApiKey(key.keyPrefix)}</td>
                  <td className="px-4 py-3 text-nx-muted tabular-nums">{formatDate(key.createdAt)}</td>
                  <td className="px-4 py-3 text-nx-muted tabular-nums">
                    {key.lastUsedAt ? formatDate(key.lastUsedAt) : "never"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider ${
                      key.isActive ? "text-nx-green" : "text-nx-muted"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${key.isActive ? "bg-nx-green" : "bg-nx-muted"}`} />
                      {key.isActive ? "active" : "inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleRevoke(key.id)}
                      className="kill-switch flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px]"
                    >
                      <Trash2 className="w-3 h-3" />
                      revoke
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Create Modal ── */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
              <span className="font-mono text-sm font-semibold text-dark-text">Create API Key</span>
              <button onClick={() => setCreate(false)} className="text-nx-muted hover:text-dark-text">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateKey} className="p-5 space-y-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-nx-muted block mb-1.5">
                  Key Name
                </label>
                <input
                  type="text"
                  value={keyName}
                  onChange={e => setKeyName(e.target.value)}
                  required
                  placeholder="e.g., production-key"
                  className="nx-input"
                />
              </div>
              <p className="font-mono text-[10px] text-nx-muted">
                You'll see the full key only once. Store it securely.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCreate(false)}
                  className="flex-1 py-2 border border-dark-border font-mono text-xs text-nx-muted hover:border-nx-muted transition-colors"
                >
                  cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-2 bg-accent-blue text-black font-mono text-xs font-bold hover:bg-accent-blue/90 disabled:opacity-50 transition-colors"
                >
                  {creating ? "creating..." : "create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Show Key Modal ── */}
      {showKeyModal && createdKey && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-accent-blue/40 w-full max-w-sm shadow-cyan-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-dark-border">
              <span className="font-mono text-sm font-semibold text-accent-blue">Key Created</span>
              <button onClick={() => { setShowKey(false); setCreatedKey(null); }} className="text-nx-muted hover:text-dark-text">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="font-mono text-[11px] text-nx-red border border-nx-red/20 bg-nx-red/5 px-3 py-2">
                ⚠ Copy this key now — it will not be shown again.
              </p>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-widest text-nx-muted block mb-1.5">
                  Your API Key
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={createdKey}
                    readOnly
                    className="flex-1 px-3 py-2 bg-dark-bg border border-dark-border font-mono text-[11px] text-accent-blue/90"
                  />
                  <button
                    onClick={copyKey}
                    className="px-3 py-2 border border-dark-border font-mono text-[11px] text-nx-muted hover:border-accent-blue hover:text-accent-blue transition-all flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copied ? "copied!" : "copy"}
                  </button>
                </div>
              </div>
              <button
                onClick={() => { setShowKey(false); setCreatedKey(null); }}
                className="w-full py-2 bg-accent-blue text-black font-mono text-xs font-bold hover:bg-accent-blue/90 transition-colors"
              >
                done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
