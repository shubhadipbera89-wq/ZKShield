"use client";

import { useState } from "react";
import {
  getBlockchainState,
  CONTRACT_ADDRESSES,
  OnChainRegistryState,
} from "../lib/blockchain";
import { X, Database, ShieldCheck, FileCode, CheckCircle2, RefreshCw } from "lucide-react";

interface BlockchainExplorerModalProps {
  onClose: () => void;
}

export function BlockchainExplorerModal({ onClose }: BlockchainExplorerModalProps) {
  const [state, setState] = useState<OnChainRegistryState>(() => getBlockchainState());

  const refresh = () => {
    setState(getBlockchainState());
  };

  if (!state) return null;

  const revokedEntries = Object.entries(state.revoked);
  const commitmentEntries = Object.entries(state.commitments);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">On-Chain Smart Contract Ledger</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  Block #{state.currentBlock}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Ethereum EVM State: CredentialRegistry.sol &amp; ZKCredentialVerifier.sol
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={refresh}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Refresh ledger state"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Contract Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="font-semibold text-slate-300">CredentialRegistry.sol</span>
                <span className="text-[10px] text-emerald-400 font-mono">DEPLOYED</span>
              </div>
              <div className="font-mono text-cyan-400 break-all">{CONTRACT_ADDRESSES.registry}</div>
              <p className="text-[11px] text-slate-400 mt-1">
                Stores cryptographic commitments, trusted issuer list, and revocation flags. Zero raw PII.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="font-semibold text-slate-300">ZKCredentialVerifier.sol</span>
                <span className="text-[10px] text-cyan-400 font-mono">DEPLOYED</span>
              </div>
              <div className="font-mono text-cyan-400 break-all">{CONTRACT_ADDRESSES.verifier}</div>
              <p className="text-[11px] text-slate-400 mt-1">
                Verifies Groth16 pairings, checks issuer trust, and enforces revocation registry.
              </p>
            </div>
          </div>

          {/* Trusted Issuers & Revocation State */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Trusted Issuers */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-300 pb-2 border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Trusted Issuers (isIssuerAuthorized)
                </span>
                <span className="text-cyan-400 font-mono">{Object.keys(state.trustedIssuers).length}</span>
              </div>
              <div className="space-y-2">
                {Object.entries(state.trustedIssuers).map(([addr, name]) => (
                  <div key={addr} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 font-mono text-[11px]">
                    <div className="text-emerald-400 font-semibold">{name}</div>
                    <div className="text-slate-400 truncate">{addr}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Revocations Table */}
            <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between font-semibold text-slate-300 pb-2 border-b border-slate-800">
                <span className="flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-rose-400" />
                  Revocation Registry (revoked mapping)
                </span>
                <span className="text-rose-400 font-mono">{revokedEntries.length} Revoked</span>
              </div>
              {revokedEntries.length === 0 ? (
                <div className="py-4 text-center text-slate-400 text-xs">
                  No credentials currently revoked on-chain
                </div>
              ) : (
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {revokedEntries.map(([credId, isRev]) => (
                    <div key={credId} className="flex items-center justify-between p-2 rounded-lg bg-rose-950/30 border border-rose-900/40 font-mono text-[11px]">
                      <span className="text-slate-300 truncate max-w-[200px]">ID: {credId.slice(0, 16)}...</span>
                      <span className="text-rose-400 font-semibold">{isRev ? "REVOKED" : "ACTIVE"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* On-Chain Commitments Anchor */}
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between font-semibold text-slate-300 pb-2 border-b border-slate-800">
              <span>Cryptographic Commitments (Pedersen / SHA256 Anchors)</span>
              <span className="text-slate-400 font-mono">{commitmentEntries.length} Anchored</span>
            </div>
            {commitmentEntries.length === 0 ? (
              <div className="py-3 text-center text-slate-400 text-xs">No commitments anchored yet</div>
            ) : (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {commitmentEntries.map(([credId, comm]) => (
                  <div key={credId} className="flex items-center justify-between p-2 rounded bg-slate-900 font-mono text-[11px]">
                    <span className="text-slate-400">Cred #{credId.slice(0, 12)}...</span>
                    <span className="text-cyan-400 truncate max-w-[280px]">Commitment: {comm.slice(0, 24)}...</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Transactions Log */}
          <div>
            <div className="font-semibold text-slate-300 mb-2 flex items-center justify-between">
              <span>Smart Contract Transaction Stream (EVM Logs)</span>
              <span className="text-slate-400 text-[11px] font-mono">{state.transactions.length} total txs</span>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {state.transactions.map((tx) => (
                <div
                  key={tx.txHash}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between font-mono text-[11px]"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400 font-semibold">{tx.method}()</span>
                      <span className="text-slate-400 truncate max-w-[180px]">{tx.txHash}</span>
                    </div>
                    <div className="text-slate-400 text-[10px]">{tx.details}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Block #{tx.blockNumber}</span>
                    </div>
                    <div className="text-slate-400 text-[10px]">Gas: {tx.gasUsed.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
          >
            Close Ledger
          </button>
        </div>
      </div>
    </div>
  );
}
