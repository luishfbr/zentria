import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi, toOpenAPISchema } from "@elysiajs/openapi";
import { betterAuthPlugin, OpenAPI } from "./https/plugins/better-auth";
import { apiPlugin } from "./https/plugins/api";

const [authPaths, authComponents] = await Promise.all([
  OpenAPI.getPaths("/auth"),
  OpenAPI.components,
]);

const apiOnlyApp = new Elysia().use(apiPlugin);
const { paths: apiPaths, components: apiComponents } =
  toOpenAPISchema(apiOnlyApp);

const mergedPaths = { ...authPaths, ...apiPaths };
const mergedComponents = {
  ...authComponents,
  schemas: {
    ...(authComponents?.schemas ?? {}),
    ...(apiComponents?.schemas ?? {}),
  },
};

const app = new Elysia()
  .use(
    cors({
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      credentials: true,
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  )
  .use(
    openapi({
      documentation: {
        openapi: "3.0.3",
        info: { title: "Zentria API", version: "1.0.0" },
        paths: mergedPaths,
        components: mergedComponents,
      },
    })
  )
  .use(betterAuthPlugin)
  .use(apiPlugin)
  .listen(8080);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
