import React from "https://npm.tfl.dev/react";

import Icon from "https://tfl.dev/@truffle/ui@~0.1.0/components/legacy/icon/icon.tsx";
import ScopedStylesheet from "https://tfl.dev/@truffle/ui@~0.1.0/components/legacy/scoped-stylesheet/scoped-stylesheet.tsx";

export default function Page({ title, headerTopRight, onBack, content }) {
  return (
    <ScopedStylesheet url={new URL("page.css", import.meta.url)}>
      <div className="c-page">
        <div className="header">
          <div className="left">
            <div className="back-icon">
              <Icon
                icon="back"
                color="var(--tfl-color-on-bg-fill)"
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
