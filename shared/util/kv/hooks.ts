import { signal, useComputed, useMutation, useQuerySignal } from "../../../deps.ts";
import { USER_KV_MUTATION, USER_KV_QUERY } from "../../gql/kv.ts";

export function useUserKV(key: string) {
  const userKV$ = useQuerySignal(USER_KV_QUERY, {
    key,
  });
  const value$ = useComputed<string>(() => userKV$?.orgUser?.keyValue?.value?.get());

  const [_, executeKVUpsertMutation] = useMutation(USER_KV_MUTATION);
  const setUserKV = (value: string) =>
    executeKVUpsertMutation({ key, value }, { additionalTypenames: ["OrgUser"] });

  return { value$, setUserKV };
}
