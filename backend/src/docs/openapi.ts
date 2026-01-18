import { OpenAPIV3 } from 'openapi-types';
import { config } from '../config';

export const openApiSpec: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'SubsFlow API',
    description: 'Advanced Subscription Management Platform API',
    version: '1.0.0',
    contact: {
      name: 'SubsFlow Support',
      email: 'support@subsflow.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: config.app.url || 'http://localhost:5000',
      description: 'API Server',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication endpoints' },
    { name: 'Users', description: 'User management (admin)' },
    { name: 'Plans', description: 'Subscription plans' },
    { name: 'Subscriptions', description: 'User subscriptions' },
    { name: 'Billing', description: 'Stripe billing operations' },
    { name: 'Content', description: 'Content access' },
    { name: 'Notifications', description: 'In-app notifications' },
    { name: 'Analytics', description: 'Analytics & reporting (admin)' },
    { name: 'Health', description: 'Health checks' },
  ],
  paths: {
    // Auth
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterInput' },
            },
          },
        },
        responses: {
          '201': { description: 'User registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '409': { description: 'Email already exists' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginInput' },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } },
          '401': { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'User profile', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
        },
      },
    },
    // Plans
    '/api/plans': {
      get: {
        tags: ['Plans'],
        summary: 'List all plans',
        parameters: [
          { name: 'includeInactive', in: 'query', schema: { type: 'boolean' } },
        ],
        responses: {
          '200': { description: 'Plans list', content: { 'application/json': { schema: { $ref: '#/components/schemas/PlansList' } } } },
        },
      },
    },
    // Subscriptions
    '/api/subscriptions/me': {
      get: {
        tags: ['Subscriptions'],
        summary: 'Get current user subscription',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Subscription details' },
        },
      },
    },
    // Billing
    '/api/billing/checkout-session': {
      post: {
        tags: ['Billing'],
        summary: 'Create Stripe checkout session',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CheckoutInput' },
            },
          },
        },
        responses: {
          '200': { description: 'Checkout session URL' },
        },
      },
    },
    // Content
    '/api/content': {
      get: {
        tags: ['Content'],
        summary: 'List published content',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Content list' },
        },
      },
    },
    '/api/content/{contentId}': {
      get: {
        tags: ['Content'],
        summary: 'Get content (tier-gated)',
        parameters: [
          { name: 'contentId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Content details' },
          '403': { description: 'Tier upgrade required' },
        },
      },
    },
    // Notifications
    '/api/notifications': {
      get: {
        tags: ['Notifications'],
        summary: 'Get user notifications',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Notifications list' },
        },
      },
    },
    // Analytics (admin)
    '/api/analytics/dashboard': {
      get: {
        tags: ['Analytics'],
        summary: 'Get dashboard metrics (admin)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'period', in: 'query', schema: { type: 'string', enum: ['7d', '30d', '90d', 'ytd'] } },
        ],
        responses: {
          '200': { description: 'Dashboard metrics' },
        },
      },
    },
    // Health
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Basic health check',
        responses: {
          '200': { description: 'Healthy' },
        },
      },
    },
    '/api/health/ready': {
      get: {
        tags: ['Health'],
        summary: 'Readiness check (includes dependencies)',
        responses: {
          '200': { description: 'Ready' },
          '503': { description: 'Not ready' },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      RegisterInput: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          name: { type: 'string' },
          phone: { type: 'string' },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
              accessToken: { type: 'string' },
              refreshToken: { type: 'string' },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          email: { type: 'string' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['subscriber', 'content_manager', 'admin'] },
          status: { type: 'string', enum: ['active', 'suspended', 'deleted'] },
        },
      },
      Plan: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          price: { type: 'integer', description: 'Price in cents' },
          interval: { type: 'string', enum: ['month', 'year'] },
          features: { type: 'array', items: { type: 'object' } },
        },
      },
      PlansList: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'object',
            properties: {
              plans: { type: 'array', items: { $ref: '#/components/schemas/Plan' } },
            },
          },
        },
      },
      CheckoutInput: {
        type: 'object',
        required: ['priceId'],
        properties: {
          priceId: { type: 'string' },
          successUrl: { type: 'string' },
          cancelUrl: { type: 'string' },
        },
      },
      ApiError: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              requestId: { type: 'string' },
            },
          },
        },
      },
    },
  },
};
