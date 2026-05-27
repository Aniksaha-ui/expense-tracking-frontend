import { Plus, RefreshCcw, Tags } from 'lucide-react'
import { useMemo } from 'react'
import ResourceCrudPage from '../../../components/crud/ResourceCrudPage'
import { AdminTableButton } from '../../../components/ui/AdminDataTable'
import { CategoriesOverview } from '../component/CategoriesOverview.jsx'
import { categoryColumns } from '../component/column.jsx'
import {
  CATEGORY_FILTER_TABS,
  CATEGORIES_PAGE_COPY,
  categoryFields,
  toCategoryPayload,
} from '../constants/categories.constants'
import useCategories from '../hooks/useCategories'

export default function CategoriesPage() {
  const apiState = useCategories()

  const resultLabel = useMemo(() => {
    if (!apiState.pagination.total && !apiState.items.length) {
      return 'No categories found.'
    }

    return `Showing ${apiState.pagination.from}-${apiState.pagination.to} of ${apiState.pagination.total} matched categories`
  }, [apiState.items.length, apiState.pagination.from, apiState.pagination.to, apiState.pagination.total])

  return (
    <ResourceCrudPage
      apiState={apiState}
      columns={categoryColumns}
      emptyMessage="No categories found for this view."
      fields={categoryFields}
      filters={
        <div className="refund-filter-group">
          {CATEGORY_FILTER_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`refund-filter-button ${apiState.typeFilter === tab.key ? 'is-active' : ''}`}
              onClick={() => {
                apiState.setPage(1)
                apiState.setTypeFilter(tab.key)
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      }
      formatSubmitValues={toCategoryPayload}
      icon={Tags}
      newButtonLabel={CATEGORIES_PAGE_COPY.newButtonLabel}
      renderActions={({ openCreateModal }) => (
        <>
          <AdminTableButton
            className={apiState.isLoading ? 'opacity-60' : ''}
            disabled={apiState.isLoading}
            onClick={() => apiState.refresh()}
          >
            <RefreshCcw size={14} />
            Refresh
          </AdminTableButton>
          <button type="button" className="routes-new-button" onClick={openCreateModal}>
            <Plus size={15} />
            {CATEGORIES_PAGE_COPY.newButtonLabel}
          </button>
        </>
      )}
      resourceLabel="Category"
      resultLabel={resultLabel}
      rowActionsWidth="88px"
      searchPlaceholder={CATEGORIES_PAGE_COPY.searchPlaceholder}
      showDeleteAction={false}
      subtitle={CATEGORIES_PAGE_COPY.subtitle}
      title={CATEGORIES_PAGE_COPY.title}
      topContent={
        <>
          <CategoriesOverview isLoading={apiState.isLoading} metrics={apiState.metrics} />
          {apiState.error ? <p className="month-balance-alert">{apiState.error}</p> : null}
        </>
      }
    />
  )
}
