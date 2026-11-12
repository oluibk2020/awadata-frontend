"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/Spinner";
import {
  getCommunities,
  createCommunity,
  getCommunityDatasets,
  createCommunityDataset,
  getDatasetParticipants,
  createDatasetParticipant,
  getUserDirectory,
  assignCommunityGovernanceMember,
} from "@/lib/api";
import AuditorView from "@/components/auditor/AuditorView";
import {
  Layers,
  Database,
  Users,
  Plus,
  RefreshCw,
  FolderPlus,
  UserPlus,
  ShieldAlert,
  Globe,
  Tag,
} from "lucide-react";

export default function PlatformAdminView() {
  const { token, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState("communities"); // 'communities' | 'datasets' | 'participants' | 'audit'
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected state for drilldown
  const [selectedCommunityId, setSelectedCommunityId] = useState("");
  const [datasets, setDatasets] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [participants, setParticipants] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedGovernanceUserId, setSelectedGovernanceUserId] = useState("");

  // Create Community Form
  const [commName, setCommName] = useState("");
  const [commDesc, setCommDesc] = useState("");
  const [commCountry, setCommCountry] = useState("Synthetic");
  const [creatingComm, setCreatingComm] = useState(false);

  // Create Dataset Form
  const [dsName, setDsName] = useState("");
  const [dsDesc, setDsDesc] = useState("");
  const [dsStatus, setDsStatus] = useState("ACTIVE");
  const [creatingDs, setCreatingDs] = useState(false);

  // Create Participant Form
  const [subjectCode, setSubjectCode] = useState("");
  const [participantUserId, setParticipantUserId] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");
  const [participantFirstName, setParticipantFirstName] = useState("");
  const [participantLastName, setParticipantLastName] = useState("");
  const [creatingParticipant, setCreatingParticipant] = useState(false);

  // Load Communities
  const loadCommunities = useCallback(async () => {
    setLoading(true);
    const res = await getCommunities(token);
    if (res.ok && Array.isArray(res.data)) {
      setCommunities(res.data);
      if (res.data.length > 0 && !selectedCommunityId) {
        setSelectedCommunityId(res.data[0].id);
      }
    }
    setLoading(false);
  }, [token, selectedCommunityId]);

  const loadUsers = useCallback(async () => {
    const res = await getUserDirectory(token);
    if (res.ok && Array.isArray(res.data)) {
      setUsers(res.data);
      return;
    }
    showToast(res.error || "Unable to load registered users", "error");
  }, [token, showToast]);

  // Load Datasets for Selected Community
  const loadDatasets = useCallback(async () => {
    if (!selectedCommunityId) return;
    const res = await getCommunityDatasets(token, selectedCommunityId);
    if (res.ok && Array.isArray(res.data)) {
      setDatasets(res.data);
      if (res.data.length > 0 && !selectedDatasetId) {
        setSelectedDatasetId(res.data[0].id);
      }
    } else {
      setDatasets([]);
    }
  }, [token, selectedCommunityId, selectedDatasetId]);

  // Load Participants for Selected Dataset
  const loadParticipants = useCallback(async () => {
    if (!selectedCommunityId || !selectedDatasetId) return;
    const res = await getDatasetParticipants(token, selectedCommunityId, selectedDatasetId);
    if (res.ok && Array.isArray(res.data)) {
      setParticipants(res.data);
    } else {
      setParticipants([]);
    }
  }, [token, selectedCommunityId, selectedDatasetId]);

  useEffect(() => {
    const timer = setTimeout(() => void loadCommunities(), 0);
    return () => clearTimeout(timer);
  }, [loadCommunities]);

  useEffect(() => {
    const timer = setTimeout(() => void loadUsers(), 0);
    return () => clearTimeout(timer);
  }, [loadUsers]);

  useEffect(() => {
    const timer = setTimeout(() => void loadDatasets(), 0);
    return () => clearTimeout(timer);
  }, [loadDatasets]);

  useEffect(() => {
    const timer = setTimeout(() => void loadParticipants(), 0);
    return () => clearTimeout(timer);
  }, [loadParticipants]);

  // Handle Create Community
  const handleCreateCommunity = async (e) => {
    e.preventDefault();
    if (!commName) return;
    setCreatingComm(true);
    const res = await createCommunity(token, {
      name: commName,
      description: commDesc,
      country: commCountry,
    });
    if (res.ok && res.data) {
      showToast(`Community "${res.data.name}" created!`, "success");
      setCommName("");
      setCommDesc("");
      await loadCommunities();
      setSelectedCommunityId(res.data.id);
    } else {
      showToast(res.error || "Failed to create community", "error");
    }
    setCreatingComm(false);
  };

  // Handle Create Dataset
  const handleCreateDataset = async (e) => {
    e.preventDefault();
    if (!selectedCommunityId || !dsName) return;
    setCreatingDs(true);
    const res = await createCommunityDataset(token, selectedCommunityId, {
      name: dsName,
      description: dsDesc,
      status: dsStatus,
    });
    if (res.ok && res.data) {
      showToast(`Dataset "${res.data.name}" registered!`, "success");
      setDsName("");
      setDsDesc("");
      await loadDatasets();
      setSelectedDatasetId(res.data.id);
    } else {
      showToast(res.error || "Failed to create dataset", "error");
    }
    setCreatingDs(false);
  };

  // Handle Create Participant
  const handleCreateParticipant = async (e) => {
    e.preventDefault();
    if (!selectedCommunityId || !selectedDatasetId || !subjectCode) return;
    setCreatingParticipant(true);
    const res = await createDatasetParticipant(token, selectedCommunityId, selectedDatasetId, {
      subjectCode,
      ...(participantUserId
        ? { userId: participantUserId }
        : {
            email: participantEmail,
            firstName: participantFirstName,
            lastName: participantLastName,
          }),
    });
    if (res.ok && res.data) {
      showToast(
        res.data.generatedPassword
          ? `Participant account created. Temporary password: ${res.data.generatedPassword}`
          : `Participant record "${res.data.subjectCode}" linked!`,
        "success"
      );
      setSubjectCode("");
      setParticipantUserId("");
      setParticipantEmail("");
      setParticipantFirstName("");
      setParticipantLastName("");
      await loadParticipants();
      await loadUsers();
    } else {
      showToast(res.error || "Failed to provision participant", "error");
    }
    setCreatingParticipant(false);
  };

  const handleAssignGovernanceMember = async (e) => {
    e.preventDefault();
    if (!selectedCommunityId || !selectedGovernanceUserId) return;
    const res = await assignCommunityGovernanceMember(
      token,
      selectedCommunityId,
      selectedGovernanceUserId
    );
    if (res.ok) {
      showToast("Governance member assigned to the community.", "success");
      setSelectedGovernanceUserId("");
      await loadUsers();
    } else {
      showToast(res.error || "Failed to assign governance member", "error");
    }
  };

  const currentGovernanceMembers = users.filter(
    (user) =>
      user.role === "GOVERNANCE_MEMBER" &&
      user.memberships?.some(
        (membership) =>
          membership.communityId === selectedCommunityId &&
          membership.role === "GOVERNANCE_MEMBER"
      )
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-slate-300 text-xs font-semibold backdrop-blur mb-3">
              <Layers className="w-3.5 h-3.5" />
              Platform Administrator Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Infrastructure & Provisioning</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Register synthetic communities, attach datasets, onboard pseudonymous subjects, and monitor audit security.
            </p>
          </div>
          <button
            onClick={() => {
              loadCommunities();
              loadDatasets();
              loadParticipants();
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("communities")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === "communities"
              ? "border-slate-800 text-slate-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Communities ({communities.length})
        </button>
        <button
          onClick={() => setActiveTab("datasets")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === "datasets"
              ? "border-slate-800 text-slate-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Datasets ({datasets.length})
        </button>
        <button
          onClick={() => setActiveTab("participants")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === "participants"
              ? "border-slate-800 text-slate-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Synthetic Participants ({participants.length})
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === "audit"
              ? "border-slate-800 text-slate-900"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Audit Stream
        </button>
      </div>

      {/* TAB 1: COMMUNITIES */}
      {activeTab === "communities" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* List */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Governing Communities</h2>
            {communities.length === 0 ? (
              <p className="text-sm text-gray-400">No communities found.</p>
            ) : (
              <div className="space-y-3">
                {communities.map((c) => (
                  <div
                    key={c.id}
                    className={`p-4 rounded-xl border transition ${
                      selectedCommunityId === c.id
                        ? "border-indigo-400 bg-indigo-50/40"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{c.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{c.description}</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {c.country || "Synthetic"}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="font-mono text-[11px] text-gray-400">ID: {c.id}</span>
                      <button
                        onClick={() => {
                          setSelectedCommunityId(c.id);
                          setActiveTab("datasets");
                        }}
                        className="font-semibold text-indigo-600 hover:underline cursor-pointer"
                      >
                        View Datasets &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create and membership forms */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                Register Community
              </h3>
              <p className="text-xs text-gray-500 mb-4">Add a new collective governance boundary.</p>
              <form onSubmit={handleCreateCommunity} className="space-y-3">
                <input type="text" required value={commName} onChange={(e) => setCommName(e.target.value)} placeholder="Community name" className="w-full p-2.5 rounded-xl border border-gray-300 text-xs" />
                <textarea rows={2} value={commDesc} onChange={(e) => setCommDesc(e.target.value)} placeholder="Purpose of this community..." className="w-full p-2.5 rounded-xl border border-gray-300 text-xs" />
                <input type="text" required value={commCountry} onChange={(e) => setCommCountry(e.target.value)} placeholder="Country" className="w-full p-2.5 rounded-xl border border-gray-300 text-xs" />
                <button type="submit" disabled={creatingComm} className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs disabled:opacity-50">
                  {creatingComm ? "Registering Community..." : "Create Community"}
                </button>
              </form>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                Assign Governance Member
              </h3>
              <p className="text-xs text-gray-500 mb-4">Only registered users with the GOVERNANCE_MEMBER role can be assigned.</p>
              <div className="mb-4 rounded-xl bg-indigo-50 border border-indigo-100 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-800">
                  Current governance member{currentGovernanceMembers.length === 1 ? "" : "s"}
                </p>
                {currentGovernanceMembers.length > 0 ? (
                  <div className="mt-2 space-y-1">
                    {currentGovernanceMembers.map((user) => (
                      <p key={user.id} className="text-xs text-indigo-950">
                        {user.firstName} {user.lastName} · {user.email}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1 text-xs text-indigo-700">No governance member assigned yet.</p>
                )}
              </div>
              <form onSubmit={handleAssignGovernanceMember} className="space-y-3">
                <select required value={selectedGovernanceUserId} onChange={(e) => setSelectedGovernanceUserId(e.target.value)} className="w-full p-2.5 rounded-xl border border-gray-300 text-xs">
                  <option value="">Select a governance-role user</option>
                  {users.filter((user) => user.role === "GOVERNANCE_MEMBER" && !user.participantProfile).map((user) => (
                    <option key={user.id} value={user.id}>{user.firstName} {user.lastName} · {user.email}</option>
                  ))}
                </select>
                <button type="submit" className="w-full py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs">Assign Governance Role</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATASETS */}
      {activeTab === "datasets" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Datasets</h2>
              <select
                value={selectedCommunityId}
                onChange={(e) => setSelectedCommunityId(e.target.value)}
                className="p-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700"
              >
                {communities.map((c) => (
                  <option key={c.id} value={c.id}>
                    Community: {c.name}
                  </option>
                ))}
              </select>
            </div>

            {datasets.length === 0 ? (
              <p className="text-sm text-gray-400">No datasets found in this community.</p>
            ) : (
              <div className="space-y-3">
                {datasets.map((d) => (
                  <div
                    key={d.id}
                    className={`p-4 rounded-xl border transition ${
                      selectedDatasetId === d.id
                        ? "border-indigo-400 bg-indigo-50/40"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">{d.name}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{d.description}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          d.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {d.status}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="font-mono text-[11px] text-gray-400">ID: {d.id}</span>
                      <button
                        onClick={() => {
                          setSelectedDatasetId(d.id);
                          setActiveTab("participants");
                        }}
                        className="font-semibold text-indigo-600 hover:underline cursor-pointer"
                      >
                        Manage Participants &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Dataset Form */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-indigo-600" />
              Register Dataset
            </h3>
            <p className="text-xs text-gray-500 mb-4">Attach a dataset to the selected community.</p>

            <form onSubmit={handleCreateDataset} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                  Dataset Name
                </label>
                <input
                  type="text"
                  required
                  value={dsName}
                  onChange={(e) => setDsName(e.target.value)}
                  placeholder="e.g. Synthetic Depression Longitudinal Study"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={dsDesc}
                  onChange={(e) => setDsDesc(e.target.value)}
                  placeholder="Dataset scope..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                  Status
                </label>
                <select
                  value={dsStatus}
                  onChange={(e) => setDsStatus(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={creatingDs}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition shadow-sm cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-1.5"
              >
                {creatingDs ? <Spinner size="xs" /> : null}
                <span>{creatingDs ? "Attaching Dataset..." : "Attach Dataset"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: PARTICIPANTS */}
      {activeTab === "participants" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Synthetic Participant Registry</h2>
            <p className="text-xs text-gray-500 mb-4">
              Pseudonymous participant codes registered in dataset: <span className="font-mono text-gray-700">{selectedDatasetId || "None selected"}</span>
            </p>

            {participants.length === 0 ? (
              <p className="text-sm text-gray-400">No participants registered in this dataset.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {participants.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/60 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-mono font-bold text-xs text-gray-900 block">
                        {p.subjectCode}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        UUID: {p.id.slice(0, 8)}...
                      </span>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                      SYNTHETIC
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Provision Participant Form */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              Provision Subject Code
            </h3>
            <p className="text-xs text-gray-500 mb-4">Must contain only uppercase A-Z, 0-9, _ or -.</p>

            <form onSubmit={handleCreateParticipant} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  required
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value.toUpperCase())}
                  placeholder="e.g. PARTICIPANT-D"
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 uppercase mb-1">
                  Existing Registered Participant User
                </label>
                <select
                  value={participantUserId}
                  onChange={(e) => setParticipantUserId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs"
                >
                  <option value="">Create a new participant account instead</option>
                  {users
                    .filter((user) => user.role === "PARTICIPANT")
                    .map((user) => (
                      <option
                        key={user.id}
                        value={user.participantProfile ? "" : user.id}
                        disabled={Boolean(user.participantProfile)}
                      >
                        {user.firstName} {user.lastName} · {user.email}
                        {user.participantProfile ? " (already linked to a dataset)" : ""}
                      </option>
                    ))}
                </select>
              </div>
              {!participantUserId && (
                <>
                  <input type="text" required value={participantFirstName} onChange={(e) => setParticipantFirstName(e.target.value)} placeholder="First name" className="w-full p-2.5 rounded-xl border border-gray-300 text-xs" />
                  <input type="text" required value={participantLastName} onChange={(e) => setParticipantLastName(e.target.value)} placeholder="Last name" className="w-full p-2.5 rounded-xl border border-gray-300 text-xs" />
                  <input type="email" required value={participantEmail} onChange={(e) => setParticipantEmail(e.target.value)} placeholder="Email address" className="w-full p-2.5 rounded-xl border border-gray-300 text-xs" />
                  <p className="text-[11px] text-gray-500">A temporary password will be generated and shown once after creation.</p>
                </>
              )}

              <button
                type="submit"
                disabled={creatingParticipant}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition shadow-sm cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center gap-1.5"
              >
                {creatingParticipant ? <Spinner size="xs" /> : null}
                <span>{creatingParticipant ? "Provisioning Subject Code..." : "Register Subject"}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT VIEW EMBED */}
      {activeTab === "audit" && <AuditorView />}
    </div>
  );
}
