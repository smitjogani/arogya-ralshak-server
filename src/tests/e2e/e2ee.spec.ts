import request from 'supertest';
import { describe, it, expect } from 'vitest';
import app from '../../app';
import { encryptText, decryptText } from '../../utils/crypto.util';

describe('End-to-End API Security Tests', () => {
  it('should reject a 404 route but return the error fully encrypted (E2EE Contract)', async () => {
    const res = await request(app).get('/api/v1/invalid-route');
    
    // Status should be 404
    expect(res.status).toBe(404);
    
    // The payload MUST be encrypted, it should not be raw HTML or JSON
    expect(res.body).toHaveProperty('encryptedData');
    expect(res.body.success).toBeUndefined(); // Raw properties should not exist
    
    // Decrypt the payload and verify the internal structure
    const decryptedString = decryptText(res.body.encryptedData);
    const parsedPayload = JSON.parse(decryptedString);
    
    expect(parsedPayload.success).toBe(false);
    expect(parsedPayload.message).toContain('not found');
  });

  it('should securely accept an encrypted payload, parse it, and return an encrypted error if validation fails', async () => {
    // 1. Create a dummy invalid login payload
    const rawPayload = {
      email: 'not-an-email',
      password: 'short',
    };
    
    // 2. Encrypt it on the client side
    const encryptedPayload = encryptText(JSON.stringify(rawPayload));

    // 3. Send via HTTP
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ encryptedData: encryptedPayload });

    // 4. Expect a 400 Validation Error, securely encrypted
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('encryptedData');

    // 5. Decrypt and verify validation errors exist
    const decryptedString = decryptText(res.body.encryptedData);
    const parsedPayload = JSON.parse(decryptedString);
    
    expect(parsedPayload.success).toBe(false);
    expect(parsedPayload.message).toBe('Validation failed');
    expect(parsedPayload.errors).toBeInstanceOf(Array);
  });
});
