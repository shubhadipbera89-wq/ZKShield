"use client";

import { useState } from "react";
import { Credential, ZKProof } from "../lib/types";
import { generateAgeProof, generateDegreeProof } from "../lib/zk";
import { PrivacyPanel } from "./PrivacyPanel";
import { X, ShieldCheck, Cpu, Check, Copy, ArrowRight, Loader2, FileCode, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface ZKProofModalProps {
  credential: Credential;
  onClose: () => void;
  defaultClaimType?: "age" | "degree";
}

export function ZKProofModal({ credential, onClose, defaultClaimType = "degree" }: ZKProofModalProps) {
  const router = useRouter();
  const [claimType, setClaimType] = useState<"age" | "degree">(defaultClaimType);
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState<number>(0);
  const [proof, setProof] = useState<ZKProof | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setProof(null);
    setStep(1); // Step 1: Witness computation

    try {
      await new Promise((r) => setTimeout(r, 450));
      setStep(2); // Step 2: Groth16 Bn128 curve proof computation

      await new Promise((r) => setTimeout(r, 650));
      setStep(3); // Step 3: Packing public signals

      let generatedProof: ZKProof | null = null;
      if (claimType === "age") {
        generatedProof = await generateAgeProof(credential.dateOfBirth);
        if (!generatedProof) {
          throw new Error("Age requirement not met! Circuit constraint (age >= 18) rejected the witness.");
        }
      } else {
        generatedProof = await generateDegreeProof(
          credential.id,
          credential.signature,
          credential.holderName,
          credential.dateOfBirth,
          credential.degree,
          credential.branch,
          credential.graduationYear,
          credential.issuerAddress,
          credential.commitment
        );
      }

      await new Promise((r) => setTimeout(r, 300));
      setProof(generatedProof);
      setStep(4); // Completed

      // Save generated proof to sessionStorage for instant consumption by Verifier
      if (typeof window !== "undefined") {
        sessionStorage.setItem("zk_last_proof", JSON.stringify(generatedProof));
        sessionStorage.setItem("zk_last_credential_id", credential.id);
        sessionStorage.setItem("zk_last_credential_degree", credential.degree);
        sessionStorage.setItem("zk_last_credential_branch", credential.branch);
        sessionStorage.setItem("zk_last_credential_issuer", credential.issuerAddress);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate Zero-Knowledge proof");
      setStep(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyProof = () => {
    if (!proof) return;
    navigator.clipboard.writeText(JSON.stringify(proof, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendToVerifier = () => {
    onClose();
    router.push("/verifier?autoVerify=true");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-base">Generate Zero-Knowledge Proof</h3>
              <p className="text-xs text-slate-400">Groth16 ZK-SNARK on BN128 elliptic curve</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Claim Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Select Claim to Prove
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setClaimType("degree");
                  setProof(null);
                  setStep(0);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  claimType === "degree"
                    ? "bg-cyan-950/40 border-cyan-500/60 text-white shadow-lg shadow-cyan-950/50"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="font-semibold text-sm mb-1 flex items-center gap-1.5">
                  🎓 Degree Holder
                  {claimType === "degree" && <span className="text-xs text-cyan-400 font-mono">● Active</span>}
                </div>
                <div className="text-xs text-slate-400">
                  Prove valid B.Tech at ABC University without revealing roll number or grades
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setClaimType("age");
                  setProof(null);
                  setStep(0);
                }}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  claimType === "age"
                    ? "bg-cyan-950/40 border-cyan-500/60 text-white shadow-lg shadow-cyan-950/50"
                    : "bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="font-semibold text-sm mb-1 flex items-center gap-1.5">
                  🎂 Age 18+ Verification
                  {claimType === "age" && <span className="text-xs text-cyan-400 font-mono">● Active</span>}
                </div>
                <div className="text-xs text-slate-400">
                  Prove age &gt;= 18 without disclosing exact date of birth
                </div>
              </button>
            </div>
          </div>

          {/* Privacy Panel */}
          <PrivacyPanel claimType={claimType} compact />

          {/* Proof Generation Pipeline */}
          {isGenerating && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-cyan-400">
                <span className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 animate-spin" />
                  Generating Groth16 Cryptographic Proof...
                </span>
                <span className="font-mono text-slate-400">Step {step}/3</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className={`flex items-center gap-2 ${step >= 1 ? "text-slate-200" : "text-slate-600"}`}>
                  {step > 1 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  )}
                  <span>1. Evaluating R1CS constraint matrix & witness signals</span>
                </div>
                <div className={`flex items-center gap-2 ${step >= 2 ? "text-slate-200" : "text-slate-600"}`}>
                  {step > 2 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  )}
                  <span>2. Generating Groth16 pairing proof (pi_a, pi_b, pi_c)</span>
                </div>
                <div className={`flex items-center gap-2 ${step >= 3 ? "text-slate-200" : "text-slate-600"}`}>
                  {step >= 3 ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-700" />
                  )}
                  <span>3. Packaging BN128 public signals & verification envelope</span>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs">
              <div className="font-semibold mb-1">Constraint Satisfaction Error</div>
              <div>{error}</div>
            </div>
          )}

          {/* Proof Generated Success View */}
          {proof && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ZK-SNARK Proof Successfully Generated</span>
                </div>
                <button
                  onClick={handleCopyProof}
                  className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? "Copied" : "Copy Proof JSON"}</span>
                </button>
              </div>

              {/* Cryptographic Snippet */}
              <div className="p-3 rounded-lg bg-black/60 font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1.5 overflow-x-auto">
                <div className="text-cyan-400 font-semibold flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5" />
                  Groth16 Proof Metadata:
                </div>
                <div>Curve: <span className="text-emerald-400">{proof.proof.curve}</span> | Protocol: <span className="text-emerald-400">{proof.proof.protocol}</span></div>
                <div className="truncate">pi_a[0]: <span className="text-slate-400">{proof.proof.pi_a[0]}</span></div>
                <div className="truncate">pi_b[0][0]: <span className="text-slate-400">{proof.proof.pi_b[0][0]}</span></div>
                <div className="text-xs text-amber-400 pt-1">
                  Public Signals: [{proof.publicSignals.join(", ")}]
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>

          {!proof ? (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-indigo-600 text-white hover:from-cyan-400 hover:to-indigo-500 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Proving via Circom...
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" />
                  Generate ZK Proof
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSendToVerifier}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-all"
            >
              <span>Verify Claim Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
