export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getItemCount(section, type) {
  return section?.items?.find((item) => item.type === type)?.count || 0;
}
