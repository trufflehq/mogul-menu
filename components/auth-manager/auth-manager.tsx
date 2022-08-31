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
  invalidateExtensionUser,
  LOGIN_TYPE_NAMES,
  ME_QUERY,
  setAccessToken,
  useUserInfo,
} from "../../shared/mod.ts";
import { ExtensionCredentials } from "../../types/mod.ts";
import { OAuthConnectionPage } from "../onboarding/mod.ts";
import { usePageStack } from "../page-stack/mod.ts";
import { ActionBanner, useActionBanner } from "../action-banner/mod.ts";

interface MeConnectionUser extends MeUser {
  connectionConnection: {
    nodes: {
      id: string;
      sourceType: "youtube" | "twitch";
    }[];
  };
}

export const ME_CONNECTIONS_QUERY = gql`
  query {
    me {
      id
      name
      email
      phone
      avatarImage {
        cdn
        prefix
        ext
        variations {
          postfix
          width
          height
        }
        aspectRatio
      }
      connectionConnection(sourceTypes: ["youtube", "twitch"]) {
        nodes {
          id
          sourceType
        }
      }
    }
  }
`;

function hasConnection(meUser: MeConnectionUser, sourceType: "youtube" | "twitch") {
  console.log("hasConnection", meUser);
  return meUser?.connectionConnection?.nodes.map((connection) => connection.sourceType).includes(
    sourceType,
  );
}

export function useExtensionAuth() {
  const [{ data: meRes, fetching: isFetchingUser }, refetchMe] = useQuery({
    query: ME_CONNECTIONS_QUERY,
  });

  const { pushPage } = usePageStack();

  const me: MeConnectionUser = meRes?.data;
  // console.log("meRes", meRes);

  const [signInResult, executeSigninMutation] = useMutation(
    EXTENSION_TOKEN_SIGNIN_QUERY,
  );

  const [credentials, setCredentials] = useState<ExtensionCredentials>();

  // useEffect(() => {
  //   const fetchCredentials = async () => {
  //     const credentials = await jumper.call("context.getCredentials");
  //     setCredentials(credentials);

  //     if (credentials?.sourceType === "youtube" && credentials?.token) {
  //       const result = await signInWithToken(false);
  //       const mogulTvUser: MogulTvUser = result?.data?.mogulTvSignIn;
  //       setAccessToken(mogulTvUser?.truffleAccessToken);
  //       await refetchMe({ requestPolicy: "network-only" });
  //     }

  //     // FIXME - add for twitch
  //     // if (credentials?.sourceType === "twitch" && credentials?.token) {}
  //   };

  //   fetchCredentials();
  // }, []);

  useEffect(() => {
    const fetchCredentials = async () => {
      const credentials = await jumper.call("context.getCredentials");
      setCredentials(credentials);

      pushPage(<OAuthConnectionPage sourceType={"youtube"} />);

      if (credentials?.sourceType === "youtube") {
        if (!hasConnection(me, "youtube")) {
          console.log("missing connection!!!!!!!!");

          pushPage(<OAuthConnectionPage sourceType={"youtube"} />);
          // pop up the onboarding page
        } else {
          console.log("HAS CONNECTION");
        }

        // const result = await signInWithToken(false);
        // const mogulTvUser: MogulTvUser = result?.data?.mogulTvSignIn;
        // setAccessToken(mogulTvUser?.truffleAccessToken);
        // await refetchMe({ requestPolicy: "network-only" });
      } else {
        console.log("not youtube or twitch");
      }

      // FIXME - add for twitch
      // if (credentials?.sourceType === "twitch" && credentials?.token) {}
    };

    fetchCredentials();
  }, [JSON.stringify(meRes?.data)]);

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
