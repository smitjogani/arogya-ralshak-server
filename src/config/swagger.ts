import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application, Request, Response } from 'express';
import { env } from './env';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Aarogya-Rakshak Secure API',
      version: '1.0.0',
      description: `
# 🔒 E2EE Integration Guide (MUST READ)
To ensure maximum privacy for medical and financial data, this API utilizes **Application-Layer Payload Encryption**.

### Standard Endpoints
All standard JSON requests (Auth, Policy, Analysis) and ALL responses from the server are encrypted using AES-256-GCM. 
Instead of sending standard JSON bodies, you must send and expect this exact schema:
\`\`\`json
{
  "encryptedData": "ivHex:authTagHex:encryptedPayload"
}
\`\`\`
1. **Requests**: Stringify your JSON payload, encrypt it with the shared AES key, and send it as \`encryptedData\`.
2. **Responses**: The server will respond with \`{ encryptedData }\`. Decrypt it with the AES key and parse the JSON.

### Multipart Image Upload
The \`/analyses/process-document\` endpoint is the ONLY exception for request bodies. It uses \`multipart/form-data\` to accept the raw document image and policy ID. However, its *response* will still be an encrypted \`{ encryptedData }\` string.
      `,
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: 'Local Development Server',
      },
    ],
    tags: [
      { name: 'Auth', description: 'User registration and authentication' },
      { name: 'Policy', description: 'Health insurance policy management' },
      { name: 'Analysis', description: 'Medical bill OCR, AI analysis & snapshot sync' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Pass JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        EncryptedPayload: {
          type: 'object',
          required: ['encryptedData'],
          properties: {
            encryptedData: {
              type: 'string',
              description: 'AES-256-GCM encrypted payload formatted as ivHex:authTagHex:ciphertextHex',
              example: 'e2a4b8...:f9c1d0...:7b3a9e...',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'fullName'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', minLength: 8, example: 'SecurePassword123!' },
            fullName: { type: 'string', minLength: 2, example: 'Jane Doe' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            password: { type: 'string', example: 'SecurePassword123!' },
          },
        },
        AuthResponseData: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                email: { type: 'string' },
                fullName: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
            token: { type: 'string', description: 'JWT Access Token' },
          },
        },
        CreatePolicyRequest: {
          type: 'object',
          required: ['providerName', 'policyNumber', 'sumInsured', 'roomRentLimit', 'coPayPercentage', 'deductible'],
          properties: {
            providerName: { type: 'string', example: 'Star Health' },
            policyNumber: { type: 'string', example: 'POL-123456789' },
            sumInsured: { type: 'number', minimum: 0, example: 500000 },
            roomRentLimit: { type: 'number', minimum: 0, example: 5000 },
            coPayPercentage: { type: 'number', minimum: 0, maximum: 100, example: 10 },
            deductible: { type: 'number', minimum: 0, example: 10000 },
            validUntil: { type: 'string', format: 'date-time', example: '2027-12-31T23:59:59.000Z' },
          },
        },
        UpdatePolicyRequest: {
          type: 'object',
          properties: {
            providerName: { type: 'string', example: 'Star Health' },
            sumInsured: { type: 'number', minimum: 0, example: 600000 },
            roomRentLimit: { type: 'number', minimum: 0, example: 6000 },
            coPayPercentage: { type: 'number', minimum: 0, maximum: 100, example: 10 },
            deductible: { type: 'number', minimum: 0, example: 5000 },
            validUntil: { type: 'string', format: 'date-time', example: '2028-12-31T23:59:59.000Z' },
          },
        },
        PolicyResponseData: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            providerName: { type: 'string' },
            policyNumber: { type: 'string' },
            sumInsured: { type: 'number' },
            roomRentLimit: { type: 'number' },
            coPayPercentage: { type: 'number' },
            deductible: { type: 'number' },
            validUntil: { type: 'string', format: 'date-time', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateAnalysisRequest: {
          type: 'object',
          required: ['policyId', 'hospitalName', 'totalBilledAmount', 'estimatedInsuranceCover', 'estimatedOutOfPocket', 'jsonSummary', 'lineItems'],
          properties: {
            policyId: { type: 'string', format: 'uuid' },
            hospitalName: { type: 'string', example: 'Apollo Hospital' },
            totalBilledAmount: { type: 'number', minimum: 0, example: 150000 },
            estimatedInsuranceCover: { type: 'number', minimum: 0, example: 125000 },
            estimatedOutOfPocket: { type: 'number', minimum: 0, example: 25000 },
            jsonSummary: { type: 'object', description: 'Raw JSON extracted from bill' },
            lineItems: {
              type: 'array',
              items: {
                type: 'object',
                required: ['description', 'amount', 'category', 'isCovered'],
                properties: {
                  description: { type: 'string', example: 'ICU Charges' },
                  amount: { type: 'number', minimum: 0, example: 40000 },
                  category: { type: 'string', example: 'Room & Board' },
                  isCovered: { type: 'boolean', example: true },
                  reasonIfNotCovered: { type: 'string', example: 'Exceeds room rent cappings' },
                },
              },
            },
            redFlags: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  severity: { type: 'string', example: 'HIGH' },
                  description: { type: 'string', example: 'Non-payable administrative fee detected' },
                },
              },
            },
            suggestedQuestions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  questionText: { type: 'string', example: 'Why is PPE kit non-payable?' },
                  context: { type: 'string', example: 'Section 4B of Policy Terms' },
                },
              },
            },
          },
        },
        AnalysisResponseData: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string', format: 'uuid' },
            policyId: { type: 'string', format: 'uuid' },
            hospitalName: { type: 'string' },
            totalBilledAmount: { type: 'number' },
            estimatedInsuranceCover: { type: 'number' },
            estimatedOutOfPocket: { type: 'number' },
            jsonSummary: { type: 'object' },
            lineItems: { type: 'array', items: { type: 'object' } },
            redFlags: { type: 'array', items: { type: 'object' } },
            suggestedQuestions: { type: 'array', items: { type: 'object' } },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        ApiResponseError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Resource not found' },
          },
        },
      },
    },
    paths: {
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new user',
          description: 'Requires an EncryptedPayload containing email, password, and fullName.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/EncryptedPayload' } } },
          },
          responses: {
            '201': {
              description: 'Encrypted JSON Response containing user data',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/EncryptedPayload' } } },
            },
            '400': { description: 'Bad Request / Validation Error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponseError' } } } },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login user',
          description: 'Requires an EncryptedPayload containing email and password.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/EncryptedPayload' } } },
          },
          responses: {
            '200': {
              description: 'Encrypted JSON Response containing user profile and JWT token',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/EncryptedPayload' } } },
            },
            '401': { description: 'Unauthorized / Invalid Credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponseError' } } } },
          },
        },
      },
      '/policies': {
        post: {
          tags: ['Policy'],
          summary: 'Create health insurance policy',
          description: 'Creates a new health insurance policy for the authenticated user.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/EncryptedPayload' } } },
          },
          responses: {
            '201': {
              description: 'Encrypted JSON Response containing created policy object',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/EncryptedPayload' } } },
            },
            '401': { description: 'Unauthorized' },
          },
        },
        get: {
          tags: ['Policy'],
          summary: 'Get all insurance policies',
          description: 'Retrieves all health insurance policies belonging to the authenticated user.',
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'Encrypted JSON Response containing list of policies',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/EncryptedPayload' } } },
            },
            '401': { description: 'Unauthorized' },
          },
        },
      },
      '/policies/{id}': {
        get: {
          tags: ['Policy'],
          summary: 'Get policy by ID',
          description: 'Retrieves a single health policy by UUID.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Policy UUID',
            },
          ],
          responses: {
            '200': {
              description: 'Encrypted JSON Response containing policy details',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/EncryptedPayload' } } },
            },
            '404': { description: 'Policy not found' },
          },
        },
        patch: {
          tags: ['Policy'],
          summary: 'Update policy by ID',
          description: 'Updates specific fields of an existing health policy.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Policy UUID',
            },
          ],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/EncryptedPayload' } } },
          },
          responses: {
            '200': {
              description: 'Encrypted JSON Response containing updated policy details',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/EncryptedPayload' } } },
            },
            '404': { description: 'Policy not found' },
          },
        },
        delete: {
          tags: ['Policy'],
          summary: 'Delete policy by ID',
          description: 'Deletes a health policy by UUID.',
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'Policy UUID',
            },
          ],
          responses: {
            '204': { description: 'Policy successfully deleted' },
            '404': { description: 'Policy not found' },
          },
        },
      },
      '/analyses/sync': {
        post: {
          tags: ['Analysis'],
          summary: 'Sync analysis snapshot',
          description: 'Saves an emergency calculation snapshot for a policy.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/EncryptedPayload' } } },
          },
          responses: {
            '201': {
              description: 'Encrypted JSON Response containing created analysis snapshot',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/EncryptedPayload' } } },
            },
          },
        },
      },
      '/analyses/process-document': {
        post: {
          tags: ['Analysis'],
          summary: 'Process Medical Bill (OCR + AI)',
          description: 'Upload a document image and policy ID to run Vision OCR + Gemini AI analysis.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  required: ['image', 'policyId'],
                  properties: {
                    image: { type: 'string', format: 'binary', description: 'Medical document image file' },
                    policyId: { type: 'string', format: 'uuid', description: 'UUID of the policy' },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Encrypted JSON Response containing Analysis Snapshot',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/EncryptedPayload' } } },
            },
            '400': { description: 'Missing image or invalid policy ID' },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Application) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs-json', (_req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};
