"use client";

import { useState } from "react";
import { X, QrCode, Sparkles, Copy, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface QRVerificationModalProps {
  claimType: "age" | "degree";
  verifierName: string;
  onClose: () => void;
  onFulfilled?: () => void;
}

export function QRVerificationModal({
  claimType,
  verifierName,
  onClose,
  onFulfilled,
}: QRVerificationModalProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isFulfilling, setIsFulfilling] = useState(false);

  const [requestPayload] = useState(() => ({
    protocol: "privid-zk-request/v1",
    verifier: verifierName,
    claim: claimType,
    requiredOutput: claimType === "age" ? "age >= 18" : "degree == B.Tech",
    nonce: "0x" + Math.random().toString(16).slice(2, 10),
    timestamp: Date.now(),
  }));

  const payloadString = JSON.stringify(requestPayload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(payloadString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateScanAndProve = () => {
    setIsFulfilling(true);
    setTimeout(() => {
      setIsFulfilling(false);
      onClose();
      if (onFulfilled) onFulfilled();
      router.push("/wallet");
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-3">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="font-bold text-white text-base">QR-Based Verification Request</h3>
        <p className="text-xs text-slate-400 mt-1">
          {verifierName} requests zero-knowledge proof for:
        </p>

        <div className="my-3 inline-block px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/60 border border-cyan-800 text-cyan-300">
          {claimType === "age" ? "🎂 Age >= 18 Claim" : "🎓 B.Tech Degree Claim"}
        </div>

        {/* Realistic QR Visual Pattern */}
        <div className="p-4 mx-auto my-4 w-52 h-52 bg-white rounded-2xl flex flex-col items-center justify-center shadow-xl shadow-cyan-950/20">
          <div className="grid grid-cols-6 gap-1 w-full h-full p-2 bg-slate-50 rounded-xl">
            {Array.from({ length: 36 }).map((_, i) => {
              const isCorner =
                (i >= 0 && i <= 1) ||
                (i >= 4 && i <= 5) ||
                (i >= 6 && i <= 7) ||
                (i >= 10 && i <= 11) ||
                (i >= 24 && i <= 25) ||
                (i >= 30 && i <= 31);
              const isFilled = isCorner || (i * 7 + 3) % 4 === 0 || (i * 3 + 1) % 5 === 0;
              return (
                <div
                  key={i}
                  className={`rounded-sm transition-all ${
                    isFilled ? "bg-slate-950" : "bg-transparent"
                  }`}
                />
              );
            })}
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mb-4">
          Scan with PrivID mobile wallet or click below to simulate immediate cross-device proving.
        </p>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 py-2 px-3 rounded-xl border border-slate-700 bg-slate-800 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors flex items-center justify-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Payload"}</span>
          </button>

          <button
            onClick={handleSimulateScanAndProve}
            disabled={isFulfilling}
            className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-xs font-semibold text-white shadow-lg shadow-cyan-500/20 hover:from-cyan-400 hover:to-indigo-500 transition-all flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isFulfilling ? "Scanning..." : "Open in Wallet"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
