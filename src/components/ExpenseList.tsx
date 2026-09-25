import { AnimatePresence, motion } from 'framer-motion'
import { formatDayLabel, formatMoney, groupByDay, sum } from '../lib/expenses'
import { CATEGORY_COLORS, type Currency, type Expense } from '../types'

type Props = {
  expenses: Expense[]
  currency: Currency
  onDelete: (id: string) => void
}

export function ExpenseList({ expenses, currency, onDelete }: Props) {
  const days = groupByDay(expenses)

  if (days.length === 0) {
    return <p className="animate-rise py-14 text-center text-sm text-muted">Aún no hay gastos en este mes</p>
  }

  return (
    <div className="grid gap-6">
      {days.map(([date, items]) => (
        <section key={date} className="grid gap-2">
          <header className="flex items-baseline justify-between border-b border-line pb-1">
            <h3 className="text-sm font-medium text-muted">{formatDayLabel(date)}</h3>
            <span className="text-sm font-semibold tabular-nums">{formatMoney(sum(items), currency)}</span>
          </header>

          <ul className="grid gap-1">
            <AnimatePresence initial={false}>
            {items.map((expense, position) => (
              <motion.li
                key={expense.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.28, delay: position * 0.03, ease: [0.22, 1, 0.36, 1] }}
                className="group flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-hover"
              >
                <span
                  className="glow-accent size-2.5 shrink-0 rounded-full"
                  style={{ background: CATEGORY_COLORS[expense.category] ?? '#64748b' }}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm">{expense.note || expense.category}</p>
                  {expense.note && <p className="truncate text-xs text-muted">{expense.category}</p>}
                </div>
                <span className="ml-auto text-sm font-medium tabular-nums">
                  {formatMoney(expense.amount, currency)}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(expense.id)}
                  aria-label="Eliminar gasto"
                  className="rounded-md px-2 py-1 text-xs text-muted opacity-0 transition group-hover:opacity-100 hover:text-danger focus:opacity-100"
                >
                  Eliminar
                </button>
              </motion.li>
            ))}
            </AnimatePresence>
          </ul>
        </section>
      ))}
    </div>
  )
}
