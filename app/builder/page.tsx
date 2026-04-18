'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import Link from 'next/link'
import { CIPHERS } from '@/lib/ciphers'
import { PipelineNode, createNode, runPipeline, CIPHER_COLORS } from '@/lib/pipeline'
import { ArrowRight, ArrowLeft, Download, Upload, Copy, Trash2, ChevronUp, ChevronDown, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

      {/* ═══ TOP BAR — matches landing nav ═══ */}
      <header className="h-16 bg-background/95 backdrop-blur-xl border-b border-border/50 px-6 flex items-center justify-between shrink-0 z-50">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
              <span className="font-mono text-primary font-bold text-base relative z-10">C</span>
            </div>
            <span className="text-lg font-bold tracking-tight">CipherStack</span>
          </Link>
          <div className="hidden sm:flex items-center gap-1 ml-2">
            <span className="text-muted-foreground/40">/</span>
            <span className="text-sm text-muted-foreground font-mono ml-1">builder</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportPipeline}
            className="gap-1.5 text-xs bg-transparent border-border hover:bg-secondary/50"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="gap-1.5 text-xs bg-transparent border-border hover:bg-secondary/50"
          >
            <Upload className="w-3.5 h-3.5" />
            Import
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={importPipeline}
          />
        </div>
      </header>

      {/* ═══ BODY ═══ */}
      <div className="flex flex-1 overflow-hidden">

        {/* ─── LEFT SIDEBAR — Cipher Library ─── */}
        <aside className="w-56 bg-card border-r border-border p-5 flex flex-col gap-3 shrink-0 overflow-y-auto">
          <p className="text-sm font-mono text-primary mb-1">{"// LIBRARY"}</p>
          <p className="text-xs text-muted-foreground mb-3">Click to add a cipher node to the pipeline.</p>

          {Object.entries(CIPHERS).map(([type, cipher]) => (
            <button
              key={type}
              onClick={() => addNode(type)}
              className="w-full text-left px-4 py-3 rounded-xl border border-border bg-card
                         hover:border-primary/30 hover:bg-secondary/30 transition-all duration-200
                         flex items-center gap-3 group card-shadow"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${CIPHER_COLORS[type]?.badge}`}>
                {cipher.label.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium block">{cipher.label}</span>
                <span className="text-xs text-muted-foreground">
                  {type === 'caesar' && 'Shift cipher'}
                  {type === 'xor' && 'XOR with key'}
                  {type === 'vigenere' && 'Polyalphabetic'}
                  {type === 'base64' && 'Encode/decode'}
                  {type === 'reverse' && 'Mirror string'}
                </span>
              </div>
              <span className="text-muted-foreground/40 group-hover:text-primary transition-colors text-lg leading-none">+</span>
            </button>
          ))}

          <div className="mt-auto pt-6 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-1 font-mono">
              <p>{nodes.length} node{nodes.length !== 1 ? 's' : ''} in pipeline</p>
              <p className={nodes.length < 3 ? 'text-amber-400' : 'text-green-500'}>
                {nodes.length < 3 ? `need ${3 - nodes.length} more` : '✓ ready to run'}
              </p>
            </div>
          </div>
        </aside>

        {/* ─── CENTER — Pipeline Canvas ─── */}
        <div className="flex-1 overflow-y-auto relative">
          {/* Grid background */}
          <div className="absolute inset-0 grid-pattern opacity-50 pointer-events-none" />

          <div className="relative z-10 p-6 max-w-2xl mx-auto">

            {/* Warning */}
            {nodes.length < 3 && (
              <div className="mb-6 px-4 py-3 bg-amber-500/5 border border-amber-500/20
                              rounded-xl text-amber-400 text-sm flex items-center gap-3">
                <Lock className="w-4 h-4 shrink-0" />
                Add {3 - nodes.length} more node{3 - nodes.length !== 1 ? 's' : ''} to enable the pipeline
              </div>
            )}

            {/* Empty state */}
            {nodes.length === 0 && (
              <div className="text-center py-24 text-muted-foreground/40">
                <p className="text-5xl mb-4">⛓</p>
                <p className="text-sm">Add ciphers from the library to build your pipeline</p>
              </div>
            )}

            {/* Pipeline header */}
            {nodes.length > 0 && (
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-mono text-primary">{"// PIPELINE"}</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {mode === 'encrypt' ? '↓ forward cascade' : '↑ reverse cascade'}
                </p>
              </div>
            )}

            {/* Node cards */}
            {nodes.map((node, i) => {
              const colors = CIPHER_COLORS[node.type]
              return (
                <div key={node.id}>
                  <div
                    className={`rounded-xl border border-border bg-card p-5 space-y-4 card-shadow
                                transition-all duration-200 hover:border-primary/20
                                border-l-[3px] ${colors?.border || 'border-l-muted'}`}
                  >
                    {/* Header row */}
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${colors?.badge}`}>
                        {i + 1}
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${colors?.badge}`}>
                        {CIPHERS[node.type]?.label || node.type}
                      </span>
                      <div className="flex-1" />
                      <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => moveNode(node.id, 'up')}
                          disabled={i === 0}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary
                                     rounded-lg disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveNode(node.id, 'down')}
                          disabled={i === nodes.length - 1}
                          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary
                                     rounded-lg disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeNode(node.id)}
                          className="p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10
                                     rounded-lg transition-colors ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Config row */}
                    <div className="flex items-center gap-3">
                      {node.type === 'caesar' && (
                        <>
                          <label className="text-xs text-muted-foreground shrink-0">Shift</label>
                          <input
                            type="number" min={1} max={25}
                            value={node.config.shift as number}
                            onChange={e => updateConfig(node.id, 'shift', Math.max(1, Math.min(25, Number(e.target.value))))}
                            className="w-20 bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm
                                       text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-all"
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
                            className="flex-1 bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm font-mono
                                       text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-all"
                          />
                        </>
                      )}
                      {node.type === 'vigenere' && (
                        <>
                          <label className="text-xs text-muted-foreground shrink-0">Keyword</label>
                          <input
                            type="text" value={node.config.keyword as string}
                            onChange={e => updateConfig(node.id, 'keyword', e.target.value.replace(/[^a-zA-Z]/g, '') || 'a')}
                            className="flex-1 bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm font-mono
                                       text-foreground focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-all"
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
                        <p className="text-[11px] text-muted-foreground mb-1.5 font-mono uppercase tracking-wider">
                          {mode === 'decrypt' ? 'received' : 'input'}
                        </p>
                        <pre className="text-xs font-mono bg-secondary/50 border border-border/50 rounded-lg p-2.5
                                        text-muted-foreground min-h-[36px] max-h-[40px] overflow-hidden break-all whitespace-pre-wrap">
                          {stepMap[node.id]?.input != null
                            ? stepMap[node.id].input.length > 50
                              ? stepMap[node.id].input.slice(0, 50) + '…'
                              : stepMap[node.id].input || '(empty)'
                            : '—'}
                        </pre>
                      </div>
                      <div>
                        <p className={`text-[11px] mb-1.5 font-mono uppercase tracking-wider ${mode === 'encrypt' ? 'text-primary' : 'text-accent'}`}>
                          {mode === 'decrypt' ? 'produced' : 'output'}
                        </p>
                        <pre className={`text-xs font-mono bg-secondary/50 border border-border/50 rounded-lg p-2.5
                                         min-h-[36px] max-h-[40px] overflow-hidden break-all whitespace-pre-wrap ${mode === 'encrypt' ? 'text-primary' : 'text-accent'}`}>
                          {stepMap[node.id]?.output != null
                            ? stepMap[node.id].output.length > 50
                              ? stepMap[node.id].output.slice(0, 50) + '…'
                              : stepMap[node.id].output || '(empty)'
                            : '—'}
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Connector line */}
                  {i < nodes.length - 1 && (
                    <div className="flex flex-col items-center my-2 gap-0.5">
                      <div className={`w-px h-4 ${mode === 'encrypt' ? 'bg-primary/20' : 'bg-accent/20'}`} />
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center
                                       ${mode === 'encrypt' ? 'border-primary/20 text-primary/40' : 'border-accent/20 text-accent/40'}`}>
                        <span className="text-[10px]">{mode === 'encrypt' ? '▼' : '▲'}</span>
                      </div>
                      <div className={`w-px h-4 ${mode === 'encrypt' ? 'bg-primary/20' : 'bg-accent/20'}`} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* ─── RIGHT PANEL — I/O ─── */}
        <aside className="w-80 bg-card border-l border-border p-5 flex flex-col gap-5 shrink-0">

          {/* Input */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-mono text-primary">{"// INPUT"}</p>
            <label className="text-xs text-muted-foreground">
              {mode === 'encrypt' ? 'Plaintext' : 'Ciphertext'}
            </label>
            <textarea
              value={plaintext}
              onChange={e => setPlaintext(e.target.value)}
              placeholder={mode === 'encrypt' ? 'Type something to encrypt…' : 'Paste ciphertext…'}
              rows={5}
              className="bg-secondary border border-border rounded-xl p-3 text-sm font-mono
                         text-foreground placeholder-muted-foreground/50 resize-none
                         focus:outline-none focus:border-ring focus:ring-1 focus:ring-ring/30 transition-all"
            />
          </div>

          {/* Mode toggle */}
          <div className="flex rounded-xl overflow-hidden border border-border">
            <button
              onClick={() => setMode('encrypt')}
              className={`flex-1 py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                mode === 'encrypt'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              <ArrowRight className="w-3.5 h-3.5" />
              Encrypt
            </button>
            <button
              onClick={() => setMode('decrypt')}
              className={`flex-1 py-2.5 text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                mode === 'decrypt'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Decrypt
            </button>
          </div>

          {/* Run button */}
          <Button
            onClick={execute}
            disabled={nodes.length < 3 || !plaintext || isRunning}
            className={`w-full h-11 text-sm font-medium ${
              mode === 'encrypt'
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                : 'bg-accent hover:bg-accent/90 text-accent-foreground'
            }`}
          >
            {isRunning ? '⟳ Running…' : `Run Pipeline ${mode === 'encrypt' ? '→' : '←'}`}
          </Button>

          {/* Error */}
          {error && (
            <div className="text-xs text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-xl p-3">
              {error}
            </div>
          )}

          {/* Output */}
          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-mono text-primary">{"// OUTPUT"}</p>
              <button
                onClick={() => navigator.clipboard.writeText(finalOutput)}
                disabled={!finalOutput}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground
                           transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
            <textarea
              readOnly value={finalOutput}
              placeholder="Output appears here…"
              rows={5}
              className={`bg-secondary border border-border rounded-xl p-3 text-sm font-mono
                          resize-none focus:outline-none flex-1 placeholder-muted-foreground/50 ${
                mode === 'encrypt' ? 'text-primary' : 'text-accent'
              }`}
            />
          </div>

          {/* Stats */}
          {finalOutput && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono pt-2 border-t border-border">
              <span>{finalOutput.length} chars</span>
              <span className="text-muted-foreground/30">·</span>
              <span>{nodes.length} nodes</span>
              <span className="text-muted-foreground/30">·</span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                done
              </span>
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}
