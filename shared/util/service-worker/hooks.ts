import { useEffect, useState } from "../../../deps.ts";

// NOTE: any site that uses mogul menu needs this file placed at the root of the site.
const SERVICE_WORKER_PATH = "/service-worker.js";

export function useServiceWorker() {
  const [swRegistration, setSwRegistration] = useState();

  useEffect(() => {
    // make sure the current env supports service workers
    if ("serviceWorker" in navigator) {
      // check if we've already registered a service worker for this domain
      navigator.serviceWorker.getRegistration(SERVICE_WORKER_PATH).then((registration) => {
        // if we found a registration, set it as the current registration
        if (registration) {
          setSwRegistration(registration);

          // otherwise, register our service worker
        } else {
          navigator.serviceWorker.register(SERVICE_WORKER_PATH).then(
            (registration) => {
              setSwRegistration(registration);

              if (registration.installing) {
                console.log("[mm] Service worker installing");
              } else if (registration.waiting) {
                console.log("[mm] Service worker installed");
              } else if (registration.active) {
                console.log("[mm] Service worker active");
              }
            },
          ).catch((error) => {
            console.error(`[mm] Registration failed with ${error}`);
          });
        }
      });
    }
  }, []);

  return { swRegistration };
}
