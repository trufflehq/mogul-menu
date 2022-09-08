import { getConnectionSourceType, React, useEffect, useExtensionInfo } from "../../deps.ts";
import { hasConnection, useMeConnectionQuery } from "../../shared/mod.ts";
import { usePageStack } from "../page-stack/mod.ts";
import { BasePage, OAuthConnectionPage } from "./mod.ts";

/**
 * Checks if the logged in user has the appropriate connection for the source the embed is
 * being injected into (YouTube or Twitch) and starts the onboarding process if the connection
 * doesn't exist.
 */
export function useOnboarding() {
  const { meWithConnections, isFetchingUser } = useMeConnectionQuery();
  const { pushPage } = usePageStack();
  const { extensionInfo } = useExtensionInfo();

  useEffect(() => {
    const connectionSourceType = extensionInfo?.pageInfo
      ? getConnectionSourceType(extensionInfo.pageInfo)
      : "youtube";

    if (!hasConnection(meWithConnections, connectionSourceType) && !isFetchingUser) {
      pushPage(<BasePage />);
      pushPage(<OAuthConnectionPage sourceType={connectionSourceType} />);
    }
  }, [JSON.stringify(meWithConnections), isFetchingUser, extensionInfo]);
}
