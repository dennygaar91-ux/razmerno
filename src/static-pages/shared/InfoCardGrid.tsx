export function InfoCardGrid({
  variant = "three",
  children,
}: {
  variant?: "two" | "three";
  children: React.ReactNode;
}) {
  return (
    <div className={`rzm-info-grid rzm-info-grid--${variant}`}>
      {children}
    </div>
  );
}
