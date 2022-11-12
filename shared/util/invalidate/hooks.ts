import { _clearCache, GLOBAL_JUMPER_MESSAGES, jumper, useEffect } from "../../../deps.ts";
import {
  useActivePowerupConnection,
  useOrgUserConnectionsQuery,
  useOwnedCollectibleConnection,
  usePollingActivityAlertConnection$,
  useSeasonPassData,
  useUserInfo,
} from "../mod.ts";

/**
 * Listens for invalidate messages from jumper and invalidates all of the extension user's urql queries
 */
export function useInvalidateAllQueriesListener() {
  const { reexecuteUserInfoQuery } = useUserInfo();
  const { reexecuteActivePowerupConnQuery } = useActivePowerupConnection();
  const { reexecuteOwnedCollectibleConnQuery } = useOwnedCollectibleConnection();
  const { refetchOrgUserConnections } = useOrgUserConnectionsQuery();
  const { reexecuteSeasonPassQuery } = useSeasonPassData();
  const { reexecuteActivityConnectionQuery } = usePollingActivityAlertConnection$({});

  useEffect(() => {
    jumper.call("comms.onMessage", (message: string) => {
      if (message === GLOBAL_JUMPER_MESSAGES.INVALIDATE_USER) {
        reexecuteUserInfoQuery({ requestPolicy: "network-only" });
        reexecuteActivePowerupConnQuery({ requestPolicy: "network-only" });
        reexecuteOwnedCollectibleConnQuery({ requestPolicy: "network-only" });
        reexecuteSeasonPassQuery({ requestPolicy: "network-only" });
        refetchOrgUserConnections({ requestPolicy: "network-only" });
        reexecuteActivityConnectionQuery({ requestPolicy: "network-only" });
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
