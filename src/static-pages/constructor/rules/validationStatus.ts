import type {
  ConstructorStepId,
  ConstructorStepStatus,
  ConstructorValidationIssue,
} from "../types";

export function createEmptyStepStatuses(): Record<
  ConstructorStepId,
  ConstructorStepStatus
> {
  return {
    sizes: "default",
    fill: "default",
    materials: "default",
    checkout: "default",
  };
}

export function makeIssue(
  issue: ConstructorValidationIssue,
): ConstructorValidationIssue {
  return issue;
}
