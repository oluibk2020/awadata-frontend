"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/Spinner";
import {
  Lock,
  Mail,
  ShieldAlert,
  KeyRound,
  ArrowRight,
  UserCheck,
  Sparkles,
  Users,
  ShieldCheck,
  Scale,
  Search,
  Settings,
} from "lucide-react";

const ArrowUpRight = ({ className = "" }) => (
  <svg
    aria-hidden="true"
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path d="M7 17 17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function AuthSection({ id = "auth-section" }) {
  const { login } = useAuth();
  const [activeTab, setActiveTab] = useState("login"); // 'login' | 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const demoAccounts = [
    {
      role: "Participant",
      email: "participant-a@awadata.demo",
      name: "Participant A (Lived Experience)",
      desc: "Controls individual consent, permits aggregate academic study, and vetoes commercial AI mining.",
      badge: "bg-[#97c9aa]/40 text-[#173f34] border-[#97c9aa]",
      icon: Users,
    },
    {
      role: "Researcher",
      email: "researcher@awadata.demo",
      name: "Dr. Synthetica (Researcher)",
      desc: "Requests data access, submits research proposals, and commits to community benefit agreements.",
      badge: "bg-[#f2ca56]/40 text-[#172c26] border-[#f2ca56]",
      icon: Sparkles,
    },
    {
      role: "Governance Council",
      email: "governance@awadata.demo",
      name: "Council Elder / Health Worker",
      desc: "Community steward reviewing proposals, approving ethical operations, and evaluating benefit terms.",
      badge: "bg-[#f5a278]/40 text-[#8c3516] border-[#f5a278]",
      icon: Scale,
    },
    {
      role: "Auditor",
      email: "auditor@awadata.demo",
      name: "Tamper-Evident Auditor",
      desc: "Inspects immutable access logs, authorization decisions, and benefit commitments for compliance.",
      badge: "bg-[#6ba785]/40 text-[#173f34] border-[#6ba785]",
      icon: Search,
    },
    {
      role: "Platform Admin",
      email: "platform-admin@awadata.demo",
      name: "Commons Administrator",
      desc: "Configures community boundaries, synthetic datasets, and pseudonymous participant slots.",
      badge: "bg-[#173f34] text-white border-[#173f34]",
      icon: Settings,
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setSubmitting(true);
    await login(email, password);
    setSubmitting(false);
  };

  const handleSelectDemo = (demoEmail) => {
    setEmail(demoEmail);
    // If user hasn't typed a password yet, we let them know default demo password
    if (!password) {
      setPassword("DemoSeedPassword123!");
    }
  };

  return (
    <section
      id={id}
      className="scroll-mt-16 mx-auto max-w-[1440px] px-5 py-16 sm:px-8 lg:px-14 lg:py-24"
    >
      <div className="mx-auto max-w-3xl text-center mb-10">
        <div className="inline-flex items-center gap-2 mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#e3613f]">
          <span className="h-px w-6 bg-[#e3613f]" />
          Interactive Multi-Role Simulation
          <span className="h-px w-6 bg-[#e3613f]" />
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl tracking-[-0.035em] [font-family:var(--font-dm-serif-display),serif] text-[#172c26]">
          Step into the Commons.
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#324d45] max-w-xl mx-auto leading-relaxed">
          Test sovereign data governance firsthand. Sign in as a participant,
          researcher, governance elder, auditor, or platform admin to experience
          how dual-key authorization protects African communities.
        </p>
      </div>

      <div className="mx-auto max-w-2xl rounded-3xl border border-[#172c26]/15 bg-[#fffaf0] p-6 sm:p-10 shadow-xl">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#172c26]/15 mb-8">
          <button
            type="button"
            onClick={() => setActiveTab("login")}
            className={`pb-3.5 px-6 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === "login"
                ? "border-[#173f34] text-[#173f34]"
                : "border-transparent text-[#172c26]/50 hover:text-[#172c26]"
            }`}
          >
            Sign In to Demonstration
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("register")}
            className={`pb-3.5 px-6 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "register"
                ? "border-[#173f34] text-[#173f34]"
                : "border-transparent text-[#172c26]/50 hover:text-[#172c26]"
            }`}
          >
            <span>Register Account</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#e3613f]/15 text-[#e3613f]">
              Controlled
            </span>
          </button>
        </div>

        {/* TAB 1: SIGN IN */}
        {activeTab === "login" && (
          <div className="space-y-6">
            {/* Quick-Pick Stakeholder Simulation Persona */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#315b4e] flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-[#e3613f]" />
                  Select Demo Stakeholder Role:
                </span>
                <span className="text-[11px] text-[#324d45]">
                  Password:{" "}
                  <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-[#172c26]/15">
                    DemoSeedPassword123!
                  </code>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {demoAccounts.map((acc) => {
                  const Icon = acc.icon;
                  const isSelected = email === acc.email;

                  return (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleSelectDemo(acc.email)}
                      className={`text-left p-3 rounded-2xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? "border-[#173f34] bg-white ring-2 ring-[#173f34]/15 shadow-sm"
                          : "border-[#172c26]/10 bg-white/70 hover:bg-white hover:border-[#172c26]/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${acc.badge}`}
                        >
                          {acc.role}
                        </span>
                        <Icon className="w-3.5 h-3.5 text-[#324d45]" />
                      </div>
                      <div className="text-xs font-bold text-[#172c26] truncate">
                        {acc.name}
                      </div>
                      <div className="text-[11px] text-[#324d45] leading-tight mt-1 line-clamp-2">
                        {acc.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Login Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4 pt-4 border-t border-[#172c26]/10"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#324d45] mb-1.5">
                  Account Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#324d45] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="participant-a@awadata.demo"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#172c26]/20 bg-white text-xs sm:text-sm text-[#172c26] focus:border-[#173f34] focus:ring-2 focus:ring-[#173f34]/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#324d45] mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#324d45] absolute left-3.5 top-3.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (e.g. DemoSeedPassword123!)"
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#172c26]/20 bg-white text-xs sm:text-sm text-[#172c26] focus:border-[#173f34] focus:ring-2 focus:ring-[#173f34]/20 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3.5 px-6 rounded-full bg-[#173f34] hover:bg-[#0f3028] text-white text-sm font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Spinner size="xs" />
                    <span>Verifying Credentials & Session...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Data Commons Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: REGISTER */}
        {activeTab === "register" && (
          <div className="space-y-6 text-center py-4 animate-in fade-in duration-200">
            <div className="size-16 rounded-full bg-[#e3613f]/15 text-[#e3613f] mx-auto flex items-center justify-center">
              <ShieldAlert className="size-8" />
            </div>

            <div className="max-w-md mx-auto space-y-2">
              <h3 className="text-2xl font-bold tracking-tight [font-family:var(--font-dm-serif-display),serif] text-[#172c26]">
                Registration Governed by Community Protocol
              </h3>
              <p className="text-xs sm:text-sm text-[#324d45] leading-relaxed">
                Self-service open registration is disabled in this demonstration
                environment. In accordance with African data sovereignty
                guidelines, individual research participants and governance
                stewards are verified and enrolled through structured community
                partner agreements.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-[#172c26]/10 text-left space-y-2 text-xs">
              <span className="font-bold text-[#172c26] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#e3613f]" />
                Why is self-registration controlled?
              </span>
              <ul className="list-disc list-inside space-y-1 text-[#324d45]">
                <li>
                  Guarantees strictly pseudonymous, synthetic research
                  participant identities.
                </li>
                <li>
                  Ensures all governance seats represent verified community
                  health workers and elders.
                </li>
                <li>
                  Protects the cryptographic audit ledger against spam accounts
                  and malicious actors.
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <a
                href="mailto:taiwoolugbenga2018@gmail.com?subject=Pilot%20Stewardship%20Inquiry"
                className="inline-flex items-center gap-2 rounded-full bg-[#f2ca56] px-6 py-3.5 text-xs sm:text-sm font-bold text-[#173f34] transition hover:bg-[#f6dc83]"
              >
                Inquire about pilot partnership
                <ArrowUpRight className="size-4" />
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
