import React from "https://npm.tfl.dev/react";

import Icon from "https://tfl.dev/@truffle/ui@0.0.1/components/icon/icon.js";
import ScopedStylesheet from "https://tfl.dev/@truffle/ui@0.0.1/components/scoped-stylesheet/scoped-stylesheet.js";

export default function Page({ title, headerTopRight, onBack, content }) {
  return (
    <ScopedStylesheet url={new URL("page.css", import.meta.url)}>
      <div className="c-page">
        <div className="header">
          <div className="left">
            <div className="back-icon">
              <Icon
                icon="back"
                color="var(--truffle-color-text-bg-primary)"
                onclick={onBack}
              />
            </div>
            <div className="text">{title}</div>
          </div>
          {headerTopRight && <div className="right">{headerTopRight}</div>}
        </div>
        <div className="content">{content}</div>
      </div>
    </ScopedStylesheet>
  );
}
