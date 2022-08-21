export interface MogulTvUser {
  /**
   * YouTube User ID
   */
  sub?: string;

  /**
   * MogulTV user name
   */
  name?: string;

  /**
   * Truffle User Access token
   */
  truffleAccessToken?: string;
}

export type ExtensionMappingSourceType =
  | "youtube"
  | "youtubeLive"
  | "youtubeVideo"
  | "twitch"
  | "url";

export type PageIdentifier = {
  sourceType: ExtensionMappingSourceType;
  sourceId: string;
};

export interface ExtensionInfo {
  version: string;
  pageInfo: PageIdentifier[];
  isExperimentalEnabled: boolean;
}

export interface ExtensionCredentials {
  token: string
  sourceType: ExtensionMappingSourceType
}