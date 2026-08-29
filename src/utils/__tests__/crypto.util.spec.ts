import { describe, it, expect, vi } from 'vitest';
import { encryptText, decryptText } from '../crypto.util';

// Mock the environment config to provide a 32-byte key for testing
vi.mock('../../config/env', () => ({
  env: {
    AES_ENCRYPTION_KEY: '12345678901234567890123456789012'
  }
}));

describe('Cryptography Utility (AES-256 GCM)', () => {
  const sampleData = JSON.stringify({
    hospitalName: 'Apollo Hospital',
    totalBilledAmount: 50000,
    estimatedOutOfPocket: 5000,
  });

  it('should encrypt data to a specially formatted string', () => {
    const encrypted = encryptText(sampleData);
    expect(encrypted).toBeDefined();
    expect(typeof encrypted).toBe('string');
    
    // Should be formatted as iv:authTag:encryptedData
    const parts = encrypted.split(':');
    expect(parts.length).toBe(3);
    expect(parts[0].length).toBe(24); // 12 bytes hex
    expect(parts[1].length).toBe(32); // 16 bytes hex
  });

  it('should successfully decrypt data back to original string', () => {
    const encrypted = encryptText(sampleData);
    const decrypted = decryptText(encrypted);
    
    expect(decrypted).toBe(sampleData);
  });

  it('should produce different ciphertexts for the same plaintext (due to random IV)', () => {
    const encrypted1 = encryptText(sampleData);
    const encrypted2 = encryptText(sampleData);
    
    expect(encrypted1).not.toBe(encrypted2);
  });

  it('should throw an error if the payload format is invalid', () => {
    expect(() => decryptText('invalid-format-string')).toThrow('Invalid encrypted payload format');
  });

  it('should fail to decrypt if auth tag is modified (tamper evident)', () => {
    const encrypted = encryptText(sampleData);
    const parts = encrypted.split(':');
    
    // Explicitly tamper by reversing the hex string (guarantees invalidation)
    const tamperedAuthTag = parts[1].split('').reverse().join('');
    // If it happens to be a palindrome, just change the last char to '0' (or '1' if it is '0')
    const finalTampered = tamperedAuthTag === parts[1] 
      ? tamperedAuthTag.slice(0, -1) + (tamperedAuthTag.endsWith('0') ? '1' : '0')
      : tamperedAuthTag;

    const tamperedPayload = `${parts[0]}:${finalTampered}:${parts[2]}`;
    
    // Decipher throws error when auth tag fails validation
    expect(() => decryptText(tamperedPayload)).toThrow();
  });
});
