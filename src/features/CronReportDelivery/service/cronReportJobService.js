import { API_URLS } from '../../../constants/apiUrls'
import { apiRequest } from '../../../services/apiClient'
export const runCronReportJob = async (jobKey, payload) => (await apiRequest(API_URLS.cronReportDelivery.run(jobKey), { method: 'POST', body: JSON.stringify(payload) }))?.data ?? {}
