import { React, useStyleSheet } from "../../../deps.ts";

import { Page } from "../../page-stack/mod.ts";

import stylesheet from "./base-page.scss.js";

export default function BasePage() {
  useStyleSheet(stylesheet);

  return (
    <Page isFull={true} shouldShowHeader={false} shouldDisableEscape={true}>
      <div className="c-base-page">
      </div>
    </Page>
  );
}
