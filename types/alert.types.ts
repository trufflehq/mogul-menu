import { TruffleGQlConnection } from "../deps.ts";
import { Poll } from "./poll.types.ts";

export type AlertStatus = "ready" | "shown";
export type AlertType = "raid-stream" | "activity";

export interface Alert<T = Record<string, any>> {
  __typename: "Alert";
  id: string;
  message: string;
  status: AlertStatus;
  type: AlertType;
  sourceType: string; // the sourceType of the activity alert
  time: Date;
  data: T;
}

export type RaidAlert = Alert<{
  url?: string;
  title?: string;
  description?: string;
}>;

export type DefaultActivity = Poll | Alert;

export interface ActivityAlert<T> extends Alert {
  activity: T;
}

export type DefaultActivityConnection = TruffleGQlConnection<ActivityAlert<DefaultActivity>>;
export type ActivityConnection<T> = TruffleGQlConnection<ActivityAlert<T>>;
