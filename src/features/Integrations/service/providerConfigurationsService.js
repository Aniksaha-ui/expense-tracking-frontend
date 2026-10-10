import { API_URLS } from '../../../constants/apiUrls'
import { apiRequest } from '../../../services/apiClient'
const unpack = (response) => response?.data ?? []
export const getProviderConfigurations = async () => unpack(await apiRequest(API_URLS.providerConfigurations.list))
export const saveProviderConfigurations = async (profiles) => unpack(await apiRequest(API_URLS.providerConfigurations.update, { method: 'PUT', body: JSON.stringify({ profiles }) }))
