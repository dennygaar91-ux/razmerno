export default function ConstructorViewer() {
  return (
    <div className="rv2-viewer">
      <div className="rv2-viewer-toolbar">
        <div className="rv2-tabs">
          <button className="active">3D</button>
          <button>2D</button>
        </div>

        <div className="rv2-scale">
          <button>-</button>
          <strong>100%</strong>
          <button>+</button>
        </div>
      </div>

      <div className="rv2-stage">
        <div className="rv2-cabinet-placeholder" />
      </div>
    </div>
  );
}
