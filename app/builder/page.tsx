'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { CIPHERS } from '@/lib/ciphers'
import { PipelineNode, createNode, runPipeline, CIPHER_COLORS } from '@/lib/pipeline'

export default function BuilderPage() {
  const [nodes, setNodes] = useState<PipelineNode[]>(() => [
    createNode('caesar'),
    createNode('xor'),
    createNode('vigenere'),
  ])
  const [plaintext, setPlaintext] = useState('')
  const [finalOutput, setFinalOutput] = useState('')
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')
  const [stepMap, setStepMap] = useState<Record<string, { input: string; output: string }>>({})
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])

  const addNode = (type: string) =>
    setNodes(prev => [...prev, createNode(type)])

  const removeNode = (id: string) =>
    setNodes(prev => prev.filter(n => n.id !== id))

  const moveNode = (id: string, dir: 'up' | 'down') => {
    setNodes(prev => {
      const idx = prev.findIndex(n => n.id === id)
      if (dir === 'up' && idx === 0) return prev
      if (dir === 'down' && idx === prev.length - 1) return prev
      const arr = [...prev]
      const swap = dir === 'up' ? idx - 1 : idx + 1
      ;[arr[idx], arr[swap]] = [arr[swap], arr[idx]]
      return arr
    })
  }

  const updateConfig = (id: string, key: string, value: string | number) =>
    setNodes(prev =>
      prev.map(n =>
        n.id === id ? { ...n, config: { ...n.config, [key]: value } } : n
      )
    )

  const execute = useCallback(() => {
    if (nodes.length < 3 || !plaintext) return
    setIsRunning(true)
    setError('')
    try {
      const result = runPipeline(nodes, plaintext, mode)
      if (result.error) {
        setError(result.error)
        setIsRunning(false)
        return
      }
      setFinalOutput(result.finalOutput)
      const map: Record<string, { input: string; output: string }> = {}
      result.steps.forEach(s => {
        map[s.nodeId] = { input: s.input, output: s.output }
      })
      setStepMap(map)
    } catch (e) {
      setError(String(e))
    }
    setIsRunning(false)
  }, [nodes, plaintext, mode])

  useEffect(() => {
    if (!plaintext || nodes.length < 3) return
    const t = setTimeout(() => execute(), 300)
    return () => clearTimeout(t)
  }, [plaintext, nodes, mode, execute])

  const exportPipeline = () => {
    const data = nodes.map(({ type, config }) => ({ type, config }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'cipherstack-pipeline.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importPipeline = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (!Array.isArray(parsed)) throw new Error('Must be an array')
        const imported = parsed.map((item: { type: string; config: Record<string, string | number> }) => {
          if (!CIPHERS[item.type]) throw new Error('Unknown cipher: ' + item.type)
          return { ...createNode(item.type), config: item.config }
        })
        setNodes(imported)
      } catch (err) {
        alert('Invalid file: ' + err)
      }
    }
    reader.readAsText(file)
  }

  if (!mounted) return null

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col overflow-hidden">

      {/* TOP BAR */}
      <header className="h-14 bg-card border-b border-border px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="font-mono text-primary font-bold text-sm">C</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">CipherStack</span>
          </Link>
          <span className="text-xs text-muted-foreground font-mono">/ builder</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportPipeline}
            className="text-xs px-3 py-1.5 bg-secondary hover:bg-secondary/80 border border-border rounded transition-colors text-foreground"
          >
            Export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs px-3 py-1.5 bg-secondary hover:bg-secondary/80 border border-border rounded transition-colors text-foreground"
          >
            Import
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={importPipeline}
          />
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT SIDEBAR */}
        <aside className="w-52 bg-card border-r border-border p-4 flex flex-col gap-2 shrink-0 overflow-y-auto">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2 font-mono">Cipher Library</p>
          {Object.entries(CIPHERS).map(([type, cipher]) => (
            <button
              key={type}
              onClick={() => addNode(type)}
              className="w-full text-left px-3 py-2.5 rounded text-sm bg-secondary/50
                         hover:bg-secondary border border-border transition-colors flex items-center gap-2"
            >
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CIPHER_COLORS[type]?.badge}`}>
                {cipher.label}
              </span>
              <span className="text-muted-foreground text-xs ml-auto">+</span>
            </button>
          ))}
          <div className="mt-auto pt-4 text-xs text-muted-foreground leading-relaxed font-mono">
            Stack 3+ cipher nodes.
          </div>
        </aside>

        {/* CENTER — pipeline canvas */}
        <div className="flex-1 overflow-y-auto p-5 bg-background">

          {nodes.length < 3 && (
            <div className="mb-4 px-4 py-2.5 bg-amber-500/10 border border-amber-500/30
                            rounded-lg text-amber-400 text-sm">
              ⚠ Add {3 - nodes.length} more node{3 - nodes.length !== 1 ? 's' : ''} to enable the pipeline
            </div>
          )}

          <p className="text-xs text-muted-foreground mb-4 font-mono">
            {nodes.length} node{nodes.length !== 1 ? 's' : ''} · {mode === 'encrypt' ? '→ forward' : '← reverse'}
          </p>

          {nodes.length === 0 && (
            <div className="text-center py-16 text-muted-foreground/50">
              <p className="text-4xl mb-3">⛓</p>
              <p className="text-sm">Add ciphers from the library to build your pipeline</p>
            </div>
          )}

          {nodes.map((node, i) => (
            <div key={node.id}>
              <div
                className={`rounded-lg border border-border border-l-4
                            ${CIPHER_COLORS[node.type]?.border || 'border-l-muted'}
                            bg-card p-4 space-y-3`}
              >
                {/* Header */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground font-mono w-5">{i + 1}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${CIPHER_COLORS[node.type]?.badge}`}>
                    {CIPHERS[node.type]?.label || node.type}
                  </span>
                  <div className="flex-1" />
                  <button
                    onClick={() => moveNode(node.id, 'up')}
                    disabled={i === 0}
                    className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded
                               disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-xs"
                  >↑</button>
                  <button
                    onClick={() => moveNode(node.id, 'down')}
                    disabled={i === nodes.length - 1}
                    className="p-1 text-muted-foreground hover:text-foreground hover:bg-secondary rounded
                               disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-xs"
                  >↓</button>
                  <button
                    onClick={() => removeNode(node.id)}
                    className="p-1 text-muted-foreground hover:text-red-400 hover:bg-secondary rounded transition-colors text-xs ml-1"
                  >✕</button>
                </div>

                {/* Config */}
                <div className="flex items-center gap-3">
                  {node.type === 'caesar' && (
                    <>
                      <label className="text-xs text-muted-foreground shrink-0">Shift</label>
                      <input
                        type="number" min={1} max={25}
                        value={node.config.shift as number}
                        onChange={e => updateConfig(node.id, 'shift', Math.max(1, Math.min(25, Number(e.target.value))))}
                        className="w-20 bg-input border border-border rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:border-ring"
                      />
                      <span className="text-xs text-muted-foreground">positions (1–25)</span>
                    </>
                  )}
                  {node.type === 'xor' && (
                    <>
                      <label className="text-xs text-muted-foreground shrink-0">Key</label>
                      <input
                        type="text" value={node.config.key as string}
                        onChange={e => updateConfig(node.id, 'key', e.target.value || 'a')}
                        className="flex-1 bg-input border border-border rounded px-2 py-1 text-sm font-mono text-foreground focus:outline-none focus:border-ring"
                      />
                    </>
                  )}
                  {node.type === 'vigenere' && (
                    <>
                      <label className="text-xs text-muted-foreground shrink-0">Keyword</label>
                      <input
                        type="text" value={node.config.keyword as string}
                        onChange={e => updateConfig(node.id, 'keyword', e.target.value.replace(/[^a-zA-Z]/g, '') || 'a')}
                        className="flex-1 bg-input border border-border rounded px-2 py-1 text-sm font-mono text-foreground focus:outline-none focus:border-ring"
                      />
                    </>
                  )}
                  {(node.type === 'base64' || node.type === 'reverse') && (
                    <span className="text-xs text-muted-foreground italic">No configuration needed</span>
                  )}
                </div>

                {/* Intermediate output */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 font-mono">
                      {mode === 'decrypt' ? '← received' : 'received ↓'}
                    </p>
                    <pre className="text-xs font-mono bg-input/50 rounded p-2 text-muted-foreground min-h-8 max-h-10 overflow-hidden break-all whitespace-pre-wrap">
                      {stepMap[node.id]?.input != null
                        ? stepMap[node.id].input.length > 55
                          ? stepMap[node.id].input.slice(0, 55) + '…'
                          : stepMap[node.id].input || '(empty)'
                        : '—'}
                    </pre>
                  </div>
                  <div>
                    <p className={`text-xs mb-1 font-mono ${mode === 'encrypt' ? 'text-primary' : 'text-accent'}`}>
                      {mode === 'decrypt' ? '← produced' : 'produced ↓'}
                    </p>
                    <pre className={`text-xs font-mono bg-input/50 rounded p-2 min-h-8 max-h-10 overflow-hidden break-all whitespace-pre-wrap ${mode === 'encrypt' ? 'text-primary' : 'text-accent'}`}>
                      {stepMap[node.id]?.output != null
                        ? stepMap[node.id].output.length > 55
                          ? stepMap[node.id].output.slice(0, 55) + '…'
                          : stepMap[node.id].output || '(empty)'
                        : '—'}
                    </pre>
                  </div>
                </div>
              </div>

              {i < nodes.length - 1 && (
                <div className="flex flex-col items-center my-1 gap-0.5">
                  <div className={`w-px h-3 ${mode === 'encrypt' ? 'bg-primary/30' : 'bg-accent/30'}`} />
                  <span className={`text-sm leading-none ${mode === 'encrypt' ? 'text-primary/60' : 'text-accent/60'}`}>
                    {mode === 'encrypt' ? '▼' : '▲'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* RIGHT PANEL */}
        <aside className="w-72 bg-card border-l border-border p-4 flex flex-col gap-4 shrink-0">

          <div className="flex flex-col gap-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wider font-mono">
              {mode === 'encrypt' ? 'Plaintext' : 'Ciphertext'} Input
            </label>
            <textarea
              value={plaintext}
              onChange={e => setPlaintext(e.target.value)}
              placeholder={mode === 'encrypt' ? 'Type something to encrypt…' : 'Paste ciphertext…'}
              rows={5}
              className="bg-input border border-border rounded-lg p-3 text-sm font-mono text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:border-ring transition-colors"
            />
          </div>

          <div className="flex rounded-lg overflow-hidden border border-border">
            <button
              onClick={() => setMode('encrypt')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === 'encrypt'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >⬇ Encrypt</button>
            <button
              onClick={() => setMode('decrypt')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === 'decrypt'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >⬆ Decrypt</button>
          </div>

          <button
            onClick={execute}
            disabled={nodes.length < 3 || !plaintext || isRunning}
            className={`w-full py-3 rounded-lg font-medium text-sm transition-all ${
              mode === 'encrypt'
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                : 'bg-accent hover:bg-accent/90 text-accent-foreground'
            } disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isRunning ? '⟳ Running…' : `Run Pipeline ${mode === 'encrypt' ? '→' : '←'}`}
          </button>

          {error && (
            <p className="text-xs text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded p-2">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-muted-foreground uppercase tracking-wider font-mono">Final Output</label>
              <button
                onClick={() => navigator.clipboard.writeText(finalOutput)}
                disabled={!finalOutput}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >Copy ⎘</button>
            </div>
            <textarea
              readOnly value={finalOutput}
              placeholder="Output appears here…"
              rows={5}
              className={`bg-input border border-border rounded-lg p-3 text-sm font-mono resize-none focus:outline-none flex-1 placeholder-muted-foreground ${
                mode === 'encrypt' ? 'text-primary' : 'text-accent'
              }`}
            />
          </div>

          {finalOutput && (
            <div className="text-xs text-muted-foreground font-mono">
              {finalOutput.length} chars · {nodes.length} nodes
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}
