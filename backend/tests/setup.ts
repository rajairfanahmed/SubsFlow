import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

// Increase timeout for setup
jest.setTimeout(30000);

beforeAll(async () => {
  // Start in-memory MongoDB
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Cleanup
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  // Clear all collections between tests
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    const collection = collections[key];
    if (collection) {
      await collection.deleteMany({});
    }
  }
});

// Mock logger to prevent console noise during tests
jest.mock('../src/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    http: jest.fn(),
  },
}));

// Mock config with test values
jest.mock('../src/config', () => ({
  config: {
    env: 'test',
    port: 5001,
    app: {
      name: 'SubsFlow Test',
      url: 'http://localhost:5001',
      frontendUrl: 'http://localhost:3000',
    },
    jwt: {
      secret: 'test-secret-key-for-jwt-signing',
      accessExpiry: '15m',
      refreshExpiry: '7d',
    },
    rateLimit: {
      windowMs: 60000,
      maxRequests: 1000,
    },
  },
}));
