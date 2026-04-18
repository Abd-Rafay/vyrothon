'use client'

import { PipelineNode, CIPHER_COLORS } from '@/lib/pipeline'
import { CIPHERS } from '@/lib/ciphers'

interface NodeCardProps {
  node: PipelineNode
  index: number
  totalNodes: number
  stepData?: { input: string; output: string }
  mode: 'encrypt' | 'decrypt'
  onRemove: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onConfigChange: (id: string, key: string, value: string | number) => void
}

export default function NodeCard({
  node,
  index,
  totalNodes,
  stepData,
  mode,
  onRemove,
  onMoveUp,
  onMoveDown,
  onConfigChange
}: NodeCardProps) {
  const cipherDef = CIPHERS[node.type];
  // Default to a neutral styling if a cipher color is missing for some reason
  const colors = CIPHER_COLORS[node.type] || { badge: 'bg-zinc-500/20 text-zinc-400', border: 'border-l-zinc-500', text: 'text-zinc-400' };

  return (
    <div className={`rounded-lg border border-zinc-700 border-l-4 ${colors.border} bg-zinc-800 p-4 space-y-3`}>
      
      {/* ROW 1 - Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-zinc-600 font-mono text-sm">{index + 1}</span>
          <span className={`px-2 py-1 rounded text-xs font-semibold ${colors.badge}`}>
            {cipherDef?.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onMoveUp(node.id)}
            disabled={index === 0}
            className="text-sm bg-transparent border-none cursor-pointer p-1 rounded hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ↑
          </button>
          <button
            onClick={() => onMoveDown(node.id)}
            disabled={index === totalNodes - 1}
            className="text-sm bg-transparent border-none cursor-pointer p-1 rounded hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ↓
          </button>
          <button
            onClick={() => onRemove(node.id)}
            className="text-sm text-zinc-500 bg-transparent border-none cursor-pointer p-1 rounded hover:bg-zinc-700 hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ROW 2 - Config section */}
      <div className="flex items-center gap-2">
        {node.type === 'caesar' && (
          <>
            <label className="text-xs text-zinc-400">Shift (1–25)</label>
            <input 
              type="number" 
              min={1} 
              max={25} 
              value={node.config.shift as number}
              onChange={e => onConfigChange(node.id, 'shift', Math.max(1, Math.min(25, Number(e.target.value) || 1)))}
              className="w-20 bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-sm text-white" 
            />
          </>
        )}
        {node.type === 'xor' && (
          <>
            <label className="text-xs text-zinc-400">Key</label>
            <input 
              type="text" 
              value={node.config.key as string}
              onChange={e => onConfigChange(node.id, 'key', e.target.value || 'a')}
              className="flex-1 bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-sm text-white font-mono" 
            />
          </>
        )}
        {node.type === 'vigenere' && (
          <>
            <label className="text-xs text-zinc-400">Keyword (letters only)</label>
            <input 
              type="text" 
              value={node.config.keyword as string}
              onChange={e => onConfigChange(node.id, 'keyword', e.target.value.replace(/[^a-zA-Z]/g,'') || 'a')}
              className="flex-1 bg-zinc-900 border border-zinc-600 rounded px-2 py-1 text-sm text-white font-mono" 
            />
          </>
        )}
        {(node.type === 'base64' || node.type === 'reverse') && (
          <span className="text-xs text-zinc-500 italic">No configuration needed</span>
        )}
      </div>

      <hr className="border-zinc-700" />

      {/* ROW 3 - Intermediate output */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-xs text-zinc-500 mb-1">Received</p>
          <pre className="text-xs font-mono bg-zinc-900 rounded p-2 text-zinc-400 min-h-8 max-h-12 overflow-hidden break-all whitespace-pre-wrap">
            {stepData?.input 
              ? (stepData.input.length > 60 ? stepData.input.slice(0,60)+'…' : stepData.input)
              : '—'}
          </pre>
        </div>
        <div>
          <p className={`text-xs mb-1 ${mode === 'encrypt' ? 'text-teal-400' : 'text-orange-400'}`}>
            Produced
          </p>
          <pre className={`text-xs font-mono bg-zinc-900 rounded p-2 min-h-8 max-h-12 overflow-hidden break-all whitespace-pre-wrap ${mode === 'encrypt' ? 'text-teal-300' : 'text-orange-300'}`}>
            {stepData?.output
              ? (stepData.output.length > 60 ? stepData.output.slice(0,60)+'…' : stepData.output)
              : '—'}
          </pre>
        </div>
      </div>
      
    </div>
  )
}
