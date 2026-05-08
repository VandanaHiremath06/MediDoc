import CryptoJS from 'crypto-js';

// AES-256 encryption key (in production, this should be in env variables)
const ENCRYPTION_KEY = 'MediDoc-Secure-Key-2026-AES256-Protection';

export function encryptData(data: any): string {
  const jsonString = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonString, ENCRYPTION_KEY).toString();
  return encrypted;
}

export function decryptData(encryptedData: string): any {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    const jsonString = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
}

// Generate a secure hash for QR code data
export function generateSecureHash(data: any): string {
  const jsonString = JSON.stringify(data);
  return CryptoJS.SHA256(jsonString).toString();
}
