import { useMutation } from "../deps.ts";
import { EXTENSION_TOKEN_SIGNIN_QUERY } from "../gql/mod.ts";
import { setAccessToken } from "../util/mod.ts";
import { MogulTvUser } from "../types/mod.ts";

interface OptionalSigninArgs {
  isTransfer: boolean;
}

export async function signInWithExtensionJwt(
  token: string,
  args: OptionalSigninArgs,
) {
  const { isTransfer = false } = args;
  const [signInResult, executeSigninMutation] = useMutation(
    EXTENSION_TOKEN_SIGNIN_QUERY,
  );

  console.log("signInResult", signInResult);

  const result = await executeSigninMutation({
    token,
    isTransfer,
  }, {
    additionalTypenames: ["Poll", "PollVote", "PollOption", "MeUser", "ActivePowerup"],
  });

  console.log("result", result);
  const mogulTvUser: MogulTvUser = signInResult?.data?.mogulTvSignIn;
  setAccessToken(mogulTvUser?.truffleAccessToken);

  return mogulTvUser;
}
