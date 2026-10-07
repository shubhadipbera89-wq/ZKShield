"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import {
  History,
  CheckCircle2,
  XCircle,
  Lock,
  ExternalLink,
  ShieldCheck,
  Building2,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { getVerificationHistory, seedDemoCredentialIfNeeded } from "../../lib/credential";
import { VerificationHistoryItem } from "../../lib/types";

export default function VerificationHistoryPage() {
  const [history, setHistory] = useState<VerificationHistoryItem[]>([]);

  useEffect(() => {
    async function load() {
      await seedDemoCredentialIfNeeded();
      setHistory(getVerificationHistory());
    }
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-mono mb-2">
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>Verifiable Disclosure Audit Trail</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Verification History
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Cryptographic audit logs of all verified claims. Zero underlying personal data is stored or exposed.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/privacy"
              className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Privacy Receipts</span>
            </Link>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono text-slate-400 uppercase">
            <span>Proof Claim</span>
            <span>Verifier Organization</span>
            <span className="hidden sm:inline">Verification Status</span>
            <span>Personal Data Exposed</span>
            <span className="hidden md:inline">Timestamp</span>
          </div>

          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{item.claimTitle}</h4>
                    <span className="text-[11px] text-slate-400 truncate max-w-[200px] block">
                      Tx: {item.txHash.slice(0, 16)}...
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold">{item.verifierName}</span>
                </div>

                <div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                      item.status === "Verified"
                        ? "bg-emerald-950/80 border border-emerald-800 text-emerald-400"
                        : "bg-rose-950/80 border border-rose-800 text-rose-400"
                    }`}
                  >
                    {item.status === "Verified" ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    <span>{item.status}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>0 Personal Attributes</span>
                </div>

                <div className="text-slate-400 text-[11px]">
                  {item.dateFormatted}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
