"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

interface KillSwitchProps {
  agentName: string;
  agentId: string;
  onConfirm: () => Promise<void>;
  loading?: boolean;
}

export default function KillSwitch({
  agentName,
  agentId,
  onConfirm,
  loading = false,
}: KillSwitchProps) {
  const [showModal, setShowModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");

  const handleKill = async () => {
    if (confirmText.toLowerCase() === agentName.toLowerCase()) {
      try {
        await onConfirm();
        setShowModal(false);
        setConfirmText("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to kill agent");
      }
    } else {
      setError("Agent name does not match");
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setShowModal(true);
          setError("");
        }}
        className="w-full px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-colors font-semibold flex items-center justify-center gap-2"
      >
        <AlertTriangle className="w-5 h-5" />
        Kill Agent
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-card border border-red-500/20 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-bold text-dark-text">Kill Agent</h2>
            </div>

            <p className="text-dark-text/80 mb-4">
              This action will permanently terminate the agent <span className="font-semibold">{agentName}</span>. This cannot be undone.
            </p>

            <p className="text-sm text-dark-text/60 mb-4">
              Type the agent name to confirm: <span className="font-mono font-semibold text-dark-text">{agentName}</span>
            </p>

            <input
              type="text"
              value={confirmText}
              onChange={(e) => {
                setConfirmText(e.target.value);
                setError("");
              }}
              placeholder="Enter agent name"
              className="w-full px-3 py-2 bg-dark-bg border border-dark-border rounded text-dark-text placeholder-dark-text/40 mb-4 focus:outline-none focus:border-accent-blue"
            />

            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setConfirmText("");
                  setError("");
                }}
                className="flex-1 px-4 py-2 bg-dark-sidebar border border-dark-border rounded text-dark-text hover:bg-dark-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleKill}
                disabled={confirmText.toLowerCase() !== agentName.toLowerCase() || loading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {loading ? "Killing..." : "Kill Agent"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
