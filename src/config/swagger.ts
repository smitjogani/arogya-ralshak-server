import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';
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
All standard JSON requests (Auth, Policy) and ALL responses from the server are encrypted using AES-256-GCM. 
Instead of sending standard JSON bodies, you must send and expect this exact schema:
\`\`\`json
{
  "encryptedData": "ivHex:authTagHex:encryptedPayload"
}
\`\`\`
1. **Requests**: Stringify your JSON payload, encrypt it with the shared AES key, and send it as \`encryptedData\`.
2. **Responses**: The server will respond with \`{ encryptedData }\`. Decrypt it with the AES key and parse the JSON.

### Multipart Image Upload
The \`/analysis/process-document\` endpoint is the ONLY exception for requests. It uses \`multipart/form-data\` to accept the raw image. However, its *response* will still be an encrypted \`{ encryptedData }\` string.
      `,
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api/v1`,
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        EncryptedPayload: {
          type: 'object',
          required: ['encryptedData'],
          properties: {
            encryptedData: {
              type: 'string',
              description: 'The AES-256-GCM encrypted string',
            },
          },
        },
      },
    },
    paths: {
      '/auth/register': {
        post: {
          summary: 'Register a new user',
          description: 'Requires an EncryptedPayload containing email, password, and name.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/EncryptedPayload' } } },
          },
          responses: {
            '201': { description: 'Encrypted JSON Response', content: { 'application/json': { schema: { $ref: '#/components/schemas/EncryptedPayload' } } } },
          },
        },
      },
      '/auth/login': {
        post: {
          summary: 'Login user',
          description: 'Requires an EncryptedPayload containing email and password.',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/EncryptedPayload' } } },
          },
          responses: {
            '200': { description: 'Encrypted JSON Response containing JWT', content: { 'application/json': { schema: { $ref: '#/components/schemas/EncryptedPayload' } } } },
          },
        },
      },
      '/analysis/process-document': {
        post: {
          summary: 'Process Medical Bill (OCR + AI)',
          description: 'Upload an image and policy ID to run the AI extraction pipeline.',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    image: { type: 'string', format: 'binary', description: 'Medical document image' },
                    policyId: { type: 'string', description: 'UUID of the policy' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Encrypted JSON Response with Analysis Snapshot', content: { 'application/json': { schema: { $ref: '#/components/schemas/EncryptedPayload' } } } },
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
};
