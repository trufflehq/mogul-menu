import {
  AbsoluteAuthDialog,
  globalContext,
  gql,
  jumper,
  React,
  useEffect,
  useMutation,
  useQuery,
  useRef,
  useState,
} from "../../deps.ts";
import { MeUser, MogulTvUser } from "../../types/mod.ts";
import Button from "../base/button/button.tsx";
import {
  EXTENSION_TOKEN_SIGNIN_QUERY,
  hasConnection,
  invalidateExtensionUser,
  LOGIN_TYPE_NAMES,
  loginFromExtension,
  ME_QUERY,
  setAccessToken,
  useMeConnectionQuery,
  useUserInfo,
} from "../../shared/mod.ts";
import { ExtensionCredentials } from "../../types/mod.ts";
import { BasePage, ChatSettingsPage, OAuthConnectionPage } from "../onboarding/mod.ts";
import { usePageStack } from "../page-stack/mod.ts";
import { ActionBanner, useActionBanner } from "../action-banner/mod.ts";

export function useExtensionAuth() {
  const { me, isFetchingUser, refetchMeConnections } = useMeConnectionQuery();

  const { pushPage, clearPageStack } = usePageStack();

  const [signInResult, executeSigninMutation] = useMutation(
    EXTENSION_TOKEN_SIGNIN_QUERY,
  );

  const [credentials, setCredentials] = useState<ExtensionCredentials>();

  console.log("me", me, isFetchingUser);
  useEffect(() => {
    const fetchCredentials = async () => {
      const credentials = await jumper.call("context.getCredentials");
      setCredentials(credentials);

      // TODO reenable this guy
      // if (credentials?.sourceType === "youtube") {
      if (!hasConnection(me, "youtube") && !isFetchingUser) {
        console.log("missing connection!!!!!!!!");
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
  const [isAuthDialogHidden, setIsAuthDialogHidden] = useState(true);
  const signInActionBannerIdRef = useRef<string | undefined>(undefined!);
  const { reexecuteUserInfoQuery } = useUserInfo();
  const { me, isFetchingUser, signInWithToken } = useExtensionAuth();
  const { displayActionBanner, removeActionBanner } = useActionBanner();

  useEffect(() => {
    loginFromExtension();
  }, []);

  // useEffect(() => {
  //   if (!isFetchingUser) {
  //     if (!isMemberMeUser(me)) {
  //       signInActionBannerIdRef.current = displayActionBanner(
  //         <ActionBanner
  //           action={
  //             <Button onClick={() => setIsAuthDialogHidden(false)}>
  //               Sign in
  //             </Button>
  //           }
  //         >
  //           Finish setting up your account
  //         </ActionBanner>,
  //         "sign-in",
  //       );
  //     } else if (signInActionBannerIdRef.current) {
  //       removeActionBanner(signInActionBannerIdRef.current);
  //     }
  //   }
  // }, [JSON.stringify(me), isFetchingUser]);

  return (
    <div className="c-auth-manager">
    </div>
  );
}
