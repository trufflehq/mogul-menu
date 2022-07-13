import React, { useRef, useState } from "https://npm.tfl.dev/react";
import useObservables from "https://tfl.dev/@truffle/utils@0.0.1/obs/use-observables.js";
import {
  abbreviateNumber,
  formatNumber,
} from "https://tfl.dev/@truffle/utils@0.0.1/format/format.js";
import _ from "https://npm.tfl.dev/lodash?no-check";

import ImageByAspectRatio from "https://tfl.dev/@truffle/ui@0.0.1/components/image-by-aspect-ratio/image-by-aspect-ratio.js";
import Spinner from "https://tfl.dev/@truffle/ui@0.0.1/components/spinner/spinner.js";
import Button from "https://tfl.dev/@truffle/ui@0.0.1/components/button/button.js";
import classKebab from "https://tfl.dev/@truffle/utils@0.0.1/legacy/class-kebab.js";
import ScopedStylesheet from "https://tfl.dev/@truffle/ui@0.0.1/components/scoped-stylesheet/scoped-stylesheet.js";
import Icon from "https://tfl.dev/@truffle/ui@0.0.3/components/icon/icon.js";
import { getSrcByImageObj } from "https://tfl.dev/@truffle/utils@~0.0.2/legacy/image.js";
import { gql, useMutation, useQuery } from "https://tfl.dev/@truffle/api@^0.1.0/client.js";
import { useDialog } from "../dialog-container/dialog-service.ts";
import { setActiveTab } from "../../util/tabs/active-tab.ts";
import Dialog from "../dialog/dialog.tsx";
import ItemDialog from "../item-dialog/item-dialog.tsx";
import RedeemableDialog from "../redeemable-dialog/redeemable-dialog.tsx";
import UnlockedEmoteDialog from "../unlocked-emote-dialog/unlocked-emote-dialog.tsx";

// TODO pull from EconomyTrigger model once we set that up
const CP_PURCHASE_ECONOMY_TRIGGER_ID = "4246f070-6f68-11ec-b706-956d4fcf75c0";

const CHANNEL_POINTS_SHOP_QUERY = gql`
  query ChannelPointsShopQuery {
    productConnection(input: { sourceType: "collectible" }) {
      nodes {
        id
        source
        productVariants {
          nodes {
            amountType
            amountId
            amountValue
          }
        }
      }
    }
  }
`;

const CHANNEL_POINTS_QUERY = gql`
  query ChannelPointsQuery {
    channelPoints: orgUserCounterType(input: { slug: "channel-points" }) {
      orgUserCounter {
        count
      }
    }
  }
`;

const CHANNEL_POINTS_SHOP_PURCHASE_MUTATION = gql`
  mutation ChannelPointsShopPurchase($productId: String!) {
    economyTransactionCreate(
      input: {
        economyTriggerSlug: "channel-points-store-purchase"
        amountSourceId: $productId
      }
    ) {
      economyTransaction {
        id
      }
    }
  }
`;

const testImg = {
  cdn: "cdn.bio",
  data: {
    name: "3.0",
    aspectRatio: 1,
    width: 112,
    height: 112,
    length: 16420,
  },
  prefix: "collectible/73035c80-bae5-11ec-bc90-7b62339255c4",
  contentType: "image/png",
  type: "image",
  variations: [
    {
      postfix: ".tiny",
      width: 32,
      height: 32,
    },
    {
      postfix: ".small",
      width: 128,
      height: 128,
    },
    {
      postfix: ".large",
      width: 256,
      height: 256,
    },
  ],
  ext: "png",
};

const MESSAGE = {
  INVALIDATE_USER: "user.invalidate",
};

