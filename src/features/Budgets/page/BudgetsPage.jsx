import { AlertTriangle, ArrowDownRight, CalendarDays, CheckCircle2, Pencil, Plus, RefreshCw, Trash2, Wallet } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { API_URLS } from '../../../constants/apiUrls'
import { apiRequest } from '../../../services/apiClient'
import { unwrapResponseData } from '../../../services/resourceApi'
import './BudgetsPage.css'

const blankBudget = { category_id: '', period_type: 'monthly', amount: '', carry_forward: false }
const asNumber = (value) => Number(value || 0)
const money = (value) => `BDT ${asNumber(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const dateInput = () => new Date().toISOString().slice(0, 10)

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [date, setDate] = useState(dateInput)
  const [form, setForm] = useState(blankBudget)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [budgetData, categoryData] = await Promise.all([apiRequest(`${API_URLS.budgets.list}?date=${date}`), apiRequest(API_URLS.categories.list)])
      setBudgets(unwrapResponseData(budgetData, 'Unable to load budgets.')?.budgets ?? [])
      setCategories((unwrapResponseData(categoryData, 'Unable to load categories.') ?? []).filter((category) => category.type === 'EXPENSE'))
      setError('')
    } catch (loadError) { setError(loadError.message || 'Unable to load budgets.') } finally { setLoading(false) }
  }

  useEffect(() => { void load() }, [date])
  const totals = useMemo(() => budgets.reduce((all, budget) => ({ planned: all.planned + asNumber(budget.effective_budget), spent: all.spent + asNumber(budget.spent), remaining: all.remaining + asNumber(budget.remaining) }), { planned: 0, spent: 0, remaining: 0 }), [budgets])
  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const reset = () => { setForm(blankBudget); setEditingId(null) }
  const save = async (event) => {
    event.preventDefault(); setSaving(true); setError('')
    try {
      await apiRequest(editingId ? API_URLS.budgets.update(editingId) : API_URLS.budgets.create, { method: editingId ? 'PUT' : 'POST', body: JSON.stringify({ ...form, amount: Number(form.amount) }) })
      setNotice(editingId ? 'Budget updated successfully.' : 'Budget added successfully.'); reset(); await load()
    } catch (saveError) { setError(saveError.message || 'Unable to save budget.') } finally { setSaving(false) }
  }
  const edit = (budget) => { setEditingId(budget.id); setForm({ category_id: String(budget.category_id), period_type: budget.period_type, amount: String(budget.amount), carry_forward: Boolean(budget.carry_forward) }); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  const remove = async (id) => { if (!window.confirm('Remove this budget?')) return; try { await apiRequest(API_URLS.budgets.remove(id), { method: 'DELETE' }); setNotice('Budget removed.'); await load() } catch (removeError) { setError(removeError.message || 'Unable to remove budget.') } }

  return <section className="budget-page">
    <header className="budget-hero"><div className="budget-hero__copy"><span className="budget-eyebrow"><Wallet size={14} /> Spending control</span><h1>Make every taka count.</h1><p>Set simple category limits and see exactly how much room you have left to spend.</p></div><div className="budget-date-control"><CalendarDays size={18} /><label htmlFor="budget-date">Reviewing</label><input id="budget-date" aria-label="Budget date" type="date" value={date} onChange={(event) => setDate(event.target.value)} /><button type="button" onClick={() => void load()} aria-label="Refresh budgets"><RefreshCw size={17} /></button></div></header>
    {error && <Message tone="rose">{error}</Message>}{notice && <Message tone="emerald">{notice}</Message>}
    <div className="budget-metrics"><Metric icon={<Wallet />} label="Available budget" value={money(totals.planned)} helper="Your plan for this period" /><Metric icon={<ArrowDownRight />} label="Actual spending" value={money(totals.spent)} helper={`${budgets.length} active ${budgets.length === 1 ? 'budget' : 'budgets'}`} tone="amber" /><Metric icon={<CheckCircle2 />} label="Still available" value={money(totals.remaining)} helper={totals.remaining < 0 ? 'You are over budget' : 'Safe to spend'} tone={totals.remaining < 0 ? 'rose' : 'green'} /></div>
    <form onSubmit={save} className="budget-form-card"><div className="budget-form-card__heading"><div><span className="budget-form-card__step">{editingId ? 'Edit your plan' : 'New budget'}</span><h2>{editingId ? 'Update this budget' : 'Add a category budget'}</h2><p>We will notify you as you reach 50%, 80%, and 100% of the limit.</p></div>{editingId && <button type="button" onClick={reset} className="budget-cancel">Cancel edit</button>}</div><div className="budget-form-grid"><Field label="Expense category"><select required value={form.category_id} onChange={(event) => change('category_id', event.target.value)}><option value="">Choose a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></Field><Field label="Budget period"><select value={form.period_type} onChange={(event) => change('period_type', event.target.value)}><option value="monthly">Monthly</option><option value="weekly">Weekly</option></select></Field><Field label="Budget amount"><div className="budget-money-input"><span>BDT</span><input required min="0.01" step="0.01" type="number" value={form.amount} onChange={(event) => change('amount', event.target.value)} placeholder="5,000" /></div></Field><label className={`budget-carry-toggle ${form.carry_forward ? 'is-active' : ''}`}><input type="checkbox" checked={form.carry_forward} onChange={(event) => change('carry_forward', event.target.checked)} /><span className="budget-carry-toggle__switch" /><span><strong>Carry unused amount</strong><small>Add what remains to the next period</small></span></label></div><button disabled={saving} className="budget-save"><Plus size={18} />{saving ? 'Saving budget…' : editingId ? 'Save changes' : 'Add budget'}</button></form>
    <div className="budget-list-heading"><div><span className="budget-eyebrow">Your plan</span><h2>Category budgets</h2></div><span className="budget-count">{budgets.length} {budgets.length === 1 ? 'budget' : 'budgets'}</span></div>
    {loading ? <div className="budget-state">Loading your budgets…</div> : budgets.length === 0 ? <div className="budget-empty"><div><Wallet size={25} /></div><h2>Your budget is a blank canvas</h2><p>Add a spending limit for an expense category to see your plan take shape.</p></div> : <div className="budget-card-grid">{budgets.map((budget) => <BudgetCard key={budget.id} budget={budget} onEdit={edit} onDelete={remove} />)}</div>}
  </section>
}

function BudgetCard({ budget, onEdit, onDelete }) { const percent = Math.max(0, Math.min(100, asNumber(budget.progress_percent))); const exceeded = budget.warning_level === 'exceeded'; const warning = budget.warning_level === 'warning' || budget.warning_level === 'watch'; const tone = exceeded ? 'rose' : warning ? 'amber' : 'green'; return <article className={`budget-card budget-card--${tone}`}><div className="budget-card__top"><div className="budget-card__identity"><span className="budget-card__icon"><Wallet size={18} /></span><div><h3>{budget.category_name}</h3><p className="capitalize">{budget.period_type} · {budget.period_start} — {budget.period_end}</p></div></div><div className="budget-card__actions"><button aria-label={`Edit ${budget.category_name} budget`} onClick={() => onEdit(budget)}><Pencil size={16} /></button><button aria-label={`Delete ${budget.category_name} budget`} onClick={() => onDelete(budget.id)}><Trash2 size={16} /></button></div></div><div className="budget-card__amounts"><div><span>Spent</span><strong>{money(budget.spent)}</strong></div><div><span>Available</span><strong>{money(budget.effective_budget)}</strong></div></div><div className="budget-progress-label"><span>{percent}% used</span><span>{asNumber(budget.remaining) < 0 ? 'Over limit' : `${money(budget.remaining)} left`}</span></div><div className="budget-progress"><span style={{ width: `${percent}%` }} /></div>{(warning || exceeded) && <p className="budget-card__alert"><AlertTriangle size={15} />{exceeded ? 'This budget has been reached or exceeded.' : `${budget.progress_percent}% of this budget has been used.`}</p>}<div className="budget-card__footer"><span>Daily allowance <strong>{money(budget.daily_allowance)}</strong></span>{budget.carry_forward && <span>+{money(budget.carry_amount)} carried forward</span>}</div></article> }
function Metric({ icon, label, value, helper, tone = 'blue' }) { return <article className={`budget-metric budget-metric--${tone}`}><span className="budget-metric__icon">{icon}</span><div><p>{label}</p><strong>{value}</strong><small>{helper}</small></div></article> }
function Field({ label, children }) { return <label className="budget-field"><span>{label}</span>{children}</label> }
function Message({ tone, children }) { return <p className={`budget-message budget-message--${tone}`}>{children}</p> }
