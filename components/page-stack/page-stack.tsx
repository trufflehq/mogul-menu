import { React, useObservables, useStyleSheet } from "../../deps.ts";
import styleSheet from "./page-stack.scss.js";

export default function PageStack({
  pageStackSubject,
  background = "var(--mm-color-bg-primary)",
}) {
  useStyleSheet(styleSheet);
  const { pageStack } = useObservables(() => ({
    pageStack: pageStackSubject.obs,
  }));

  const isPageStackEmpty = pageStack.length === 0;

  return (
    <>
      {isPageStackEmpty ? (
        <></>
      ) : (
        <div className="c-page-stack" style={{ "--background": background }}>
          <div className="container">
            {pageStack.map((Component, idx) => (
              <div key={idx} className="page">
                {typeof Component === "function" ? <Component /> : Component}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
