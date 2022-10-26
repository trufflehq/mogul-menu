import { _setAccessTokenAndClear, ConnectionSourceType, React } from "../../../deps.ts";

const LOCAL_HOSTNAME = "https://local-oauth.rileymiller.dev";
// const LOCAL_HOSTNAME = "https://mobile-third-party-oauth.truffle.vip";

export default function LocalOAuthFrame(
  { sourceType, accessToken, orgId }: {
    sourceType: ConnectionSourceType;
    accessToken: string;
    orgId: string;
  },
) {
  // accessToken =
  //   "eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJ1c2VySWQiOiJiMTVhNWQ0MC01MzI4LTExZWQtOWQ4NS0xMWFkZjg4Njc5NGEiLCJzY29wZXMiOlsiKiJdLCJpYXQiOjE2NjY1NjY5NzUsImlzcyI6InNwb3JlIiwic3ViIjoiYjE1YTVkNDAtNTMyOC0xMWVkLTlkODUtMTFhZGY4ODY3OTRhIn0.GW_fgZzkufPZzZr73BbH018LCg06TDsb4_j4ZDFrVYtn1dKOSPDX-DB9QdNtfkTHypNj69zxOL_gEkTVF0BaWg";
  return (
    <iframe
      src={`${LOCAL_HOSTNAME}/auth/${sourceType}?accessToken=${accessToken}&orgId=${orgId}`}
      style={{
        width: "236px",
        height: "42px",
        margin: "20px auto 8px auto",
        border: "none",
      }}
    />
  );
}
