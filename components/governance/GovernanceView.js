"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/Spinner";
import {
  acceptBenefitAgreement,
  approveGovernanceRequest,
  getBenefitAgreementVersions,
  getGovernanceBenefitAgreements,
  getGovernanceRequests,
  rejectBenefitAgreement,
  rejectGovernanceRequest,
} from "@/lib/api";
import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Database,
  FileText,
  HeartHandshake,
  RefreshCw,
  Scale,
  User,
  X,
  XCircle,
} from "lucide-react";

const PAGE_SIZE = 8;
const REQUEST_STATUSES = ["", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];
const AGREEMENT_STATUSES = ["", "PENDING", "ACCEPTED", "REJECTED", "FULFILLED", "CANCELLED"];

function displayName(person, fallback = "Researcher") {
  if (!person) return fallback;
  return `${person.firstName || ""} ${person.lastName || ""}`.trim() || fallback;
}

function formatDate(value, includeTime = false) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    ...(includeTime ? { timeStyle: "short" } : {}),
    timeZone: "UTC",
  }).format(date);
}

function statusClass(status) {
  if (status === "APPROVED" || status === "ACCEPTED" || status === "FULFILLED") {
    return "bg-emerald-100 text-emerald-800";
  }
  if (status === "REJECTED" || status === "CANCELLED") {
    return "bg-rose-100 text-rose-800";
  }
  return "bg-amber-100 text-amber-800";
}

