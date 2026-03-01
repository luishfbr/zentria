export * from "./auth";
export * from "./sports";
export * from "./evaluations";
export * from "./health";
export * from "./nutrition";

import * as auth from "./auth";
import * as sports from "./sports";
import * as evaluations from "./evaluations";
import * as health from "./health";
import * as nutrition from "./nutrition";

export const schema = {
  ...auth,
  ...sports,
  ...evaluations,
  ...health,
  ...nutrition,
};
