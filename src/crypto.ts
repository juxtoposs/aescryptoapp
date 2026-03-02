import CryptoJS from 'crypto-js';

export type AESMode = 'ECB' | 'CBC' | 'CFB';
export type KeyLength = 128 | 192 | 256;
export type Operation = 'encrypt' | 'decrypt';

/**
 * Derives a key of specified length from user password using PBKDF2
 */
function deriveKey(password: string, keyLength: KeyLength): CryptoJS.lib.WordArray {
  const keyBytes = keyLength / 8;
  // Use PBKDF2 with fixed salt for deterministic key derivation
  const salt = CryptoJS.enc.Utf8.parse('aes-crypto-salt-2024');
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: keyBytes / 4, // CryptoJS uses word count (4 bytes per word)
    iterations: 1000,
  });
  return key;
}

/**
 * Generates a random IV for CBC and CFB modes
 */
function generateIV(): CryptoJS.lib.WordArray {
  return CryptoJS.lib.WordArray.random(16); // AES block size is always 128 bits (16 bytes)
}

/**
 * Encrypts plaintext using AES with specified parameters
 */
export function encryptAES(
  plaintext: string,
  password: string,
  mode: AESMode,
  keyLength: KeyLength
): { ciphertext: string; iv?: string } {
  if (!password) {
    throw new Error('Password cannot be empty');
  }
  if (!plaintext) {
    throw new Error('Plaintext cannot be empty');
  }

  const key = deriveKey(password, keyLength);
  let encrypted: CryptoJS.lib.CipherParams;
  let iv: CryptoJS.lib.WordArray | undefined;

  switch (mode) {
    case 'ECB':
      encrypted = CryptoJS.AES.encrypt(plaintext, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });
      break;

    case 'CBC':
      iv = generateIV();
      encrypted = CryptoJS.AES.encrypt(plaintext, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      break;

    case 'CFB':
      iv = generateIV();
      encrypted = CryptoJS.AES.encrypt(plaintext, key, {
        iv: iv,
        mode: CryptoJS.mode.CFB,
        padding: CryptoJS.pad.NoPadding,
      });
      break;

    default:
      throw new Error(`Unsupported mode: ${mode}`);
  }

  return {
    ciphertext: encrypted.toString(),
    iv: iv ? CryptoJS.enc.Base64.stringify(iv) : undefined,
  };
}

/**
 * Decrypts ciphertext using AES with specified parameters
 */
export function decryptAES(
  ciphertext: string,
  password: string,
  mode: AESMode,
  keyLength: KeyLength,
  ivBase64?: string
): string {
  if (!password) {
    throw new Error('Password cannot be empty');
  }
  if (!ciphertext) {
    throw new Error('Ciphertext cannot be empty');
  }

  const key = deriveKey(password, keyLength);
  let decrypted: CryptoJS.lib.WordArray;

  switch (mode) {
    case 'ECB':
      decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
      });
      break;

    case 'CBC':
      if (!ivBase64) {
        throw new Error('IV is required for CBC mode');
      }
      const ivCBC = CryptoJS.enc.Base64.parse(ivBase64);
      decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
        iv: ivCBC,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      break;

    case 'CFB':
      if (!ivBase64) {
        throw new Error('IV is required for CFB mode');
      }
      const ivCFB = CryptoJS.enc.Base64.parse(ivBase64);
      decrypted = CryptoJS.AES.decrypt(ciphertext, key, {
        iv: ivCFB,
        mode: CryptoJS.mode.CFB,
        padding: CryptoJS.pad.NoPadding,
      });
      break;

    default:
      throw new Error(`Unsupported mode: ${mode}`);
  }

  const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
  
  if (!plaintext) {
    throw new Error('Decryption failed - check password and parameters');
  }

  return plaintext;
}

/**
 * Saves encrypted data to a text file
 */
export function saveToFile(data: { ciphertext: string; iv?: string; mode: AESMode; keyLength: KeyLength }): void {
  const fileContent = JSON.stringify(data, null, 2);
  const blob = new Blob([fileContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `encrypted_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Reads encrypted data from uploaded file
 */
export function readFromFile(file: File): Promise<{ ciphertext: string; iv?: string; mode: AESMode; keyLength: KeyLength }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        
        // Validate structure
        if (!data.ciphertext || !data.mode || !data.keyLength) {
          throw new Error('Invalid file format');
        }
        
        resolve(data);
      } catch (error) {
        reject(new Error('Failed to parse encrypted file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
