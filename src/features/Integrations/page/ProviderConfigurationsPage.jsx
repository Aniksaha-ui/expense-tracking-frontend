import { CheckCircle2, Circle, Eye, EyeOff, Plus, Save, Settings2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../components/common/Toaster'
import { getProviderConfigurations, saveProviderConfigurations } from '../service/providerConfigurationsService'

const fields = [
  'OCR_DRIVER',
  'OCR_ENABLED',
  'OCR_OPENAI_API_KEY',
  'GOOGLE_CLOUD_PROJECT',
  'GOOGLE_APPLICATION_CREDENTIALS',
  'SAVINGS_OFFERS_ENABLED',
  'SERPER_API_KEY',
]

const createProfile = (name = 'New provider profile') => ({
  id: crypto.randomUUID(), name, isActive: false,
  values: { OCR_DRIVER: 'google_vision', OCR_ENABLED: 'true', OCR_OPENAI_API_KEY: '', GOOGLE_CLOUD_PROJECT: '', GOOGLE_APPLICATION_CREDENTIALS: '', SAVINGS_OFFERS_ENABLED: 'false', SERPER_API_KEY: '' },
})

export default function ProviderConfigurationsPage() {
  const toast = useToast()
  const [profiles, setProfiles] = useState(() => [
    { ...createProfile('Production OCR & offers'), id: 'production', isActive: true, values: { ...createProfile().values, OCR_ENABLED: 'true', SAVINGS_OFFERS_ENABLED: 'true' } },
    { ...createProfile('OCR testing'), id: 'testing' },
  ])
  const [visibleSecrets, setVisibleSecrets] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const activeProfile = useMemo(() => profiles.find((profile) => profile.isActive), [profiles])

  const updateProfile = (profileId, patch) => setProfiles((current) => current.map((profile) => profile.id === profileId ? { ...profile, ...patch } : profile))
  const updateValue = (profileId, key, value) => setProfiles((current) => current.map((profile) => profile.id === profileId ? { ...profile, values: { ...profile.values, [key]: value } } : profile))
  const activate = (profileId) => setProfiles((current) => current.map((profile) => ({ ...profile, isActive: profile.id === profileId })))
  const addProfile = () => setProfiles((current) => [...current, createProfile(`Provider profile ${current.length + 1}`)])
  useEffect(() => { getProviderConfigurations().then((items) => { if (items.length) setProfiles(items) }).catch(() => {}) }, [])
  const save = async () => { setIsSaving(true); try { setProfiles(await saveProviderConfigurations(profiles)); toast.success('Provider configurations saved.') } catch (error) { toast.error(error.message || 'Unable to save provider configurations.') } finally { setIsSaving(false) } }

  return <main className="routes-page"><div className="routes-page__inner space-y-6">
    <header className="routes-page__header"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="routes-page__title"><Settings2 size={20} color="#4f83ff" /><h1>Provider Configurations</h1></div><p className="routes-page__subtitle">Maintain multiple OCR and offer-search profiles. Only one profile can be active at a time.</p></div><div className="flex gap-3"><button type="button" className="cron-delivery__secondary-button" onClick={addProfile}><Plus size={15} /> Add profile</button><button type="button" disabled={isSaving} className="routes-new-button" onClick={() => void save()}><Save size={15} /> {isSaving ? 'Saving...' : 'Save configurations'}</button></div></div></header>
    <section className="rounded-xl border border-[#332d30] bg-[#171314] p-4 text-sm text-[#c5d9f7]">Active profile: <strong className="text-white">{activeProfile?.name ?? 'None selected'}</strong>. Secrets are encrypted at rest and masked in this interface.</section>
    <div className="space-y-5">{profiles.map((profile) => <section key={profile.id} className={`overflow-hidden rounded-xl border bg-[#171314] ${profile.isActive ? 'border-blue-500/70' : 'border-[#332d30]'}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#332d30] bg-[#1d181a] px-5 py-4"><div className="flex items-center gap-3"><button type="button" onClick={() => activate(profile.id)} className="text-blue-400" title="Make active">{profile.isActive ? <CheckCircle2 size={21} /> : <Circle size={21} />}</button><input aria-label="Profile name" value={profile.name} onChange={(event) => updateProfile(profile.id, { name: event.target.value })} className="bg-transparent text-base font-bold text-white outline-none" /></div><span className={`rounded-full px-3 py-1 text-xs font-bold ${profile.isActive ? 'bg-blue-500/20 text-blue-300' : 'bg-[#292326] text-[#969baa]'}`}>{profile.isActive ? 'Active profile' : 'Inactive'}</span></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-[#332d30] text-xs uppercase tracking-wide text-[#969baa]"><tr><th className="px-5 py-3">Configuration key</th><th className="px-5 py-3">Value</th><th className="px-5 py-3">Purpose</th></tr></thead><tbody>{fields.map((key) => { const isSecret = key.endsWith('_API_KEY') || key === 'GOOGLE_APPLICATION_CREDENTIALS'; const boolean = key.endsWith('_ENABLED'); const secretConfigured = profile.secretConfigured?.[key]; const secretPlaceholder = secretConfigured ? 'Configured — enter a new value to replace it' : 'Enter a valid secret value'; return <tr key={key} className="border-b border-[#2d282b] last:border-0"><td className="px-5 py-3 font-mono text-xs text-blue-300">{key}</td><td className="px-5 py-3">{boolean ? <select value={profile.values[key]} onChange={(event) => updateValue(profile.id, key, event.target.value)} className="w-32 rounded-md border border-[#3c373a] bg-[#211c1f] px-3 py-2 text-white outline-none"><option value="true">Enabled</option><option value="false">Disabled</option></select> : <div className="flex max-w-md items-center gap-2"><input type={isSecret && !visibleSecrets[`${profile.id}:${key}`] ? 'password' : 'text'} value={profile.values[key]} placeholder={isSecret ? secretPlaceholder : 'Not configured'} onChange={(event) => updateValue(profile.id, key, event.target.value)} className="w-full rounded-md border border-[#3c373a] bg-[#211c1f] px-3 py-2 font-mono text-xs text-white outline-none focus:border-blue-500" />{isSecret ? <button type="button" onClick={() => setVisibleSecrets((current) => ({ ...current, [`${profile.id}:${key}`]: !current[`${profile.id}:${key}`] }))} className="rounded-md p-2 text-[#969baa] hover:bg-[#292326] hover:text-white">{visibleSecrets[`${profile.id}:${key}`] ? <EyeOff size={16} /> : <Eye size={16} />}</button> : null}</div>}</td><td className="px-5 py-3 text-xs text-[#969baa]">{key === 'OCR_DRIVER' ? 'Selects the OCR provider.' : key === 'SAVINGS_OFFERS_ENABLED' ? 'Controls Savings Offers PDFs and searches.' : key.includes('SERPER') ? 'Credentials for offer discovery.' : 'Provider connection setting.'}</td></tr> })}</tbody></table></div>
    </section>)}</div>
  </div></main>
}
