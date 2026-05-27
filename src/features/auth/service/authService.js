import { API_URLS } from "../../../constants/apiUrls";
import { apiRequest } from "../../../services/apiClient";

const resolveAuthPayload = (payload) => {
  if (payload?.access_token && payload?.user) {
    return {
      token: payload.access_token,
      tokenType: payload.token_type ?? "Bearer",
      expiresIn: payload.expires_in ?? null,
      user: payload.user,
    };
  }

  if (payload?.data?.token && payload?.data?.user) {
    return payload.data;
  }

  if (payload?.token && payload?.user) {
    return payload;
  }

  return null;
};

export const login = async (credentials) => {
  const response = await apiRequest(API_URLS.auth.login, {
    method: "POST",
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });
  const payload = resolveAuthPayload(response);

  if (!payload) {
    throw new Error("Login response was missing token or user data.");
  }

  return payload;
};
