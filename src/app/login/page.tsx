"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  Cpu,
  ArrowRight,
  EyeOff,
  FileText,
  Camera,
  Upload,
  X,
  RefreshCw,
  AlertTriangle,
  Fingerprint,
  Sparkles,
  FileImage,
  FileBadge,
  ImagePlus,
  XCircle,
  CreditCard,
  Building2,
  Car,
  Vote,
  FileCheck,
  UserCheck,
  UserPlus,
  BadgeCheck,
} from "lucide-react";
import {
  seedDemoCredentialIfNeeded,
  createGovernmentCredential,
} from "../../lib/credential";
import { GovIdType } from "../../lib/types";

type UploadedFile = {
  file: File;
  name: string;
  size: string;
  type: string;
  previewUrl: string | null;
  progress: number;
};

type VerifyStep =
  | "choose"
  | "upload"
  | "verifying"
  | "success"
  | "failed";

type FailReason =
  | "document_invalid"
  | "photo_unclear"
  | "identity_mismatch"
  | "credential_invalid"
  | "issuer_untrusted"
  | "credential_revoked"
  | null;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

const FAIL_MESSAGES: Record<NonNullable<FailReason>, string> = {
  document_invalid: "The uploaded government ID could not be verified. Please upload a valid document.",
  photo_unclear: "The photo is too blurry or unclear. Please upload a clearer face photo.",
  identity_mismatch: "The identity information in the document does not match the submitted photo.",
  credential_invalid: "The uploaded credential format is not a recognized government identity.",
  issuer_untrusted: "The credential was not signed by a recognized government issuing authority.",
  credential_revoked: "This credential has been revoked or invalidated by the issuing registry.",
};

const GOV_ID_TYPES: { id: GovIdType; name: string; icon: any; badge: string; desc: string }[] = [
  { id: "Aadhaar Card", name: "Aadhaar Card", icon: CreditCard, badge: "12-Digit UID", desc: "UIDAI National Digital Identity" },
  { id: "PAN Card", name: "PAN Card", icon: FileBadge, badge: "10-Char Alphanumeric", desc: "Income Tax Department ID" },
  { id: "Passport", name: "Passport", icon: Building2, badge: "8-Char Travel Doc", desc: "Government-Issued Passport" },
  { id: "Driving Licence", name: "Driving Licence", icon: Car, badge: "State Transport", desc: "Valid Driving Licence Document" },
  { id: "Voter ID", name: "Voter ID", icon: Vote, badge: "EPIC Card", desc: "Election Commission Identity" },
  { id: "Other Government ID", name: "Other Gov ID", icon: FileCheck, badge: "Official Credential", desc: "State or Central Govt Identity" },
];

const VERIFICATION_PIPELINE = [
  { label: "Reading government ID", detail: "Extracting optical & digital metadata securely in memory" },
  { label: "Detecting document type", detail: "Identifying official security markers & layout pattern" },
  { label: "Extracting required identity information", detail: "Sanitizing attributes for local witness generation" },
  { label: "Checking document authenticity", detail: "Verifying tamper-evidence and digital checksums" },
  { label: "Validating document format", detail: "Ensuring government-compliant specifications" },
  { label: "Checking photo quality", detail: "Analyzing face resolution, lighting & pose geometry" },
  { label: "Face/photo matching with the ID where supported", detail: "1:1 biometric facial landmark similarity verification" },
  { label: "Checking identity information consistency", detail: "Ensuring cross-attribute integrity and parity" },
  { label: "Checking issuer/trust status", detail: "Validating trusted public key on CredentialRegistry.sol" },
  { label: "Checking credential status/revocation", detail: "Querying on-chain revocation accumulator" },
  { label: "Creating a Digital Identity Credential", detail: "Minting privacy-preserving W3C/SD-JWT container" },
  { label: "Creating a privacy-preserving credential commitment", detail: "Poseidon BN128 cryptographic blinding commitment" },
  { label: "Generating the user's Zero-Knowledge Identity capability", detail: "Synthesizing SnarkJS Groth16 proving capability" },
];

