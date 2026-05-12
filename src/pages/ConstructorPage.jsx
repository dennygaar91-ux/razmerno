import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../icons/Icon';
import { useCabinetStore } from '../store/cabinetStore';
import { SectionsEditor } from '../constructor/components/SectionsEditor';
import { ValidationPanel } from '../constructor/components/ValidationPanel';
import { PartsTable } from '../constructor/components/PartsTable';
import { CabinetViewer } from '../constructor/Viewer';
import './ConstructorPage.css';

export default function ConstructorPage() {
  const navigate = useNavigate();
  const {
    config,
    result,
    validation,
    updateDimensions,
    updateSectionWidth,
    setSectionShelves,
    setSectionDrawers,
    addSection,
    removeSection,
    autoDistributeSections
  } = useCabinetStore();

  const price = result.price?.total ?? 0;
  const parts = result.parts.length;
  const errors = validation.filter((message) => message.type === 'error');
  const warnings = validation.filter((message) => message.type === 'warning');

  const stats = useMemo(() => {
    const drawerCount = config.sections.reduce((sum, section) => {
      const drawer = section.items.find((item) => item.type === 'drawer');
      return sum + (drawer?.count || 0);
    }, 0);

    const shelfCount = config.sections.reduce((sum, section) => {
      const shelf = section.items.find((item) => item.type === 'shelf');
      return sum + (shelf?.count || 0);
    }, 0);

    return {
      drawerCount,
      shelfCount
    };
  }, [config.sections]);

  return (
    <div className="cst-app">
      <header className="cst-hdr">
        <button className="cst-back" onClick={() => navigate(-1)}>
          <Icon name="arrow-left" size={14} /> Back
        </button>

        <Link to="/" className="cst-logo">
          Razmerno<em>.</em>
        </Link>

        <nav className="cst-tabs">
          <button className="cst-tab active">Wardrobe</button>
        </nav>

        <div className="cst-hdr-r">
          <div className="cst-price-wrap">
            <div className="cst-price">{price.toLocaleString('ru-RU')} ?</div>
            <div className="cst-price-sub">Estimated price</div>
          </div>
          <button className="btn btn-cta btn-sm" onClick={() => navigate('/auth')}>
            Request quote
          </button>
        </div>
      </header>

      <aside className="cst-left">
        <div className="cst-panel">
          <div className="cst-section">
            <div className="cst-section-title">Cabinet dimensions</div>
            {[
              { label: 'Width', value: config.dimensions.width, key: 'width', min: 400, max: 2600 },
              { label: 'Height', value: config.dimensions.height, key: 'height', min: 600, max: 2800 },
              { label: 'Depth', value: config.dimensions.depth, key: 'depth', min: 300, max: 900 }
            ].map((dimension) => (
              <div key={dimension.key} className="cst-dim">
                <div className="cst-dim-label">
                  <span>{dimension.label}</span>
                  <span className="cst-dim-val">
                    {dimension.value} <span className="cst-dim-mm">mm</span>
                  </span>
                </div>
                <input
                  type="range"
                  className="cst-slider"
                  min={dimension.min}
                  max={dimension.max}
                  step={10}
                  value={dimension.value}
                  onChange={(event) =>
                    updateDimensions(dimension.key, Number(event.target.value))
                  }
                />
              </div>
            ))}
          </div>

          <div className="cst-section">
            <SectionsEditor
              sections={config.sections}
              onUpdateWidth={updateSectionWidth}
              onUpdateShelves={setSectionShelves}
              onUpdateDrawers={setSectionDrawers}
              onAddSection={addSection}
              onRemoveSection={removeSection}
              onAutoDistribute={autoDistributeSections}
            />
          </div>

          <div className="cst-section">
            <div className="cst-section-title">Contents</div>
            <div className="cst-stepper-row">
              <span className="cst-stepper-label">Shelves</span>
              <strong>{stats.shelfCount}</strong>
            </div>
            <div className="cst-stepper-row">
              <span className="cst-stepper-label">Drawers</span>
              <strong>{stats.drawerCount}</strong>
            </div>
            <div className="cst-stepper-row">
              <span className="cst-stepper-label">Sections</span>
              <strong>{config.sections.length}</strong>
            </div>
          </div>
        </div>

        <div className="cst-summary">
          <div className="cst-summary-row">
            <span>Parts</span>
            <strong>{parts}</strong>
          </div>
          <div className="cst-summary-row">
            <span>Errors</span>
            <strong>{errors.length}</strong>
          </div>
          <div className="cst-summary-row">
            <span>Warnings</span>
            <strong>{warnings.length}</strong>
          </div>
          <div className="cst-summary-price">
            <span className="cst-summary-pl">Total</span>
            <span className="cst-summary-pv">{price.toLocaleString('ru-RU')} ?</span>
          </div>
        </div>
      </aside>

      <div className="cst-view">
        <div className="cst-view-grid" />
        <div className="cst-view-glow" />

        <div className="cst-view-top">
          <div className="cst-view-top-l">
            <span className="cst-live-dot" />
            <span className="cst-view-status">3D preview – {config.dimensions.width} x {config.dimensions.height} x {config.dimensions.depth} mm</span>
          </div>
          <span className="cst-view-tag">three.js</span>
        </div>

        <div className="cst-stage">
          <CabinetViewer parts={result.parts} />
        </div>

        <div className="cst-view-bot">
          <div className="cst-stat"><div className="cst-stat-l">Width</div><div className="cst-stat-v">{config.dimensions.width} mm</div></div>
          <div className="cst-stat"><div className="cst-stat-l">Height</div><div className="cst-stat-v">{config.dimensions.height} mm</div></div>
          <div className="cst-stat"><div className="cst-stat-l">Depth</div><div className="cst-stat-v">{config.dimensions.depth} mm</div></div>
          <div className="cst-stat"><div className="cst-stat-l">Parts</div><div className="cst-stat-v">{parts}</div></div>
        </div>

        <div className="cst-controls">
          <div className="cst-ctrl">1</div>
          <div className="cst-ctrl">2</div>
          <div className="cst-ctrl">3</div>
        </div>
      </div>

      <aside className="cst-right">
        <div className="cst-right-body">
          <div className="cst-section-title">Summary</div>
          <div className="cst-spec-name">Flat wardrobe</div>
          <div className="cst-spec-dims">{config.dimensions.width} x {config.dimensions.height} x {config.dimensions.depth} mm</div>

          <div className="cst-spec-rows">
            {[
              ['Sections', `${config.sections.length}`],
              ['Shelves', `${stats.shelfCount}`],
              ['Drawers', `${stats.drawerCount}`],
              ['Price', `${price.toLocaleString('ru-RU')} ?`]
            ].map(([label, value]) => (
              <div key={label} className="cst-spec-row">
                <span className="cst-spec-l">{label}</span>
                <span className="cst-spec-v">{value}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24 }}>
            <ValidationPanel messages={validation} />
          </div>

          <div style={{ marginTop: 24 }}>
            <div className="cst-section-title">Parts list</div>
            <PartsTable parts={result.parts} />
          </div>
        </div>

        <div className="cst-right-cta">
          <div className="cst-cta-price">{price.toLocaleString('ru-RU')} ?</div>
          <div className="cst-cta-note">Price includes materials and standard hardware estimate.</div>
          <button className="btn btn-cta btn-sm" type="button" onClick={() => navigate('/auth')}>
            Request order
          </button>
        </div>
      </aside>
    </div>
  );
}
