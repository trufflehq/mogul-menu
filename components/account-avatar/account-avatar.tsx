import React from "https://npm.tfl.dev/react";
import { getHost } from "https://tfl.dev/@truffle/utils@0.0.1/request/request-info.js";

export default function AccountAvatar() {
  // const { me, org } = useObservables(() => ({
  //   me: getModel().user.getMe(),
  //   org: getModel().org.getMe(),
  // }));

  return (
    <div className="c-account-avatar">
      {
        <a href={`${getHost()}/edit-profile`} target="_blank" rel="noreferrer">
          {/* TODO: add avatar component to truffle ui */}
          {
            /* <Component
            slug="avatar"
            props={{
              user: me,
              size: "72px",
            }}
          /> */
          }
          Account avatar
        </a>
      }
    </div>
  );
}
