import React, { lazy, Suspense } from 'react'
import { Helmet, HelmetProvider } from "react-helmet";
import { Route, Switch } from "wouter";
import type { RenderState } from "https://raw.githubusercontent.com/austinhallock/ultra/v2/server.ts";
import { useAsync } from "@ultra/react";

import { TruffleSetup } from 'https://tfl.dev/@truffle/utils@0.0.1/ultra/setup.jsx'

type AppProps = {
  state: RenderState;
};

const HomePage = lazy(() => import('./home/page.tsx'))

const Ultra = ({ state }: AppProps) => {
  return (
    <HelmetProvider context={state}>
      <html lang="en">
        <head>
          <Helmet>
            <title>FIXME</title>
            <script>
              {`window.esmsInitOptions = { polyfillEnable: ['css-modules', 'json-modules'] }`}
            </script>
            <script async src="https://unpkg.com/construct-style-sheets-polyfill@3.1.0/dist/adoptedStyleSheets.js"></script>
            <script async src="https://ga.jspm.io/npm:es-module-shims@1.5.6/dist/es-module-shims.js"></script>
            {/* TODO: get preact working with ultra v2.
              jsx-runtime: Cannot read properties of undefined (reading 'current') */}
            {/* <script type="importMap">
              {`{
                "imports": {
                  "react": "https://esm.sh/preact/compat",
                  "react-dom": "https://esm.sh/preact/compat/client",
                  "https://esm.sh/react@18.2.0-next-47944142f-20220608": "https://esm.sh/preact/compat",
                  "https://esm.sh/react-dom@18.2.0-next-47944142f-20220608": "https://esm.sh/preact/compat/client",
                  "https://esm.sh/v85/react@18.2.0-next-47944142f-202206/es2022/react.js": "https://esm.sh/preact/compat",
                  "https://esm.sh/v85/react-dom@18.2.0-next-47944142f-202206/es2022/react-dom.js": "https://esm.sh/preact/compat",
                  "https://esm.sh/react-dom@18.2.0-next-47944142f-20220608/client": "https://esm.sh/preact/compat",
                  "prop-types": "https://esm.sh/prop-types"
                }
              }`}
            </script> */}
            <script type="importMap">
              {`{
                "imports": {
                  "react": "https://esm.sh/react@18.2.0-next-47944142f-20220608?dev",
                  "react-dom": "https://esm.sh/react-dom@18.2.0-next-47944142f-20220608?dev",
                  "prop-types": "https://esm.sh/prop-types"
                }
              }`}
            </script>
            <link rel="stylesheet" href="/public/global.css" />
          </Helmet>
        </head>
        <body>
          <TruffleSetup state={state} useAsync={useAsync}>
            <main>
              <Switch>
                <Route>
                  <HomePage state={state} />
                </Route>
              </Switch>
            </main>
          </TruffleSetup>
        </body>
      </html>
    </HelmetProvider>
  );
};

export default Ultra;
