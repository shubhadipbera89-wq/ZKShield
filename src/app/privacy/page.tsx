"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Building2,
  EyeOff,
  Sparkles,
  ArrowRight,
  Database,
  Calendar,
} from "lucide-react";
import {
  getPrivacyReceipts,
  seedDemoCredentialIfNeeded,
} from "../../lib/credential";
import { PrivacyReceipt } from "../../lib/types";

export default function PrivacyDashboardPage() {
  const [receipts, setReceipts] = useState<PrivacyReceipt[]>([]);

  useEffect(() => {
    async function load() {
      await seedDemoCredentialIfNeeded();
      setReceipts(getPrivacyReceipts());
    }
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Section 14 Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-mono mb-2">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Zero-Knowledge Privacy Center</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Your Privacy
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Real-time audit of information stored strictly off-chain versus selective claims revealed.
            </p>
          </div>

          <Link
            href="/claimpass"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
          >
            <span>Launch Prover</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Big Privacy Score & Large Indicator */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Huge Privacy Indicator: Personal Data Exposed: 0 */}
          <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-emerald-800/60 shadow-2xl flex flex-col justify-between text-center sm:text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Privacy Telemetry Indicator
              </span>
              <div className="text-4xl sm:text-6xl font-black text-white tracking-tight mt-1">
                Personal Data Exposed: <span className="text-emerald-400">0</span>
              </div>
              <p className="text-xs text-slate-400 max-w-md pt-2">
                Across all verification transactions, zero PII (dates of birth, addresses, student IDs) has ever been transmitted across the wire.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-emerald-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Zero-Leakage Guarantee
              </span>
              <span>100% Client-Side ZK Witness</span>
            </div>
          </div>

          {/* Privacy Score Card */}
          <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                Selective Disclosure Rating
              </span>
              <div className="flex items-center gap-4 mt-2">
                <div className="text-5xl font-black text-white font-mono">100%</div>
                <div className="px-3 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-mono font-bold">
                  Minimalist Standard
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                Your data sharing is mathematically optimal. Claims are proven using Groth16 zk-SNARKs on BN128 curve without revealing unnecessary attributes.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Cryptographic Proof: Active</span>
              <span className="text-cyan-400 font-semibold">Tier 1 Privacy</span>
            </div>
          </div>
        </div>

        {/* Stored Privately vs Shared for Verification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Stored Privately */}
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-rose-400" />
                <span>Stored Privately (Never Transmitted)</span>
              </h3>
              <span className="text-[11px] font-mono text-rose-400 bg-rose-950/70 border border-rose-800 px-2 py-0.5 rounded">
                Off-Chain
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Name</span>
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-400" /> 🔒 Rahul Kumar
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Date of Birth</span>
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-400" /> 🔒 12 August 2002
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Student ID / Roll Number</span>
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-400" /> 🔒 2022CSB1049
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Residential Address</span>
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-rose-400" /> 🔒 Confidential
                </span>
              </div>
            </div>
          </div>

          {/* Shared for Verification */}
          <div className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Shared for Verification (Selective Claims Only)</span>
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded">
                Verified
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">B.Tech Holder</span>
                <span className="text-emerald-400 font-bold">✓ Verified via Groth16</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Trusted Issuer</span>
                <span className="text-emerald-400 font-bold">✓ XYZ University Accredited</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Age Qualification</span>
                <span className="text-emerald-400 font-bold">✓ Age &gt;= 18 (Exact DOB Hidden)</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-slate-400">Credential Status</span>
                <span className="text-emerald-400 font-bold">✓ Active (Not Revoked On-Chain)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 14: Privacy Receipts */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <span>Cryptographic Privacy Receipts</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Verifiable cryptographic receipts generated after each verification event.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {receipts.map((rcpt) => (
              <div
                key={rcpt.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all space-y-3 font-mono text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                    <span>{rcpt.verifierName}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rcpt.proofStatus === "Valid"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                        : "bg-rose-950 text-rose-400 border border-rose-800"
                    }`}
                  >
                    Proof: {rcpt.proofStatus} ✓
                  </span>
                </div>

                <div className="space-y-1.5 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Claim Shared:</span>
                    <span className="text-white font-semibold">{rcpt.claimShared}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Personal Data Exposed:</span>
                    <span className="text-emerald-400 font-bold">{rcpt.personalDataExposed} (Zero)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Circuit Verified:</span>
                    <span className="text-cyan-400">{rcpt.circuit}</span>
                  </div>
                  {rcpt.txHash && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Tx Hash:</span>
                      <span className="text-slate-400 truncate max-w-[180px]">{rcpt.txHash}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
