import React from "https://npm.tfl.dev/react";
import { ActionBannerObj } from '../../util/action-banner/manager.ts'

export default function ActionBannerContainer({ actionBannerObj }: { actionBannerObj: ActionBannerObj }) {
  return (
    <div className="c-action-banner-container">
      {Object.entries(actionBannerObj).map(([id, { Component }]) => (
        <div key={id} className="action-banner-container">
          {/* {typeof Component === "function" ? <Component /> : Component} */}
          {Component}
        </div>
      ))}
    </div>
  );
}
