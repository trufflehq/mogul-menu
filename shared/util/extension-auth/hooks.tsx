import {
  getConnectionSourceType,
  React,
  useEffect,
  useExtensionInfo,
  useQuery,
} from "../../../deps.ts";
import { ME_CONNECTIONS_QUERY } from "../../mod.ts";
import { usePageStack } from "../../../components/page-stack/mod.ts";
import { BasePage, OAuthConnectionPage } from "../../../components/onboarding/mod.ts";
import { MeConnectionUser } from "../../../types/mod.ts";
import { hasConnection } from "../../mod.ts";

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
      ? getConnectionSourceType(extensionInfo?.pageInfo)
      : "youtube";

    if (!hasConnection(meWithConnections, connectionSourceType) && !isFetchingUser) {
      pushPage(<BasePage />);
      pushPage(<OAuthConnectionPage sourceType={connectionSourceType} />);
    }
  }, [JSON.stringify(meWithConnections), isFetchingUser, extensionInfo]);
}

export function useMeConnectionQuery() {
  const [{ data: meRes, fetching: isFetchingUser }, refetchMeConnections] = useQuery({
    query: ME_CONNECTIONS_QUERY,
  });

  return { meWithConnections: meRes?.me as MeConnectionUser, isFetchingUser, refetchMeConnections };
}
