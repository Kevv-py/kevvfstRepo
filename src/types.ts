export type Expense = {
  id: string
  amount: number
  category: string
  note: string
  date: string
}

export const CATEGORIES = [
  'Comida',
  'Transporte',
  'Hogar',
  'Salud',
  'Ocio',
  'Servicios',
  'Educación',
  'Otros',
] as const

export const CATEGORY_COLORS: Record<string, string> = {
  Comida: '#f97316',
  Transporte: '#0ea5e9',
  Hogar: '#8b5cf6',
  Salud: '#ef4444',
  Ocio: '#ec4899',
  Servicios: '#14b8a6',
  Educación: '#eab308',
  Otros: '#64748b',
}

export const CURRENCIES = ['PEN', 'USD', 'EUR', 'MXN', 'COP', 'ARS', 'CLP'] as const

export type Currency = (typeof CURRENCIES)[number]
