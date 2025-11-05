import { ReactNode } from 'react'

interface TopBarProps {
  title: string
  description?: string
  actions?: ReactNode
}

export function TopBar({ title, description, actions }: TopBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 lg:px-8 py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{title}</h1>
          {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
        </div>
        {actions && <div className="mt-4 sm:mt-0">{actions}</div>}
      </div>
    </div>
  )
}
