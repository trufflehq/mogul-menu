import { PageIdentifier } from '../../types/mod.ts'

export const isYoutubeSourceType = (sourceType: string) =>
  sourceType === "youtube" ||
  sourceType === "youtubeLive" ||
  sourceType === "youtubeVideo";

export const getYoutubePageIdentifier = (pageInfoIdentifiers: PageIdentifier[]) =>
  pageInfoIdentifiers?.find((identifier) => isYoutubeSourceType(identifier.sourceType));

export const isTwitchSourceType = (sourceType: string) => sourceType === "twitch";

export const getTwitchPageIdentifier = (pageInfoIdentifiers: PageIdentifier[]) =>
  pageInfoIdentifiers?.find((identifier) => isTwitchSourceType(identifier.sourceType));
