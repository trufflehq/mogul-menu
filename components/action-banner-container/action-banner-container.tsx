import React from "https://npm.tfl.dev/react";
import useObservables from "https://tfl.dev/@truffle/utils@0.0.1/obs/use-observables.js";
import { ActionBanner, ActionBannerObj } from '../../util/action-banner/manager.ts'

interface ActionBannerObs {
  actionBannerObj: ActionBannerObj
}

export default function ActionBannerContainer({ actionBannerObjSubject }) {
  const obs: ActionBannerObs = useObservables(() => ({
    actionBannerObj: actionBannerObjSubject.obs,
  }));
  


  return (
    <div className="c-action-banner-container">
      {Object.entries(obs.actionBannerObj).map(([id, { Component }]) => (
        <div key={id} className="action-banner-container">
          {/* {typeof Component === "function" ? <Component /> : Component} */}
          {Component}
        </div>
      ))}
    </div>
  );
}
