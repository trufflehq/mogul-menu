import { ConnectionSourceType, DeepPick } from "../deps.ts";
import { User } from "./user.types.ts";
export interface OrgUser {
  id: string;
  name: string;
  userId: string;
  orgId: string;
  user: User;
}

export interface OrgUserChatSettings
  extends DeepPick<OrgUser, "id" | "name" | "userId" | "orgId" | "user.id"> {
  keyValue: {
    key: string;
    value: string;
  };
}

export interface OrgUserConnections extends Omit<OrgUser, "user"> {
  connectionConnection: {
    nodes: {
      id: string;
      sourceType: ConnectionSourceType;
    }[];
  };
}
