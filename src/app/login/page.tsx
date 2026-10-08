"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  Cpu,
  ArrowRight,
  EyeOff,
  Camera,
  Upload,
  X,
  Sparkles,
  CreditCard,
  FileBadge,
  Building2,
  Car,
  Vote,
  FileCheck,
  KeyRound,
  UserPlus,
  AlertTriangle,
} from "lucide-react";
import { processIdentityVerification, VERIFICATION_STAGES } from "../../lib/kyc-verifier";
import { GovIdType } from "../../lib/types";
import { createGovernmentCredential, getCredentials } from "../../lib/credential";

type UploadedFile = {
  file: File;
  name: string;
  size: string;
  type: string;
  previewUrl: string | null;
  progress: number;
};

const GOV_ID_TYPES: { id: GovIdType; name: string; icon: any; badge: string; desc: string }[] = [
  { id: "Aadhaar Card", name: "Aadhaar Card", icon: CreditCard, badge: "UIDAI Digital ID", desc: "12-Digit Biometric National Identity" },
  { id: "PAN Card", name: "PAN Card", icon: FileBadge, badge: "Tax Department", desc: "Income Tax Authority Identity" },
  { id: "Passport", name: "Passport", icon: Building2, badge: "Travel Document", desc: "Government-Issued Passport" },
  { id: "Driving Licence", name: "Driving Licence", icon: Car, badge: "Transport Authority", desc: "Official Driving Licence" },
  { id: "Voter ID", name: "Voter ID", icon: Vote, badge: "Election Commission", desc: "EPIC Electoral Identity" },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function LoginPage() {
  const router = useRouter();
  const [selectedDocType, setSelectedDocType] = useState<GovIdType>("Aadhaar Card");
  const [docFile, setDocFile] = useState<UploadedFile | null>(null);
  const [photoFile, setPhotoFile] = useState<UploadedFile | null>(null);
  const [step, setStep] = useState<"choose" | "verifying" | "success" | "failed">("choose");
  const [activeStepIdx, setActiveStepIdx] = useState<number>(-1);
  const [verifyProgress, setVerifyProgress] = useState<boolean[]>(
    Array(VERIFICATION_STAGES.length).fill(false)
  );

  const docInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File, isPhoto: boolean) => {
    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    const uploaded: UploadedFile = {
      file,
      name: file.name,
      size: formatBytes(file.size),
      type: file.type || "Document",
      previewUrl,
      progress: 100,
    };
    if (isPhoto) {
      setPhotoFile(uploaded);
    } else {
      setDocFile(uploaded);
    }
  };

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f, false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f, true);
  };

  const handleQuickSignIn = async () => {
    const creds = getCredentials();
    if (creds && creds.length > 0) {
      router.push("/dashboard");
    } else {
      router.push("/register");
    }
  };

  const handleVerifySignIn = async () => {
    if (!docFile || !photoFile) return;
    setStep("verifying");
    setVerifyProgress(Array(VERIFICATION_STAGES.length).fill(false));
    setActiveStepIdx(0);

    try {
      await processIdentityVerification(
        {
          documentFile: docFile.file,
          photoFile: photoFile.file,
          documentType: selectedDocType,
          holderName: "Shubhadip Bera",
          dateOfBirth: "2002-08-12",
        },
        (idx, report) => {
          setActiveStepIdx(idx);
          if (report.status === "success") {
            setVerifyProgress((prev) => {
              const next = [...prev];
              next[idx] = true;
              return next;
            });
          }
        }
      );

      await createGovernmentCredential(
        selectedDocType,
        "Shubhadip Bera",
        "2002-08-12",
        selectedDocType === "Aadhaar Card" ? "XXXX-XXXX-8921" : "ABCDE1234F"
      );

      setStep("success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err) {
      console.error(err);
      setStep("failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <Navbar />

      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        onChange={handleDocChange}
        id="login-doc-file"
      />
      <input
        ref={photoInputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        className="hidden"
        onChange={handlePhotoChange}
        id="login-photo-file"
      />

      <main className="flex-1 flex items-start justify-center p-4 sm:p-6 lg:p-8 py-10 relative overflow-hidden">
        <div className="w-full max-w-2xl mx-auto relative z-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-700/50 text-cyan-300 text-xs font-mono">
              <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
              <span>Zero-Knowledge Digital Identity Authentication</span>
            </div>
            <h1 className="text-3xl font-black text-white">Sign In to ClaimPass</h1>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Passwordless, privacy-preserving authentication powered by Government ID verification and Groth16 Zero-Knowledge proofs.
            </p>
          </div>

          {step === "choose" && (
            <div className="space-y-6">
              {/* Two clear paths */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Existing User */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h2 className="text-base font-bold text-white">Existing User</h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Authenticate with your stored Digital ID Wallet or verify your government credentials.
                    </p>
                  </div>
                  <button
                    onClick={handleQuickSignIn}
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40"
                  >
                    <span>Verify & Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* New User */}
                <div className="p-5 rounded-2xl bg-slate-900/80 border border-indigo-900/40 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <h2 className="text-base font-bold text-white">New User</h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Verify your identity once with Government ID + Photo to create your ClaimPass account.
                    </p>
                  </div>
                  <Link
                    href="/register"
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/40 text-center"
                  >
                    <span>Create an Account</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Direct Government ID Upload & Verify option */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                      Direct Verification Sign-In
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">Real ZK Pipeline</span>
                </div>

                {/* Doc Type Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">Select Government ID Type</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {GOV_ID_TYPES.map((t) => {
                      const Icon = t.icon;
                      const isSel = selectedDocType === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedDocType(t.id)}
                          className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2.5 ${
                            isSel
                              ? "bg-cyan-500/10 border-cyan-500/40 text-white"
                              : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSel ? "text-cyan-400" : "text-slate-500"}`} />
                          <span className="text-xs font-medium">{t.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Upload Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Document */}
                  <div
                    onClick={() => docInputRef.current?.click()}
                    className="p-4 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500/50 bg-slate-950/30 cursor-pointer transition text-center space-y-2"
                  >
                    <Upload className="w-5 h-5 text-cyan-400 mx-auto" />
                    <div className="text-xs font-medium text-slate-200">
                      {docFile ? docFile.name : "Upload Government ID"}
                    </div>
                    <div className="text-[11px] text-slate-500">PDF, JPG, PNG up to 15MB</div>
                  </div>

                  {/* Photo */}
                  <div
                    onClick={() => photoInputRef.current?.click()}
                    className="p-4 rounded-xl border border-dashed border-slate-700 hover:border-purple-500/50 bg-slate-950/30 cursor-pointer transition text-center space-y-2"
                  >
                    <Camera className="w-5 h-5 text-purple-400 mx-auto" />
                    <div className="text-xs font-medium text-slate-200">
                      {photoFile ? photoFile.name : "Upload Photo / Selfie"}
                    </div>
                    <div className="text-[11px] text-slate-500">JPG, JPEG, PNG</div>
                  </div>
                </div>

                {docFile && photoFile && (
                  <button
                    onClick={handleVerifySignIn}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide uppercase transition shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Verify Identity & Sign In</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {step === "verifying" && (
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white text-center">Executing Identity Verification</h2>
              <div className="space-y-2.5">
                {VERIFICATION_STAGES.map((stg, idx) => {
                  const isDone = verifyProgress[idx];
                  const isCur = activeStepIdx === idx && !isDone;
                  return (
                    <div
                      key={stg.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                        isDone
                          ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-300"
                          : isCur
                          ? "bg-cyan-950/30 border-cyan-500/40 text-cyan-200 animate-pulse"
                          : "bg-slate-950/30 border-slate-800/60 text-slate-500"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isDone ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : isCur ? (
                          <Cpu className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                        )}
                        <span className="font-medium">{stg.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500">{stg.detail}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="p-8 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h2 className="text-lg font-bold text-white">Identity Verified & Signed In</h2>
              <p className="text-xs text-slate-400">Redirecting to your Digital ID Wallet Dashboard...</p>
            </div>
          )}

          {step === "failed" && (
            <div className="p-6 rounded-2xl bg-rose-950/20 border border-rose-800/40 text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-rose-400 mx-auto" />
              <h2 className="text-base font-bold text-white">Verification Failed</h2>
              <p className="text-xs text-slate-400">Could not complete cryptographic identity check.</p>
              <button
                onClick={() => setStep("choose")}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
