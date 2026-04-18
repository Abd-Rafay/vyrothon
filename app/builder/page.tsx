'use client'

import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { CIPHERS } from '@/lib/ciphers'
import { PipelineNode, createNode, runPipeline, CIPHER_COLORS } from '@/lib/pipeline'
import { Download, Upload, Lock, ArrowRightLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  applyNodeChanges,
  NodeChange,
  ReactFlowProvider,
  Panel,
  useReactFlow
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { InputNode } from '@/components/flow/InputNode'
import { CipherNode } from '@/components/flow/CipherNode'
import { OutputNode } from '@/components/flow/OutputNode'

const NODE_TYPES = {
  inputNode: InputNode,
  cipherNode: CipherNode,
  outputNode: OutputNode,
}

const START_Y = 50
const NODE_HEIGHT = 320

function FlowBuilder() {
  const [pipelineNodes, setPipelineNodes] = useState<PipelineNode[]>(() => [
    createNode('caesar'),
    createNode('xor'),
    createNode('vigenere'),
  ])
  const [plaintext, setPlaintext] = useState('')
  const [finalOutput, setFinalOutput] = useState('')
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')
  const [stepMap, setStepMap] = useState<Record<string, { input: string; output: string }>>({})

  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { fitView, setCenter } = useReactFlow()

  // React Flow state
  const [rfNodes, setRfNodes] = useState<Node[]>([])
  
  // Handlers for pipeline config changes
  const updateConfig = useCallback((id: string, key: string, value: string | number) => {
    setPipelineNodes(prev => prev.map(n => n.id === id ? { ...n, config: { ...n.config, [key]: value } } : n))
  }, [])

  const removeNode = useCallback((id: string) => {
    setPipelineNodes(prev => prev.filter(n => n.id !== id))
  }, [])

  // Sync pipeline to RF nodes whenever structure/config/io changes
  useEffect(() => {
    setRfNodes(currentNodes => {
      const newNodes: Node[] = []
      
      // 1. Input Node 
      const currentInput = currentNodes.find(n => n.id === 'input')
      newNodes.push({
        id: 'input',
        type: 'inputNode',
        position: currentInput?.position || { x: 200, y: START_Y },
        data: { plaintext, setPlaintext, mode, setMode, isReady: pipelineNodes.length >= 3 },
        draggable: true,
      })

      // 2. Cipher Nodes
      pipelineNodes.forEach((node, i) => {
        const current = currentNodes.find(n => n.id === node.id)
        const position = current?.position || { x: 200, y: START_Y + (i + 1) * NODE_HEIGHT }

        newNodes.push({
          id: node.id,
          type: 'cipherNode',
          position,
          data: {
            node,
            index: i,
            mode,
            stepData: stepMap[node.id],
            onConfigChange: updateConfig,
            onRemove: removeNode,
          },
        })
      })

      // 3. Output Node
      const currentOutput = currentNodes.find(n => n.id === 'output')
      const outputY = START_Y + (pipelineNodes.length + 1) * NODE_HEIGHT
      newNodes.push({
        id: 'output',
        type: 'outputNode',
        position: currentOutput?.position || { x: 200, y: Math.max(outputY, 500) },
        data: { output: finalOutput, mode },
        draggable: true,
      })

      return newNodes
    })
  }, [pipelineNodes, plaintext, finalOutput, mode, stepMap, updateConfig, removeNode])

  // Derive Edges automatically sequentially
  const edges = useMemo(() => {
    const e: Edge[] = []
    if (pipelineNodes.length === 0) return e
    
    // mode controls the styling of the edges
    const stroke = mode === 'encrypt' ? 'oklch(0.7 0.18 170)' : 'oklch(0.65 0.15 150)'

    // Input to first node
    e.push({
      id: `e-in-${pipelineNodes[0].id}`,
      source: 'input',
      target: pipelineNodes[0].id,
      animated: true,
      style: { stroke, strokeWidth: 2 }
    })

    // Between ciphers
    for (let i = 0; i < pipelineNodes.length - 1; i++) {
      e.push({
        id: `e-${pipelineNodes[i].id}-${pipelineNodes[i+1].id}`,
        source: pipelineNodes[i].id,
        target: pipelineNodes[i+1].id,
        animated: true,
        style: { stroke, strokeWidth: 2 }
      })
    }

    // Last node to Output
    e.push({
      id: `e-${pipelineNodes[pipelineNodes.length-1].id}-out`,
      source: pipelineNodes[pipelineNodes.length-1].id,
      target: 'output',
      animated: true,
      style: { stroke, strokeWidth: 2 }
    })

    return e
  }, [pipelineNodes, mode])

  // Drag and Reorder logic
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setRfNodes((currentNodes) => {
        const nextNodes = applyNodeChanges(changes, currentNodes)

        // If a node was moved over, we should re-sort the pipeline logic array
        const positionChanges = changes.filter(c => c.type === 'position' && !c.dragging)
        if (positionChanges.length > 0) {
          setPipelineNodes(prev => {
            const sorted = [...prev].sort((a, b) => {
              const nodeA = nextNodes.find(n => n.id === a.id)
              const nodeB = nextNodes.find(n => n.id === b.id)
              return (nodeA?.position.y || 0) - (nodeB?.position.y || 0)
            })
            // Only update if order actually changed
            const prevIds = prev.map(n => n.id).join(',')
            const sortedIds = sorted.map(n => n.id).join(',')
            return prevIds === sortedIds ? prev : sorted
          })
        }
        
        return nextNodes
      })
    },
    []
  )

  const addNodeToPipeline = (type: string) => {
    setPipelineNodes(prev => [...prev, createNode(type)])
    setTimeout(() => fitView({ padding: 0.3, duration: 800 }), 50)
  }

  // Pipeline Execution Engine
  useEffect(() => {
    if (pipelineNodes.length < 3 || !plaintext) {
      setFinalOutput('')
      setStepMap({})
      return
    }
    
    const t = setTimeout(() => {
      try {
        const result = runPipeline(pipelineNodes, plaintext, mode)
        if (!result.error) {
          setFinalOutput(result.finalOutput)
          const map: Record<string, { input: string; output: string }> = {}
          result.steps.forEach(s => { map[s.nodeId] = { input: s.input, output: s.output } })
          setStepMap(map)
        }
      } catch (e) {
        console.error(e)
      }
    }, 300)
    
    return () => clearTimeout(t)
  }, [plaintext, pipelineNodes, mode])

  const handleAutoReverse = () => {
    if (!finalOutput) return
    setPlaintext(finalOutput)
    setMode(mode === 'encrypt' ? 'decrypt' : 'encrypt')
  }

  const exportPipeline = () => {
    const data = pipelineNodes.map(({ type, config }) => ({ type, config }))
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'cipherstack-pipeline.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const importPipeline = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        const imported = parsed.map((item: { type: string; config: Record<string, string | number> }) => {
          if (!CIPHERS[item.type]) throw new Error('Unknown')
          return { ...createNode(item.type), config: item.config }
        })
        setPipelineNodes(imported)
        setPlaintext('')
      } catch (e) { alert('Invalid file: ' + String(e)) }
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* ═══ TOP BAR ═══ */}
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
          <Button variant="outline" size="sm" onClick={exportPipeline} className="gap-1.5 text-xs bg-transparent border-border hover:bg-secondary/50">
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-1.5 text-xs bg-transparent border-border hover:bg-secondary/50">
            <Upload className="w-3.5 h-3.5" /> Import
          </Button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={importPipeline} />
        </div>
      </header>

      {/* ═══ BODY ═══ */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* ─── LEFT SIDEBAR — Cipher Library ─── */}
        <aside className="w-64 bg-card/50 backdrop-blur-md border-r border-border p-5 flex flex-col gap-3 shrink-0 overflow-y-auto z-10">
          <p className="text-sm font-mono text-primary mb-1">{"// LIBRARY"}</p>
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
            Click to add nodes. Drag nodes up/down on the canvas to reorder the cascade.
          </p>

          {Object.entries(CIPHERS).map(([type, cipher]) => (
            <button
              key={type}
              onClick={() => addNodeToPipeline(type)}
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
                  {type === 'xor' && 'XOR operation'}
                  {type === 'vigenere' && 'Polyalphabetic'}
                  {type === 'base64' && 'Encode/decode'}
                  {type === 'reverse' && 'Mirror string'}
                </span>
              </div>
            </button>
          ))}

          <div className="mt-auto pt-6 border-t border-border">
            <div className="text-xs text-muted-foreground space-y-2 font-mono">
              <p>{pipelineNodes.length} node{pipelineNodes.length !== 1 ? 's' : ''} in pipeline</p>
              {pipelineNodes.length < 3 && (
                <p className="text-amber-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> need {3 - pipelineNodes.length} more
                </p>
              )}
            </div>
          </div>
        </aside>

        {/* ─── CENTER — ReactFlow Canvas ─── */}
        <div className="flex-1 h-full w-full relative bg-background">
          <ReactFlow
            nodes={rfNodes}
            edges={edges}
            onNodesChange={onNodesChange}
            nodeTypes={NODE_TYPES}
            colorMode="dark"
            fitView
            fitViewOptions={{ padding: 0.5, minZoom: 0.5, maxZoom: 1 }}
            panOnScroll={true}
            zoomOnScroll={false}
            proOptions={{ hideAttribution: true }}
            className="nexus-flow"
          >
            <Background gap={30} size={1.5} color="oklch(0.7 0.18 170 / 0.1)" />
            <Controls showInteractive={false} className="bg-card border-border fill-foreground" />
            <MiniMap nodeColor="oklch(0.7 0.18 170)" maskColor="oklch(0.08 0.015 260 / 0.7)" className="bg-card border-border" />
            {pipelineNodes.length < 3 && (
              <Panel position="top-center" className="bg-amber-500/10 backdrop-blur-xl border-2 border-amber-500/60 px-8 py-4 rounded-full shadow-[0_0_50px_rgba(245,158,11,0.3)] mt-8 z-50 animate-pulse pointer-events-none">
                <div className="flex items-center gap-3 text-amber-500 text-sm font-bold tracking-widest uppercase">
                  <Lock className="w-5 h-5" />
                  SYSTEM LOCKED: ADD {3 - pipelineNodes.length} MORE CIPHER NODE{3 - pipelineNodes.length > 1 ? 'S' : ''}
                </div>
              </Panel>
            )}
            
            {/* System Status HUD */}
            <Panel position="top-right" className="bg-card/95 backdrop-blur-xl border border-primary/20 p-5 rounded-2xl shadow-[0_10_40px_rgba(0,0,0,0.5)] mt-4 mr-4 w-80 md:w-96 hidden md:flex flex-col z-50 transition-all pointer-events-auto">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${pipelineNodes.length >= 3 && plaintext ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]' : 'bg-primary shadow-[0_0_10px_var(--primary)]'}`} />
                  <span className="text-sm font-bold uppercase tracking-wider text-primary font-mono cursor-default">Global Dashboard</span>
                </div>
                
                {/* Mode Toggle Button from HUD */}
                <div className="flex bg-secondary/50 p-0.5 rounded-md border border-border/50 cursor-pointer">
                  <button onClick={() => setMode('encrypt')} className={`px-2 py-1 text-[10px] uppercase font-bold rounded transition-colors ${mode === 'encrypt' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Encrypt</button>
                  <button onClick={() => setMode('decrypt')} className={`px-2 py-1 text-[10px] uppercase font-bold rounded transition-colors ${mode === 'decrypt' ? 'bg-accent text-accent-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Decrypt</button>
                </div>
              </div>
              
              <div className="space-y-4">
                
                {/* Type-able Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-muted-foreground/80 uppercase font-bold font-mono tracking-wider ml-1">Active Input</label>
                  <textarea 
                    value={plaintext}
                    onChange={(e) => setPlaintext(e.target.value)}
                    placeholder="Type here to start..."
                    rows={2}
                    className="w-full text-sm font-mono text-foreground bg-secondary/30 p-2.5 rounded-xl border border-border focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none resize-none transition-all placeholder:text-muted-foreground/30"
                  />
                </div>
                
                {/* Pipeline Chain */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] text-muted-foreground/80 uppercase font-bold font-mono tracking-wider">Pipeline Route</label>
                    <span className="text-[10px] text-muted-foreground font-mono">{pipelineNodes.length}/3 Nodes Req</span>
                  </div>
                  <div className="flex flex-wrap gap-1 bg-secondary/30 p-2 rounded-xl border border-border/50 min-h-[44px] items-center">
                    {pipelineNodes.length === 0 ? (
                      <span className="text-xs italic text-muted-foreground/50 font-mono w-full text-center">Empty pipeline</span>
                    ) : (
                      pipelineNodes.map((n, i) => (
                        <div key={i} className="flex items-center">
                          <span className={`text-[10px] px-2 py-1 rounded-md font-bold shadow-sm border border-black/20 uppercase tracking-wide ${CIPHER_COLORS[n.type]?.badge || 'bg-secondary'}`}>
                            {CIPHERS[n.type]?.label.split(' ')[0]}
                          </span>
                          {i < pipelineNodes.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 mx-0.5" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Live Output */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] text-muted-foreground/80 uppercase font-bold font-mono tracking-wider">Final Output</label>
                  </div>
                  
                  <div className="relative">
                    <textarea 
                      readOnly
                      value={finalOutput}
                      placeholder="Result appears here..."
                      rows={2}
                      className={`w-full text-sm font-mono bg-background/50 p-2.5 rounded-xl border focus:outline-none resize-none transition-all placeholder:text-muted-foreground/30 ${
                        finalOutput 
                          ? (mode === 'encrypt' ? 'text-primary border-primary/50' : 'text-accent border-accent/50') 
                          : 'text-muted-foreground/50 italic border-border/50'
                      }`}
                    />
                    {finalOutput && (
                      <div className="absolute right-2 bottom-2 flex justify-end">
                        <button 
                          onClick={() => navigator.clipboard.writeText(finalOutput)} 
                          className="bg-card text-[10px] px-2 py-1 rounded shadow-sm border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 uppercase font-mono tracking-wider transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    )}
                  </div>
                  {finalOutput && (
                    <div className="flex items-center mt-0.5 px-1">
                      <span className="text-[9px] text-green-500 font-mono flex items-center gap-1.5 uppercase font-bold tracking-wider"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_#22c55e]" /> Execution Success</span>
                    </div>
                  )}
                </div>

                {/* Massive Auto-Reverse CTA */}
                {finalOutput && (
                  <div className="pt-3 border-t border-border/30 mt-4">
                    <button 
                      onClick={handleAutoReverse}
                      className="w-full py-2.5 bg-primary/20 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/50 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_oklch(var(--primary)/0.3)] group"
                    >
                      <ArrowRightLeft className="w-4 h-4 group-hover:rotate-180 transition-transform" />
                      <span className="text-[11px] font-bold uppercase tracking-widest font-mono">1-Click Auto Reverse</span>
                    </button>
                  </div>
                )}
              </div>
            </Panel>
          </ReactFlow>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  const [mounted, setMounted] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), [])
  if (!mounted) return null
  return (
    <ReactFlowProvider>
      <FlowBuilder />
    </ReactFlowProvider>
  )
}
