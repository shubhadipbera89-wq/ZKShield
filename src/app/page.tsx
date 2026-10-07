"use client";

import Link from "next/link";
import { Navbar } from "../components/Navbar";
import {
  ShieldCheck,
  Lock,
  Ban,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  KeyRound,
  EyeOff,
  Database,
  QrCode,
  Fingerprint,
  ChevronRight,
  AlertTriangle,
  Layers,
  Cpu,
  RefreshCw,
} from "lucide-react";
import { useEffect, useState } from "react";
import { seedDemoCredentialIfNeeded } from "../lib/credential";

export default function Home() {
  const [activeClaimTab, setActiveClaimTab] = useState<"degree" | "age" | "grad" | "student">("degree");

  useEffect(() => {
    seedDemoCredentialIfNeeded();
  }, []);

  const claimExamples = {
    degree: {
      title: "B.Tech Holder",
      privateData: [
        { label: "Full Name", value: "Rahul Kumar", masked: true },
        { label: "Date of Birth", value: "12 August 2002", masked: true },
        { label: "Roll Number", value: "2022CSB1049", masked: true },
        { label: "Residential Address", value: "Block 4, City Center, IN", masked: true },
        { label: "Cumulative CGPA", value: "9.24 / 10.0", masked: true },
      ],
      circuit: "degree_btech.circom",
      proofSystem: "Groth16 / BN128",
      verifierSees: [
        { label: "Degree Qualification", result: "B.Tech == TRUE", status: "verified" },
        { label: "Accredited Issuer", result: "XYZ University ✓", status: "verified" },
        { label: "Credential Status", result: "Active (Not Revoked) ✓", status: "verified" },
        { label: "Personal Attributes Exposed", result: "0 Attributes 🔒", status: "private" },
      ],
    },
    age: {
      title: "Age 18+",
      privateData: [
        { label: "Exact Birthdate", value: "12 August 2002", masked: true },
        { label: "Birthplace", value: "District Registry #440", masked: true },
        { label: "Government ID", value: "Aadhaar / Passport #", masked: true },
        { label: "Residential Address", value: "Confidential", masked: true },
      ],
      circuit: "age_18.circom",
      proofSystem: "Groth16 / BN128",
      verifierSees: [
        { label: "Age Requirement", result: "Age >= 18 == TRUE", status: "verified" },
        { label: "Birthdate Exposed", result: "Hidden in ZK Witness 🔒", status: "private" },
        { label: "Cryptographic Pairing", result: "Valid e(A, B) = e(α, β) ✓", status: "verified" },
        { label: "Personal Attributes Exposed", result: "0 Attributes 🔒", status: "private" },
      ],
    },
    grad: {
      title: "Graduate 2026",
      privateData: [
        { label: "Admission Number", value: "ADM-994821", masked: true },
        { label: "Transcript Record", value: "8 Semesters Grades", masked: true },
        { label: "Faculty Mentor", value: "Prof. S. Sharma", masked: true },
      ],
      circuit: "grad_year_2026.circom",
      proofSystem: "Groth16 / BN128",
      verifierSees: [
        { label: "Graduation Cohort", result: "Class of 2026 == TRUE", status: "verified" },
        { label: "Issuer Anchor", result: "XYZ University Registry ✓", status: "verified" },
        { label: "On-Chain Commitment", result: "0x4a9f...312e Verified", status: "verified" },
        { label: "Personal Attributes Exposed", result: "0 Attributes 🔒", status: "private" },
      ],
    },
    student: {
      title: "Student Status",
      privateData: [
        { label: "Hostel Room No.", value: "Tower B, Room 302", masked: true },
        { label: "Library Card Barcode", value: "LIB-202209110", masked: true },
        { label: "Emergency Contact", value: "+91-98765-XXXXX", masked: true },
      ],
      circuit: "student_status_xyz.circom",
      proofSystem: "Groth16 / BN128",
      verifierSees: [
        { label: "Enrolled Student", result: "XYZ University == TRUE", status: "verified" },
        { label: "Enrollment Status", result: "Active Undergraduate ✓", status: "verified" },
        { label: "Identity Proof", result: "Valid ZK-SNARK ✓", status: "verified" },
        { label: "Personal Attributes Exposed", result: "0 Attributes 🔒", status: "private" },
      ],
    },
  };

  const current = claimExamples[activeClaimTab];

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80">
        {/* Glow gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-cyan-500/20 via-teal-500/15 to-indigo-600/20 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-emerald-500/10 blur-[110px] pointer-events-none rounded-full" />

        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/70 text-cyan-300 text-xs font-semibold backdrop-blur-md shadow-lg shadow-cyan-950/40">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Zero-Knowledge Digital Identity Platform</span>
          </div>

          {/* Core Tagline & Main Headline */}
          <div className="space-y-3">
            <p className="text-xs sm:text-sm font-mono tracking-widest uppercase text-cyan-400 font-semibold">
              Prove the claim. Reveal less.
            </p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-tight">
              Your Identity. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400">
                Your Data. Your Proof.
              </span>
            </h1>
          </div>

          {/* Subheadline */}
          <p className="max-w-2xl mx-auto text-base sm:text-xl text-slate-300 font-normal leading-relaxed">
            Prove who you are and what you qualify for without exposing unnecessary personal information.
          </p>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <span>See How It Works</span>
              <ChevronRight className="w-4 h-4 text-cyan-400" />
            </a>
          </div>

          {/* Supporting tagline */}
          <div className="pt-2">
            <p className="text-xs text-slate-400 italic">
              “Your credentials belong to you. Your data should stay private.”
            </p>
          </div>

          {/* Quick Pillars Callout */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Circom &amp; snarkjs Groth16
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Selective Disclosure
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> On-Chain Revocation
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 0 PII On-Chain
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Visual Transformation: Private Credential → ZK Proof → Verified Claim */}
      <section id="product" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-cyan-400 text-xs font-mono">
            <KeyRound className="w-3.5 h-3.5" />
            <span>Interactive Architecture Demo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Private Credential → ZK Proof → Verified Claim
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Select an example claim to observe how ClaimPass proves facts mathematically without exposing raw personal attributes.
          </p>

          {/* Claim Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            <button
              onClick={() => setActiveClaimTab("degree")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeClaimTab === "degree"
                  ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                  : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>B.Tech Holder ✓</span>
            </button>

            <button
              onClick={() => setActiveClaimTab("age")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeClaimTab === "age"
                  ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                  : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
              }`}
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Age 18+ ✓</span>
            </button>

            <button
              onClick={() => setActiveClaimTab("grad")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeClaimTab === "grad"
                  ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                  : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Graduate 2026 ✓</span>
            </button>

            <button
              onClick={() => setActiveClaimTab("student")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                activeClaimTab === "student"
                  ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                  : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Student Status ✓</span>
            </button>
          </div>
        </div>

        {/* 3-Column Visual Flow Pipeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Box 1: Private Credential (Stored Privately) */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Lock className="w-20 h-20 text-cyan-400" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Step 1: User&apos;s Device
                </span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-800 text-[10px] text-cyan-300 font-mono">
                  Off-Chain Wallet
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">Private Credential</h3>
              <p className="text-xs text-slate-400 mb-5">
                Stays securely inside holder&apos;s local device. Never uploaded to servers or the blockchain.
              </p>

              <div className="space-y-2.5">
                {current.privateData.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-400 font-medium">{item.label}</span>
                    <span className="font-mono text-cyan-300 flex items-center gap-1.5">
                      <EyeOff className="w-3 h-3 text-cyan-400" />
                      <span>{item.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Encrypted Storage</span>
              <span className="text-emerald-400 font-semibold">100% Private</span>
            </div>
          </div>

          {/* Box 2: Zero-Knowledge Proof Engine */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-indigo-950/30 to-slate-900/90 border border-indigo-800/40 shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span> Step 2: Math Proof
                </span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-950/80 border border-indigo-700/60 text-[10px] text-indigo-300 font-mono">
                  {current.proofSystem}
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">Zero-Knowledge Proof</h3>
              <p className="text-xs text-slate-400 mb-5">
                Compiles witness locally using Circom circuit and generates non-interactive Groth16 proof.
              </p>

              <div className="p-4 rounded-2xl bg-slate-950/90 border border-indigo-950/60 font-mono text-[11px] space-y-2 text-indigo-300">
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5 text-slate-400">
                  <span>Circuit:</span>
                  <span className="text-white font-semibold">{current.circuit}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5 text-slate-400">
                  <span>Curve:</span>
                  <span className="text-cyan-400">BN128 / alt_bn128</span>
                </div>
                <div className="flex justify-between border-b border-slate-800/80 pb-1.5 text-slate-400">
                  <span>Witness Blinding:</span>
                  <span className="text-emerald-400">Active (Salt applied)</span>
                </div>
                <div className="flex justify-between text-slate-400 pt-0.5">
                  <span>Proof π:</span>
                  <span className="text-slate-400 truncate max-w-[140px]">[π_a, π_b, π_c]</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-center gap-2 text-xs text-indigo-300 font-medium">
              <Cpu className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Cryptographic transformation complete</span>
            </div>
          </div>

          {/* Box 3: Verified Claim (What the Verifier Learns) */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-800/40 shadow-2xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle2 className="w-20 h-20 text-emerald-400" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Step 3: Public Result
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-800/70 text-[10px] text-emerald-300 font-mono">
                  Verifier Portal
                </span>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">Verified Claim</h3>
              <p className="text-xs text-slate-400 mb-5">
                Verifier validates the proof against on-chain smart contracts without seeing DOB, address, or roll numbers.
              </p>

              <div className="space-y-2.5">
                {current.verifierSees.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs"
                  >
                    <span className="text-slate-400 font-medium">{item.label}</span>
                    <span
                      className={`font-mono font-bold ${
                        item.status === "verified" ? "text-emerald-400" : "text-cyan-400"
                      }`}
                    >
                      {item.result}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-emerald-400 font-mono">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 0 PII Exposed
              </span>
              <span className="font-bold">STATUS: VALID ✓</span>
            </div>
          </div>
        </div>

        {/* Try in ClaimPass CTA Banner */}
        <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Experience ClaimPass Prover Live</h4>
              <p className="text-xs text-slate-400">Generate a custom Zero-Knowledge Proof with Rahul&apos;s demo credential right now.</p>
            </div>
          </div>

          <Link
            href="/claimpass"
            className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>Open ClaimPass Prover</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* Comprehensive Sections: The Problem, How It Works, Why ZK, Selective Disclosure, Blockchain, Revocation */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
          <h2 className="text-xs uppercase font-bold tracking-widest text-cyan-400">
            How ClaimPass Works
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-white">
            Engineered for Mathematical Privacy and Instant Trust
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Pillar 1: The Problem */}
          <div className="p-7 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-rose-500/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">The Over-Disclosure Problem</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Traditional verification forces users to send unredacted PDFs, student IDs, and government cards. Verifiers end up hoarding sensitive dates of birth, residential addresses, and roll numbers that get leaked in corporate database breaches.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-rose-400">
              ● Excessive data collection ends here
            </div>
          </div>

          {/* Pillar 2: How ClaimPass Works */}
          <div className="p-7 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Selective Disclosure</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                ClaimPass splits credentials into atomic attestations. When an employer asks for a B.Tech degree, you prove exclusively that single claim. Your grades, roll number, and personal background remain locked.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-cyan-400">
              ● Disclose only what is strictly required
            </div>
          </div>

          {/* Pillar 3: Why Zero-Knowledge Proofs */}
          <div className="p-7 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Why Zero-Knowledge Proofs</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Groth16 zk-SNARKs allow a prover to convince a verifier that a mathematical statement is true without conveying any information beyond the statement&apos;s validity. Proofs cannot be reverse-engineered or forged.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-indigo-400">
              ● Pure cryptography replaces blind trust
            </div>
          </div>

          {/* Pillar 4: Blockchain-Based Verification */}
          <div className="p-7 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Blockchain-Based Verification</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Ethereum-compatible smart contracts (<code className="text-emerald-300">CredentialRegistry.sol</code>) record university public keys and cryptographic commitments. Raw personal data is NEVER stored on-chain.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-emerald-400">
              ● Tamper-proof institutional authority
            </div>
          </div>

          {/* Pillar 5: On-Chain Revocation */}
          <div className="p-7 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Ban className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Instant On-Chain Revocation</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                If a university revokes an issued degree, the on-chain bitmap is flipped. Even if the cryptographic proof is mathematically sound, verifiers immediately reject the credential with an explicit revocation notice.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-amber-400">
              ● Real-time protection against forged credentials
            </div>
          </div>

          {/* Pillar 6: Privacy-First Identity */}
          <div className="p-7 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-teal-500/40 transition-all flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                <Fingerprint className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Privacy-First Identity</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">
                Sign into applications with your Digital ID instead of centralized passwords. Receive verifiable cryptographic receipts for every verification event with zero personal data leakage.
              </p>
            </div>
            <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-teal-400">
              ● Self-sovereign cryptographic ownership
            </div>
          </div>
        </div>
      </section>

      {/* Technology Architecture Section */}
      <section id="technology" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-800/80">
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-8 sm:p-12 shadow-2xl">
          <div className="max-w-3xl mb-10">
            <span className="text-xs font-mono uppercase font-bold text-cyan-400 tracking-wider">Technology Stack</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Production Cryptography &amp; Decentralized Architecture
            </h3>
            <p className="text-sm text-slate-400 mt-2">
              ClaimPass is built upon the battle-tested Zero-Knowledge stack powering modern layer 2 rollups and decentralized identity standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs font-mono text-cyan-400 font-bold">CIRCOM 2.1.6</span>
              <h4 className="text-base font-bold text-white mt-1">Arithmetic Circuits</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                R1CS constraint compilation for <code className="text-cyan-300">degree_btech</code> and <code className="text-cyan-300">age_18</code> circuits.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs font-mono text-indigo-400 font-bold">SNARKJS / GROTH16</span>
              <h4 className="text-base font-bold text-white mt-1">Zero-Knowledge Prover</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Sub-second client-side proof generation on BN128 pairing-friendly elliptic curve.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs font-mono text-emerald-400 font-bold">SOLIDITY 0.8.20</span>
              <h4 className="text-base font-bold text-white mt-1">On-Chain Registry</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                <code className="text-emerald-300">CredentialRegistry.sol</code> maintains cryptographic commitments and revocation bitmaps.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-xs font-mono text-teal-400 font-bold">VIEM / ETHERS</span>
              <h4 className="text-base font-bold text-white mt-1">EVM Integration</h4>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Decentralized RPC state verification across Sepolia testnets and local EVM nodes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-slate-800/80 bg-slate-950 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
                CP
              </div>
              <div>
                <span className="font-extrabold text-white text-sm">ClaimPass</span>
                <p className="text-[11px] text-slate-400">Prove the claim. Reveal less.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link>
              <Link href="/wallet" className="hover:text-cyan-400 transition-colors">Digital ID Wallet</Link>
              <Link href="/claimpass" className="hover:text-cyan-400 transition-colors">ClaimPass Prover</Link>
              <Link href="/verifier" className="hover:text-cyan-400 transition-colors">Verifier Portal</Link>
              <Link href="/issuer" className="hover:text-cyan-400 transition-colors">Issuer Portal</Link>
              <Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Receipts</Link>
              <Link href="/login" className="hover:text-cyan-400 transition-colors">Login with Digital ID</Link>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
            <span>© 2026 ClaimPass Protocol. All rights reserved. Raw personal data is never stored on-chain.</span>
            <span className="font-mono">Circom 2.1.6 • snarkjs Groth16 • Solidity 0.8.20</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
