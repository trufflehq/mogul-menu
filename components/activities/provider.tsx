import { React, useState } from "../../deps.ts";
import { ActivityBannerContext } from "./context.ts";

export function ActivityBannerProvider({ children }: { children: React.ReactNode }) {
  const [isBannerOpen, setIsBannerOpen] = useState(false);
  return (
    <ActivityBannerContext.Provider
      value={{
        isBannerOpen,
        setIsBannerOpen,
      }}
    >
      {children}
    </ActivityBannerContext.Provider>
  );
}
