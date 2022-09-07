import { React, useEffect, useStyleSheet } from "../../deps.ts";
import styleSheet from "./page-stack.scss.js";
import { usePageStack } from "./hooks.ts";

export default function PageStack({
  background = "var(--mm-color-bg-primary)",
}: {
  background?: string;
}) {
  const { pageStack, popPage, peekPage } = usePageStack();
  useStyleSheet(styleSheet);

  const isPageStackEmpty = !pageStack || pageStack.length === 0;

  const handleEscape = (ev: KeyboardEvent) => {
    const top = peekPage();
    const isEscapeDisabled = top?.isEscapeDisabled;
    if (ev.key === "Escape" && !isEscapeDisabled) {
      popPage();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleEscape, false);

    return () => {
      document.removeEventListener("keydown", handleEscape, false);
    };
  }, [JSON.stringify(pageStack)]);
  return (
    <>
      {isPageStackEmpty
        ? <></>
        : (
          <div className="c-page-stack" style={{ "--background": background }}>
            {pageStack.map(({ Component }, idx) => (
              <div key={idx} className="page">
                {Component}
              </div>
            ))}
          </div>
        )}
    </>
  );
}
