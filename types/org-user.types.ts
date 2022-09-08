import { ConnectionSourceType } from "../deps.ts";
import { User } from "./user.types.ts";
export interface OrgUser {
  name: string;
  user: User;
}

export interface OrgUserConnections extends Pick<OrgUser, "name"> {
  connectionConnection: {
    nodes: {
      id: string;
      sourceType: ConnectionSourceType;
    }[];
  };
}
