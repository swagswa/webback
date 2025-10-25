import Fastify from 'fastify';
import cors from '@fastify/cors';
import { prisma } from '../src/prisma.js';
import { taskRoutes } from '../src/routes/tasks.js';
import { userRoutes } from '../src/routes/user.js';

const fastify = Fastify({
  logger: false, // Disable logging for serverless
});

// Register CORS
await fastify.register(cors, {
  origin: true,
  credentials: true,
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
fastify.register(taskRoutes, { prefix: '/api' });
fastify.register(userRoutes, { prefix: '/api' });

// Export handler for Vercel
export default async (req: any, res: any) => {
  await fastify.ready();
  fastify.server.emit('request', req, res);
};
