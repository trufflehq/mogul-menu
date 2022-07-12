import React from "https://npm.tfl.dev/react";
import SeasonPass from "../season-pass/season-pass.tsx";
import ScopedStylesheet from "https://tfl.dev/@truffle/ui@0.0.1/components/scoped-stylesheet/scoped-stylesheet.js";

export default function SeasonPassTab() {
  // const { org } = useObservables(() => ({
  //   org: getModel().org.getMe(),
  // }));

  // const xpSrc = props?.xpImageObj
  //   ? getSrcByImageObj(props.xpImageObj)
  //   : "https://cdn.bio/assets/images/features/browser_extension/xp.svg";
  const xpSrc = "https://cdn.bio/assets/images/features/browser_extension/xp.svg";

  const onHowToEarnClick = () => {
    // overlay.open(() => <XpActionsDialog xpSrc={xpSrc} />);
  };
  return (
    <ScopedStylesheet url={new URL("season-pass-tab.css", import.meta.url)}>
      <div className="c-season-pass-tab">
        <SeasonPass
          // onViewCollection={onViewCollection}
          // highlightButtonBg={highlightButtonBg}
          // enqueueSnackBar={enqueueSnackBar}
        />
        <div className="title">Earn XP</div>
        <div className="description">
          Connect your accounts to start earning XP
        </div>
        <div className="learn-more" onClick={onHowToEarnClick}>
          How do I earn XP?
        </div>
        {
          /* {org?.slug !== "faze" && (
          <Component
            slug="browser-extension-ways-to-earn"
            props={{ enqueueSnackBar }}
          />
        )} */
        }
      </div>
    </ScopedStylesheet>
  );
}
