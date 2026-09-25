import { addMonths, format, parseISO } from 'date-fns'
import { motion } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { BentoCard, BentoGrid } from './components/Bento'
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

const surface = 'glow rounded-lg border border-line bg-surface'
const selectClass = `glow-focus h-9 px-2 text-sm outline-none transition ${surface}`
const buttonClass = `glow-hover px-3 py-2 transition hover:bg-hover ${surface}`

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
    <div className="mx-auto grid max-w-5xl gap-4 px-4 py-8 sm:py-12">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-wrap items-center gap-3"
      >
        <h1 className="text-xl font-semibold tracking-tight">Mis gastos</h1>
        <div className={`ml-auto flex items-center gap-1 p-1 ${surface}`}>
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
          className={selectClass}
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
          className={selectClass}
        >
          {CURRENCIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </motion.header>

      <BentoGrid>
        <BentoCard index={0} className="flex flex-col lg:col-span-3 lg:row-span-2">
          <p className="text-xs font-medium text-muted">Total del mes</p>
          <p className="mt-2 text-4xl font-semibold tabular-nums tracking-tight sm:text-5xl">
            {formatMoney(monthTotal, currency)}
          </p>
          <p className="mt-2 text-xs text-muted">
            {monthExpenses.length} {monthExpenses.length === 1 ? 'registro' : 'registros'} ·{' '}
            {daysWithExpenses} {daysWithExpenses === 1 ? 'día' : 'días'} con gasto
          </p>
          <div className="mt-auto border-t border-line pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-muted">Presupuesto mensual</span>
              <input
                value={budget === 0 ? '' : budget}
                onChange={(event) => setBudget(Number(event.target.value.replace(',', '.')) || 0)}
                inputMode="decimal"
                placeholder="Sin definir"
                className="glow-focus h-9 w-32 rounded-lg border border-line bg-app px-3 text-sm outline-none transition"
              />
              {budget > 0 && (
                <span className="text-sm text-muted">
                  Quedan{' '}
                  <strong className={monthTotal > budget ? 'text-danger' : 'text-fg'}>
                    {formatMoney(budget - monthTotal, currency)}
                  </strong>
                </span>
              )}
            </div>
            {budget > 0 && (
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-hover">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (monthTotal / budget) * 100)}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={`glow-accent h-full rounded-full ${monthTotal > budget ? 'bg-danger' : 'bg-accent'}`}
                />
              </div>
            )}
          </div>
        </BentoCard>

        <BentoCard index={1} className="lg:col-span-3">
          <p className="text-xs font-medium text-muted">Hoy</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
            {formatMoney(todayTotal, currency)}
          </p>
        </BentoCard>

        <BentoCard index={2} className="lg:col-span-3">
          <p className="text-xs font-medium text-muted">Promedio por día activo</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
            {formatMoney(dailyAverage, currency)}
          </p>
        </BentoCard>

        <BentoCard index={3} className="sm:col-span-2 lg:col-span-6">
          <ExpenseForm onAdd={addExpense} />
        </BentoCard>

        <BentoCard index={4} title="Gasto diario" className="sm:col-span-2 lg:col-span-4">
          <DailyChart expenses={monthExpenses} month={month} currency={currency} theme={theme} />
        </BentoCard>

        <BentoCard index={5} title="Por categoría" className="sm:col-span-2 lg:col-span-2">
          <CategoryChart expenses={monthExpenses} currency={currency} theme={theme} />
        </BentoCard>

        <BentoCard index={6} title="Registros" className="sm:col-span-2 lg:col-span-6">
          <ExpenseList expenses={monthExpenses} currency={currency} onDelete={deleteExpense} />
        </BentoCard>
      </BentoGrid>

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
        <button type="button" onClick={() => fileInput.current?.click()} className={buttonClass}>
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
        <span className="ml-auto text-xs text-muted">Los datos se guardan solo en este navegador</span>
      </footer>
    </div>
  )
}
