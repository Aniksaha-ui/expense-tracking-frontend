import { useRef, useState } from 'react'
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
import { scanTransactionReceipt } from '../service/transactionsService'

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

const findCategoryId = (categories, categoryName, type) => {
  if (!categoryName) return ''

  const match = categories.find(
    (category) =>
      category.type === type &&
      String(category.name).trim().toLocaleLowerCase() === String(categoryName).trim().toLocaleLowerCase(),
  )

  return match ? String(match.id) : ''
}

const parseBulkTextDate = (value) => {
  const match = String(value).trim().match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:\s*\([^)]*\))?$/)
  if (!match) return ''

  const [, day, month, year] = match
  const parsedDate = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  const isValidDate =
    parsedDate.getUTCFullYear() === Number(year) &&
    parsedDate.getUTCMonth() === Number(month) - 1 &&
    parsedDate.getUTCDate() === Number(day)

  return isValidDate ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : ''
}

const parseBulkTransactionsText = (value) => {
  const entries = []
  const invalidLines = []
  let transactionDate = ''

  String(value).split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim()
    if (!line) return

    const parsedDate = parseBulkTextDate(line)
    if (parsedDate) {
      transactionDate = parsedDate
      return
    }

    const entryMatch = line.match(/^(.+?)\s+([0-9][0-9,]*(?:\.\d{1,2})?)$/)
    if (!entryMatch || !transactionDate) {
      invalidLines.push(index + 1)
      return
    }

    const [, note, rawAmount] = entryMatch
    const amount = rawAmount.replaceAll(',', '')
    if (Number(amount) <= 0) {
      invalidLines.push(index + 1)
      return
    }

    entries.push({ amount, note: note.trim(), transaction_date: transactionDate })
  })

  return { entries, invalidLines }
}

const formatPreviewDate = (value) => {
  const [year, month, day] = String(value).split('-')
  return year && month && day ? `${day}-${month}-${year}` : value
}

export function BulkTransactionEntryModal({
  accounts,
  categories,
  defaultEntryType = 'EXPENSE',
  isMutating,
  onClose,
  onSubmit,
}) {
  const receiptInputRef = useRef(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState('')
  const [scanMessage, setScanMessage] = useState('')
  const [bulkText, setBulkText] = useState('')
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
  const { append, fields, remove, replace } = useFieldArray({ control, name: 'transactions' })
  const transactions = watch('transactions') || []
  const textPreview = parseBulkTransactionsText(bulkText)
  const isMissingAccounts = accounts.length === 0
  const hasUnavailableExpenseCategory = transactions.some(
    (transaction) =>
      transaction?.entry_type === 'EXPENSE' &&
      !categories.some((category) => category.type === 'EXPENSE'),
  )

  const handleReceiptSelected = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    setScanError('')
    setScanMessage('')
    setIsScanning(true)

    try {
      const scanned = await scanTransactionReceipt(file)
      const items = Array.isArray(scanned.items) ? scanned.items : []

      if (items.length === 0) {
        throw new Error('No individual line items were found. You can add the transactions manually.')
      }

      replace(items.slice(0, 100).map((item) => {
        const entryType = ['EXPENSE', 'INCOME', 'DEPOSIT'].includes(item.type) ? item.type : 'EXPENSE'
        const note = [scanned.merchant, item.description, item.note]
          .filter((value, index, values) => value && values.indexOf(value) === index)
          .join(' — ')

        return {
          ...blankTransaction(entryType),
          amount: item.amount || '',
          category_id: findCategoryId(categories, item.category, entryType),
          entry_type: entryType,
          note,
          transaction_date: item.transaction_date || scanned.transaction_date || '',
        }
      }))

      setScanMessage(`${items.length} line item${items.length === 1 ? '' : 's'} added from the receipt. Review the entries and choose an account before saving.`)
    } catch (error) {
      setScanError(error.message || 'Unable to scan this receipt.')
    } finally {
      setIsScanning(false)
    }
  }

  const handleTextImport = () => {
    const { entries, invalidLines } = parseBulkTransactionsText(bulkText)

    setScanError('')
    setScanMessage('')

    if (!entries.length) {
      setScanError('No transactions could be read. Add a date line (DD-MM-YYYY), then a note followed by its amount on each line.')
      return
    }

    replace(entries.slice(0, 100).map((entry) => ({
      ...blankTransaction(defaultEntryType),
      ...entry,
    })))

    const skippedMessage = invalidLines.length
      ? ` ${invalidLines.length} invalid line${invalidLines.length === 1 ? ' was' : 's were'} skipped.`
      : ''
    const limitMessage = entries.length > 100 ? ' Only the first 100 entries were added.' : ''
    setScanMessage(`${Math.min(entries.length, 100)} transaction${entries.length === 1 ? '' : 's'} added from text. Choose an account and category before saving.${skippedMessage}${limitMessage}`)
  }

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
            <input
              ref={receiptInputRef}
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              type="file"
              onChange={handleReceiptSelected}
            />
            <button
              type="button"
              className="transaction-entry-modal__bulk-button"
              disabled={isScanning}
              onClick={() => receiptInputRef.current?.click()}
            >
              {isScanning ? 'Scanning receipt...' : 'Scan receipt into items'}
            </button>
          </div>

          {scanError ? <p className="month-balance-alert bulk-transaction-modal__alert">{scanError}</p> : null}
          {scanMessage ? <p className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100">{scanMessage}</p> : null}

          <section className="bulk-transaction-text-import" aria-label="Import transactions from text">
            <div>
              <strong>Paste transaction text</strong>
              <p>Put the date on its own line as DD-MM-YYYY, then write each note followed by its amount.</p>
            </div>
            <textarea
              value={bulkText}
              onChange={(event) => setBulkText(event.target.value)}
              placeholder={'10-10-2026\nHome to office 80\nOffice to home 80'}
              rows="5"
            />
            {textPreview.entries.length ? (
              <div className="bulk-transaction-text-preview">
                <div className="bulk-transaction-text-preview__header">
                  <strong>Entry preview</strong>
                  <span>{textPreview.entries.length} {textPreview.entries.length === 1 ? 'entry' : 'entries'} found</span>
                </div>
                <div className="bulk-transaction-text-preview__rows">
                  {textPreview.entries.slice(0, 10).map((entry, index) => (
                    <div className="bulk-transaction-text-preview__row" key={`${entry.transaction_date}-${entry.note}-${index}`}>
                      <span>{formatPreviewDate(entry.transaction_date)}</span>
                      <span>{entry.note}</span>
                      <strong>{entry.amount}</strong>
                    </div>
                  ))}
                </div>
                {textPreview.entries.length > 10 ? <p>Showing the first 10 entries.</p> : null}
                {textPreview.invalidLines.length ? <p>Lines {textPreview.invalidLines.join(', ')} will be skipped.</p> : null}
              </div>
            ) : null}
            <button type="button" className="bulk-transaction-text-import__button" onClick={handleTextImport}>
              Fill transactions from text
            </button>
          </section>

          <p className="bulk-transaction-modal__hint">
            Scan a receipt, paste transaction text, or add entries manually. All entries are saved as one batch.
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
          <button
            type="button"
            className="bulk-transaction-modal__add-button"
            onClick={() => append(blankTransaction(defaultEntryType))}
            disabled={fields.length >= 100}
          >
            <CirclePlus size={17} />
            Add another transaction
          </button>
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
