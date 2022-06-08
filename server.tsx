import { Router } from "wouter";
import staticLocationHook from "wouter/static-location";
import createServer from "https://raw.githubusercontent.com/deckchairlabs/ultra/v2/server.ts";
import { reactHelmetPlugin } from "https://raw.githubusercontent.com/deckchairlabs/ultra/v2/src/plugins/react-helmet.ts";
import { ServerAppProps } from "https://raw.githubusercontent.com/deckchairlabs/ultra/v2/src/types.ts";
import App from "./app/layout.tsx";

/**
 * This is the component that will be rendered server side.
 */
function ServerApp({ state }: ServerAppProps) {
  return (
    <Router hook={staticLocationHook(state.url.pathname)}>
      <App state={state} />
    </Router>
  );
}

const server = await createServer(ServerApp, {
  mode: "production",
  bootstrapModules: ["./client.tsx"],
});

/**
 * Register server plugins
 */
server.register(reactHelmetPlugin);

/**
 * Start the server!
 */
server.start({ port: 8000 });
