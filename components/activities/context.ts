import { createContext } from '../../deps.ts';

export interface ActivityBannerContext {
  isBannerOpen: boolean;
  setIsBannerOpen: (isBannerOpen: boolean) => void;
}

export const ActivityBannerContext = createContext<ActivityBannerContext>(undefined!);
