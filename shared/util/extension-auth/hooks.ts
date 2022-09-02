import { jumper, useEffect, useMutation, useQuery, useState } from "../../../deps.ts";
import {
  EXTENSION_TOKEN_SIGNIN_QUERY,
  invalidateExtensionUser,
  LOGIN_TYPE_NAMES,
  ME_CONNECTIONS_QUERY,
  ME_QUERY,
  setAccessToken,
} from "../../mod.ts";
import { ExtensionCredentials, MeConnectionUser, MogulTvUser } from "../../../types/mod.ts";

const MESSAGE = {
  INVALIDATE_USER: "user.invalidate",
};

export function useExtensionAuth() {
  const [{ data: meRes, fetching: isFetchingUser }, refetchMe] = useQuery({
    query: ME_QUERY,
  });

  const [signInResult, executeSigninMutation] = useMutation(
    EXTENSION_TOKEN_SIGNIN_QUERY,
  );

  const [credentials, setCredentials] = useState<ExtensionCredentials>();

  useEffect(() => {
    const fetchCredentials = async () => {
      const credentials = await jumper.call("context.getCredentials");
      setCredentials(credentials);

      if (credentials?.sourceType === "youtube" && credentials?.token) {
        const result = await signInWithToken(false);
        const mogulTvUser: MogulTvUser = result?.data?.mogulTvSignIn;
        setAccessToken(mogulTvUser?.truffleAccessToken);
        await refetchMe({ requestPolicy: "network-only" });
      }

      // FIXME - add for twitch
      // if (credentials?.sourceType === "twitch" && credentials?.token) {}
    };

    fetchCredentials();
  }, []);

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
    await refetchMe({ requestPolicy: "network-only" });

    invalidateExtensionUser();

    return result;
  }

  return {
    me: meRes?.me,
    isFetchingUser,
    credentials,
    signInWithToken,
    refetchMe,
  };
}

export function useMeConnectionQuery() {
  const [{ data: meRes, fetching: isFetchingUser }, refetchMeConnections] = useQuery({
    query: ME_CONNECTIONS_QUERY,
  });

  return { me: meRes?.me as MeConnectionUser, isFetchingUser, refetchMeConnections };
}
