import { TruffleGQlConnection } from "../deps.ts";
export interface PollOption {
  index: number;
  text: string;
  count: number;
  unique: number;
}

export interface PollVote {
  pollId: string;
  userId: string;
  optionIndex?: number;
  count?: number;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  data: Record<string, unknown>;
  time: Date;
  endTime: Date;
  myVote?: PollVote;
}

export type PollConnection = TruffleGQlConnection<Poll>;