function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages < 2) return null;
  return (
    <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-xs text-gray-500">
      <span>
        Page {page} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="rounded-lg border border-gray-200 p-2 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export default function GovernanceView() {
  const { token, showToast } = useAuth();
  const [activeTab, setActiveTab] = useState("requests");
  const [requestFilters, setRequestFilters] = useState({
    search: "",
    status: "",
    from: "",
    to: "",
    page: 1,
  });
  const [agreementFilters, setAgreementFilters] = useState({
    search: "",
    status: "",
    from: "",
    to: "",
    page: 1,
  });
  const [requests, setRequests] = useState({ items: [], page: 1, total: 0, totalPages: 0 });
  const [agreements, setAgreements] = useState({ items: [], page: 1, total: 0, totalPages: 0 });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [agreementVersions, setAgreementVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState("");
  const [approvedOperations, setApprovedOperations] = useState([
    "ACADEMIC_AGGREGATE_RESEARCH",
  ]);
  const [benefitRejectReason, setBenefitRejectReason] = useState("");
  const [showRejectBenefitInput, setShowRejectBenefitInput] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    const result = await getGovernanceRequests(token, {
      ...requestFilters,
      limit: PAGE_SIZE,
    });
    if (result.ok && result.data) {
      setRequests(result.data);
    } else {
      setRequests({ items: [], page: 1, total: 0, totalPages: 0 });
      showToast(result.error || "Unable to load community research requests", "error");
    }
    setLoading(false);
  }, [token, requestFilters, showToast]);

  const loadAgreements = useCallback(async () => {
    setLoading(true);
    const result = await getGovernanceBenefitAgreements(token, {
      ...agreementFilters,
      limit: PAGE_SIZE,
    });
    if (result.ok && result.data) {
      setAgreements(result.data);
    } else {
      setAgreements({ items: [], page: 1, total: 0, totalPages: 0 });
      showToast(result.error || "Unable to load community benefit agreements", "error");
    }
    setLoading(false);
  }, [token, agreementFilters, showToast]);

  const loadAgreementVersions = useCallback(
    async (requestId) => {
      setLoadingDetail(true);
      const result = await getBenefitAgreementVersions(token, requestId);
      setAgreementVersions(result.ok && Array.isArray(result.data) ? result.data : []);
      if (!result.ok) showToast(result.error || "Unable to load agreement history", "error");
      setLoadingDetail(false);
    },
    [token, showToast],
  );

  useEffect(() => {
    if (activeTab !== "requests") return undefined;
    const timer = setTimeout(() => {
      void loadRequests();
    }, 0);
    return () => clearTimeout(timer);
  }, [activeTab, loadRequests]);

  useEffect(() => {
    if (activeTab !== "agreements") return undefined;
    const timer = setTimeout(() => {
      void loadAgreements();
    }, 0);
    return () => clearTimeout(timer);
  }, [activeTab, loadAgreements]);

  const currentAgreement = agreementVersions[0] || null;
  const requestCountLabel = useMemo(
    () => `${requests.total || 0} ${requests.total === 1 ? "request" : "requests"}`,
    [requests.total],
  );

  const selectRequest = (request) => {
    setSelectedRequest(request);
    setSelectedAgreement(null);
    setReason(
      request.status === "PENDING"
        ? "Only synthetic aggregate academic analysis is appropriate for this demonstration."
        : "",
    );
    setApprovedOperations(["ACADEMIC_AGGREGATE_RESEARCH"]);
  };

  const selectAgreement = (agreement) => {
    setSelectedAgreement(agreement);
    setSelectedRequest(null);
    setAgreementVersions([]);
    setBenefitRejectReason("");
    setShowRejectBenefitInput(false);
    loadAgreementVersions(agreement.researchRequestId);
  };

  const handleApprove = async () => {
    if (!selectedRequest || reason.trim().length < 10 || approvedOperations.length === 0) {
      showToast("Add a reason of at least 10 characters and select an operation", "warning");
      return;
    }
    setSubmitting(true);
    const result = await approveGovernanceRequest(
      token,
      selectedRequest.id,
      reason.trim(),
      approvedOperations,
    );
    if (result.ok) {
      showToast("Research request approved", "success");
      setSelectedRequest(null);
      await loadRequests();
    } else {
      showToast(result.error || "Approval failed", "error");
    }
    setSubmitting(false);
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest || reason.trim().length < 10) {
      showToast("Add a rejection reason of at least 10 characters", "warning");
      return;
    }
    setSubmitting(true);
    const result = await rejectGovernanceRequest(token, selectedRequest.id, reason.trim());
    if (result.ok) {
      showToast("Research request rejected", "info");
      setSelectedRequest(null);
      await loadRequests();
    } else {
      showToast(result.error || "Rejection failed", "error");
    }
    setSubmitting(false);
  };

  const handleAcceptBenefit = async () => {
    if (!currentAgreement) return;
    setSubmitting(true);
    const result = await acceptBenefitAgreement(token, currentAgreement.id);
    if (result.ok) {
      showToast(`Benefit agreement version ${currentAgreement.version} accepted`, "success");
      await loadAgreementVersions(currentAgreement.researchRequestId);
      await loadAgreements();
    } else {
      showToast(result.error || "Unable to accept benefit agreement", "error");
    }
    setSubmitting(false);
  };

  const handleRejectBenefit = async () => {
    if (!currentAgreement) return;
    if (!showRejectBenefitInput) {
      setShowRejectBenefitInput(true);
      return;
    }
    if (benefitRejectReason.trim().length < 10) {
      showToast("Add a rejection note of at least 10 characters", "warning");
      return;
    }
    setSubmitting(true);
    const result = await rejectBenefitAgreement(
      token,
      currentAgreement.id,
      benefitRejectReason.trim(),
    );
    if (result.ok) {
      showToast(`Benefit agreement version ${currentAgreement.version} rejected`, "info");
      setShowRejectBenefitInput(false);
      await loadAgreementVersions(currentAgreement.researchRequestId);
      await loadAgreements();
    } else {
      showToast(result.error || "Unable to reject benefit agreement", "error");
    }
    setSubmitting(false);
  };

  const refresh = () => {
    if (activeTab === "requests") loadRequests();
    else loadAgreements();
  };

  return (
    <div className="animate-in fade-in space-y-8 duration-300">
      <div className="rounded-3xl bg-gradient-to-r from-amber-700 to-amber-900 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-amber-100">
              <Scale className="h-3.5 w-3.5" />
              Community Governance Council
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Community stewardship
            </h1>
            <p className="mt-1 max-w-xl text-sm text-amber-100">
              Review your community&apos;s research requests and benefit-sharing agreements.
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/20 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh list
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-gray-200">
        <button
          type="button"
          onClick={() => setActiveTab("requests")}
          className={`shrink-0 border-b-2 px-4 pb-3 text-sm font-semibold ${
            activeTab === "requests"
              ? "border-amber-600 text-amber-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Research requests
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("agreements")}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 pb-3 text-sm font-semibold ${
            activeTab === "agreements"
              ? "border-amber-600 text-amber-700"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <HeartHandshake className="h-4 w-4" />
          Benefit agreements
        </button>
      </div>

      {activeTab === "requests" && (
        <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <FilterBar
            filters={requestFilters}
            setFilters={setRequestFilters}
            statuses={REQUEST_STATUSES}
            placeholder="Search title, description, or researcher"
            label="Research requests"
            count={requestCountLabel}
          />
          {loading ? (
            <LoadingState label="Loading community research requests..." />
          ) : requests.items.length === 0 ? (
            <EmptyState label="No research requests match these filters." />
          ) : (
            <div className="grid gap-3">
              {requests.items.map((request) => (
                <button
                  type="button"
                  key={request.id}
                  onClick={() => selectRequest(request)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/60 p-4 text-left transition hover:border-amber-300 hover:bg-amber-50/30"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 shrink-0 text-amber-600" />
                        <h3 className="truncate font-bold text-gray-900">{request.title}</h3>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-600">{request.description}</p>
                    </div>
                    <span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusClass(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-amber-600" />
                      {displayName(request.researcher)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Database className="h-3.5 w-3.5 text-amber-600" />
                      {request.dataset?.name || "Community dataset"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-amber-600" />
                      {formatDate(request.createdAt)}
                    </span>
                    <span>{request.benefitAgreements?.[0]?.status || "No benefit agreement"}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
          <Pagination
            page={requests.page}
            totalPages={requests.totalPages}
            onChange={(page) => setRequestFilters((current) => ({ ...current, page }))}
          />
        </section>
      )}

      {activeTab === "agreements" && (
        <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <FilterBar
            filters={agreementFilters}
            setFilters={setAgreementFilters}
            statuses={AGREEMENT_STATUSES}
            placeholder="Search agreement, request title, or researcher"
            label="Benefit-sharing agreements"
            count={`${agreements.total || 0} ${agreements.total === 1 ? "agreement" : "agreements"}`}
          />
          {loading ? (
            <LoadingState label="Loading community benefit agreements..." />
          ) : agreements.items.length === 0 ? (
            <EmptyState label="No benefit agreements match these filters." />
          ) : (
            <div className="grid gap-3">
              {agreements.items.map((agreement) => (
                <button
                  type="button"
                  key={agreement.id}
                  onClick={() => selectAgreement(agreement)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/60 p-4 text-left transition hover:border-amber-300 hover:bg-amber-50/30"
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <HeartHandshake className="h-4 w-4 shrink-0 text-amber-600" />
                        <h3 className="truncate font-bold text-gray-900">
                          {agreement.researchRequest?.title || "Benefit-sharing agreement"}
                        </h3>
                        <span className="text-[10px] text-gray-400">v{agreement.version}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs text-gray-600">{agreement.description}</p>
                    </div>
                    <span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusClass(agreement.status)}`}>
                      {agreement.status}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-amber-600" />
                      {displayName(agreement.researcher)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-amber-600" />
                      {formatDate(agreement.createdAt)}
                    </span>
                    {agreement.rejectionReason && <span className="text-rose-700">Revision note recorded</span>}
                  </div>
                </button>
              ))}
            </div>
          )}
          <Pagination
            page={agreements.page}
            totalPages={agreements.totalPages}
            onChange={(page) => setAgreementFilters((current) => ({ ...current, page }))}
          />
        </section>
      )}

      {selectedRequest && (
        <RequestDetail
          request={selectedRequest}
          reason={reason}
          setReason={setReason}
          approvedOperations={approvedOperations}
          setApprovedOperations={setApprovedOperations}
          submitting={submitting}
          onClose={() => setSelectedRequest(null)}
          onApprove={handleApprove}
          onReject={handleRejectRequest}
          onViewAgreement={() => {
            setActiveTab("agreements");
            setAgreementVersions([]);
            setSelectedAgreement({
              researchRequestId: selectedRequest.id,
              researchRequest: { title: selectedRequest.title },
            });
            loadAgreementVersions(selectedRequest.id);
            setSelectedRequest(null);
          }}
        />
      )}

      {selectedAgreement && (
        <AgreementDetail
          agreement={currentAgreement}
          requestTitle={selectedAgreement.researchRequest?.title}
          versions={agreementVersions}
          loading={loadingDetail}
          submitting={submitting}
          rejectReason={benefitRejectReason}
          setRejectReason={setBenefitRejectReason}
          showRejectInput={showRejectBenefitInput}
          setShowRejectInput={setShowRejectBenefitInput}
          onClose={() => setSelectedAgreement(null)}
          onAccept={handleAcceptBenefit}
          onReject={handleRejectBenefit}
        />
      )}
    </div>
  );
}

