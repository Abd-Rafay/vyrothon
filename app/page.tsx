'use client'

import React, { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { CIPHERS } from '@/lib/ciphers'
import { PipelineNode, runPipeline, createNode, CIPHER_COLORS } from '@/lib/pipeline'
import NodeCard from '@/components/NodeCard'

export default function CipherStack() {
  const [nodes, setNodes] = useState<PipelineNode[]>([])
  const [plaintext, setPlaintext] = useState('')
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')

  // Add node to pipeline
  const addNode = (type: string) => {
    setNodes([...nodes, createNode(type)])
  }

  // Remove node
  const removeNode = (id: string) => {
    setNodes(nodes.filter((n) => n.id !== id))
  }

  // Reorder nodes
  const moveNode = (id: string, direction: 'up' | 'down') => {
    const index = nodes.findIndex((n) => n.id === id)
    if (
      (direction === 'up' && index > 0) ||
      (direction === 'down' && index < nodes.length - 1)
    ) {
      const newNodes = [...nodes]
      const offset = direction === 'up' ? -1 : 1
      ;[newNodes[index], newNodes[index + offset]] = [newNodes[index + offset], newNodes[index]]
      setNodes(newNodes)
    }
  }

  // Update node config
  const updateConfig = (id: string, key: string, value: string | number) => {
    setNodes(
      nodes.map((n) =>
        n.id === id
          ? { ...n, config: { ...n.config, [key]: value } }
          : n
      )
    )
  }

  // Execute pipeline (memoized for real-time preview)
  const pipelineResult = useMemo(() => {
    if (nodes.length < 3) return { steps: [], finalOutput: '', error: 'Add at least 3 nodes.' }
    return runPipeline(nodes, plaintext, mode)
  }, [nodes, plaintext, mode])

  const canRun = nodes.length >= 3

  return (
    <div className="flex h-screen bg-zinc-950 text-white font-sans overflow-hidden">
      {/* Left Panel - Node Library */}
      <div className="w-64 shrink-0 bg-zinc-900 border-r border-zinc-700 p-6 flex flex-col overflow-y-auto">
        <h2 className="text-lg font-bold mb-6 tracking-tight">Block Library</h2>
        <div className="flex flex-col gap-3">
          {Object.entries(CIPHERS).map(([type, cipherDef]) => (
             <button
              key={type}
              onClick={() => addNode(type)}
              className={`w-full py-2.5 px-4 rounded text-sm font-semibold transition-all ${
                CIPHER_COLORS[type]?.badge || 'bg-zinc-800 text-zinc-300'
              } hover:brightness-110 active:scale-95 text-left flex items-center justify-between group`}
            >
              <span>{cipherDef.label}</span>
              <Plus size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      </div>

      {/* Center Panel - Pipeline */}
      <div className="flex-1 bg-zinc-900 border-r border-zinc-700 p-6 overflow-y-auto custom-scrollbar flex flex-col relative">
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-zinc-900/90 backdrop-blur-sm z-10 pb-2">
          <h2 className="text-lg font-bold tracking-tight">Encryption Pipeline</h2>
          <span className="text-xs font-mono bg-zinc-800 px-2 py-1 rounded text-zinc-400">
            {nodes.length} / 3+ Nodes
          </span>
        </div>

        {nodes.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-zinc-500 text-sm italic">Add nodes from the library to start building...</p>
          </div>
        ) : (
          <div className="space-y-2 pb-24">
            {nodes.map((node, index) => {
              // Find intermediate outputs
              const stepData = pipelineResult.steps.find((s) => s.nodeId === node.id)
              
              return (
                <div key={node.id} className="relative z-0 group animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <NodeCard
                    node={node}
                    index={index}
                    totalNodes={nodes.length}
                    mode={mode}
                    stepData={stepData}
                    onMoveUp={(id) => moveNode(id, 'up')}
                    onMoveDown={(id) => moveNode(id, 'down')}
                    onRemove={removeNode}
                    onConfigChange={updateConfig}
                  />
                  {/* Flow Arrow */}
                  {index < nodes.length - 1 && (
                    <div className="flex justify-center py-1 opacity-50 group-hover:opacity-100 transition-opacity">
                      <div className="text-zinc-600 text-sm">↓</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Right Panel - I/O */}
      <div className="w-80 shrink-0 bg-zinc-900 border-l border-zinc-700 flex flex-col z-20 shadow-2xl relative shadow-black/50">
        <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto">
          {/* Mode Toggle */}
          <div className="flex gap-1 bg-zinc-800/50 p-1 rounded-lg">
            <button
              onClick={() => setMode('encrypt')}
              className={`flex-1 py-1.5 px-4 rounded-md font-semibold text-xs tracking-wider transition-all duration-300 ${
                mode === 'encrypt'
                  ? 'bg-teal-500/20 text-teal-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              ENCRYPT
            </button>
            <button
              onClick={() => setMode('decrypt')}
              className={`flex-1 py-1.5 px-4 rounded-md font-semibold text-xs tracking-wider transition-all duration-300 ${
                mode === 'decrypt'
                  ? 'bg-orange-500/20 text-orange-400 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              DECRYPT
            </button>
          </div>

          {/* Plaintext Input */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              {mode === 'encrypt' ? 'Plaintext Input' : 'Ciphertext Input'}
            </label>
            <textarea
              value={plaintext}
              onChange={(e) => setPlaintext(e.target.value)}
              className="w-full h-32 bg-zinc-950/50 border border-zinc-700/50 rounded-lg p-3 text-sm font-mono text-zinc-200 resize-none focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-all placeholder:text-zinc-700"
              placeholder={mode === 'encrypt' ? "Enter text to encrypt..." : "Enter ciphertext..."}
            />
          </div>

          {/* Warning */}
          {!canRun && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 fade-in">
              <p className="text-xs text-red-400 font-medium text-center">Minimum 3 nodes required to produce output</p>
            </div>
          )}

          {/* Final Output */}
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Final Output
            </label>
            <textarea
              value={pipelineResult.finalOutput}
              readOnly
              className={`w-full flex-1 min-h-[120px] border border-zinc-700/50 rounded-lg p-3 text-sm font-mono resize-none focus:outline-none transition-all shadow-inner ${
                mode === 'encrypt' ? 'bg-teal-950/10 text-teal-300' : 'bg-orange-950/10 text-orange-300'
              } ${!canRun ? 'opacity-50 blur-[1px]' : ''}`}
              placeholder="Output will appear here..."
            />
          </div>
        </div>
        
        {/* Run Status Footer */}
        <div className={`p-4 border-t border-zinc-800 text-center text-xs font-bold uppercase tracking-widest ${
          canRun ? 'bg-zinc-800 text-zinc-300' : 'bg-transparent text-zinc-600'
        }`}>
          {canRun ? 'Live Preview Active' : 'Pipeline Incomplete'}
        </div>
      </div>
    </div>
  )
}
