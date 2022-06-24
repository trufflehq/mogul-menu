import React, { useContext } from "https://npm.tfl.dev/react";
import { Component, context, Legacy, useObservables } from "@spore/platform";

export default function BrowserExtensionNotificationDialog(
  { transactionsObs, channelPointsImageObj, xpImageObj },
) {
  const { model, cssVars, overlay } = useContext(context);

  const { transactions } = useObservables(() => ({
    transactions: transactionsObs,
  }));

  const channelPointsSrc = channelPointsImageObj
    ? model.image.getSrcByImageObj(channelPointsImageObj)
    : "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";
  const xpSrc = xpImageObj
    ? model.image.getSrcByImageObj(xpImageObj)
    : "https://cdn.bio/assets/images/features/browser_extension/xp.svg";

  // todo make xp the seasonPass ouc
  const ORG_USER_COUNTER_TYPE_IMG_MAP = {
    "channel-points": channelPointsSrc,
    xp: xpSrc,
  };

  return (
    <div className="c-browser-extension-notification-dialog">
      <Component
        slug="dialog"
        props={{
          $title: "Notifications",
          minHeightPx: 420,
          $topRightButton: (
            <Component
              slug="icon"
              props={{
                icon: "close",
                color: cssVars.$primaryBaseText,
                isTouchTarget: true,
                onclick: () => {
                  overlay.close();
                },
              }}
            />
          ),
          $content: (
            <div className="content">
              {Legacy._.map(transactions, (transaction) => {
                return (
                  <div className="transaction">
                    <div className="info">
                      <div className="name">
                        {transaction?.economyAction?.name}
                      </div>
                      <div className="date">
                        {Legacy.DateService.fromNow(transaction?.date, " ago")}
                      </div>
                    </div>
                    <div className="score">
                      <div className="amount">
                        {BigInt(transaction?.amountValue) > 0
                          ? `+${transaction?.amountValue}`
                          : transaction?.amountValue}
                      </div>
                      <div className="icon">
                        {transaction?.amount?.slug && (
                          <Component
                            slug="image-by-aspect-ratio"
                            props={{
                              // FIXME, this is a hack since we need to pull the active season pass slug
                              imageUrl: ORG_USER_COUNTER_TYPE_IMG_MAP[
                                transaction?.amount?.slug
                              ] ?? xpSrc,
                              aspectRatio: 1,
                              widthPx:
                                transaction?.amount?.slug === "channel-points"
                                  ? 20
                                  : 24,
                              height:
                                transaction?.amount?.slug === "channel-points"
                                  ? 20
                                  : 24,
                            }}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ),
        }}
      />
    </div>
  );
}
