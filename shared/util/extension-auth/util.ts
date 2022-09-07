import { ConnectionSourceType } from "../../../deps.ts";
import { MeConnectionUser } from "../../../types/mod.ts";

export function hasConnection(meUser: MeConnectionUser, sourceType: ConnectionSourceType) {
  if (!sourceType) return false;
  return meUser?.connectionConnection?.nodes.map((connection) => connection.sourceType).includes(
    sourceType,
  );
}
