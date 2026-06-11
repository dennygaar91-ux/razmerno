export interface GeometryBuildContext {
  nextPanelId(prefix: string): string;
  nextBackId(): string;
  nextFacadeId(prefix: string): string;
  nextDrawerId(prefix: string): string;
  nextHardwareId(prefix: string): string;
  nextDrillId(): string;
}

function makeCounter(format: (count: number, prefix?: string) => string) {
  let count = 0;
  return (prefix?: string) => {
    count += 1;
    return format(count, prefix);
  };
}

export function createGeometryBuildContext(): GeometryBuildContext {
  const panel = makeCounter((count, prefix) => `${prefix ?? "panel"}-${count.toString(36).padStart(4, "0")}`);
  const back = makeCounter((count) => `back-${count.toString(36).padStart(4, "0")}`);
  const facade = makeCounter((count, prefix) => `${prefix ?? "fac"}-${count.toString(36).padStart(4, "0")}`);
  const drawer = makeCounter((count, prefix) => `${prefix ?? "dw"}-${count.toString(36).padStart(4, "0")}`);
  const hardware = makeCounter((count, prefix) => `${prefix ?? "hw"}-${count.toString(36).padStart(4, "0")}`);
  const drill = makeCounter((count) => `drill-${count.toString(36).padStart(4, "0")}`);

  return {
    nextPanelId: (prefix) => panel(prefix),
    nextBackId: () => back(),
    nextFacadeId: (prefix) => facade(prefix),
    nextDrawerId: (prefix) => drawer(prefix),
    nextHardwareId: (prefix) => hardware(prefix),
    nextDrillId: () => drill(),
  };
}
