import {
  gql,
  ImageByAspectRatio,
  React,
  TextField,
  useEffect,
  useMutation,
  useState,
  useStyleSheet,
} from "../../../deps.ts";
import { useMeConnectionQuery } from "../../../shared/mod.ts";
import { Page } from "../../page-stack/mod.ts";
import Button from "../../base/button/button.tsx";
import stylesheet from "./chat-settings-page.scss.js";

const USER_UPSERT_MUTATION = gql`
  mutation UserUpsert($name: String) {
    userUpsert(input: { name: $name }) {
      user {
        id
      }
    }
  }
`;

export default function ChatSettingsPage(
  { onContinue }: { onContinue?: () => void },
) {
  const { meWithConnections } = useMeConnectionQuery();
  const [_, executeUserUpsert] = useMutation(USER_UPSERT_MUTATION);
  const [userName, setUsername] = useState<string>();
  useStyleSheet(stylesheet);

  const updateUserInfo = async () => {
    if (userName) {
      await executeUserUpsert({
        name: userName,
      }, { additionalTypenames: ["MeUser", "User", "Connection", "ConnectionConnection"] });
    }

    // TODO - add chat color here
  };

  // we want to prepopulate the chat username with the username of the user that was logged in during the prior 3rd party OAuth
  // login step
  useEffect(() => {
    if (meWithConnections?.name && !userName) {
      setUsername(meWithConnections.name);
    }
  }, [meWithConnections?.name]);

  const onClick = async () => {
    await updateUserInfo();
    onContinue?.();
  };
  return (
    <Page isFull={true} shouldShowHeader={false} shouldDisableEscape={true}>
      <div className="c-chat-settings-page">
        <div className="hero">
          <ImageByAspectRatio
            imageUrl={"https://cdn.bio/assets/images/features/browser_extension/poggies.png"}
            aspectRatio={1}
            widthPx={60}
            height={60}
          />
          <div className="title">Poggies!</div>
          <div className="welcome">
            {meWithConnections?.name ? `Welcome; ${meWithConnections?.name}!` : "Welcome!"}
          </div>
          <div className="info">Go ahead, change your chat username and color if you'd like</div>
        </div>
        <div className="settings">
          <div className="username">
            <div className="label">Chat username</div>
            <TextField
              label="Chat username"
              placeholder="Chat username"
              value={userName}
              onInput={(e: any) => setUsername(e.target?.value)}
            />
          </div>
        </div>
        <footer className="footer">
          <Button style="primary" shouldHandleLoading={true} onClick={onClick}>
            Continue
          </Button>
        </footer>
      </div>
    </Page>
  );
}
