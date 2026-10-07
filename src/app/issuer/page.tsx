"use client";

import { useState, useEffect } from "react";
import { Navbar } from "../../components/Navbar";
import {
  University,
  FilePlus,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Ban,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  ExternalLink,
  Lock,
  Cpu,
  GraduationCap,
} from "lucide-react";
import {
  getCredentials,
  issueNewCredential,
  revokeCredential,
  seedDemoCredentialIfNeeded,
} from "../../lib/credential";
import { Credential } from "../../lib/types";

export default function IssuerPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isIssuing, setIsIssuing] = useState(false);
  const [issuingStep, setIssuingStep] = useState<number>(0);
  const [issuedCred, setIssuedCred] = useState<Credential | null>(null);

  // Revocation modal state
  const [revokingCredId, setRevokingCredId] = useState<string | null>(null);
  const [isRevoking, setIsRevoking] = useState(false);

  // Form input fields pre-populated with realistic demo data
  const [formData, setFormData] = useState({
    studentName: "Rahul Kumar",
    studentWallet: "0x71C8A9b7325F39b03f0bA76420eC19F68c34592A",
    degree: "B.Tech",
    branch: "Computer Science",
    graduationYear: 2026,
    dateOfBirth: "2002-08-12",
  });

  useEffect(() => {
    async function load() {
      const list = await seedDemoCredentialIfNeeded();
      setCredentials(list);
    }
    load();
  }, []);

  const handleIssueCredential = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsIssuing(true);
    setIssuedCred(null);
    setIssuingStep(1); // Creating credential...

    setTimeout(() => setIssuingStep(2), 600); // Signing credential...
    setTimeout(() => setIssuingStep(3), 1200); // Generating credential commitment...
    setTimeout(async () => {
      setIssuingStep(4); // Registering credential on-chain...

      const cred = await issueNewCredential({
        holderName: formData.studentName,
        degree: formData.degree,
        branch: formData.branch,
        graduationYear: Number(formData.graduationYear),
        dateOfBirth: formData.dateOfBirth,
        issuerName: "XYZ University",
        issuerAddress: "0x4A1359D1115e5c678a17684614A7080b0D0F5849",
      });

      setIssuingStep(5); // Credential issued ✓
      setIssuedCred(cred);
      setCredentials(getCredentials());
      setIsIssuing(false);
    }, 1900);
  };

  const handleConfirmRevoke = async () => {
    if (!revokingCredId) return;
    setIsRevoking(true);
    await revokeCredential(revokingCredId);
    setCredentials(getCredentials());
    setIsRevoking(false);
    setRevokingCredId(null);
  };

  const activeCount = credentials.filter((c) => !c.revoked).length;
  const revokedCount = credentials.filter((c) => c.revoked).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Section 11 Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-mono">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Authorized Registrar Portal</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            University Credential Portal
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            XYZ University Registrar • Issue zero-knowledge credentials and manage the on-chain revocation registry.
          </p>
        </div>

        {/* 4 Dashboard Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Credentials Issued</span>
            <div className="text-2xl font-black text-white mt-1">{140 + credentials.length}</div>
            <span className="text-[11px] text-cyan-400 font-mono mt-1 block">Accredited Degrees</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Active Credentials</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">{140 + activeCount}</div>
            <span className="text-[11px] text-emerald-400 font-mono mt-1 block">Valid On-Chain</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Revoked Credentials</span>
            <div className="text-2xl font-black text-rose-400 mt-1">{revokedCount}</div>
            <span className="text-[11px] text-rose-400 font-mono mt-1 block">Tamper Registry</span>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Verification Requests</span>
            <div className="text-2xl font-black text-indigo-400 mt-1">380+</div>
            <span className="text-[11px] text-indigo-400 font-mono mt-1 block">Zero PII Disclosures</span>
          </div>
        </div>

        {/* Section 11: Issue Credential Form */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FilePlus className="w-5 h-5 text-cyan-400" />
                <span>Issue New Digital Credential</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate an off-chain verifiable attestation and anchor its cryptographic commitment to Ethereum.
              </p>
            </div>

            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-3 py-1 rounded-full">
              Issuer: XYZ University (0x4A13...5849)
            </span>
          </div>

          <form onSubmit={handleIssueCredential} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Student Name */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Student Full Name</label>
                <input
                  type="text"
                  value={formData.studentName}
                  onChange={(e) => setFormData({ ...formData, studentName: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Student Wallet Address */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Student Wallet Address</label>
                <input
                  type="text"
                  value={formData.studentWallet}
                  onChange={(e) => setFormData({ ...formData, studentWallet: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-[11px] focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Degree */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Degree</label>
                <input
                  type="text"
                  value={formData.degree}
                  onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Branch */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Branch / Major</label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Graduation Year */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Graduation Year</label>
                <input
                  type="number"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: Number(e.target.value) })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label className="text-slate-300 font-semibold">Date of Birth (Off-Chain Private)</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Issuance Action Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Raw personal data stays strictly off-chain</span>
              </span>

              <button
                type="submit"
                disabled={isIssuing}
                className="px-7 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
              >
                {isIssuing ? (
                  <>
                    <Cpu className="w-4 h-4 animate-spin" />
                    <span>Processing Cryptographic Issuance...</span>
                  </>
                ) : (
                  <>
                    <University className="w-4 h-4" />
                    <span>Issue Credential</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Animated Issuance Processing Steps */}
          {issuingStep > 0 && isIssuing && (
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-300">
                <span>1. Creating credential payload:</span>
                <span className={issuingStep >= 1 ? "text-emerald-400" : "text-slate-400"}>
                  {issuingStep >= 1 ? "Complete ✓" : "Pending..."}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>2. Signing credential with XYZ University private key:</span>
                <span className={issuingStep >= 2 ? "text-emerald-400" : "text-slate-400"}>
                  {issuingStep >= 2 ? "Signed ✓" : "Pending..."}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>3. Generating cryptographic commitment:</span>
                <span className={issuingStep >= 3 ? "text-emerald-400" : "text-slate-400"}>
                  {issuingStep >= 3 ? "Commitment Ready ✓" : "Pending..."}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>4. Registering commitment on CredentialRegistry.sol:</span>
                <span className={issuingStep >= 4 ? "text-emerald-400" : "text-slate-400"}>
                  {issuingStep >= 4 ? "Broadcasting Tx ✓" : "Pending..."}
                </span>
              </div>
            </div>
          )}

          {/* Success Card */}
          {issuedCred && (
            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-900/60 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Credential Issued Successfully</span>
                </div>
                <span className="text-xs font-mono text-cyan-400">On-Chain Anchor Confirmed ✓</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Credential ID:</span>
                  <span className="text-slate-300 truncate block">{issuedCred.id}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Issuer:</span>
                  <span className="text-emerald-400 font-semibold">{issuedCred.issuerName}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Holder:</span>
                  <span className="text-white font-semibold">{issuedCred.holderName}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Degree:</span>
                  <span className="text-cyan-400 font-semibold">{issuedCred.degree}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Status:</span>
                  <span className="text-emerald-400 font-bold">Active ✓</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Credential Commitment:</span>
                  <span className="text-slate-300 truncate block">{issuedCred.commitment}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 12: Credential Management & Revocation */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                <span>Credential Management &amp; Revocation Registry</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Revoked credentials immediately invalidate verifier checks on-chain while keeping student PII confidential.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              Smart Contract: <code className="text-cyan-400">CredentialRegistry.sol</code>
            </span>
          </div>

          <div className="space-y-3">
            {credentials.map((cred) => (
              <div
                key={cred.id}
                className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  cred.revoked
                    ? "bg-rose-950/20 border-rose-900/60"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2.5">
                    <h4 className="font-bold text-white text-sm">{cred.degree}</h4>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold flex items-center gap-1 ${
                        cred.revoked
                          ? "bg-rose-950 text-rose-400 border border-rose-800"
                          : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      }`}
                    >
                      {cred.revoked ? <Ban className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                      <span>{cred.revoked ? "Revoked ✕" : "Active ✓"}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Holder: <span className="text-slate-200">{cred.holderName}</span> • {cred.branch} (Class of {cred.graduationYear})
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {cred.revoked ? (
                    <span className="text-xs font-mono text-rose-400 px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-900">
                      Revocation Recorded On-Chain ✕
                    </span>
                  ) : (
                    <button
                      onClick={() => setRevokingCredId(cred.id)}
                      className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 hover:text-white text-xs font-bold font-mono transition-colors flex items-center gap-1.5 shadow-md shadow-rose-950/40"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Revoke Credential</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Confirmation Modal for Revocation */}
      {revokingCredId && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-rose-900/80 p-6 sm:p-8 space-y-5 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Revoke this credential?</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                “This credential will no longer be accepted during verification.”
              </p>
              <p className="text-[11px] text-rose-300 mt-2 font-mono">
                A permanent revocation flag will be set in the on-chain registry mapping:
                <br />
                <code className="text-white">revoked[credentialId] = true</code>
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setRevokingCredId(null)}
                disabled={isRevoking}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                disabled={isRevoking}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
              >
                {isRevoking ? "Broadcasting Revocation..." : "Confirm Revocation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
