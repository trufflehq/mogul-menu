import { React, useStyleSheet, _ } from "../../../deps.ts";
import Dialog from "../../base/dialog/dialog.tsx";
import styleSheet from "./economy-action-dialog.scss.js";

export default function EconomyActionDialog({
  title,
  economyActions,
  orgUserCounterTypeSrc,
}) {
  useStyleSheet(styleSheet);
  return (
    <Dialog headerStyle="primary" headerText={title}>
      <div className="c-economy-action-dialog">
        {_.map(economyActions, (action) => {
          return (
            <EconomyAction
              economyAction={action}
              orgUserCounterTypeSrc={orgUserCounterTypeSrc}
            />
          );
        })}
      </div>
    </Dialog>
  );
}

function EconomyAction({ economyAction, orgUserCounterTypeSrc }) {
  return (
    <div className="economy-action">
      <div className="name">{economyAction?.name}</div>
      <div className="reward">
        <div className="icon">
          <img src={orgUserCounterTypeSrc} width="24" />
        </div>
        <div className="amount">
          {economyAction?.amountValue > 0
            ? economyAction?.amountValue
            : economyAction?.data?.amountDescription}
        </div>
      </div>
      <div className="description">{economyAction?.data?.description}</div>
    </div>
  );
}
