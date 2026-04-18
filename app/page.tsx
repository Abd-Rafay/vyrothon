"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, Layers, Eye, ArrowLeftRight, Code2, Zap, GitBranch } from "lucide-react";

/* ─── ASCII animation for hero background ─── */
function AsciiMatrix({ className }: { className?: string }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setFrame(f => f + 1), 150);
    return () => clearInterval(interval);
  }, []);

  const getChar = useCallback((r: number, c: number, f: number) => {
    const chars = "01▓░▒█╬╠╣╦╩─│┌┐└┘├┤┬┴┼";
    const idx = (r * 7 + c * 13 + f) % chars.length;
    return chars[idx];
  }, []);

  const rows = 16;
  const cols = 80;

  return (
    <pre className={`font-mono text-[10px] leading-[14px] text-primary/20 select-none ${className}`}>
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => getChar(r, c, frame)).join("")
      ).join("\n")}
    </pre>
  );
}

/* ─── Animated cipher demo ─── */
function CipherDemo() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setStep(s => (s + 1) % 4), 2500);
    return () => clearInterval(interval);
  }, []);

  const stages = [
    { label: "Plaintext", value: '"Hello World"', color: "text-foreground" },
    { label: "Caesar (+3)", value: '"Khoor Zruog"', color: "text-blue-400" },
    { label: "XOR (key)", value: "3c091001135410...", color: "text-purple-400" },
    { label: "Vigenère", value: "3x091p040x04...", color: "text-green-400" },
  ];

  return (
    <div className="rounded-xl overflow-hidden bg-card border border-border card-shadow">
      <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-secondary/30">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
          <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
          <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
        </div>
        <span className="text-xs font-mono text-muted-foreground">pipeline.ts</span>
      </div>
      <div className="p-6 font-mono text-sm space-y-3">
        {stages.map((s, i) => (
          <div
            key={s.label}
            className={`flex items-center gap-3 transition-all duration-500 ${
              i <= step ? "opacity-100 translate-x-0" : "opacity-20 translate-x-2"
            }`}
          >
            <span className="text-muted-foreground/40 w-5 text-right">{i + 1}</span>
            <span className="text-muted-foreground text-xs w-24">{s.label}</span>
            <span className="text-primary/30">→</span>
            <span className={`${s.color} text-xs`}>{s.value}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-border p-4 bg-secondary/20 font-mono text-xs">
        <div className="flex items-center gap-2 text-green-500">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Cascade active · {step + 1}/4 transforms applied
        </div>
      </div>
    </div>
  );
}

/* ─── Features data ─── */
const features = [
  {
    icon: Layers,
    title: "Node-Based Pipeline",
    description: "Drag cipher nodes into a visual pipeline. Each node's output feeds seamlessly into the next.",
  },
  {
    icon: Lock,
    title: "Cascade Encryption",
    description: "Stack 3+ cipher algorithms for layered security. Caesar, XOR, Vigenère, Base64, and more.",
  },
  {
    icon: Eye,
    title: "Intermediate Visibility",
    description: "See exactly what each node receives and produces. Watch data transform step by step.",
  },
  {
    icon: ArrowLeftRight,
    title: "Bi-Directional",
    description: "Encrypt forward, decrypt backward. Perfect round-trip recovery guaranteed for any input.",
  },
  {
    icon: Code2,
    title: "Modular Architecture",
    description: "Each cipher is self-contained. Add new algorithms without touching existing code.",
  },
  {
    icon: Zap,
    title: "Live Preview",
    description: "Real-time pipeline execution as you type. 300ms debounced auto-evaluation.",
  },
];

/* ─── How It Works data ─── */
const howItWorks = [
  {
    number: "01",
    title: "Add Cipher Nodes",
    description: "Pick from the cipher library — Caesar, XOR, Vigenère, Base64, or Reverse. Stack as many as you want.",
    code: `addNode('caesar')    // Shift cipher
addNode('xor')       // XOR with key
addNode('vigenere')  // Polyalphabetic`,
  },
  {
    number: "02",
    title: "Configure Each Node",
    description: "Set shift values, encryption keys, and keywords. Each node is independently configurable.",
    code: `node.config = {
  shift: 7,        // Caesar
  key: 'secret',   // XOR
  keyword: 'vyro'  // Vigenère
}`,
  },
  {
    number: "03",
    title: "Execute Pipeline",
    description: "Hit encrypt and watch plaintext cascade through every node. Decrypt reverses the entire chain.",
    code: `runPipeline(nodes, plaintext, 'encrypt')
// "Hello" → "Olssv" → "3c09..." → "3x09..."
// Decrypt: exact reverse = "Hello" ✓`,
  },
];

/* ─── Stats ─── */
const stats = [
  { value: "5", label: "cipher algorithms", sub: "INCLUDED" },
  { value: "100%", label: "round-trip accuracy", sub: "VERIFIED" },
  { value: "<300ms", label: "live preview latency", sub: "DEBOUNCED" },
  { value: "∞", label: "stackable nodes", sub: "UNLIMITED" },
];

function highlightCode(line: string): string {
  return line
    .replace(/(addNode|runPipeline|node)/g, '<span class="text-foreground">$1</span>')
    .replace(/(\.\w+)/g, '<span class="text-primary">$1</span>')
    .replace(/('.*?'|".*?")/g, '<span class="text-green-400">$1</span>')
    .replace(/(\/\/.*$)/g, '<span class="text-muted-foreground/50">$1</span>')
    .replace(/(\{|\}|\(|\)|\[|\]|:|=)/g, '<span class="text-muted-foreground/70">$1</span>');
}

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => setIsVisible(true), []);

  useEffect(() => {
    const interval = setInterval(() => setActiveStep(s => (s + 1) % howItWorks.length), 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative min-h-screen overflow-x-hidden">

      {/* ═══ NAVIGATION ═══ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <a href="#" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                <span className="font-mono text-primary font-bold text-lg relative z-10">C</span>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-primary/10" />
              </div>
              <span className="text-xl font-bold tracking-tight">CipherStack</span>
            </a>

            <div className="hidden md:flex items-center gap-1">
              {[
                { name: "Features", href: "#features" },
                { name: "How It Works", href: "#how-it-works" },
                { name: "Metrics", href: "#metrics" },
              ].map(link => (
                <a
                  key={link.name}
                  href={link.href}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-secondary/50"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                <GitBranch className="w-5 h-5" />
              </a>
              <Link href="/builder">
                <Button size="sm" className="bg-foreground hover:bg-foreground/90 text-background">
                  Launch Builder
                </Button>
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 grid-pattern opacity-50" />
        <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
          <AsciiMatrix />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-24">
          <div className="text-center max-w-5xl mx-auto mb-10">
            <h1
              className={`text-5xl md:text-7xl font-semibold tracking-tight leading-[0.95] mb-8 transition-all duration-700 delay-100 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              <span className="text-balance">Stack ciphers.</span>
              <br />
              <span className="text-balance">Build </span>
              <span className="text-primary">unbreakable</span>
              <span className="text-balance"> chains.</span>
            </h1>

            <p
              className={`text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed transition-all duration-700 delay-200 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
            >
              A node-based cascade encryption builder. Visually chain cipher
              algorithms, watch data transform at every step, and decrypt
              perfectly in reverse.
            </p>
          </div>

          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-3 mb-20 transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Link href="/builder">
              <Button size="lg" className="bg-foreground hover:bg-foreground/90 text-background px-6 h-11 text-sm font-medium group">
                Launch Builder
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="h-11 px-6 text-sm font-medium border-border hover:bg-secondary/50 bg-transparent">
                Explore Features
              </Button>
            </a>
          </div>

          {/* Stats bar */}
          <div
            className={`grid grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden card-shadow transition-all duration-700 delay-400 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            {stats.map(stat => (
              <div key={stat.sub} className="p-6 lg:p-8 flex justify-between min-h-[140px] bg-card shadow-none lg:py-8 flex-col">
                <div>
                  <span className="text-xl lg:text-2xl font-semibold">{stat.value}</span>
                  <span className="text-muted-foreground text-sm lg:text-base"> {stat.label}</span>
                </div>
                <div className="font-mono text-xs text-muted-foreground/60 tracking-widest mt-4">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section id="features" className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <p className="text-sm font-mono text-primary mb-3">// PLATFORM</p>
              <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight mb-6">
                <span className="text-balance">Everything you need</span>
                <br />
                <span className="text-balance">to encrypt at scale.</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                A complete visual encryption workbench. Chain algorithms, inspect
                intermediate state, and verify round-trip correctness — all in
                real time.
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <CipherDemo />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group relative rounded-xl p-8 card-shadow transition-all duration-700 hover:border-primary/50 bg-transparent"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-6 h-12 w-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="relative py-32 overflow-hidden bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-20">
            <p className="text-sm font-mono text-primary mb-3">// TECHNOLOGY</p>
            <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight mb-6">
              <span className="text-balance">Three steps to</span>
              <br />
              <span className="text-balance">cascade encryption.</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-2">
              {howItWorks.map((step, index) => (
                <button
                  key={step.number}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  className={`w-full text-left p-6 rounded-xl border transition-all duration-300 ${
                    activeStep === index
                      ? "bg-card border-primary/50 card-shadow"
                      : "bg-transparent border-transparent hover:bg-card/50"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className={`font-mono text-sm transition-colors ${activeStep === index ? "text-primary" : "text-muted-foreground"}`}>
                      {step.number}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                      <p className={`text-sm leading-relaxed transition-colors ${activeStep === index ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                  {activeStep === index && (
                    <div className="mt-4 ml-8">
                      <div className="h-0.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: "100%", animation: "progress 4s linear" }}
                        />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="lg:sticky lg:top-32">
              <div className="rounded-xl overflow-hidden bg-card border border-border card-shadow">
                <div className="px-4 py-3 border-b border-border flex items-center gap-3 bg-secondary/30">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                    <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                    <div className="w-3 h-3 rounded-full bg-muted-foreground/20" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">pipeline.ts</span>
                </div>
                <div className="p-6 font-mono text-sm min-h-[200px]">
                  <pre className="text-muted-foreground">
                    {howItWorks[activeStep].code.split("\n").map((line, i) => (
                      <div
                        key={`${activeStep}-${i}`}
                        className="leading-relaxed animate-in fade-in slide-in-from-left-2"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        <span className="text-muted-foreground/40 select-none w-6 inline-block">{i + 1}</span>
                        <span dangerouslySetInnerHTML={{ __html: highlightCode(line) }} />
                      </div>
                    ))}
                  </pre>
                </div>
                <div className="border-t border-border p-4 bg-secondary/20 font-mono text-xs">
                  <div className="flex items-center gap-2 text-green-500">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </section>

      {/* ═══ METRICS ═══ */}
      <section id="metrics" className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-20">
            <p className="text-sm font-mono text-primary mb-3">// METRICS</p>
            <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight mb-6">
              <span className="text-balance">Built for correctness.</span>
              <br />
              <span className="text-balance">Tested to the edge.</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Every cipher passes exhaustive round-trip tests — empty strings,
              Unicode, emojis, 10k-character payloads, and negative shift values.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { cipher: "Caesar Cipher", tests: "Edge cases: negative shifts, zero shift, shift > 26, Unicode passthrough", status: "PASS" },
              { cipher: "XOR Cipher", tests: "Edge cases: empty key fallback, hex encoding/decoding, emoji byte sequences", status: "PASS" },
              { cipher: "Vigenère Cipher", tests: "Edge cases: non-alpha keyword stripping, empty keyword fallback, case preservation", status: "PASS" },
            ].map(item => (
              <div key={item.cipher} className="rounded-xl bg-card border border-border p-6 card-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="font-semibold">{item.cipher}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{item.tests}</p>
                <div className="font-mono text-xs text-green-500 bg-green-500/10 rounded px-3 py-1.5 inline-flex items-center gap-2">
                  ✓ 11/11 {item.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-foreground" />
            <div className="absolute inset-0 grid-pattern opacity-10" />

            <div className="relative z-10 px-8 lg:px-16 py-16 lg:py-20">
              <div className="max-w-2xl">
                <h2 className="text-3xl lg:text-5xl font-semibold tracking-tight mb-6 text-background text-balance">
                  Start building unbreakable chains.
                </h2>
                <p className="text-lg text-background/70 mb-8 leading-relaxed max-w-lg">
                  Open the visual pipeline builder and start stacking ciphers.
                  No setup required — runs entirely in your browser.
                </p>
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Link href="/builder">
                    <Button size="lg" className="bg-background hover:bg-background/90 text-foreground px-6 h-12 text-sm font-medium group">
                      Launch Builder
                      <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </Link>
                  <a href="https://github.com" target="_blank" rel="noreferrer">
                    <Button size="lg" variant="outline" className="h-12 px-6 text-sm font-medium border-background/30 text-background hover:bg-background/10 bg-transparent">
                      View on GitHub
                    </Button>
                  </a>
                </div>
                <p className="text-sm text-background/50 mt-6 font-mono">
                  No backend. No accounts. Pure client-side encryption.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="relative border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="col-span-2">
                <a href="#" className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-semibold text-lg tracking-tight">CipherStack</span>
                </a>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  A node-based cascade encryption builder for the Vyro Hackathon.
                  Stack cipher algorithms to encrypt and decrypt data visually.
                </p>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                  <GitBranch className="w-5 h-5" />
                </a>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-4">Product</h3>
                <ul className="space-y-3">
                  {[
                    { name: "Features", href: "#features" },
                    { name: "How It Works", href: "#how-it-works" },
                    { name: "Metrics", href: "#metrics" },
                  ].map(link => (
                    <li key={link.name}>
                      <a href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-4">Stack</h3>
                <ul className="space-y-3">
                  {["Next.js 14", "TypeScript", "Tailwind CSS", "React 19"].map(name => (
                    <li key={name}>
                      <span className="text-sm text-muted-foreground">{name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="py-6 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              {new Date().getFullYear()} CipherStack. Vyro Hackathon Submission.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                All tests passing
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
