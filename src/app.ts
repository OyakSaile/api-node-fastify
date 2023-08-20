/* eslint-disable @typescript-eslint/no-floating-promises */
import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { transactionRoutes } from './routes/transaction'
import { postsRoutes } from './routes/posts'

export const app = fastify()

app.register(cookie)

app.register(transactionRoutes, {
  prefix: 'transactions'
})
app.register(postsRoutes, {
  prefix: 'posts'
})
