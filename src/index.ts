import Fastify from 'fastify';
import cors from '@fastify/cors';
import { prisma } from './prisma.js';
import { taskRoutes } from './routes/tasks.js';
import { userRoutes } from './routes/user.js';

const fastify = Fastify({
  logger: true,
});

// Register CORS
await fastify.register(cors, {
  origin: true, // Allow all origins in development
  credentials: true,
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Register routes
fastify.register(taskRoutes, { prefix: '/api' });
fastify.register(userRoutes, { prefix: '/api' });

// Graceful shutdown
const closeGracefully = async (signal: string) => {
  console.log(`Received ${signal}, closing gracefully...`);
  await prisma.$disconnect();
  await fastify.close();
  process.exit(0);
};

process.on('SIGINT', () => closeGracefully('SIGINT'));
process.on('SIGTERM', () => closeGracefully('SIGTERM'));

// Start server
const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    console.log(`🚀 Server listening on http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
