import {
  _,
  gql,
  ImageByAspectRatio,
  observer,
  React,
  TruffleGQlConnection,
  useEffect,
  useQuerySignal,
  useRef,
  useSignal,
  useStyleSheet,
  useUrqlQuerySignal,
} from "../../deps.ts";
import NewWindow from "../new-window/new-window.tsx";
import { SnackBar, useSnackBar } from "../snackbar/mod.ts";

import styleSheet from "./connected-accounts.scss.js";

interface Connection {
  id: string;
  sourceType: string;
  sourceId: string;
  secondarySourceId: string;
}

type ConnectionConnection = TruffleGQlConnection<Connection>;

const ACCOUNT_CONNECTIONS_QUERY = gql<
  { connectionConnection: ConnectionConnection },
  Record<string, unknown>
>`
  query {
    connectionConnection {
      nodes {
        id
        sourceType
        sourceId
        secondarySourceId
      }
    }
  }
`;

const OAUTH_URL_QUERY = gql<{
  connectionGetOAuthUrlsBySourceTypes: {
    oAuthUrlMap: {
      [key: string]: string;
    };
  };
}, Record<string, unknown>>`
  query {
    connectionGetOAuthUrlsBySourceTypes(
      input: { sourceTypes: ["discord", "twitch", "twitter"] }
    ) {
      oAuthUrlMap
    }
  }
`;

function ConnectedAccounts() {
  useStyleSheet(styleSheet);
  const enqueueSnackBar = useSnackBar();
  const { signal$: connections$, reexecuteQuery: refetchConnections } = useUrqlQuerySignal(
    ACCOUNT_CONNECTIONS_QUERY,
  );
  const oAuthUrlMap$ = useQuerySignal(OAUTH_URL_QUERY);
  const isOpen$ = useSignal(false);
  const oAuthUrl$ = useSignal("");
  const lastUpdatedConnectionsRef = useRef<Connection[] | undefined>(undefined!);

  const logos = [
    // {
    //   sourceType: "discord",
    //   snackbarSrc: "https://cdn.bio/assets/icons/global/light/discord.svg",
    //   imgUrl:
    //     "https://cdn.bio/ugc/file/74d63ae0-3134-11ec-b844-c04b4cdda93a/39d5b910-5f6b-11ec-84a1-2e2f04e55ed6.svg",
    //   color: "#586AEA",
    //   hasConnection: false,
    //   data: {
    //     title: "Discord",
    //   },
    // },
    // {
    //   sourceType: "twitter",
    //   snackbarSrc: "https://cdn.bio/assets/icons/global/light/twitter.svg",
    //   imgUrl:
    //     "https://cdn.bio/ugc/file/74d63ae0-3134-11ec-b844-c04b4cdda93a/39d59200-5f6b-11ec-932f-1a7d09fc7d5c.svg",
    //   color: "#5D92F7",
    //   hasConnection: false,
    //   data: {
    //     title: "Twitter",
    //   },
    // },
    // FIXME: detect who we should show twitch vs youtube icon for
    // don't want it on for ludwig :p
    // {
    //   sourceType: 'twitch',
    //   snackbarSrc: 'https://cdn.bio/assets/icons/global/light/twitch.svg',
    //   imgUrl: 'https://cdn.bio/ugc/file/74d63ae0-3134-11ec-b844-c04b4cdda93a/39d56af0-5f6b-11ec-abe0-185bcf791ef5.svg',
    //   color: '#925AEF',
    //   hasConnection: false,
    //   data: {
    //     title: 'Twitch'
    //   }
    // },
    {
      sourceType: "youtube",
      snackbarSrc: "https://cdn.bio/assets/icons/global/light/youtube.svg",
      imgUrl: "https://cdn.bio/assets/images/third_party/youtube-square.svg",
      color: "#FF0000",
      hasConnection: false,
      data: {
        title: "YouTube",
      },
    },
  ];

  const connections = connections$.data?.get!()?.connectionConnection.nodes;
  const oAuthUrlMap = oAuthUrlMap$.connectionGetOAuthUrlsBySourceTypes.oAuthUrlMap.get!();
  const oAuthUrlMapError = oAuthUrlMap$.error.get();

  const isConnectionsChanged = !_.isEqual(
    connections,
    lastUpdatedConnectionsRef.current,
  );

  useEffect(() => {
    if (isConnectionsChanged && lastUpdatedConnectionsRef?.current) {
      const updatedConnections = _.differenceBy(
        connections,
        lastUpdatedConnectionsRef?.current,
        "id",
      );

      if (!_.isEmpty(updatedConnections)) {
        const sourceType = updatedConnections[0]?.sourceType;
        const logo = _.find(logos, { sourceType });

        const imgSrc = logo?.snackbarSrc;
        const connectionTitle = logo?.data?.title;

        enqueueSnackBar(
          <AccountConnectedSnackBar
            connectionImgSrc={imgSrc}
            connectionTitle={connectionTitle}
          />,
        );
      }
    }

    lastUpdatedConnectionsRef.current = connections;
  }, [connections]);

  const openOAuth = (sourceType: string) => {
    if (!hasConnection(sourceType)) {
      const oAuthUrl = oAuthUrlMap[sourceType];
      isOpen$.set(true);
      oAuthUrl$.set(oAuthUrl);
    }
  };

  const hasConnection = (selectedSource: string) =>
    _.find(connections, { sourceType: selectedSource });
  // we are currently only displaying discord, twitter, and twitch connections.
  // this filters out all of the other connections
  const displayedConnections = connections?.filter((connection) =>
    logos.map((logo) => logo.sourceType).includes(connection.sourceType)
  );

  const onWindowClose = () => {
    oAuthUrl$.set("");

    refetchConnections({ requestPolicy: "network-only" });
  };

  return (
    <div className="c-browser-extension-earn-xp">
      {isOpen$.get() && oAuthUrl$.get() && (
        <NewWindow
          onClose={onWindowClose}
          url={oAuthUrl$.get()}
          width={450}
          height={600}
          top={200}
          left={400}
          right={0}
          bottom={0}
        />
      )}
      <div className="connections">
        {logos
          .filter((logo) => !hasConnection(logo.sourceType))
          .filter((logo) => logo.sourceType !== "youtube") // bring this back when google approvess
          .map((logo, idx) => (
            <a
              className="connection"
              target={"_blank"}
              key={idx}
              onClick={() => openOAuth(logo?.sourceType)}
              rel="noreferrer"
            >
              <img src={logo?.imgUrl} />
            </a>
          ))}
      </div>
      {displayedConnections && displayedConnections?.length > 0 && <hr />}
      <div className="connected-connections">
        {logos
          .filter((logo) => hasConnection(logo.sourceType))
          .map((logo, idx) => (
            <div
              className="connection"
              style={{ border: `1px solid ${logo.color}` }}
              key={idx}
            >
              <div className="left">
                <img src={logo?.imgUrl} />
                <div className="name">{logo.data.title}</div>
                <div className="connected">Connected</div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function AccountConnectedSnackBar(
  { connectionImgSrc, connectionTitle }: { connectionImgSrc?: string; connectionTitle?: string },
) {
  return (
    <SnackBar
      style="flat"
      message={
        <>
          <ImageByAspectRatio
            imageUrl={connectionImgSrc}
            aspectRatio={1}
            widthPx={24}
            height={24}
          />
          {connectionTitle ? `${connectionTitle} account connected` : ""}
        </>
      }
    />
  );
}

export default observer(ConnectedAccounts);
