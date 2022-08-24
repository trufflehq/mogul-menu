import SeasonPass from "../season-pass/season-pass.tsx";
import LinkButton from "../base/link-button/link-button.tsx";
import EconomyActionDialog from "../dialogs/economy-action-dialog/economy-action-dialog.tsx";
import {
  _,
  gql,
  op,
  queryObservable,
  React,
  useMemo,
  useObservables,
  useStyleSheet,
} from "../../deps.ts";
import { useDialog } from "../base/dialog-container/dialog-service.ts";
import Button from "../base/button/button.tsx";
import styleSheet from "./season-pass-tab.scss.js";
import ConnectedAccounts from "../connected-accounts/connected-accounts.tsx";
import XpActionsDialog from "../dialogs/xp-actions-dialog/xp-actions-dialog.tsx";

export default function SeasonPassTab() {
  useStyleSheet(styleSheet);
  const { pushDialog } = useDialog();

  // const { org } = useObservables(() => ({
  //   org: getModel().org.getMe(),
  // }));

  // const xpSrc = props?.xpImageObj
  //   ? getSrcByImageObj(props.xpImageObj)
  //   : "https://cdn.bio/assets/images/features/browser_extension/xp.svg";
  const xpSrc =
    "https://cdn.bio/assets/images/features/browser_extension/xp.svg";

  const onHowToEarnClick = () => {
    pushDialog(<XpActionsDialog xpSrc={xpSrc} />);
  };
  return (
    <div className="c-season-pass-tab">
      <SeasonPass />
      <div className="mm-text-header-caps title">Earn XP</div>
      <div className="mm-text-body-1 description">
        Connect your accounts to start earning XP
      </div>
      <LinkButton className="how-to-earn-link" onClick={onHowToEarnClick}>
        How do I earn XP?
      </LinkButton>
      <div className="mm-text-header-caps connections-heading">Connections</div>
      <ConnectedAccounts />
    </div>
  );
}
