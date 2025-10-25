import Fastify from 'fastify';
import cors from '@fastify/cors';
import { prisma } from '../src/prisma.js';
import { taskRoutes } from '../src/routes/tasks.js';
import { userRoutes } from '../src/routes/user.js';

const fastify = Fastify({
  logger: false,
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

// Prepare fastify
await fastify.ready();

// Export handler for Vercel
export default async (req: any, res: any) => {
  // Convert Vercel request to Fastify format
  const url = req.url || '/';
  const method = req.method || 'GET';

  const response = await fastify.inject({
    method: method as any,
    url: url,
    headers: req.headers as any,
    payload: req.body,
  });

  // Set response headers
  Object.keys(response.headers).forEach((key) => {
    res.setHeader(key, response.headers[key] as string);
  });

  // Send response
  res.status(response.statusCode).send(response.body);
};
