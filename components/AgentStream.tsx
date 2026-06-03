import { BlackboardEvent } from '@/types';

const severityLabel: Record<BlackboardEvent['severity'], string> = {
  info: 'Info',
  warning: 'Warning',
  critical: 'Critical',
  success: 'Locked'
};

export function AgentStream({ events }: { events: BlackboardEvent[] }) {
  const ordered = [...events].reverse();

  return (
    <section className="panel rail-panel stream-panel motion-panel-left" data-cursor-label="STREAM">
      <div className="panel-head">
        <span>Agent Stream</span>
        <span className="tag live-tag">LIVE</span>
      </div>
      <p className="panel-subhead">Firestore blackboard writes rendered as a live command feed.</p>

      <div className="stream-list" aria-live="polite">
        {ordered.map((event) => (
          <article key={event.id} className={`stream-entry severity-${event.severity}`} data-cursor-label="TRACE">
            <div className="stream-row">
              <strong>[{event.agent}]</strong>
              <span>{severityLabel[event.severity]}</span>
            </div>
            <p>{event.message}</p>
            <span className="stream-meta">
              {event.timestamp} IST // {event.phase}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
