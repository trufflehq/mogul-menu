import {
  AbsoluteAuthDialog,
  jumper,
  React,
  setCookie,
  useEffect,
  useMutation,
  useQuery,
  useRef,
  useState,
} from "../../deps.ts";
import { ME_QUERY } from "../../shared/mod.ts";
import { EXTENSION_TOKEN_SIGNIN_QUERY, LOGIN_TYPE_NAMES } from "./gql.ts";
import { ExtensionCredentials, MogulTvUser, MeUser } from "../../types/mod.ts";
import Button from "../base/button/button.tsx";
import { ActionBanner, useActionBanner } from "../action-banner/mod.ts";

export function setAccessToken(accessToken?: string) {
  if (accessToken) {
    setCookie("accessToken", accessToken);
  }
}

export const isMemberMeUser = (user: MeUser) => user && (user.email || user.phone);


function useExtensionAuth() {
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
        const result = await signInResult(false);
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

export default function AuthManager() {
  const [isAuthDialogHidden, setIsAuthDialogHidden] = useState(true);
  const signInActionBannerIdRef = useRef<string | undefined>(undefined!);

  const { me, isFetchingUser, signInWithToken, refetchMe } = useExtensionAuth();
  const { displayActionBanner, removeActionBanner } = useActionBanner();

  useEffect(() => {
    if (!isFetchingUser) {
      if (!isMemberMeUser(me)) {
        signInActionBannerIdRef.current = displayActionBanner(
          <ActionBanner
            action={
              <Button onClick={() => setIsAuthDialogHidden(false)}>
                Sign in
              </Button>
            }
          >
            Finish setting up your account
          </ActionBanner>,
          "sign-in",
        );
      } else if (signInActionBannerIdRef.current) {
        removeActionBanner(signInActionBannerIdRef.current);
      }
    }
  }, [JSON.stringify(me), isFetchingUser]);

  const onAuthClose = async () => {
    setIsAuthDialogHidden(true);
    await refetchMe({ requestPolicy: "network-only" });
    const signInResult = await signInWithToken(true);

    const mogulTvUser: MogulTvUser = signInResult?.data?.mogulTvSignIn;
    setAccessToken(mogulTvUser?.truffleAccessToken);
    await refetchMe({ requestPolicy: "network-only" });
    if (signInActionBannerIdRef.current) {
      removeActionBanner(signInActionBannerIdRef.current);
    }
  };

  return (
    <div className="c-auth-manager">
      {!isAuthDialogHidden && (
        <AbsoluteAuthDialog hidden={isAuthDialogHidden} onclose={onAuthClose} />
      )}
    </div>
  );
}
