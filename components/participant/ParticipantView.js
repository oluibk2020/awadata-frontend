"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Spinner from "@/components/Spinner";
import {
  getParticipantConsentCurrent,
  submitParticipantConsent,
  withdrawParticipantConsent,
  getParticipantConsentHistory,
} from "@/lib/api";
import {
  Shield,
  Clock,
  History,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Check,
  X,
  Lock,
} from "lucide-react";

export default function ParticipantView() {
  const { token, showToast } = useAuth();
  const [currentConsent, setCurrentConsent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  // Editable state
  const [purpose, setPurpose] = useState("ACADEMIC");
  const [decisions, setDecisions] = useState({
    ACADEMIC_AGGREGATE_RESEARCH: true,
    IDENTIFIABLE_RECORD_ACCESS: false,
    COMMERCIAL_AI_TRAINING: false,
  });

  const loadConsentData = useCallback(async () => {
    setLoading(true);
    const [currentRes, historyRes] = await Promise.all([
      getParticipantConsentCurrent(token),
      getParticipantConsentHistory(token),
    ]);

    if (currentRes.ok && currentRes.data) {
      setCurrentConsent(currentRes.data);
      if (currentRes.data.purpose) setPurpose(currentRes.data.purpose);
      if (currentRes.data.decisions) {
        setDecisions({
          ACADEMIC_AGGREGATE_RESEARCH: !!currentRes.data.decisions.ACADEMIC_AGGREGATE_RESEARCH,
          IDENTIFIABLE_RECORD_ACCESS: !!currentRes.data.decisions.IDENTIFIABLE_RECORD_ACCESS,
          COMMERCIAL_AI_TRAINING: !!currentRes.data.decisions.COMMERCIAL_AI_TRAINING,
        });
      }
    } else {
      setCurrentConsent(null);
    }

    if (historyRes.ok && Array.isArray(historyRes.data)) {
      setHistory(historyRes.data);
    }

    setLoading(false);
  }, [token]);

  useEffect(() => {
    let active = true;
    Promise.all([
      getParticipantConsentCurrent(token),
      getParticipantConsentHistory(token),
    ])
      .then(([currentRes, historyRes]) => {
        if (!active) return;

        if (currentRes.ok && currentRes.data) {
          setCurrentConsent(currentRes.data);
          if (currentRes.data.purpose) setPurpose(currentRes.data.purpose);
          if (currentRes.data.decisions) {
            setDecisions({
              ACADEMIC_AGGREGATE_RESEARCH: !!currentRes.data.decisions.ACADEMIC_AGGREGATE_RESEARCH,
              IDENTIFIABLE_RECORD_ACCESS: !!currentRes.data.decisions.IDENTIFIABLE_RECORD_ACCESS,
              COMMERCIAL_AI_TRAINING: !!currentRes.data.decisions.COMMERCIAL_AI_TRAINING,
            });
          }
        } else {
          setCurrentConsent(null);
        }

        if (historyRes.ok && Array.isArray(historyRes.data)) {
          setHistory(historyRes.data);
        }
        setLoading(false);
      })
      .catch((error) => {
        if (!active) return;
        setLoading(false);
        showToast(error.message || "Failed to load consent data", "error");
      });

    return () => {
      active = false;
    };
  }, [token, showToast]);

  const handleToggle = (key) => {
    setDecisions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSaveConsent = async () => {
    setSaving(true);
    const res = await submitParticipantConsent(token, decisions, purpose);
    if (res.ok) {
      showToast(`Consent version ${res.data?.version || ""} saved successfully!`, "success");
      await loadConsentData();
    } else {
      showToast(res.error || "Failed to save consent", "error");
    }
    setSaving(false);
  };

  const handleWithdrawConsent = async () => {
    if (!window.confirm("Are you sure you want to withdraw all research consent? All future data access by researchers will be immediately blocked.")) {
      return;
    }
    setWithdrawing(true);
    const res = await withdrawParticipantConsent(token);
    if (res.ok) {
      showToast("Consent has been completely withdrawn.", "warning");
      await loadConsentData();
    } else {
      showToast(res.error || "Failed to withdraw consent", "error");
    }
    setWithdrawing(false);
  };

  const isWithdrawn = currentConsent?.status === "WITHDRAWN";

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-800 via-indigo-900 to-purple-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-purple-100 text-xs font-semibold backdrop-blur mb-3">
              <Shield className="w-3.5 h-3.5" />
              Lived Experience &amp; Youth Consent Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Your Mental Health Data Sovereignty</h1>
            <p className="text-purple-200 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              You possess personal veto power. External researchers and AI developers cannot extract your data or train
              commercial AI without your explicit permission. Community governance approval can never override your refusal.
            </p>
          </div>
          <button
            onClick={loadConsentData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-medium border border-white/20 transition cursor-pointer"
          >
            {loading ? <Spinner size="xs" /> : <RefreshCw className="w-3.5 h-3.5" />}
            Refresh
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Consent Form Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Active Consent Decisions</h2>
                <p className="text-xs text-gray-500">
                  Configure what types of operations researchers may perform with your synthetic data.
                </p>
              </div>

              {currentConsent && (
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      isWithdrawn
                        ? "bg-rose-50 text-rose-700 border-rose-200"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {isWithdrawn ? "WITHDRAWN" : `ACTIVE (v${currentConsent.version})`}
                  </span>
                </div>
              )}
            </div>

            {isWithdrawn && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-900 text-sm">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Your consent is currently withdrawn.</span> Researchers attempting to
                  access your records or include you in studies will receive an automatic <code className="font-mono bg-rose-100 px-1 py-0.5 rounded">DENY</code>.
                  To restore permissions, select your preferences below and submit a new version.
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Research Purpose
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full sm:w-64 p-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="ACADEMIC">ACADEMIC (Academic Research)</option>
                  <option value="PUBLIC_HEALTH">PUBLIC_HEALTH (Public Health)</option>
                  <option value="COMMERCIAL">COMMERCIAL (Commercial Research)</option>
                  <option value="AI_TRAINING">AI_TRAINING (AI Model Training)</option>
                  <option value="OTHER">OTHER (Other Purposes)</option>
                </select>
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-3">
                {/* 1. Academic Aggregate Research */}
                <div
                  onClick={() => handleToggle("ACADEMIC_AGGREGATE_RESEARCH")}
                  className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    decisions.ACADEMIC_AGGREGATE_RESEARCH
                      ? "border-emerald-300 bg-emerald-50/50"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                  }`}
                >
                  <div className="pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">Academic Aggregate Research</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800">
                        Statistical Summary Only
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Allows researchers to calculate group averages and correlations. Individual profiles or names are never returned.
                    </p>
                  </div>
                  <div
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      decisions.ACADEMIC_AGGREGATE_RESEARCH ? "bg-emerald-600 justify-end" : "bg-gray-300 justify-start"
                    }`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                  </div>
                </div>

                {/* 2. Identifiable Record Access */}
                <div
                  onClick={() => handleToggle("IDENTIFIABLE_RECORD_ACCESS")}
                  className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    decisions.IDENTIFIABLE_RECORD_ACCESS
                      ? "border-amber-300 bg-amber-50/50"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                  }`}
                >
                  <div className="pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">Identifiable Record Access</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-rose-100 text-rose-800">
                        High Sensitivity
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Permission to view individual case-level participant records. Strongly recommended to leave disabled.
                    </p>
                  </div>
                  <div
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      decisions.IDENTIFIABLE_RECORD_ACCESS ? "bg-amber-600 justify-end" : "bg-gray-300 justify-start"
                    }`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                  </div>
                </div>

                {/* 3. Commercial AI Training */}
                <div
                  onClick={() => handleToggle("COMMERCIAL_AI_TRAINING")}
                  className={`p-4 rounded-xl border transition cursor-pointer flex items-center justify-between ${
                    decisions.COMMERCIAL_AI_TRAINING
                      ? "border-purple-300 bg-purple-50/50"
                      : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
                  }`}
                >
                  <div className="pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">Commercial AI Model Training</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-purple-100 text-purple-800">
                        AI Weights & LLMs
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Allows your synthetic mental health records to be ingested into proprietary commercial AI training pipelines.
                    </p>
                  </div>
                  <div
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      decisions.COMMERCIAL_AI_TRAINING ? "bg-purple-600 justify-end" : "bg-gray-300 justify-start"
                    }`}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleSaveConsent}
                disabled={saving}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Spinner size="sm" />
                    <span>Committing Version to Vault...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Submit New Consent Version</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleWithdrawConsent}
                disabled={withdrawing || isWithdrawn}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 font-medium text-sm transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {withdrawing ? (
                  <>
                    <Spinner size="sm" />
                    <span>Revoking Permissions...</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <span>Withdraw All Consent</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Info & History */}
        <div className="space-y-6">
          {/* Pseudonym Info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-purple-600" />
              Participant Anonymity
            </h3>
            <div className="text-xs text-gray-600 space-y-2 leading-relaxed">
              <p>
                Your authentication identity is strictly separated from your research data. Researchers only ever see
                a pseudonymous subject code.
              </p>
              <div className="bg-purple-50 p-3 rounded-xl border border-purple-100 mt-2">
                <span className="text-[11px] font-semibold text-purple-900 uppercase tracking-wider block">
                  Synthetic Dataset Boundary
                </span>
                <span className="text-xs text-purple-700 font-mono font-medium block mt-0.5">
                  Synthetic Community Mental Health Dataset
                </span>
              </div>
            </div>
          </div>

          {/* Consent History Timeline */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-purple-600" />
              Consent Version History
            </h3>

            {history.length === 0 ? (
              <p className="text-xs text-gray-400">No previous versions found.</p>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl border border-gray-100 bg-gray-50/70 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">Version {item.version}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : item.status === "WITHDRAWN"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Created: {new Date(item.createdAt).toLocaleDateString()} at{" "}
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
