import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "../../utils/supabase/info.ts";

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
);

export const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-5ec6d9ed`;

// Auth helpers
export const getAuthHeaders = () => {
  const token = localStorage.getItem("authToken");
  return {
    "Content-Type": "application/json",
    Authorization: token
      ? `Bearer ${token}`
      : `Bearer ${publicAnonKey}`,
  };
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("authToken");
};

export const logout = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userId");
  window.location.href = "/";
};