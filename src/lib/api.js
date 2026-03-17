const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const TOKEN_KEY = "questoria_token";

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setStoredToken(token) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

async function request(path, options = {}) {
  const token = getStoredToken();
  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      `Unable to reach API server at ${API_BASE}. Make sure backend is running.`,
    );
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message || `Request failed: ${res.status}`);
  }

  return data;
}

function jsonRequest(path, method, body, options = {}) {
  const hasBody = body !== undefined;
  return request(path, {
    ...options,
    method,
    body: hasBody ? JSON.stringify(body) : undefined,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

export const api = {
  get: (path, options = {}) => request(path, options),
  post: (path, body, options = {}) => jsonRequest(path, "POST", body, options),
  patch: (path, body, options = {}) =>
    jsonRequest(path, "PATCH", body, options),
  put: (path, body, options = {}) => jsonRequest(path, "PUT", body, options),
  delete: (path, options = {}) => request(path, { method: "DELETE", ...options }),
  postForm: (path, formData, options = {}) =>
    request(path, {
      ...options,
      method: "POST",
      body: formData,
      headers: {
        ...(options.headers || {}),
      },
    }),
  base: API_BASE,
};
