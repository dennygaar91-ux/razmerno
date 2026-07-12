import {
  getOperationsDomainStatusBadgeTone,
  getOperationsDomainStatusLabel,
} from "../shared/operations/workspaceFilters";

export function OperationsDomainStatusBadge({ domainStatus }: { domainStatus: string }) {
  const tone = getOperationsDomainStatusBadgeTone(domainStatus);
  return (
    <span className="rzm-chip" data-domain-status={tone}>
      {getOperationsDomainStatusLabel(domainStatus)}
    </span>
  );
}
