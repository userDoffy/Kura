import CryptoJS from "crypto-js";
import { sha256 } from "./sha256_manual.js";

//Key Derivation using manual SHA-256 
export const generateSharedKey = (userId1, userId2) => {
  const sortedIds = [userId1, userId2].sort();
  return sha256(sortedIds.join("-")).toString();
};

export const encryptMessage = (message, senderId, receiverId) => {
  const sharedKey = generateSharedKey(senderId, receiverId);
  console.log("Shared Key:", sharedKey);

  return CryptoJS.AES.encrypt(message, sharedKey).toString();
};

export const decryptMessage = (encryptedMessage, userId1, userId2) => {
  try {
    const sharedKey = generateSharedKey(userId1, userId2);
    console.log("Shared Key:", sharedKey);
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, sharedKey);
    const plainText = bytes.toString(CryptoJS.enc.Utf8);

    return plainText || "[Failed to decrypt]";
  } catch {
    return "[Decryption error]";
  }
};


/* ---------- Small utilities ---------- */
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
