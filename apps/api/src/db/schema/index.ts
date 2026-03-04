import { accounts } from "./auth/accounts";
import { invitations } from "./auth/invitations";
import { members } from "./auth/members";
import { organizations } from "./auth/organizations";
import {
  accountsRelations,
  invitationsRelations,
  membersRelations,
  organizationsRelations,
  sessionsRelations,
  usersRelations,
} from "./auth/relations";
import { sessions } from "./auth/sessions";
import { users } from "./auth/users";
import { verifications } from "./auth/verifications";

export const schema = {
  users,
  accounts,
  sessions,
  invitations,
  members,
  organizations,
  verifications,
  usersRelations,
  accountsRelations,
  sessionsRelations,
  invitationsRelations,
  membersRelations,
  organizationsRelations,
};
