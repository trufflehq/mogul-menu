import { AbsoluteAuthDialog, React, useEffect, useRef, useState } from "../../deps.ts";
import { MeUser, MogulTvUser } from "../../types/mod.ts";
import Button from "../base/button/button.tsx";
import { setAccessToken, useExtensionAuth, useUserInfo } from "../../shared/mod.ts";
import { ActionBanner, useActionBanner } from "../action-banner/mod.ts";

export const isMemberMeUser = (user: MeUser) => user && (user.email || user.phone);

export default function AuthManager() {
  const [isAuthDialogHidden, setIsAuthDialogHidden] = useState(true);
  const signInActionBannerIdRef = useRef<string | undefined>(undefined!);
  const { reexecuteUserInfoQuery } = useUserInfo();
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
    await reexecuteUserInfoQuery({ requestPolicy: "network-only" });
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
