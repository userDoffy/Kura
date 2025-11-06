import { sha256 } from "./sha256_manual.js";
import {
  aes128EncryptBlock,
  aes128DecryptBlock,
  textToBytes,
  bytesToText,
  hexToBytes,
} from "./aes_manual.js";


/* Key Derivation */
export const generateSharedKey = (userId1, userId2) => {
  const secretKey = import.meta.env.sha_secret_key
  const sortedIds = [userId1, userId2, secretKey].sort();
  return sha256(sortedIds.join("-"));
};

/* Base64 helpers */
const base64FromBytes = (bytes) => btoa(String.fromCharCode(...bytes));
const bytesFromBase64 = (b64) => {
  const binStr = atob(b64);
  const arr = new Uint8Array(binStr.length);
  for (let i = 0; i < binStr.length; i++) arr[i] = binStr.charCodeAt(i);
  return arr;
};

/* Pad to 16 bytes  */
const pad16 = (bytes) => {
  const padded = new Uint8Array(Math.ceil(bytes.length / 16) * 16);
  padded.set(bytes);
  return padded;
};

/* Encrypt  */
export const encryptMessage = (message, senderId, receiverId) => {
  const sharedKeyHex = generateSharedKey(senderId, receiverId);
  console.log("Shared Key:", sharedKeyHex);
  const msgBytes = pad16(textToBytes(message));
  const keyBytes = hexToBytes(sharedKeyHex.slice(0, 32));

  const ctBlocks = [];
  for (let i = 0; i < msgBytes.length; i += 16) {
    ctBlocks.push(aes128EncryptBlock(msgBytes.slice(i, i + 16), keyBytes));
  }

  const ctBytes = new Uint8Array(ctBlocks.length * 16);
  ctBlocks.forEach((b, idx) => ctBytes.set(b, idx * 16));
  return base64FromBytes(ctBytes);
};

/* Decrypt */
export const decryptMessage = (encryptedMessage, userId1, userId2) => {
  const sharedKeyHex = generateSharedKey(userId1, userId2);
  console.log("Shared Key:", sharedKeyHex);
  const ctBytes = bytesFromBase64(encryptedMessage);
  const keyBytes = hexToBytes(sharedKeyHex.slice(0, 32));

  const ptBlocks = [];
  for (let i = 0; i < ctBytes.length; i += 16) {
    ptBlocks.push(aes128DecryptBlock(ctBytes.slice(i, i + 16), keyBytes));
  }

  const ptBytes = new Uint8Array(ptBlocks.length * 16);
  ptBlocks.forEach((b, idx) => ptBytes.set(b, idx * 16));
  return bytesToText(ptBytes).replace(/\0+$/, ""); // remove padding
};

/* Small utilities */
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

