import { useState } from 'react'
import { todayISO } from '../lib/expenses'
import { CATEGORIES, type Expense } from '../types'

type Props = {
  onAdd: (expense: Expense) => void
}

const inputClass =
  'h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:focus:border-neutral-400'

export function ExpenseForm({ onAdd }: Props) {
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [note, setNote] = useState('')
  const [date, setDate] = useState(todayISO())
  const [error, setError] = useState('')

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const value = Number(amount.replace(',', '.'))
    if (!Number.isFinite(value) || value <= 0) {
      setError('Ingresa un monto mayor a 0')
      return
    }
    if (!date) {
      setError('Ingresa una fecha')
      return
    }
    onAdd({ id: crypto.randomUUID(), amount: value, category, note: note.trim(), date })
    setAmount('')
    setNote('')
    setError('')
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-[1fr_1fr_1.4fr_1fr_auto]">
      <label className="grid gap-1">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Monto</span>
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          inputMode="decimal"
          placeholder="0.00"
          className={inputClass}
        />
      </label>

      <label className="grid gap-1">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Categoría</span>
        <select value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-1">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Nota</span>
        <input
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Opcional"
          className={inputClass}
        />
      </label>

      <label className="grid gap-1">
        <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Fecha</span>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className={inputClass}
        />
      </label>

      <div className="grid gap-1">
        <span className="hidden text-xs sm:block">&nbsp;</span>
        <button
          type="submit"
          className="h-10 rounded-lg bg-neutral-900 px-5 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white"
        >
          Agregar
        </button>
      </div>

      {error && <p className="text-sm text-red-600 sm:col-span-5 dark:text-red-400">{error}</p>}
    </form>
  )
}
