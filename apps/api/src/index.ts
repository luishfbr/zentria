import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { betterAuthPlugin, OpenAPI } from "./https/plugins/better-auth";

const app = new Elysia().use(
  cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  })
).use(
  openapi({
    documentation: {
      components: await OpenAPI.components,
      paths: await OpenAPI.getPaths()
    }
  })
)
  .use(betterAuthPlugin).listen(8080);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
