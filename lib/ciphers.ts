export type CipherConfig = Record<string, string | number>;

export interface CipherDefinition {
  label: string;
  defaultConfig: CipherConfig;
  encrypt: (input: string, config: CipherConfig) => string;
  decrypt: (input: string, config: CipherConfig) => string;
}

export type CipherMap = Record<string, CipherDefinition>;

const xorProcess = (inputBytes: Uint8Array, keyBytes: Uint8Array): Uint8Array => {
  const res = new Uint8Array(inputBytes.length);
  for (let i = 0; i < inputBytes.length; i++) {
    res[i] = inputBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  return res;
};

export const CIPHERS: CipherMap = {
  caesar: {
    label: 'Caesar Cipher',
    defaultConfig: { shift: 3 },
    encrypt: (input, config) => {
      const shift = Number(config.shift);
      return Array.from(input)
        .map((c) => {
          const code = c.charCodeAt(0);
          if (code >= 65 && code <= 90) {
            return String.fromCharCode(((code - 65 + shift) % 26 + 26) % 26 + 65);
          }
          if (code >= 97 && code <= 122) {
            return String.fromCharCode(((code - 97 + shift) % 26 + 26) % 26 + 97);
          }
          return c;
        })
        .join('');
    },
    decrypt: (input, config) => {
      const shift = Number(config.shift);
      return Array.from(input)
        .map((c) => {
          const code = c.charCodeAt(0);
          if (code >= 65 && code <= 90) {
            return String.fromCharCode(((code - 65 - shift) % 26 + 26) % 26 + 65);
          }
          if (code >= 97 && code <= 122) {
            return String.fromCharCode(((code - 97 - shift) % 26 + 26) % 26 + 97);
          }
          return c;
        })
        .join('');
    },
  },

  xor: {
    label: 'XOR Cipher',
    defaultConfig: { key: 'secret' },
    encrypt: (input, config) => {
      const keyStr = String(config.key);
      const keyBytes = new TextEncoder().encode(keyStr.length > 0 ? keyStr : ' '); // Fallback to avoid division by 0
      const inputBytes = new TextEncoder().encode(input);
      const xored = xorProcess(inputBytes, keyBytes);
      return Array.from(xored)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    },
    decrypt: (input, config) => {
      const keyStr = String(config.key);
      const keyBytes = new TextEncoder().encode(keyStr.length > 0 ? keyStr : ' ');
      const hexChars = Array.from({ length: input.length / 2 }, (_, i) =>
        parseInt(input.slice(i * 2, i * 2 + 2), 16)
      );
      const parsedBytes = new Uint8Array(hexChars);
      const xored = xorProcess(parsedBytes, keyBytes);
      return new TextDecoder().decode(xored);
    },
  },

  vigenere: {
    label: 'Vigenère Cipher',
    defaultConfig: { keyword: 'key' },
    encrypt: (input, config) => {
      const keywordStr = String(config.keyword).toLowerCase().replace(/[^a-z]/g, '') || 'a';
      let result = '';
      let keyIndex = 0;
      for (let i = 0; i < input.length; i++) {
        const c = input[i];
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          const shift = keywordStr.charCodeAt(keyIndex % keywordStr.length) - 97;
          result += String.fromCharCode(((code - 65 + shift) % 26 + 26) % 26 + 65);
          keyIndex++;
        } else if (code >= 97 && code <= 122) {
          const shift = keywordStr.charCodeAt(keyIndex % keywordStr.length) - 97;
          result += String.fromCharCode(((code - 97 + shift) % 26 + 26) % 26 + 97);
          keyIndex++;
        } else {
          result += c;
        }
      }
      return result;
    },
    decrypt: (input, config) => {
      const keywordStr = String(config.keyword).toLowerCase().replace(/[^a-z]/g, '') || 'a';
      let result = '';
      let keyIndex = 0;
      for (let i = 0; i < input.length; i++) {
        const c = input[i];
        const code = c.charCodeAt(0);
        if (code >= 65 && code <= 90) {
          const shift = keywordStr.charCodeAt(keyIndex % keywordStr.length) - 97;
          result += String.fromCharCode(((code - 65 - shift) % 26 + 26) % 26 + 65);
          keyIndex++;
        } else if (code >= 97 && code <= 122) {
          const shift = keywordStr.charCodeAt(keyIndex % keywordStr.length) - 97;
          result += String.fromCharCode(((code - 97 - shift) % 26 + 26) % 26 + 97);
          keyIndex++;
        } else {
          result += c;
        }
      }
      return result;
    },
  },

  base64: {
    label: 'Base64',
    defaultConfig: {},
    encrypt: (input) => Buffer.from(input, 'utf-8').toString('base64'),
    decrypt: (input) => Buffer.from(input, 'base64').toString('utf-8'),
  },

  reverse: {
    label: 'Reverse',
    defaultConfig: {},
    encrypt: (input) => [...input].reverse().join(''),
    decrypt: (input) => [...input].reverse().join(''),
  },
};

// Dev self-test function
export function selfTest() {
  const testInput = "Hello World 123! Урок";
  Object.entries(CIPHERS).forEach(([name, cipher]) => {
    try {
      const enc = cipher.encrypt(testInput, cipher.defaultConfig);
      const dec = cipher.decrypt(enc, cipher.defaultConfig);
      console.log(`${name}: ${dec === testInput ? 'PASS' : 'FAIL'} (Encrypted: ${enc})`);
    } catch (err) {
      console.log(`${name}: ERROR ->`, err);
    }
  });
}

// Uncomment to test
// selfTest();