function FilterBar({ filters, setFilters, statuses, placeholder, label, count }) {
  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  return (
    <div className="space-y-3 border-b border-gray-100 pb-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">{label}</h2>
          <p className="text-xs text-gray-500">{count} in your community · Select an item to view details and actions.</p>
        </div>
        <select
          value={filters.status}
          onChange={(event) => update("status", event.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 focus:border-amber-500 focus:outline-none"
          aria-label={`${label} status`}
        >
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status ? status.replaceAll("_", " ") : "All statuses"}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <input
          value={filters.search}
          onChange={(event) => update("search", event.target.value)}
          placeholder={placeholder}
          className="rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-amber-500 focus:outline-none lg:col-span-2"
        />
        <label className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-500">
          From
          <input type="date" value={filters.from} onChange={(event) => update("from", event.target.value)} className="min-w-0 flex-1 text-gray-700 focus:outline-none" />
        </label>
        <label className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-500">
          To
          <input type="date" value={filters.to} onChange={(event) => update("to", event.target.value)} className="min-w-0 flex-1 text-gray-700 focus:outline-none" />
        </label>
      </div>
    </div>
  );
}

function LoadingState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center text-xs text-gray-500">
      <Spinner size="md" />
      <p>{label}</p>
    </div>
  );
}

function EmptyState({ label }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center text-sm text-gray-400">
      {label}
    </div>
  );
}

