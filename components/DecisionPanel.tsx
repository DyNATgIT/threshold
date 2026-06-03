import { BlackboardWrite, CrisisSnapshot } from '@/types';

interface DecisionPanelProps {
  snapshot: CrisisSnapshot;
  onApprove: () => void;
  onReject: () => void;
}

function statusTone(status: string) {
  if (status === 'APPROVED' || status === 'EXECUTED') return 'is-success';
  if (status === 'REJECTED') return 'is-warning';
  if (status === 'AUTO_ARMED') return 'is-critical';
  return '';
}

function latestWrite(writes: BlackboardWrite[]) {
  return writes[writes.length - 1];
}

export function DecisionPanel({ snapshot, onApprove, onReject }: DecisionPanelProps) {
  const reviewLocked =
    snapshot.decision.status === 'APPROVED' || snapshot.decision.status === 'EXECUTED';
  const write = latestWrite(snapshot.writes);

  return (
    <section className="panel rail-panel decision-panel motion-panel-right">
      <div className="panel-head">
        <span>Decision Card</span>
        <span className={`tag ${statusTone(snapshot.decision.status)}`}>
          {snapshot.decision.status.replaceAll('_', ' ')}
        </span>
      </div>

      <div className="decision-block primary-block motion-float">
        <span className="micro-label">Current Action</span>
        <h2>{snapshot.decision.action}</h2>
        <p>{snapshot.decision.reasoning}</p>
      </div>

      <div className="metric-grid">
        <div className="metric-card critical-card">
          <span className="micro-label">Threat Index</span>
          <strong>{snapshot.threatIndex.toFixed(1)}</strong>
          <div className="meter">
            <span style={{ width: `${Math.min(snapshot.threatIndex * 10, 100)}%` }} />
          </div>
        </div>
        <div className="metric-card">
          <span className="micro-label">Confidence</span>
          <strong>{snapshot.decision.confidence}%</strong>
          <div className="meter">
            <span style={{ width: `${snapshot.decision.confidence}%` }} />
          </div>
        </div>
        <div className="metric-card">
          <span className="micro-label">Forecast Window</span>
          <strong>{snapshot.forecastWindowMin}m</strong>
          <small>Until operational break point</small>
        </div>
        <div className="metric-card">
          <span className="micro-label">Review Window</span>
          <strong>{snapshot.reviewWindowSec}s</strong>
          <small>Human-in-the-loop remaining</small>
        </div>
      </div>

      <div className="decision-block">
        <span className="micro-label">Reasoning Log</span>
        <p>
          Optimized for life-safety, infrastructure tolerance, and equity-weighted access across the active districts.
        </p>
        {write ? (
          <code className="blackboard-write">
            {write.actor} → {write.target}
            <br />
            {write.payload}
          </code>
        ) : null}
      </div>

      <div className="decision-actions">
        <button
          onClick={onApprove}
          disabled={reviewLocked}
          className="action-button approve-button magnetic"
          data-cursor-label="APPROVE"
        >
          Approve
        </button>
        <button
          onClick={onReject}
          disabled={snapshot.decision.status === 'REJECTED' || reviewLocked}
          className="action-button reject-button magnetic"
          data-cursor-label="REJECT"
        >
          Reject
        </button>
      </div>
    </section>
  );
}
