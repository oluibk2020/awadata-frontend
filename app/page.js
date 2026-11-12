"use client";

import { useAuth } from "@/context/AuthContext";
import Hero from "@/components/Hero";
import AuthSection from "@/components/auth/AuthSection";
import ParticipantView from "@/components/participant/ParticipantView";
import ResearcherView from "@/components/researcher/ResearcherView";
import AuditorView from "@/components/auditor/AuditorView";
import PlatformAdminView from "@/components/admin/PlatformAdminView";
import GovernanceView from "@/components/governance/GovernanceView";
import Spinner from "@/components/Spinner";

export default function Home() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4 text-[#172c26]">
        <Spinner size="xl" text="Connecting to AwaData Commons Data Vault..." />
      </div>
    );
  }

  // Not signed in: Show full landing experience and dedicated Auth section (Login & Register)
  if (!user) {
    const handleScrollToAuth = () => {
      document.getElementById("auth-section")?.scrollIntoView({ behavior: "smooth" });
    };

    return (
      <div className="space-y-4">
        <Hero onExploreClick={handleScrollToAuth} />
        <AuthSection id="auth-section" />
      </div>
    );
  }

  // Render role-specific sovereign dashboard when authenticated
  return (
    <div className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8 lg:px-14">
      {role === "PARTICIPANT" && <ParticipantView />}
      {role === "RESEARCHER" && <ResearcherView />}
      {role === "AUDITOR" && <AuditorView />}
      {(role === "PLATFORM_ADMIN" || role === "COMMUNITY_ADMIN") && <PlatformAdminView />}
      {role === "GOVERNANCE_MEMBER" && <GovernanceView />}

      {/* Fallback if role unrecognized */}
      {!["PARTICIPANT", "RESEARCHER", "AUDITOR", "PLATFORM_ADMIN", "COMMUNITY_ADMIN", "GOVERNANCE_MEMBER"].includes(
        role
      ) && (
        <div className="bg-[#fffaf0] border border-[#172c26]/15 rounded-3xl p-8 text-center max-w-md mx-auto shadow-sm">
          <h3 className="font-bold text-[#172c26] text-lg mb-2">Unrecognized Role: {role}</h3>
          <p className="text-xs text-[#324d45] mb-4">
            Your account does not have a designated dashboard for this role.
          </p>
        </div>
      )}
    </div>
  );
}
