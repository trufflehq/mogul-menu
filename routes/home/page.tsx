import React from "https://npm.tfl.dev/react";
import { toDist } from "https://tfl.dev/@truffle/distribute@^2.0.0/format/wc/react/index.ts";
import ThemeComponent from "../../components/base/theme-component/theme-component.tsx";

import Menu from "../../components/menu/menu.tsx";

function HomePage() {
  return (
    <>
      <ThemeComponent />
      <Menu />
    </>
  );
}

export default toDist(HomePage, import.meta.url);
