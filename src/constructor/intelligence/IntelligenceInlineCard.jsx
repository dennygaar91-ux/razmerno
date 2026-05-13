import { getCabinetIntelligence } from './getCabinetIntelligence';

export default function IntelligenceInlineCard({ config, validation = [] }) {
  const items = getCabinetIntelligence(config, validation);

  if (!items.length) return null;

  return (
    <div className="cp-intelligence-inline">
      {items.map((item, index) => (
        <div key={`${item.title}-${index}`} className={`cp-intelligence-inline__item is-${item.type}`}>
          <strong>{item.title}</strong>
          <p>{item.text}</p>
        </div>
      ))}
    </div>
  );
}
