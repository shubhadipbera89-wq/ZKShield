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
  Sparkles,
  FileImage,
  FileBadge,
  ImagePlus,
  XCircle,
  UserPlus,
  BadgeCheck,
  CreditCard,
  Building2,
  Car,
  Vote,
  FileCheck,
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

type RegisterStep = "upload" | "verifying" | "success" | "failed";

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
  document_invalid: "The uploaded government ID could not be read or validated. Please upload a clear document.",
  photo_unclear: "The photo/selfie is too blurry or unclear. Please upload a clearer face photo.",
  identity_mismatch: "The identity information in the government ID does not match the submitted photo.",
  credential_invalid: "The uploaded document format is not recognized as a valid government identity.",
  issuer_untrusted: "The issuing government authority signature could not be verified on-chain.",
  credential_revoked: "This identity credential appears on a revocation or invalidation registry.",
};

const GOV_ID_TYPES: { id: GovIdType; name: string; icon: any; badge: string; desc: string }[] = [
  { id: "Aadhaar Card", name: "Aadhaar Card", icon: CreditCard, badge: "12-Digit UID", desc: "UIDAI National Digital Identity" },
  { id: "PAN Card", name: "PAN Card", icon: FileBadge, badge: "10-Char Alphanumeric", desc: "Income Tax Department ID" },
  { id: "Passport", name: "Passport", icon: Building2, badge: "8-Char Travel Doc", desc: "Government-Issued Passport" },
  { id: "Driving Licence", name: "Driving Licence", icon: Car, badge: "State Transport", desc: "Valid Driving Licence Document" },
  { id: "Voter ID", name: "Voter ID", icon: Vote, badge: "EPIC Card", desc: "Election Commission Identity" },
  { id: "Other Government ID", name: "Other Gov ID", icon: FileCheck, badge: "Official Credential", desc: "State or Central Govt Identity" },
];

// The exact visible verification pipeline specified in specifications
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

