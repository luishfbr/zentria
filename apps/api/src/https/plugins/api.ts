import Elysia from "elysia";
import { apiGuard } from "./api-guard";
import { apiMembers } from "./api-members";
import { apiSports } from "./api-sports";
import { apiEvaluations } from "./api-evaluations";
import { apiHealth } from "./api-health";
import { apiNutrition } from "./api-nutrition";

export const apiPlugin = new Elysia({ name: "Zentria API", prefix: "/v1/api" })
  .use(apiGuard)
  .use(apiMembers)
  .use(apiSports)
  .use(apiEvaluations)
  .use(apiHealth)
  .use(apiNutrition);
