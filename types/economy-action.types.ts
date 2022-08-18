export interface EconomyActionData {
  redeemData: Record<string, unknown>;
  cooldownSeconds: number;
}

export interface EconomyAction {
  id: string;
  orgId: string;
  name: string;
  amountValue: number;
  amountId: number;
  data: EconomyActionData;
}
