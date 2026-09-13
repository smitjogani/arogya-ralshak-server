import crypto from 'crypto';
import fetch from 'node-fetch';
import fs from 'fs';

// Replace with local env variables
const AES_KEY = 'vK8ZqR2mX7wY9pL3jH5bN6tV4cT1fM0x';
const BASE_URL = 'https://arogya-ralshak-server.vercel.app/api/v1';

const encryptText = (text: string): string => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(AES_KEY, 'utf-8'), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
};

const decryptText = (encryptedPayload: string): string => {
  const parts = encryptedPayload.split(':');
  const [ivHex, authTagHex, encryptedData] = parts;
  const decipher = crypto.createDecipheriv('aes-256-gcm', Buffer.from(AES_KEY, 'utf-8'), Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

const makeEncryptedRequest = async (path: string, payload: any, token?: string) => {
  const encryptedData = encryptText(JSON.stringify(payload));
  const headers: any = {
    'Content-Type': 'application/json',
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ encryptedData })
  });
  const textRes = await response.text();
  let resJson: any;
  try {
    resJson = JSON.parse(textRes);
  } catch(e) {
    console.error('Non-JSON response:', textRes.substring(0, 200));
    return { status: response.status, data: textRes.substring(0, 200) };
  }
  
  if (resJson.encryptedData) {
    try {
      const decrypted = decryptText(resJson.encryptedData);
      return { status: response.status, data: JSON.parse(decrypted) };
    } catch(e) {
      return { status: response.status, data: 'Decryption failed for: ' + resJson.encryptedData };
    }
  }
  return { status: response.status, data: resJson };
};

const testApis = async () => {
  console.log('Testing APIs on', BASE_URL);

  const email = `test${Date.now()}@example.com`;
  
  console.log('\n--- 1. Register User ---');
  const registerRes = await makeEncryptedRequest('/auth/register', {
    email,
    password: 'SecurePassword123!',
    fullName: 'Test User'
  });
  console.log('Register Response:', registerRes);

  let token = '';
  const loginRes = await makeEncryptedRequest('/auth/login', {
    email,
    password: 'SecurePassword123!'
  });
  console.log('Login Response:', loginRes);
  if (loginRes.data && loginRes.data.data && loginRes.data.data.token) {
    token = loginRes.data.data.token;
  }

  console.log('\n--- 2. Create Policy ---');
  let policyId = '';
  if (token) {
    const policyRes = await makeEncryptedRequest('/policies', {
      providerName: 'Star Health',
      policyNumber: 'POL-' + Date.now(),
      sumInsured: 500000,
      roomRentLimit: 5000,
      coPayPercentage: 10,
      deductible: 10000
    }, token);
    console.log('Create Policy Response:', policyRes);
    if (policyRes.data && policyRes.data.data && policyRes.data.data.id) {
      policyId = policyRes.data.data.id;
    }
  }

  console.log('\n--- 3. Sync Analysis ---');
  if (token && policyId) {
    const analysisRes = await makeEncryptedRequest('/analyses/sync', {
      policyId,
      hospitalName: 'Apollo Hospital',
      totalBilledAmount: 150000,
      estimatedInsuranceCover: 125000,
      estimatedOutOfPocket: 25000,
      jsonSummary: { summary: "Test summary" },
      lineItems: [
        { description: 'Room', amount: 50000, category: 'Room', isCovered: true }
      ]
    }, token);
    console.log('Sync Analysis Response:', analysisRes);
  }

  console.log('\nAll tests complete.');
};

testApis();
