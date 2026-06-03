import { ScenarioBranch } from '@/types';

export function SimulationPanel({ branches }: { branches: ScenarioBranch[] }) {
  return (
    <section className="panel content-panel futures-panel motion-reveal" data-cursor-label="FUTURES">
      <div className="panel-head">
        <span>SIMULACRA Futures</span>
        <span className="tag">Gemini-style JSON branches</span>
      </div>
      <p className="panel-subhead">
        Fast probabilistic reasoning standing in for heavy physical simulation during the demo.
      </p>

      <div className="branch-grid">
        {branches.map((branch) => (
          <article key={branch.id} className={`branch-card status-${branch.status} motion-reveal`} data-cursor-label="BRANCH">
            <div className="branch-topline">
              <strong>{branch.label}</strong>
              <span>{branch.probability}%</span>
            </div>
            <div className="meter compact-meter">
              <span style={{ width: `${branch.probability}%` }} />
            </div>
            <dl>
              <div>
                <dt>Resources</dt>
                <dd>{branch.resourceCost}</dd>
              </div>
              <div>
                <dt>Casualties</dt>
                <dd>{branch.casualtyEstimate}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{branch.status}</dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
