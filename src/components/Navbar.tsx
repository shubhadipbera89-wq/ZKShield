"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  KeyRound,
  FileCheck2,
  Building2,
  CheckCircle,
  Database,
  RotateCcw,
  Menu,
  X,
  Lock,
  Wallet,
  LayoutDashboard,
  History,
  Settings,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useState, useEffect } from "react";
import { BlockchainExplorerModal } from "./BlockchainExplorerModal";
import { DemoGuideBanner } from "./DemoGuideBanner";
import { clearCredentials, seedDemoCredentialIfNeeded } from "../lib/credential";
import { resetBlockchainState } from "../lib/blockchain";

export function Navbar() {
  const pathname = usePathname();
  const [showExplorer, setShowExplorer] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [appMenuOpen, setAppMenuOpen] = useState(false);

  useEffect(() => {
    seedDemoCredentialIfNeeded();
  }, []);

  const handleResetDemo = async () => {
    setIsResetting(true);
    clearCredentials();
    resetBlockchainState();
    await seedDemoCredentialIfNeeded();
    setTimeout(() => {
      setIsResetting(false);
      window.location.reload();
    }, 400);
  };

  const navLinks = [
    { label: "Product", href: "/#product" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "For Issuers", href: "/issuer" },
    { label: "For Verifiers", href: "/verifier" },
    { label: "Privacy", href: "/privacy" },
    { label: "Technology", href: "/#technology" },
  ];

  const appLinks = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Digital ID Wallet", href: "/wallet", icon: Wallet },
    { label: "ClaimPass Prover", href: "/claimpass", icon: KeyRound },
    { label: "Verification History", href: "/history", icon: History },
    { label: "Privacy Dashboard", href: "/privacy", icon: Lock },
    { label: "Settings & Security", href: "/settings", icon: Settings },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
                <Shield className="w-5 h-5 text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                    ClaimPass
                  </span>
                  <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 font-semibold uppercase">
                    ZK-ID
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Prove the claim. Reveal less.</p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6">
              {navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-xs font-medium text-slate-300 hover:text-cyan-300 transition-colors"
                >
                  {item.label}
                </Link>
              ))}

              {/* App Hub Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setAppMenuOpen(!appMenuOpen)}
                  onBlur={() => setTimeout(() => setAppMenuOpen(false), 200)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/70 hover:bg-slate-800 text-slate-200 border border-slate-700/70 transition-all"
                >
                  <span>App Suite</span>
                  <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                </button>

                {appMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="text-[10px] font-mono uppercase text-slate-400 px-2 py-1">Identity &amp; Tools</div>
                    {appLinks.map((app) => {
                      const Icon = app.icon;
                      const isActive = pathname === app.href;
                      return (
                        <Link
                          key={app.href}
                          href={app.href}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                            isActive
                              ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/30"
                              : "text-slate-300 hover:bg-slate-800 hover:text-white"
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                          <span>{app.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>

            {/* Right Action Buttons */}
            <div className="hidden sm:flex items-center gap-2.5">
              {/* Judges Demo Guide */}
              <button
                onClick={() => setShowGuide(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/70 text-cyan-300 border border-cyan-700/60 hover:bg-cyan-900/60 transition-all shadow-sm"
                title="Judges 2-3 minute demo walkthrough"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>Demo Guide</span>
              </button>

              {/* On-Chain Ledger */}
              <button
                onClick={() => setShowExplorer(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-all"
                title="View On-Chain Registry & Blockchain Ledger"
              >
                <Database className="w-3.5 h-3.5 text-emerald-400" />
                <span>On-Chain Ledger</span>
              </button>

              {/* Reset Demo State */}
              <button
                onClick={handleResetDemo}
                disabled={isResetting}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 transition-all"
                title="Reset to fresh demo state"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? "animate-spin text-cyan-400" : ""}`} />
              </button>

              {/* Login Button */}
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-900/60 transition-all"
              >
                Login
              </Link>

              {/* Primary CTA: Get Started */}
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-md shadow-cyan-500/20 transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-slate-800/90 bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800/80">
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center py-2 px-3 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Dashboard
              </Link>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center py-2 px-3 rounded-lg bg-slate-800 text-white font-semibold text-xs border border-slate-700"
              >
                Login
              </Link>
            </div>

            <div className="space-y-1">
              <div className="text-[10px] font-mono uppercase text-slate-400 px-2 py-1">App Navigation</div>
              {appLinks.map((app) => (
                <Link
                  key={app.href}
                  href={app.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-900"
                >
                  <app.icon className="w-4 h-4 text-cyan-400" />
                  <span>{app.label}</span>
                </Link>
              ))}
              <Link
                href="/issuer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-900"
              >
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>For Issuers</span>
              </Link>
              <Link
                href="/verifier"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-900"
              >
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>For Verifiers</span>
              </Link>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowExplorer(true);
                }}
                className="flex items-center gap-1.5 text-cyan-400"
              >
                <Database className="w-3.5 h-3.5" />
                <span>On-Chain Ledger</span>
              </button>
              <button onClick={handleResetDemo} className="flex items-center gap-1.5 text-rose-400">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Explorer Modal */}
      {showExplorer && <BlockchainExplorerModal onClose={() => setShowExplorer(false)} />}

      {/* Demo Guide Modal */}
      {showGuide && <DemoGuideBanner onClose={() => setShowGuide(false)} />}
    </>
  );
}
