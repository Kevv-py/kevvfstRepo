import { getDaysInMonth, parseISO } from 'date-fns'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatMoney, totalsByCategory } from '../lib/expenses'
import { themeMeta, type Theme } from '../lib/useTheme'
import { CATEGORY_COLORS, type Currency, type Expense } from '../types'

type Props = {
  expenses: Expense[]
  month: string
  currency: Currency
  theme: Theme
}

function tooltipStyle(theme: Theme) {
  const { chart } = themeMeta(theme)
  return {
    contentStyle: {
      background: chart.tooltipBg,
      border: `1px solid ${chart.tooltipLine}`,
      borderRadius: 8,
      fontSize: 12,
    },
    labelStyle: { color: chart.tooltipFg },
    itemStyle: { color: chart.tooltipFg },
  }
}

export function DailyChart({ expenses, month, currency, theme }: Props) {
  const { chart } = themeMeta(theme)
  const days = getDaysInMonth(parseISO(`${month}-01`))
  const totals = new Map<number, number>()
  for (const expense of expenses) {
    const day = Number(expense.date.slice(8, 10))
    totals.set(day, (totals.get(day) ?? 0) + expense.amount)
  }
  const data = Array.from({ length: days }, (_, index) => ({
    day: index + 1,
    total: totals.get(index + 1) ?? 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={11} stroke={chart.axis} interval={2} />
        <YAxis tickLine={false} axisLine={false} fontSize={11} stroke={chart.axis} width={48} />
        <Tooltip
          {...tooltipStyle(theme)}
          cursor={{ fill: chart.cursor }}
          formatter={(value) => [formatMoney(Number(value), currency), 'Gasto']}
          labelFormatter={(label) => `Día ${String(label)}`}
        />
        <Bar dataKey="total" fill={chart.bar} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function CategoryChart({ expenses, currency, theme }: Omit<Props, 'month'>) {
  const data = totalsByCategory(expenses)

  if (data.length === 0) {
    return <p className="py-14 text-center text-sm text-muted">Sin datos para este mes</p>
  }

  return (
    <div className="grid items-center gap-4 sm:grid-cols-[180px_1fr]">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie data={data} dataKey="total" nameKey="category" innerRadius={45} outerRadius={75} paddingAngle={2}>
            {data.map((entry) => (
              <Cell
                key={entry.category}
                fill={CATEGORY_COLORS[entry.category] ?? '#64748b'}
                stroke={themeMeta(theme).chart.tooltipBg}
              />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle(theme)} formatter={(value) => formatMoney(Number(value), currency)} />
        </PieChart>
      </ResponsiveContainer>

      <ul className="grid gap-2">
        {data.map((entry) => (
          <li key={entry.category} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 rounded-full"
              style={{ background: CATEGORY_COLORS[entry.category] ?? '#64748b' }}
            />
            <span className="text-muted">{entry.category}</span>
            <span className="ml-auto font-medium tabular-nums">{formatMoney(entry.total, currency)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
