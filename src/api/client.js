// Vorübergehender Ort für den API-Client (Phase 1). Wird in Phase 2 nach
// src/shared/api/client.js verschoben, sobald App.jsx in Module aufgeteilt ist.

export const API_URL = import.meta.env.VITE_API_URL || "https://api.lordofdoner.com/api";

const TOKEN_KEY = "lod_token";
const USER_KEY = "lod_user";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setSession(user, token) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

// Schlanker fetch-Wrapper: haengt den Auth-Header an und wirft bei Fehlern
// eine echte Exception statt sie lautlos zu verschlucken (das war die Ursache
// des Archivierungs-Bugs: ein leeres `catch {}` um den PUT-Request).
export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    let message = `Request fehlgeschlagen (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = typeof body.error === "string" ? body.error : JSON.stringify(body.error);
    } catch {
      // response body war kein JSON - message bleibt beim generischen Text
    }
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) return null;
  return res.json();
}
