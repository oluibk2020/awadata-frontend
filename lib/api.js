const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:2000";

export async function apiFetch(endpoint, options = {}, token = null) {
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("awadata_token") : null);
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    let data = null;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await res.json();
    } else {
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text ? { message: text } : null;
      }
    }

    if (!res.ok) {
      const errorMessage =
        (data && (data.message || data.error)) ||
        `Request failed with status ${res.status}`;
      return {
        ok: false,
        status: res.status,
        error: Array.isArray(errorMessage) ? errorMessage.join(", ") : errorMessage,
        data,
      };
    }

    return {
      ok: true,
      status: res.status,
      data,
      error: null,
    };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      error: err.message || "Network error. Is the backend API running on port 2000?",
      data: null,
    };
  }
}

// Authentication
export async function loginUser(email, password) {
  return apiFetch("/auth", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getCurrentUser(token) {
  return apiFetch("/auth/me", { method: "GET" }, token);
}

// Participant Consent
export async function getParticipantConsentCurrent(token) {
  return apiFetch("/participants/me/consent/current", { method: "GET" }, token);
}

export async function submitParticipantConsent(token, decisions, purpose = "ACADEMIC") {
  return apiFetch(
    "/participants/me/consent",
    {
      method: "POST",
      body: JSON.stringify({ purpose, decisions }),
    },
    token
  );
}

export async function withdrawParticipantConsent(token) {
  return apiFetch("/participants/me/consent/withdraw", { method: "POST" }, token);
}

export async function getParticipantConsentHistory(token) {
  return apiFetch("/participants/me/consent/history", { method: "GET" }, token);
}

// Researcher
export async function getResearcherRequests(token) {
  return apiFetch("/research/requests", { method: "GET" }, token);
}

export async function createResearcherRequest(token, payload) {
  return apiFetch(
    "/research/requests",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  );
}

export async function evaluateAccessAuthorization(token, researchRequestId, operation) {
  return apiFetch(
    "/access/authorize",
    {
      method: "POST",
      body: JSON.stringify({ researchRequestId, operation }),
    },
    token
  );
}

export async function executeDataAccess(token, researchRequestId, operation) {
  return apiFetch(
    "/access/execute",
    {
      method: "POST",
      body: JSON.stringify({ researchRequestId, operation }),
    },
    token
  );
}

export async function getBenefitAgreement(token, requestId) {
  return apiFetch(`/benefits/requests/${requestId}/agreement`, { method: "GET" }, token);
}

export async function getBenefitAgreementVersions(token, requestId) {
  return apiFetch(`/benefits/requests/${requestId}/agreements`, { method: "GET" }, token);
}

export async function createBenefitAgreement(token, payload) {
  return apiFetch(
    "/benefits/agreements",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  );
}

export async function acceptBenefitAgreement(token, agreementId) {
  return apiFetch(
    `/benefits/agreements/${agreementId}/accept`,
    {
      method: "POST",
    },
    token
  );
}

export async function rejectBenefitAgreement(token, agreementId, reason) {
  return apiFetch(
    `/benefits/agreements/${agreementId}/reject`,
    {
      method: "POST",
      body: JSON.stringify({ reason: reason?.trim() }),
    },
    token
  );
}

export async function updateBenefitAgreement(token, agreementId, status) {
  return apiFetch(
    `/benefits/agreements/${agreementId}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    token
  );
}

// Governance
export async function getPendingGovernanceRequests(token) {
  return apiFetch("/governance/requests/pending", { method: "GET" }, token);
}

export async function getGovernanceRequests(token, query = {}) {
  const params = new URLSearchParams();
  if (query.search) params.append("search", query.search);
  if (query.status) params.append("status", query.status);
  if (query.from) params.append("from", query.from);
  if (query.to) params.append("to", query.to);
  params.append("page", String(query.page || 1));
  params.append("limit", String(query.limit || 10));
  return apiFetch(`/governance/requests?${params.toString()}`, { method: "GET" }, token);
}

export async function getGovernanceBenefitAgreements(token, query = {}) {
  const params = new URLSearchParams();
  if (query.search) params.append("search", query.search);
  if (query.status) params.append("status", query.status);
  if (query.from) params.append("from", query.from);
  if (query.to) params.append("to", query.to);
  params.append("page", String(query.page || 1));
  params.append("limit", String(query.limit || 10));
  return apiFetch(`/governance/benefit-agreements?${params.toString()}`, { method: "GET" }, token);
}

export async function approveGovernanceRequest(token, requestId, reason, approvedOperations) {
  return apiFetch(
    `/governance/requests/${requestId}/approve`,
    {
      method: "POST",
      body: JSON.stringify({ reason, approvedOperations }),
    },
    token
  );
}

export async function rejectGovernanceRequest(token, requestId, reason) {
  return apiFetch(
    `/governance/requests/${requestId}/reject`,
    {
      method: "POST",
      body: JSON.stringify({ reason, approvedOperations: [] }),
    },
    token
  );
}

export async function getGovernanceDecision(token, requestId) {
  return apiFetch(`/governance/requests/${requestId}/decision`, { method: "GET" }, token);
}

// Auditor & Platform Admin (Audit Events)
export async function getAuditEvents(token, query = {}) {
  const params = new URLSearchParams();
  if (query.researchRequestId) params.append("researchRequestId", query.researchRequestId);
  if (query.datasetId) params.append("datasetId", query.datasetId);
  if (query.eventType) params.append("eventType", query.eventType);
  if (query.outcome) params.append("outcome", query.outcome);
  if (query.page) params.append("page", query.page);
  if (query.limit) params.append("limit", query.limit);

  const queryString = params.toString() ? `?${params.toString()}` : "";
  return apiFetch(`/audit/events${queryString}`, { method: "GET" }, token);
}

// Communities & Datasets & Participants (Platform Admin)
export async function getCommunities(token) {
  return apiFetch("/communities", { method: "GET" }, token);
}

export async function createCommunity(token, payload) {
  return apiFetch(
    "/communities",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  );
}

export async function getCommunityDatasets(token, communityId) {
  return apiFetch(`/communities/${communityId}/datasets`, { method: "GET" }, token);
}

export async function createCommunityDataset(token, communityId, payload) {
  return apiFetch(
    `/communities/${communityId}/datasets`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  );
}

export async function getDatasetParticipants(token, communityId, datasetId) {
  return apiFetch(`/communities/${communityId}/datasets/${datasetId}/participants`, { method: "GET" }, token);
}

export async function createDatasetParticipant(token, communityId, datasetId, payload) {
  return apiFetch(
    `/communities/${communityId}/datasets/${datasetId}/participants`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    token
  );
}

export async function getUserDirectory(token) {
  return apiFetch("/user/directory", { method: "GET" }, token);
}

export async function assignCommunityGovernanceMember(token, communityId, userId) {
  return apiFetch(`/communities/${communityId}/governance-members`, {
    method: "PUT",
    body: JSON.stringify({ userId }),
  }, token);
}
