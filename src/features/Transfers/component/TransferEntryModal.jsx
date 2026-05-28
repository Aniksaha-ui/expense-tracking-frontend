import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import {
  buildTransferFormState,
  buildTransferPayload,
  isWithdrawalEntry,
  TRANSFER_ENTRY_OPTIONS,
} from '../constants/transfers.constants'
import {
  transferFieldRules,
  validateTransferAccountPair,
} from '../validation/transferValidation'

const toOptionLabel = (account) =>
  `${account.name} (${account.typeLabel}${account.is_active ? '' : ', inactive'})`

export function TransferEntryModal({
  accounts,
  defaultEntryType = 'TRANSFER',
  editingItem = null,
  isMutating,
  onClose,
  onSubmit,
}) {
  const defaultValues = useMemo(
    () =>
      editingItem
        ? buildTransferFormState(editingItem)
        : buildTransferFormState({ entry_type: defaultEntryType }),
    [defaultEntryType, editingItem],
  )
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setValue,
    watch,
  } = useForm({
    defaultValues,
    mode: 'onBlur',
  })

  const entryType = watch('entry_type') || defaultEntryType
  const fromAccountId = watch('from_account_id')
  const toAccountId = watch('to_account_id')
  const isEditing = Boolean(editingItem)
  const activeOption =
    TRANSFER_ENTRY_OPTIONS.find((option) => option.value === entryType) ??
    TRANSFER_ENTRY_OPTIONS[0]
  const withdrawalMode = isWithdrawalEntry(entryType)

  const availableSourceAccounts = useMemo(() => {
    const items = withdrawalMode
      ? accounts.filter((account) => account.type !== 'CASH')
      : accounts

    return items.filter((account) => String(account.id) !== String(toAccountId || ''))
  }, [accounts, toAccountId, withdrawalMode])

  const availableDestinationAccounts = useMemo(() => {
    const items = withdrawalMode
      ? accounts.filter((account) => account.type === 'CASH')
      : accounts

    return items.filter((account) => String(account.id) !== String(fromAccountId || ''))
  }, [accounts, fromAccountId, withdrawalMode])

  const isMissingAccounts = accounts.length < 2
  const isBlockedByWithdrawalAccounts =
    withdrawalMode &&
    (!accounts.some((account) => account.type !== 'CASH') ||
      !accounts.some((account) => account.type === 'CASH'))

  useEffect(() => {
    if (
      fromAccountId &&
      !availableSourceAccounts.some((account) => String(account.id) === String(fromAccountId))
    ) {
      setValue('from_account_id', '')
    }
  }, [availableSourceAccounts, fromAccountId, setValue])

  useEffect(() => {
    if (
      toAccountId &&
      !availableDestinationAccounts.some((account) => String(account.id) === String(toAccountId))
    ) {
      setValue('to_account_id', '')
    }
  }, [availableDestinationAccounts, setValue, toAccountId])

  return (
    <div className="crud-modal" role="dialog" aria-modal="true">
      <button type="button" className="crud-modal__backdrop" aria-label="Close modal" onClick={onClose} />
      <form
        className="crud-modal__panel"
        onSubmit={handleSubmit((values) => onSubmit(entryType, buildTransferPayload(values)))}
      >
        <header className="crud-modal__header">
          <div>
            <p className="crud-modal__eyebrow">{isEditing ? 'Edit transfer' : 'Create transfer'}</p>
            <h2>{isEditing ? `${activeOption.label} Details` : activeOption.label}</h2>
          </div>
          <button type="button" onClick={onClose}>
            Close
          </button>
        </header>

        <div className="crud-modal__body">
          <div className="crud-field" style={{ gridColumn: '1 / -1' }}>
            <span>Transfer Type</span>
            <div className="grid gap-3 md:grid-cols-2">
              {TRANSFER_ENTRY_OPTIONS.map((option) => {
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
            <span>Source Account</span>
            <select
              {...register('from_account_id', {
                ...transferFieldRules.from_account_id,
                validate: (value) => validateTransferAccountPair(value, toAccountId),
              })}
            >
              <option value="">Select source account</option>
              {availableSourceAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {toOptionLabel(account)}
                </option>
              ))}
            </select>
            {errors.from_account_id ? <small>{errors.from_account_id.message}</small> : null}
          </label>

          <label className="crud-field">
            <span>Destination Account</span>
            <select
              {...register('to_account_id', {
                ...transferFieldRules.to_account_id,
                validate: (value) => validateTransferAccountPair(fromAccountId, value),
              })}
            >
              <option value="">Select destination account</option>
              {availableDestinationAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {toOptionLabel(account)}
                </option>
              ))}
            </select>
            {errors.to_account_id ? <small>{errors.to_account_id.message}</small> : null}
          </label>

          <label className="crud-field">
            <span>Amount</span>
            <input
              min="0"
              placeholder="0.00"
              step="0.01"
              type="number"
              {...register('amount', transferFieldRules.amount)}
            />
            {errors.amount ? <small>{errors.amount.message}</small> : null}
          </label>

          <label className="crud-field">
            <span>Transfer Date</span>
            <input type="date" {...register('transfer_date')} />
            {errors.transfer_date ? <small>{errors.transfer_date.message}</small> : null}
          </label>

          <label className="crud-field" style={{ gridColumn: '1 / -1' }}>
            <span>Note</span>
            <textarea
              placeholder="Add context for this transfer"
              {...register('note', transferFieldRules.note)}
            />
            {errors.note ? <small>{errors.note.message}</small> : null}
          </label>

          {isMissingAccounts ? (
            <p className="month-balance-alert" style={{ gridColumn: '1 / -1', margin: 0 }}>
              Create at least two accounts before recording transfers.
            </p>
          ) : null}

          {isBlockedByWithdrawalAccounts ? (
            <p className="month-balance-alert" style={{ gridColumn: '1 / -1', margin: 0 }}>
              Withdrawal to cash needs at least one non-cash account and one cash account.
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
            disabled={isSubmitting || isMutating || isMissingAccounts || isBlockedByWithdrawalAccounts}
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
