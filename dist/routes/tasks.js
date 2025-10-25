import { prisma } from '../prisma.js';
export async function taskRoutes(fastify) {
    // Get all tasks for a user
    fastify.get('/tasks/:userId', async (request, reply) => {
        const userId = parseInt(request.params.userId);
        if (isNaN(userId)) {
            return reply.code(400).send({ error: 'Invalid user ID' });
        }
        try {
            const tasks = await prisma.task.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
            });
            return { tasks };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ error: 'Failed to fetch tasks' });
        }
    });
    // Create a new task
    fastify.post('/tasks', async (request, reply) => {
        const { userId, title } = request.body;
        if (!userId || !title) {
            return reply.code(400).send({ error: 'userId and title are required' });
        }
        try {
            const task = await prisma.task.create({
                data: {
                    userId,
                    title,
                },
            });
            return reply.code(201).send({ task });
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ error: 'Failed to create task' });
        }
    });
    // Update a task
    fastify.patch('/tasks/:id', async (request, reply) => {
        const taskId = parseInt(request.params.id);
        const { title, done } = request.body;
        if (isNaN(taskId)) {
            return reply.code(400).send({ error: 'Invalid task ID' });
        }
        try {
            const task = await prisma.task.update({
                where: { id: taskId },
                data: {
                    ...(title !== undefined && { title }),
                    ...(done !== undefined && { done }),
                },
            });
            return { task };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ error: 'Failed to update task' });
        }
    });
    // Delete a task
    fastify.delete('/tasks/:id', async (request, reply) => {
        const taskId = parseInt(request.params.id);
        if (isNaN(taskId)) {
            return reply.code(400).send({ error: 'Invalid task ID' });
        }
        try {
            await prisma.task.delete({
                where: { id: taskId },
            });
            return { success: true };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ error: 'Failed to delete task' });
        }
    });
    // Mark all tasks as done/undone
    fastify.patch('/tasks/:userId/bulk-update', async (request, reply) => {
        const userId = parseInt(request.params.userId);
        const { done } = request.body;
        if (isNaN(userId)) {
            return reply.code(400).send({ error: 'Invalid user ID' });
        }
        try {
            await prisma.task.updateMany({
                where: { userId },
                data: { done },
            });
            return { success: true };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({ error: 'Failed to bulk update tasks' });
        }
    });
}