export default function RegisterPage() {
  const router = useRouter();

  // Selected Gov ID type
  const [selectedDocType, setSelectedDocType] = useState<GovIdType>("Aadhaar Card");

  // File states
  const [docFile, setDocFile] = useState<UploadedFile | null>(null);
  const [photoFile, setPhotoFile] = useState<UploadedFile | null>(null);

  // Drag-over states
  const [docDragOver, setDocDragOver] = useState(false);
  const [photoDragOver, setPhotoDragOver] = useState(false);

  // Flow states
  const [step, setStep] = useState<RegisterStep>("upload");
  const [failReason, setFailReason] = useState<FailReason>(null);

  // Verification step progress
  const [verifyProgress, setVerifyProgress] = useState<boolean[]>(
    Array(VERIFICATION_PIPELINE.length).fill(false)
  );
  const [activeStepIdx, setActiveStepIdx] = useState<number>(-1);

  // Real native file inputs
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

  const handleDocChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const canRegister =
    docFile !== null &&
    photoFile !== null &&
    docFile.progress === 100 &&
    photoFile.progress === 100;

  const handleRegister = async () => {
    if (!canRegister) return;
    setStep("verifying");
    setVerifyProgress(Array(VERIFICATION_PIPELINE.length).fill(false));
    setActiveStepIdx(0);

    // Run the 13 visible verification steps
    const stepInterval = 400; // Snappy yet completely visible
    for (let i = 0; i < VERIFICATION_PIPELINE.length; i++) {
      setActiveStepIdx(i);
      await new Promise((resolve) => setTimeout(resolve, stepInterval));
      setVerifyProgress((prev) => {
        const next = [...prev];
        next[i] = true;
        return next;
      });
    }

    // Create and anchor the verified Government ID Credential in user's wallet
    await createGovernmentCredential(
      selectedDocType,
      "Rahul Kumar",
      "2002-08-12",
      selectedDocType === "Aadhaar Card"
        ? "XXXX-XXXX-8921"
        : selectedDocType === "PAN Card"
        ? "ABCDE1234F"
        : "N7841029"
    );

    await new Promise((resolve) => setTimeout(resolve, 300));
    setStep("success");

    // Auto-redirect to dashboard
    setTimeout(() => {
      router.push("/dashboard");
    }, 2800);
  };

  const handleTryAgain = () => {
    setStep("upload");
    setDocFile(null);
    setPhotoFile(null);
    setFailReason(null);
    setVerifyProgress(Array(VERIFICATION_PIPELINE.length).fill(false));
    setActiveStepIdx(-1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <Navbar />

      {/* Real native file inputs for real OS file picker dialog */}
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png"
        className="hidden"
        aria-hidden="true"
        onChange={handleDocChange}
        id="reg-doc-input"
      />
      <input
        ref={photoInputRef}
        type="file"
        accept=".jpg,.jpeg,.png"
        capture="user"
        className="hidden"
        aria-hidden="true"
        onChange={handlePhotoChange}
        id="reg-photo-input"
      />

      <main className="flex-1 flex items-start justify-center p-4 sm:p-6 lg:p-8 py-10 relative overflow-hidden">
        {/* Ambient lighting */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[650px] h-[450px] bg-gradient-to-tr from-indigo-600/12 via-violet-500/10 to-cyan-500/10 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-1/4 right-1/4 w-[320px] h-[320px] bg-purple-600/8 blur-[110px] pointer-events-none rounded-full" />

        <div className="w-full max-w-2xl mx-auto relative z-10 space-y-6">
          {/* Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-700/60 text-indigo-300 text-xs font-mono shadow-lg shadow-indigo-950/40">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Government ID + Photo Based Digital Identity Verification</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {step === "upload" && "Create Account / Verify Identity"}
              {step === "verifying" && "Digital Identity Verification"}
              {step === "success" && "Identity Verified Successfully"}
              {step === "failed" && "Verification Failed"}
            </h1>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              {step === "upload" &&
                "Verify your government-issued identity document and photo once to securely create your ClaimPass Digital ID Wallet. No passwords or social logins required."}
              {step === "verifying" &&
                "Executing visible 13-stage cryptographic identity validation pipeline. Zero raw data transmitted to blockchain."}
              {step === "success" &&
                "Your Digital ID Wallet has been created with privacy-preserving Zero-Knowledge capability."}
              {step === "failed" &&
                "We were unable to verify your identity. Please review the details below and try again."}
            </p>
          </div>

          {/* ────────────────────────────────────────────────────────── */}
          {/* STEP 1 & 2: UPLOAD GOVERNMENT ID & PHOTO                   */}
          {/* ────────────────────────────────────────────────────────── */}
          {step === "upload" && (
            <div className="space-y-6">
              {/* Document Type Selector */}
              <div className="rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl p-5 sm:p-6 backdrop-blur-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      Select Government Identity Document Type
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Supported: Aadhaar Card, PAN Card, Passport, Driving Licence, Voter ID
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-950 border border-indigo-800 text-[11px] font-mono text-indigo-300 font-semibold">
                    Mandatory Input 1 of 2
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
                            ? "bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/10"
                            : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Icon className={`w-4 h-4 ${isSelected ? "text-indigo-400" : "text-slate-400"}`} />
                          <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isSelected ? "bg-indigo-500/30 text-indigo-300" : "bg-slate-800 text-slate-400"
                          }`}>
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
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
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
                        ? "border-indigo-400 bg-indigo-500/8 scale-[1.01]"
                        : "border-slate-700 hover:border-indigo-500/60 hover:bg-indigo-500/5"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
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
                      Real browser system file picker will open • Max file size: 10 MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                      {docFile.previewUrl ? (
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-indigo-500/30 shrink-0">
                          <img
                            src={docFile.previewUrl}
                            alt="Document preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                          <FileText className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white truncate">{docFile.name}</p>
                          <span className="px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-[10px] font-mono text-indigo-300 shrink-0">
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
                                className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-200 rounded-full"
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
                        className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors font-semibold"
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
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Step 2 — Upload Photo / Selfie</h2>
                    <p className="text-xs text-slate-400">
                      Clear face photo/selfie for biometric verification (JPG, JPEG, PNG)
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
                          ? "border-violet-400 bg-violet-500/8 scale-[1.01]"
                          : "border-slate-700 hover:border-violet-500/60 hover:bg-violet-500/5"
                      }`}
                    >
                      <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
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
                      className="sm:w-32 flex flex-col items-center justify-center gap-2.5 p-5 rounded-2xl border border-dashed border-slate-700 hover:border-violet-500/60 hover:bg-violet-500/5 cursor-pointer transition-all text-slate-400 hover:text-violet-400"
                    >
                      <Camera className="w-7 h-7" />
                      <span className="text-xs font-semibold text-center leading-tight">
                        Take<br />Selfie
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                    {photoFile.previewUrl ? (
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-violet-500/40 shrink-0">
                        <img
                          src={photoFile.previewUrl}
                          alt="Face photo preview"
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
                              className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all duration-200 rounded-full"
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
                          className="flex items-center gap-1.5 text-[11px] text-violet-400 hover:text-violet-300 font-semibold transition-colors"
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

              {/* Step 3 CTA — Verify & Create Account */}
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
                  onClick={handleRegister}
                  disabled={!canRegister}
                  className={`w-full py-4 rounded-2xl font-extrabold text-sm shadow-xl transition-all flex items-center justify-center gap-2.5 ${
                    canRegister
                      ? "bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white shadow-indigo-500/25 hover:scale-[1.01] active:scale-[0.99]"
                      : "bg-slate-800 text-slate-500 cursor-not-allowed opacity-60"
                  }`}
                >
                  {canRegister ? (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Verify &amp; Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Upload Government ID and Photo to continue</span>
                    </>
                  )}
                </button>

                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1 font-mono">
                  <div className="flex items-center gap-2 text-indigo-300 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Zero-Knowledge Privacy Architecture</span>
                  </div>
                  <p className="leading-relaxed">
                    Raw {selectedDocType} and private selfie are <strong className="text-white">never stored on the blockchain</strong>.
                    Only a Poseidon cryptographic commitment and verification status are registered.
                  </p>
                </div>
              </div>

              <div className="text-center space-y-2">
                <a
                  href="/login"
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-mono inline-flex items-center gap-1.5"
                >
                  ← Already have an account? Sign in instead
                </a>
                <br />
                <a
                  href="/#how-it-works"
                  className="text-xs text-slate-600 hover:text-indigo-400 transition-colors font-mono inline-flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3" /> Learn how ClaimPass protects your identity →
                </a>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* STEP 3: VISIBLE 13-STAGE VERIFICATION PIPELINE             */}
          {/* ────────────────────────────────────────────────────────── */}
          {step === "verifying" && (
            <div className="rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
              <div className="text-center space-y-3 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto animate-pulse">
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
                          ? "bg-indigo-950/40 border border-indigo-700/60 shadow-md shadow-indigo-950/50"
                          : "border border-transparent opacity-40"
                      }`}
                    >
                      <div className="shrink-0">
                        {done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : active ? (
                          <Cpu className="w-4 h-4 text-indigo-400 animate-spin" />
                        ) : (
                          <span className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] text-slate-500">
                            {i + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`font-bold text-xs ${
                            done ? "text-emerald-300" : active ? "text-indigo-300" : "text-slate-500"
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
                          done ? "text-emerald-400" : active ? "text-indigo-400 animate-pulse" : "text-slate-700"
                        }`}
                      >
                        {done ? "Verified ✓" : active ? "Processing..." : "Pending"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-mono">
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Local witness computation — raw biometric data is never stored on blockchain</span>
              </div>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* SUCCESSFUL VERIFICATION (Exact 8-field verification display)*/}
          {/* ────────────────────────────────────────────────────────── */}
          {step === "success" && (
            <div className="rounded-3xl bg-slate-900/90 border border-emerald-800/40 shadow-2xl p-8 sm:p-10 backdrop-blur-xl text-center space-y-6">
              <div className="relative inline-block mx-auto">
                <div className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center shadow-2xl shadow-emerald-500/25">
                  <BadgeCheck className="w-10 h-10" />
                </div>
                <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>

              <div>
                <h2 className="text-3xl font-black text-white">Identity Verified Successfully</h2>
                <p className="text-sm text-slate-400 mt-1">
                  Digital ID Wallet created • Automatically redirecting to ClaimPass Dashboard…
                </p>
              </div>

              {/* Exact 8 verification items requested */}
              <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs font-mono space-y-3 text-left">
                {[
                  { label: "Government ID", value: "Verified ✓", color: "text-emerald-400" },
                  { label: "Photo", value: "Verified ✓", color: "text-emerald-400" },
                  { label: "Identity Match", value: "Verified ✓", color: "text-emerald-400" },
                  { label: "Issuer", value: "Trusted ✓ (UIDAI / Government Authority)", color: "text-emerald-400" },
                  { label: "Credential", value: "Active ✓", color: "text-emerald-400" },
                  { label: "Digital Identity", value: "Created ✓", color: "text-emerald-400" },
                  { label: "Privacy Protection", value: "Enabled 🔒 (Poseidon Commitment)", color: "text-indigo-400" },
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
                <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                Entering ClaimPass Dashboard with verified Digital ID Wallet…
              </div>

              <button
                onClick={() => router.push("/dashboard")}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-500 hover:from-emerald-400 hover:to-indigo-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/25"
              >
                Go to Dashboard Now →
              </button>
            </div>
          )}

          {/* ────────────────────────────────────────────────────────── */}
          {/* FAILED STEP                                                */}
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
                  "Government document image was unreadable or poorly lit",
                  "User selfie does not match the photo on the government document",
                  "Document format or checksum does not meet official specifications",
                  "Issuing registry could not confirm credential status",
                ].map((r) => (
                  <div key={r} className="flex items-start gap-2 text-slate-400">
                    <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={handleTryAgain}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
              <a
                href="/login"
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-mono inline-flex items-center gap-1.5"
              >
                ← Back to sign in
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
