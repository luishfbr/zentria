import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  adminAc,
  defaultAc,
} from "better-auth/plugins/organization/access";

export const ac = createAccessControl(defaultStatements);

export const superadmin = ac.newRole({
  ...adminAc.statements,
});

export const admin = ac.newRole({
  ...adminAc.statements,
});

export const user = ac.newRole({
  ...defaultAc.statements,
});
