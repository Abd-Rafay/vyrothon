"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Lock, Layers, Eye } from "lucide-react";

/* ─── ASCII Wave canvas (from Nexus template) ─── */
function AsciiWave({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const chars = "█▓▒░ ";
    const width = 120;
    const height = 40;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = "12px JetBrains Mono, monospace";

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const wave1 = Math.sin((x * 0.08) + time) * Math.cos((y * 0.12) + time * 0.5);
          const wave2 = Math.sin((x * 0.05) - time * 0.7) * Math.sin((y * 0.08) + time * 0.3);
          const wave3 = Math.cos((x * 0.03) + (y * 0.03) + time * 0.4);

          const combined = (wave1 + wave2 + wave3) / 3;
          const normalized = (combined + 1) / 2;

          const charIndex = Math.floor(normalized * (chars.length - 1));
          const char = chars[charIndex];

          if (char !== " ") {
            const hue = 170 + normalized * 30;
            const lightness = 0.5 + normalized * 0.3;
            ctx.fillStyle = `oklch(${lightness} 0.15 ${hue} / ${0.3 + normalized * 0.7})`;
            ctx.fillText(char, x * 8, y * 12 + 12);
          }
        }
      }

      time += 0.03;
      animationId = requestAnimationFrame(animate);
    };

    canvas.width = width * 8;
    canvas.height = height * 12;
    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ imageRendering: "pixelated" }}
    />
  );
}

/* ─── Stats ─── */
const stats = [
  { value: "5", label: "cipher algorithms", sub: "BUILT-IN" },
  { value: "100%", label: "round-trip accuracy", sub: "VERIFIED" },
  { value: "<300ms", label: "live preview", sub: "DEBOUNCED" },
  { value: "∞", label: "stackable nodes", sub: "UNLIMITED" },
];

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setIsVisible(true), []);

  return (
    <main className="relative min-h-screen overflow-x-hidden">

      {/* ═══ NAVIGATION ═══ */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <nav className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a href="#" className="flex items-center gap-3 group">
              <div className="relative w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20" />
                <span className="font-mono text-primary font-bold text-base relative z-10">C</span>
              </div>
              <span className="text-lg font-bold tracking-tight">CipherStack</span>
            </a>

            <div className="hidden md:flex items-center gap-1">
              <a href="#features" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">Features</a>
              <a href="#how-it-works" className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50">How It Works</a>
            </div>

            <Link href="/builder">
              <Button size="sm" className="bg-foreground hover:bg-foreground/90 text-background">
                Launch Builder
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-16">
        {/* Grid pattern background */}
        <div className="absolute inset-0 grid-pattern opacity-50" />

        {/* ASCII Wave — full-bleed behind hero */}
        <div className="absolute inset-0 opacity-30 pointer-events-none overflow-hidden">
          <AsciiWave className="w-full h-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-12 lg:py-24">
          {/* Headline */}
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
              A node-based cascade encryption builder. Visually chain
              cipher algorithms, watch data transform at every step, and
              decrypt perfectly in reverse.
            </p>
          </div>

          {/* CTAs */}
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

      {/* ═══ FEATURES — minimal 3-card grid ═══ */}
      <section id="features" className="relative py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-sm font-mono text-primary mb-3">{"// FEATURES"}</p>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-12">
            What makes CipherStack different.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Layers,
                title: "Visual Pipeline",
                description: "Add, configure, reorder and remove cipher nodes. Each node's output feeds the next — building a cascade.",
              },
              {
                icon: Eye,
                title: "Intermediate Visibility",
                description: "See exactly what each node received and produced. This is what separates a tool from a toy.",
              },
              {
                icon: Lock,
                title: "Perfect Round-Trip",
                description: "Encrypt forward, decrypt backward. The original plaintext is recovered exactly — every time, any input.",
              },
            ].map(f => (
              <div key={f.title} className="rounded-xl border border-border bg-card p-8 card-shadow">
                <div className="mb-5 h-11 w-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS — compact 3-step ═══ */}
      <section id="how-it-works" className="relative py-24 overflow-hidden bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-sm font-mono text-primary mb-3">{"// HOW IT WORKS"}</p>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-12">
            Three steps to cascade encryption.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { num: "01", title: "Add Nodes", desc: "Pick ciphers from the library — Caesar, XOR, Vigenère, Base64, Reverse. Minimum 3 to run." },
              { num: "02", title: "Configure", desc: "Set shift values, keys, and keywords. Each node is independently configurable." },
              { num: "03", title: "Execute", desc: "Hit encrypt to cascade forward. Hit decrypt to reverse the entire chain. Live preview updates as you type." },
            ].map(step => (
              <div key={step.num} className="rounded-xl border border-border bg-card p-8 card-shadow">
                <span className="font-mono text-sm text-primary">{step.num}</span>
                <h3 className="text-base font-semibold mt-3 mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="relative py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-foreground" />
            <div className="absolute inset-0 grid-pattern opacity-10" />

            <div className="relative z-10 px-8 lg:px-16 py-16 lg:py-20 text-center lg:text-left">
              <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4 text-background text-balance">
                Start building unbreakable chains.
              </h2>
              <p className="text-base text-background/70 mb-8 max-w-lg mx-auto lg:mx-0">
                Open the visual pipeline builder. No setup — runs entirely in your browser.
              </p>
              <Link href="/builder">
                <Button size="lg" className="bg-background hover:bg-background/90 text-foreground px-6 h-12 text-sm font-medium group">
                  Launch Builder
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-semibold text-sm tracking-tight">CipherStack</span>
            <span className="text-xs text-muted-foreground ml-2">Vyro Hackathon 2026</span>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              All tests passing
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}
