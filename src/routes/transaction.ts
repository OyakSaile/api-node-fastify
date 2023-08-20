import { type FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'
import crypto, { randomUUID } from 'node:crypto'
import { checkSessionIdExists } from '../middlewares/checkSessionsIdExists'
export async function transactionRoutes (app: FastifyInstance): Promise<void> {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists]
    },
    async (request, reply) => {
      const sessionid = request.cookies.sessionID

      if (sessionid === null) {
        return await reply.status(401).send({
          error: 'Unauthorized'
        })
      }

      const transactions = await knex('transactions')
        .select()
        .where({ session_id: sessionid })

      return {
        transactions
      }
    }
  )

  app.get(
    '/summary',
    {
      preHandler: [checkSessionIdExists]
    },
    async (request) => {
      const sessionid = request.cookies.sessionID

      const summary = await knex('transactions')
        .sum('amount', { as: 'amount' })
        .where({ session_id: sessionid })
        .first()

      return {
        summary
      }
    }
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExists]
    },
    async (request) => {
      const sessionid = request.cookies.sessionID

      const getTransactionParamsSchema = z.object({
        id: z.string()
      })

      const { id } = getTransactionParamsSchema.parse(request.params)

      const transaction = await knex('transactions')
        .where({ id, session_id: sessionid })
        .first()

      return {
        transaction
      }
    }
  )

  app.post('/', async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit'])
    })

    const { amount, title, type } = createTransactionBodySchema.parse(
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

    await knex('transactions').insert({
      id: crypto.randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId
    })

    return reply.status(201).send
  })
}
