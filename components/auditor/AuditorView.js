"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/Spinner";
import { getAuditEvents } from "@/lib/api";
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Database,
  User,
  Clock,
} from "lucide-react";

export default function AuditorView() {
  const { token, showToast } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [researchRequestId, setResearchRequestId] = useState("");
  const [datasetId, setDatasetId] = useState("");
  const [eventType, setEventType] = useState("");
  const [outcome, setOutcome] = useState("");
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const loadAuditEvents = useCallback(async () => {
    setLoading(true);
    const res = await getAuditEvents(token, {
      researchRequestId: researchRequestId || undefined,
      datasetId: datasetId || undefined,
      eventType: eventType || undefined,
      outcome: outcome || undefined,
      page: page.toString(),
      limit: "25",
    });

    if (res.ok && Array.isArray(res.data)) {
      setEvents(res.data);
    } else {
      setEvents([]);
      showToast(res.error || "Failed to fetch audit events", "error");
    }
    setLoading(false);
  }, [token, researchRequestId, datasetId, eventType, outcome, page, showToast]);

  useEffect(() => {
    let active = true;
    getAuditEvents(token, {
      researchRequestId: researchRequestId || undefined,
      datasetId: datasetId || undefined,
      eventType: eventType || undefined,
      outcome: outcome || undefined,
      page: page.toString(),
      limit: "25",
    })
      .then((res) => {
        if (!active) return;

        if (res.ok && Array.isArray(res.data)) {
          setEvents(res.data);
        } else {
          setEvents([]);
          showToast(res.error || "Failed to fetch audit events", "error");
        }
      })
      .catch((error) => {
        if (!active) return;
        setEvents([]);
        showToast(error.message || "Failed to fetch audit events", "error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, researchRequestId, datasetId, eventType, outcome, page, showToast]);

  const handleResetFilters = () => {
    setResearchRequestId("");
    setDatasetId("");
    setEventType("");
    setOutcome("");
    setPage(1);
  };

  const handlePresetDenied = () => {
    setOutcome("DENIED");
    setEventType("");
    setPage(1);
  };

  const handlePresetWithdrawals = () => {
    setEventType("CONSENT_WITHDRAWN");
    setOutcome("");
    setPage(1);
  };

  const handlePresetBenefits = () => {
    setEventType("BENEFIT_AGREEMENT_UPDATED");
    setOutcome("");
    setPage(1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-emerald-100 text-xs font-semibold backdrop-blur mb-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              Auditor Compliance Center
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Audit Stream & Chain of Custody</h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-xl">
              Inspect immutable audit records of all research submissions, governance decisions, access authorizations,
              policy denials, and consent revocations.
            </p>
          </div>
          <button
            onClick={loadAuditEvents}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Stream
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-bold text-gray-900">Audit Filters</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePresetDenied}
              className="text-xs px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-semibold hover:bg-rose-100 transition cursor-pointer"
            >
              Denied Attempts Only
            </button>
            <button
              onClick={handlePresetWithdrawals}
              className="text-xs px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-semibold hover:bg-purple-100 transition cursor-pointer"
            >
              Consent Withdrawals
            </button>
            <button
              onClick={handlePresetBenefits}
              className="text-xs px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-semibold hover:bg-amber-100 transition cursor-pointer"
            >
              Benefit Agreements
            </button>
            <button
              onClick={handleResetFilters}
              className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium transition cursor-pointer"
            >
              Clear All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">
              Research Request UUID
            </label>
            <input
              type="text"
              value={researchRequestId}
              onChange={(e) => {
                setResearchRequestId(e.target.value);
                setPage(1);
              }}
              placeholder="e.g. 60000000-..."
              className="w-full p-2 rounded-xl border border-gray-200 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">
              Dataset UUID
            </label>
            <input
              type="text"
              value={datasetId}
              onChange={(e) => {
                setDatasetId(e.target.value);
                setPage(1);
              }}
              placeholder="e.g. 30000000-..."
              className="w-full p-2 rounded-xl border border-gray-200 font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">
              Event Type
            </label>
            <select
              value={eventType}
              onChange={(e) => {
                setEventType(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">All Event Types</option>
              <option value="RESEARCH_REQUEST_SUBMITTED">RESEARCH_REQUEST_SUBMITTED</option>
              <option value="GOVERNANCE_DECISION_RECORDED">GOVERNANCE_DECISION_RECORDED</option>
              <option value="CONSENT_WITHDRAWN">CONSENT_WITHDRAWN</option>
              <option value="ACCESS_AUTHORIZATION_ALLOWED">ACCESS_AUTHORIZATION_ALLOWED</option>
              <option value="ACCESS_AUTHORIZATION_DENIED">ACCESS_AUTHORIZATION_DENIED</option>
              <option value="DATA_ACCESS_EXECUTED">DATA_ACCESS_EXECUTED</option>
              <option value="DATA_ACCESS_EXECUTION_DENIED">DATA_ACCESS_EXECUTION_DENIED</option>
              <option value="BENEFIT_AGREEMENT_CREATED">BENEFIT_AGREEMENT_CREATED</option>
              <option value="BENEFIT_AGREEMENT_UPDATED">BENEFIT_AGREEMENT_UPDATED</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-gray-600 uppercase mb-1">
              Outcome
            </label>
            <select
              value={outcome}
              onChange={(e) => {
                setOutcome(e.target.value);
                setPage(1);
              }}
              className="w-full p-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="">All Outcomes</option>
              <option value="ALLOWED">ALLOWED</option>
              <option value="DENIED">DENIED</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="FAILURE">FAILURE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900">
            Recorded Events ({events.length})
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-gray-700 px-2">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={events.length < 25}
              className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm flex flex-col items-center justify-center gap-3">
            {loading ? (
              <Spinner size="md" text="Scanning tamper-evident audit stream..." />
            ) : (
              "No events matched your filter criteria."
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 text-gray-500 uppercase font-semibold border-b border-gray-100">
                <tr>
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Outcome</th>
                  <th className="py-3 px-4">Operation</th>
                  <th className="py-3 px-4">Reason / Notes</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {events.map((evt) => {
                  const isDenied = evt.outcome === "DENIED" || evt.outcome === "FAILURE";
                  return (
                    <tr
                      key={evt.id}
                      className={`hover:bg-gray-50/80 transition ${
                        isDenied ? "bg-rose-50/30" : ""
                      }`}
                    >
                      <td className="py-3 px-4 font-mono text-gray-600 whitespace-nowrap">
                        {new Date(evt.occurredAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {evt.eventType}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] ${
                            isDenied
                              ? "bg-rose-100 text-rose-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {isDenied ? (
                            <XCircle className="w-3 h-3 text-rose-600" />
                          ) : (
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                          )}
                          {evt.outcome}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-700">
                        {evt.operation || "—"}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {evt.reasonCode ? (
                          <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                            {evt.reasonCode}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedEvent(evt)}
                          className="text-emerald-700 font-semibold hover:underline cursor-pointer"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal / Details Drawer */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Audit Record Details
              </h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-gray-500 uppercase tracking-wider block font-semibold">Event ID:</span>
                <span className="font-mono text-gray-800">{selectedEvent.id}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase tracking-wider block font-semibold">Actor UUID:</span>
                <span className="font-mono text-gray-800">{selectedEvent.actorId || "Anonymous / System"}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase tracking-wider block font-semibold">Research Request:</span>
                <span className="font-mono text-gray-800">{selectedEvent.researchRequestId || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase tracking-wider block font-semibold">Dataset ID:</span>
                <span className="font-mono text-gray-800">{selectedEvent.datasetId || "N/A"}</span>
              </div>
              <div>
                <span className="text-gray-500 uppercase tracking-wider block font-semibold">Occurred At:</span>
                <span className="font-mono text-gray-800">{selectedEvent.occurredAt}</span>
              </div>
              {selectedEvent.reasonCode && (
                <div>
                  <span className="text-gray-500 uppercase tracking-wider block font-semibold">Reason Code:</span>
                  <span className="font-mono text-gray-800 bg-gray-100 px-1 py-0.5 rounded">{selectedEvent.reasonCode}</span>
                </div>
              )}
              {selectedEvent.operation && (
                <div>
                  <span className="text-gray-500 uppercase tracking-wider block font-semibold">Target Operation:</span>
                  <span className="font-mono text-gray-800">{selectedEvent.operation}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-gray-100 text-right">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
