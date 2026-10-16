import { CheckCircle2, CloudDownload, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { API_URLS } from "../../../constants/apiUrls";
import { apiRequest } from "../../../services/apiClient";
import { unwrapResponseData } from "../../../services/resourceApi";

const today = () => new Date().toISOString().slice(0, 10);

export function JiraAchievementImport({ onImported }) {
  const [form, setForm] = useState({
    base_url: "",
    email: "",
    api_token: "",
    jql: "",
  });
  const [startDate, setStartDate] = useState(`${today().slice(0, 8)}01`);
  const [endDate, setEndDate] = useState(today());
  const [preview, setPreview] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [connection, setConnection] = useState(null);
  useEffect(() => {
    apiRequest(API_URLS.jira.get)
      .then((response) => {
        const data = unwrapResponseData(response);
        if (data?.configured)
          setForm((current) => ({
            ...current,
            base_url: data.base_url ?? "",
            email: data.email ?? "",
            jql: data.jql ?? "",
          }));
      })
      .catch(() => {});
  }, []);
  const save = async () => {
    setBusy(true);
    setError("");
    try {
      await apiRequest(API_URLS.jira.save, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      setMessage("Jira connection saved. Your API token is encrypted.");
      setForm((current) => ({ ...current, api_token: "" }));
    } catch (err) {
      setError(err.message || "Unable to save Jira connection.");
    } finally {
      setBusy(false);
    }
  };
  const fetchPreview = async () => {
    setBusy(true);
    setError("");
    try {
      const data = unwrapResponseData(
        await apiRequest(API_URLS.jira.preview, {
          method: "POST",
          body: JSON.stringify({ start_date: startDate, end_date: endDate }),
        }),
        "Unable to fetch Jira issues.",
      );
      setPreview(data?.achievements ?? []);
      setMessage(
        `${data?.achievements?.length ?? 0} AI achievement drafts generated.`,
      );
    } catch (err) {
      setError(err.message || "Unable to fetch Jira issues.");
    } finally {
      setBusy(false);
    }
  };
  const verify = async () => {
    setBusy(true);
    setError("");
    try {
      const data = unwrapResponseData(
        await apiRequest(API_URLS.jira.verify, { method: "POST" }),
        "Unable to verify Jira connection.",
      );
      setConnection(data);
      setMessage(`Connected as ${data.display_name}. ${data.visible_project_count} Jira projects are visible.`);
    } catch (err) {
      setConnection(null);
      setError(err.message || "Unable to verify Jira connection.");
    } finally {
      setBusy(false);
    }
  };
  const importPreview = async () => {
    if (!preview.length) return;
    setBusy(true);
    setError("");
    try {
      await apiRequest(API_URLS.achievements.bulk, {
        method: "POST",
        body: JSON.stringify({ achievements: preview }),
      });
      setMessage(`${preview.length} Jira achievements added.`);
      setPreview([]);
      await onImported();
    } catch (err) {
      setError(err.message || "Unable to add Jira achievements.");
    } finally {
      setBusy(false);
    }
  };
  const syncGenerate = async () => {
    setBusy(true); setError("");
    try { const data = unwrapResponseData(await apiRequest(API_URLS.jiraGenerated.sync, { method: "POST", body: JSON.stringify({ start_date: startDate, end_date: endDate }) }), "Unable to synchronize Jira work."); setPreview(data?.achievements ?? []); setMessage(`${data?.issues_synced ?? 0} Jira issues synchronized and ${data?.achievements?.length ?? 0} drafts created.`); }
    catch (err) { setError(err.message || "Unable to synchronize Jira work."); } finally { setBusy(false); }
  };
  return (
    <section className="rounded-2xl border border-sky-400/20 bg-sky-500/[.05] p-5 sm:p-6">
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-400/15 text-sky-200">
          <Link2 size={19} />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[.15em] text-sky-300">
            Jira + OpenAI import
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            Turn Jira work into achievement drafts
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Fetch only completed Jira issues assigned to your connected Atlassian
            account in the selected date range. Related completed work is combined
            into one OpenAI-written achievement draft.
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input
          label="Jira site URL"
          value={form.base_url}
          placeholder="https://company.atlassian.net"
          onChange={(value) => setForm({ ...form, base_url: value })}
        />
        <Input
          label="Atlassian email"
          value={form.email}
          placeholder="you@company.com"
          onChange={(value) => setForm({ ...form, email: value })}
        />
        <Input
          label="API token"
          type="password"
          value={form.api_token}
          placeholder="Paste token to connect or replace"
          onChange={(value) => setForm({ ...form, api_token: value })}
        />
        <Input
          label="Optional JQL filter"
          value={form.jql}
          placeholder="project in (APP, WEB)"
          onChange={(value) => setForm({ ...form, jql: value })}
        />
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <Input
          label="Start date"
          type="date"
          value={startDate}
          onChange={setStartDate}
        />
        <Input
          label="End date"
          type="date"
          value={endDate}
          onChange={setEndDate}
        />
        <button
          type="button"
          disabled={busy}
          onClick={() => void save()}
          className="rounded-xl border border-sky-300/30 px-4 py-3 text-sm font-semibold text-sky-100 disabled:opacity-50"
        >
          Save connection
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => void verify()}
          className="rounded-xl border border-emerald-300/30 px-4 py-3 text-sm font-semibold text-emerald-100 disabled:opacity-50"
        >
          Verify Jira
        </button>
        <button
          type="button"
          disabled={busy || !startDate || !endDate}
          onClick={() => void fetchPreview()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          <CloudDownload size={17} />
          {busy ? "Working…" : "Fetch & analyse"}
        </button>
        <button type="button" disabled={busy || !startDate || !endDate} onClick={() => void syncGenerate()} className="rounded-xl bg-indigo-500 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Sync & save drafts</button>
      </div>
      {error && (
        <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
          {message}
        </p>
      )}
      {connection && (
        <p className="mt-2 text-xs text-sky-200">
          Visible projects: {connection.projects?.map((project) => project.key).filter(Boolean).join(", ") || "None"}
        </p>
      )}
      {preview.length > 0 && (
        <div className="mt-4 rounded-xl border border-white/10 bg-black/10 p-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="font-semibold text-white">
              AI-generated achievement preview
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void importPreview()}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-white"
            >
              <CheckCircle2 size={16} />
              Add to achievements
            </button>
          </div>
          {preview.map((item) => (
            <div key={item.source_key} className="mt-3">
              <p className="font-medium text-white">{item.title}</p>
              <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-300">
                {item.description}
              </p>
              <p className="mt-2 text-xs text-sky-300">
                Source: {item.source_key}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
function Input({ label, value, onChange, type = "text", placeholder = "" }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-300">
      <span>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        className="goal-input"
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
