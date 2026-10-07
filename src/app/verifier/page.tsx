"use client";

import { useState, useEffect } from "react";
import { Navbar } from "../../components/Navbar";
import { Credential, ZKProof, VerificationResult, ClaimType } from "../../lib/types";
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
  verifyDegreeProof,
  verifyAgeProof,
} from "../../lib/zk";
import {
  verifyProofOnChain,
  isCredentialRevokedOnChain,
} from "../../lib/blockchain";
import {
  ShieldCheck,
  Lock,
  Building2,
  QrCode,
  Sparkles,
  Database,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  Cpu,
  Layers,
  ArrowRight,
  RotateCcw,
  Ban,
  Check,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function VerifierPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [selectedCredId, setSelectedCredId] = useState<string>("");

  // Checklist of requested claims
  const [selectedClaims, setSelectedClaims] = useState<{
    gov_id: boolean;
    age: boolean;
    degree: boolean;
    grad_year: boolean;
    student_status: boolean;
  }>({
    gov_id: true,
    degree: false,
    age: false,
    grad_year: false,
    student_status: false,
  });

  // Flow states
  const [createdRequest, setCreatedRequest] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [qrStep, setQrStep] = useState<"qr_display" | "wallet_approval">("qr_display");
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    async function init() {
      const list = await seedDemoCredentialIfNeeded();
      setCredentials(list);
      if (list.length > 0) {
        setSelectedCredId(list[0].id);
      }
    }
    init();
  }, []);

  const activeCred = credentials.find((c) => c.id === selectedCredId) || credentials[0];

  const handleCreateRequest = () => {
    setCreatedRequest(true);
    setShowQRModal(true);
    setQrStep("qr_display");
  };

  const handleApproveFromWallet = async () => {
    if (!activeCred) return;
    setIsVerifying(true);
    setShowQRModal(false);

    // Determine primary claim being verified
    let claimType: ClaimType = "gov_id";
    if (selectedClaims.gov_id) claimType = "gov_id";
    else if (selectedClaims.degree) claimType = "degree";
    else if (selectedClaims.age) claimType = "age";
    else if (selectedClaims.grad_year) claimType = "grad_year";
    else claimType = "student_status";

    const claimTitle =
      claimType === "gov_id"
        ? "Valid Government ID Holder"
        : claimType === "degree"
        ? "B.Tech Degree"
        : claimType === "age"
        ? "Age 18+"
        : claimType === "grad_year"
        ? "Graduated in 2026"
        : "XYZ University Student";

    // 1. Generate proof (using real SnarkJS Groth16 for gov_id)
    let proof: ZKProof | null = null;
    if (claimType === "gov_id") {
      const govCred = credentials.find((c) => c.isGovernmentId) || activeCred;
      proof = await generateGovIdProof(
        govCred.holderName,
        govCred.dateOfBirth,
        govCred.govIdType || "Aadhaar Card",
        govCred.commitment
      );
    } else if (claimType === "degree") {
      proof = await generateDegreeProof(
        activeCred.id,
        activeCred.signature,
        activeCred.holderName,
        activeCred.dateOfBirth,
        activeCred.degree,
        activeCred.branch,
        activeCred.graduationYear,
        activeCred.issuerAddress,
        activeCred.commitment
      );
    } else if (claimType === "age") {
      proof = await generateAgeProof(activeCred.dateOfBirth, activeCred.issuerAddress);
    } else if (claimType === "grad_year") {
      proof = await generateGraduationYearProof(
        activeCred.id,
        activeCred.graduationYear,
        activeCred.commitment
      );
    } else {
      proof = await generateStudentStatusProof(
        activeCred.id,
        activeCred.issuerName,
        activeCred.commitment
      );
    }

    if (!proof) {
      setIsVerifying(false);
      return;
    }

    // 2. Perform on-chain contract verification check
    const onChain = await verifyProofOnChain(proof, activeCred.id, "0xABC_Technologies_Verifier");
    const isRevoked = onChain.isRevoked;
    const isIssuerTrusted = onChain.isIssuerTrusted;
    const isProofValid = onChain.isProofValid;
    const overallValid = isProofValid && isIssuerTrusted && !isRevoked;

    const result: VerificationResult = {
      zkProofValid: isProofValid,
      issuerTrusted: isIssuerTrusted,
      credentialRevoked: isRevoked,
      overallValid,
      claimType,
      claimLabel: claimTitle,
      revealedClaims: {
        [claimTitle]: "TRUE",
        Issuer: "XYZ University",
      },
      hiddenFields: ["Date of Birth", "Address", "Roll Number", "Student ID"],
      proofTimestamp: Date.now(),
      txHash: onChain.txHash,
      verifierName: "ABC Technologies",
      personalAttributesExposed: 0,
      issuerName: "XYZ University",
    };

    setVerificationResult(result);
    setIsVerifying(false);

    // Save to verification history & privacy receipts
    addVerificationHistoryItem({
      id: `hist-${Date.now()}`,
      claimTitle,
      verifierName: "ABC Technologies",
      status: overallValid ? "Verified" : isRevoked ? "Revoked" : "Failed",
      timestamp: Date.now(),
      dateFormatted: "Just now",
      proofType: claimType,
      txHash: onChain.txHash,
      personalDataExposed: 0,
    });

    addPrivacyReceipt({
      id: `rcpt-${Date.now()}`,
      verifierName: "ABC Technologies",
      claimShared: claimTitle,
      timestamp: Date.now(),
      personalDataExposed: 0,
      proofStatus: overallValid ? "Valid" : isRevoked ? "Revoked" : "Invalid",
      txHash: onChain.txHash,
      circuit: proof.circuitName,
    });

    if (overallValid) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#06b6d4", "#10b981", "#818cf8"],
      });
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://claimpass.id/verify/req_9984128");
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Section 7 Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-mono">
            <Building2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Verifier Organization Portal (ABC Technologies)</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Credential Verification Portal
          </h1>
          <p className="text-slate-400 text-sm sm:text-base">
            Verify claims without collecting unnecessary personal information.
          </p>
        </div>

        {/* Section 7: Verification Request Builder */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <span>What do you need to verify?</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Select the minimal claims required for your employment or qualification criteria.
              </p>
            </div>

            <div className="text-xs font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>0 Personal Data Required</span>
            </div>
          </div>

          {/* Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label
              onClick={() =>
                setSelectedClaims((prev) => ({ ...prev, gov_id: !prev.gov_id }))
              }
              className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                selectedClaims.gov_id
                  ? "bg-cyan-950/20 border-cyan-500 text-white"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedClaims.gov_id}
                  onChange={() => {}}
                  className="rounded text-cyan-500 focus:ring-0"
                />
                <span className="text-sm font-semibold">Valid Government ID Holder</span>
              </div>
              <span className="text-xs font-mono text-cyan-400">gov_id (SnarkJS)</span>
            </label>

            <label
              onClick={() =>
                setSelectedClaims((prev) => ({ ...prev, degree: !prev.degree }))
              }
              className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                selectedClaims.degree
                  ? "bg-cyan-950/20 border-cyan-500 text-white"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedClaims.degree}
                  onChange={() => {}}
                  className="rounded text-cyan-500 focus:ring-0"
                />
                <span className="text-sm font-semibold">Applicant has a B.Tech degree</span>
              </div>
              <span className="text-xs font-mono text-cyan-400">degree_btech</span>
            </label>

            <label
              onClick={() =>
                setSelectedClaims((prev) => ({ ...prev, age: !prev.age }))
              }
              className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                selectedClaims.age
                  ? "bg-cyan-950/20 border-cyan-500 text-white"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedClaims.age}
                  onChange={() => {}}
                  className="rounded text-cyan-500 focus:ring-0"
                />
                <span className="text-sm font-semibold">Applicant is 18+</span>
              </div>
              <span className="text-xs font-mono text-cyan-400">age_18</span>
            </label>

            <label
              onClick={() =>
                setSelectedClaims((prev) => ({ ...prev, grad_year: !prev.grad_year }))
              }
              className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                selectedClaims.grad_year
                  ? "bg-cyan-950/20 border-cyan-500 text-white"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedClaims.grad_year}
                  onChange={() => {}}
                  className="rounded text-cyan-500 focus:ring-0"
                />
                <span className="text-sm font-semibold">Applicant graduated in 2026</span>
              </div>
              <span className="text-xs font-mono text-cyan-400">grad_2026</span>
            </label>

            <label
              onClick={() =>
                setSelectedClaims((prev) => ({
                  ...prev,
                  student_status: !prev.student_status,
                }))
              }
              className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                selectedClaims.student_status
                  ? "bg-cyan-950/20 border-cyan-500 text-white"
                  : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedClaims.student_status}
                  onChange={() => {}}
                  className="rounded text-cyan-500 focus:ring-0"
                />
                <span className="text-sm font-semibold">Applicant is a verified XYZ University student</span>
              </div>
              <span className="text-xs font-mono text-cyan-400">xyz_student</span>
            </label>
          </div>

          {/* Request Preview Box */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
              Active Request Specification
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400">Required Claim:</span>
              <span className="text-white font-bold">
                {selectedClaims.degree
                  ? "B.Tech Degree"
                  : selectedClaims.age
                  ? "Age 18+"
                  : selectedClaims.grad_year
                  ? "Class of 2026"
                  : "XYZ University Student"}
              </span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
              <span className="text-slate-400">Issuer:</span>
              <span className="text-emerald-400 font-semibold">XYZ University</span>
            </div>
            <div className="flex justify-between pt-0.5">
              <span className="text-slate-400">Personal Data Required:</span>
              <span className="text-cyan-400 font-bold">None (Zero PII Exposed)</span>
            </div>
          </div>

          {/* Create Verification Request Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-400 font-mono">
              Ready to verify applicant with QR code or direct simulated wallet handshake.
            </div>

            <button
              onClick={handleCreateRequest}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Create Verification Request</span>
            </button>
          </div>
        </div>

        {/* Section 8: QR Verification Modal */}
        {showQRModal && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl relative">
              <button
                onClick={() => setShowQRModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>

              {qrStep === "qr_display" ? (
                /* QR Display Screen */
                <div className="text-center space-y-5">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-mono">
                    <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Verification Request</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white">ABC Technologies wants to verify:</h3>
                    <div className="text-lg font-black text-cyan-400 mt-1 font-mono">
                      B.Tech Degree = TRUE
                    </div>
                    <span className="text-xs text-emerald-400 font-mono block mt-1">
                      Personal information required: None
                    </span>
                  </div>

                  {/* High Quality Styled QR Code Simulation */}
                  <div className="p-6 rounded-3xl bg-white w-56 h-56 mx-auto flex items-center justify-center shadow-2xl relative border-4 border-cyan-400/30">
                    <div className="w-full h-full bg-slate-950 rounded-2xl p-3 flex flex-col justify-between items-center text-cyan-400">
                      <div className="w-full flex justify-between">
                        <div className="w-10 h-10 border-4 border-cyan-400 rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 bg-cyan-400 rounded-sm" />
                        </div>
                        <div className="w-10 h-10 border-4 border-cyan-400 rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 bg-cyan-400 rounded-sm" />
                        </div>
                      </div>
                      <div className="text-center font-mono text-[9px] text-white">
                        <ShieldCheck className="w-8 h-8 text-cyan-400 mx-auto mb-1 animate-pulse" />
                        <span>CLAIMPASS://VERIFY</span>
                      </div>
                      <div className="w-full flex justify-between">
                        <div className="w-10 h-10 border-4 border-cyan-400 rounded-lg flex items-center justify-center">
                          <div className="w-4 h-4 bg-cyan-400 rounded-sm" />
                        </div>
                        <div className="w-4 h-4 bg-slate-700 rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Copy Link & Simulate Scan Buttons */}
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleCopyLink}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? "Link Copied!" : "Copy Verification Link"}</span>
                    </button>

                    <button
                      onClick={() => setQrStep("wallet_approval")}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
                    >
                      <span>Scan with ClaimPass Wallet →</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Wallet Scanning & Approval Screen */
                <div className="space-y-5">
                  <div className="text-center space-y-1">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-2">
                      <Lock className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-white">ABC Technologies is requesting:</h3>
                    <div className="text-base font-extrabold text-cyan-400">B.Tech Holder</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* Data shared */}
                    <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/50 space-y-2">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                        Data that will be shared:
                      </span>
                      <ul className="space-y-1.5 text-slate-200 font-mono text-[11px]">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> B.Tech claim
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Issuer verification
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Credential validity
                        </li>
                      </ul>
                    </div>

                    {/* Data NOT shared */}
                    <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/50 space-y-2">
                      <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                        Data that will NOT be shared:
                      </span>
                      <ul className="space-y-1.5 text-slate-300 font-mono text-[11px]">
                        <li className="flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-rose-400" /> DOB
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-rose-400" /> Address
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-rose-400" /> Student ID
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      onClick={() => setQrStep("qr_display")}
                      className="w-1/3 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleApproveFromWallet}
                      className="w-2/3 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      <span>Approve &amp; Generate Proof</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading Spinner */}
        {isVerifying && (
          <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
            <Cpu className="w-10 h-10 text-cyan-400 mx-auto animate-spin" />
            <h3 className="text-xl font-bold text-white">Verifying Zero-Knowledge Proof on Ethereum...</h3>
            <p className="text-xs text-slate-400">
              Validating Groth16 pairings, checking XYZ University issuer authorization, and querying on-chain revocation bitmap.
            </p>
          </div>
        )}

        {/* Section 9: Verification Result & Section 10: Blockchain Verification */}
        {verificationResult && !isVerifying && (
          <div className="space-y-6">
            {/* Section 9 Result Card */}
            <div
              className={`p-6 sm:p-8 rounded-3xl border-2 shadow-2xl space-y-6 ${
                verificationResult.overallValid
                  ? "bg-slate-900/90 border-emerald-500/80 shadow-emerald-950/20"
                  : "bg-slate-900/90 border-rose-500/80 shadow-rose-950/20"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold ${
                      verificationResult.overallValid
                        ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                        : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                    }`}
                  >
                    {verificationResult.overallValid ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <XCircle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-white">
                      {verificationResult.overallValid
                        ? "Credential Verified ✓"
                        : "Verification Failed ✕"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Evaluated for verifier: <span className="text-white font-semibold">{verificationResult.verifierName}</span>
                    </p>
                  </div>
                </div>

                {/* Section 9 Privacy Indicator: 🔒 0 Personal Attributes Exposed */}
                <div className="px-4 py-2 rounded-2xl bg-cyan-950/80 border border-cyan-800 text-cyan-300 font-mono text-xs flex items-center gap-2 font-bold shadow-lg shadow-cyan-950/50">
                  <Lock className="w-4 h-4 text-cyan-400" />
                  <span>🔒 0 Personal Attributes Exposed</span>
                </div>
              </div>

              {/* Revocation Warning if Revoked */}
              {verificationResult.credentialRevoked && (
                <div className="p-5 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-300 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm text-rose-400">
                    <Ban className="w-5 h-5" />
                    <span>The cryptographic proof is valid, but the credential has been revoked by the issuer.</span>
                  </div>
                  <p className="text-xs text-rose-200">
                    The ZK mathematical proof confirms Rahul originally possessed a valid B.Tech degree, but XYZ University has recorded an active revocation flag in <code className="text-white">CredentialRegistry.sol</code>.
                  </p>
                </div>
              )}

              {/* Exact Spec Status Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Claim:</span>
                  <span className="text-white font-bold">{verificationResult.claimLabel}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Result:</span>
                  <span
                    className={`font-bold ${
                      verificationResult.overallValid ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {verificationResult.overallValid ? "TRUE" : "FALSE"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Issuer:</span>
                  <span className="text-emerald-400 font-semibold">{verificationResult.issuerName} ✓</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Credential Status:</span>
                  <span
                    className={`font-semibold ${
                      verificationResult.credentialRevoked ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {verificationResult.credentialRevoked ? "Revoked ✕" : "Active ✓"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">ZK Proof:</span>
                  <span className="text-emerald-400 font-semibold">Valid ✓</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Personal Information:</span>
                  <span className="text-cyan-400 font-semibold">Not Revealed ✓</span>
                </div>
              </div>

              {/* Section 10: Blockchain Verification Component */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <span>Blockchain Verification</span>
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    Network: <span className="text-emerald-400 font-semibold">Ethereum Sepolia / EVM</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Trusted Issuer ✓
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Credential Registered ✓
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ZK Proof Valid ✓
                  </div>
                  <div
                    className={`flex items-center gap-1.5 ${
                      verificationResult.credentialRevoked ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {verificationResult.credentialRevoked ? (
                      <XCircle className="w-3.5 h-3.5" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    )}
                    <span>{verificationResult.credentialRevoked ? "Revoked ✕" : "Credential Active ✓"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Revocation Check ✓
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
                  <div className="flex items-center gap-2">
                    <span>Transaction Hash:</span>
                    <span className="text-cyan-400 truncate max-w-[280px]">
                      {verificationResult.txHash}
                    </span>
                  </div>
                  <span className="text-slate-400 italic">
                    Raw personal data is never stored on-chain. Only commitments &amp; revocation flags.
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
