import React from "https://npm.tfl.dev/react";
import Menu from "../../components/menu/menu.tsx";
import ThemeComponent from "https://tfl.dev/@truffle/ui@0.0.1/components/theme/theme-component.js";

export default function MenuPage() {
  return (
    <>
      <style>
        {/* TODO: figure out a better place for this hack */}
        {`
          body,
          html {
            height: 100%;
          }
        `}
      </style>
      <ThemeComponent />
      <Menu />
    </>
  );
}
