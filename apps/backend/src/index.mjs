import http from "node:http";
import { prisma } from "./lib/prisma.mjs";

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

const server = http.createServer(async (request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    await handleHealth(response);
    return;
  }

  response.writeHead(404, { "content-type": "application/json" });
  response.end(
    JSON.stringify({
      status: "error",
      error: "Not Found",
    }),
  );
});

server.listen(port, host, () => {
  console.log(`Backend server is listening on http://${host}:${port}`);
});

server.on("close", async () => {
  await prisma.$disconnect();
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, async () => {
    server.close(() => {
      process.exit(0);
    });
  });
}

async function handleHealth(response) {
  try {
    const [{ databaseName }] =
      await prisma.$queryRaw`SELECT current_database() AS "databaseName"`;

    response.writeHead(200, { "content-type": "application/json" });
    response.end(
      JSON.stringify({
        status: "ok",
        service: "backend",
        database: {
          status: "ok",
          name: databaseName,
        },
      }),
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database connection failed";

    response.writeHead(503, { "content-type": "application/json" });
    response.end(
      JSON.stringify({
        status: "error",
        service: "backend",
        database: {
          status: "error",
          message,
        },
      }),
    );
  }
}