export default function ChannelPointsShop() {
  const channelPointsImageObj = undefined;

  // const {
  //   channelPointsOrgUserCounterObs,
  //   channelPointsImageObj,
  //   onViewCollection,
  //   buttonBg,
  //   onHowToEarnClick,
  //   enqueueSnackBar,
  // } = props;
  // const { model } = useContext(context);

  // shop items
  const [{ data: storeItemsData }] = useQuery({
    query: CHANNEL_POINTS_SHOP_QUERY,
  });
  const storeCollectibleItems = _.sortBy(
    storeItemsData?.productConnection?.nodes ?? [],
    (node) => {
      return node?.productVariants?.nodes?.[0]?.amountValue;
    },
  );

  // channel points
  const [{ data: channelPointsData }] = useQuery({
    query: CHANNEL_POINTS_QUERY,
  });
  const channelPoints = channelPointsData?.channelPoints?.orgUserCounter;

  const onHowToEarnClick = () => null;

  // const channelPointsSrc =
  //   model.image.getSrcByImageObj(channelPointsImageObj) ??
  //   "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";
  const channelPointsSrc =
    "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";
  const isLoading = !storeCollectibleItems;

  return (
    <ScopedStylesheet url={new URL("channel-points-shop.css", import.meta.url)}>
      <div className="c-channel-points-shop">
        <div className="header">
          <div className="title">Shop Items</div>
          <div className="channel-points">
            <div className="icon">
              <ImageByAspectRatio
                imageUrl={channelPointsSrc}
                aspectRatio={1}
                widthPx={16}
                height={16}
              />
            </div>
            <div className="amount">
              {abbreviateNumber(channelPoints?.count || 0, 1)}
            </div>
          </div>
        </div>
        {isLoading && <Spinner />}
        {!isLoading && (
          <>
            {!_.isEmpty(storeCollectibleItems) && (
              <div className="items">
                {_.map(storeCollectibleItems, (storeCollectibleItem: any) => {
                  return (
                    <CollectibleItem
                      channelPointsImageObj={channelPointsImageObj}
                      channelPoints={channelPoints}
                      collectibleItem={storeCollectibleItem}
                    />
                  );
                })}
              </div>
            )}
            <div className="how-to-earn">
              <div className="title">Earn Channel points</div>
              <div className="description">
                Start earning channel points to spend in the shop
              </div>
              <div className="link">
                <Button
                  text={"How do I earn channel points?"}
                  size={"small"}
                  style={"link"}
                  onclick={onHowToEarnClick}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </ScopedStylesheet>
  );
}

function CollectibleItem(props) {
  const { channelPoints, collectibleItem, channelPointsImageObj, buttonBg } = props;

  const { pushDialog, popDialog } = useDialog();

  const $$itemRef = useRef();

  const file = collectibleItem?.source?.fileRel;

  const amount = collectibleItem.productVariants.nodes[0].amountValue;

  const hasSufficientFunds = channelPoints?.count >= amount;
  // const channelPointsSrc =
  //   model.image.getSrcByImageObj(channelPointsImageObj) ??
  //   "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";

  const channelPointsSrc =
    "https://cdn.bio/assets/images/features/browser_extension/channel-points-default.svg";

  const onPurchaseRequestHandler = () => {
    // open confirmation dialog
    pushDialog(
      <ConfirmPurchaseDialog
        collectibleItem={collectibleItem}
        channelPointsImageObj={channelPointsImageObj}
        buttonBg="var(--truffle-gradient)"
      />,
    );
  };

  return (
    <div
      className={`item ${
        classKebab({
          isDisabled: !hasSufficientFunds,
        })
      }`}
      ref={$$itemRef}
    >
      <div className="overlay" />
      <div className="card">
        <div className="image">
          <ImageByAspectRatio
            imageUrl={getSrcByImageObj(file?.fileObj)}
            aspectRatio={file?.fileObj?.data?.aspectRatio}
            height={64}
            width={64}
          />
        </div>
        <div className="title">{collectibleItem?.source?.name ?? ""}</div>
        <div className="bottom" onClick={onPurchaseRequestHandler}>
          <div className="amount">{formatNumber(amount)}</div>
          <div className="icon">
            <ImageByAspectRatio
              imageUrl={channelPointsSrc}
              aspectRatio={1}
              width={18}
              height={18}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmPurchaseDialog({
  collectibleItem,
  channelPointsImageObj,
  buttonBg,
}) {
  // const { org } = useStream(() => ({
  //   org: model.org.getMe(),
  // }));

  const { pushDialog, popDialog } = useDialog();

  const file = collectibleItem?.source?.fileRel;
  const amount = collectibleItem.productVariants.nodes[0].amountValue;

  const [_purchaseResult, executePurchaseMutation] = useMutation(
    CHANNEL_POINTS_SHOP_PURCHASE_MUTATION,
  );

  // const channelPointsSrc =
  //   model.image.getSrcByImageObj(channelPointsImageObj) ??
  //   "https://cdn.bio/assets/images/features/chrome_extension/channel-points.svg";
  const channelPointsSrc =
    "https://cdn.bio/assets/images/features/chrome_extension/channel-points.svg";

  const onPurchaseHandler = async () => {
    await executePurchaseMutation(
      { productId: collectibleItem.id },
      { additionalTypenames: ["OrgUserCounter", "OwnedCollectible"] },
    );
    // alert(`You purchased a ${collectibleItem.source.name}!`);
    // onViewCollection?.();
    // await model.economyTransaction.create({
    //   economyTriggerSlug: "channel-points-store-purchase",
    //   amountSourceId: collectibleItem.id,
    // });
    // browserComms.call("user.invalidateSporeUser", { orgId: org?.id });
    // browserComms.call("comms.postMessage", MESSAGE.INVALIDATE_USER);
    // // close confirmation dialog
    // overlay.close();
    // // open purchase notification dialog
    // overlay.open(NotifyPurchaseDialog, {
    //   onViewCollection,
    //   collectibleItem,
    //   buttonBg,
    //   enqueueSnackBar,
    // });
    popDialog();
    pushDialog(
      <NotifyPurchaseDialog
        collectibleItem={collectibleItem}
        buttonBg={buttonBg}
      />,
    );
  };

  return (
    <div className="confirm-purchase-dialog">
      <Dialog
        $content={
          <div className="body">
            <div className="image">
              <ImageByAspectRatio
                imageUrl={getSrcByImageObj(file?.fileObj)}
                aspectRatio={file?.fileObj?.data?.aspectRatio}
                heightPx={56}
                widthPx={56}
              />
            </div>
            <div className="info">
              <div className="name">{collectibleItem?.source?.name ?? ""}</div>
              <div className="cost">
                <div className="value">{formatNumber(amount)}</div>
                <ImageByAspectRatio
                  imageUrl={channelPointsSrc}
                  aspectRatio={1}
                  widthPx={15}
                  height={15}
                />
              </div>
              {(collectibleItem?.source?.data?.description && (
                <div className="description">
                  {collectibleItem?.source?.data?.description}
                </div>
              )) || (
                <div className="description">
                  Add {collectibleItem?.source?.name ?? ""} to your collection
                </div>
              )}
            </div>
          </div>
        }
        $actions={
          <div className="action">
            <Button
              text={`Buy ${collectibleItem?.source?.name ?? ""}`}
              bg={buttonBg}
              isFullWidth={true}
              onClick={onPurchaseHandler}
            />
          </div>
        }
        $topRightButton={
          <div className="close-button">
            <Icon
              icon="close"
              color="var(--tfl-color-on-bg-fill)"
              onclick={popDialog}
            />
          </div>
        }
      />
    </div>
  );
}

function NotifyPurchaseDialog({ collectibleItem, buttonBg }) {
  const { popDialog } = useDialog();

  const onViewCollectionHandler = () => {
    popDialog();
    setActiveTab("collection");
  };

  const file = collectibleItem?.source?.fileRel;
  const actionMessage = collectibleItem?.source?.data?.category === "flair"
    ? "Redeem in Profile Tab"
    : "View collection";
  const isEmote = collectibleItem?.source?.type === "emote";
  const isRedeemable = collectibleItem?.source?.type === "redeemable";

  return (
    <>
      {isEmote
        ? <UnlockedEmoteDialog reward={collectibleItem} />
        : isRedeemable
        ? <RedeemableDialog redeemableCollectible={collectibleItem} />
        : (
          <ItemDialog
            imgRel={file}
            onExit={popDialog}
            primaryText={
              <div>
                <strong>{collectibleItem?.source?.name ?? ""}</strong> added to your collection!
              </div>
            }
            buttons={[
              {
                text: actionMessage,
                bg: buttonBg,
                onClick: onViewCollectionHandler,
              },
            ]}
          />
        )}
    </>
  );
}
