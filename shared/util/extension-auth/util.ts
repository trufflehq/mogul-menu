import { setCookie } from "../../../deps.ts";
export function setAccessToken(accessToken?: string) {
  if (accessToken) {
    setCookie("accessToken", accessToken);
  }
}
