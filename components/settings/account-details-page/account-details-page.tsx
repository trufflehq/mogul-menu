import {
  gql,
  React,
  TextField,
  useEffect,
  useMutation,
  useQuery,
  useState,
  useStyleSheet,
} from "../../../deps.ts";
import { useSnackBar } from "../../../state/mod.ts";
import Button from "../../base/button/button.tsx";
import Page from "../../base/page/page.tsx";
import SnackBar from "../../base/snack-bar/snack-bar.tsx";
import styleSheet from "./account-details-page.scss.js";

const INITIAL_DATA_QUERY = gql`
  query {
    me {
      id
      name
    }

    orgUser {
      keyValue(input: { key: "nameColor" }) {
        key
        value
      }
    }
  }
`;

const SAVE_MUTATION = gql`
  mutation ($username: String, $nameColor: String, $userId: String) {
    userUpsert(input: { name: $username }) {
      user {
        id
      }
    }

    keyValueUpsert(
      input: {
        sourceType: "user"
        sourceId: $userId
        key: "nameColor"
        value: $nameColor
      }
    ) {
      keyValue {
        key
        value
      }
    }
  }
`;

export default function AccountDetailsPage() {
  useStyleSheet(styleSheet);

  const enqueueSnackBar = useSnackBar();

  const [usernameState, setUsernameState] = useState();
  const [nameColorState, setNameColorState] = useState();
  const [hasChanged, setHasChanged] = useState(false);

  const [{ data: initialData }] = useQuery({ query: INITIAL_DATA_QUERY });
  const me = initialData?.me;
  useEffect(() => {
    const username = me?.name;
    const nameColor = initialData?.orgUser?.keyValue?.value;

    setUsernameState(username);
    setNameColorState(nameColor);
  }, [initialData]);

  const [_saveResult, saveSettings] = useMutation(SAVE_MUTATION);

  const save = async () => {
    if (!hasChanged) return;
    const { error } = await saveSettings({
      userId: me?.id,
      nameColor: nameColorState,
      username: usernameState,
    });

    if (error) {
      console.error(error);
      enqueueSnackBar(
        <SnackBar
          message="An error occurred while saving :("
          messageBgColor="var(--mm-color-error)"
          messageTextColor="var(--mm-color-text-error)"
        ></SnackBar>
      );
    } else {
      enqueueSnackBar(
        <SnackBar message="Your settings have been saved!"></SnackBar>
      );
      setHasChanged(false);
    }
  };

  return (
    <Page title="Account details">
      <div className="c-account-details-page-body">
        <div className="chat-id-heading mm-text-header-caps">Chat identity</div>
        <div className="username-input input">
          <div className="label mm-text-body-2">Username</div>
          <TextField
            onInput={(e) => {
              setHasChanged(true);
              setUsernameState(e?.target?.value);
            }}
            value={usernameState}
          />
        </div>
        <div className="name-color-input input">
          <div className="label mm-text-body-2">Name color</div>
          <input
            type="color"
            onInput={(e) => {
              setHasChanged(true);
              setNameColorState(e?.target?.value);
            }}
            tabIndex={0}
            value={nameColorState}
          />
        </div>
        <Button style="primary" isDisabled={!hasChanged} onClick={save}>
          Save
        </Button>
      </div>
    </Page>
  );
}
