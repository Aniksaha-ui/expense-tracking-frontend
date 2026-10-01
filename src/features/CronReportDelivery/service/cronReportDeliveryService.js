import { API_URLS } from '../../../constants/apiUrls'
import { apiRequest } from '../../../services/apiClient'

const unpack = (response) => response?.data ?? []

export const getCronReportDeliverySettings = async () => unpack(await apiRequest(API_URLS.cronReportDelivery.list))

export const updateCronReportDeliverySettings = async (settings) =>
  unpack(
    await apiRequest(API_URLS.cronReportDelivery.update, {
      method: 'PUT',
      body: JSON.stringify({ settings }),
    }),
  )
