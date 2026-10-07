"use client";

import { useState } from "react";
import { Credential } from "../lib/types";
import { ZKProofModal } from "./ZKProofModal";
import { GraduationCap, ShieldCheck, Lock, ChevronDown, ChevronUp, Sparkles, AlertTriangle } from "lucide-react";

interface CredentialCardProps {
  credential: Credential;
  onRefresh?: () => void;
}

export function CredentialCard({ credential }: CredentialCardProps) {
  const [showProofModal, setShowProofModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
          credential.revoked
            ? "bg-slate-900/60 border-rose-500/30 shadow-lg shadow-rose-950/20"
            : "bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 border-slate-800 hover:border-cyan-500/40 shadow-xl"
        }`}
      >
        {/* Ambient background glow */}
        <div
          className={`absolute -right-20 -top-20 w-44 h-44 rounded-full blur-3xl pointer-events-none ${
            credential.revoked ? "bg-rose-600/10" : "bg-cyan-500/10"
          }`}
        />

        {/* Card Header */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner ${
                  credential.revoked
                    ? "bg-rose-950/40 border-rose-500/30 text-rose-400"
                    : "bg-cyan-950/40 border-cyan-500/30 text-cyan-400"
                }`}
              >
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">
                    {credential.degree} Credential
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      credential.revoked
                        ? "bg-rose-950/60 text-rose-300 border-rose-800"
                        : "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        credential.revoked ? "bg-rose-400" : "bg-emerald-400 animate-pulse"
                      }`}
                    />
                    {credential.revoked ? "REVOKED" : "VALID"}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{credential.issuerName}</p>
              </div>
            </div>

            {/* Proof Trigger button */}
            <button
              onClick={() => setShowProofModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Use Credential
            </button>
          </div>

          {/* Core metadata display */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Holder</span>
              <span className="font-medium text-slate-200">{credential.holderName}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Branch</span>
              <span className="font-medium text-slate-200">{credential.branch}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-0.5">Grad Year</span>
              <span className="font-medium text-slate-200">{credential.graduationYear}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
              <span className="text-[10px] uppercase font-semibold text-amber-400 flex items-center gap-1 mb-0.5">
                <Lock className="w-2.5 h-2.5" /> Private DOB
              </span>
              <span className="font-mono text-slate-300">{credential.dateOfBirth}</span>
            </div>
          </div>

          {/* Privacy Note Banner */}
          <div className="mt-4 p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-indigo-300">
              <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>
                Personal data like <strong>DOB</strong> is stored solely on your device. Only ZK proofs leave this wallet.
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-0.5 ml-2 shrink-0"
            >
              <span>{isExpanded ? "Hide Details" : "Cryptographic Data"}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Cryptographic Details Accordion */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-slate-800 text-xs font-mono space-y-2.5 text-slate-400 animate-in fade-in">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Credential Hash ID (Off-chain):</span>
                <span className="text-slate-300 select-all break-all">{credential.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">On-Chain Commitment Anchor:</span>
                <span className="text-cyan-400 select-all break-all">{credential.commitment}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Issuer Address (ABC University):</span>
                <span className="text-slate-300 select-all">{credential.issuerAddress}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Issuer Signature (HMAC / EdDSA):</span>
                <span className="text-emerald-400/90 select-all break-all">{credential.signature}</span>
              </div>
            </div>
          )}

          {/* Revocation notice if revoked */}
          {credential.revoked && (
            <div className="mt-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 flex items-center gap-2.5 text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>
                <strong>Warning:</strong> This credential was revoked in the smart contract registry. Any generated ZK proof will fail on-chain verification.
              </span>
            </div>
          )}
        </div>
      </div>

      {showProofModal && (
        <ZKProofModal
          credential={credential}
          onClose={() => setShowProofModal(false)}
        />
      )}
    </>
  );
}
