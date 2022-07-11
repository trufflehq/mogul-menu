import React from "https://npm.tfl.dev/react";
import root from "https://npm.tfl.dev/react-shadow@19";
import useObservables from "https://tfl.dev/@truffle/utils@0.0.1/obs/use-observables.js";

export default function PageStack({
  pageStackSubject,
  background = "var(--tfl-color-bg-fill)",
}) {
  const { pageStack } = useObservables(() => ({
    pageStack: pageStackSubject.obs,
  }));

  const isPageStackEmpty = pageStack.length === 0;

  return (
    <>
      {isPageStackEmpty ? (
        <></>
      ) : (
        <root.div>
          <link
            rel="stylesheet"
            href={new URL("page-stack.css", import.meta.url).toString()}
          />
          <div className="c-page-stack" style={{ "--background": background }}>
            <div className="container">
              {pageStack.map((Component, idx) => (
                <div key={idx} className="page">
                  {typeof Component === "function" ? <Component /> : Component}
                </div>
              ))}
            </div>
          </div>
        </root.div>
      )}
    </>
  );
}
