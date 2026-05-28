import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import {
  buildTransactionFormState,
  buildTransactionPayload,
  isTransactionCategoryRequired,
  shouldShowTransactionCategory,
  TRANSACTION_ENTRY_OPTIONS,
} from '../constants/transactions.constants'
import {
  transactionFieldRules,
  validateTransactionCategory,
} from '../validation/transactionValidation'

const toOptionLabel = (account) =>
  `${account.name} (${account.typeLabel}${account.is_active ? '' : ', inactive'})`

export function TransactionEntryModal({
  accounts,
  categories,
  defaultEntryType = 'EXPENSE',
  editingItem = null,
  isMutating,
  onClose,
  onSubmit,
}) {
  const defaultValues = useMemo(
    () =>
      editingItem
        ? buildTransactionFormState(editingItem)
        : buildTransactionFormState({ type: defaultEntryType }),
    [defaultEntryType, editingItem],
  )
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    resetField,
    setValue,
    watch,
  } = useForm({
    defaultValues,
    mode: 'onBlur',
  })

  const entryType = watch('entry_type') || defaultEntryType
  const selectedCategoryId = watch('category_id')
  const isEditing = Boolean(editingItem)
  const activeOption =
    TRANSACTION_ENTRY_OPTIONS.find((option) => option.value === entryType) ??
    TRANSACTION_ENTRY_OPTIONS[0]
  const availableCategories = useMemo(() => {
    if (entryType === 'DEPOSIT') {
      return []
    }

    if (entryType === 'INCOME') {
      return categories.filter((category) => category.type === 'INCOME')
    }

    return categories.filter((category) => category.type === 'EXPENSE')
  }, [categories, entryType])
  const needsCategory = isTransactionCategoryRequired(entryType)
  const showsCategory = shouldShowTransactionCategory(entryType)
  const isMissingAccounts = accounts.length === 0
  const isBlockedByCategories = needsCategory && availableCategories.length === 0

  useEffect(() => {
    if (!showsCategory) {
      resetField('category_id', { defaultValue: '' })
      return
    }

    if (
      selectedCategoryId &&
      !availableCategories.some((category) => String(category.id) === String(selectedCategoryId))
    ) {
      setValue('category_id', '')
    }
  }, [availableCategories, resetField, selectedCategoryId, setValue, showsCategory])

  return (
    <div className="crud-modal" role="dialog" aria-modal="true">
      <button type="button" className="crud-modal__backdrop" aria-label="Close modal" onClick={onClose} />
      <form
        className="crud-modal__panel"
        onSubmit={handleSubmit((values) =>
          onSubmit(entryType, buildTransactionPayload(values, entryType)),
        )}
      >
        <header className="crud-modal__header">
          <div>
            <p className="crud-modal__eyebrow">{isEditing ? 'Edit transaction' : 'Create transaction'}</p>
            <h2>{isEditing ? `${activeOption.label} Details` : `${activeOption.label} Transaction`}</h2>
          </div>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="crud-modal__body">
          <div className="crud-field" style={{ gridColumn: '1 / -1' }}>
            <span>Transaction Type</span>
            <div className="grid gap-3 md:grid-cols-3">
              {TRANSACTION_ENTRY_OPTIONS.map((option) => {
                const isActive = option.value === entryType

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`rounded-lg border px-4 py-3 text-left transition ${
                      isActive
                        ? 'border-blue-500 bg-blue-500/10 text-white'
                        : 'border-[#332d30] bg-[#171314] text-[#c5d9f7]'
                    }`}
                    disabled={isEditing}
                    onClick={() => setValue('entry_type', option.value)}
                  >
                    <span className="block text-sm font-semibold">{option.label}</span>
                    <span className="mt-1 block text-xs text-[#8fa0bd]">{option.description}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <label className="crud-field">
            <span>Account</span>
            <select {...register('account_id', transactionFieldRules.account_id)}>
              <option value="">Select account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {toOptionLabel(account)}
                </option>
              ))}
            </select>
            {errors.account_id ? <small>{errors.account_id.message}</small> : null}
          </label>

          {showsCategory ? (
            <label className="crud-field">
              <span>{needsCategory ? 'Category' : 'Category (Optional)'}</span>
              <select
                {...register('category_id', {
                  validate: (value) =>
                    validateTransactionCategory(value, entryType, availableCategories),
                })}
              >
                <option value="">
                  {needsCategory ? 'Select category' : 'Select category (optional)'}
                </option>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.typeLabel})
                  </option>
                ))}
              </select>
              {errors.category_id ? <small>{errors.category_id.message}</small> : null}
            </label>
          ) : (
            <div className="crud-field">
              <span>Category</span>
              <div className="flex h-[38px] items-center rounded-md border border-[#332d30] bg-[#171314] px-3 text-sm text-[#8fa0bd]">
                Deposit entries do not use categories.
              </div>
            </div>
          )}

          <label className="crud-field">
            <span>Amount</span>
            <input
              min="0"
              placeholder="0.00"
              step="0.01"
              type="number"
              {...register('amount', transactionFieldRules.amount)}
            />
            {errors.amount ? <small>{errors.amount.message}</small> : null}
          </label>

          <label className="crud-field">
            <span>Transaction Date</span>
            <input type="date" {...register('transaction_date')} />
            {errors.transaction_date ? <small>{errors.transaction_date.message}</small> : null}
          </label>

          <label className="crud-field" style={{ gridColumn: '1 / -1' }}>
            <span>Note</span>
            <textarea
              placeholder="Add context for this transaction"
              {...register('note', transactionFieldRules.note)}
            />
            {errors.note ? <small>{errors.note.message}</small> : null}
          </label>

          {isMissingAccounts ? (
            <p className="month-balance-alert" style={{ gridColumn: '1 / -1', margin: 0 }}>
              Create an account before adding transactions.
            </p>
          ) : null}

          {isBlockedByCategories ? (
            <p className="month-balance-alert" style={{ gridColumn: '1 / -1', margin: 0 }}>
              Create at least one {entryType.toLowerCase()} category before saving this transaction.
            </p>
          ) : null}
        </div>

        <footer className="crud-modal__footer">
          <button type="button" className="crud-button crud-button--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="crud-button crud-button--primary"
            disabled={isSubmitting || isMutating || isMissingAccounts || isBlockedByCategories}
          >
            {isSubmitting || isMutating
              ? 'Saving...'
              : isEditing
                ? `Update ${activeOption.label}`
                : `Create ${activeOption.label}`}
          </button>
        </footer>
      </form>
    </div>
  )
}
