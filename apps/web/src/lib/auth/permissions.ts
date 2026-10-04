import {
  adminAc,
  defaultStatements,
} from "better-auth/plugins/admin/access";
import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  ...defaultStatements,
} as const;

const ac = createAccessControl(statement);

const admin = ac.newRole({
  ...adminAc.statements,
});

const manager = ac.newRole({
  ...adminAc.statements,
});

const user = ac.newRole({
  user: [],
  session: [],
});

export { ac, admin, manager, user };
