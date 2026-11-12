"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/Spinner";
import {
  getResearcherRequests,
  createResearcherRequest,
  evaluateAccessAuthorization,
  executeDataAccess,
  getBenefitAgreement,
  createBenefitAgreement,
  updateBenefitAgreement,
} from "@/lib/api";
import {
  FlaskConical,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  HeartHandshake,
  BarChart3,
  RefreshCw,
  Send,
  Eye,
  FileCheck,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Check,
  Ban,
} from "lucide-react";

export default function ResearcherView() {
  const { token, showToast } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("evaluate"); // 'evaluate' | 'requests' | 'new-request' | 'benefits'

  // Selected request for authorization testing
  const [selectedRequestId, setSelectedRequestId] = useState("60000000-0000-4000-8000-000000000001");
  const [evaluating, setEvaluating] = useState(false);
  const [evalResults, setEvalResults] = useState({});
  const [executing, setExecuting] = useState(false);
  const [executionOutput, setExecutionOutput] = useState(null);

  // New Request Form State
  const [datasetId, setDatasetId] = useState("30000000-0000-4000-8000-000000000001");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [purpose, setPurpose] = useState("ACADEMIC");
  const [operations, setOperations] = useState([
    "ACADEMIC_AGGREGATE_RESEARCH",
    "IDENTIFIABLE_RECORD_ACCESS",
    "COMMERCIAL_AI_TRAINING",
  ]);
  const [submittingRequest, setSubmittingRequest] = useState(false);

  // Benefit Agreement State
  const [benefitAgreement, setBenefitAgreement] = useState(null);
  const [benefitDescription, setBenefitDescription] = useState("");
  const [savingBenefit, setSavingBenefit] = useState(false);
  const [updatingBenefitStatus, setUpdatingBenefitStatus] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    const res = await getResearcherRequests(token);
    if (res.ok && Array.isArray(res.data)) {
      setRequests(res.data);
      if (res.data.length > 0 && !selectedRequestId) {
        setSelectedRequestId(res.data[0].id);
      }
    }
    setLoading(false);
  }, [token, selectedRequestId]);

  const loadBenefit = useCallback(async () => {
    if (!selectedRequestId) return;
    const res = await getBenefitAgreement(token, selectedRequestId);
    if (res.ok && res.data) {
      setBenefitAgreement(res.data);
    } else {
      setBenefitAgreement(null);
    }
  }, [token, selectedRequestId]);

  useEffect(() => {
    let active = true;
    getResearcherRequests(token)
      .then((res) => {
        if (!active) return;
        if (res.ok && Array.isArray(res.data)) {
          setRequests(res.data);
          if (res.data.length > 0 && !selectedRequestId) {
            setSelectedRequestId(res.data[0].id);
          }
        }
        setLoading(false);
      })
      .catch((error) => {
        if (!active) return;
        setLoading(false);
        showToast(error.message || "Failed to fetch research requests", "error");
      });

    return () => {
      active = false;
    };
  }, [token, selectedRequestId, showToast]);

  useEffect(() => {
    if (!selectedRequestId) return undefined;
    let active = true;
    getBenefitAgreement(token, selectedRequestId)
      .then((res) => {
        if (!active) return;
        setBenefitAgreement(res.ok && res.data ? res.data : null);
      })
      .catch((error) => {
        if (!active) return;
        setBenefitAgreement(null);
        showToast(error.message || "Failed to fetch benefit agreement", "error");
      });

    return () => {
      active = false;
    };
  }, [token, selectedRequestId, showToast]);

  // Test access authorization
  const handleEvaluate = async (operation) => {
    if (!selectedRequestId) {
      showToast("Please enter or select a valid Research Request ID", "warning");
      return;
    }
    setEvaluating(true);
    const res = await evaluateAccessAuthorization(token, selectedRequestId, operation);
    if (res.ok && res.data) {
      setEvalResults((prev) => ({
        ...prev,
        [operation]: res.data,
      }));
      if (res.data.decision === "ALLOW") {
        showToast(`Authorization ALLOWED for ${operation}`, "success");
      } else {
        showToast(`Authorization DENIED: ${res.data.reasonCode || "Blocked"}`, "warning");
      }
    } else {
      showToast(res.error || "Authorization evaluation failed", "error");
    }
    setEvaluating(false);
  };

  // Execute actual data access
  const handleExecute = async (operation) => {
    if (!selectedRequestId) {
      showToast("Please enter or select a valid Research Request ID", "warning");
      return;
    }
    setExecuting(true);
    setExecutionOutput(null);
    const res = await executeDataAccess(token, selectedRequestId, operation);
    if (res.ok && res.data) {
      setExecutionOutput(res.data);
      if (res.data.decision === "DENY") {
        showToast(`Access execution denied: ${res.data.reasonCode || ""}`, "error");
      } else {
        showToast("Synthetic aggregate dataset fetched successfully!", "success");
      }
    } else {
      showToast(res.error || "Data access execution failed", "error");
    }
    setExecuting(false);
  };

  // Submit new proposal
  const handleCreateRequest = async (e) => {
    e.preventDefault();
    if (operations.length === 0) {
      showToast("Please select at least one operation to request", "warning");
      return;
    }
    setSubmittingRequest(true);
    const res = await createResearcherRequest(token, {
      datasetId,
      title,
      description,
      purpose,
      operations,
    });

    if (res.ok && res.data) {
      showToast("Research proposal submitted successfully! Pending governance review.", "success");
      setSelectedRequestId(res.data.id);
      setTitle("");
      setDescription("");
      await loadRequests();
      setActiveTab("requests");
    } else {
      showToast(res.error || "Failed to submit proposal", "error");
    }
    setSubmittingRequest(false);
  };

  // Submit benefit agreement
  const handleCreateBenefit = async (e) => {
    e.preventDefault();
    if (!benefitDescription.trim()) return;
    setSavingBenefit(true);
    const res = await createBenefitAgreement(token, {
      researchRequestId: selectedRequestId,
      communityId: "20000000-0000-4000-8000-000000000001",
      description: benefitDescription,
    });

    if (res.ok) {
      showToast("Benefit-sharing commitment recorded! Now awaiting community governance acceptance.", "success");
      setBenefitDescription("");
      await loadBenefit();
    } else {
      showToast(res.error || "Failed to record commitment", "error");
    }
    setSavingBenefit(false);
  };

  // Update benefit agreement status (FULFILLED or CANCELLED)
  const handleUpdateBenefitStatus = async (status) => {
    if (!benefitAgreement?.id) return;
    setUpdatingBenefitStatus(true);
    const res = await updateBenefitAgreement(token, benefitAgreement.id, status);
    if (res.ok) {
      showToast(`Benefit agreement status updated to ${status}!`, "success");
      await loadBenefit();
    } else {
      showToast(res.error || "Failed to update status", "error");
    }
    setUpdatingBenefitStatus(false);
  };

  const toggleOp = (op) => {
    setOperations((prev) =>
      prev.includes(op) ? prev.filter((item) => item !== op) : [...prev, op]
    );
  };

  // Check if benefit agreement denial happened in any test
  const hasBenefitAgreementDenial = Object.values(evalResults).some(
    (res) => res?.reasonCode === "BENEFIT_AGREEMENT_NOT_ACCEPTED"
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-blue-100 text-xs font-semibold backdrop-blur mb-3">
              <FlaskConical className="w-3.5 h-3.5" />
              Researcher Workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Access Control & Queries</h1>
            <p className="text-blue-100 text-sm mt-1 max-w-xl">
              Deterministic double-lock access enforcement. Access requires both community approval and an accepted
              community benefit agreement.
            </p>
          </div>
          <button
            onClick={() => {
              loadRequests();
              loadBenefit();
            }}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Visual Workflow Tracker */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-sm">
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-3">
          Prerequisite Chain for Data Access:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/70">
            <span className="font-bold text-blue-900 block">1. Research Proposal</span>
            <span className="text-blue-700 text-[11px]">Submitted & Approved</span>
          </div>
          <div className={`p-3 rounded-xl border ${
            benefitAgreement ? "border-amber-300 bg-amber-50/70" : "border-gray-200 bg-gray-50 text-gray-400"
          }`}>
            <span className="font-bold text-gray-900 block">2. Benefit Commitment</span>
            <span className="text-[11px] text-gray-600">
              {benefitAgreement ? `Submitted (v${benefitAgreement?.version})` : "Not Yet Created"}
            </span>
          </div>
          <div className={`p-3 rounded-xl border ${
            benefitAgreement?.status === "ACCEPTED"
              ? "border-emerald-300 bg-emerald-50/70 text-emerald-900"
              : "border-gray-200 bg-gray-50 text-gray-400"
          }`}>
            <span className="font-bold block">3. Governance Acceptance</span>
            <span className="text-[11px]">
              {benefitAgreement?.status === "ACCEPTED" ? "Accepted by Community!" : "Awaiting Acceptance"}
            </span>
          </div>
          <div className={`p-3 rounded-xl border ${
            benefitAgreement?.status === "ACCEPTED"
              ? "border-emerald-300 bg-emerald-50/70 text-emerald-900"
              : "border-gray-200 bg-gray-50 text-gray-400"
          }`}>
            <span className="font-bold block">4. Data Access</span>
            <span className="text-[11px]">
              {benefitAgreement?.status === "ACCEPTED" ? "Unlocked for Aggregate Study" : "Locked"}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("evaluate")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === "evaluate"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Access & Execution Testing
        </button>
        <button
          onClick={() => setActiveTab("benefits")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition cursor-pointer shrink-0 flex items-center gap-2 ${
            activeTab === "benefits"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Benefit-Sharing
          {benefitAgreement && (
            <span
              className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                benefitAgreement.status === "ACCEPTED"
                  ? "bg-emerald-100 text-emerald-800"
                  : benefitAgreement.status === "REJECTED"
                  ? "bg-rose-100 text-rose-800"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {benefitAgreement.status}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === "requests"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          My Proposals ({requests.length})
        </button>
        <button
          onClick={() => setActiveTab("new-request")}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 transition cursor-pointer shrink-0 ${
            activeTab === "new-request"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Submit Proposal
        </button>
      </div>

      {/* TAB 1: ACCESS EVALUATION & EXECUTION */}
      {activeTab === "evaluate" && (
        <div className="space-y-6">
          {/* Benefit Agreement Denial Warning Banner */}
          {hasBenefitAgreementDenial && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 flex items-start justify-between gap-4 text-amber-950 text-xs sm:text-sm animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Access Denied: Benefit-Sharing Agreement Required</span>
                  <p className="text-xs text-amber-800 mt-0.5">
                    Research approval alone does not permit data access. You must create a community benefit agreement
                    and have a community governance member accept it.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("benefits")}
                className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 cursor-pointer"
              >
                Go to Benefit-Sharing &rarr;
              </button>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Target Research Request</h2>
            <p className="text-xs text-gray-500 mb-4">
              Select or type the UUID of the request to evaluate. The pre-seeded demo request is pre-filled.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={selectedRequestId}
                onChange={(e) => setSelectedRequestId(e.target.value)}
                placeholder="60000000-0000-4000-8000-000000000001"
                className="flex-1 p-2.5 rounded-xl border border-gray-300 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setSelectedRequestId("60000000-0000-4000-8000-000000000001")}
                className="px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition cursor-pointer shrink-0"
              >
                Reset to Demo Request
              </button>
            </div>
          </div>

          {/* Operation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Op 1: Academic Aggregate Research */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Operation 1</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Expected: ALLOW
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1">Academic Aggregate</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Approved by governance, consented by participants, with an accepted benefit agreement.
                </p>

                {evalResults["ACADEMIC_AGGREGATE_RESEARCH"] && (
                  <div
                    className={`p-3 rounded-xl mb-4 text-xs font-mono border ${
                      evalResults["ACADEMIC_AGGREGATE_RESEARCH"].decision === "ALLOW"
                        ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                        : "bg-rose-50 text-rose-900 border-rose-200"
                    }`}
                  >
                    <div className="font-bold">
                      Decision: {evalResults["ACADEMIC_AGGREGATE_RESEARCH"].decision}
                    </div>
                    {evalResults["ACADEMIC_AGGREGATE_RESEARCH"].reasonCode && (
                      <div className="text-[11px] text-gray-600 mt-1">
                        Reason: {evalResults["ACADEMIC_AGGREGATE_RESEARCH"].reasonCode}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEvaluate("ACADEMIC_AGGREGATE_RESEARCH")}
                  disabled={evaluating}
                  className="w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {evaluating ? <Spinner size="xs" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>Test Authorization Check</span>
                </button>
                <button
                  onClick={() => handleExecute("ACADEMIC_AGGREGATE_RESEARCH")}
                  disabled={executing}
                  className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {executing ? <Spinner size="xs" /> : <Play className="w-3.5 h-3.5" />}
                  <span>Execute Data Access</span>
                </button>
              </div>
            </div>

            {/* Op 2: Identifiable Record Access */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Operation 2</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    Expected: DENY
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1">Identifiable Records</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Refused by participant consent and rejected by community governance.
                </p>

                {evalResults["IDENTIFIABLE_RECORD_ACCESS"] && (
                  <div
                    className={`p-3 rounded-xl mb-4 text-xs font-mono border ${
                      evalResults["IDENTIFIABLE_RECORD_ACCESS"].decision === "ALLOW"
                        ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                        : "bg-rose-50 text-rose-900 border-rose-200"
                    }`}
                  >
                    <div className="font-bold">
                      Decision: {evalResults["IDENTIFIABLE_RECORD_ACCESS"].decision}
                    </div>
                    {evalResults["IDENTIFIABLE_RECORD_ACCESS"].reasonCode && (
                      <div className="text-[11px] text-gray-600 mt-1">
                        Reason: {evalResults["IDENTIFIABLE_RECORD_ACCESS"].reasonCode}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEvaluate("IDENTIFIABLE_RECORD_ACCESS")}
                  disabled={evaluating}
                  className="w-full py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {evaluating ? <Spinner size="xs" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>Test Authorization Check</span>
                </button>
                <button
                  onClick={() => handleExecute("IDENTIFIABLE_RECORD_ACCESS")}
                  disabled={executing}
                  className="w-full py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {executing ? <Spinner size="xs" /> : <Play className="w-3.5 h-3.5" />}
                  <span>Execute (Should Deny)</span>
                </button>
              </div>
            </div>

            {/* Op 3: Commercial AI Training */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600">Operation 3</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    Expected: DENY
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1">Commercial AI Training</h3>
                <p className="text-xs text-gray-500 mb-4">
                  Refused by participant consent and rejected by community governance.
                </p>

                {evalResults["COMMERCIAL_AI_TRAINING"] && (
                  <div
                    className={`p-3 rounded-xl mb-4 text-xs font-mono border ${
                      evalResults["COMMERCIAL_AI_TRAINING"].decision === "ALLOW"
                        ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                        : "bg-rose-50 text-rose-900 border-rose-200"
                    }`}
                  >
                    <div className="font-bold">
                      Decision: {evalResults["COMMERCIAL_AI_TRAINING"].decision}
                    </div>
                    {evalResults["COMMERCIAL_AI_TRAINING"].reasonCode && (
                      <div className="text-[11px] text-gray-600 mt-1">
                        Reason: {evalResults["COMMERCIAL_AI_TRAINING"].reasonCode}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleEvaluate("COMMERCIAL_AI_TRAINING")}
                  disabled={evaluating}
                  className="w-full py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {evaluating ? <Spinner size="xs" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>Test Authorization Check</span>
                </button>
                <button
                  onClick={() => handleExecute("COMMERCIAL_AI_TRAINING")}
                  disabled={executing}
                  className="w-full py-2 px-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {executing ? <Spinner size="xs" /> : <Play className="w-3.5 h-3.5" />}
                  <span>Execute (Should Deny)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Execution Output Viewer */}
          {executionOutput && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm animate-in fade-in duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-gray-900 text-base">Execution Query Response</h3>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    executionOutput.decision === "ALLOW"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {executionOutput.decision === "ALLOW" ? "SUCCESS / ALLOWED" : "DENIED"}
                </span>
              </div>

              <p className="text-xs text-gray-500 mb-4">
                Raw JSON response returned by the backend data access path. Sensitive participant identities are guaranteed never returned.
              </p>

              <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-80 shadow-inner">
                <pre>{JSON.stringify(executionOutput, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BENEFIT SHARING (UPDATED WORKFLOW) */}
      {activeTab === "benefits" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Community Benefit-Sharing Agreement</h2>
              <p className="text-xs text-gray-500">
                Data access requires an agreement with status <code className="font-semibold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded">ACCEPTED</code> by community governance.
              </p>
            </div>
          </div>

          {benefitAgreement ? (
            <div className="space-y-4">
              <div
                className={`p-6 rounded-2xl border space-y-4 ${
                  benefitAgreement.status === "ACCEPTED"
                    ? "bg-emerald-50/60 border-emerald-300"
                    : benefitAgreement.status === "REJECTED"
                    ? "bg-rose-50/60 border-rose-300"
                    : benefitAgreement.status === "PENDING"
                    ? "bg-amber-50/60 border-amber-300"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700">
                      Agreement Version {benefitAgreement.version}
                    </span>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        benefitAgreement.status === "ACCEPTED"
                          ? "bg-emerald-100 text-emerald-800"
                          : benefitAgreement.status === "REJECTED"
                          ? "bg-rose-100 text-rose-800"
                          : benefitAgreement.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      {benefitAgreement.status}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-gray-500">
                    ID: {benefitAgreement.id}
                  </span>
                </div>

                <p className="text-sm text-gray-900 font-medium leading-relaxed bg-white/70 p-4 rounded-xl border border-gray-100">
                  {benefitAgreement.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
                  <div>
                    <span className="font-semibold text-gray-500 block">Commitment Date:</span>
                    <span>{new Date(benefitAgreement.commitmentDate || benefitAgreement.createdAt).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-500 block">Community Governance Acceptance:</span>
                    <span>
                      {benefitAgreement.status === "ACCEPTED"
                        ? "Accepted by Community Governance Council"
                        : benefitAgreement.status === "PENDING"
                        ? "Awaiting Governance Review"
                        : benefitAgreement.status === "REJECTED"
                        ? "Rejected by Council (Resubmission Permitted)"
                        : benefitAgreement.status}
                    </span>
                  </div>
                </div>

                {/* Governance Rejection Reason Note */}
                {benefitAgreement.rejectionReason && (
                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1.5">
                    <span className="font-bold flex items-center gap-1.5 text-rose-900">
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      Governance Council Rejection Feedback Note:
                    </span>
                    <p className="italic text-rose-900 bg-white/80 p-3 rounded-lg border border-rose-200 font-medium text-xs">
                      &quot;{benefitAgreement.rejectionReason}&quot;
                    </p>
                  </div>
                )}

                {/* Status Update Actions for Researcher */}
                {benefitAgreement.status === "ACCEPTED" && (
                  <div className="pt-3 border-t border-emerald-200/60 flex items-center justify-between gap-3">
                    <span className="text-xs text-emerald-800 font-medium">
                      Status: <strong>Access Enabled</strong>. Once you have delivered your findings to the community:
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdateBenefitStatus("FULFILLED")}
                        disabled={updatingBenefitStatus}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Mark Fulfilled
                      </button>
                      <button
                        onClick={() => handleUpdateBenefitStatus("CANCELLED")}
                        disabled={updatingBenefitStatus}
                        className="px-3 py-1.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-semibold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* If Rejected, allow submitting a revision (v+1) */}
              {benefitAgreement.status === "REJECTED" && (
                <div className="p-5 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-4">
                  <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                    <Plus className="w-4 h-4 text-rose-600" />
                    Submit Revised Agreement (v{benefitAgreement.version + 1})
                  </h3>
                  <p className="text-xs text-gray-500">
                    The prior version was rejected by community governance. Address the community concerns and submit an updated commitment.
                  </p>
                  <form onSubmit={handleCreateBenefit} className="space-y-3">
                    <textarea
                      required
                      rows={3}
                      value={benefitDescription}
                      onChange={(e) => setBenefitDescription(e.target.value)}
                      placeholder="Updated commitment statement..."
                      className="w-full p-3 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={savingBenefit}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer"
                    >
                      {savingBenefit ? "Submitting..." : "Submit Revised Version"}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleCreateBenefit} className="space-y-4">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900">
                <strong>No benefit agreement exists for this request yet.</strong>
                <p className="mt-1 text-blue-800">
                  You must record a financial or non-financial commitment before the community governance council can review and unlock access.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Benefit Commitment Statement
                </label>
                <textarea
                  required
                  rows={4}
                  value={benefitDescription}
                  onChange={(e) => setBenefitDescription(e.target.value)}
                  placeholder="The research team commits to sharing the research findings with the contributing community and providing a knowledge-sharing session..."
                  className="w-full p-3 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={savingBenefit}
                className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {savingBenefit ? (
                  <>
                    <Spinner size="sm" />
                    <span>Transacting with Blockchain / Ledger...</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>Record Benefit-Sharing Commitment (Starts as PENDING)</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      )}

      {/* TAB 3: MY PROPOSALS */}
      {activeTab === "requests" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Your Submitted Research Requests</h2>
            <button
              onClick={() => setActiveTab("new-request")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              New Proposal
            </button>
          </div>

          {requests.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              No research requests found. Click &quot;Submit Proposal&quot; to create one.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {requests.map((req) => (
                <div key={req.id} className="py-4 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{req.title}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{req.description}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase shrink-0 ${
                        req.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-800"
                          : req.status === "REJECTED"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[11px] font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                      ID: {req.id}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedRequestId(req.id);
                        setActiveTab("evaluate");
                        showToast(`Selected request ${req.title}`, "info");
                      }}
                      className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer ml-auto"
                    >
                      Select For Authorization Testing &rarr;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SUBMIT NEW PROPOSAL */}
      {activeTab === "new-request" && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Submit New Research Proposal</h2>
          <p className="text-xs text-gray-500 mb-6">
            Proposals are placed into community governance queue and must be approved before benefit agreement submission and data access.
          </p>

          <form onSubmit={handleCreateRequest} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Target Dataset ID
              </label>
              <input
                type="text"
                required
                value={datasetId}
                onChange={(e) => setDatasetId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Study Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Statistical Patterns in Community Wellness Indices"
                className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Description & Research Methodology
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your scientific objectives, methodology, and why community aggregate data is needed..."
                className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Research Purpose
              </label>
              <select
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ACADEMIC">ACADEMIC</option>
                <option value="PUBLIC_HEALTH">PUBLIC_HEALTH</option>
                <option value="COMMERCIAL">COMMERCIAL</option>
                <option value="AI_TRAINING">AI_TRAINING</option>
                <option value="OTHER">OTHER</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Requested Operations
              </label>
              <div className="space-y-2">
                {[
                  "ACADEMIC_AGGREGATE_RESEARCH",
                  "IDENTIFIABLE_RECORD_ACCESS",
                  "COMMERCIAL_AI_TRAINING",
                ].map((op) => (
                  <label
                    key={op}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={operations.includes(op)}
                      onChange={() => toggleOp(op)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span className="text-xs font-mono font-medium text-gray-800">{op}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingRequest}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
            >
              {submittingRequest ? (
                <>
                  <Spinner size="sm" />
                  <span>Submitting to Community Governance Queue...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit to Community Governance</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
