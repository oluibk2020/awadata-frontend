"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { loginUser, getCurrentUser } from "@/lib/api";

const AuthContext = createContext({
  user: null,
  token: null,
  role: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  refreshUser: async () => {},
  toast: null,
  showToast: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((current) => (current && current.message === message ? null : current));
    }, 4500);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("awadata_token");
    setToken(null);
    setUser(null);
    setRole(null);
    showToast("Logged out successfully", "info");
  }, [showToast]);

  const refreshUser = useCallback(async (jwtToken) => {
    const activeToken = jwtToken || token;
    if (!activeToken) return null;

    const res = await getCurrentUser(activeToken);
    if (res.ok && res.data) {
      setToken(activeToken);
      setUser(res.data);
      setRole(res.data.role);
      return res.data;
    } else {
      logout();
      return null;
    }
  }, [token, logout]);

  useEffect(() => {
    const savedToken = localStorage.getItem("awadata_token");
    let active = true;
    const restoreRequest = savedToken ? getCurrentUser(savedToken) : Promise.resolve(null);
    restoreRequest
      .then((res) => {
        if (!active || !savedToken) return;
        if (res?.ok && res.data) {
          setToken(savedToken);
          setUser(res.data);
          setRole(res.data.role);
        } else {
          logout();
        }
      })
      .catch((error) => {
        if (!active) return;
        logout();
        showToast(error.message || "Unable to restore your session", "error");
      })
      .finally(() => {
        if (active) setLoading(false);
      })

    return () => {
      active = false;
    };
  }, [logout, showToast]);

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    if (!res.ok) {
      showToast(res.error || "Login failed", "error");
      return { ok: false, error: res.error };
    }

    const jwtToken = res.data?.accessToken;
    if (!jwtToken) {
      showToast("No access token returned from server", "error");
      return { ok: false, error: "No access token received" };
    }

    localStorage.setItem("awadata_token", jwtToken);
    setToken(jwtToken);

    const userProfile = await refreshUser(jwtToken);
    showToast(`Welcome back, ${userProfile?.firstName || email}!`, "success");
    return { ok: true, user: userProfile };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        login,
        logout,
        refreshUser,
        toast,
        showToast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
