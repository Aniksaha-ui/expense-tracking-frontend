import { Download, LoaderCircle, Pencil, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { downloadOneFile, getFilePreview, getTextContent, saveTextContent } from '../service/fileManagerService'

const editable = (file) => file.mime_type?.startsWith('text/') || /\.(txt|md|csv|json|xml|html|css|js)$/i.test(file.original_name)

export default function DocumentPreviewModal({ file, onClose, onUpdated, toast }) {
  const textFile = editable(file)
  const [loading, setLoading] = useState(true)
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [mime, setMime] = useState('')
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let objectUrl = ''
    ;(async () => {
      try {
        if (textFile) setContent((await getTextContent(file.id)).content || '')
        else { const preview = await getFilePreview(file.id); objectUrl = preview.url; setUrl(preview.url); setMime(preview.mimeType) }
      } catch (err) { setError(err.message) } finally { setLoading(false) }
    })()
    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [file.id, textFile])

  const save = async () => {
    try { await saveTextContent(file.id, content); setEditing(false); toast.success('Saved as a new version.'); onUpdated() } catch (err) { toast.error(err.message) }
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4" onMouseDown={onClose}>
    <div className="flex h-[80vh] w-full max-w-5xl flex-col rounded-xl border border-[#3b3538] bg-[#171314]" onMouseDown={(event) => event.stopPropagation()}>
      <div className="flex items-center justify-between border-b border-[#3b3538] px-5 py-3"><div className="min-w-0"><p className="truncate font-bold text-white">{file.original_name}</p><p className="text-xs text-[#969baa]">{textFile ? 'Editable text document' : 'Document preview'}</p></div><div className="flex gap-2">{textFile && <button type="button" onClick={() => editing ? void save() : setEditing(true)} className="fm-button fm-button-primary">{editing ? <Save size={15} /> : <Pencil size={15} />}{editing ? 'Save version' : 'Edit'}</button>}<button type="button" onClick={() => void downloadOneFile(file.id)} className="fm-icon-button"><Download size={18} /></button><button type="button" onClick={onClose} className="fm-icon-button"><X size={19} /></button></div></div>
      <div className="min-h-0 flex-1 overflow-auto p-4">{loading ? <div className="flex h-full items-center justify-center"><LoaderCircle className="animate-spin text-[#969baa]" /></div> : error ? <p className="text-red-300">{error}</p> : textFile ? editing ? <textarea value={content} onChange={(event) => setContent(event.target.value)} className="h-full min-h-[450px] w-full rounded-lg border border-[#4a4448] bg-[#100d0e] p-4 font-mono text-sm text-white" /> : <pre className="whitespace-pre-wrap break-words rounded-lg bg-[#100d0e] p-4 text-sm text-[#d7dae2]">{content}</pre> : mime.startsWith('image/') ? <img src={url} alt={file.original_name} className="mx-auto max-h-full max-w-full object-contain" /> : mime.includes('pdf') ? <iframe src={url} title={file.original_name} className="h-full min-h-[560px] w-full bg-white" /> : <p className="p-8 text-center text-[#969baa]">Preview is not available for this file type. Use Download.</p>}</div>
    </div>
  </div>
}
