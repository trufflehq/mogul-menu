import React from "https://npm.tfl.dev/react";
import { getHost } from "https://tfl.dev/@truffle/utils@0.0.1/request/request-info.js";
import Avatar from "https://tfl.dev/@truffle/ui@^0.0.3/components/legacy/avatar/avatar.tsx";
import { gql, useQuery } from "https://tfl.dev/@truffle/api@^0.1.0/client.ts";

const ME_QUERY = gql`
  query {
    me {
      id
      avatarImage {
        cdn
        prefix
        ext
        variations {
          postfix
          width
          height
        }
        aspectRatio
      }
    }
  }
`;

export default function AccountAvatar() {
  // const { me, org } = useObservables(() => ({
  //   me: getModel().user.getMe(),
  //   org: getModel().org.getMe(),
  // }));

  const [{ data: meData, fetching }] = useQuery({
    query: ME_QUERY,
  });

  if (fetching) return <></>;

  const me = meData?.me;

  return (
    <div className="c-account-avatar">
      <a href={`${getHost()}/edit-profile`} target="_blank" rel="noreferrer">
        <Avatar user={me} size="72px" />
      </a>
    </div>
  );
}
