"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import {
  Wallet,
  GraduationCap,
  Fingerprint,
  ShieldCheck,
  CheckCircle2,
  Ban,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Building2,
  ArrowRight,
  Snowflake,
  AlertTriangle,
} from "lucide-react";
import {
  getCredentials,
  seedDemoCredentialIfNeeded,
  toggleFreezeCredential,
} from "../../lib/credential";
import { Credential } from "../../lib/types";

export default function WalletPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedCred, setSelectedCred] = useState<Credential | null>(null);
  const [revealPrivateInfo, setRevealPrivateInfo] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      const creds = await seedDemoCredentialIfNeeded();
      setCredentials(creds);
    }
    load();
  }, []);

  const handleToggleFreeze = (id: string) => {
    const newStatus = toggleFreezeCredential(id);
    setCredentials((prev) =>
      prev.map((c) => (c.id === id ? { ...c, frozen: newStatus } : c))
    );
  };

  const togglePrivateVisibility = (id: string) => {
    setRevealPrivateInfo((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Wallet Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-mono mb-2">
              <Wallet className="w-3.5 h-3.5 text-cyan-400" />
              <span>Self-Sovereign Identity Vault</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Digital ID Wallet
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Your verifiable credentials are stored locally. Sensitive fields are encrypted and never broadcasted.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/claimpass"
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Prove a Claim</span>
            </Link>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span>My Credentials</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Total: {credentials.length} Attestations
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {credentials.map((cred) => {
              const isRevealed = Boolean(revealPrivateInfo[cred.id]);
              const isDegree = cred.degree.includes("B.Tech");

              return (
                <div
                  key={cred.id}
                  className={`p-6 sm:p-7 rounded-3xl bg-slate-900/90 border transition-all shadow-xl flex flex-col justify-between ${
                    cred.revoked
                      ? "border-rose-900/60 bg-rose-950/10"
                      : cred.frozen
                      ? "border-cyan-800/80 bg-cyan-950/10"
                      : "border-slate-800 hover:border-cyan-500/40"
                  }`}
                >
                  <div>
                    {/* Top Status & Issuer Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                        <Building2 className="w-4 h-4 text-cyan-400" />
                        <span>{cred.issuerName}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {cred.frozen && (
                          <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-400 text-[10px] font-mono flex items-center gap-1 font-bold">
                            <Snowflake className="w-3 h-3" /> Frozen
                          </span>
                        )}
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 ${
                            cred.revoked
                              ? "bg-rose-950 border border-rose-800 text-rose-400"
                              : "bg-emerald-950 border border-emerald-800 text-emerald-400"
                          }`}
                        >
                          {cred.revoked ? <Ban className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                          <span>{cred.revoked ? "Revoked ✕" : "Active ✓"}</span>
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-1">{cred.degree}</h3>
                    <p className="text-xs text-slate-400 mb-5">
                      Holder: <span className="text-slate-200 font-semibold">{cred.holderName}</span> • {cred.branch}
                    </p>

                    {/* Basic Credential Details (Public/Safe fields) */}
                    <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs font-mono mb-4">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Credential Type:</span>
                        <span className="text-white font-medium">
                          {cred.isGovernmentId
                            ? (cred.govIdType || "Government Identity")
                            : isDegree
                            ? "Academic Degree"
                            : "Student Identity"}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">
                          {cred.isGovernmentId ? "ID Number (Masked):" : "Graduation Year:"}
                        </span>
                        <span className="text-cyan-400 font-bold">
                          {cred.isGovernmentId
                            ? (cred.documentNumberMasked || "XXXX-XXXX-8921")
                            : cred.graduationYear}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Issued At:</span>
                        <span className="text-slate-300">{new Date(cred.issuedAt * 1000).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">ZK Proving Capability:</span>
                        <span className="text-emerald-400 font-bold">Ready (SnarkJS) ⚡</span>
                      </div>
                    </div>

                    {/* Sensitive Information Protection Section */}
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-mono flex items-center gap-1.5 text-[11px]">
                          <Lock className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Sensitive Personal Data</span>
                        </span>
                        <button
                          onClick={() => togglePrivateVisibility(cred.id)}
                          className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1"
                        >
                          {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{isRevealed ? "Hide Privately" : "View Privately"}</span>
                        </button>
                      </div>

                      {isRevealed ? (
                        <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-300">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Date of Birth:</span>
                            <span className="text-cyan-400 font-bold">{cred.dateOfBirth}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Credential ID:</span>
                            <span className="text-slate-400 truncate max-w-[180px]">{cred.id}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Commitment:</span>
                            <span className="text-slate-400 truncate max-w-[180px]">{cred.commitment}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">
                          Never displayed to verifiers. Only mathematical proofs are generated.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Buttons */}
                  <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleToggleFreeze(cred.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold font-mono flex items-center gap-1.5 transition-colors ${
                        cred.frozen
                          ? "bg-cyan-950 text-cyan-300 border border-cyan-800 hover:bg-cyan-900"
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                      title="Emergency freeze credential from being proved"
                    >
                      <Snowflake className="w-3.5 h-3.5" />
                      <span>{cred.frozen ? "Unfreeze" : "Freeze"}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedCred(cred)}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        View Details
                      </button>

                      <Link
                        href={`/claimpass?claim=${isDegree ? "degree" : "student"}`}
                        className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1 shadow-md shadow-cyan-500/20"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Prove a Claim</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Detailed Modal */}
      {selectedCred && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-lg">{selectedCred.degree} Details</h3>
              <button
                onClick={() => setSelectedCred(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Issuer Address:</span>
                <span className="text-cyan-400">{selectedCred.issuerAddress}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">Cryptographic Signature:</span>
                <span className="text-slate-400 truncate max-w-[200px]">{selectedCred.signature}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                <span className="text-slate-400">On-Chain Commitment:</span>
                <span className="text-slate-400 truncate max-w-[200px]">{selectedCred.commitment}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedCred(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold"
              >
                Close
              </button>
              <Link
                href="/claimpass"
                className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold"
              >
                Launch ClaimPass →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
