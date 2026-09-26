import { APP_CONFIG } from '../../../services/config'
import { apiRequest } from '../../../services/apiClient'
import { unwrapResponseData } from '../../../services/resourceApi'

const buildUrl = (path) => `${APP_CONFIG.apiBaseUrl.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`
const authHeaders = () => {
  try { const session = JSON.parse(window.localStorage.getItem(APP_CONFIG.authStorageKey) || '{}'); return session?.token ? { Authorization: `Bearer ${session.token}` } : {} } catch { return {} }
}
const binaryRequest = async (path) => {
  const response = await fetch(buildUrl(path), { headers: { ...authHeaders() } })
  if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.msg || 'Unable to load preview.') }
  return { url: URL.createObjectURL(await response.blob()), mimeType: response.headers.get('content-type') || '' }
}
const downloadBlob = async (path, options = {}) => {
  const response = await fetch(buildUrl(path), { ...options, headers: { Accept: 'application/octet-stream', ...authHeaders(), ...(options.headers ?? {}) } })
  if (!response.ok) { const payload = await response.json().catch(() => ({})); throw new Error(payload.msg || 'Download failed.') }
  const filename = response.headers.get('content-disposition')?.match(/filename="?([^";]+)"?/i)?.[1] || 'download'
  const url = URL.createObjectURL(await response.blob()); const link = document.createElement('a'); link.href = url; link.download = filename; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url)
}
export const getFileManagerItems = async (folderId) => unwrapResponseData(await apiRequest(`/file-manager/items${folderId ? `?folder_id=${folderId}` : ''}`), 'Unable to load files.')
export const createFolder = async (name, parentId) => unwrapResponseData(await apiRequest('/file-manager/folders', { method: 'POST', body: JSON.stringify({ name, parent_id: parentId || null }) }), 'Unable to create folder.')
export const uploadFiles = async (files, folderId) => { const body = new FormData(); if (folderId) body.append('folder_id', folderId); files.forEach((file) => body.append('files[]', file)); return unwrapResponseData(await apiRequest('/file-manager/files', { method: 'POST', body }), 'Unable to upload files.') }
export const renameItem = (type, id, name) => apiRequest(type === 'folder' ? `/file-manager/folders/${id}` : `/file-manager/files/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) })
export const deleteItem = (type, id) => apiRequest(type === 'folder' ? `/file-manager/folders/${id}/delete` : `/file-manager/files/${id}/delete`, { method: 'POST' })
export const getFileVersions = async (id) => unwrapResponseData(await apiRequest(`/file-manager/files/${id}/versions`), 'Unable to load version history.')
export const uploadFileVersion = async (id, file) => { const body = new FormData(); body.append('file', file); return unwrapResponseData(await apiRequest(`/file-manager/files/${id}/versions`, { method: 'POST', body }), 'Unable to upload new version.') }
export const restoreFileVersion = (fileId, versionId) => apiRequest(`/file-manager/files/${fileId}/versions/${versionId}/restore`, { method: 'POST' })
export const getFilePreview = (id) => binaryRequest(`/file-manager/files/${id}/preview`)
export const getTextContent = async (id) => unwrapResponseData(await apiRequest(`/file-manager/files/${id}/content`), 'Unable to load document.')
export const saveTextContent = (id, content) => apiRequest(`/file-manager/files/${id}/content`, { method: 'POST', body: JSON.stringify({ content }) })
export const downloadOneFile = (id) => downloadBlob(`/file-manager/files/${id}/download`)
export const downloadManyFiles = (ids) => downloadBlob('/file-manager/files/download', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ file_ids: ids }) })
