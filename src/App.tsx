import { useState, useRef } from 'react';
import './App.css';
import { 
  encryptAES, 
  decryptAES, 
  saveToFile, 
  readFromFile,
  type AESMode,
  type KeyLength,
  type Operation 
} from './crypto';

function App() {
  const [operation, setOperation] = useState<Operation>('encrypt');
  const [mode, setMode] = useState<AESMode>('CBC');
  const [keyLength, setKeyLength] = useState<KeyLength>(128);
  const [inputText, setInputText] = useState('');
  const [password, setPassword] = useState('');
  const [outputText, setOutputText] = useState('');
  const [iv, setIv] = useState<string>('');
  const [error, setError] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProcess = () => {
    setError('');
    setOutputText('');

    try {
      if (operation === 'encrypt') {
        const result = encryptAES(inputText, password, mode, keyLength);
        setOutputText(result.ciphertext);
        setIv(result.iv || '');
      } else {
        const plaintext = decryptAES(inputText, password, mode, keyLength, iv || undefined);
        setOutputText(plaintext);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleSaveToFile = () => {
    if (!outputText) {
      setError('No encrypted data to save');
      return;
    }

    try {
      saveToFile({
        ciphertext: outputText,
        iv: iv || undefined,
        mode,
        keyLength,
      });
      setError('');
    } catch (err) {
      setError('Failed to save file');
    }
  };

  const handleLoadFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await readFromFile(file);
      setInputText(data.ciphertext);
      setIv(data.iv || '');
      setMode(data.mode);
      setKeyLength(data.keyLength);
      setOperation('decrypt');
      setError('');
      setOutputText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file');
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setPassword('');
    setIv('');
    setError('');
  };

  return (
    <div className="app">
      <header className="header">
        <h1>AES Encryption/Decryption Tool</h1>
        <p>Secure text encryption using Advanced Encryption Standard</p>
      </header>

      <div className="container">
        <div className="controls-panel">
          <div className="control-group">
            <label>Operation</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  value="encrypt"
                  checked={operation === 'encrypt'}
                  onChange={(e) => setOperation(e.target.value as Operation)}
                />
                <span>Encrypt</span>
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  value="decrypt"
                  checked={operation === 'decrypt'}
                  onChange={(e) => setOperation(e.target.value as Operation)}
                />
                <span>Decrypt</span>
              </label>
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="mode">Mode</label>
            <select
              id="mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as AESMode)}
              className="select"
            >
              <option value="ECB">ECB (Electronic Codebook)</option>
              <option value="CBC">CBC (Cipher Block Chaining)</option>
              <option value="CFB">CFB (Cipher Feedback)</option>
            </select>
            <small className="hint">
              {mode === 'ECB' && 'WARNING: ECB is not recommended for production use'}
              {mode === 'CBC' && 'Secure mode with IV'}
              {mode === 'CFB' && 'Secure stream cipher mode'}
            </small>
          </div>

          <div className="control-group">
            <label htmlFor="keyLength">Key Length</label>
            <select
              id="keyLength"
              value={keyLength}
              onChange={(e) => setKeyLength(Number(e.target.value) as KeyLength)}
              className="select"
            >
              <option value={128}>128-bit (10 rounds)</option>
              <option value={192}>192-bit (12 rounds)</option>
              <option value={256}>256-bit (14 rounds)</option>
            </select>
            <small className="hint">Higher = more secure, slightly slower</small>
          </div>

          <div className="control-group">
            <label htmlFor="password">Password / Secret Key</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your secret key"
              className="input"
            />
            <small className="hint">Used to derive AES key via PBKDF2</small>
          </div>

          {operation === 'decrypt' && (mode === 'CBC' || mode === 'CFB') && (
            <div className="control-group">
              <label htmlFor="iv">Initialization Vector (IV)</label>
              <input
                id="iv"
                type="text"
                value={iv}
                onChange={(e) => setIv(e.target.value)}
                placeholder="IV (automatically loaded from file)"
                className="input"
                readOnly={false}
              />
              <small className="hint">Required for CBC/CFB decryption</small>
            </div>
          )}

          <div className="button-row">
            <button onClick={handleProcess} className="btn btn-primary">
              {operation === 'encrypt' ? 'Encrypt' : 'Decrypt'}
            </button>
            <button onClick={handleClear} className="btn btn-secondary">
              Clear
            </button>
          </div>

          <div className="file-controls">
            <button
              onClick={handleSaveToFile}
              disabled={!outputText || operation !== 'encrypt'}
              className="btn btn-success"
            >
              Save Encrypted File
            </button>
            <label className="btn btn-info file-label">
              Load Encrypted File
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleLoadFromFile}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <button 
            onClick={() => setShowInfo(!showInfo)} 
            className="btn btn-link"
          >
            {showInfo ? 'Hide' : 'Show'} How AES Works
          </button>

          {showInfo && <InfoPanel />}
        </div>

        <div className="text-panel">
          <div className="text-group">
            <label htmlFor="input">
              {operation === 'encrypt' ? 'Plaintext Input' : 'Ciphertext Input'}
            </label>
            <textarea
              id="input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                operation === 'encrypt'
                  ? 'Enter text to encrypt...'
                  : 'Paste ciphertext or load from file...'
              }
              className="textarea"
              rows={8}
            />
          </div>

          {error && (
            <div className="alert alert-error">
              WARNING: {error}
            </div>
          )}

          <div className="text-group">
            <label htmlFor="output">
              {operation === 'encrypt' ? 'Encrypted Output' : 'Decrypted Output'}
            </label>
            <textarea
              id="output"
              value={outputText}
              readOnly
              placeholder="Result will appear here..."
              className="textarea"
              rows={8}
            />
          </div>

          {operation === 'encrypt' && iv && (
            <div className="info-box">
              <strong>Generated IV:</strong>
              <code>{iv}</code>
              <small>This IV is saved in the encrypted file</small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoPanel() {
  return (
    <div className="info-panel">
      <h3>AES Overview</h3>
      
      <section>
        <h4>What is AES?</h4>
        <p>
          <strong>Advanced Encryption Standard (AES)</strong> is a symmetric block cipher 
          adopted by the U.S. government in 2001. It encrypts data in fixed blocks of 128 bits 
          using keys of 128, 192, or 256 bits.
        </p>
      </section>

      <section>
        <h4>Key Lengths & Security</h4>
        <ul>
          <li><strong>AES-128:</strong> 10 rounds, sufficient for most uses</li>
          <li><strong>AES-192:</strong> 12 rounds, higher security margin</li>
          <li><strong>AES-256:</strong> 14 rounds, maximum security (government/military)</li>
        </ul>
        <p>More rounds = stronger security against cryptanalysis, slightly slower performance.</p>
      </section>

      <section>
        <h4>Block Cipher Modes</h4>
        <ul>
          <li>
            <strong>ECB (Electronic Codebook):</strong> Each block encrypted independently. 
            ⚠️ <em>Not recommended</em> - identical plaintext blocks produce identical ciphertext.
          </li>
          <li>
            <strong>CBC (Cipher Block Chaining):</strong> Each block XORed with previous ciphertext. 
            Requires IV. Most common secure mode.
          </li>
          <li>
            <strong>CFB (Cipher Feedback):</strong> Turns block cipher into stream cipher. 
            Requires IV. Good for streaming data.
          </li>
        </ul>
      </section>

      <section>
        <h4>Key Derivation</h4>
        <p>
          This application uses <strong>PBKDF2</strong> to derive a fixed-length AES key from 
          your password. This ensures the key matches the selected length (128/192/256 bits) 
          and adds security through key stretching (1000 iterations).
        </p>
      </section>
    </div>
  );
}

export default App;
