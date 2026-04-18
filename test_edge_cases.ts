import { CIPHERS } from './lib/ciphers';
import { createNode, runPipeline, PipelineNode } from './lib/pipeline';
import assert from 'assert';

let passed = 0;
let failed = 0;

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`✅ PASS: ${name}`);
    passed++;
  } catch (e) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   Error: ${e instanceof Error ? e.message : String(e)}`);
    failed++;
  }
}

// 1. Edge Case Inputs
const EDGE_CASES = [
  "",                                       // Empty string
  " ",                                      // Single space
  "a",                                      // Single char
  "HELLO WORLD",                            // All caps
  "hello world",                            // All lower
  "1234567890",                             // Numbers only
  "!@#$%^&*()_+{}|:\"<>?~`-=[]\\;',./",     // Symbols only
  "Hello World! 123",                       // Mixed ASCII
  "Привет, мир!",                           // Cyrillic (unicode)
  "👋🌍 🚀",                                // Emojis (surrogate pairs)
  "a\nb\tc",                                // Control characters (newlines, tabs)
  "A".repeat(10000)                         // Extremely long string (performance/stack check)
];

console.log("=========================================");
console.log("🧪 EXHAUSTIVE EDGE CASE TESTING SUITE 🧪");
console.log("=========================================\n");

console.log("--- 1. INDIVIDUAL CIPHER EDGE CASES ---");

Object.entries(CIPHERS).forEach(([cipherName, cipher]) => {
  runTest(`[${cipherName}] Handles all edge case inputs reliably`, () => {
    EDGE_CASES.forEach(plaintext => {
      const encrypted = cipher.encrypt(plaintext, cipher.defaultConfig);
      const decrypted = cipher.decrypt(encrypted, cipher.defaultConfig);
      assert.strictEqual(decrypted, plaintext, `Failed on input: ${plaintext.slice(0, 20)}...`);
    });
  });
});

console.log("\n--- 2. CONFIGURATION EDGE CASES ---");

runTest("[caesar] Handles extreme shift values (negative, huge, zero)", () => {
  const plaintext = "HelloWorld";
  const encryptWith = (s: number) => CIPHERS.caesar.encrypt(plaintext, { shift: s });
  const decryptWith = (s: number, enc: string) => CIPHERS.caesar.decrypt(enc, { shift: s });

  [-100, -26, -1, 0, 1, 26, 100].forEach(shift => {
    const enc = encryptWith(shift);
    const dec = decryptWith(shift, enc);
    assert.strictEqual(dec, plaintext, `Failed shift: ${shift}`);
  });
});

runTest("[xor] Handles empty/missing key gracefully (fallback)", () => {
  const plaintext = "Secret Message";
  // Our implementation falls back to ' ' (space) if key length is 0
  const enc = CIPHERS.xor.encrypt(plaintext, { key: "" });
  const dec = CIPHERS.xor.decrypt(enc, { key: "" });
  assert.strictEqual(dec, plaintext);
});

runTest("[vigenere] Handles empty/invalid keyword gracefully", () => {
  const plaintext = "Secret Message";
  // Our implementation strips non-alpha, and falls back to 'a'
  const enc = CIPHERS.vigenere.encrypt(plaintext, { keyword: "123!@#" });
  const dec = CIPHERS.vigenere.decrypt(enc, { keyword: "123!@#" });
  assert.strictEqual(dec, plaintext);
  // Also pure empty string
  const enc2 = CIPHERS.vigenere.encrypt(plaintext, { keyword: "" });
  const dec2 = CIPHERS.vigenere.decrypt(enc2, { keyword: "" });
  assert.strictEqual(dec2, plaintext);
});

console.log("\n--- 3. PIPELINE BEHAVIOR & FAIL-SAFES ---");

runTest("Pipeline gracefully returns exact text if 0 nodes (pass-through)", () => {
  const res = runPipeline([], "Test", "encrypt");
  assert.strictEqual(res.steps.length, 0);
  assert.strictEqual(res.finalOutput, "Test");
});

runTest("Pipeline handles massive stack (100 nodes)", () => {
  const nodes: PipelineNode[] = [];
  for(let i=0; i<100; i++) {
    nodes.push(createNode(['caesar', 'base64', 'reverse', 'vigenere'][i % 4]));
  }
  const plaintext = "Stress Testing Pipeline!!";
  const enc = runPipeline(nodes, plaintext, 'encrypt');
  assert.strictEqual(enc.steps.length, 100);
  
  const dec = runPipeline(nodes, enc.finalOutput, 'decrypt');
  assert.strictEqual(dec.finalOutput, plaintext);
});

runTest("Pipeline handles unknown cipher types safely", () => {
  const badNode = createNode('caesar');
  badNode.type = 'non_existent_cipher';
  
  const res = runPipeline([badNode], "Test", "encrypt");
  assert.ok(res.error?.includes("Unknown cipher"), "Should return an error object");
  assert.strictEqual(res.finalOutput, "");
});

console.log("\n=========================================");
console.log(`🏁 TEST RESULTS: ${passed} Passed | ${failed} Failed`);
console.log("=========================================");

if (failed > 0) process.exit(1);
