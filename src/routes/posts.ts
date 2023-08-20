import { type FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import crypto, { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/checkSessionsIdExists'
export async function postsRoutes (app: FastifyInstance): Promise<void> {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists]
    },
    async () => {
      const posts = await knex('posts').select()

      return {
        posts
      }
    }
  )

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      description: z.string()
    })

    const { description, title } = createTransactionBodySchema.parse(
      request.body
    )

    let sessionId = request.cookies.sessionID

    if (sessionId === undefined) {
      sessionId = randomUUID()

      void reply.cookie('sessionID', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
      })
    }

    await knex('posts').insert({
      id: crypto.randomUUID(),
      title,
      description,
      session_id: sessionId
    })

    return reply.status(201).send
  })
}
