import { FastifyInstance } from 'fastify';
import { prisma } from '../prisma.js';

export async function statsRoutes(fastify: FastifyInstance) {
  // Get daily statistics for a user
  fastify.get<{ Params: { userId: string }; Querystring: { days?: string } }>(
    '/stats/:userId',
    async (request, reply) => {
      const userId = parseInt(request.params.userId);
      const days = parseInt(request.query.days || '30');

      if (isNaN(userId)) {
        return reply.code(400).send({ error: 'Invalid user ID' });
      }

      try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const tasks = await prisma.task.findMany({
          where: {
            userId,
            createdAt: {
              gte: startDate,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        // Group tasks by date
        const statsByDate: Record<string, { total: number; completed: number; tasks: any[] }> = {};

        tasks.forEach((task) => {
          const dateKey = task.createdAt.toISOString().split('T')[0];

          if (!statsByDate[dateKey]) {
            statsByDate[dateKey] = { total: 0, completed: 0, tasks: [] };
          }

          statsByDate[dateKey].total++;
          if (task.done) {
            statsByDate[dateKey].completed++;
          }
          statsByDate[dateKey].tasks.push(task);
        });

        // Calculate streak
        let currentStreak = 0;
        let longestStreak = 0;
        let tempStreak = 0;
        const today = new Date().toISOString().split('T')[0];

        // Sort dates descending
        const dates = Object.keys(statsByDate).sort().reverse();

        for (let i = 0; i < dates.length; i++) {
          const date = dates[i];
          const stats = statsByDate[date];

          if (stats.completed > 0) {
            tempStreak++;
            if (tempStreak > longestStreak) {
              longestStreak = tempStreak;
            }
            // Current streak only counts if it includes today or yesterday
            if (i === 0 && (date === today || isYesterday(date))) {
              currentStreak = tempStreak;
            }
          } else {
            if (i === 0) break; // Stop counting current streak if today/yesterday has no completed tasks
            tempStreak = 0;
          }
        }

        return {
          stats: statsByDate,
          streak: {
            current: currentStreak,
            longest: longestStreak,
          },
        };
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({ error: 'Failed to fetch statistics' });
      }
    }
  );
}

function isYesterday(dateString: string): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().split('T')[0];
  return dateString === yesterdayString;
}
