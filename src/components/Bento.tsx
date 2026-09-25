import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type BentoCardProps = {
  children: ReactNode
  className?: string
  index?: number
  title?: string
  action?: ReactNode
}

export function BentoGrid({ children }: { children: ReactNode }) {
  return <div className="grid auto-rows-min grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">{children}</div>
}

export function BentoCard({ children, className = '', index = 0, title, action }: BentoCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={`glow glow-hover @container min-w-0 rounded-2xl border border-line bg-surface p-4 ${className}`}
    >
      {(title || action) && (
        <div className="mb-3 flex flex-wrap items-center gap-3">
          {title && <h2 className="text-sm font-medium text-muted">{title}</h2>}
          {action && <div className="ml-auto flex items-center gap-3">{action}</div>}
        </div>
      )}
      {children}
    </motion.section>
  )
}
