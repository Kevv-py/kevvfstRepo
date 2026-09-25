import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Currency, Expense } from '../types'

export function todayISO() {
  return format(new Date(), 'yyyy-MM-dd')
}

export function monthKey(date: string) {
  return date.slice(0, 7)
}

export function formatMoney(value: number, currency: Currency) {
  return new Intl.NumberFormat('es', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatMonthLabel(month: string) {
  const label = format(parseISO(`${month}-01`), 'LLLL yyyy', { locale: es })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function formatDayLabel(date: string) {
  const label = format(parseISO(date), "EEEE d 'de' LLLL", { locale: es })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function sum(expenses: Expense[]) {
  return expenses.reduce((total, expense) => total + expense.amount, 0)
}

export function groupByDay(expenses: Expense[]) {
  const map = new Map<string, Expense[]>()
  for (const expense of expenses) {
    const bucket = map.get(expense.date)
    if (bucket) bucket.push(expense)
    else map.set(expense.date, [expense])
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
}

export function totalsByCategory(expenses: Expense[]) {
  const map = new Map<string, number>()
  for (const expense of expenses) {
    map.set(expense.category, (map.get(expense.category) ?? 0) + expense.amount)
  }
  return [...map.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
}

export function toCSV(expenses: Expense[]) {
  const escape = (value: string) => `"${value.replace(/"/g, '""')}"`
  const rows = expenses.map((expense) =>
    [expense.date, escape(expense.category), escape(expense.note), expense.amount.toFixed(2)].join(','),
  )
  return ['fecha,categoria,nota,monto', ...rows].join('\n')
}

export function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function parseImported(raw: string): Expense[] {
  const data: unknown = JSON.parse(raw)
  if (!Array.isArray(data)) throw new Error('El archivo no contiene una lista de gastos')
  return data.map((item, index) => {
    if (typeof item !== 'object' || item === null) throw new Error(`Registro inválido en la posición ${index + 1}`)
    const record = item as Record<string, unknown>
    const amount = Number(record.amount)
    if (!Number.isFinite(amount)) throw new Error(`Monto inválido en la posición ${index + 1}`)
    if (typeof record.date !== 'string') throw new Error(`Fecha inválida en la posición ${index + 1}`)
    return {
      id: typeof record.id === 'string' ? record.id : crypto.randomUUID(),
      amount,
      category: typeof record.category === 'string' ? record.category : 'Otros',
      note: typeof record.note === 'string' ? record.note : '',
      date: record.date,
    }
  })
}
