import { getConnectionSourceType, React, useEffect, useExtensionInfo } from "../../deps.ts";
import { hasConnection, useOrgUserConnectionsQuery } from "../../shared/mod.ts";
import { usePageStack } from "../page-stack/mod.ts";
import { BasePage, OAuthConnectionPage } from "./mod.ts";

/**
 * Checks if the logged in user has the appropriate connection for the source the embed is
 * being injected into (YouTube or Twitch) and starts the onboarding process if the connection
 * doesn't exist.
 */
export function useOnboarding() {
  const { orgUser, isFetchingOrgUser } = useOrgUserConnectionsQuery();
  const { pushPage } = usePageStack();
  const { extensionInfo } = useExtensionInfo();

  useEffect(() => {
    const connectionSourceType = extensionInfo?.pageInfo
      ? getConnectionSourceType(extensionInfo.pageInfo)
      : "youtube";

    const hasPageInfo = window?._truffleInitialData?.clientConfig?.IS_PROD_ENV
      ? extensionInfo?.pageInfo
      : true;
    console.log("onboarding", orgUser, connectionSourceType, isFetchingOrgUser);
    if (
      hasPageInfo && !hasConnection(orgUser, connectionSourceType) && !isFetchingOrgUser
    ) {
      pushPage(<BasePage />);
      pushPage(<OAuthConnectionPage sourceType={connectionSourceType} />);
    }
  }, [JSON.stringify(orgUser), isFetchingOrgUser, extensionInfo]);
}
