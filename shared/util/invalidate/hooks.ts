import { GLOBAL_JUMPER_MESSAGES, jumper, useEffect } from "../../../deps.ts";
import {
  useActivePowerupConnection,
  useOwnedCollectibleConnection,
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
  const { reexecuteSeasonPassQuery } = useSeasonPassData();

  useEffect(() => {
    jumper.call("comms.onMessage", (message: string) => {
      if (message === GLOBAL_JUMPER_MESSAGES.INVALIDATE_USER) {
        reexecuteUserInfoQuery();
        reexecuteActivePowerupConnQuery();
        reexecuteOwnedCollectibleConnQuery();
        reexecuteSeasonPassQuery();
      }
    });
  }, []);
}
