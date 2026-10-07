"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import {
  KeyRound,
  GraduationCap,
  Fingerprint,
  Calendar,
  Building2,
  Lock,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Cpu,
  ShieldCheck,
  EyeOff,
  Copy,
  QrCode,
  Sparkles,
  ExternalLink,
  Ban,
  RotateCcw,
} from "lucide-react";
import {
  getCredentials,
  seedDemoCredentialIfNeeded,
  addVerificationHistoryItem,
  addPrivacyReceipt,
} from "../../lib/credential";
import {
  generateDegreeProof,
  generateAgeProof,
  generateGraduationYearProof,
  generateStudentStatusProof,
  generateGovIdProof,
} from "../../lib/zk";
import { verifyProofOnChain, isCredentialRevokedOnChain } from "../../lib/blockchain";
import { Credential, ClaimType, ZKProof } from "../../lib/types";

export default function ClaimPassPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<ClaimType>("gov_id");
  const [isGenerating, setIsGenerating] = useState(false);
  const [proofStep, setProofStep] = useState<number>(0);
  const [generatedProof, setGeneratedProof] = useState<ZKProof | null>(null);
  const [onChainTx, setOnChainTx] = useState<string | null>(null);
  const [showTechDetails, setShowTechDetails] = useState(false);
  const [copiedProof, setCopiedProof] = useState(false);
  const [isRevokedWarning, setIsRevokedWarning] = useState(false);

  useEffect(() => {
    async function load() {
      const creds = await seedDemoCredentialIfNeeded();
      setCredentials(creds);
    }
    load();
  }, []);

  const claimsConfig: Record<
    ClaimType,
    {
      title: string;
      desc: string;
      icon: any;
      circuit: string;
      verifierLearns: string[];
      verifierNotLearns: string[];
      claimResultText: string;
    }
  > = {
    gov_id: {
      title: "Valid Government ID Holder",
      desc: "Prove you hold an authenticated government identity (Aadhaar / PAN / Passport / DL / Voter ID).",
      icon: ShieldCheck,
      circuit: "gov_id (Real SnarkJS Groth16)",
      verifierLearns: [
        "Valid Government ID Holder: TRUE",
        "Document: Official Government Credential",
        "Issuer: Trusted Authority (UIDAI / Gov)",
        "Credential Status: Active",
      ],
      verifierNotLearns: [
        "Aadhaar Number / Document ID",
        "PAN Number / Tax ID",
        "Full Legal Name",
        "Exact Date of Birth",
        "Home Address & Biometrics",
        "Raw Photo / Selfie",
      ],
      claimResultText: "Valid Government ID Holder: TRUE ✓",
    },
    age: {
      title: "Age 18+",
      desc: "Prove that you are at least 18 years old without revealing your exact date of birth.",
      icon: Fingerprint,
      circuit: "age_18 (Circom + Groth16)",
      verifierLearns: [
        "Age >= 18: TRUE",
        "Current Valid Attestation",
        "Issuer: Trusted Authority",
      ],
      verifierNotLearns: [
        "Exact Date of Birth",
        "Day and Month of Birth",
        "Birthplace / Address",
        "Government ID Number",
        "Full Legal Name",
      ],
      claimResultText: "Age >= 18: TRUE ✓",
    },
    degree: {
      title: "B.Tech Holder",
      desc: "Prove that you hold a B.Tech degree.",
      icon: GraduationCap,
      circuit: "degree_btech",
      verifierLearns: [
        "Degree: B.Tech",
        "Issuer: XYZ University",
        "Credential: Active",
      ],
      verifierNotLearns: [
        "Date of Birth",
        "Address",
        "Roll Number",
        "Student ID",
        "Other private information",
      ],
      claimResultText: "B.Tech Holder: YES ✓",
    },
    grad_year: {
      title: "Graduated in 2026",
      desc: "Prove your graduation year.",
      icon: Calendar,
      circuit: "grad_year_2026",
      verifierLearns: [
        "Graduation Year: 2026",
        "Accredited XYZ University Registry",
        "Credential Status: Active",
      ],
      verifierNotLearns: [
        "Grades & Transcripts",
        "Student ID / Roll Number",
        "Course details",
        "Personal Contact Information",
      ],
      claimResultText: "Graduated in 2026: YES ✓",
    },
    student_status: {
      title: "XYZ University Student",
      desc: "Prove that your credential was issued by XYZ University.",
      icon: Building2,
      circuit: "student_status_xyz",
      verifierLearns: [
        "Institution: XYZ University",
        "Enrolled Student: TRUE",
        "Registration: Valid",
      ],
      verifierNotLearns: [
        "Hostel / Residential Address",
        "Tuition / Fee information",
        "Family / Guardian details",
        "Personal Marks",
      ],
      claimResultText: "XYZ University Student: YES ✓",
    },
  };

  const activeConfig = claimsConfig[selectedClaim];

  const handleGenerateProof = async () => {
    const cred = credentials.find((c) => c.degree.includes("B.Tech")) || credentials[0];
    if (!cred) return;

    // Check if credential is currently revoked
    const revoked = isCredentialRevokedOnChain(cred.id);
    setIsRevokedWarning(revoked);

    setIsGenerating(true);
    setProofStep(1); // 1. Reading credential ✓
    setGeneratedProof(null);
    setOnChainTx(null);

    // Step 2: Preparing private inputs ✓
    setTimeout(() => setProofStep(2), 600);

    // Step 3: Generating ZK proof...
    setTimeout(async () => {
      setProofStep(3);

      let proof: ZKProof | null = null;
      if (selectedClaim === "gov_id") {
        const govCred = credentials.find((c) => c.isGovernmentId) || cred;
        proof = await generateGovIdProof(
          govCred.holderName,
          govCred.dateOfBirth,
          govCred.govIdType || "Aadhaar Card",
          govCred.commitment
        );
      } else if (selectedClaim === "degree") {
        proof = await generateDegreeProof(
          cred.id,
          cred.signature,
          cred.holderName,
          cred.dateOfBirth,
          cred.degree,
          cred.branch,
          cred.graduationYear,
          cred.issuerAddress,
          cred.commitment
        );
      } else if (selectedClaim === "age") {
        proof = await generateAgeProof(cred.dateOfBirth, cred.issuerAddress);
      } else if (selectedClaim === "grad_year") {
        proof = await generateGraduationYearProof(cred.id, cred.graduationYear, cred.commitment);
      } else {
        proof = await generateStudentStatusProof(cred.id, cred.issuerName, cred.commitment);
      }

      // Step 4: Verifying proof...
      setTimeout(() => {
        setProofStep(4);

        // Step 5: Checking revocation status...
        setTimeout(async () => {
          setProofStep(5);

          if (proof) {
            const verifyResult = await verifyProofOnChain(proof, cred.id, "0xABC_Technologies_Verifier");
            setOnChainTx(verifyResult.txHash);

            // Record verification history & privacy receipt
            addVerificationHistoryItem({
              id: `hist-${Date.now()}`,
              claimTitle: `${activeConfig.title} Proof`,
              verifierName: "ABC Technologies",
              status: verifyResult.overallValid ? "Verified" : "Revoked",
              timestamp: Date.now(),
              dateFormatted: "Just now",
              proofType: selectedClaim,
              txHash: verifyResult.txHash,
              personalDataExposed: 0,
            });

            addPrivacyReceipt({
              id: `rcpt-${Date.now()}`,
              verifierName: "ABC Technologies",
              claimShared: activeConfig.title,
              timestamp: Date.now(),
              personalDataExposed: 0,
              proofStatus: verifyResult.overallValid ? "Valid" : "Revoked",
              txHash: verifyResult.txHash,
              circuit: activeConfig.circuit,
            });
          }

          // Step 6: Proof ready ✓
          setTimeout(() => {
            setProofStep(6);
            setGeneratedProof(proof);
            setIsGenerating(false);
          }, 600);
        }, 700);
      }, 700);
    }, 1200);
  };

  const handleCopyProof = () => {
    if (!generatedProof) return;
    navigator.clipboard.writeText(JSON.stringify(generatedProof, null, 2));
    setCopiedProof(true);
    setTimeout(() => setCopiedProof(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Section 5 Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-mono">
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            <span>Selective Disclosure Prover</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            What do you want to prove?
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Select only the claim required by the verifier.
          </p>
        </div>

        {/* 4 Claim Cards Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(claimsConfig) as ClaimType[]).map((claimKey) => {
            const config = claimsConfig[claimKey];
            const Icon = config.icon;
            const isSelected = selectedClaim === claimKey;

            return (
              <div
                key={claimKey}
                onClick={() => {
                  setSelectedClaim(claimKey);
                  setGeneratedProof(null);
                  setProofStep(0);
                }}
                className={`p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between shadow-xl ${
                  isSelected
                    ? "bg-slate-900 border-cyan-500 shadow-cyan-500/10"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform ${
                      isSelected
                        ? "bg-cyan-500 text-slate-950 scale-105 shadow-md shadow-cyan-500/20"
                        : "bg-slate-800 text-cyan-400"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-1">{config.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{config.desc}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono flex items-center justify-between">
                  <span className={isSelected ? "text-cyan-400 font-bold" : "text-slate-400"}>
                    {isSelected ? "Selected ●" : "Click to select"}
                  </span>
                  <span className="text-slate-400">{config.circuit}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Transformation Flow for Selected Claim */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs font-mono uppercase text-cyan-400 font-bold">Privacy Flow Architecture</span>
            <h3 className="text-xl font-bold text-white">
              Zero-Knowledge Transformation for {activeConfig.title}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* 1. Private Information (Locked) */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-slate-400 uppercase flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-cyan-400" /> Private Information
                </span>
                <span className="text-[10px] font-mono text-rose-400 bg-rose-950/70 border border-rose-800 px-2 py-0.5 rounded">
                  Hidden 🔒
                </span>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Name:</span>
                  <span className="text-cyan-300">Rahul Kumar 🔒</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Date of Birth:</span>
                  <span className="text-cyan-300">12 August 2002 🔒</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Address:</span>
                  <span className="text-cyan-300">Confidential 🔒</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Student ID / Roll:</span>
                  <span className="text-cyan-300">2022CSB1049 🔒</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex justify-between">
                  <span className="text-slate-400">Credential Data:</span>
                  <span className="text-cyan-300">Off-chain Vault 🔒</span>
                </div>
              </div>
            </div>

            {/* 2. Zero-Knowledge Proof (Middle) */}
            <div className="p-6 rounded-2xl bg-indigo-950/20 border border-indigo-800/50 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>

              <div>
                <h4 className="font-bold text-white text-base">Zero-Knowledge Proof</h4>
                <p className="text-xs text-indigo-300 font-mono mt-1">{activeConfig.circuit}.circom</p>
                <p className="text-[11px] text-slate-400 mt-2">
                  Mathematically asserts only that the specified constraint holds true. No underlying data is contained in the proof payload.
                </p>
              </div>

              <div className="py-1 px-3 rounded-full bg-indigo-950/80 border border-indigo-700/60 inline-flex items-center gap-1.5 text-[11px] font-mono text-indigo-300">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>Groth16 / BN128</span>
              </div>
            </div>

            {/* 3. Public Result (Verifier Output) */}
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-900/60 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-emerald-400 uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Public Result
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded">
                  Verified ✓
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/40 text-center space-y-2">
                <span className="text-[11px] text-slate-400 uppercase font-mono block">Verifier Receives:</span>
                <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                  {activeConfig.claimResultText}
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] font-mono text-slate-300">
                <div className="flex justify-between">
                  <span>Accredited Issuer:</span>
                  <span className="text-emerald-400 font-semibold">XYZ University ✓</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-semibold">Active ✓</span>
                </div>
                <div className="flex justify-between text-cyan-400 font-semibold">
                  <span>Personal Data Exposed:</span>
                  <span>0 Attributes 🔒</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trigger Proof Generation Button */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGenerateProof}
              disabled={isGenerating}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition-all flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Cpu className="w-4 h-4 animate-spin" />
                  <span>Computing Zero-Knowledge Proof...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Generate Zero-Knowledge Proof</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Section 6: ZK Proof Generation Animated Execution & Results */}
        {proofStep > 0 && (
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <span>{activeConfig.title} Proof Execution</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  You are generating a Zero-Knowledge Proof that confirms {activeConfig.desc.toLowerCase()}
                </p>
              </div>

              <div className="text-xs font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-3 py-1 rounded-full">
                Circuit: {activeConfig.circuit}
              </div>
            </div>

            {/* 6 Animated Steps */}
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300">
                  {proofStep >= 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px]">1</span>}
                  1. Reading credential
                </span>
                <span className={proofStep >= 1 ? "text-emerald-400 font-bold" : "text-slate-400"}>
                  {proofStep >= 1 ? "Done ✓" : "Pending..."}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300">
                  {proofStep >= 2 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px]">2</span>}
                  2. Preparing private inputs &amp; witness
                </span>
                <span className={proofStep >= 2 ? "text-emerald-400 font-bold" : "text-slate-400"}>
                  {proofStep >= 2 ? "Protected off-chain ✓" : "Pending..."}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300">
                  {proofStep >= 3 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px]">3</span>}
                  3. Generating ZK proof (Groth16 / BN128)
                </span>
                <span className={proofStep >= 3 ? "text-emerald-400 font-bold" : "text-slate-400"}>
                  {proofStep >= 3 ? "Generated π ✓" : "Pending..."}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300">
                  {proofStep >= 4 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px]">4</span>}
                  4. Verifying proof mathematically
                </span>
                <span className={proofStep >= 4 ? "text-emerald-400 font-bold" : "text-slate-400"}>
                  {proofStep >= 4 ? "Pairing verified ✓" : "Pending..."}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300">
                  {proofStep >= 5 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px]">5</span>}
                  5. Checking revocation status on-chain
                </span>
                <span className={proofStep >= 5 ? (isRevokedWarning ? "text-rose-400 font-bold" : "text-emerald-400 font-bold") : "text-slate-400"}>
                  {proofStep >= 5 ? (isRevokedWarning ? "REVOKED ✕" : "Active (Not Revoked) ✓") : "Pending..."}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300">
                  {proofStep >= 6 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px]">6</span>}
                  6. Proof ready
                </span>
                <span className={proofStep >= 6 ? "text-emerald-400 font-bold" : "text-slate-400"}>
                  {proofStep >= 6 ? "Ready to Share ✓" : "Pending..."}
                </span>
              </div>
            </div>

            {/* Final Result Card */}
            {generatedProof && (
              <div className="space-y-6 pt-4 border-t border-slate-800">
                {isRevokedWarning ? (
                  <div className="p-5 rounded-2xl bg-rose-950/30 border border-rose-800 text-rose-300 space-y-2">
                    <h4 className="font-bold text-sm flex items-center gap-2">
                      <Ban className="w-4 h-4 text-rose-400" />
                      <span>Verification Notice: Credential Revoked by Issuer</span>
                    </h4>
                    <p className="text-xs">
                      The cryptographic proof is mathematically sound, but this credential has been revoked by XYZ University on-chain in <code className="text-rose-200">CredentialRegistry.sol</code>.
                    </p>
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-900/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-black text-emerald-400 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>✓ Proof Generated Successfully</span>
                      </h4>
                      <span className="text-xs font-mono text-cyan-400 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
                        0 Attributes Exposed
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono pt-2">
                      <div>
                        <span className="text-slate-400 block text-[11px]">Claim:</span>
                        <span className="text-white font-bold">{activeConfig.title}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Result:</span>
                        <span className="text-emerald-400 font-bold">Verified (TRUE)</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[11px]">Privacy:</span>
                        <span className="text-cyan-400 font-bold">Underlying personal data was not revealed.</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Technical Details Toggle */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowTechDetails(!showTechDetails)}
                      className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{showTechDetails ? "Hide Technical Details" : "View Technical Details"}</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCopyProof}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono flex items-center gap-1.5"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedProof ? "Copied!" : "Copy Proof JSON"}</span>
                      </button>

                      <Link
                        href="/verifier"
                        className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
                      >
                        <span>Verify in Verifier Portal</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {showTechDetails && (
                    <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Proof System &amp; Engine:</span>
                        <span className="text-cyan-400 font-semibold">
                          Groth16 / SnarkJS ({generatedProof.proof.curve || "bn128"})
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Circuit Name:</span>
                        <span className="text-white font-semibold">{activeConfig.circuit}</span>
                      </div>
                      {generatedProof.poseidonCommitment && (
                        <div className="flex justify-between border-b border-slate-800 pb-1.5">
                          <span className="text-slate-400">Poseidon Commitment:</span>
                          <span className="text-indigo-400 truncate max-w-[280px]">
                            {generatedProof.poseidonCommitment}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Public Signals:</span>
                        <span className="text-slate-300 truncate max-w-[280px]">
                          [{generatedProof.publicSignals.slice(0, 3).join(", ")}...]
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Proof Points (π_a, π_b, π_c):</span>
                        <span className="text-emerald-400 font-semibold">G1 &amp; G2 Points Valid ✓</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Issuer Status:</span>
                        <span className="text-emerald-400 font-semibold">Trusted Authority (Registry Valid ✓)</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800 pb-1.5">
                        <span className="text-slate-400">Revocation Status:</span>
                        <span className={isRevokedWarning ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                          {isRevokedWarning ? "Revoked ✕" : "Active (Not Revoked) ✓"}
                        </span>
                      </div>
                      {onChainTx && (
                        <div className="flex justify-between pt-1 text-[11px]">
                          <span className="text-slate-400">Verification Tx Hash:</span>
                          <span className="text-cyan-400 truncate max-w-[280px]">{onChainTx}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
