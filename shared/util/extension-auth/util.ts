import { _clearCache, getCookie, jumper, setCookie } from "../../../deps.ts";
import { MeConnectionUser } from "../../../types/mod.ts";

const TRUFFLE_ACCESS_TOKEN_KEY = "mogul-menu:accessToken";

export function setAccessToken(accessToken?: string) {
  if (accessToken) {
    setCookie("accessToken", accessToken);
  }
}

export function setAccessTokenAndClear(accessToken?: string) {
  _clearCache();
  setAccessToken(accessToken);
}

export function getAccessToken() {
  return getCookie("accessToken");
}

export function hasConnection(meUser: MeConnectionUser, sourceType: "youtube" | "twitch") {
  console.log("hasConnection", meUser);
  return meUser?.connectionConnection?.nodes.map((connection) => connection.sourceType).includes(
    sourceType,
  );
}

export function persistTruffleAccessToken(
  truffleAccessToken?: string,
) {
  if (truffleAccessToken) {
    jumper.call("storage.set", {
      key: TRUFFLE_ACCESS_TOKEN_KEY,
      value: truffleAccessToken,
    });
  }
}

export async function getTruffleTvAccessToken() {
  const accessToken = await jumper?.call("storage.get", {
    key: TRUFFLE_ACCESS_TOKEN_KEY,
  });

  return accessToken;
}

export async function loginFromExtension() {
  const accessToken = await getTruffleTvAccessToken();

  console.log("loginFromExtension has accessToken", Boolean(accessToken));

  setAccessTokenAndClear(accessToken);
}
