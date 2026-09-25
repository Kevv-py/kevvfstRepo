import { useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage'

export type Theme = 'dark' | 'light' | 'space' | 'forest'

type ThemeMeta = {
  id: Theme
  label: string
  scheme: 'dark' | 'light'
  chart: { bar: string; axis: string; cursor: string; tooltipBg: string; tooltipLine: string; tooltipFg: string }
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'dark',
    label: 'Oscuro',
    scheme: 'dark',
    chart: { bar: '#e5e5e5', axis: '#737373', cursor: '#262626', tooltipBg: '#171717', tooltipLine: '#404040', tooltipFg: '#e5e5e5' },
  },
  {
    id: 'light',
    label: 'Claro',
    scheme: 'light',
    chart: { bar: '#171717', axis: '#a3a3a3', cursor: '#f5f5f5', tooltipBg: '#ffffff', tooltipLine: '#e5e5e5', tooltipFg: '#171717' },
  },
  {
    id: 'space',
    label: 'Azul espacial',
    scheme: 'dark',
    chart: { bar: '#5b82ff', axis: '#6f7cb5', cursor: '#1a2752', tooltipBg: '#101a3d', tooltipLine: '#22305f', tooltipFg: '#e4e9ff' },
  },
  {
    id: 'forest',
    label: 'Bosque nocturno',
    scheme: 'dark',
    chart: { bar: '#34c98a', axis: '#5f8f7c', cursor: '#123c2f', tooltipBg: '#0d2b21', tooltipLine: '#17463a', tooltipFg: '#dcf5e9' },
  },
]

export function themeMeta(theme: Theme) {
  return THEMES.find((item) => item.id === theme) ?? THEMES[0]
}

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<Theme>('gastos:theme', 'dark')
  const meta = themeMeta(theme)

  useEffect(() => {
    document.documentElement.dataset.theme = meta.id
    document.documentElement.style.colorScheme = meta.scheme
  }, [meta])

  return { theme: meta.id, meta, setTheme }
}
