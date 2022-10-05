import { GLOBAL_JUMPER_MESSAGES, jumper, _clearCache, useEffect } from "../../../deps.ts";
import {
  useActivePowerupConnection,
  useOwnedCollectibleConnection,
  useSeasonPassData,
  useUserInfo,
  useOrgUserConnectionsQuery,
  useOrgKothConfigQuery$
} from "../mod.ts";

/**
 * Listens for invalidate messages from jumper and invalidates all of the extension user's urql queries
 */
export function useInvalidateAllQueriesListener() {
  const { reexecuteUserInfoQuery } = useUserInfo();
  const { reexecuteActivePowerupConnQuery } = useActivePowerupConnection();
  const { reexecuteOwnedCollectibleConnQuery } = useOwnedCollectibleConnection();
  const { reexecuteSeasonPassQuery } = useSeasonPassData();
  const {reexecuteKothConfigQuery } = useOrgKothConfigQuery$();

  useEffect(() => {
    jumper.call("comms.onMessage", (message: string) => {
      if (message === GLOBAL_JUMPER_MESSAGES.INVALIDATE_USER) {
        reexecuteUserInfoQuery();
        reexecuteActivePowerupConnQuery();
        reexecuteOwnedCollectibleConnQuery();
        reexecuteSeasonPassQuery();
        reexecuteKothConfigQuery();
      }
    });
  }, []);
}

/**
 * Listens for a login message from jumper and resets the urql client and refetches the org user.
 * Need this so the activity banner has the updated user to pull in their data in different activities (e.g points won/lost in predictions)
 */
 export function useLoginListener() {
  const { refetchOrgUserConnections } = useOrgUserConnectionsQuery();

  useEffect(() => {
    jumper.call("comms.onMessage", (message: string) => {
      if (message === GLOBAL_JUMPER_MESSAGES.ACCESS_TOKEN_UPDATED) {
        // reset the api client w/ the updated user and refetch user/channel points info
        _clearCache();
        refetchOrgUserConnections({ requestPolicy: "network-only" });
      }
    });
  }, []);
}
