"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import { ApiKey } from "@/types";
import { maskApiKey, formatDate } from "@/lib/utils";
import { Plus, Copy, Trash2, CheckCircle2 } from "lucide-react";

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      const response = await apiClient.get("/api-keys");
      setApiKeys(response.data);
    } catch (error) {
      console.error("Failed to load API keys:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await apiClient.post("/api-keys", { name: keyName });
      setCreatedKey(response.data.key);
      setShowCreateModal(false);
      setShowKeyModal(true);
      setKeyName("");
      loadApiKeys();
    } catch (error) {
      console.error("Failed to create API key:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      await apiClient.delete(`/api-keys/${keyId}`);
      loadApiKeys();
    } catch (error) {
      console.error("Failed to revoke API key:", error);
    }
  };

  if (loading) {
    return <div className="p-8 text-dark-text/60">Loading API keys...</div>;
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-text mb-2">API Keys</h1>
          <p className="text-dark-text/60">Manage API keys for programmatic access</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/90 transition-colors font-semibold"
        >
          <Plus className="w-5 h-5" />
          Create New Key
        </button>
      </div>

      {/* API Keys Table */}
      <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-dark-sidebar/50 border-b border-dark-border">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-dark-text/80">Name</th>
                <th className="px-4 py-3 text-left font-semibold text-dark-text/80">Key Prefix</th>
                <th className="px-4 py-3 text-left font-semibold text-dark-text/80">Created</th>
                <th className="px-4 py-3 text-left font-semibold text-dark-text/80">Last Used</th>
                <th className="px-4 py-3 text-left font-semibold text-dark-text/80">Status</th>
                <th className="px-4 py-3 text-left font-semibold text-dark-text/80">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-border">
              {apiKeys.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-dark-text/60">
                    No API keys yet. Create one to get started.
                  </td>
                </tr>
              ) : (
                apiKeys.map((key) => (
                  <tr key={key.id} className="hover:bg-dark-sidebar/30 transition-colors">
                    <td className="px-4 py-3 text-dark-text font-medium">{key.name}</td>
                    <td className="px-4 py-3 text-dark-text/80 font-mono text-xs">{maskApiKey(key.keyPrefix)}</td>
                    <td className="px-4 py-3 text-dark-text/80 text-xs whitespace-nowrap">
                      {formatDate(key.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-dark-text/80 text-xs whitespace-nowrap">
                      {key.lastUsedAt ? formatDate(key.lastUsedAt) : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          key.isActive
                            ? "bg-green-500/10 text-green-400"
                            : "bg-gray-500/10 text-gray-400"
                        }`}
                      >
                        {key.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to revoke this API key?")) {
                            handleRevokeKey(key.id);
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1 text-red-400 hover:text-red-300 transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-dark-border rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-dark-text mb-4">Create New API Key</h2>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-text mb-2">Key Name</label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  required
                  placeholder="e.g., Production API Key"
                  className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-dark-text placeholder-dark-text/40 focus:border-accent-blue transition-colors"
                />
              </div>

              <p className="text-xs text-dark-text/60">
                You'll see the full API key only once. Save it securely.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-dark-sidebar border border-dark-border rounded text-dark-text hover:bg-dark-border transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue/90 disabled:opacity-50 transition-colors font-semibold"
                >
                  {creating ? "Creating..." : "Create Key"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Show Key Modal */}
      {showKeyModal && createdKey && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-accent-blue rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-dark-text mb-2">API Key Created</h2>
            <p className="text-dark-text/60 text-sm mb-4">
              Save this key securely. You won't be able to see it again.
            </p>

            <div className="bg-dark-bg border border-dark-border rounded p-4 mb-4">
              <p className="text-xs text-dark-text/60 mb-2">Your API Key</p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={createdKey}
                  readOnly
                  className="flex-1 px-3 py-2 bg-dark-sidebar border border-dark-border rounded text-dark-text/60 font-mono text-sm"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(createdKey)}
                  className="p-2 bg-accent-blue text-white rounded hover:bg-accent-blue/90 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setShowKeyModal(false);
                setCreatedKey(null);
              }}
              className="w-full px-4 py-2 bg-accent-blue text-white rounded hover:bg-accent-blue/90 transition-colors font-semibold flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
