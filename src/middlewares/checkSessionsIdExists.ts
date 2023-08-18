import { FastifyReply, FastifyRequest } from "fastify";

export async function checkSessionIdExists(request : FastifyRequest, reply: FastifyReply) {
  const sessionid = request.cookies.sessionID;

  if (!sessionid) {
    return reply.status(401).send({
      error: "Unauthorized",
    });
  }
}
