import { CheckCircle2, ExternalLink, Eye, Pencil, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { API_URLS } from '../../../constants/apiUrls'
import { apiRequest } from '../../../services/apiClient'
import { unwrapCollection } from '../../../services/resourceApi'

const emptyForm = { type: 'workplace', title: '', achievement_date: '', organization: '', description: '', reference_url: '', status: 'draft' }

export function GeneratedAchievementsTable() {
  const [rows, setRows] = useState([])
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedRow, setSelectedRow] = useState(null)
  const [editingRow, setEditingRow] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const result = unwrapCollection(await apiRequest(`${API_URLS.jiraGenerated.list}?page=${page}`), 'Unable to load generated achievements.')
      setRows(result.rows)
      setMeta(result.pagination)
      setError('')
    } catch (requestError) {
      setError(requestError.message || 'Unable to load generated achievements.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void load() }, [page])
  const filtered = useMemo(() => rows.filter((row) => `${row.title} ${row.type} ${row.description}`.toLowerCase().includes(search.toLowerCase())), [rows, search])
  const closeEdit = () => { setEditingRow(null); setForm(emptyForm) }
  const openEdit = (row) => {
    setSelectedRow(null)
    setEditingRow(row)
    setForm({ type: row.type ?? 'workplace', title: row.title ?? '', achievement_date: row.achievement_date ?? '', organization: row.organization ?? '', description: row.description ?? '', reference_url: row.reference_url ?? '', status: row.status ?? 'draft' })
  }
  const approve = async (row) => {
    try {
      await apiRequest(API_URLS.jiraGenerated.update(row.id), { method: 'PUT', body: JSON.stringify({ status: 'approved' }) })
      await load()
    } catch (requestError) { setError(requestError.message || 'Unable to approve achievement.') }
  }
  const remove = async (id) => {
    if (!window.confirm('Delete this generated achievement?')) return
    try {
      await apiRequest(API_URLS.jiraGenerated.remove(id), { method: 'DELETE' })
      if (selectedRow?.id === id) setSelectedRow(null)
      await load()
    } catch (requestError) { setError(requestError.message || 'Unable to delete achievement.') }
  }
  const saveEdit = async (event) => {
    event.preventDefault()
    if (!editingRow) return
    setSaving(true)
    try {
      const payload = { ...form, title: form.title.trim(), description: form.description.trim(), organization: form.organization.trim() || null, reference_url: form.reference_url.trim() || null }
      await apiRequest(API_URLS.jiraGenerated.update(editingRow.id), { method: 'PUT', body: JSON.stringify(payload) })
      closeEdit()
      await load()
    } catch (requestError) { setError(requestError.message || 'Unable to update achievement.') } finally { setSaving(false) }
  }

  return <section className="rounded-2xl border border-white/10 bg-[#191417] p-5 sm:p-6"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-indigo-300">Review queue</p><h2 className="mt-1 text-xl font-semibold text-white">Generated Jira achievements</h2><p className="mt-1 text-sm text-slate-400">Review, update, and approve evidence-based drafts before using them professionally.</p></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search drafts" className="goal-input sm:w-56" /></div>{error && <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}{loading ? <p className="py-8 text-center text-slate-400">Loading generated achievements…</p> : filtered.length === 0 ? <p className="py-8 text-center text-slate-400">No generated drafts yet. Use Jira sync to create some.</p> : <><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase tracking-wide text-slate-400"><tr>{['Type', 'Title', 'Date', 'Organisation', 'Status', ''].map((heading) => <th key={heading} className="px-3 py-3 font-semibold">{heading}</th>)}</tr></thead><tbody>{filtered.map((row) => <tr key={row.id} className="border-b border-white/5 align-top text-slate-300"><td className="px-3 py-4"><span className="rounded-full bg-indigo-500/15 px-2 py-1 text-xs text-indigo-200">{row.type}</span></td><td className="max-w-sm px-3 py-4"><p className="truncate font-medium text-white">{row.title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-400">{row.description}</p></td><td className="whitespace-nowrap px-3 py-4">{row.achievement_date}</td><td className="px-3 py-4">{row.organization || '—'}</td><td className={`px-3 py-4 text-xs ${row.status === 'approved' ? 'text-emerald-300' : 'text-amber-200'}`}>{row.status}</td><td className="px-3 py-4"><div className="flex gap-1">{row.status !== 'approved' && <button type="button" onClick={() => void approve(row)} title="Approve" aria-label="Approve achievement" className="rounded-lg p-2 text-emerald-300 hover:bg-emerald-500/10"><CheckCircle2 size={16} /></button>}<button type="button" onClick={() => setSelectedRow(row)} title="Preview details" aria-label="Preview achievement details" className="rounded-lg p-2 text-indigo-200 hover:bg-indigo-500/10"><Eye size={16} /></button><button type="button" onClick={() => openEdit(row)} title="Edit" aria-label="Edit achievement" className="rounded-lg p-2 text-slate-300 hover:bg-white/10"><Pencil size={16} /></button><button type="button" onClick={() => void remove(row.id)} title="Delete" aria-label="Delete achievement" className="rounded-lg p-2 text-rose-300 hover:bg-rose-500/10"><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div><div className="mt-4 flex items-center justify-between text-sm text-slate-400"><span>{meta.total} records</span><div className="flex gap-2"><button type="button" disabled={meta.currentPage <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-40">Previous</button><button type="button" disabled={meta.currentPage >= meta.lastPage} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-white/10 px-3 py-2 disabled:opacity-40">Next</button></div></div></>}{selectedRow && <PreviewModal row={selectedRow} onClose={() => setSelectedRow(null)} onEdit={() => openEdit(selectedRow)} />}{editingRow && <EditModal form={form} saving={saving} onChange={(field, value) => setForm((current) => ({ ...current, [field]: value }))} onClose={closeEdit} onSubmit={saveEdit} />}</section>
}

function PreviewModal({ row, onClose, onEdit }) { return <Modal title="Achievement details" onClose={onClose}><div className="space-y-5"><div><p className="text-xs font-semibold uppercase tracking-wide text-indigo-300">{row.type} · {row.status}</p><h3 className="mt-1 text-xl font-semibold text-white">{row.title}</h3></div><div className="grid gap-4 sm:grid-cols-2"><Detail label="Date">{row.achievement_date}</Detail><Detail label="Organisation">{row.organization || 'Not provided'}</Detail></div><Detail label="Description"><p className="whitespace-pre-wrap leading-6 text-slate-200">{row.description}</p></Detail><Detail label="Source issues">{row.issues?.length ? row.issues.map((issue) => issue.issue_key).join(', ') : 'No source issues available'}</Detail>{row.reference_url && <Detail label="Reference"><a href={row.reference_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 break-all text-indigo-300 hover:text-indigo-200">Open Jira reference <ExternalLink size={14} /></a></Detail>}<div className="flex justify-end gap-3"><button type="button" onClick={onEdit} className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400">Edit achievement</button><button type="button" onClick={onClose} className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10">Close</button></div></div></Modal> }
function EditModal({ form, saving, onChange, onClose, onSubmit }) { return <Modal title="Edit generated achievement" onClose={onClose}><form onSubmit={onSubmit} className="space-y-4"><div className="grid gap-4 sm:grid-cols-2"><Input label="Type"><select value={form.type} onChange={(event) => onChange('type', event.target.value)} className="goal-input"><option value="workplace">Workplace</option><option value="personal">Personal</option><option value="other">Other</option></select></Input><Input label="Date"><input required type="date" value={form.achievement_date} onChange={(event) => onChange('achievement_date', event.target.value)} className="goal-input" /></Input></div><Input label="Title"><input required maxLength="200" value={form.title} onChange={(event) => onChange('title', event.target.value)} className="goal-input" /></Input><Input label="Organisation or place"><input maxLength="160" value={form.organization} onChange={(event) => onChange('organization', event.target.value)} className="goal-input" /></Input><Input label="Description"><textarea required maxLength="4000" rows="5" value={form.description} onChange={(event) => onChange('description', event.target.value)} className="goal-input resize-y" /></Input><Input label="Reference URL"><input maxLength="2048" value={form.reference_url} onChange={(event) => onChange('reference_url', event.target.value)} className="goal-input" /></Input><div className="flex justify-end gap-3 pt-2"><button type="button" onClick={onClose} className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10">Cancel</button><button disabled={saving} className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">{saving ? 'Saving…' : 'Save changes'}</button></div></form></Modal> }
function Modal({ title, children, onClose }) { return <div role="dialog" aria-modal="true" aria-labelledby="generated-achievement-modal-title" className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onMouseDown={onClose}><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-white/15 bg-[#191417] p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="mb-5 flex items-center justify-between gap-4"><h2 id="generated-achievement-modal-title" className="text-xl font-semibold text-white">{title}</h2><button type="button" onClick={onClose} aria-label="Close modal" className="rounded-lg p-2 text-slate-300 hover:bg-white/10"><X size={18} /></button></div>{children}</div></div> }
function Input({ label, children }) { return <label className="grid gap-1.5 text-sm font-medium text-slate-300"><span>{label}</span>{children}</label> }
function Detail({ label, children }) { return <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><div className="mt-1 text-sm text-slate-200">{children}</div></div> }
