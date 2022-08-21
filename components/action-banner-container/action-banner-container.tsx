import { React } from "../../deps.ts";
import { useActionBanner } from '../../util/mod.ts'

export default function ActionBannerContainer() {
  const { actionBannerObj } = useActionBanner();

  return (
    <div className="c-action-banner-container">
      {Object.entries(actionBannerObj).map(([id, { Component }]) => (
        <div key={id} className="action-banner-container">
          {Component}
        </div>
      ))}
    </div>
  );
}
