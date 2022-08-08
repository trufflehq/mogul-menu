import React, { useState } from "https://npm.tfl.dev/react";
import classKebab from "https://tfl.dev/@truffle/utils@0.0.1/legacy/class-kebab.js";
import { getSrcByImageObj } from "../../deps.ts";

import ScopedStylesheet from "../base/stylesheet/stylesheet.tsx";
import Button from "../base/button/button.tsx";
import Dialog from "https://tfl.dev/@truffle/ui@~0.1.0/components/dialog/dialog.entry.js";
import RedeemableDialog from "../dialogs/redeemable-dialog/redeemable-dialog.tsx";
import { useDialog } from "../base/dialog-container/dialog-service.ts";

export default function Collctible(props) {
  const { collectible, activePowerup, sizePx = 60 } = props;

  const isOwned = collectible?.ownedCollectible?.count || activePowerup;

  const imageUrl = getSrcByImageObj(collectible?.fileRel?.fileObj);
  const canRedeem =
    collectible.type === "redeemable" &&
    ["user", "none"].includes(collectible.targetType);

  const { pushDialog, popDialog } = useDialog();

  const onRedeemHandler = () => {
    pushDialog(
      <RedeemableDialog
        primaryText={collectible.name}
        redeemableCollectible={{ source: collectible }}
        onExit={popDialog}
      />
    );
  };

  return (
    <ScopedStylesheet url={new URL("collectible.css", import.meta.url)}>
      <div className={`c-collectible ${classKebab({ isOwned })}`}>
        <div
          className="image"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "100%",
            width: `${sizePx}px`,
            height: `${sizePx}px`,
          }}
        />
        {collectible?.name && (
          <div className="info">
            <div className="name">{collectible?.name}</div>
            {collectible?.ownedCollectible?.count ? (
              <div className="count">
                {`x${collectible?.ownedCollectible?.count}`}
              </div>
            ) : null}
          </div>
        )}
        {isOwned && canRedeem && (
          <div
            className={`button ${classKebab({
              isActive: Boolean(activePowerup),
            })}`}
          >
            <Button
              onClick={onRedeemHandler}
              shouldHandleLoading={true}
              border={true}
              size="small"
            >
              {activePowerup ? (
                <span style={{ color: "var(--mm-color-positive)" }}>
                  Active
                </span>
              ) : (
                collectible?.data?.redeemButtonText ?? "Redeem"
              )}
            </Button>
          </div>
        )}
      </div>
    </ScopedStylesheet>
  );
}
