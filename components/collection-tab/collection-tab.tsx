import React, { useEffect } from "react";
import { useTabId } from "../../util/tabs/tab-id.ts";
import { useSnackBar } from "https://tfl.dev/@truffle/ui@0.0.1/util/snack-bar.js";
import SnackBar from "https://tfl.dev/@truffle/ui@0.0.1/components/snack-bar/snack-bar.jsx";

export default function CollectionTab() {
  const tabId = useTabId();

  useEffect(() => {
    console.log("collection tab id", tabId);
  }, [tabId]);

  const enqueueSnackBar = useSnackBar();
  // let's try showing a snackbar 5 seconds after the extension menu loads
  useEffect(() => {
    setTimeout(
      () =>
        enqueueSnackBar(() => (
          <SnackBar
            message={`Snackbar from the collection tab`}
            messageBgColor="lightblue"
          />
        )),
      5000
    );
  }, []);

  return <div className="c-collection-tab">Hello?</div>;
}
