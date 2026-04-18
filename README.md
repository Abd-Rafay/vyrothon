# CipherStack

A node-based cascade encryption builder — stack cipher algorithms visually, watch data transform at every step, and decrypt perfectly in reverse.

## Live Demo

https://vyrothon-tbvh.vercel.app/

## How It Works

Drag/Select cipher nodes into a pipeline (minimum 3). Each node encrypts the previous node's output — decryption auto-reverses the entire chain to recover the original plaintext.

## Ciphers

| Cipher | Configurable | Inverse |
|--------|-------------|---------|
| Caesar | Shift (1–25) | ✓ |
| XOR | Key (string) | ✓ |
| Vigenère | Keyword (alpha) | ✓ |
| Base64 | — | ✓ |
| Reverse | — | ✓ |

## Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Stack

Next.js 14 · TypeScript · Tailwind CSS · React 19

## Built For

VYRO Hackathon 2026

## Built With

Antigravity (Gemini) · Claude
