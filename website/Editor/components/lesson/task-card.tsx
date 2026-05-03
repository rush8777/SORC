'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2 } from 'lucide-react'

interface TaskCardProps {
  objective: string
  description: string
}

export function TaskCard({ objective, description }: TaskCardProps) {
  return (
    <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
          <span className="text-xs font-semibold text-blue-900 uppercase tracking-wide">
            Your Task
          </span>
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          {objective}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          {description}
        </p>
      </div>
    </Card>
  )
}
