import {
  AlertTriangle, Eye, ChevronRight, Download, File, FileImage, FileText, Folder, FolderPlus,
  LoaderCircle, MoreVertical, Pencil, Trash2, Upload, X,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '../../../components/common/Toaster'
import DocumentPreviewModal from "../component/DocumentPreviewModal"
import {
  createFolder, deleteItem, downloadManyFiles, downloadOneFile, getFileManagerItems, renameItem, uploadFileVersion, uploadFiles,
} from '../service/fileManagerService'

const formatBytes = (bytes = 0) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${units[index]}`
}

const getFileIcon = (mime = '') => {
  if (mime.startsWith('image/')) return FileImage
  if (mime.includes('pdf')) return FileText
  return File
}

export default function FileManagerPage() {
  const toast = useToast()
  const pickerRef = useRef(null)
  const versionPickerRef = useRef(null)
  const [items, setItems] = useState({ breadcrumbs: [], files: [], folders: [] })
  const [folderId, setFolderId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selected, setSelected] = useState([])
  const [dragging, setDragging] = useState(false)
  const [dialog, setDialog] = useState(null)
  const [previewFile, setPreviewFile] = useState(null)
  const [versionTarget, setVersionTarget] = useState(null)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const load = useCallback(async (nextFolderId = folderId) => {
    setLoading(true)
    try {
      setItems(await getFileManagerItems(nextFolderId))
      setSelected([])
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }, [folderId, toast])

  useEffect(() => { void load(folderId) }, [folderId])

  const openDialog = (type, item = null) => {
    setName(item?.name || '')
    setDialog({ type, item })
  }

  const closeDialog = () => {
    if (!submitting) setDialog(null)
  }

  const submitDialog = async (event) => {
    event.preventDefault()
    if (!dialog) return

    const isDelete = dialog.type.startsWith('delete')
    if (!isDelete && !name.trim()) {
      toast.error('Please enter a name.')
      return
    }

    const itemType = dialog.type.toLowerCase().includes('folder') ? 'folder' : 'file'
    setSubmitting(true)
    try {
      if (dialog.type === 'create-folder') {
        await createFolder(name.trim(), folderId)
        toast.success('Folder created.')
      } else if (isDelete) {
        await deleteItem(itemType, dialog.item.id)
        toast.success(`${itemType === 'folder' ? 'Folder' : 'File'} deleted.`)
      } else {
        await renameItem(itemType, dialog.item.id, name.trim())
        toast.success(`${itemType === 'folder' ? 'Folder' : 'File'} renamed.`)
      }
      setDialog(null)
      await load()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const upload = async (fileList) => {
    const files = Array.from(fileList || [])
    if (!files.length) return

    setUploading(true)
    try {
      await uploadFiles(files, folderId)
      toast.success(`${files.length} file${files.length === 1 ? '' : 's'} uploaded.`)
      await load()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setUploading(false)
    }
  }

  const currentFolderName = items.folder?.name || "My files"

  const openFolder = (id) => {
    setFolderId(id)
  }

  const uploadNewVersion = async (fileList) => {
    const nextFile = fileList?.[0]
    if (!nextFile || !versionTarget) return
    setUploading(true)
    try {
      await uploadFileVersion(versionTarget.id, nextFile)
      toast.success("New document version uploaded.")
      await load()
    } catch (error) {
      toast.error(error.message)
    } finally {
      setUploading(false)
      setVersionTarget(null)
    }
  }

  const toggleFile = (id) => {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  }

  const downloadSelected = async () => {
    try {
      await downloadManyFiles(selected)
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl p-4 md:p-7">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Private storage</p>
          <h1 className="mt-1 text-2xl font-bold text-white">File Manager</h1>
          <p className="mt-1 text-sm text-[#969baa]">Organize documents, notes, PDFs, images, and other files.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {selected.length ? <button type="button" onClick={() => void downloadSelected()} className="fm-button fm-button-secondary"><Download size={16} /> Download selected ({selected.length})</button> : null}
          <button type="button" onClick={() => openDialog('create-folder')} className="fm-button fm-button-secondary"><FolderPlus size={16} /> New folder</button>
          <button type="button" onClick={() => pickerRef.current?.click()} disabled={uploading} className="fm-button fm-button-primary">
            {uploading ? <LoaderCircle className="animate-spin" size={16} /> : <Upload size={16} />}
            {uploading ? 'Uploading...' : 'Upload files'}
          </button>
          <input ref={pickerRef} type="file" multiple className="hidden" onChange={(event) => { void upload(event.target.files); event.target.value = '' }} />
          <input ref={versionPickerRef} type="file" className="hidden" onChange={(event) => { void uploadNewVersion(event.target.files); event.currentTarget.value = "" }} />
        </div>
      </div>

      <nav className="mb-5 flex items-center gap-1 overflow-x-auto text-sm" aria-label="Folder path">
        <button type="button" onClick={() => setFolderId(null)} className="whitespace-nowrap text-blue-300 hover:text-white">My files</button>
        {items.breadcrumbs?.map((crumb) => (
          <span key={crumb.id} className="flex items-center gap-1">
            <ChevronRight size={15} className="text-[#686b77]" />
            <button type="button" onClick={() => setFolderId(crumb.id)} className="whitespace-nowrap text-[#b7bbc7] hover:text-white">{crumb.name}</button>
          </span>
        ))}
      </nav>

      <div className="mb-2 flex items-center gap-2 text-sm text-[#969baa]"><Folder size={16} className="text-amber-400" /><span>Uploading to: <strong className="text-white">{currentFolderName}</strong></span></div>
      <section
        className={`fm-dropzone ${dragging ? 'fm-dropzone-active' : ''}`}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true) }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { if (event.currentTarget === event.target) setDragging(false) }}
        onDrop={(event) => { event.preventDefault(); setDragging(false); void upload(event.dataTransfer.files) }}
      >
        <Upload size={20} />
        <span>Drop files here to upload, or <button type="button" onClick={() => pickerRef.current?.click()} className="font-bold text-blue-300 hover:text-blue-200">browse</button></span>
        <span className="text-xs text-[#686b77]">Up to 30 files, 25 MB each</span>
      </section>

      {loading ? (
        <div className="flex h-56 items-center justify-center text-[#969baa]"><LoaderCircle className="mr-2 animate-spin" size={20} /> Loading workspace...</div>
      ) : (
        <section className="mt-5 rounded-xl border border-[#2d282b] bg-[#171314]">
          <div className="border-b border-[#2d282b] px-5 py-4 text-sm font-semibold text-white">
            {items.folders?.length + items.files?.length ? `${items.folders.length} folders - ${items.files.length} files` : 'This folder is empty'}
          </div>
          <div className="p-3">
            {items.folders?.length ? (
              <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {items.folders.map((folder) => (
                  <article key={folder.id} className="fm-folder-card">
                    <button type="button" onClick={() => openFolder(folder.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                      <Folder className="shrink-0 fill-amber-400 text-amber-400" size={28} />
                      <span className="truncate font-semibold text-white">{folder.name}</span><span className="text-xs text-blue-300">Open</span>
                    </button>
                    <ItemMenu onDelete={() => openDialog('delete-folder', folder)} onRename={() => openDialog('rename-folder', folder)} />
                  </article>
                ))}
              </div>
            ) : null}

            {items.files?.length ? (
              <div>
                <table className="w-full min-w-[620px] text-left text-sm">
                  <thead className="text-xs uppercase tracking-wide text-[#686b77]">
                    <tr>
                      <th className="w-10 p-3"><input aria-label="Select all files" type="checkbox" checked={Boolean(items.files.length) && selected.length === items.files.length} onChange={(event) => setSelected(event.target.checked ? items.files.map((file) => file.id) : [])} /></th>
                      <th className="p-3">Name</th><th className="p-3">Type</th><th className="p-3">Size</th><th className="p-3">Updated</th><th className="p-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {items.files.map((file) => {
                      const Icon = getFileIcon(file.mime_type)
                      return (
                        <tr key={file.id} className="border-t border-[#2d282b] text-[#b7bbc7]">
                          <td className="p-3"><input aria-label={`Select ${file.name}`} type="checkbox" checked={selected.includes(file.id)} onChange={() => toggleFile(file.id)} /></td>
                          <td className="p-3"><button type="button" className="flex items-center gap-3 text-left hover:text-white" onClick={() => void downloadOneFile(file.id).catch((error) => toast.error(error.message))}><Icon className="text-blue-300" size={19} /><span className="max-w-[270px] truncate font-medium">{file.original_name}</span></button></td>
                          <td className="p-3">{file.mime_type || 'Unknown'}</td><td className="p-3">{formatBytes(file.size)}</td><td className="p-3">{new Date(file.updated_at).toLocaleDateString()}</td>
                          <td className="p-3"><div className="flex justify-end gap-1"><button type="button" title="Preview" onClick={() => setPreviewFile(file)} className="fm-icon-button"><Eye size={16} /></button><button type="button" title="Upload new version" onClick={() => { setVersionTarget(file); versionPickerRef.current?.click() }} className="fm-icon-button"><Upload size={16} /></button><button type="button" title="Download" onClick={() => void downloadOneFile(file.id).catch((error) => toast.error(error.message))} className="fm-icon-button"><Download size={16} /></button><ItemMenu onDelete={() => openDialog('delete-file', file)} onRename={() => openDialog('rename-file', file)} /></div></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : null}

            {!items.folders?.length && !items.files?.length ? (
              <div className="py-14 text-center text-sm text-[#969baa]"><Folder className="mx-auto mb-3 text-[#686b77]" size={34} />Create a folder or upload files to get started.</div>
            ) : null}
          </div>
        </section>
      )}

      {previewFile ? <DocumentPreviewModal file={previewFile} onClose={() => setPreviewFile(null)} onUpdated={() => void load()} toast={toast} /> : null}
      <FileManagerDialog dialog={dialog} name={name} setName={setName} isSubmitting={submitting} onClose={closeDialog} onSubmit={submitDialog} />
    </main>
  )
}

function ItemMenu({ onDelete, onRename }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", closeOnOutsideClick)
    return () => document.removeEventListener("mousedown", closeOnOutsideClick)
  }, [])
  return (
    <div ref={menuRef} className="relative">
      <button type="button" onClick={() => setOpen((value) => !value)} className="fm-icon-button" aria-label="Item options"><MoreVertical size={17} /></button>
      {open ? <div className="absolute right-0 z-10 mt-1 w-36 rounded-lg border border-[#3b3538] bg-[#211c1f] py-1 shadow-xl"><button type="button" onClick={() => { setOpen(false); onRename() }} className="fm-menu-item"><Pencil size={14} /> Rename</button><button type="button" onClick={() => { setOpen(false); onDelete() }} className="fm-menu-item text-red-300"><Trash2 size={14} /> Delete</button></div> : null}
    </div>
  )
}

function FileManagerDialog({ dialog, isSubmitting, name, onClose, onSubmit, setName }) {
  if (!dialog) return null

  const isDelete = dialog.type.startsWith('delete')
  const isFolder = dialog.type.includes('folder')
  const label = isFolder ? 'folder' : 'file'
  const title = dialog.type === 'create-folder' ? 'Create folder' : isDelete ? `Delete ${label}` : `Rename ${label}`
  const description = isDelete ? `Delete "${dialog.item.name}"${isFolder ? ' and everything inside it' : ''}? This cannot be undone.` : dialog.type === 'create-folder' ? 'Enter a name for the new folder.' : 'Choose a new name for this item.'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="presentation" onMouseDown={onClose}>
      <form className="w-full max-w-md rounded-xl border border-[#3b3538] bg-[#211c1f] shadow-2xl" onSubmit={onSubmit} onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-[#3b3538] px-5 py-4">
          <div className="flex gap-3"><div className={`rounded-lg p-2 ${isDelete ? 'bg-red-950/50 text-red-300' : 'bg-blue-950/50 text-blue-300'}`}>{isDelete ? <AlertTriangle size={19} /> : <FolderPlus size={19} />}</div><div><h2 className="font-bold text-white">{title}</h2><p className="mt-1 text-sm leading-5 text-[#969baa]">{description}</p></div></div>
          <button type="button" onClick={onClose} className="fm-icon-button" aria-label="Close dialog"><X size={18} /></button>
        </div>
        {!isDelete ? <div className="px-5 py-4"><label htmlFor="file-manager-name" className="mb-2 block text-sm font-semibold text-[#d7dae2]">{isFolder ? 'Folder name' : 'File name'}</label><input id="file-manager-name" autoFocus value={name} onChange={(event) => setName(event.target.value)} maxLength={255} className="w-full rounded-lg border border-[#4a4448] bg-[#171314] px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-400" placeholder={isFolder ? 'e.g. Receipts' : 'File name'} /></div> : null}
        <div className="flex justify-end gap-2 border-t border-[#3b3538] px-5 py-4"><button type="button" disabled={isSubmitting} onClick={onClose} className="fm-button fm-button-secondary">Cancel</button><button type="submit" disabled={isSubmitting} className={`fm-button ${isDelete ? 'fm-button-danger' : 'fm-button-primary'}`}>{isSubmitting ? <LoaderCircle className="animate-spin" size={16} /> : null}{isDelete ? 'Delete' : dialog.type === 'create-folder' ? 'Create folder' : 'Save changes'}</button></div>
      </form>
    </div>
  )
}
