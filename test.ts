import { createNode, runPipeline } from './lib/pipeline';

function testFullPipeline() {
  const plaintext = "Hello Hackathon 2026! 🚀";
  
  // Arrange nodes
  const nodes = [
    createNode('caesar'), 
    createNode('xor'), 
    createNode('vigenere')
  ];

  // Configure nodes
  nodes[0].config.shift = 7;
  nodes[1].config.key = "secret_key";
  nodes[2].config.keyword = "vyro";

  console.log("=== END-TO-END PIPELINE TEST ===");
  console.log("Original plaintext:", plaintext);

  // 1. Encrypt
  const encryptedResult = runPipeline(nodes, plaintext, 'encrypt');
  console.log("\n[Encryption Pass]");
  encryptedResult.steps.forEach((step, i) => {
    console.log(`Step ${i+1} (${step.type}):\n  In:  ${step.input}\n  Out: ${step.output}`);
  });
  console.log("Final Ciphertext:", encryptedResult.finalOutput);

  // 2. Decrypt
  const decryptedResult = runPipeline(nodes, encryptedResult.finalOutput, 'decrypt');
  console.log("\n[Decryption Pass]");
  decryptedResult.steps.forEach((step, i) => {
    console.log(`Step ${i+1} (${step.type}):\n  In:  ${step.input}\n  Out: ${step.output}`);
  });
  console.log("Final Output:", decryptedResult.finalOutput);

  // 3. Verify
  const isPerfect = decryptedResult.finalOutput === plaintext;
  console.log("\nResult:", isPerfect ? "✅ PERFECT ROUND TRIP" : "❌ DECRYPTION FAILED");
}

testFullPipeline();
