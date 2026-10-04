import { useFieldArray, useForm } from 'react-hook-form'
import { CirclePlus, Trash2, X } from 'lucide-react'
import {
  buildTransactionPayload,
  isTransactionCategoryRequired,
  shouldShowTransactionCategory,
  TRANSACTION_ENTRY_OPTIONS,
} from '../constants/transactions.constants'
import {
  transactionFieldRules,
  validateTransactionCategory,
} from '../validation/transactionValidation'

const blankTransaction = (entryType = 'EXPENSE') => ({
  account_id: '',
  amount: '',
  category_id: '',
  entry_type: entryType,
  note: '',
  transaction_date: '',
})

const toOptionLabel = (account) =>
  `${account.name} (${account.typeLabel}${account.is_active ? '' : ', inactive'})`

export function BulkTransactionEntryModal({
  accounts,
  categories,
  defaultEntryType = 'EXPENSE',
  isMutating,
  onClose,
  onSubmit,
}) {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    watch,
  } = useForm({
    defaultValues: { transactions: [blankTransaction(defaultEntryType)] },
    mode: 'onBlur',
  })
  const { append, fields, remove } = useFieldArray({ control, name: 'transactions' })
  const transactions = watch('transactions') || []
  const isMissingAccounts = accounts.length === 0
  const hasUnavailableExpenseCategory = transactions.some(
    (transaction) =>
      transaction?.entry_type === 'EXPENSE' &&
      !categories.some((category) => category.type === 'EXPENSE'),
  )

  return (
    <div className="crud-modal" role="dialog" aria-modal="true">
      <button type="button" className="crud-modal__backdrop" aria-label="Close modal" onClick={onClose} />
      <form
        className="crud-modal__panel bulk-transaction-modal"
        onSubmit={handleSubmit(({ transactions: values }) =>
          onSubmit(
            values.map((value) => ({
              entry_type: value.entry_type,
              ...buildTransactionPayload(value, value.entry_type),
            })),
          )
        )}
      >
        <header className="crud-modal__header bulk-transaction-modal__header">
          <div>
            <p className="crud-modal__eyebrow">Create multiple transactions</p>
            <h2>Bulk Transaction Entry</h2>
            <p className="bulk-transaction-modal__description">
              Enter several transactions at once. Each entry is saved together.
            </p>
          </div>
          <button type="button" className="bulk-transaction-modal__close" aria-label="Close bulk transaction entry" onClick={onClose}>
            <X size={17} />
          </button>
        </header>

        <div className="crud-modal__body bulk-transaction-modal__body">
          <div className="bulk-transaction-modal__toolbar">
            <div>
              <span className="bulk-transaction-modal__count">{fields.length}</span>
              <span className="bulk-transaction-modal__count-label">{fields.length === 1 ? 'entry' : 'entries'} ready</span>
            </div>
            <button
              type="button"
              className="bulk-transaction-modal__add-button"
              onClick={() => append(blankTransaction(defaultEntryType))}
              disabled={fields.length >= 100}
            >
              <CirclePlus size={16} />
              Add entry
            </button>
          </div>

          <p className="bulk-transaction-modal__hint">
            You can mix expenses, income, and deposits. All entries are saved as one batch.
          </p>

          <div className="bulk-transaction-modal__entries">
          {fields.map((field, index) => {
            const entryType = transactions[index]?.entry_type || defaultEntryType
            const showsCategory = shouldShowTransactionCategory(entryType)
            const needsCategory = isTransactionCategoryRequired(entryType)
            const availableCategories =
              entryType === 'INCOME'
                ? categories.filter((category) => category.type === 'INCOME')
                : categories.filter((category) => category.type === 'EXPENSE')
            const rowErrors = errors.transactions?.[index] || {}

            return (
              <section key={field.id} className="bulk-transaction-card">
                <div className="bulk-transaction-card__header">
                  <div className="bulk-transaction-card__title">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <strong>Transaction</strong>
                  </div>
                  {fields.length > 1 ? (
                    <button
                      type="button"
                      className="bulk-transaction-card__remove"
                      onClick={() => remove(index)}
                    >
                      <Trash2 size={15} />
                      Remove
                    </button>
                  ) : null}
                </div>
                <div className="bulk-transaction-card__fields">
                  <label className="crud-field">
                    <span>Transaction Type</span>
                    <select {...register(`transactions.${index}.entry_type`)}>
                      {TRANSACTION_ENTRY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>
                  <label className="crud-field bulk-transaction-card__account">
                    <span>Account</span>
                    <select {...register(`transactions.${index}.account_id`, transactionFieldRules.account_id)}>
                      <option value="">Select account</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>{toOptionLabel(account)}</option>
                      ))}
                    </select>
                    {rowErrors.account_id ? <small>{rowErrors.account_id.message}</small> : null}
                  </label>
                  {showsCategory ? (
                    <label className="crud-field">
                      <span>{needsCategory ? 'Category' : 'Category (Optional)'}</span>
                      <select
                        {...register(`transactions.${index}.category_id`, {
                          validate: (value) => validateTransactionCategory(value, entryType, availableCategories),
                        })}
                      >
                        <option value="">{needsCategory ? 'Select category' : 'Select category (optional)'}</option>
                        {availableCategories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name} ({category.typeLabel})</option>
                        ))}
                      </select>
                      {rowErrors.category_id ? <small>{rowErrors.category_id.message}</small> : null}
                    </label>
                  ) : (
                    <div className="crud-field bulk-transaction-card__category-placeholder"><span>Category</span><div>Not needed for deposits</div></div>
                  )}
                  <label className="crud-field">
                    <span>Amount</span>
                    <input min="0" placeholder="0.00" step="0.01" type="number" {...register(`transactions.${index}.amount`, transactionFieldRules.amount)} />
                    {rowErrors.amount ? <small>{rowErrors.amount.message}</small> : null}
                  </label>
                  <label className="crud-field"><span>Transaction Date</span><input type="date" {...register(`transactions.${index}.transaction_date`)} /></label>
                  <label className="crud-field bulk-transaction-card__note"><span>Note <em>Optional</em></span><input placeholder="What was this for?" {...register(`transactions.${index}.note`, transactionFieldRules.note)} />{rowErrors.note ? <small>{rowErrors.note.message}</small> : null}</label>
                </div>
              </section>
            )
          })}
          </div>
          {isMissingAccounts || hasUnavailableExpenseCategory ? (
            <p className="month-balance-alert bulk-transaction-modal__alert">
              {isMissingAccounts ? 'Create an account before adding transactions.' : 'Create an expense category before adding expense entries.'}
            </p>
          ) : null}
        </div>

        <footer className="crud-modal__footer bulk-transaction-modal__footer">
          <button type="button" className="crud-button crud-button--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="crud-button crud-button--primary" disabled={isSubmitting || isMutating || isMissingAccounts || hasUnavailableExpenseCategory}>
            {isSubmitting || isMutating ? 'Saving...' : `Create ${fields.length} transaction${fields.length === 1 ? '' : 's'}`}
          </button>
        </footer>
      </form>
    </div>
  )
}
