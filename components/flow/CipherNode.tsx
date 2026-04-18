import { Handle, Position } from '@xyflow/react'
import { Trash2 } from 'lucide-react'
import { CIPHERS } from '@/lib/ciphers'
import { PipelineNode, CIPHER_COLORS } from '@/lib/pipeline'

export function CipherNode({ data }: { data: { 
  node: PipelineNode; 
  index: number;
  totalNodes: number;
  mode: 'encrypt' | 'decrypt';
  stepData?: { input: string; output: string };
  onConfigChange: (id: string, key: string, val: string | number) => void;
  onRemove: (id: string) => void;
} }) {
  const { node, mode, stepData, index, onConfigChange, onRemove } = data
  const colors = CIPHER_COLORS[node.type]

  return (
    <div className={`w-[450px] rounded-xl border bg-card p-5 card-shadow transition-all duration-200 
                    border-l-[3px] ${colors?.border || 'border-l-muted'} 
                    hover:shadow-lg focus-within:ring-1 focus-within:ring-primary/20`}>
      
      <Handle type="target" position={Position.Top} className={`w-3 h-3 border-background ${colors?.text.replace('text-', 'bg-') || 'bg-muted'}`} />

      {/* Header row */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${colors?.badge}`}>
          {index + 1}
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${colors?.badge}`}>
          {CIPHERS[node.type]?.label || node.type}
        </span>
        <div className="flex-1" />
        <button
          onClick={() => onRemove(node.id)}
          className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10
                     rounded-lg transition-colors opacity-40 hover:opacity-100 nodrag"
          title="Remove cipher"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Config row */}
      <div className="flex items-center gap-3 mb-4">
        {node.type === 'caesar' && (
          <>
            <label className="text-xs text-muted-foreground shrink-0 uppercase tracking-wider font-mono">Shift</label>
            <input
              type="number" min={1} max={25}
              value={node.config.shift as number}
              onChange={e => onConfigChange(node.id, 'shift', Math.max(1, Math.min(25, Number(e.target.value))))}
              className="w-20 bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm
                         text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-all nodrag"
            />
            <span className="text-xs text-muted-foreground">positions (1–25)</span>
          </>
        )}
        {node.type === 'xor' && (
          <>
            <label className="text-xs text-muted-foreground shrink-0 uppercase tracking-wider font-mono">Key</label>
            <input
              type="text" value={node.config.key as string}
              onChange={e => onConfigChange(node.id, 'key', e.target.value || 'a')}
              className="flex-1 bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm font-mono
                         text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-all nodrag"
            />
          </>
        )}
        {node.type === 'vigenere' && (
          <>
            <label className="text-xs text-muted-foreground shrink-0 uppercase tracking-wider font-mono">Keyword</label>
            <input
              type="text" value={node.config.keyword as string}
              onChange={e => onConfigChange(node.id, 'keyword', e.target.value.replace(/[^a-zA-Z]/g, '') || 'a')}
              className="flex-1 bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm font-mono
                         text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-all nodrag"
            />
          </>
        )}
        {(node.type === 'base64' || node.type === 'reverse') && (
          <span className="text-xs text-muted-foreground italic">No configuration needed</span>
        )}
      </div>

      {/* Intermediate I/O */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] text-muted-foreground mb-1.5 font-mono uppercase tracking-wider">
            {mode === 'decrypt' ? '← received' : 'received ↓'}
          </p>
          <div className="text-xs font-mono bg-secondary/50 border border-border/50 rounded-lg p-2
                          text-muted-foreground h-[42px] overflow-hidden break-all whitespace-pre-wrap">
            {stepData?.input != null
              ? stepData.input.length > 60
                ? stepData.input.slice(0, 60) + '…'
                : stepData.input || '(empty)'
              : '—'}
          </div>
        </div>
        <div>
          <p className={`text-[10px] mb-1.5 font-mono uppercase tracking-wider ${mode === 'encrypt' ? 'text-primary' : 'text-accent'}`}>
            {mode === 'decrypt' ? 'produced ←' : 'produced ↓'}
          </p>
          <div className={`text-xs font-mono bg-secondary/50 border border-border/50 rounded-lg p-2
                           h-[42px] overflow-hidden break-all whitespace-pre-wrap ${mode === 'encrypt' ? 'text-primary' : 'text-accent'}`}>
            {stepData?.output != null
              ? stepData.output.length > 60
                ? stepData.output.slice(0, 60) + '…'
                : stepData.output || '(empty)'
              : '—'}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className={`w-3 h-3 border-background ${colors?.text.replace('text-', 'bg-') || 'bg-muted'}`} />
    </div>
  )
}
