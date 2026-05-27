import { apiRequest } from './apiClient'

const getExecutionStatus = (payload) => payload?.isExecute ?? payload?.isExecture

export const isExecutionSuccessful = (payload) => {
  const executionStatus = getExecutionStatus(payload)

  if (executionStatus === undefined || executionStatus === null || executionStatus === '') {
    return true
  }

  if (typeof executionStatus === 'boolean') {
    return executionStatus
  }

  return String(executionStatus).trim().toLowerCase() === 'success'
}

export const assertSuccessfulExecution = (payload, fallbackMessage = 'Request could not be completed.') => {
  if (!isExecutionSuccessful(payload)) {
    throw new Error(payload?.msg || payload?.message || fallbackMessage)
  }

  return payload
}

export const unwrapResponseData = (payload, fallbackMessage) =>
  assertSuccessfulExecution(payload, fallbackMessage)?.data ?? payload ?? []

export const unwrapCollection = (payload, fallbackMessage) => {
  const data = unwrapResponseData(payload, fallbackMessage)

  if (Array.isArray(data)) {
    return {
      rows: data,
      pagination: {
        from: data.length ? 1 : 0,
        to: data.length,
        total: data.length,
        currentPage: 1,
        lastPage: 1,
      },
    }
  }

  if (Array.isArray(data?.data)) {
    return {
      rows: data.data,
      pagination: {
        from: data.from ?? 0,
        to: data.to ?? data.data.length,
        total: data.total ?? data.data.length,
        currentPage: data.current_page ?? 1,
        lastPage: data.last_page ?? 1,
      },
    }
  }

  return {
    rows: [],
    pagination: {
      from: 0,
      to: 0,
      total: 0,
      currentPage: 1,
      lastPage: 1,
    },
  }
}

export const buildQueryPath = (endpoint, { page = 1, search = '' } = {}) => {
  const params = new URLSearchParams()

  if (page) {
    params.set('page', page)
  }

  if (search) {
    params.set('search', search)
  }

  const query = params.toString()
  return query ? `${endpoint}?${query}` : endpoint
}

export const createResourceApi = ({ endpoint, updateEndpoint }) => ({
  list: async ({ page, search } = {}) =>
    unwrapCollection(await apiRequest(buildQueryPath(endpoint, { page, search })), 'Unable to load records.'),
  create: async (payload) =>
    assertSuccessfulExecution(
      await apiRequest(endpoint, { method: 'POST', body: payload instanceof FormData ? payload : JSON.stringify(payload) }),
      'Unable to create record.',
    ),
  update: async (id, payload) =>
    assertSuccessfulExecution(
      await apiRequest(updateEndpoint ? updateEndpoint(id) : `${endpoint}/update/${id}`, {
        method: 'POST',
        body: payload instanceof FormData ? payload : JSON.stringify(payload),
      }),
      'Unable to update record.',
    ),
  delete: async (id) =>
    assertSuccessfulExecution(await apiRequest(`${endpoint}/${id}`, { method: 'DELETE' }), 'Unable to delete record.'),
})

export const fetchDropdown = async (endpoint) => {
  const payload = await apiRequest(endpoint)
  const data = unwrapResponseData(payload, 'Unable to load dropdown options.')
  return Array.isArray(data) ? data : data?.data ?? []
}
