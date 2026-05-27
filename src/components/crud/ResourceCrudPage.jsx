import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Mail, Pencil, Plus, SlidersHorizontal, Trash2 } from 'lucide-react'
import AdminDataTable, {
  AdminTableButton,
  AdminTableSelectButton,
} from '../ui/AdminDataTable'
import { useToast } from '../common/Toaster'

const getDefaultValues = (fields, editingItem = null) =>
  fields.reduce((values, field) => {
    if (field.type === 'file') {
      values[field.name] = ''
      return values
    }

    if (editingItem && editingItem[field.name] !== undefined && editingItem[field.name] !== null) {
      values[field.name] = editingItem[field.name]
      return values
    }

    values[field.name] = field.defaultValue ?? ''
    return values
  }, {})

function StatusPill({ status }) {
  const safeStatus = String(status ?? '').toLowerCase()

  return <span className={`routes-status routes-status--${safeStatus}`}>{safeStatus || 'active'}</span>
}

function ResourceFormModal({ editingItem, fields, isMutating, onClose, onSubmit, title }) {
  const visibleFields = useMemo(
    () =>
      fields.filter((field) => {
        if (editingItem && field.createOnly) {
          return false
        }

        if (!editingItem && field.editOnly) {
          return false
        }

        return true
      }),
    [editingItem, fields],
  )
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm({
    defaultValues: getDefaultValues(visibleFields, editingItem),
    mode: 'onBlur',
  })

  return (
    <div className="crud-modal" role="dialog" aria-modal="true">
      <button type="button" className="crud-modal__backdrop" aria-label="Close modal" onClick={onClose} />
      <form className="crud-modal__panel" onSubmit={handleSubmit(onSubmit)}>
        <header className="crud-modal__header">
          <div>
            <p className="crud-modal__eyebrow">{editingItem ? 'Edit record' : 'Create record'}</p>
            <h2>{title}</h2>
          </div>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="crud-modal__body">
          {visibleFields.map((field) => (
            <label key={field.name} className="crud-field">
              <span>{field.label}</span>
              {field.type === 'select' ? (
                <select {...register(field.name, field.rules)}>
                  <option value="">Select {field.label.toLowerCase()}</option>
                  {field.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'file' ? (
                <input
                  type="file"
                  accept={field.accept}
                  {...register(field.name, field.rules)}
                />
              ) : (
                <input
                  min={field.min}
                  step={field.step}
                  type={field.type ?? 'text'}
                  placeholder={field.placeholder}
                  {...register(field.name, field.rules)}
                />
              )}
              {errors[field.name] ? <small>{errors[field.name].message}</small> : null}
            </label>
          ))}
        </div>

        <footer className="crud-modal__footer">
          <button type="button" className="crud-button crud-button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="crud-button crud-button--primary" disabled={isSubmitting || isMutating}>
            {isSubmitting || isMutating ? 'Saving...' : editingItem ? 'Update' : 'Create'}
          </button>
        </footer>
      </form>
    </div>
  )
}

export default function ResourceCrudPage({
  actions,
  apiState,
  columns,
  emptyMessage,
  fields,
  filters,
  formatSubmitValues,
  icon: Icon,
  loadEditingItem,
  newButtonLabel,
  renderActions,
  renderExtraRowActions,
  resultLabel,
  resourceLabel,
  rowActionsWidth,
  searchPlaceholder,
  showDeleteAction = true,
  subtitle,
  title,
  topContent,
}) {
  const toast = useToast()
  const [editingItem, setEditingItem] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const {
    createItem,
    deleteItem,
    isLoading,
    isMutating,
    items,
    pagination,
    search,
    setPage,
    setSearch,
    updateItem,
  } = apiState
  const resolvedResourceLabel = resourceLabel ?? title

  const tableColumns = useMemo(
    () =>
      columns.map((column) =>
        column.id === 'status'
          ? {
              ...column,
              render: (row) => <StatusPill status={row.status} />,
            }
          : column,
      ),
    [columns],
  )

  const openCreateModal = () => {
    setEditingItem(null)
    setModalOpen(true)
  }

  const openEditModal = async (item) => {
    try {
      const nextEditingItem = loadEditingItem ? await loadEditingItem(item) : item
      setEditingItem(nextEditingItem)
      setModalOpen(true)
    } catch (error) {
      toast.error(error.message || `Unable to load ${resolvedResourceLabel}.`)
    }
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingItem(null)
  }

  const handleSubmit = async (values) => {
    try {
      const payload = formatSubmitValues ? formatSubmitValues(values, editingItem) : values

      if (editingItem) {
        await updateItem(editingItem.id, payload)
      } else {
        await createItem(payload)
      }

      closeModal()
    } catch (error) {
      toast.error(error.message || `Unable to save ${resolvedResourceLabel}.`)
    }
  }

  const handleDelete = async (item) => {
    try {
      await deleteItem(item.id)
    } catch (error) {
      toast.error(error.message || `Unable to delete ${resolvedResourceLabel}.`)
    }
  }

  const resolvedFilters = filters ?? (
    <>
      <AdminTableSelectButton>Status</AdminTableSelectButton>
      <AdminTableButton>
        <SlidersHorizontal size={14} />
        Filters
      </AdminTableButton>
    </>
  )

  const resolvedActions =
    actions ??
    (renderActions ? (
      renderActions({ openCreateModal })
    ) : (
      <>
        <AdminTableButton variant="blue">
          <Mail size={14} />
          Invite
        </AdminTableButton>
        <button type="button" className="routes-new-button" onClick={openCreateModal}>
          <Plus size={15} />
          {newButtonLabel}
        </button>
      </>
    ))

  return (
    <main className="routes-page">
      <div className="routes-page__inner">
        <header className="routes-page__header">
          <div className="routes-page__title">
            <Icon size={20} color="#4f83ff" />
            <h1>{title}</h1>
          </div>
          <p className="routes-page__subtitle">{subtitle}</p>
        </header>

        {topContent}

        <AdminDataTable
          actions={resolvedActions}
          columns={tableColumns}
          data={items}
          emptyMessage={emptyMessage}
          filters={resolvedFilters}
          isLoading={isLoading}
          onPageChange={setPage}
          onSearchChange={(value) => {
            setPage(1)
            setSearch(value)
          }}
          pagination={pagination}
          rowActionsWidth={rowActionsWidth}
          searchPlaceholder={searchPlaceholder}
          search={search}
          renderRowActions={(item) => (
            <div className="routes-table__actions">
              <button type="button" className="routes-icon-button" aria-label={`Edit ${resolvedResourceLabel}`} onClick={() => openEditModal(item)}>
                <Pencil size={15} />
              </button>
              {showDeleteAction ? (
                <button type="button" className="routes-icon-button" aria-label={`Delete ${resolvedResourceLabel}`} onClick={() => handleDelete(item)}>
                  <Trash2 size={15} />
                </button>
              ) : null}
              {renderExtraRowActions?.(item)}
            </div>
          )}
          resultLabel={
            resultLabel ??
            (pagination
              ? `Showing ${pagination.from}-${pagination.to} of ${pagination.total} result's`
              : `Showing ${items.length} result's`)
          }
        />

        {modalOpen ? (
          <ResourceFormModal
            editingItem={editingItem}
            fields={fields}
            isMutating={isMutating}
            onClose={closeModal}
            onSubmit={handleSubmit}
            title={title}
          />
        ) : null}
      </div>
    </main>
  )
}
