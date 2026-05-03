'use client'

import { motion } from 'framer-motion'
import { useCallback } from 'react'

interface CodePanelProps {
  code: string
  filePath: string
  highlightedSymbol: string
  selectedSymbol: string | null
  onSymbolClick: (symbol: string) => void
}

export function CodePanel({
  code,
  filePath,
  highlightedSymbol,
  selectedSymbol,
  onSymbolClick
}: CodePanelProps) {
  const keywords = new Set(['import', 'from', 'const', 'async', 'await', 'return', 'export', 'baseURL', 'post', 'axios'])
  const symbols = new Set(['axios', 'API', 'login', 'API.post', 'response.data', 'axios.create'])

  const renderLine = useCallback((line: string, lineNumber: number) => {
    let elements: React.ReactNode[] = []
    let lastIndex = 0

    const pattern = /(\w+|\s+|[^\w\s])/g
    let match
    const regex = new RegExp(pattern.source, 'g')

    while ((match = regex.exec(line)) !== null) {
      const token = match[0]

      if (/^\s+$/.test(token)) {
        elements.push(token)
      } else if (keywords.has(token)) {
        elements.push(
          <span key={`${lineNumber}-${match.index}`} className="text-purple-600 font-medium">
            {token}
          </span>
        )
      } else if (symbols.has(token)) {
        const isHighlighted = token === highlightedSymbol
        const isSelected = token === selectedSymbol

        elements.push(
          <motion.span
            key={`${lineNumber}-${match.index}`}
            onClick={() => onSymbolClick(token)}
            className={`cursor-pointer font-medium transition-all duration-200 rounded px-0.5 ${
              isHighlighted ? 'bg-yellow-200 text-yellow-900' : 'text-blue-600 hover:bg-blue-100'
            } ${isSelected ? 'ring-2 ring-green-400 bg-green-100' : ''}`}
            whileHover={{ scale: 1.02 }}
          >
            {token}
          </motion.span>
        )
      } else if (/^['"]/.test(token)) {
        elements.push(
          <span key={`${lineNumber}-${match.index}`} className="text-green-600">
            {token}
          </span>
        )
      } else if (/^\/\//.test(token)) {
        elements.push(
          <span key={`${lineNumber}-${match.index}`} className="text-gray-400 italic">
            {token}
          </span>
        )
      } else {
        elements.push(token)
      }
    }

    return elements
  }, [highlightedSymbol, selectedSymbol, onSymbolClick])

  const lines = code.split('\n')

  return (
    <div className="bg-white p-4 overflow-x-auto">
      <pre className="font-mono text-sm leading-relaxed text-slate-800">
        {lines.map((line, idx) => (
          <div
            key={idx}
            className={`flex gap-4 hover:bg-slate-50 transition-colors px-3 py-0.5 ${
              idx + 1 >= 7 && idx + 1 <= 8 ? 'bg-yellow-50' : ''
            }`}
          >
            <span className="inline-block w-8 text-right text-slate-400 select-none flex-shrink-0">
              {idx + 1}
            </span>
            <span className="flex-1">
              {renderLine(line, idx)}
            </span>
          </div>
        ))}
      </pre>
    </div>
  )
}
