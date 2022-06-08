import { Helmet, HelmetProvider } from "react-helmet";
import { Route, Switch } from "wouter";
import type { RenderState } from "https://raw.githubusercontent.com/deckchairlabs/ultra/v2/server.ts";

import HomePage from './home/page.tsx'

type AppProps = {
  state: RenderState;
};

const Ultra = ({ state }: AppProps) => {
  return (
    <HelmetProvider context={state}>
      <html lang="en">
        <head>
          <Helmet>
            <title>Ultra</title>
            <link rel="icon" type="image/x-icon" href="/public/favicon.ico" />
            <link rel="stylesheet" href="/styles/global.css" />
          </Helmet>
        </head>
        <body>
          <main>
            <Switch>
              <Route path="/">
                {/* no ssr support yet (deno doesn't support import assertions yet) */}
                {/* https://github.com/denoland/deno/issues/13898 and https://github.com/denoland/deno/issues/11961 */}
                {typeof document !== undefined && <HomePage />}
              </Route>
              <Route>
                <strong>404</strong>
              </Route>
            </Switch>
          </main>
        </body>
      </html>
    </HelmetProvider>
  );
};

export default Ultra;
