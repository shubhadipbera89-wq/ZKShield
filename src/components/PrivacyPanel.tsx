"use client";

import { Lock, CheckCircle2, ShieldCheck, EyeOff } from "lucide-react";

interface PrivacyPanelProps {
  claimType: "age" | "degree";
  compact?: boolean;
}

export function PrivacyPanel({ claimType, compact = false }: PrivacyPanelProps) {
  const isAge = claimType === "age";

  const provenItems = isAge
    ? [
        "Age is 18 or above (>= 18 years)",
        "Proof verified cryptographically via Bn128 curve",
        "Credential not revoked on Ethereum smart contract",
      ]
    : [
        "B.Tech degree exists and is verified",
        "Credential issued by trusted university (ABC University)",
        "On-chain commitment active and not revoked",
      ];

  const hiddenItems = isAge
    ? [
        "Exact Date of Birth (Year, Month, Day)",
        "Student Name & Identity",
        "Permanent Address",
        "Government ID / Aadhar number",
      ]
    : [
        "Student Roll / Registration Number",
        "Full Certificate scan & CGPA / Marks",
        "Date of Birth & Age",
        "Residential Address",
      ];

  if (compact) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>WHAT IS PROVEN</span>
          </div>
          <ul className="space-y-1 text-slate-300">
            {provenItems.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700/40">
          <div className="flex items-center gap-1.5 font-semibold text-rose-400 mb-2">
            <Lock className="w-4 h-4 text-rose-400" />
            <span>WHAT IS KEPT PRIVATE</span>
          </div>
          <ul className="space-y-1 text-slate-400">
            {hiddenItems.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-rose-400 font-mono">🔒</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 to-slate-950/90 border border-slate-800 shadow-xl">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Privacy-Preserving Selective Disclosure</h4>
            <p className="text-xs text-slate-400">Prove the mathematical claim without disclosing your private identity</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-mono bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-900/60">
          <EyeOff className="w-3.5 h-3.5" />
          <span>Zero PII Exposed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* What is proven */}
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30">
          <div className="flex items-center gap-2 font-semibold text-xs tracking-wider uppercase text-emerald-400 mb-3">
            <CheckCircle2 className="w-4 h-4" />
            <span>What Verifier Learns</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-200">
            {provenItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold shrink-0">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What is hidden */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="flex items-center gap-2 font-semibold text-xs tracking-wider uppercase text-slate-400 mb-3">
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Never Shared (Locked in Wallet)</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-400">
            {hiddenItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-amber-400 font-mono shrink-0">🔒</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
