import { useConfigBridge } from "./store/useConfigBridge";
import { FURNITURE_PRESETS } from "./data";
import { formatPrice } from "../shared/lib/price";
import { trackEvent } from "../shared/lib/analytics";

export function QuickStart() {
  const { actions } = useConfigBridge();

  return (
    <section className="section-pad rzm-quickstart-v2 pt-20 md:pt-28 pb-20 md:pb-28">
      <div className="rzm-quickstart-head reveal">
        <div>
          <div className="eyebrow mb-4">Шаг 0 · быстрый старт</div>
          <h1 className="h-section text-[var(--rzm-text-main)]">
            Выберите форму — остальное настроите дальше.
          </h1>
        </div>
        <p>
          Конструктор подставит стартовую модель, покажет цену и проведёт по шагам. Сейчас важно выбрать тип мебели, а не заполнять лишние вопросы.
        </p>
      </div>

      <div className="rzm-quickstart-grid mt-10 md:mt-14">
        {FURNITURE_PRESETS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              actions.setType(p.id);
              trackEvent("furniture_type_selected", { type: p.id, source: "quickstart_v2" });
            }}
            className={`reveal stagger-${i + 1} rzm-start-card focus-ring`}
          >
            <div className="rzm-start-card-visual" data-type={p.id}>
              <TypeRender type={p.id} />
              <span className="rzm-start-price">от {formatPrice(p.fromPrice)}</span>
            </div>
            <div className="rzm-start-card-body">
              <div>
                <h3>{p.name}</h3>
                <p>{p.tagline}</p>
              </div>
              <div className="rzm-start-card-foot">
                <span>{p.sizes}</span>
                <strong>Выбрать →</strong>
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function TypeRender({ type }: { type: "wardrobe" | "dresser" | "nightstand" }) {
  return (
    <svg viewBox="0 0 420 330" className="absolute inset-0 w-full h-full" aria-hidden="true">
      <defs>
        <linearGradient id={`wood-${type}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f1d19f" />
          <stop offset="1" stopColor="#b97a3f" />
        </linearGradient>
        <linearGradient id={`white-${type}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dedbd2" />
        </linearGradient>
        <filter id={`shadow-${type}`} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="22" stdDeviation="18" floodColor="#1C1917" floodOpacity="0.18" />
        </filter>
      </defs>
      {type === "wardrobe" && (
        <g filter={`url(#shadow-${type})`} transform="translate(92 34)">
          <path d="M22 16h220v242H22z" rx="18" fill={`url(#white-${type})`} />
          <path d="M34 28h96v218H34z" rx="12" fill={`url(#wood-${type})`} />
          <path d="M136 28h94v218h-94z" rx="12" fill="#d6d0c5" />
          <line x1="132" y1="36" x2="132" y2="238" stroke="#1C1917" strokeOpacity=".13" />
          <line x1="84" y1="124" x2="84" y2="144" stroke="#1C1917" strokeOpacity=".35" strokeWidth="2" strokeLinecap="round" />
        </g>
      )}
      {type === "dresser" && (
        <g filter={`url(#shadow-${type})`} transform="translate(70 92)">
          <rect x="0" y="0" width="280" height="138" rx="20" fill={`url(#white-${type})`} />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x="22" y={18 + i * 29} width="236" height="18" rx="6" fill={i % 2 ? "#c88d54" : `url(#wood-${type})`} />
          ))}
        </g>
      )}
      {type === "nightstand" && (
        <g filter={`url(#shadow-${type})`} transform="translate(148 78)">
          <rect x="0" y="0" width="124" height="150" rx="20" fill={`url(#white-${type})`} />
          <rect x="18" y="22" width="88" height="42" rx="10" fill={`url(#wood-${type})`} />
          <rect x="18" y="78" width="88" height="44" rx="10" fill="#b97a3f" />
        </g>
      )}
    </svg>
  );
}
