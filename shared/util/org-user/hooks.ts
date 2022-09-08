import { useMutation, useQuery } from "../../../deps.ts";
import { ORG_USER_CHAT_SETTINGS_QUERY, SAVE_ORG_USER_SETTINGS_MUTATION } from "./gql.ts";

export function useSaveOrgUserSettings(
  onSave?: () => void,
  onError?: (err: string) => void,
) {
  const [, saveSettings] = useMutation(SAVE_ORG_USER_SETTINGS_MUTATION);

  const saveOrgUserSettings = async (
    userId?: string,
    username?: string,
    nameColor?: string,
  ) => {
    const { error } = await saveSettings({
      userId,
      username,
      nameColor,
    }, {
      additionalTypenames: ["MeUser", "User", "OrgUser", "Connection", "ConnectionConnection"],
    });

    if (error) {
      console.error(error);
      onError?.(error.message);
    } else {
      onSave?.();
    }
  };

  return { saveOrgUserSettings };
}

export function useOrgUserChatSettings() {
  const [{ data, fetching }] = useQuery({
    query: ORG_USER_CHAT_SETTINGS_QUERY,
  });

  return {
    orgUser: data?.orgUser,
    isFetching: fetching,
  };
}
