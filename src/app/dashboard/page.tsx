"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import {
  ShieldCheck,
  KeyRound,
  GraduationCap,
  FileCheck,
  History,
  Lock,
  ArrowRight,
  CheckCircle2,
  Building2,
  ExternalLink,
  Ban,
  Wallet,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";
import {
  getCredentials,
  seedDemoCredentialIfNeeded,
  getVerificationHistory,
  getPrivacyReceipts,
} from "../../lib/credential";
import { Credential, VerificationHistoryItem, PrivacyReceipt } from "../../lib/types";

export default function DashboardPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [history, setHistory] = useState<VerificationHistoryItem[]>([]);
  const [receipts, setReceipts] = useState<PrivacyReceipt[]>([]);
  const [selectedCredModal, setSelectedCredModal] = useState<Credential | null>(null);
  const [showSensitiveDetails, setShowSensitiveDetails] = useState(false);

  useEffect(() => {
    async function load() {
      const creds = await seedDemoCredentialIfNeeded();
      setCredentials(creds);
      setHistory(getVerificationHistory());
      setReceipts(getPrivacyReceipts());
    }
    load();
  }, []);

  const mainCred = credentials.find((c) => c.degree.includes("B.Tech")) || credentials[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider uppercase">
                ClaimPass Privacy Suite
              </span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-[10px] text-cyan-300 font-mono">
                0x71C...92A
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Welcome back, Rahul
            </h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Manage your verifiable credentials and selectively prove claims with Zero-Knowledge proofs.
            </p>
          </div>

          <div className="flex items-center gap-3 z-10">
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block font-mono uppercase">Identity Status</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  ✓ Verified (Active)
                </span>
              </div>
            </div>

            <Link
              href="/claimpass"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Prove Something</span>
            </Link>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/wallet"
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-medium">Digital Credentials</span>
              <Wallet className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white">{credentials.length || 2}</div>
            <span className="text-[11px] text-cyan-400 mt-1 block font-mono">100% Stored Off-Chain</span>
          </Link>

          <Link
            href="/claimpass"
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-medium">Available Claims</span>
              <KeyRound className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white">4</div>
            <span className="text-[11px] text-indigo-400 mt-1 block font-mono">B.Tech, Age, Grad, Status</span>
          </Link>

          <Link
            href="/history"
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-medium">Proofs Generated</span>
              <FileCheck className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white">{history.length + 5}</div>
            <span className="text-[11px] text-emerald-400 mt-1 block font-mono">Groth16 zk-SNARKs</span>
          </Link>

          <Link
            href="/privacy"
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 transition-all group"
          >
            <div className="flex items-center justify-between text-slate-400 mb-3">
              <span className="text-xs font-medium">Privacy Score</span>
              <Lock className="w-4 h-4 text-teal-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-2xl font-black text-white">100%</div>
            <span className="text-[11px] text-teal-400 mt-1 block font-mono">0 Personal Attributes Exposed</span>
          </Link>
        </div>

        {/* Main Credential Card Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-cyan-400" />
              <span>Primary Digital Credential</span>
            </h2>
            <Link
              href="/wallet"
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View all in wallet</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {mainCred && (
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <GraduationCap className="w-48 h-48 text-cyan-400" />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-mono mb-2">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>XYZ University Accredited</span>
                  </div>
                  <h3 className="text-2xl font-black text-white">Bachelor of Technology</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Faculty of Engineering and Technology</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono flex items-center gap-1.5 ${
                    mainCred.revoked
                      ? "bg-rose-950/80 border border-rose-800 text-rose-400"
                      : "bg-emerald-950/80 border border-emerald-800 text-emerald-400"
                  }`}>
                    {mainCred.revoked ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                    <span>{mainCred.revoked ? "Revoked ✕" : "Active ✓"}</span>
                  </span>
                </div>
              </div>

              {/* Credential Data Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs mb-6 font-mono">
                <div>
                  <span className="text-slate-400 block text-[11px]">Institution:</span>
                  <span className="text-white font-semibold">XYZ University</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Degree:</span>
                  <span className="text-white font-semibold">{mainCred.degree}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Branch:</span>
                  <span className="text-white font-semibold">{mainCred.branch}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Graduation Year:</span>
                  <span className="text-cyan-400 font-bold">{mainCred.graduationYear}</span>
                </div>
              </div>

              {/* Actions: View Credential & Prove Something */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
                <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                  <span>Commitment:</span>
                  <span className="text-slate-300 truncate max-w-[200px]">{mainCred.commitment}</span>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      setSelectedCredModal(mainCred);
                      setShowSensitiveDetails(false);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Credential</span>
                  </button>

                  <Link
                    href="/claimpass"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Prove Something</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Links & Verification Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Verification Activity */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <History className="w-4 h-4 text-cyan-400" />
                <span>Verification Activity</span>
              </h3>
              <Link href="/history" className="text-xs text-cyan-400 hover:underline">
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {history.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-white">{item.claimTitle}</h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Verifier: {item.verifierName} • {item.dateFormatted}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[10px] font-bold">
                      ✓ Verified
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono block mt-1">0 PII Exposed</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Receipt Snapshot */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Your Privacy Receipts</span>
              </h3>
              <Link href="/privacy" className="text-xs text-emerald-400 hover:underline">
                Privacy Portal
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-950/15 border border-emerald-900/40 text-xs space-y-2">
              <div className="flex justify-between text-slate-300">
                <span>Total Verifications:</span>
                <span className="font-bold text-white">{history.length}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Personal Attributes Leaked:</span>
                <span className="font-bold text-emerald-400">0 (Zero)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Privacy Standard:</span>
                <span className="font-bold text-cyan-400">Zero-Knowledge Minimalist</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Every proof generated on ClaimPass includes a cryptographic receipt proving that only requested claims were evaluated while underlying identity data stayed strictly off-chain.
            </p>
          </div>
        </div>
      </main>

      {/* Credential Detail Modal */}
      {selectedCredModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">{selectedCredModal.degree}</h3>
                  <span className="text-xs text-cyan-400 font-mono">Issuer: {selectedCredModal.issuerName}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedCredModal(null)}
                className="text-slate-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Holder Name:</span>
                <span className="font-bold text-white">{selectedCredModal.holderName}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Specialization:</span>
                <span className="font-bold text-white">{selectedCredModal.branch}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Graduation Year:</span>
                <span className="font-bold text-white">{selectedCredModal.graduationYear}</span>
              </div>

              {/* Private Information Section (Hidden by Default) */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-mono text-[11px] uppercase">Private Off-Chain Data:</span>
                  <button
                    onClick={() => setShowSensitiveDetails(!showSensitiveDetails)}
                    className="text-cyan-400 hover:underline text-[11px] font-mono flex items-center gap-1"
                  >
                    {showSensitiveDetails ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showSensitiveDetails ? "Hide Privately" : "Show Privately"}</span>
                  </button>
                </div>

                {showSensitiveDetails ? (
                  <div className="space-y-1.5 pt-2 border-t border-slate-800 font-mono text-slate-300 text-[11px]">
                    <div className="flex justify-between">
                      <span>Date of Birth:</span>
                      <span className="text-cyan-400 font-semibold">{selectedCredModal.dateOfBirth}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Credential ID:</span>
                      <span className="text-slate-400 truncate max-w-[200px]">{selectedCredModal.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>On-Chain Commitment:</span>
                      <span className="text-slate-400 truncate max-w-[200px]">{selectedCredModal.commitment}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">
                    DOB, roll number, and private salts are hidden by default to protect privacy.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedCredModal(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
              <Link
                href="/claimpass"
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold"
              >
                Prove with this Credential →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
