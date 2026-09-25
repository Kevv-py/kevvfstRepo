import { addMonths, format, parseISO } from 'date-fns'
import { useMemo, useRef, useState } from 'react'
import { CategoryChart, DailyChart } from './components/Charts'
import { ExpenseForm } from './components/ExpenseForm'
import { ExpenseList } from './components/ExpenseList'
import {
  download,
  formatMoney,
  formatMonthLabel,
  monthKey,
  parseImported,
  sum,
  toCSV,
  todayISO,
} from './lib/expenses'
import { useLocalStorage } from './lib/useLocalStorage'
import { THEMES, useTheme, type Theme } from './lib/useTheme'
import { CURRENCIES, type Currency, type Expense } from './types'

const surface = 'border border-line bg-surface'
const headingClass = 'text-sm font-medium text-muted'
const buttonClass = `rounded-lg px-3 py-2 transition hover:bg-hover ${surface}`

export default function App() {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('gastos:expenses', [])
  const [currency, setCurrency] = useLocalStorage<Currency>('gastos:currency', 'PEN')
  const [budget, setBudget] = useLocalStorage<number>('gastos:budget', 0)
  const [month, setMonth] = useState(() => monthKey(todayISO()))
  const { theme, setTheme } = useTheme()
  const fileInput = useRef<HTMLInputElement>(null)

  const monthExpenses = useMemo(
    () => expenses.filter((expense) => monthKey(expense.date) === month),
    [expenses, month],
  )
  const monthTotal = sum(monthExpenses)
  const today = todayISO()
  const todayTotal = sum(expenses.filter((expense) => expense.date === today))
  const daysWithExpenses = new Set(monthExpenses.map((expense) => expense.date)).size
  const dailyAverage = daysWithExpenses === 0 ? 0 : monthTotal / daysWithExpenses

  function shiftMonth(delta: number) {
    setMonth(format(addMonths(parseISO(`${month}-01`), delta), 'yyyy-MM'))
  }

  function addExpense(expense: Expense) {
    setExpenses((current) => [expense, ...current])
    setMonth(monthKey(expense.date))
  }

  function deleteExpense(id: string) {
    setExpenses((current) => current.filter((expense) => expense.id !== id))
  }

  function importFile(file: File) {
    file
      .text()
      .then((raw) => setExpenses(parseImported(raw)))
      .catch((error: unknown) => window.alert(`No se pudo importar: ${String(error)}`))
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-6 px-4 py-8 sm:py-12">
      <header className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-semibold tracking-tight">Mis gastos</h1>
        <div className={`ml-auto flex items-center gap-1 rounded-lg p-1 ${surface}`}>
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Mes anterior"
            className="size-7 rounded-md text-muted transition hover:bg-hover"
          >
            ‹
          </button>
          <span className="min-w-36 text-center text-sm font-medium">{formatMonthLabel(month)}</span>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Mes siguiente"
            className="size-7 rounded-md text-muted transition hover:bg-hover"
          >
            ›
          </button>
        </div>
        <select
          value={theme}
          onChange={(event) => setTheme(event.target.value as Theme)}
          aria-label="Tema"
          className={`h-9 rounded-lg px-2 text-sm outline-none transition focus:border-accent ${surface}`}
        >
          {THEMES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
        <select
          value={currency}
          onChange={(event) => setCurrency(event.target.value as Currency)}
          aria-label="Moneda"
          className={`h-9 rounded-lg px-2 text-sm outline-none transition focus:border-accent ${surface}`}
        >
          {CURRENCIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        <Card label="Total del mes" value={formatMoney(monthTotal, currency)} />
        <Card label="Hoy" value={formatMoney(todayTotal, currency)} />
        <Card label="Promedio por día activo" value={formatMoney(dailyAverage, currency)} />
      </section>

      <section className={`rounded-xl p-4 ${surface}`}>
        <ExpenseForm onAdd={addExpense} />
      </section>

      <section className={`rounded-xl p-4 ${surface}`}>
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className={headingClass}>Presupuesto mensual</h2>
          <input
            value={budget === 0 ? '' : budget}
            onChange={(event) => setBudget(Number(event.target.value.replace(',', '.')) || 0)}
            inputMode="decimal"
            placeholder="Sin definir"
            className="h-9 w-32 rounded-lg border border-line bg-app px-3 text-sm outline-none transition focus:border-accent"
          />
          {budget > 0 && (
            <span className="text-sm text-muted">
              Quedan <strong className={monthTotal > budget ? 'text-danger' : 'text-fg'}>
                {formatMoney(budget - monthTotal, currency)}
              </strong>
            </span>
          )}
        </div>
        {budget > 0 && (
          <div className="h-2 w-full overflow-hidden rounded-full bg-hover">
            <div
              className={`h-full rounded-full transition-all ${monthTotal > budget ? 'bg-danger' : 'bg-accent'}`}
              style={{ width: `${Math.min(100, (monthTotal / budget) * 100)}%` }}
            />
          </div>
        )}
      </section>

      <section className={`grid gap-4 rounded-xl p-4 ${surface}`}>
        <h2 className={headingClass}>Gasto diario</h2>
        <DailyChart expenses={monthExpenses} month={month} currency={currency} theme={theme} />
      </section>

      <section className={`grid gap-4 rounded-xl p-4 ${surface}`}>
        <h2 className={headingClass}>Por categoría</h2>
        <CategoryChart expenses={monthExpenses} currency={currency} theme={theme} />
      </section>

      <section className={`rounded-xl p-4 ${surface}`}>
        <h2 className={`mb-3 ${headingClass}`}>Registros</h2>
        <ExpenseList expenses={monthExpenses} currency={currency} onDelete={deleteExpense} />
      </section>

      <footer className="flex flex-wrap items-center gap-2 pb-6 text-sm">
        <button
          type="button"
          onClick={() => download('gastos.json', JSON.stringify(expenses, null, 2), 'application/json')}
          className={buttonClass}
        >
          Exportar JSON
        </button>
        <button
          type="button"
          onClick={() => download('gastos.csv', toCSV(expenses), 'text/csv')}
          className={buttonClass}
        >
          Exportar CSV
        </button>
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className={buttonClass}
        >
          Importar JSON
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) importFile(file)
            event.target.value = ''
          }}
        />
        <span className="ml-auto text-xs text-muted">
          Los datos se guardan solo en este navegador
        </span>
      </footer>
    </div>
  )
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className={`rounded-xl p-4 ${surface}`}>
      <p className="text-xs font-medium text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
    </div>
  )
}
