import { CIPHERS, CipherConfig } from './ciphers'

export interface PipelineNode {
  id: string
  type: string
  config: CipherConfig
}

export interface StepResult {
  nodeId: string
  type: string
  input: string
  output: string
}

export interface PipelineResult {
  steps: StepResult[]
  finalOutput: string
  error?: string
}

export const CIPHER_COLORS: Record<string, { badge: string; border: string; text: string }> = {
  caesar:   { badge: 'bg-blue-500/20 text-blue-300',   border: 'border-l-blue-500',   text: 'text-blue-300' },
  xor:      { badge: 'bg-purple-500/20 text-purple-300', border: 'border-l-purple-500', text: 'text-purple-300' },
  vigenere: { badge: 'bg-green-500/20 text-green-300',  border: 'border-l-green-500',  text: 'text-green-300' },
  base64:   { badge: 'bg-amber-500/20 text-amber-300',  border: 'border-l-amber-500',  text: 'text-amber-300' },
  reverse:  { badge: 'bg-zinc-500/20 text-zinc-400',    border: 'border-l-zinc-500',   text: 'text-zinc-400' },
}

export function createNode(type: string): PipelineNode {
  return {
    id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    type,
    config: { ...CIPHERS[type]?.defaultConfig }
  }
}

export function runPipeline(
  nodes: PipelineNode[],
  plaintext: string,
  mode: 'encrypt' | 'decrypt'
): PipelineResult {
  try {
    const orderedNodes = mode === 'decrypt' ? [...nodes].reverse() : nodes
    const steps: StepResult[] = []
    let current = plaintext
    
    for (const node of orderedNodes) {
      const cipher = CIPHERS[node.type]
      if (!cipher) throw new Error(`Unknown cipher: ${node.type}`)
      const input = current
      const output = mode === 'encrypt'
        ? cipher.encrypt(input, node.config)
        : cipher.decrypt(input, node.config)
      steps.push({ nodeId: node.id, type: node.type, input, output })
      current = output
    }
    
    return { steps, finalOutput: current }
  } catch (e) {
    return { steps: [], finalOutput: '', error: String(e) }
  }
}
