import { useEffect, useState } from 'react'
import { API_URLS } from '../../../constants/apiUrls'
import { apiRequest } from '../../../services/apiClient'
import { unwrapResponseData } from '../../../services/resourceApi'

const money = (value) => `BDT ${Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function FinancialIntelligencePage() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')

  useEffect(() => { load() }, [])
  async function load() {
    setLoading(true); setError('')
    try { setData(unwrapResponseData(await apiRequest(API_URLS.financialIntelligence.dashboard))) }
    catch (loadError) { setError(loadError.message || 'Unable to load financial intelligence.') }
    finally { setLoading(false) }
  }
  async function ask(event) {
    event.preventDefault(); if (!question.trim()) return
    setAnswer('')
    try { const result = unwrapResponseData(await apiRequest(API_URLS.financialIntelligence.ask, { method: 'POST', body: JSON.stringify({ question }) })); setAnswer(result.answer) }
    catch (askError) { setAnswer(askError.message || 'Unable to answer that question.') }
  }

  if (loading) return <div className="p-6 text-slate-300">Preparing your financial intelligence…</div>
  if (error) return <div className="p-6 text-rose-300">{error}</div>
  const metrics = data?.metrics ?? {}; const forecast = data?.forecast ?? {}; const insights = data?.insights ?? []
  return <section className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6">
    <div><p className="text-xs font-semibold uppercase tracking-[.2em] text-[#7ea1ff]">Evidence-based analysis</p><h1 className="mt-1 text-2xl font-bold text-white">Financial Intelligence Report</h1><p className="mt-2 text-sm text-slate-400">{data?.period?.from_date} to {data?.period?.to_date}. Estimates are clearly separated from recorded activity.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {[['Current balance', metrics.current_balance], ['Income', metrics.total_income], ['Expenses', metrics.total_expenses], ['Net cash flow', metrics.net_cash_flow]].map(([label, value]) => <article key={label} className="rounded-2xl border border-white/10 bg-[#191417] p-5"><p className="text-sm text-slate-400">{label}</p><p className="mt-2 text-xl font-bold text-white">{money(value)}</p></article>)}
    </div>
    <div className="grid gap-6 lg:grid-cols-2">
      <article className="rounded-2xl border border-white/10 bg-[#191417] p-5"><h2 className="text-lg font-semibold text-white">AI financial briefing</h2><div className="mt-4 space-y-3">{insights.map((item) => <div key={item.title} className="rounded-xl border border-white/10 p-4"><div className="flex justify-between gap-3"><h3 className="font-medium text-white">{item.title}</h3><span className="text-xs uppercase text-[#7ea1ff]">{item.priority}</span></div><p className="mt-2 text-sm text-slate-300">{item.interpretation}</p><p className="mt-2 text-xs text-slate-500">Action: {item.recommended_action}</p></div>)}</div></article>
      <article className="rounded-2xl border border-white/10 bg-[#191417] p-5"><h2 className="text-lg font-semibold text-white">Month-end forecast</h2>{forecast.available ? <><p className="mt-2 text-sm text-slate-400">{forecast.method}</p><div className="mt-4 grid gap-3 sm:grid-cols-2"><Metric label="Estimated expenses" value={forecast.estimated_month_end.expenses}/><Metric label="Estimated net cash flow" value={forecast.estimated_month_end.net_cash_flow}/></div><p className="mt-4 text-xs text-slate-500">{forecast.limitations?.[0]}</p></> : <p className="mt-3 text-sm text-slate-400">{forecast.reason}</p>}</article>
    </div>
    <article className="rounded-2xl border border-white/10 bg-[#191417] p-5"><h2 className="text-lg font-semibold text-white">Ask about your finances</h2><form className="mt-4 flex gap-3" onSubmit={ask}><input className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#100d0e] px-4 py-3 text-white" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Why did my expenses increase?"/><button className="rounded-xl bg-[#4f6fe8] px-5 py-3 font-medium text-white">Ask</button></form>{answer && <p className="mt-4 rounded-xl bg-white/5 p-4 text-sm text-slate-300">{answer}</p>}</article>
  </section>
}

function Metric({ label, value }) { return <div className="rounded-xl bg-white/5 p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 font-semibold text-white">{money(value)}</p></div> }
