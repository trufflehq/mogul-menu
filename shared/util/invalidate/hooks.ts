import { jumper, useEffect } from "../../../deps.ts";
import {
  MESSAGES,
  useActivePowerupConnection,
  useOwnedCollectibleConnection,
  useSeasonPassData,
  useUserInfo,
} from "../mod.ts";

export function useInvalidate() {
  const { reexecuteUserInfoQuery } = useUserInfo();
  const { reexecuteActivePowerupConnQuery } = useActivePowerupConnection();
  const { reexecuteOwnedCollectibleConnQuery } = useOwnedCollectibleConnection();
  const { reexecuteSeasonPassQuery } = useSeasonPassData();

  useEffect(() => {
    jumper.call("comms.onMessage", (message: string) => {
      if (message === MESSAGES.INVALIDATE_USER) {
        reexecuteUserInfoQuery();
        reexecuteActivePowerupConnQuery();
        reexecuteOwnedCollectibleConnQuery();
        reexecuteSeasonPassQuery();
      }
    });
  }, []);
}
