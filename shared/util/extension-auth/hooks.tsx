import {
  getConnectionSourceType,
  jumper,
  React,
  useEffect,
  useQuery,
  useState,
} from "../../../deps.ts";
import { ME_CONNECTIONS_QUERY } from "../../mod.ts";
import { usePageStack } from "../../../components/page-stack/mod.ts";
import { BasePage, OAuthConnectionPage } from "../../../components/onboarding/mod.ts";
import { ExtensionInfo, MeConnectionUser } from "../../../types/mod.ts";
import { hasConnection } from "../../mod.ts";

/**
 * This hook will grab the extension info on mount
 */
export function useExtensionInfo() {
  const [extensionInfo, setExtensionInfo] = useState<ExtensionInfo>();

  useEffect(() => {
    const fetchExtensionInfo = async () => {
      // grabs credentials from the extension so the embed knows the source of
      // where it's being injected
      const extensionInfo: ExtensionInfo | undefined = await jumper.call(
        "context.getInfo",
      );
      setExtensionInfo(extensionInfo);
    };

    fetchExtensionInfo();
  }, []);

  return { extensionInfo };
}

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
