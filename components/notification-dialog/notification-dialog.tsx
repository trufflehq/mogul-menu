import React from "https://npm.tfl.dev/react";
import _ from "https://npm.tfl.dev/lodash?no-check";

import { getModel } from "https://tfl.dev/@truffle/api@0.0.1/legacy/index.js";
import useObservables from "https://tfl.dev/@truffle/utils@0.0.1/obs/use-observables.js";
import Button from "https://tfl.dev/@truffle/ui@0.0.1/components/button/button.js";
import ImageByAspectRatio from "https://tfl.dev/@truffle/ui@0.0.1/components/image-by-aspect-ratio/image-by-aspect-ratio.js";
import Dialog from "../dialog/dialog.tsx";
import { useDialog } from "../dialog-container/dialog-service.ts";
import { fromNow } from "../../util/general.ts";
import { gql, useQuery } from "https://tfl.dev/@truffle/api@0.0.1/client.js";

const TRANSACTIONS_QUERY = gql`
  query EconomyTransactionsQuery {
    economyTransactionConnection(first: 50) {
      nodes {
        amountValue
        date
        amount
        economyAction {
          name
        }
      }
    }
  }
`;

export default function BrowserExtensionNotificationDialog({
  channelPointsImageObj,
  xpImageObj,
}) {
  const { popDialog } = useDialog();

  const [{ data: transactionsData }] = useQuery({ query: TRANSACTIONS_QUERY });
  const transactions =
    transactionsData?.economyTransactionConnection?.nodes ?? [];

  const channelPointsSrc = channelPointsImageObj
    ? getModel().image.getSrcByImageObj(channelPointsImageObj)
    : "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";
  const xpSrc = xpImageObj
    ? getModel().image.getSrcByImageObj(xpImageObj)
    : "https://cdn.bio/assets/images/features/browser_extension/xp.svg";

  // todo make xp the seasonPass ouc
  const ORG_USER_COUNTER_TYPE_IMG_MAP: Record<string, any> = {
    "channel-points": channelPointsSrc,
    xp: xpSrc,
  };

  return (
    <div className="c-browser-extension-notification-dialog">
      <Dialog
        $title="Notifications"
        minHeightPx={420}
        $topRightButton={
          <Button
            icon="close"
            color="var(--tfl-color-on-bg-fill)"
            isTouchTarget={true}
            onClick={popDialog}
          />
        }
        $content={
          <div className="content">
            {_.map(transactions, (transaction) => {
              return (
                <div className="transaction">
                  <div className="info">
                    <div className="name">
                      {transaction?.economyAction?.name}
                    </div>
                    <div className="date">
                      {fromNow(transaction?.date, " ago")}
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
                        <ImageByAspectRatio
                          // FIXME, this is a hack since we need to pull the active season pass slug
                          imageUrl={
                            ORG_USER_COUNTER_TYPE_IMG_MAP[
                              transaction?.amount?.slug
                            ] ?? xpSrc
                          }
                          aspectRatio={1}
                          widthPx={
                            transaction?.amount?.slug === "channel-points"
                              ? 20
                              : 24
                          }
                          height={
                            transaction?.amount?.slug === "channel-points"
                              ? 20
                              : 24
                          }
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        }
      />
    </div>
  );
}
