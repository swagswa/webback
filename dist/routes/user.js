import { prisma } from '../prisma.js';
export async function userRoutes(fastify) {
    // Get or create user from Telegram data
    fastify.post('/user', async (request, reply) => {
        const { id, first_name, username } = request.body;
        if (!id) {
            return reply.code(400).send({ error: 'User ID is required' });
        }
        try {
            const user = await prisma.user.upsert({
                where: { id },
                update: {
                    firstName: first_name,
                    username: username,
                },
                create: {
                    id,
                    firstName: first_name,
                    username: username,
                },
            });
            return { user };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ error: 'Failed to create/update user' });
        }
    });
    // Get user by ID
    fastify.get('/user/:id', async (request, reply) => {
        const userId = parseInt(request.params.id);
        if (isNaN(userId)) {
            return reply.code(400).send({ error: 'Invalid user ID' });
        }
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    tasks: {
                        orderBy: { createdAt: 'desc' },
                    },
                },
            });
            if (!user) {
                return reply.code(404).send({ error: 'User not found' });
            }
            return { user };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ error: 'Failed to fetch user' });
        }
    });
}
