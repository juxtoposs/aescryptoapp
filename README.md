#  AES Encryption/Decryption Web Application

A modern, user-friendly web application for encrypting and decrypting text using the Advanced Encryption Standard (AES) algorithm. Built with React, TypeScript, and CryptoJS.



##  Features

-  **Multiple AES Key Lengths**: 128-bit, 192-bit, and 256-bit
-  **Three Block Cipher Modes**: ECB, CBC, and CFB
-  **Encrypt & Decrypt Operations**
-  **File Export/Import**: Save encrypted data to `.txt` files and load them back
-  **Secure Key Derivation**: Uses PBKDF2 to derive keys from passwords
-  **Automatic IV Generation**: For CBC and CFB modes
-  **Beautiful Modern UI**: Responsive design with gradient backgrounds
-  **Educational Info Panel**: Built-in explanations of how AES works

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/aes-crypto-app.git
cd aes-crypto-app

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## 📖 How to Use

### Encrypting Text

1. Select **"Encrypt"** operation
2. Choose a **mode** (CBC recommended)
3. Select **key length** (128, 192, or 256 bits)
4. Enter your **plaintext** in the input area
5. Enter a **password/secret key**
6. Click **" Encrypt"**
7. Copy the encrypted output or click **" Save Encrypted File"**

### Decrypting Text

#### Option A: Manual Decryption
1. Select **"Decrypt"** operation
2. Paste the **ciphertext** in the input area
3. Enter the **same password** used for encryption
4. If using CBC/CFB, paste the **IV** (initialization vector)
5. Select the **same mode and key length** used for encryption
6. Click **" Decrypt"**

#### Option B: Load from File
1. Click **"Load Encrypted File"**
2. Select the `.txt` file saved earlier
3. All parameters (mode, key length, IV) are automatically loaded
4. Enter the **password**
5. Click **"Decrypt"**

## 🔬 Technical Details

### What is AES?

**Advanced Encryption Standard (AES)** is a symmetric block cipher standardized by NIST in 2001. It's the most widely used encryption algorithm in the world.

**Key Properties:**
- **Block size**: 128 bits (16 bytes) - fixed
- **Key sizes**: 128, 192, or 256 bits
- **Algorithm**: Substitution-Permutation Network (SPN)
- **Security**: No practical attacks known for properly implemented AES

### AES Key Lengths Explained

| Key Length | Rounds | Security Level | Use Case |
|------------|--------|----------------|----------|
| **128-bit** | 10 | High | Standard applications, sufficient for most uses |
| **192-bit** | 12 | Very High | Higher security margin, enterprise |
| **256-bit** | 14 | Maximum | Government, military, maximum paranoia |

**More rounds = more security** against cryptanalysis, but slightly slower performance. The difference in speed is negligible for most applications.

### Block Cipher Modes

#### ECB (Electronic Codebook) 
- **How it works**: Each 128-bit block encrypted independently with the same key
- **Pros**: Simple, parallelizable
- **Cons**: **NOT SECURE** - identical plaintext blocks produce identical ciphertext blocks, revealing patterns
- **When to use**: Never for real data (only for testing/education)

```
Plaintext:  [Block 1] [Block 2] [Block 3]
               ↓          ↓          ↓
            Encrypt    Encrypt    Encrypt
               ↓          ↓          ↓
Ciphertext: [Block 1] [Block 2] [Block 3]
```

#### CBC (Cipher Block Chaining) 
- **How it works**: Each block XORed with previous ciphertext block before encryption
- **Requires**: Initialization Vector (IV) - random 128-bit value
- **Pros**: Secure, widely used, good for file encryption
- **Cons**: Sequential (can't parallelize encryption)
- **When to use**: File encryption, secure messaging (most common choice)

```
IV ⊕ [Block 1] → Encrypt → [Cipher 1]
        ↓
[Cipher 1] ⊕ [Block 2] → Encrypt → [Cipher 2]
        ↓
[Cipher 2] ⊕ [Block 3] → Encrypt → [Cipher 3]
```

#### CFB (Cipher Feedback) 
- **How it works**: Turns block cipher into a stream cipher
- **Requires**: Initialization Vector (IV)
- **Pros**: Can encrypt data smaller than block size, self-synchronizing
- **Cons**: Errors propagate
- **When to use**: Streaming data, network protocols

```
Encrypt(IV) ⊕ [Block 1] → [Cipher 1]
     ↓
Encrypt([Cipher 1]) ⊕ [Block 2] → [Cipher 2]
```

### Key Derivation

This application uses **PBKDF2** (Password-Based Key Derivation Function 2) to convert user passwords into AES keys:

```typescript
PBKDF2(password, salt, iterations=1000) → AES key
```

**Why PBKDF2?**
- Converts arbitrary-length passwords to fixed-length keys (128/192/256 bits)
- **Key stretching**: 1000 iterations slow down brute-force attacks
- Deterministic: same password always produces same key
- Industry standard (NIST approved)

**Salt**: Fixed salt `"aes-crypto-salt-2024"` ensures consistent key derivation. In production, use random salts per user.

### File Format

Encrypted files are saved as JSON:

```json
{
  "ciphertext": "U2FsdGVkX1+...",
  "iv": "base64-encoded-iv",
  "mode": "CBC",
  "keyLength": 256
}
```

This ensures all necessary parameters are stored for successful decryption.

## Security Considerations

### Good Practices in This App
- Uses PBKDF2 for key derivation (1000 iterations)
- Generates random IVs for each encryption (CBC/CFB)
- Supports strong 256-bit keys
- Recommends CBC over ECB
- Validates all inputs

###  Important Notes
- **Never reuse IVs** with the same key in CBC/CFB modes
- **Use strong passwords**: Long, random passwords = stronger security
- **ECB mode** is included for educational purposes only - don't use for real data
- This is a **client-side** application - keys never leave your browser
- For production: use authenticated encryption (GCM mode) to detect tampering

### Password Strength Guidelines
- **Minimum**: 12 characters
- **Good**: Mix of uppercase, lowercase, numbers, symbols
- **Better**: Use a passphrase (e.g., "correct-horse-battery-staple")
- **Best**: Use a password manager to generate random 20+ character passwords

## 🏗️ Project Structure

```
aes-crypto-app/
├── src/
│   ├── App.tsx           # Main React component with UI
│   ├── App.css           # Styling
│   ├── crypto.ts         # AES encryption/decryption logic
│   ├── main.tsx          # React entry point
│   └── index.css         # Global styles
├── index.html            # HTML template
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite config
└── README.md            # This file
```

## Testing

### Manual Test Cases

1. **Encrypt → Decrypt Cycle**
   - Encrypt text with password "test123"
   - Decrypt using same password
   - Output should match original plaintext

2. **File Save/Load**
   - Encrypt text, save to file
   - Load file, enter password
   - Should decrypt correctly

3. **Wrong Password**
   - Encrypt with password "test123"
   - Try decrypting with "test456"
   - Should show error

4. **Mode Switching**
   - Encrypt with CBC
   - Try decrypting with ECB
   - Should fail (different modes)

## Dependencies

- **React 18.2** - UI framework
- **TypeScript 5.3** - Type safety
- **Vite 5.0** - Build tool & dev server
- **CryptoJS 4.2** - Cryptography library (AES, PBKDF2)

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Note**: This project requires at least 3 commits for the assignment.

## 📄 License

MIT License - feel free to use this project for learning and education.
