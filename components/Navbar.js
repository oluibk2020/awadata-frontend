"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { LogOut } from "lucide-react";

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

const MenuIcon = ({ open }) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    className="size-5"
  >
    {open ? (
      <path d="m6 6 12 12M18 6 6 18" strokeLinecap="round" />
    ) : (
      <path d="M5 8h14M5 16h14" strokeLinecap="round" />
    )}
  </svg>
);

export default function Navbar() {
  const { user, role, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  const roleBadges = {
    PARTICIPANT: { label: "Participant", bg: "bg-[#97c9aa]/40 text-[#173f34] border-[#97c9aa]" },
    RESEARCHER: { label: "Researcher", bg: "bg-[#f2ca56]/40 text-[#172c26] border-[#f2ca56]" },
    GOVERNANCE_MEMBER: { label: "Governance Council", bg: "bg-[#f5a278]/40 text-[#8c3516] border-[#f5a278]" },
    AUDITOR: { label: "Auditor", bg: "bg-[#6ba785]/40 text-[#173f34] border-[#6ba785]" },
    PLATFORM_ADMIN: { label: "Platform Admin", bg: "bg-[#173f34] text-white border-[#173f34]" },
    COMMUNITY_ADMIN: { label: "Community Admin", bg: "bg-[#173f34] text-white border-[#173f34]" },
  };

  const currentBadge = role
    ? roleBadges[role] || { label: role, bg: "bg-[#172c26]/10 text-[#172c26] border-[#172c26]/20" }
    : null;

  return (
    <nav
      aria-label="Main navigation"
      className="relative z-50 mx-auto flex max-w-[1440px] items-center justify-between px-5 py-5 sm:px-8 lg:px-14 lg:py-7 gap-6"
    >
      {/* Brand / Logo */}
      <a href="#top" className="group flex items-center gap-3 shrink-0" aria-label="AwaData Commons home">
        <span className="grid size-10 grid-cols-2 overflow-hidden rounded-full border border-[#172c26]/20 transition-transform group-hover:rotate-6">
          <span className="bg-[#e3613f]" />
          <span className="bg-[#f2ca56]" />
          <span className="bg-[#6ba785]" />
          <span className="bg-[#193c34]" />
        </span>
        <div className="flex flex-col">
          <span className="text-xl tracking-[-0.02em] [font-family:var(--font-dm-serif-display),serif] sm:text-2xl leading-none text-[#172c26]">
            AwaData Commons
          </span>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#315b4e] mt-0.5">
            Mental Health Data Sovereignty
          </span>
        </div>
      </a>

      {/* Nav Links: Shown ONLY when unauthenticated, spaced out nicely */}
      {!user && (
        <div className="hidden lg:flex items-center justify-center gap-8 xl:gap-14 text-sm font-semibold text-[#172c26] tracking-wide mx-auto">
          <a
            className="relative px-3.5 py-2 rounded-xl transition-colors duration-150 hover:bg-[#172c26]/5 after:absolute after:bottom-1 after:left-3.5 after:right-3.5 after:h-0.5 after:origin-right after:scale-x-0 after:bg-[#e3613f] after:transition-transform after:duration-200 hover:after:origin-left hover:after:scale-x-100 motion-reduce:after:transition-none"
            href="#why"
          >
            Why it matters
          </a>
          <a
            className="relative px-3.5 py-2 rounded-xl transition-colors duration-150 hover:bg-[#172c26]/5 after:absolute after:bottom-1 after:left-3.5 after:right-3.5 after:h-0.5 after:origin-right after:scale-x-0 after:bg-[#e3613f] after:transition-transform after:duration-200 hover:after:origin-left hover:after:scale-x-100 motion-reduce:after:transition-none"
            href="#principles"
          >
            Our principles
          </a>
          <a
            className="relative px-3.5 py-2 rounded-xl transition-colors duration-150 hover:bg-[#172c26]/5 after:absolute after:bottom-1 after:left-3.5 after:right-3.5 after:h-0.5 after:origin-right after:scale-x-0 after:bg-[#e3613f] after:transition-transform after:duration-200 hover:after:origin-left hover:after:scale-x-100 motion-reduce:after:transition-none"
            href="#pilot"
          >
            The pilot
          </a>
        </div>
      )}

      {/* Right Action */}
      {!user ? (
        <a
          href="#auth-section"
          className="hidden items-center gap-2 rounded-full border border-[#172c26] px-6 py-3 text-sm font-bold transition hover:bg-[#172c26] hover:text-[#f6f1e7] lg:flex text-[#172c26] shrink-0"
        >
          <span>Join the conversation / Sign In</span>
          <ArrowUpRight className="size-4" />
        </a>
      ) : (
        <div className="hidden items-center gap-4 lg:flex shrink-0">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#172c26]">
                {user.firstName} {user.lastName}
              </span>
              {currentBadge && (
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${currentBadge.bg}`}>
                  {currentBadge.label}
                </span>
              )}
            </div>
            <span className="text-[11px] text-[#324d45] font-mono">{user.email}</span>
          </div>

          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#172c26] bg-[#fffaf0] hover:bg-[#172c26] hover:text-[#f6f1e7] border border-[#172c26]/30 rounded-full transition cursor-pointer shadow-xs"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Mobile Menu Button */}
      <button
        type="button"
        className="grid size-11 place-items-center rounded-full border border-[#172c26]/30 lg:hidden text-[#172c26]"
        onClick={() => setMenuOpen((current) => !current)}
        aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={menuOpen}
      >
        <MenuIcon open={menuOpen} />
      </button>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="absolute left-5 right-5 top-[76px] rounded-3xl border border-[#172c26]/15 bg-[#fffaf0] p-5 shadow-xl lg:hidden text-[#172c26] z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex flex-col gap-2 text-base font-semibold">
            {!user ? (
              <>
                <a
                  className="rounded-xl px-4 py-3 hover:bg-[#172c26]/5 transition"
                  href="#why"
                  onClick={closeMenu}
                >
                  Why it matters
                </a>
                <a
                  className="rounded-xl px-4 py-3 hover:bg-[#172c26]/5 transition"
                  href="#principles"
                  onClick={closeMenu}
                >
                  Our principles
                </a>
                <a
                  className="rounded-xl px-4 py-3 hover:bg-[#172c26]/5 transition"
                  href="#pilot"
                  onClick={closeMenu}
                >
                  The pilot
                </a>
                <a
                  href="#auth-section"
                  onClick={closeMenu}
                  className="mt-2 flex items-center justify-center gap-2 rounded-full bg-[#172c26] px-5 py-3.5 text-[#fffaf0] text-sm font-bold shadow-sm"
                >
                  <span>Join the conversation / Sign In</span>
                  <ArrowUpRight className="size-4" />
                </a>
              </>
            ) : (
              <div className="pt-1 flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#172c26]/10">
                  <span className="text-sm font-bold text-[#172c26]">
                    {user.firstName} {user.lastName}
                  </span>
                  {currentBadge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${currentBadge.bg}`}>
                      {currentBadge.label}
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#324d45] font-mono">{user.email}</span>
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="mt-1 flex items-center justify-center gap-2 rounded-full bg-[#172c26] px-4 py-2.5 text-xs font-bold text-[#fffaf0] cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
