import { API_URLS } from "../../../constants/apiUrls";
import { apiRequest } from "../../../services/apiClient";
import { normalizeMenuResponse } from "../utils/menuHelpers";

const isMenuResponseSuccessful = (payload) => {
  const executionStatus = payload?.isExecute ?? payload?.isExecture;

  if (typeof executionStatus === "boolean") {
    return executionStatus;
  }

  return String(executionStatus ?? "").trim().toLowerCase() === "success";
};

export const getAdminMenu = async () => {
  const response = await apiRequest(API_URLS.admin.menu);

  if (isMenuResponseSuccessful(response) && response?.data) {
    return normalizeMenuResponse(response);
  }

  throw new Error(response?.message || "Unable to load menu items.");
};
