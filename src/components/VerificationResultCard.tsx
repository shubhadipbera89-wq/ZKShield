"use client";

import { VerificationResult } from "../lib/types";
import { CheckCircle2, XCircle, Lock, Database, ExternalLink } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface VerificationResultCardProps {
  result: VerificationResult;
  onViewLedger?: () => void;
}

export function VerificationResultCard({ result, onViewLedger }: VerificationResultCardProps) {
  useEffect(() => {
    if (result.overallValid) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#06b6d4", "#10b981", "#818cf8"],
      });
    }
  }, [result.overallValid]);

  const isAgeClaim = result.claimType === "age";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-6 shadow-2xl transition-all duration-300 ${
        result.overallValid
          ? "bg-slate-900/90 border-emerald-500/40 shadow-emerald-950/20"
          : "bg-slate-900/90 border-rose-500/40 shadow-rose-950/20"
      }`}
    >
      {/* Background radial highlight */}
      <div
        className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
          result.overallValid ? "bg-emerald-500/15" : "bg-rose-500/15"
        }`}
      />

      {/* Status banner */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-xl border ${
              result.overallValid
                ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-400"
                : "bg-rose-950/40 border-rose-500/40 text-rose-400"
            }`}
          >
            {result.overallValid ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {result.overallValid ? "VERIFICATION SUCCESSFUL" : "VERIFICATION FAILED"}
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              ZK-SNARK Groth16 Proof &amp; Smart Contract Verification
            </p>
          </div>
        </div>

        <div
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
            result.overallValid
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : "bg-rose-500/20 text-rose-300 border-rose-500/40"
          }`}
        >
          {result.overallValid ? "✅ VERIFIED" : "❌ INVALID"}
        </div>
      </div>

      {/* Verification Checks Grid */}
      <div className="mt-5 space-y-2.5 text-xs">
        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Cryptographic &amp; On-Chain Verification Pipeline
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-slate-300 font-medium">
            {isAgeClaim ? "Age >= 18 Claim" : "B.Tech Degree Claim"}
          </span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" /> SATISFIED
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-slate-300 font-medium">Trusted University Signature</span>
          <span
            className={`flex items-center gap-1 font-semibold ${
              result.issuerTrusted ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {result.issuerTrusted ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> ABC University (Verified)
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" /> Untrusted Issuer
              </>
            )}
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-slate-300 font-medium">Groth16 ZK-SNARK Proof</span>
          <span
            className={`flex items-center gap-1 font-semibold ${
              result.zkProofValid ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {result.zkProofValid ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Cryptographically Valid
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" /> Invalid Proof
              </>
            )}
          </span>
        </div>

        <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
          <span className="text-slate-300 font-medium">On-Chain Revocation Status</span>
          <span
            className={`flex items-center gap-1 font-semibold ${
              !result.credentialRevoked ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {!result.credentialRevoked ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" /> Active (Not Revoked)
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5" /> REVOKED on Blockchain
              </>
            )}
          </span>
        </div>
      </div>

      {/* Private Information Section */}
      <div className="mt-6 pt-5 border-t border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Private Information (Never Exposed To Verifier)</span>
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">100% Privacy Protected</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
          {result.hiddenFields.map((field, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/60"
            >
              <span className="text-slate-400 font-medium">{field}</span>
              <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Hidden
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction & Proof metadata footer */}
      {result.txHash && (
        <div className="mt-5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tx Hash:</span>
            <span className="text-cyan-300 truncate max-w-[200px]">{result.txHash}</span>
          </div>
          {onViewLedger && (
            <button
              onClick={onViewLedger}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View On-Chain Block</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
