/* ---------- Manual SHA-256 Implementation (64-bit length) ---------- */
const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
  0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
  0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

const ROTR = (n, x) => (x >>> n) | (x << (32 - n));

const Σ0 = (x) => ROTR(2, x) ^ ROTR(13, x) ^ ROTR(22, x);
const Σ1 = (x) => ROTR(6, x) ^ ROTR(11, x) ^ ROTR(25, x);
const σ0 = (x) => ROTR(7, x) ^ ROTR(18, x) ^ (x >>> 3);
const σ1 = (x) => ROTR(17, x) ^ ROTR(19, x) ^ (x >>> 10);

const Ch = (x, y, z) => (x & y) ^ (~x & z);
const Maj = (x, y, z) => (x & y) ^ (x & z) ^ (y & z);

export function sha256(message) {
  const msgBytes = new TextEncoder().encode(message);

  // --- Step 1: Padding ---
  const bitLen = msgBytes.length * 8;
  const padded = new Uint8Array((((msgBytes.length + 9 + 63) >> 6) << 6));
  padded.set(msgBytes);
  padded[msgBytes.length] = 0x80; // append '1' bit

  const view = new DataView(padded.buffer);

  // --- Store full 64-bit message length (big-endian) ---
  const hi = Math.floor(bitLen / 2 ** 32); // upper 32 bits
  const lo = bitLen >>> 0;                 // lower 32 bits
  view.setUint32(padded.length - 8, hi, false); // high 32 bits
  view.setUint32(padded.length - 4, lo, false); // low 32 bits

  // --- Step 2: Initialize hash values ---
  let H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  // --- Step 3: Process each 512-bit block ---
  for (let i = 0; i < padded.length; i += 64) {
    const W = new Uint32Array(64);

    // first 16 words directly from block
    for (let t = 0; t < 16; t++) W[t] = view.getUint32(i + t * 4, false);

    // expand to 64 words
    for (let t = 16; t < 64; t++) {
      W[t] = (σ1(W[t - 2]) + W[t - 7] + σ0(W[t - 15]) + W[t - 16]) >>> 0;
    }

    let [a, b, c, d, e, f, g, h] = H;

    // 64 rounds of compression
    for (let t = 0; t < 64; t++) {
      const T1 = (h + Σ1(e) + Ch(e, f, g) + K[t] + W[t]) >>> 0;
      const T2 = (Σ0(a) + Maj(a, b, c)) >>> 0;
      h = g; g = f; f = e; e = (d + T1) >>> 0;
      d = c; c = b; b = a; a = (T1 + T2) >>> 0;
    }

    // add this block's hash to overall hash
    H = H.map((val, idx) => (val + [a, b, c, d, e, f, g, h][idx]) >>> 0);
  }

  // --- Step 4: Produce final hash as hex string ---
  return H.map(h => h.toString(16).padStart(8, "0")).join("");
}
