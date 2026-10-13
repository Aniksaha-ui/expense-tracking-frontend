import { useEffect, useMemo, useState } from 'react'
import { API_URLS } from '../../../constants/apiUrls'
import { apiRequest } from '../../../services/apiClient'
import { unwrapResponseData } from '../../../services/resourceApi'

const blankGoal = { name: '', description: '', target_amount: '', current_saved_amount: '0', target_date: '' }
const amount = (value) => Number(value || 0)
const money = (value) => `BDT ${amount(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function FinancialGoalsPage() {
  const [goals, setGoals] = useState([])
  const [form, setForm] = useState(blankGoal)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const totals = useMemo(() => goals.reduce((all, goal) => ({ target: all.target + amount(goal.target_amount), saved: all.saved + amount(goal.current_saved_amount), remaining: all.remaining + amount(goal.remaining_amount) }), { target: 0, saved: 0, remaining: 0 }), [goals])
  const load = async () => { setLoading(true); try { setGoals(unwrapResponseData(await apiRequest(API_URLS.financialIntelligence.goals), 'Unable to load savings goals.') ?? []); setError('') } catch (loadError) { setError(loadError.message || 'Unable to load savings goals.') } finally { setLoading(false) } }
  useEffect(() => { void load() }, [])
  const change = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const reset = () => { setForm(blankGoal); setEditingId(null) }

  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setNotice('')
    const payload = { ...form, description: form.description.trim() || null, current_saved_amount: form.current_saved_amount || '0', target_date: form.target_date || null }
    try {
      await apiRequest(editingId ? `${API_URLS.financialIntelligence.goals}/${editingId}` : API_URLS.financialIntelligence.goals, { method: editingId ? 'PUT' : 'POST', body: JSON.stringify(payload) })
      setNotice(editingId ? 'Savings goal updated.' : 'Savings goal created.'); reset(); await load()
    } catch (saveError) { setError(saveError.message || 'Unable to save this goal.') } finally { setSaving(false) }
  }
  const edit = (goal) => { setEditingId(goal.id); setForm({ name: goal.name ?? '', description: goal.description ?? '', target_amount: String(goal.target_amount ?? ''), current_saved_amount: String(goal.current_saved_amount ?? '0'), target_date: goal.target_date ?? '' }); setError(''); setNotice(''); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const remove = async (id) => { if (!window.confirm('Delete this savings goal? This cannot be undone.')) return; setError(''); try { await apiRequest(`${API_URLS.financialIntelligence.goals}/${id}`, { method: 'DELETE' }); if (editingId === id) reset(); setNotice('Savings goal deleted.'); await load() } catch (deleteError) { setError(deleteError.message || 'Unable to delete this goal.') } }

  return <section className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#7ea1ff]">Planning</p><h1 className="mt-1 text-2xl font-bold text-white">Savings goals</h1><p className="mt-2 text-sm text-slate-400">Set a target, record savings, and see exactly what remains.</p></div><button type="button" onClick={() => void load()} disabled={loading} className="rounded-xl border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 disabled:opacity-50">Refresh</button></header>
    {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}{notice && <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{notice}</p>}
    <div className="grid gap-4 sm:grid-cols-3"><Summary label="Total target" value={money(totals.target)} /><Summary label="Total saved" value={money(totals.saved)} tone="text-emerald-300" /><Summary label="Still to save" value={money(totals.remaining)} tone="text-amber-200" /></div>
    <form onSubmit={save} className="rounded-2xl border border-white/10 bg-[#191417] p-5"><div className="flex items-center justify-between gap-4"><div><h2 className="font-semibold text-white">{editingId ? 'Edit savings goal' : 'Create a savings goal'}</h2><p className="mt-1 text-sm text-slate-400">Amounts are in BDT.</p></div>{editingId && <button type="button" onClick={reset} className="text-sm text-slate-300 underline">Cancel edit</button>}</div><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Field label="Goal name"><input required maxLength="120" className="goal-input" placeholder="Emergency fund" value={form.name} onChange={(event) => change('name', event.target.value)} /></Field><Field label="Target amount"><input required min="0.01" step="0.01" type="number" className="goal-input" placeholder="100000" value={form.target_amount} onChange={(event) => change('target_amount', event.target.value)} /></Field><Field label="Already saved"><input min="0" step="0.01" type="number" className="goal-input" placeholder="0" value={form.current_saved_amount} onChange={(event) => change('current_saved_amount', event.target.value)} /></Field><Field label="Target date (optional)"><input type="date" className="goal-input" value={form.target_date} onChange={(event) => change('target_date', event.target.value)} /></Field></div><Field label="Description (optional)" className="mt-4"><textarea maxLength="2000" rows="2" className="goal-input resize-y" placeholder="What is this saving for?" value={form.description} onChange={(event) => change('description', event.target.value)} /></Field><button disabled={saving} className="mt-4 rounded-xl bg-[#4f6fe8] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Saving…' : editingId ? 'Save changes' : 'Create goal'}</button></form>
    {loading ? <p className="py-8 text-center text-slate-400">Loading savings goals…</p> : goals.length === 0 ? <div className="rounded-2xl border border-dashed border-white/15 p-10 text-center text-slate-400">No savings goals yet. Create one to start tracking progress.</div> : <div className="grid gap-4 lg:grid-cols-2">{goals.map((goal) => <GoalCard key={goal.id} goal={goal} onEdit={edit} onDelete={remove} />)}</div>}
  </section>
}

function Summary({ label, value, tone = 'text-white' }) { return <article className="rounded-2xl border border-white/10 bg-[#191417] p-5"><p className="text-sm text-slate-400">{label}</p><p className={`mt-2 text-xl font-bold ${tone}`}>{value}</p></article> }
function Field({ label, className = '', children }) { return <label className={`grid gap-1.5 text-sm font-medium text-slate-300 ${className}`}><span>{label}</span>{children}</label> }
function GoalCard({ goal, onEdit, onDelete }) {
  const progress = Math.min(100, Math.max(0, amount(goal.progress_percent))); const complete = progress >= 100
  const targetDate = goal.target_date ? new Date(`${goal.target_date}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : 'No target date'
  return <article className="rounded-2xl border border-white/10 bg-[#191417] p-5"><div className="flex items-start justify-between gap-4"><div><h2 className="font-semibold text-white">{goal.name}</h2>{goal.description && <p className="mt-1 text-sm text-slate-400">{goal.description}</p>}</div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${complete ? 'bg-emerald-500/15 text-emerald-300' : 'bg-[#4f6fe8]/15 text-[#a9bcff]'}`}>{complete ? 'Reached' : `${progress.toFixed(1)}%`}</span></div><p className="mt-5 text-sm text-slate-300">Saved <strong className="text-white">{money(goal.current_saved_amount)}</strong> of <strong className="text-white">{money(goal.target_amount)}</strong></p><div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className={`h-full rounded-full ${complete ? 'bg-emerald-400' : 'bg-[#4f6fe8]'}`} style={{ width: `${progress}%` }} /></div><div className="mt-4 grid gap-2 text-sm text-slate-400 sm:grid-cols-2"><p>Remaining: <strong className="text-slate-200">{money(goal.remaining_amount)}</strong></p><p>Target: {targetDate}</p>{goal.suggested_monthly_contribution && <p className="sm:col-span-2">Suggested monthly saving: <strong className="text-slate-200">{money(goal.suggested_monthly_contribution)}</strong></p>}</div><div className="mt-5 flex gap-3"><button type="button" onClick={() => onEdit(goal)} className="rounded-lg border border-white/15 px-3 py-2 text-sm font-medium text-slate-200">Edit</button><button type="button" onClick={() => onDelete(goal.id)} className="rounded-lg px-3 py-2 text-sm font-medium text-rose-300 hover:bg-rose-500/10">Delete</button></div></article>
}