export default function LoginPage() {
  const router = useRouter();

  // Selected Gov ID type
  const [selectedDocType, setSelectedDocType] = useState<GovIdType>("Aadhaar Card");

  // File states
  const [docFile, setDocFile] = useState<UploadedFile | null>(null);
  const [photoFile, setPhotoFile] = useState<UploadedFile | null>(null);

  // Drag-over states
  const [docDragOver, setDocDragOver] = useState(false);
  const [photoDragOver, setPhotoDragOver] = useState(false);

  // Verification flow
  const [step, setStep] = useState<VerifyStep>("choose");
  const [failReason, setFailReason] = useState<FailReason>(null);

  // Checklist progress
  const [verifyProgress, setVerifyProgress] = useState<boolean[]>(
    Array(VERIFICATION_PIPELINE.length).fill(false)
  );
  const [activeStepIdx, setActiveStepIdx] = useState<number>(-1);

  // Refs for real file inputs
  const docInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    seedDemoCredentialIfNeeded();
  }, []);

  const processFile = (
    file: File,
    isPhoto: boolean,
    setter: (f: UploadedFile | null) => void
  ) => {
    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : null;
    setter({
      file,
      name: file.name,
      size: formatBytes(file.size),
      type: file.type || "application/octet-stream",
      previewUrl,
      progress: 0,
    });

    let prog = 0;
    const interval = setInterval(() => {
      prog += Math.random() * 25 + 15;
      if (prog >= 100) {
        prog = 100;
        clearInterval(interval);
      }
      setter((prev) => (prev ? { ...prev, progress: Math.min(prog, 100) } : null));
    }, 90);
  };

  const handleDocInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file, false, setDocFile);
    e.target.value = "";
  };

  const handleDocDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDocDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file, false, setDocFile);
  }, []);

  const handlePhotoInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file, true, setPhotoFile);
    e.target.value = "";
  };

  const handlePhotoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setPhotoDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file, true, setPhotoFile);
  }, []);

  const canVerify =
    docFile !== null &&
    photoFile !== null &&
    docFile.progress === 100 &&
    photoFile.progress === 100;

  const handleVerify = async () => {
    if (!canVerify) return;
    setStep("verifying");
    setVerifyProgress(Array(VERIFICATION_PIPELINE.length).fill(false));
    setActiveStepIdx(0);

    const stepInterval = 400;
    for (let i = 0; i < VERIFICATION_PIPELINE.length; i++) {
      setActiveStepIdx(i);
      await new Promise((resolve) => setTimeout(resolve, stepInterval));
      setVerifyProgress((prev) => {
        const next = [...prev];
        next[i] = true;
        return next;
      });
    }

    // Anchor government credential
    await createGovernmentCredential(
      selectedDocType,
      "Rahul Kumar",
      "2002-08-12",
      selectedDocType === "Aadhaar Card" ? "XXXX-XXXX-8921" : "ABCDE1234F"
    );

    await new Promise((resolve) => setTimeout(resolve, 300));
    setStep("success");

    setTimeout(() => {
      router.push("/dashboard");
    }, 2800);
  };

  const handleTryAgain = () => {
    setStep("choose");
    setDocFile(null);
    setPhotoFile(null);
    setFailReason(null);
    setVerifyProgress(Array(VERIFICATION_PIPELINE.length).fill(false));
    setActiveStepIdx(-1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <Navbar />

      {/* Hidden real file inputs */}
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        aria-hidden="true"
        onChange={handleDocInputChange}
        id="doc-upload-input"
      />
      <input
        ref={photoInputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        capture="user"
        className="hidden"
        aria-hidden="true"
        onChange={handlePhotoInputChange}
        id="photo-upload-input"
      />

      <main className="flex-1 flex items-start justify-center p-4 sm:p-6 lg:p-8 py-10 relative overflow-hidden">
        {/* Glow bg */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-500/10 via-teal-500/8 to-indigo-600/12 blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-indigo-600/8 blur-[100px] pointer-events-none rounded-full" />

        <div className="w-full max-w-2xl mx-auto relative z-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800/70 text-cyan-300 text-xs font-mono shadow-lg shadow-cyan-950/40">
              <Fingerprint className="w-3.5 h-3.5 text-cyan-400" />
              <span>Government ID + Photo Based Digital Identity Verification</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {step === "choose" && "Access ClaimPass"}
              {step === "upload" && "Verify Your Digital Identity"}
              {step === "verifying" && "Digital Identity Verification"}
              {step === "success" && "Identity Verified Successfully"}
              {step === "failed" && "Verification Failed"}
            </h1>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              {step === "choose" &&
                "ClaimPass uses cryptographic identity documents and selfies instead of passwords, emails, or social logins."}
              {step === "upload" &&
                "Upload your government-issued identity document and selfie to authenticate securely."}
              {step === "verifying" &&
                "Executing visible 13-stage verification pipeline. Your biometric documents never leave this device."}
              {step === "success" &&
                "Digital ID Wallet verified. Redirecting you to your ClaimPass Dashboard…"}
              {step === "failed" &&
                "Verification unsuccessful. Review the checklist below and try again."}
            </p>
          </div>

          {/* ────────────────────────────────────────────────────────── */}
          {/* STEP: CHOOSE PATH (Existing User vs New User)              */}
          {/* ────────────────────────────────────────────────────────── */}
          {step === "choose" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Existing User */}
                <button
                  type="button"
                  onClick={() => setStep("upload")}
                  className="group relative p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-cyan-800/60 hover:border-cyan-400/80 shadow-2xl backdrop-blur-xl text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-cyan-500/10 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-cyan-400">
                        Existing User
                      </span>
                      <h2 className="text-xl font-black text-white mt-0.5">Verify &amp; Sign In</h2>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Sign in by verifying your government ID document and photo. No passwords or seed phrases required.
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-xs font-bold text-cyan-400 group-hover:gap-3 transition-all">
                    <span>Continue to Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>

                {/* New User */}
                <button
                  type="button"
                  onClick={() => router.push("/register")}
                  className="group relative p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-indigo-800/60 hover:border-indigo-400/80 shadow-2xl backdrop-blur-xl text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-indigo-500/10 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                      <UserPlus className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-indigo-400">
                        New User
                      </span>
                      <h2 className="text-xl font-black text-white mt-0.5">Create an Account</h2>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        Verify your government identity once to issue your ClaimPass Digital ID Wallet and enable ZK proofs.
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-xs font-bold text-indigo-400 group-hover:gap-3 transition-all">
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              </div>

              {/* Security Banner */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 font-mono flex items-start gap-3">
                <Lock className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-slate-200">Zero-Password Guarantee:</strong> ClaimPass never stores credentials in centralized databases. Digital identity verification replaces traditional logins with zero-knowledge cryptographic proofs.
                </p>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* STEP: UPLOAD GOVERNMENT ID & PHOTO                         */}
          {/* ────────────────────────────────────────────────────────── */}
          {step === "upload" && (
            <div className="space-y-6">
              {/* Back to chooser */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("choose")}
                  className="text-xs font-mono text-slate-400 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  ← Back to options
                </button>
                <span className="text-xs font-mono text-cyan-400">Existing User Verification</span>
              </div>

              {/* Government ID Type Selector */}
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl p-5 sm:p-6 backdrop-blur-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400" />
                      Select Government Identity Document Type
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Supported: Aadhaar Card, PAN Card, Passport, Driving Licence, Voter ID
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-cyan-950 border border-cyan-800 text-[11px] font-mono text-cyan-300 font-semibold">
                    Input 1 of 2
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                  {GOV_ID_TYPES.map((t) => {
                    const Icon = t.icon;
                    const isSelected = selectedDocType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedDocType(t.id)}
                        className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? "bg-cyan-500/15 border-cyan-500 shadow-md shadow-cyan-500/10"
                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-4 h-4 ${isSelected ? "text-cyan-400" : "text-slate-400"}`} />
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                              isSelected ? "bg-cyan-500/30 text-cyan-200" : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {t.badge}
                          </span>
                        </div>
                        <div>
                          <p className={`text-xs font-bold leading-tight ${isSelected ? "text-white" : "text-slate-300"}`}>
                            {t.name}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{t.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 1 — Upload Government ID */}
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl p-6 sm:p-8 backdrop-blur-xl space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <FileBadge className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Step 1 — Upload Government ID ({selectedDocType})
                    </h2>
                    <p className="text-xs text-slate-400">
                      Upload your official {selectedDocType} (PDF, JPG, JPEG, PNG)
                    </p>
                  </div>
                  {docFile?.progress === 100 && (
                    <span className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                    </span>
                  )}
                </div>

                {!docFile ? (
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={`Click to upload ${selectedDocType}`}
                    onClick={() => docInputRef.current?.click()}
                    onKeyDown={(e) => e.key === "Enter" && docInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDocDragOver(true);
                    }}
                    onDragLeave={() => setDocDragOver(false)}
                    onDrop={handleDocDrop}
                    className={`relative flex flex-col items-center justify-center gap-3 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all select-none ${
                      docDragOver
                        ? "border-cyan-400 bg-cyan-500/8 scale-[1.01]"
                        : "border-slate-700 hover:border-cyan-500/60 hover:bg-cyan-500/5"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <Upload className="w-7 h-7" />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-white text-sm">
                        📄 Click to Upload Government ID ({selectedDocType})
                      </p>
                      <p className="text-xs text-slate-400 mt-1">or drag and drop here</p>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {["PDF", "JPG", "JPEG", "PNG"].map((fmt) => (
                        <span
                          key={fmt}
                          className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300"
                        >
                          {fmt}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Opens real system file picker • Max file size: 10 MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                      {docFile.previewUrl ? (
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-cyan-500/30 shrink-0">
                          <img
                            src={docFile.previewUrl}
                            alt="Document preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white truncate">{docFile.name}</p>
                          <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-[10px] font-mono text-cyan-300 shrink-0">
                            {selectedDocType}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-[11px] font-mono text-slate-400">
                          <span>{docFile.type.split("/")[1]?.toUpperCase() || "DOCUMENT"}</span>
                          <span>•</span>
                          <span>{docFile.size}</span>
                        </div>
                        {docFile.progress < 100 ? (
                          <div className="mt-2">
                            <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-200 rounded-full"
                                style={{ width: `${docFile.progress}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1">
                              {Math.round(docFile.progress)}% uploaded…
                            </p>
                          </div>
                        ) : (
                          <p className="text-[11px] text-emerald-400 mt-1 font-semibold">
                            ✓ Document ready for verification
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => setDocFile(null)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors shrink-0"
                        title="Remove document"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <button
                        onClick={() => docInputRef.current?.click()}
                        className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Replace Document
                      </button>
                      <span className="text-slate-700">|</span>
                      <button
                        onClick={() => setDocFile(null)}
                        className="flex items-center gap-1.5 text-rose-400 hover:text-rose-300 transition-colors font-semibold"
                      >
                        <X className="w-3.5 h-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2 — Upload Photo / Selfie */}
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl p-6 sm:p-8 backdrop-blur-xl space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Step 2 — Upload Photo / Selfie</h2>
                    <p className="text-xs text-slate-400">
                      Clear face photo or selfie for matching (JPG, JPEG, PNG)
                    </p>
                  </div>
                  {photoFile?.progress === 100 && (
                    <span className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                    </span>
                  )}
                </div>

                {!photoFile ? (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label="Click to upload clear face photo or selfie"
                      onClick={() => photoInputRef.current?.click()}
                      onKeyDown={(e) => e.key === "Enter" && photoInputRef.current?.click()}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setPhotoDragOver(true);
                      }}
                      onDragLeave={() => setPhotoDragOver(false)}
                      onDrop={handlePhotoDrop}
                      className={`flex-1 flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all select-none ${
                        photoDragOver
                          ? "border-teal-400 bg-teal-500/8 scale-[1.01]"
                          : "border-slate-700 hover:border-teal-500/60 hover:bg-teal-500/5"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
                        <ImagePlus className="w-7 h-7" />
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-white text-sm">📷 Click to Upload Photo / Selfie</p>
                        <p className="text-xs text-slate-400 mt-1">or drag and drop here</p>
                      </div>
                      <div className="flex gap-2">
                        {["JPG", "JPEG", "PNG"].map((fmt) => (
                          <span
                            key={fmt}
                            className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300"
                          >
                            {fmt}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.capture = "user";
                        input.onchange = (e) => {
                          const f = (e.target as HTMLInputElement).files?.[0];
                          if (f) processFile(f, true, setPhotoFile);
                        };
                        input.click();
                      }}
                      className="sm:w-32 flex flex-col items-center justify-center gap-2.5 p-5 rounded-2xl border border-dashed border-slate-700 hover:border-teal-500/60 hover:bg-teal-500/5 cursor-pointer transition-all text-slate-400 hover:text-teal-400"
                    >
                      <Camera className="w-7 h-7" />
                      <span className="text-xs font-semibold text-center leading-tight">
                        Take<br />Photo
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    {photoFile.previewUrl ? (
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-teal-500/40 shrink-0">
                        <img
                          src={photoFile.previewUrl}
                          alt="Identity photo preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 shrink-0">
                        <FileImage className="w-8 h-8" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <p className="text-sm font-semibold text-white truncate">{photoFile.name}</p>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
                        <span>{photoFile.type.split("/")[1]?.toUpperCase() || "IMAGE"}</span>
                        <span>•</span>
                        <span>{photoFile.size}</span>
                      </div>
                      {photoFile.progress < 100 ? (
                        <div>
                          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 transition-all duration-200 rounded-full"
                              style={{ width: `${photoFile.progress}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-500 mt-1">
                            {Math.round(photoFile.progress)}% uploaded…
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-emerald-400 font-semibold">✓ Photo ready</p>
                      )}
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          onClick={() => photoInputRef.current?.click()}
                          className="flex items-center gap-1.5 text-[11px] text-teal-400 hover:text-teal-300 font-semibold transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" /> Replace Photo
                        </button>
                        <span className="text-slate-700">|</span>
                        <button
                          onClick={() => setPhotoFile(null)}
                          className="flex items-center gap-1.5 text-[11px] text-rose-400 hover:text-rose-300 font-semibold transition-colors"
                        >
                          <X className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3 CTA — Verify & Sign In */}
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl p-6 sm:p-8 backdrop-blur-xl space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 text-xs">
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 transition-colors ${
                      docFile?.progress === 100
                        ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-400"
                        : "bg-slate-950/40 border-slate-800 text-slate-500"
                    }`}
                  >
                    {docFile?.progress === 100 ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
                    )}
                    <span className="font-semibold">{selectedDocType}</span>
                    {docFile?.progress === 100 && (
                      <span className="ml-auto font-mono truncate max-w-[100px]">
                        {docFile.name.slice(0, 14)}…
                      </span>
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 transition-colors ${
                      photoFile?.progress === 100
                        ? "bg-emerald-950/30 border-emerald-800/60 text-emerald-400"
                        : "bg-slate-950/40 border-slate-800 text-slate-500"
                    }`}
                  >
                    {photoFile?.progress === 100 ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-600 shrink-0" />
                    )}
                    <span className="font-semibold">User Photo / Selfie</span>
                    {photoFile?.progress === 100 && (
                      <span className="ml-auto font-mono truncate max-w-[100px]">
                        {photoFile.name.slice(0, 14)}…
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleVerify}
                  disabled={!canVerify}
                  className={`w-full py-4 rounded-2xl font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2.5 ${
                    canVerify
                      ? "bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 shadow-cyan-500/25 hover:scale-[1.01] active:scale-[0.99]"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-60"
                  }`}
                >
                  {canVerify ? (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Verify &amp; Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Upload Government ID and Photo to continue</span>
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-slate-500 leading-relaxed font-mono">
                  All verification runs locally. Private {selectedDocType} &amp; face photo are{" "}
                  <strong className="text-slate-400">never stored on the blockchain</strong>.
                </p>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* STEP: VERIFYING (Visible 13-stage pipeline)                 */}
          {/* ────────────────────────────────────────────────────────── */}
          {step === "verifying" && (
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
              <div className="text-center space-y-3 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto animate-pulse">
                  <Cpu className="w-8 h-8 animate-spin" />
                </div>
                <h2 className="text-2xl font-black text-white">Digital Identity Verification</h2>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Running visible 13-stage verification process for {selectedDocType} + photo. Your data never leaves this device.
                </p>
              </div>

              <div className="space-y-2.5 p-5 rounded-2xl bg-slate-950/80 border border-slate-800 font-mono text-xs max-h-[460px] overflow-y-auto">
                {VERIFICATION_PIPELINE.map((s, i) => {
                  const done = verifyProgress[i];
                  const active = activeStepIdx === i && !done;
                  return (
                    <div
                      key={i}
                      className={`flex items-center gap-3 py-2 px-3 rounded-xl transition-all duration-200 ${
                        done
                          ? "bg-emerald-950/30 border border-emerald-800/50"
                          : active
                          ? "bg-cyan-950/40 border border-cyan-700/60 shadow-md shadow-cyan-950/50"
                          : "border border-transparent opacity-40"
                      }`}
                    >
                      <div className="shrink-0">
                        {done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : active ? (
                          <Cpu className="w-4 h-4 text-cyan-400 animate-spin" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] text-slate-500">
                            {i + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-bold text-xs ${
                            done ? "text-emerald-300" : active ? "text-cyan-300" : "text-slate-500"
                          }`}
                        >
                          Step {i + 1} — {s.label}
                        </p>
                        {(active || done) && (
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">{s.detail}</p>
                        )}
                      </div>
                      <span
                        className={`text-xs font-semibold shrink-0 ${
                          done ? "text-emerald-400" : active ? "text-cyan-400 animate-pulse" : "text-slate-700"
                        }`}
                      >
                        {done ? "Verified ✓" : active ? "Processing..." : "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Zero-knowledge execution — raw identity documents never leave device</span>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* STEP: SUCCESS (Exact 8-field verification display)          */}
          {/* ────────────────────────────────────────────────────────── */}
          {step === "success" && (
            <div className="rounded-3xl bg-slate-900/90 border border-emerald-800/40 shadow-2xl p-8 sm:p-10 backdrop-blur-xl text-center space-y-6">
              <div className="relative inline-block mx-auto">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center shadow-2xl shadow-emerald-500/25">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-cyan-400 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-slate-950" />
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-black text-white">Identity Verified Successfully</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Digital ID Wallet authenticated • Redirecting to ClaimPass Dashboard…
                </p>
              </div>

              {/* Exact 8 verification items */}
              <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs font-mono space-y-3 text-left">
                {[
                  { label: "Government ID", value: "Verified ✓", color: "text-emerald-400" },
                  { label: "Photo", value: "Verified ✓", color: "text-emerald-400" },
                  { label: "Identity Match", value: "Verified ✓", color: "text-emerald-400" },
                  { label: "Issuer", value: "Trusted ✓ (UIDAI / Government Authority)", color: "text-emerald-400" },
                  { label: "Credential", value: "Active ✓", color: "text-emerald-400" },
                  { label: "Digital Identity", value: "Created ✓", color: "text-emerald-400" },
                  { label: "Privacy Protection", value: "Enabled 🔒 (Poseidon Commitment)", color: "text-cyan-400" },
                  { label: "ZK Identity Capability", value: "Ready ⚡ (Circom + SnarkJS Groth16)", color: "text-cyan-400" },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between border-b border-slate-800/60 pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-slate-400">{row.label}:</span>
                    <span className={`font-bold ${row.color}`}>{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-mono">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Entering dashboard with active Digital ID Wallet…
              </div>

              <button
                onClick={() => router.push("/dashboard")}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25"
              >
                Enter Dashboard Now →
              </button>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* STEP: FAILED                                               */}
          {/* ────────────────────────────────────────────────────────── */}
          {step === "failed" && (
            <div className="rounded-3xl bg-slate-900/90 border border-rose-800/40 shadow-2xl p-8 sm:p-10 backdrop-blur-xl text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-rose-500/15 border-2 border-rose-600 text-rose-400 flex items-center justify-center mx-auto shadow-xl">
                <XCircle className="w-10 h-10" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Identity Verification Failed ✕</h2>
                {failReason && (
                  <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 text-left">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-rose-300">{FAIL_MESSAGES[failReason]}</p>
                  </div>
                )}
              </div>
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono space-y-2.5 text-left">
                <p className="text-slate-400 text-[11px] uppercase font-bold tracking-wider mb-3">
                  Possible Check Failures:
                </p>
                {[
                  "Government ID image resolution was unreadable",
                  "User selfie does not match the photo on the government document",
                  "Document format or checksum failed authenticity test",
                  "Issuing authority key or revocation status check failed",
                ].map((r) => (
                  <div key={r} className="flex items-start gap-2 text-slate-400">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleTryAgain}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
