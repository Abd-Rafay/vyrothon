import { Handle, Position } from '@xyflow/react'
import { Copy } from 'lucide-react'

export function OutputNode({ data }: { data: { output: string; mode: 'encrypt' | 'decrypt' } }) {
  return (
    <div className="w-80 rounded-xl border border-accent/40 bg-card p-5 card-shadow shadow-accent/10">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-accent border-background" />
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-mono text-accent">{"// SINK"}</p>
          <button
            onClick={() => navigator.clipboard.writeText(data.output)}
            disabled={!data.output}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground
                       transition-colors disabled:opacity-30 disabled:cursor-not-allowed nodrag"
          >
            <Copy className="w-3 h-3" />
            Copy
          </button>
        </div>
        
        <label className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
          Final {data.mode === 'encrypt' ? 'Ciphertext' : 'Plaintext'} Output
        </label>
        
        <textarea
          readOnly
          value={data.output}
          placeholder="Output appears here…"
          rows={3}
          className={`bg-secondary border border-border rounded-xl p-3 text-sm font-mono
                      resize-none focus:outline-none flex-1 placeholder-muted-foreground/50 transition-all nodrag ${
                        data.mode === 'encrypt' ? 'text-primary' : 'text-accent'
                      }`}
        />
        
        {data.output && (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono mt-1">
              <span>{data.output.length} chars</span>
              <span className="text-green-500 ml-auto">✓ done</span>
            </div>
          )}
      </div>
    </div>
  )
}
