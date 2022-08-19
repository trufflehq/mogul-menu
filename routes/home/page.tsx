import React from "https://npm.tfl.dev/react";
import { toDist } from "https://tfl.dev/@truffle/distribute@^2.0.0/format/wc/react/index.ts";
import Menu from "../../components/menu/menu.tsx";
// import MenuWrapper from '../../components/menu-wrapper/menu-wrapper.tsx'

function HomePage() {
  return (
    <>
      <Menu />
    </>
  );
}

export default toDist(HomePage, import.meta.url);
