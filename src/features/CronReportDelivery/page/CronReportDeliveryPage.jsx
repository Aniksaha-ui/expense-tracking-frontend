import { BellRing, CalendarDays, LocateFixed, Mail, Play, RefreshCcw, Save, Send, Settings2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useToast } from '../../../components/common/Toaster'
import { getCronReportDeliverySettings, saveOfferLocation, updateCronReportDeliverySettings } from '../service/cronReportDeliveryService'
import { runCronReportJob } from '../service/cronReportJobService'
import '../styles/cronReportDelivery.css'

const toLines = (items) => (items ?? []).join('\n')
const fromLines = (value) => value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean)
const today = new Date().toISOString().slice(0, 10)
const monthStart = today.slice(0, 8) + "01"

export default function CronReportDeliveryPage() {
  const toast = useToast()
  const [settings, setSettings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [fromDate, setFromDate] = useState(monthStart)
  const [toDate, setToDate] = useState(today)
  const [runningJob, setRunningJob] = useState(null)
  const [isSavingLocation, setIsSavingLocation] = useState(false)

  const load = async () => {
    setIsLoading(true)
    try {
      setSettings(await getCronReportDeliverySettings())
    } catch (error) {
      toast.error(error.message || 'Unable to load cron delivery settings.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { void load() }, [])

  const update = (jobKey, field, value) => {
    setSettings((current) => current.map((setting) => (setting.job_key === jobKey ? { ...setting, [field]: value } : setting)))
  }

  const save = async () => {
    setIsSaving(true)
    try {
      const saved = await updateCronReportDeliverySettings(settings.map((setting) => ({
        ...setting,
        email_recipients: fromLines(toLines(setting.email_recipients)),
        telegram_chat_ids: fromLines(toLines(setting.telegram_chat_ids)),
      })))
      setSettings(saved)
      toast.success('Cron report delivery settings saved.')
    } catch (error) {
      toast.error(error.message || 'Unable to save cron delivery settings.')
    } finally {
      setIsSaving(false)
    }
  }

  const run = async (setting) => {
    if (fromDate > toDate) { toast.error("The start date must be on or before the end date."); return }
    if (!fromDate || !toDate) { toast.error("Choose both a start date and an end date."); return }

    setRunningJob(setting.job_key)
    try {
      const payload = { from_date: fromDate, to_date: toDate }
      if (setting.job_key === "expense_intelligence_reports") payload.frequency = "daily"

      const result = await runCronReportJob(setting.job_key, payload)
      toast.success(result.message || "Report command completed successfully.")
    } catch (error) { toast.error(error.message || "Unable to run the report command.") } finally { setRunningJob(null) }
  }

  const useCurrentLocation = () => {
    if (!navigator.geolocation) { toast.error('This browser does not support location access.'); return }

    setIsSavingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const location = await saveOfferLocation({ latitude: coords.latitude, longitude: coords.longitude })
          toast.success(`Offer location saved. Nearby offers will use a ${location.radius_km} km radius.`)
        } catch (error) {
          toast.error(error.message || 'Unable to save your offer location.')
        } finally {
          setIsSavingLocation(false)
        }
      },
      (error) => {
        setIsSavingLocation(false)
        toast.error(error.code === error.PERMISSION_DENIED ? 'Location permission was denied. Enable it in your browser and try again.' : 'Unable to determine your location.')
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 },
    )
  }

  return (
    <main className="routes-page cron-delivery">
      <div className="routes-page__inner cron-delivery__inner">
        <header className="routes-page__header cron-delivery__header">
          <div>
            <div className="routes-page__title"><Settings2 size={20} color="#4f83ff" /><h1>Cron Report Delivery</h1></div>
            <p className="routes-page__subtitle">Set delivery channels for each scheduled report, or run a report on demand for a selected period.</p>
          </div>
          <div className="cron-delivery__page-actions">
            <button type="button" className="cron-delivery__secondary-button" onClick={useCurrentLocation} disabled={isSavingLocation}><LocateFixed size={15} /> {isSavingLocation ? 'Saving location...' : 'Use my location for offers'}</button>
            <button type="button" className="cron-delivery__secondary-button" onClick={() => void load()} disabled={isLoading}><RefreshCcw size={15} /> Refresh</button>
            <button type="button" className="routes-new-button" onClick={() => void save()} disabled={isLoading || isSaving}><Save size={15} /> {isSaving ? 'Saving...' : 'Save changes'}</button>
          </div>
        </header>

        <section className="cron-delivery__period" aria-labelledby="run-period-heading">
          <div className="cron-delivery__period-heading">
            <span className="cron-delivery__period-icon"><CalendarDays size={18} /></span>
            <div>
              <h2 id="run-period-heading">Manual run period</h2>
              <p>Used only when you select <strong>Run now</strong>.</p>
            </div>
          </div>
          <div className="cron-delivery__dates">
            <label className="cron-delivery__date-field"><span>From</span><input type="date" value={fromDate} max={toDate} onChange={(event) => setFromDate(event.target.value)} /></label>
            <span className="cron-delivery__date-divider" aria-hidden="true">to</span>
            <label className="cron-delivery__date-field"><span>To</span><input type="date" value={toDate} min={fromDate} onChange={(event) => setToDate(event.target.value)} /></label>
          </div>
        </section>

        {isLoading ? <div className="rounded-xl border border-[#332d30] bg-[#171314] p-6 text-sm text-[#969baa]">Loading scheduled report settings...</div> : null}
        <div className="space-y-5">
          {settings.map((setting) => (
            <section key={setting.job_key} className={`cron-delivery__report ${setting.is_enabled ? '' : 'cron-delivery__report--disabled'}`}>
              <div className="cron-delivery__report-header">
                <div className="cron-delivery__report-info">
                  <span className="cron-delivery__eyebrow">Scheduled report</span>
                  <h2>{setting.label}</h2>
                  <code>{setting.command}</code>
                </div>
                <div className="cron-delivery__report-actions">
                  <label className="cron-delivery__switch-row">
                    <span>{setting.is_enabled ? 'Delivery on' : 'Delivery off'}</span>
                    <input className="cron-delivery__switch-input" type="checkbox" checked={setting.is_enabled} onChange={(event) => update(setting.job_key, 'is_enabled', event.target.checked)} />
                    <span className="cron-delivery__switch" aria-hidden="true" />
                  </label>
                  <button type="button" className="cron-delivery__run-button" disabled={!setting.is_enabled || runningJob === setting.job_key} onClick={() => void run(setting)}><Play size={14} fill="currentColor" /> {runningJob === setting.job_key ? "Running..." : "Run now"}</button>
                </div>
              </div>
              <div className="cron-delivery__channels">
                <div className={`cron-delivery__channel ${setting.email_enabled && setting.is_enabled ? 'cron-delivery__channel--active' : ''}`}>
                  <div className="cron-delivery__channel-header">
                    <div className="cron-delivery__channel-title"><span className="cron-delivery__channel-icon cron-delivery__channel-icon--email"><Mail size={17} /></span><div><h3>Email</h3><p>Send the complete report as a PDF.</p></div></div>
                    <label className="cron-delivery__switch-row cron-delivery__switch-row--compact"><span className="sr-only">Enable email for {setting.label}</span><input className="cron-delivery__switch-input" type="checkbox" checked={setting.email_enabled} disabled={!setting.is_enabled} onChange={(event) => update(setting.job_key, 'email_enabled', event.target.checked)} /><span className="cron-delivery__switch" aria-hidden="true" /></label>
                  </div>
                  <label className="cron-delivery__input-label">Recipients <span>One email address per line</span></label>
                  <textarea className="cron-delivery__textarea" value={toLines(setting.email_recipients)} disabled={!setting.is_enabled || !setting.email_enabled} onChange={(event) => update(setting.job_key, 'email_recipients', fromLines(event.target.value))} placeholder="you@example.com" />
                </div>
                <div className={`cron-delivery__channel ${setting.telegram_enabled && setting.is_enabled ? 'cron-delivery__channel--active' : ''}`}>
                  <div className="cron-delivery__channel-header">
                    <div className="cron-delivery__channel-title"><span className="cron-delivery__channel-icon cron-delivery__channel-icon--telegram"><Send size={17} /></span><div><h3>Telegram</h3><p>Send a compact completion notification.</p></div></div>
                    <label className="cron-delivery__switch-row cron-delivery__switch-row--compact"><span className="sr-only">Enable Telegram for {setting.label}</span><input className="cron-delivery__switch-input" type="checkbox" checked={setting.telegram_enabled} disabled={!setting.is_enabled} onChange={(event) => update(setting.job_key, 'telegram_enabled', event.target.checked)} /><span className="cron-delivery__switch" aria-hidden="true" /></label>
                  </div>
                  <label className="cron-delivery__input-label">Chat IDs <span>One chat ID per line</span></label>
                  <textarea className="cron-delivery__textarea" value={toLines(setting.telegram_chat_ids)} disabled={!setting.is_enabled || !setting.telegram_enabled} onChange={(event) => update(setting.job_key, 'telegram_chat_ids', fromLines(event.target.value))} placeholder="-1001234567890" />
                </div>
              </div>
              <p className="cron-delivery__note"><BellRing size={14} /> Changes are saved when you select <strong>Save changes</strong>. Telegram delivery requires a configured bot token.</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
