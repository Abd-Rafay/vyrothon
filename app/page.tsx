'use client'

import React, { useState, useCallback, useEffect, useRef } from 'react'
import { CIPHERS } from '@/lib/ciphers'
import { PipelineNode, createNode, runPipeline, CIPHER_COLORS } from '@/lib/pipeline'

export default function CipherStack() {
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
    <main className="min-h-screen bg-zinc-950 text-white flex flex-col overflow-hidden">

      {/* TOP BAR */}
      <header className="h-12 bg-zinc-900 border-b border-zinc-800 px-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-mono font-bold text-white tracking-tight">CipherStack</span>
          <span className="text-xs text-zinc-500">cascade encryption builder</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportPipeline}
            className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors"
          >
            Export Pipeline
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded transition-colors"
          >
            Import Pipeline
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

        {/* LEFT SIDEBAR — cipher library */}
        <aside className="w-52 bg-zinc-900 border-r border-zinc-800 p-4 flex flex-col gap-2 shrink-0 overflow-y-auto">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Cipher Library</p>
          {Object.entries(CIPHERS).map(([type, cipher]) => (
            <button
              key={type}
              onClick={() => addNode(type)}
              className="w-full text-left px-3 py-2.5 rounded text-sm bg-zinc-800
                         hover:bg-zinc-700 border border-zinc-700 transition-colors flex items-center gap-2"
            >
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${CIPHER_COLORS[type]?.badge}`}>
                {cipher.label}
              </span>
              <span className="text-zinc-400">+ Add</span>
            </button>
          ))}
          <div className="mt-auto pt-4 text-xs text-zinc-600 leading-relaxed">
            Stack 3+ cipher nodes. Each node&apos;s output feeds the next.
          </div>
        </aside>

        {/* CENTER — pipeline canvas */}
        <div className="flex-1 overflow-y-auto p-5">

          {nodes.length < 3 && (
            <div className="mb-4 px-4 py-2.5 bg-amber-500/10 border border-amber-500/30
                            rounded-lg text-amber-400 text-sm">
              ⚠ Add {3 - nodes.length} more node{3 - nodes.length !== 1 ? 's' : ''} to enable the pipeline
            </div>
          )}

          <p className="text-xs text-zinc-600 mb-4 font-mono">
            {nodes.length} node{nodes.length !== 1 ? 's' : ''} · {mode === 'encrypt' ? '→ forward execution' : '← reverse execution'}
          </p>

          {nodes.length === 0 && (
            <div className="text-center py-16 text-zinc-700">
              <p className="text-4xl mb-3">⛓</p>
              <p className="text-sm">Add ciphers from the library to build your pipeline</p>
            </div>
          )}

          {nodes.map((node, i) => (
            <div key={node.id}>
              {/* NODE CARD */}
              <div
                className={`rounded-lg border border-zinc-700 border-l-4
                            ${CIPHER_COLORS[node.type]?.border || 'border-l-zinc-600'}
                            bg-zinc-900 p-4 space-y-3`}
              >
                {/* Header */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-600 font-mono w-5">{i + 1}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded font-medium
                               ${CIPHER_COLORS[node.type]?.badge}`}
                  >
                    {CIPHERS[node.type]?.label || node.type}
                  </span>
                  <div className="flex-1" />
                  <button
                    onClick={() => moveNode(node.id, 'up')}
                    disabled={i === 0}
                    className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded
                               disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-xs"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => moveNode(node.id, 'down')}
                    disabled={i === nodes.length - 1}
                    className="p-1 text-zinc-500 hover:text-white hover:bg-zinc-700 rounded
                               disabled:opacity-20 disabled:cursor-not-allowed transition-colors text-xs"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => removeNode(node.id)}
                    className="p-1 text-zinc-600 hover:text-red-400 hover:bg-zinc-700 rounded transition-colors text-xs ml-1"
                  >
                    ✕
                  </button>
                </div>

                {/* Config */}
                <div className="flex items-center gap-3">
                  {node.type === 'caesar' && (
                    <>
                      <label className="text-xs text-zinc-500 shrink-0">Shift</label>
                      <input
                        type="number"
                        min={1}
                        max={25}
                        value={node.config.shift as number}
                        onChange={e =>
                          updateConfig(node.id, 'shift', Math.max(1, Math.min(25, Number(e.target.value))))
                        }
                        className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1
                                   text-sm text-white focus:outline-none focus:border-zinc-500"
                      />
                      <span className="text-xs text-zinc-600">positions (1–25)</span>
                    </>
                  )}
                  {node.type === 'xor' && (
                    <>
                      <label className="text-xs text-zinc-500 shrink-0">Key</label>
                      <input
                        type="text"
                        value={node.config.key as string}
                        onChange={e => updateConfig(node.id, 'key', e.target.value || 'a')}
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1
                                   text-sm font-mono text-white focus:outline-none focus:border-zinc-500"
                      />
                    </>
                  )}
                  {node.type === 'vigenere' && (
                    <>
                      <label className="text-xs text-zinc-500 shrink-0">Keyword</label>
                      <input
                        type="text"
                        value={node.config.keyword as string}
                        onChange={e =>
                          updateConfig(node.id, 'keyword', e.target.value.replace(/[^a-zA-Z]/g, '') || 'a')
                        }
                        className="flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1
                                   text-sm font-mono text-white focus:outline-none focus:border-zinc-500"
                      />
                    </>
                  )}
                  {(node.type === 'base64' || node.type === 'reverse') && (
                    <span className="text-xs text-zinc-600 italic">No configuration needed — self-inverse</span>
                  )}
                </div>

                {/* Intermediate output */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <p className="text-xs text-zinc-600 mb-1 font-mono">
                      {mode === 'decrypt' ? '← received' : 'received ↓'}
                    </p>
                    <pre className="text-xs font-mono bg-zinc-800 rounded p-2 text-zinc-500
                                    min-h-8 max-h-10 overflow-hidden break-all whitespace-pre-wrap">
                      {stepMap[node.id]?.input != null
                        ? stepMap[node.id].input.length > 55
                          ? stepMap[node.id].input.slice(0, 55) + '…'
                          : stepMap[node.id].input || '(empty)'
                        : '—'}
                    </pre>
                  </div>
                  <div>
                    <p
                      className={`text-xs mb-1 font-mono ${mode === 'encrypt' ? 'text-teal-600' : 'text-orange-600'}`}
                    >
                      {mode === 'decrypt' ? '← produced' : 'produced ↓'}
                    </p>
                    <pre
                      className={`text-xs font-mono bg-zinc-800 rounded p-2 min-h-8 max-h-10
                                   overflow-hidden break-all whitespace-pre-wrap
                                   ${mode === 'encrypt' ? 'text-teal-400' : 'text-orange-400'}`}
                    >
                      {stepMap[node.id]?.output != null
                        ? stepMap[node.id].output.length > 55
                          ? stepMap[node.id].output.slice(0, 55) + '…'
                          : stepMap[node.id].output || '(empty)'
                        : '—'}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Flow arrow between nodes */}
              {i < nodes.length - 1 && (
                <div className="flex flex-col items-center my-1 gap-0.5">
                  <div className={`w-px h-3 ${mode === 'encrypt' ? 'bg-teal-800' : 'bg-orange-800'}`} />
                  <span
                    className={`text-sm leading-none ${mode === 'encrypt' ? 'text-teal-500' : 'text-orange-500'}`}
                  >
                    {mode === 'encrypt' ? '▼' : '▲'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* RIGHT PANEL — input/output */}
        <aside className="w-72 bg-zinc-900 border-l border-zinc-800 p-4 flex flex-col gap-4 shrink-0">

          <div className="flex flex-col gap-2">
            <label className="text-xs text-zinc-500 uppercase tracking-wider">Plaintext Input</label>
            <textarea
              value={plaintext}
              onChange={e => setPlaintext(e.target.value)}
              placeholder="Type something to encrypt…"
              rows={5}
              className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm font-mono
                         text-white placeholder-zinc-600 resize-none focus:outline-none
                         focus:border-zinc-500 transition-colors"
            />
          </div>

          <div className="flex rounded-lg overflow-hidden border border-zinc-700">
            <button
              onClick={() => setMode('encrypt')}
              className={`flex-1 py-2 text-sm font-medium transition-colors
                ${mode === 'encrypt'
                  ? 'bg-teal-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
            >
              ⬇ Encrypt
            </button>
            <button
              onClick={() => setMode('decrypt')}
              className={`flex-1 py-2 text-sm font-medium transition-colors
                ${mode === 'decrypt'
                  ? 'bg-orange-600 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
            >
              ⬆ Decrypt
            </button>
          </div>

          <button
            onClick={execute}
            disabled={nodes.length < 3 || !plaintext || isRunning}
            className={`w-full py-3 rounded-lg font-medium text-sm transition-all
              ${mode === 'encrypt' ? 'bg-teal-600 hover:bg-teal-500' : 'bg-orange-600 hover:bg-orange-500'}
              text-white disabled:opacity-40 disabled:cursor-not-allowed`}
          >
            {isRunning ? '⟳ Running…' : `Run Pipeline ${mode === 'encrypt' ? '→' : '←'}`}
          </button>

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded p-2">
              {error}
            </p>
          )}

          <div className="flex flex-col gap-2 flex-1">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Final Output</label>
              <button
                onClick={() => navigator.clipboard.writeText(finalOutput)}
                disabled={!finalOutput}
                className="text-xs text-zinc-600 hover:text-zinc-300 transition-colors
                           disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Copy ⎘
              </button>
            </div>
            <textarea
              readOnly
              value={finalOutput}
              placeholder="Output appears here…"
              rows={5}
              className={`bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-sm font-mono
                         resize-none focus:outline-none flex-1
                         ${mode === 'encrypt' ? 'text-teal-300' : 'text-orange-300'}
                         placeholder-zinc-600`}
            />
          </div>

          {finalOutput && (
            <div className="text-xs text-zinc-600 font-mono">
              {finalOutput.length} chars output · {nodes.length} nodes
            </div>
          )}

        </aside>
      </div>
    </main>
  )
}
