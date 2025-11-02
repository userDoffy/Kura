import CryptoJS from "crypto-js";

/* ---------- Key Derivation (same as yours) ---------- */
export const generateSharedKey = (userId1, userId2) => {
  const sortedIds = [userId1, userId2].sort();
  return CryptoJS.SHA256(sortedIds.join("-")).toString(); // hex string
};

/* ---------- Helpers: WordArray ↔ Uint8Array, Base64 using CryptoJS ---------- */
const wordArrayToUint8Array = (wordArray) => {
  const { words, sigBytes } = wordArray;
  const u8 = new Uint8Array(sigBytes);
  let i = 0;
  for (let offset = 0; offset < sigBytes; offset++) {
    u8[offset] = (words[(offset / 4) | 0] >>> (24 - 8 * (offset % 4))) & 0xff;
  }
  return u8;
};

const uint8ArrayToWordArray = (u8) => {
  const words = [];
  for (let i = 0; i < u8.length; i++) {
    words[(i / 4) | 0] |= u8[i] << (24 - 8 * (i % 4));
  }
  return CryptoJS.lib.WordArray.create(words, u8.length);
};

const base64EncodeBytes = (u8) => {
  const wa = uint8ArrayToWordArray(u8);
  return CryptoJS.enc.Base64.stringify(wa);
};

const base64DecodeToBytes = (b64) => {
  const wa = CryptoJS.enc.Base64.parse(b64);
  return wordArrayToUint8Array(wa);
};

/* ---------- XOR layer (key derived from sharedKey hex) ---------- */
const deriveXorKeyBytes = (sharedKeyHex, length) => {
  // Convert hex → bytes, then repeat to desired length
  const keyBytes = new Uint8Array(sharedKeyHex.length / 2);
  for (let i = 0; i < keyBytes.length; i++) {
    keyBytes[i] = parseInt(sharedKeyHex.substr(i * 2, 2), 16);
  }
  if (length <= keyBytes.length) return keyBytes.slice(0, length);

  const out = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    out[i] = keyBytes[i % keyBytes.length];
  }
  return out;
};

const xorBytes = (data, key) => {
  const out = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) out[i] = data[i] ^ key[i % key.length];
  return out;
};

/* ---------- Public API: Encrypt / Decrypt with XOR+Base64+AES ---------- */
export const encryptMessage = (message, senderId, receiverId) => {
  const sharedKey = generateSharedKey(senderId, receiverId);

  // 1) UTF-8 → bytes
  const encoder = new TextEncoder();
  const msgBytes = encoder.encode(message);

  // 2) XOR with key derived from sharedKey
  const xorKey = deriveXorKeyBytes(sharedKey, msgBytes.length);
  const xored = xorBytes(msgBytes, xorKey);

  // 3) Base64 (using CryptoJS to avoid btoa/atob Unicode issues)
  const b64 = base64EncodeBytes(xored);

  // 4) AES encrypt the Base64 string
  return CryptoJS.AES.encrypt(b64, sharedKey).toString();
};

export const decryptMessage = (encryptedMessage, userId1, userId2) => {
  try {
    const sharedKey = generateSharedKey(userId1, userId2);
    console.log("Shared Key generated:", sharedKey);

    // 1) AES decrypt → Base64 string
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, sharedKey);
    const b64 = bytes.toString(CryptoJS.enc.Utf8);
    if (!b64) return "[Failed to decrypt]";

    // 2) Base64 → bytes
    const xored = base64DecodeToBytes(b64);

    // 3) XOR with same derived key
    const xorKey = deriveXorKeyBytes(sharedKey, xored.length);
    const plainBytes = xorBytes(xored, xorKey);

    // 4) bytes → UTF-8
    const decoder = new TextDecoder();
    return decoder.decode(plainBytes);
  } catch {
    return "[Decryption error]";
  }
};

/*small utilities*/
export const formatTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatLastSeen = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return date.toLocaleDateString();
};
