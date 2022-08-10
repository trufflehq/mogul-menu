import SeasonPass from "../season-pass/season-pass.tsx";
import LinkButton from "../base/link-button/link-button.tsx";
import EconomyActionDialog from "../dialogs/economy-action-dialog/economy-action-dialog.tsx";
import {
  React,
  op,
  _,
  useObservables,
  queryObservable,
  gql,
  getHost,
  useStyleSheet,
  useMemo,
} from "../../deps.ts";
import { useDialog } from "../base/dialog-container/dialog-service.ts";
import Button from "../base/button/button.tsx";
import styleSheet from "./season-pass-tab.scss.js";
import ConnectedAccounts from "../connected-accounts/connected-accounts.tsx";

// HACK - plan is to move to a model where we can view all of the economy actions,
// just showing watchtime and linking to the site for now
const XP_INCREMENT_TRIGGER_ID = "b9d69a60-929e-11ec-b349-c56a67a258a0";
const XP_CLAIM_TRIGGER_ID = "fc93de80-929e-11ec-b349-c56a67a258a0";

const SEASON_PASS_QUERY = gql`
  query {
    seasonPass {
      economyActionConnection {
        nodes {
          economyTriggerId
          name
          amountValue
          data {
            description
          }
        }
      }
    }
  }
`;

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

function XpActionsDialog({ xpSrc }) {
  const { seasonPassWatchTimeActionsObs } = useMemo(() => {
    const seasonPassObs = queryObservable(SEASON_PASS_QUERY);

    const seasonPassWatchTimeActionsObs = seasonPassObs.pipe(
      op.map((result) => result?.data?.seasonPass),
      op.map((seasonPass) => {
        return _.filter(
          seasonPass?.economyActionConnection?.nodes,
          (action) =>
            action?.economyTriggerId === XP_INCREMENT_TRIGGER_ID ||
            action?.economyTriggerId === XP_CLAIM_TRIGGER_ID
        );
      })
    );
    return {
      seasonPassWatchTimeActionsObs,
    };
  }, []);

  const { seasonPassWatchTimeActions } = useObservables(() => ({
    seasonPassWatchTimeActions: seasonPassWatchTimeActionsObs,
  }));

  return (
    <EconomyActionDialog
      economyActions={seasonPassWatchTimeActions}
      orgUserCounterTypeSrc={xpSrc}
      title={"How to earn XP"}
      $bottom={<LearnMoreButton />}
    />
  );
}

function LearnMoreButton() {
  const clickHandler = () => {
    window.open(getHost(), "_blank", "noreferrer");
  };
  return (
    <div className="c-learn-more">
      <div className="title">Earn XP through linked accounts</div>
      <Button style="primary" onClick={clickHandler}>
        Learn more
      </Button>
    </div>
  );
}
