import React, {
  useCallback,
  useMemo,
  useState,
} from "https://npm.tfl.dev/react";

import { createSubject } from "https://tfl.dev/@truffle/utils@0.0.1/obs/subject.js";
import useObservables from "https://tfl.dev/@truffle/utils@0.0.1/obs/use-observables.js";
import { usePageStack } from "../../util/page-stack/page-stack.ts";
import { getSrcByImageObj } from "../../deps.ts";
import {
  gql,
  useMutation,
} from "https://tfl.dev/@truffle/api@^0.1.0/client.ts";

import ScopedStylesheet from "../base/stylesheet/stylesheet.tsx";
import Input from "https://tfl.dev/@truffle/ui@~0.1.0/components/legacy/input/input.tsx";
import Page from "../page/page.tsx";
import Button from "https://tfl.dev/@truffle/ui@~0.1.0/components/button/button.tag.ts";
import AuthDialog from "https://tfl.dev/@truffle/ui@~0.1.0/components/auth-dialog/auth-dialog.tag.ts";

export default function SettingsPage() {
  const { popPage } = usePageStack();

  const { meObs, nameSubject, orgUserKVObs, nameColorSubject } = useMemo(() => {
    // const meObs = getModel().user.getMe();
    // const orgUserKVObs = getModel().orgUser.getMeWithKV();

    return {
      // meObs,
      nameSubject: createSubject(),
      // meObs.pipe(op.map((user) => user?.name || ""))
      // orgUserKVObs,
      nameColorSubject: createSubject(),
      // orgUserKVObs.pipe(
      //   op.map((orgUserKV) => {
      //     const keyValues = orgUserKV?.keyValueConnection?.nodes;
      //     const color =
      //       keyValues.find((kv) => kv.key === "nameColor")?.value || "";
      //     return color;
      //   })
      // )
    };
  }, []);

  const {
    me,
    // org,
    name,
    nameColor,
  } = useObservables(() => ({
    // me: meObs,
    // org: getModel().org.getMe(),
    // orgUserKV: orgUserKVObs,
    name: nameSubject.obs,
    nameColor: nameColorSubject.obs,
  }));

  // const me = {};
  const org = {};
  const orgUserKV = {};

  console.log('me', me)

  const hasNameChanged = nameSubject.isChanged();
  const hasColorChanged = nameColorSubject.isChanged();

  const isChanged = hasNameChanged || hasColorChanged;

  const minVersionForSporeUserSettings = "3.2.0";
  // const hasSporeUserSettings =
  //   extensionInfo?.version &&
  //   extensionInfo.version.localeCompare(
  //     minVersionForSporeUserSettings,
  //     undefined,
  //     { numeric: true, sensitivity: "base" }
  //   ) !== -1;
  const hasSporeUserSettings = true;

  const reset = () => {
    nameColorSubject.reset();
    nameSubject.reset();
  };

  const save = async () => {
    // await getModel().user.requestLoginIfGuest(me, overlay, {
    //   props: { source: "extension-profile" },
    // });
    // if (hasNameChanged) {
    //   await getModel().user.upsert({ name: nameSubject.getValue() });
    // }
    // if (hasColorChanged) {
    //   const diff = {
    //     sourceType: "user",
    //     sourceId: me.id,
    //     key: "nameColor",
    //     value: nameColorSubject.getValue(),
    //   };
    //   await getModel().keyValue.upsert(diff);
    // }
    // jumper.call("user.invalidateSporeUser", { orgId: org?.id });
    // jumper.call("comms.postMessage", MESSAGE.INVALIDATE_USER);
  };

  const SettingsPageContent = useCallback(
    () => (
      <ScopedStylesheet url={new URL("settings-page.css", import.meta.url)}>
        <div className="c-settings-page_content">
          {hasSporeUserSettings && (
            <>
              <div className="name">
                <Input label="Display name" valueSubject={nameSubject} />
              </div>
              <div className="color">
                {/* <Component
                slug="input-color"
                props={{
                  label: "Chat name color",
                  colorSubject: nameColorSubject,
                  isLabelVisible: true,
                }}
              /> */}
              </div>
            </>
          )}
          <PositionChooser
            // extensionInfo={extensionInfo}
            // extensionIconPositionSubject={extensionIconPositionSubject}
            extensionInfo={{}}
            extensionIconPositionSubject={{}}
          />
          {/* {isChanged && (
          <Component
            slug="unsaved-snackbar"
            props={{
              onSave: save,
              onCancel: reset,
            }}
          />
        )} */}
          {!name && <LoginButton />}
        </div>
      </ScopedStylesheet>
    ),
    []
  );

  return (
    <Page title="Settings" content={<SettingsPageContent />} onBack={popPage} />
  );
}

function LoginButton() {
  const [isAuthDialogHidden, setIsAuthDialogHidden] = useState(true);

  return (
    <>
      <Button onClick={() => setIsAuthDialogHidden(false)}>Login</Button>
      {!isAuthDialogHidden && (
        <AuthDialog
          hidden={isAuthDialogHidden}
          onclose={() => {
            setIsAuthDialogHidden(true);
          }}
        />
      )}
    </>
  );
}

