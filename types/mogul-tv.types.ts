import { PageIdentifier } from '../deps.ts'

export interface ExtensionInfo {
  version: string;
  pageInfo: PageIdentifier[];
  isExperimentalEnabled: boolean;
}
