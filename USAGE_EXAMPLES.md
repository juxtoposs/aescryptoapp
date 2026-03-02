# 📝 Usage Examples

## Example 1: Basic Encryption/Decryption

### Encrypting a Message

1. **Input Settings:**
   - Operation: `Encrypt`
   - Mode: `CBC`
   - Key Length: `256-bit`
   - Password: `MySecurePassword123!`
   - Plaintext: `This is a secret message that needs encryption.`

2. **Click "🔒 Encrypt"**

3. **Output:**
   ```
   Ciphertext: U2FsdGVkX1+8xKLM...
   Generated IV: 3q2+7w5H9K2L...
   ```

### Decrypting the Message

1. **Input Settings:**
   - Operation: `Decrypt`
   - Mode: `CBC`
   - Key Length: `256-bit`
   - Password: `MySecurePassword123!`
   - Ciphertext: (paste from above)
   - IV: `3q2+7w5H9K2L...` (paste from above)

2. **Click "🔓 Decrypt"**

3. **Output:**
   ```
   This is a secret message that needs encryption.
   ```

---

## Example 2: File-Based Encryption

### Save Encrypted Data

1. Encrypt your message (as in Example 1)
2. Click **"💾 Save Encrypted File"**
3. A file named `encrypted_[timestamp].txt` downloads with content:
   ```json
   {
     "ciphertext": "U2FsdGVkX1+8xKLM...",
     "iv": "3q2+7w5H9K2L...",
     "mode": "CBC",
     "keyLength": 256
   }
   ```

### Load and Decrypt

1. Click **"📂 Load Encrypted File"**
2. Select the `.txt` file you just saved
3. All parameters auto-fill (mode, key length, IV, ciphertext)
4. Enter the password: `MySecurePassword123!`
5. Click **"🔓 Decrypt"**
6. Original message appears in output

---

## Example 3: Different Modes Comparison

### ECB Mode (Not Recommended)
```
Plaintext: "HELLO HELLO HELLO"
Password: "test123"
Mode: ECB
Key Length: 128-bit

Result: Identical plaintext blocks produce identical ciphertext blocks
⚠️ Pattern is visible - NOT secure for real data
```

### CBC Mode (Recommended)
```
Plaintext: "HELLO HELLO HELLO"
Password: "test123"
Mode: CBC
Key Length: 128-bit

Result: Each block looks random, no patterns visible
✅ Secure - different ciphertext even for identical blocks
```

### CFB Mode (Stream Cipher)
```
Plaintext: "Short"
Password: "test123"
Mode: CFB
Key Length: 128-bit

Result: Works well with data smaller than block size
✅ Good for streaming data
```

---

## Example 4: Key Length Impact

Same plaintext and password, different key lengths:

### AES-128
```
Password: "SecurePass"
Key Length: 128-bit
Encryption Time: ~2ms
Security: High (sufficient for most uses)
```

### AES-256
```
Password: "SecurePass"
Key Length: 256-bit
Encryption Time: ~3ms
Security: Maximum (government/military grade)
```

**Note:** Performance difference is negligible for small texts. Choose 256-bit for maximum security.

---

## Example 5: Error Handling

### Wrong Password
```
Encrypted with: "CorrectPassword"
Decrypted with: "WrongPassword"

Result: ⚠️ "Decryption failed - check password and parameters"
```

### Missing IV
```
Mode: CBC
IV field: (empty)

Result: ⚠️ "IV is required for CBC mode"
```

### Wrong Mode
```
Encrypted with: CBC
Decrypted with: ECB

Result: ⚠️ Garbage output or decryption error
```

---

## Example 6: Real-World Use Case

### Encrypting Sensitive Notes

**Scenario:** You want to store sensitive information (API keys, passwords, notes) in a text file on your computer.

**Steps:**
1. Write your sensitive data in the plaintext area:
   ```
   API Keys:
   - Stripe: sk_live_xxxxx
   - AWS: AKIAIOSFODNN7EXAMPLE
   
   Database Password: MyDB_Pass_2024!
   ```

2. Choose strong encryption:
   - Mode: `CBC`
   - Key Length: `256-bit`
   - Password: `MyMasterPassword_VeryStrong123!`

3. Click "🔒 Encrypt"

4. Save to file: `my_secrets_encrypted.txt`

5. **Delete the plaintext version!**

6. To access later:
   - Load the encrypted file
   - Enter your master password
   - View your secrets
   - Close the tab when done (data stays in browser memory only)

---

## Example 7: Sharing Encrypted Messages

**Scenario:** Send encrypted message to a colleague

**Sender:**
1. Encrypt message with CBC, 256-bit
2. Share the encrypted file via email/Slack/etc
3. Share the password through a **different channel** (phone call, Signal, etc)
4. Share the IV (can be in the file or separately)

**Receiver:**
1. Download encrypted file
2. Load into app
3. Enter password received separately
4. Decrypt and read

**Security Tip:** Never send password and encrypted file through the same channel!

---

## Common Mistakes to Avoid

❌ **Using ECB for real data** → Always use CBC or CFB

❌ **Weak passwords** → Use at least 12 characters with mix of types

❌ **Reusing IVs** → App auto-generates new IV each time (good!)

❌ **Losing the password** → No recovery possible! Store password securely

❌ **Wrong parameters** → Must use same mode/key-length for decrypt as encrypt

---

## Security Best Practices

✅ Use **CBC or CFB** mode, never ECB in production

✅ Use **256-bit keys** for maximum security

✅ Use **strong, unique passwords** (20+ random characters)

✅ Never reuse passwords across different encrypted files

✅ Store passwords in a password manager (1Password, Bitwarden, etc)

✅ For sharing: Send encrypted file and password through **different channels**

✅ Delete plaintext after encryption if storing sensitive data

✅ Remember: This is **client-side only** - no data sent to servers