function RequestDetail({
  request,
  reason,
  setReason,
  approvedOperations,
  setApprovedOperations,
  submitting,
  onClose,
  onApprove,
  onReject,
  onViewAgreement,
}) {
  const operations = request.requestedConsentOperations || [];
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
      <div className="mx-auto mt-8 max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Research request details</p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">{request.title}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100" aria-label="Close details">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 grid gap-3 rounded-xl bg-gray-50 p-4 text-xs text-gray-700 sm:grid-cols-2">
          <p><strong>Researcher:</strong> {displayName(request.researcher)}</p>
          <p><strong>Dataset:</strong> {request.dataset?.name || "Community dataset"}</p>
          <p><strong>Submitted:</strong> {formatDate(request.createdAt)}</p>
          <p><strong>Status:</strong> <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusClass(request.status)}`}>{request.status}</span></p>
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700">{request.description}</p>
        <div className="mt-5">
          <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">Requested operations</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {operations.map((operation) => (
              <label key={operation} className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs">
                <input
                  type="checkbox"
                  checked={approvedOperations.includes(operation)}
                  disabled={request.status !== "PENDING"}
                  onChange={() =>
                    setApprovedOperations((current) =>
                      current.includes(operation)
                        ? current.filter((item) => item !== operation)
                        : [...current, operation],
                    )
                  }
                />
                {operation.replaceAll("_", " ")}
              </label>
            ))}
          </div>
        </div>
        {request.status === "PENDING" && (
          <div className="mt-5">
            <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Decision reason</label>
            <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-amber-500 focus:outline-none" />
          </div>
        )}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button type="button" onClick={onViewAgreement} className="rounded-xl border border-amber-300 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50">
            View benefit agreement
          </button>
          {request.status === "PENDING" && (
            <>
              <button type="button" disabled={submitting} onClick={onReject} className="flex items-center gap-1 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50">
                <XCircle className="h-4 w-4" /> Reject
              </button>
              <button type="button" disabled={submitting} onClick={onApprove} className="flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                <CheckCircle className="h-4 w-4" /> Approve
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function AgreementDetail({
  agreement,
  requestTitle,
  versions,
  loading,
  submitting,
  rejectReason,
  setRejectReason,
  showRejectInput,
  setShowRejectInput,
  onClose,
  onAccept,
  onReject,
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4">
      <div className="mx-auto mt-8 max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Benefit agreement details</p>
            <h2 className="mt-1 text-xl font-bold text-gray-900">{agreement?.researchRequest?.title || requestTitle || "Agreement"}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100" aria-label="Close details">
            <X className="h-5 w-5" />
          </button>
        </div>
        {loading ? (
          <LoadingState label="Loading agreement versions..." />
        ) : !agreement ? (
          <EmptyState label="No agreement version is available for this request." />
        ) : (
          <>
            <div className="mt-5 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-gray-700">Version {agreement.version}</span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusClass(agreement.status)}`}>{agreement.status}</span>
            </div>
            <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm leading-6 text-gray-700">{agreement.description}</p>
            <p className="mt-3 text-xs text-gray-500">Submitted {formatDate(agreement.createdAt, true)}</p>
            {agreement.rejectionReason && (
              <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-900">
                <strong>Governance revision note:</strong> {agreement.rejectionReason}
              </div>
            )}
            {showRejectInput && agreement.status === "PENDING" && (
              <textarea value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} rows={3} placeholder="Explain what should be revised..." className="mt-4 w-full rounded-xl border border-rose-300 p-3 text-sm focus:outline-none" />
            )}
            {agreement.status === "PENDING" && (
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button type="button" disabled={submitting} onClick={onReject} className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50">
                  {showRejectInput ? "Submit rejection note" : "Reject with note"}
                </button>
                <button type="button" disabled={submitting || showRejectInput} onClick={onAccept} className="flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                  <Check className="h-4 w-4" /> Accept agreement
                </button>
              </div>
            )}
            <div className="mt-6 border-t border-gray-100 pt-4">
              <h3 className="text-xs font-bold uppercase tracking-wide text-gray-500">Version history</h3>
              <div className="mt-2 space-y-2">
                {versions.map((version) => (
                  <div key={version.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs">
                    <span>Version {version.version} · {formatDate(version.createdAt)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusClass(version.status)}`}>{version.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
