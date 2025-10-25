import { FastifyInstance, FastifyRequest } from 'fastify';
import { prisma } from '../prisma.js';

interface TaskBody {
  userId: number;
  title: string;
}

interface UpdateTaskBody {
  title?: string;
  done?: boolean;
}

interface TaskRequest {
  Body: TaskBody;
}

interface UpdateTaskRequest {
  Params: { id: string };
  Body: UpdateTaskBody;
}

interface DeleteTaskRequest {
  Params: { id: string };
}

interface GetUserTasksRequest {
  Params: { userId: string };
}

export async function taskRoutes(fastify: FastifyInstance) {
  // Get all tasks for a user
  fastify.get<GetUserTasksRequest>(
    '/tasks/:userId',
    async (request, reply) => {
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
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Failed to fetch tasks' });
      }
    }
  );

  // Create a new task
  fastify.post<TaskRequest>(
    '/tasks',
    async (request: FastifyRequest<TaskRequest>, reply) => {
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
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Failed to create task' });
      }
    }
  );

  // Update a task
  fastify.patch<UpdateTaskRequest>(
    '/tasks/:id',
    async (request, reply) => {
      const taskId = parseInt(request.params.id);
      const { title, done } = request.body;

      if (isNaN(taskId)) {
        return reply.code(400).send({ error: 'Invalid task ID' });
      }

      try {
        const updateData: any = {};

        if (title !== undefined) {
          updateData.title = title;
        }

        if (done !== undefined) {
          updateData.done = done;
          // Set completedAt when task is marked as done
          updateData.completedAt = done ? new Date() : null;
        }

        const task = await prisma.task.update({
          where: { id: taskId },
          data: updateData,
        });

        return { task };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Failed to update task' });
      }
    }
  );

  // Delete a task
  fastify.delete<DeleteTaskRequest>(
    '/tasks/:id',
    async (request, reply) => {
      const taskId = parseInt(request.params.id);

      if (isNaN(taskId)) {
        return reply.code(400).send({ error: 'Invalid task ID' });
      }

      try {
        await prisma.task.delete({
          where: { id: taskId },
        });

        return { success: true };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Failed to delete task' });
      }
    }
  );

  // Mark all tasks as done/undone
  fastify.patch<{ Params: { userId: string }; Body: { done: boolean } }>(
    '/tasks/:userId/bulk-update',
    async (request, reply) => {
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
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Failed to bulk update tasks' });
      }
    }
  );
}