function PositionChooser({ extensionInfo, extensionIconPositionSubject }) {
  const { extensionIconPosition } = useObservables(() => ({
    extensionIconPosition: extensionIconPositionSubject.obs,
  }));

  // TODO: LEGACY: remove in june 2022
  let allowsThirdPartyCookies;
  // 3.1.0 didn't play nicely with 3rd party cookies off
  if (extensionInfo?.version === "3.1.0") {
    try {
      window.localStorage.setItem("thirdPartyTest", "1");
      allowsThirdPartyCookies = true;
    } catch {}
  } else {
    allowsThirdPartyCookies = true;
  }

  const minVersionForLayoutConfigSteps = "3.1.0";
  const hasLayoutConfigSteps =
    extensionInfo?.version &&
    extensionInfo.version.localeCompare(
      minVersionForLayoutConfigSteps,
      undefined,
      { numeric: true, sensitivity: "base" }
    ) !== -1 &&
    allowsThirdPartyCookies;

  const positions = getExtensionPositions({ extensionInfo });

  const move = (position) => {
    // const layoutConfigSteps = positions.find(
    //   ({ positionSlug }) => positionSlug === position
    // ).layoutConfigSteps;
    // jumper.call("storage.set", {
    //   key: getStorageKey(STORAGE_POSITION_PREFIX),
    //   value: position,
    // });
    // jumper.call("layout.setDefaultLayoutConfigSteps", { layoutConfigSteps });
    // extensionIconPositionSubject.next(position);
  };

  return (
    <div className="c-position-chooser">
      <div className="label">Icon position:</div>
      {!hasLayoutConfigSteps && "Coming soon!"}
      {/* TODO: radio buttons (we don't have good component for that atm) */}
      {hasLayoutConfigSteps && (
        <>
          {positions.map((position) => {
            const isSelected =
              (extensionIconPosition || "stream-top-right") ===
              position.positionSlug;
            return (
              <div
                key={position.positionSlug}
                className={`option ${isSelected ? "is-selected" : ""}`}
                onClick={() => move(position.positionSlug)}
              >
                {position.text}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

const YOUTUBE_VIDEO_QUERY_SELECTOR = "#ytd-player > #container > #movie_player";
const TWITCH_VIDEO_QUERY_SELECTOR = ".video-player__container";

const TWITCH_ICON_POSITIONS = [
  {
    positionSlug: "chat",
    text: "Below chat",
    layoutConfigSteps: [
      { action: "querySelector", value: ".chat-input__buttons-container" },
      {
        action: "setStyle",
        value: {
          height: "55px",
          "align-items": "center",
          position: "relative",
        },
      },
      {
        action: "querySelector",
        value: ".chat-input__buttons-container > div",
      },
      {
        action: "setStyle",
        value: {
          height: "55px",
          "align-items": "center",
          "margin-left": "45px",
          position: "relative",
        },
      },
      { action: "insertSubjectBefore" },
      { action: "useSubject" },
      { action: "resetStyles" }, // clear styles for our iframe (otherwise we have big empty iframe on page)
    ],
  },
  {
    positionSlug: "stream-top-right",
    text: "Top right of stream",
    layoutConfigSteps: [
      // reset channel points positioning
      {
        action: "querySelector",
        value: ".chat-input__buttons-container > div",
      },
      { action: "setStyle", value: { "margin-left": "0px" } },
      // move to video
      { action: "useDocument" },
      { action: "querySelector", value: TWITCH_VIDEO_QUERY_SELECTOR },
      { action: "appendSubject" },
      { action: "useSubject" },
      { action: "resetStyles" }, // clear styles for our iframe (otherwise we have big empty iframe on page)
    ],
  },
];

const YOUTUBE_ICON_POSITIONS = [
  {
    positionSlug: "chat",
    text: "Below chat",
    layoutConfigSteps: [
      { action: "querySelector", value: "#show-hide-button" },
      { action: "setStyle", value: { height: "60px", position: "relative" } },
      { action: "appendSubject" },
      // center button
      { action: "querySelector", value: ".ytd-toggle-button-renderer" },
      { action: "setStyle", value: { height: "60px" } },
      { action: "useSubject" },
      { action: "resetStyles" }, // clear styles for our iframe (otherwise we have big empty iframe on page)
    ],
  },
  {
    positionSlug: "stream-top-right",
    text: "Top right of stream",
    layoutConfigSteps: [
      { action: "querySelector", value: YOUTUBE_VIDEO_QUERY_SELECTOR },
      { action: "appendSubject" },
      { action: "useSubject" },
      { action: "resetStyles" }, // clear styles for our iframe (otherwise we have big empty iframe on page)
    ],
  },
];

export const isTwitchSourceType = (sourceType) => sourceType === "twitch";

export const getTwitchPageIdentifier = (pageInfoIdentifiers) =>
  pageInfoIdentifiers?.find((identifier) =>
    isTwitchSourceType(identifier.sourceType)
  );

function getExtensionPositions({ extensionInfo }) {
  const twitchPageIdentifiers = getTwitchPageIdentifier(
    extensionInfo?.pageInfo
  );

  const positions = twitchPageIdentifiers
    ? TWITCH_ICON_POSITIONS
    : YOUTUBE_ICON_POSITIONS;

  return positions;
}
