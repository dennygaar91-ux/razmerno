export type CustomerOrderStatusStage =
  | "review"
  | "payment"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "unknown";

export type CustomerOrderStatus = {
  label: string;
  stage: CustomerOrderStatusStage;
  description: string;
  nextStep: string | null;
};

export function getCustomerOrderStatusFallbackLabel(): string {
  return "Статус уточняется";
}
