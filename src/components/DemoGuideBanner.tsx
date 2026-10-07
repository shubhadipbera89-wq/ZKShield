"use client";

import Link from "next/link";
import { X, Sparkles, ArrowRight, ShieldCheck, KeyRound, Ban, Building2, QrCode } from "lucide-react";

interface DemoGuideBannerProps {
  onClose?: () => void;
}

export function DemoGuideBanner({ onClose }: DemoGuideBannerProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-cyan-500/30 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg">Judges 2–3 Minute Demo Guide</h3>
              <p className="text-xs text-slate-400">ClaimPass: Complete B.Tech Verification &amp; Revocation Journey</p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="mt-5 space-y-3.5 text-xs">
          {/* Step 1: Issuance & Login */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3.5">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-200 text-sm flex items-center justify-between">
                <span>Phase 1 &amp; 2: Issue &amp; Login with Digital ID</span>
                <Link
                  href="/login"
                  onClick={onClose}
                  className="text-cyan-400 hover:text-cyan-300 font-mono text-[11px] flex items-center gap-1 font-semibold"
                >
                  Test Login <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-slate-400 mt-1 leading-relaxed">
                Click <strong>🔐 Prove My Identity</strong>. Watch the 4-step ZK authentication pipeline verify Rahul Kumar&apos;s XYZ University Digital ID with <strong>0 PII revealed</strong>, redirecting to the User Dashboard.
              </p>
            </div>
          </div>

          {/* Step 2: Prover & Selective Disclosure */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3.5">
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-200 text-sm flex items-center justify-between">
                <span>Phase 3 &amp; 5: Selective ZK Proof &amp; QR Verifier</span>
                <Link
                  href="/verifier"
                  onClick={onClose}
                  className="text-indigo-400 hover:text-indigo-300 font-mono text-[11px] flex items-center gap-1 font-semibold"
                >
                  Go to Verifier <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-slate-400 mt-1 leading-relaxed">
                ABC Technologies requests <strong>B.Tech Degree = TRUE</strong>. Scan or simulate QR handshake, approve in wallet, and generate a <strong>Groth16 zk-SNARK</strong> proof. Result: <strong>Credential Verified ✓</strong> with <strong>🔒 0 Personal Attributes Exposed</strong>.
              </p>
            </div>
          </div>

          {/* Step 3: On-Chain Revocation - WOW Moment */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3.5">
            <div className="w-6 h-6 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </div>
            <div className="flex-1">
              <div className="font-bold text-slate-200 text-sm flex items-center justify-between">
                <span>Phase 4: The &quot;WOW Moment&quot; — On-Chain Revocation</span>
                <Link
                  href="/issuer"
                  onClick={onClose}
                  className="text-rose-400 hover:text-rose-300 font-mono text-[11px] flex items-center gap-1 font-semibold"
                >
                  Revoke Credential <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-slate-400 mt-1 leading-relaxed">
                In the Issuer Portal, click <strong>[Revoke Credential]</strong>. Re-verify the claim in Verifier Portal. The smart contract immediately fails: <em>&quot;The cryptographic proof is valid, but the credential has been revoked by the issuer.&quot;</em>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between pt-4 border-t border-slate-800 text-xs gap-3">
          <span className="text-slate-400 font-mono">
            Powered by Circom 2.1.6 • snarkjs Groth16 • CredentialRegistry.sol
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-colors"
            >
              Start Demonstration →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
