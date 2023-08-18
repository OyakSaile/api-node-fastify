import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import crypto from "node:crypto";
export async function transactionRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    const transactions = await knex("transactions").select();

    return {
      transactions,
    };
  });

  app.get("/:id", async (request) => {
    const getTransactionParamsSchema = z.object({
        id: z.string()
    });
  });

  app.post("/", async (request, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { amount, title, type } = createTransactionBodySchema.parse(
      request.body
    );

    await knex("transactions").insert({
      id: crypto.randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
    });

    return reply.status(201).send;
  });
}