import React from "https://npm.tfl.dev/react";
import { toDist } from "https://tfl.dev/@truffle/distribute@^1.0.0/format/wc/index.ts";

import Menu from "../../components/menu/menu.tsx";

function HomePage() {
  return <Menu />;
}

export default toDist("react", HomePage, import.meta.url);
