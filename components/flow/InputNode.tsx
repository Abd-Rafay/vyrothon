import { Handle, Position } from '@xyflow/react'

export function InputNode({ data }: { data: { plaintext: string; setPlaintext: (v: string) => void; mode: 'encrypt' | 'decrypt'; setMode: (m: 'encrypt' | 'decrypt') => void; isReady?: boolean } }) {
  return (
    <div className="w-80 rounded-xl border border-primary/40 bg-card p-5 card-shadow shadow-primary/10">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between mb-2 relative">
          <p className="text-sm font-mono text-primary">{"// SOURCE"}</p>
          {data.isReady && !data.plaintext && (
            <div className="absolute -top-14 right-0 bg-primary text-primary-foreground px-4 py-2 rounded-xl shadow-[0_0_30px_oklch(var(--primary)/0.6)] border border-white/30 text-xs font-bold animate-bounce whitespace-nowrap flex items-center gap-2 z-50">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              ACTION REQUIRED: TYPE INPUT
              <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-primary border-r border-b border-white/30 rotate-45" />
            </div>
          )}
        </div>
        
        <label className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
          {data.mode === 'encrypt' ? 'Plaintext' : 'Ciphertext'} Input
        </label>
        
        <textarea
          value={data.plaintext}
          onChange={e => data.setPlaintext(e.target.value)}
          placeholder={data.mode === 'encrypt' ? 'Type something to encrypt…' : 'Paste ciphertext…'}
          rows={3}
          className="bg-secondary border border-border rounded-xl p-3 text-sm font-mono
                     text-foreground placeholder-muted-foreground/50 resize-none
                     focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all nodrag"
        />
        
        <div className="flex rounded-xl overflow-hidden border border-border mt-2">
          <button
            onClick={() => data.setMode('encrypt')}
            className={`flex-1 py-1.5 text-xs font-medium transition-all ${
              data.mode === 'encrypt'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            Encrypt
          </button>
          <button
            onClick={() => data.setMode('decrypt')}
            className={`flex-1 py-1.5 text-xs font-medium transition-all ${
              data.mode === 'decrypt'
                ? 'bg-accent text-accent-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            Decrypt
          </button>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary border-background" />
    </div>
  )
}
