"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import {
  Settings,
  Shield,
  Wallet,
  Lock,
  Bell,
  Building2,
  LogOut,
  Snowflake,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import {
  getCredentials,
  toggleFreezeCredential,
  clearCredentials,
  seedDemoCredentialIfNeeded,
} from "../../lib/credential";
import { Credential } from "../../lib/types";

export default function SettingsPage() {
  const router = useRouter();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [activeTab, setActiveTab] = useState<
    "digital_id" | "wallet" | "security" | "privacy" | "verifiers"
  >("security");

  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [autoRevokeAlerts, setAutoRevokeAlerts] = useState(true);

  useEffect(() => {
    async function load() {
      const list = await seedDemoCredentialIfNeeded();
      setCredentials(list);
    }
    load();
  }, []);

  const handleToggleFreeze = (id: string) => {
    const newStatus = toggleFreezeCredential(id);
    setCredentials((prev) =>
      prev.map((c) => (c.id === id ? { ...c, frozen: newStatus } : c))
    );
  };

  const handleLogout = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#090d16] text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-xl">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-mono mb-2">
              <Settings className="w-3.5 h-3.5 text-cyan-400" />
              <span>Identity &amp; Security Preferences</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Settings &amp; Security
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Configure connected verifiers, manage your decentralized wallet, and freeze credentials in emergencies.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-rose-950 hover:text-rose-400 hover:border-rose-800 border border-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2 w-fit"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Tabs Sidebar */}
          <div className="space-y-1 p-2 rounded-2xl bg-slate-900/80 border border-slate-800 h-fit text-xs font-medium">
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-colors ${
                activeTab === "security"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Security &amp; Freeze</span>
            </button>

            <button
              onClick={() => setActiveTab("digital_id")}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-colors ${
                activeTab === "digital_id"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Digital ID Attributes</span>
            </button>

            <button
              onClick={() => setActiveTab("wallet")}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-colors ${
                activeTab === "wallet"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Connected Wallet</span>
            </button>

            <button
              onClick={() => setActiveTab("verifiers")}
              className={`w-full flex items-center gap-2.5 px-4 py-3 rounded-xl transition-colors ${
                activeTab === "verifiers"
                  ? "bg-cyan-500 text-slate-950 font-bold"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Connected Verifiers</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="lg:col-span-3 p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
            {/* SECURITY TAB: FREEZE CREDENTIAL */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Snowflake className="w-5 h-5 text-cyan-400" />
                    <span>Emergency Credential Freeze</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    If your device is compromised or you suspect unauthorized proof requests, temporarily freeze your credentials. Frozen credentials cannot be proven.
                  </p>
                </div>

                <div className="space-y-3">
                  {credentials.map((cred) => (
                    <div
                      key={cred.id}
                      className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm">{cred.degree}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              cred.frozen
                                ? "bg-cyan-950 border border-cyan-800 text-cyan-400"
                                : "bg-emerald-950 border border-emerald-800 text-emerald-400"
                            }`}
                          >
                            {cred.frozen ? "FROZEN" : "ACTIVE"}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          Issuer: {cred.issuerName} • Holder: {cred.holderName}
                        </span>
                      </div>

                      <button
                        onClick={() => handleToggleFreeze(cred.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-colors flex items-center gap-1.5 ${
                          cred.frozen
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                            : "bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-300"
                        }`}
                      >
                        <Snowflake className="w-3.5 h-3.5" />
                        <span>{cred.frozen ? "Unfreeze Credential" : "Freeze Credential"}</span>
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-2 text-slate-300">
                  <span className="text-slate-400 font-bold block">Security Status:</span>
                  <div className="flex justify-between">
                    <span>Client Storage:</span>
                    <span className="text-emerald-400">Encrypted Local Vault ✓</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biometric Handshake:</span>
                    <span className="text-emerald-400">Hardware Bound ✓</span>
                  </div>
                </div>
              </div>
            )}

            {/* DIGITAL ID TAB */}
            {activeTab === "digital_id" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Digital ID Profile</h3>
                <p className="text-xs text-slate-400">
                  Decentralized identifier mapped to Rahul Kumar.
                </p>

                <div className="space-y-2 text-xs font-mono text-slate-300">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">DID Identifier:</span>
                    <span className="text-cyan-400">did:claimpass:eth:0x71C8A9b7325F39b03f0bA76420eC19F68c34592A</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">Primary Institution:</span>
                    <span className="text-white">XYZ University</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between">
                    <span className="text-slate-400">ZK Prover Engine:</span>
                    <span className="text-emerald-400">Groth16 BN128 (Client-Side)</span>
                  </div>
                </div>
              </div>
            )}

            {/* WALLET TAB */}
            {activeTab === "wallet" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Connected Wallet</h3>
                <p className="text-xs text-slate-400">
                  Ethereum-compatible wallet address authorized for ClaimPass attestations.
                </p>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Account:</span>
                    <span className="text-white font-bold">Rahul Kumar</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Address:</span>
                    <span className="text-cyan-400 font-bold">0x71C8A9b7325F39b03f0bA76420eC19F68c34592A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Network:</span>
                    <span className="text-emerald-400">Ethereum Sepolia / EVM</span>
                  </div>
                </div>
              </div>
            )}

            {/* CONNECTED VERIFIERS TAB */}
            {activeTab === "verifiers" && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Connected Verifiers</h3>
                <p className="text-xs text-slate-400">
                  Organizations authorized to request selective claims. Verifiers never receive your raw personal data.
                </p>

                <div className="space-y-2 text-xs font-mono">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <span>ABC Technologies</span>
                    </div>
                    <span className="text-emerald-400">Active Handshake ✓</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-white font-bold">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <span>XYZ Services</span>
                    </div>
                    <span className="text-emerald-400">Active Handshake ✓</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
