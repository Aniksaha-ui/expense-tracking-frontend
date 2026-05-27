import { APP_CONFIG } from "./config";

export const AUTH_SESSION_TIMEOUT_EVENT = "travel-agency-admin-auth-session-timeout";
export const AUTH_SESSION_TIMEOUT_MESSAGE = "Session is timeout. Please login again.";

let hasDispatchedSessionTimeout = false;

export const resetSessionTimeoutState = () => {
  hasDispatchedSessionTimeout = false;
};

const buildUrl = (path) => {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const baseUrl = APP_CONFIG.apiBaseUrl.replace(/\/+$/, "");
  const apiPath = path.startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${apiPath}`;
};

const getAuthToken = () => {
  const rawSession = window.localStorage.getItem(APP_CONFIG.authStorageKey);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession)?.token ?? null;
  } catch {
    window.localStorage.removeItem(APP_CONFIG.authStorageKey);
    return null;
  }
};

const parseResponseBody = async (response) => {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  return response.text();
};

const flattenValidationErrors = (errors) => {
  if (!errors || typeof errors !== "object") {
    return "";
  }

  return Object.values(errors)
    .flat()
    .filter(Boolean)
    .join(" ");
};

const resolveErrorMessage = (data, fallback) => {
  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return (
    data?.msg ||
    data?.message ||
    flattenValidationErrors(data?.errors) ||
    data?.error ||
    fallback ||
    "Something went wrong. Please try again."
  );
};

export const apiRequest = async (path, options = {}) => {
  const token = getAuthToken();
  const isFormData = options.body instanceof FormData;
  const headers = new Headers({
    Accept: "application/json",
    ...(options.headers ?? {}),
  });

  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(buildUrl(path), {
    ...options,
    headers,
  });
  const data = await parseResponseBody(response);
  const isLoginRequest = path.endsWith("/login");
  const hasSession = Boolean(window.localStorage.getItem(APP_CONFIG.authStorageKey));

  if (response.status === 401 && hasSession && !isLoginRequest && !hasDispatchedSessionTimeout) {
    hasDispatchedSessionTimeout = true;
    window.dispatchEvent(
      new CustomEvent(AUTH_SESSION_TIMEOUT_EVENT, {
        detail: { message: AUTH_SESSION_TIMEOUT_MESSAGE },
      })
    );
  }

  if (!response.ok) {
    const message = resolveErrorMessage(data, response.statusText);
    throw new Error(message);
  }

  return data;
};
