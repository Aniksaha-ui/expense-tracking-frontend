import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import {
  buildRecurringExpenseFormState,
  buildRecurringExpensePayload,
  RECURRING_FREQUENCY_OPTIONS,
  RECURRING_STATUS_OPTIONS,
} from '../constants/recurringExpenses.constants'
import {
  recurringExpenseFieldRules,
  validateRecurringDateAfterStart,
} from '../validation/recurringExpenseValidation'

export function RecurringExpenseFormModal({
  accounts,
  categories,
  editingItem = null,
  isMutating,
  onClose,
  onSubmit,
}) {
  const defaultValues = useMemo(
    () => buildRecurringExpenseFormState(editingItem ?? {}),
    [editingItem],
  )
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    watch,
  } = useForm({
    defaultValues,
    mode: 'onBlur',
  })
  const startDate = watch('start_date')
  const isMissingDependencies = accounts.length === 0 || categories.length === 0

  return (
    <div className="crud-modal" role="dialog" aria-modal="true">
      <button type="button" className="crud-modal__backdrop" aria-label="Close modal" onClick={onClose} />
      <form
        className="crud-modal__panel"
        onSubmit={handleSubmit((values) => onSubmit(buildRecurringExpensePayload(values)))}
      >
        <header className="crud-modal__header">
          <div>
            <p className="crud-modal__eyebrow">{editingItem ? 'Edit plan' : 'Create plan'}</p>
            <h2>{editingItem ? 'Recurring Expense Details' : 'New Recurring Expense'}</h2>
          </div>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="crud-modal__body">
          <label className="crud-field">
            <span>Title</span>
            <input
              placeholder="Monthly rent"
              type="text"
              {...register('title', recurringExpenseFieldRules.title)}
            />
            {errors.title ? <small>{errors.title.message}</small> : null}
          </label>

          <label className="crud-field">
            <span>Amount</span>
            <input
              min="0"
              placeholder="0.00"
              step="0.01"
              type="number"
              {...register('amount', recurringExpenseFieldRules.amount)}
            />
            {errors.amount ? <small>{errors.amount.message}</small> : null}
          </label>

          <label className="crud-field">
            <span>Account</span>
            <select {...register('account_id', recurringExpenseFieldRules.account_id)}>
              <option value="">Select account</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name} ({account.typeLabel})
                </option>
              ))}
            </select>
            {errors.account_id ? <small>{errors.account_id.message}</small> : null}
          </label>

          <label className="crud-field">
            <span>Expense Category</span>
            <select {...register('category_id', recurringExpenseFieldRules.category_id)}>
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category_id ? <small>{errors.category_id.message}</small> : null}
          </label>

          <label className="crud-field">
            <span>Frequency</span>
            <select {...register('frequency', recurringExpenseFieldRules.frequency)}>
              <option value="">Select frequency</option>
              {RECURRING_FREQUENCY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.frequency ? <small>{errors.frequency.message}</small> : null}
          </label>

          <label className="crud-field">
            <span>Status</span>
            <select {...register('is_active', recurringExpenseFieldRules.is_active)}>
              {RECURRING_STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.is_active ? <small>{errors.is_active.message}</small> : null}
          </label>

          <label className="crud-field">
            <span>Start Date</span>
            <input type="date" {...register('start_date', recurringExpenseFieldRules.start_date)} />
            {errors.start_date ? <small>{errors.start_date.message}</small> : null}
          </label>

          <label className="crud-field">
            <span>Next Run Date</span>
            <input
              type="date"
              {...register('next_run_date', {
                validate: (value) =>
                  validateRecurringDateAfterStart(value, startDate, 'Next run date'),
              })}
            />
            {errors.next_run_date ? <small>{errors.next_run_date.message}</small> : null}
          </label>

          <label className="crud-field">
            <span>End Date</span>
            <input
              type="date"
              {...register('end_date', {
                validate: (value) =>
                  validateRecurringDateAfterStart(value, startDate, 'End date'),
              })}
            />
            {errors.end_date ? <small>{errors.end_date.message}</small> : null}
          </label>

          <label className="crud-field" style={{ gridColumn: '1 / -1' }}>
            <span>Note</span>
            <textarea
              placeholder="Add any billing context or reminders"
              {...register('note', recurringExpenseFieldRules.note)}
            />
            {errors.note ? <small>{errors.note.message}</small> : null}
          </label>

          {isMissingDependencies ? (
            <p className="month-balance-alert" style={{ gridColumn: '1 / -1', margin: 0 }}>
              Create at least one account and one expense category before managing recurring expenses.
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
            disabled={isSubmitting || isMutating || isMissingDependencies}
          >
            {isSubmitting || isMutating ? 'Saving...' : editingItem ? 'Update Plan' : 'Create Plan'}
          </button>
        </footer>
      </form>
    </div>
  )
}
