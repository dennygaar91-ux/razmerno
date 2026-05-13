export default function ViewerQuickActions({
  onAddShelf,
  onAddDrawer,
  onToggleRail,
  onClear,
}) {
  return (
    <div className="cp-quick-actions">
      <button type="button" onClick={onAddShelf}>+ полка</button>
      <button type="button" onClick={onAddDrawer}>+ ящик</button>
      <button type="button" onClick={onToggleRail}>штанга</button>
      <button type="button" onClick={onClear}>очистить</button>
    </div>
  );
}
