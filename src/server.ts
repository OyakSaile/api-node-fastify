import fastify from "fastify";
import { transactionRoutes } from "./routes/transaction";

const app = fastify();

app.register(transactionRoutes, {
  prefix: "transactions",
});

app.listen({ port: 3333 }).then(() => {
  console.log("HTTP Server Running!");
});
