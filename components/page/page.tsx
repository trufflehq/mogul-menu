import React from "react";

import Icon from "https://tfl.dev/@truffle/ui@0.0.1/components/icon/icon.jsx";
import cssVars from "https://tfl.dev/@truffle/ui@0.0.1/util/css-vars.js";

export default function Page({ title, headerTopRight, onBack, content }) {
  return (
    <div className="c-page">
      <div className="header">
        <div className="left">
          <div className="back-icon">
            <Icon
              icon="back"
              color={cssVars.$bgBaseText}
              onclick={onBack}
            />
          </div>
          <div className="text">{title}</div>
        </div>
        {headerTopRight && (
          <div className="right">
            {headerTopRight}
          </div>
        )}
      </div>
      <div className="content">
        {content}
      </div>
    </div>
  );
}
