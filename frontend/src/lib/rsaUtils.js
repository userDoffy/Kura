// src/lib/rsaUtils.js

// Greatest Common Divisor
const gcd = (a, b) => {
  while (b !== 0n) {
    [a, b] = [b, a % b];
  }
  return a;
};

// Extended Euclidean Algorithm for modular inverse
const modInverse = (a, m) => {
  let [m0, x0, x1] = [m, 0n, 1n];
  if (m === 1n) return 0n;

  while (a > 1n) {
    let q = a / m;
    [a, m] = [m, a % m];
    [x0, x1] = [x1 - q * x0, x0];
  }

  if (x1 < 0n) x1 += m0;
  return x1;
};

// Fast modular exponentiation
const modPow = (base, exp, mod) => {
  let result = 1n;
  base = base % mod;
  while (exp > 0n) {
    if (exp % 2n === 1n) {
      result = (result * base) % mod;
    }
    exp = exp / 2n;
    base = (base * base) % mod;
  }
  return result;
};

// Naive prime check (use small primes for demo)
const isPrime = (num) => {
  if (num < 2n) return false;
  for (let i = 2n; i * i <= num; i++) {
    if (num % i === 0n) return false;
  }
  return true;
};

// Generate small prime (demo only!)
const generatePrime = (min = 50n, max = 200n) => {
  while (true) {
    let candidate = BigInt(
      Math.floor(Math.random() * (Number(max - min))) + Number(min)
    );
    if (isPrime(candidate)) return candidate;
  }
};

// RSA Key Generation
export const generateRSAKeys = () => {
  const p = generatePrime();
  const q = generatePrime();
  const n = p * q;
  const phi = (p - 1n) * (q - 1n);

  let e = 65537n; // Common public exponent
  if (gcd(e, phi) !== 1n) {
    e = 3n;
  }

  const d = modInverse(e, phi);

  return {
    publicKey: { e, n },
    privateKey: { d, n },
  };
};

// Convert string → BigInt
const textToBigInt = (text) => {
  return BigInt("0x" + Buffer.from(text, "utf8").toString("hex"));
};

// Convert BigInt → string
const bigIntToText = (num) => {
  const hex = num.toString(16);
  return Buffer.from(hex.length % 2 ? "0" + hex : hex, "hex").toString("utf8");
};

// Encrypt with public key
export const rsaEncrypt = (plaintext, publicKey) => {
  const m = textToBigInt(plaintext);
  if (m >= publicKey.n) {
    throw new Error("Message too large for key size");
  }
  const c = modPow(m, publicKey.e, publicKey.n);
  return c.toString(); // send ciphertext as string
};

// Decrypt with private key
export const rsaDecrypt = (ciphertext, privateKey) => {
  const c = BigInt(ciphertext);
  const m = modPow(c, privateKey.d, privateKey.n);
  return bigIntToText(m);
};
