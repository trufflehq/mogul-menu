import { jumper, React, useEffect, useMutation, useState } from "../../deps.ts";
import { MeUser, MogulTvUser } from "../../types/mod.ts";
import {
  EXTENSION_TOKEN_SIGNIN_QUERY,
  hasConnection,
  invalidateExtensionUser,
  LOGIN_TYPE_NAMES,
  loginFromExtension,
  setAccessToken,
  useMeConnectionQuery,
} from "../../shared/mod.ts";
import { ExtensionCredentials } from "../../types/mod.ts";
import { BasePage, OAuthConnectionPage } from "../onboarding/mod.ts";
import { usePageStack } from "../page-stack/mod.ts";

export function useExtensionAuth() {
  const { me, isFetchingUser, refetchMeConnections } = useMeConnectionQuery();

  const { pushPage } = usePageStack();

  const [signInResult, executeSigninMutation] = useMutation(
    EXTENSION_TOKEN_SIGNIN_QUERY,
  );

  const [credentials, setCredentials] = useState<ExtensionCredentials>();

  useEffect(() => {
    loginFromExtension();
  }, []);

  useEffect(() => {
    const fetchCredentials = async () => {
      const credentials = await jumper.call("context.getCredentials");
      setCredentials(credentials);

      // TODO reenable this guy when we add twitch
      // if (credentials?.sourceType === "youtube") {
      if (!hasConnection(me, "youtube") && !isFetchingUser) {
        pushPage(<BasePage />);
        pushPage(<OAuthConnectionPage sourceType={"youtube"} />);
      }

      // FIXME - add for twitch
      // if (credentials?.sourceType === "twitch" && credentials?.token) {}
    };

    fetchCredentials();
  }, [JSON.stringify(me), isFetchingUser]);

  async function signInWithToken(isTransfer = false) {
    const result = await executeSigninMutation(
      {
        token: credentials?.token,
        isTransfer,
      },
      {
        additionalTypenames: LOGIN_TYPE_NAMES,
      },
    );

    const mogulTvUser: MogulTvUser = result?.data?.mogulTvSignIn;
    setAccessToken(mogulTvUser?.truffleAccessToken);
    await refetchMeConnections({ requestPolicy: "network-only" });

    invalidateExtensionUser();

    return result;
  }

  return {
    me,
    isFetchingUser,
    credentials,
    signInWithToken,
    refetchMeConnections,
  };
}

export const hasName = (user: MeUser) => user && user?.name;
export const isMemberMeUser = (user: MeUser) => user && (user.email || user.phone);

export default function AuthManager() {
  useExtensionAuth();

  return (
    <div className="c-auth-manager">
    </div>
  );
}
