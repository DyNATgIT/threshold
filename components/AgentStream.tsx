import { BlackboardEvent } from '@/types';

const severityLabel: Record<BlackboardEvent['severity'], string> = {
  info: 'Info',
  warning: 'Warning',
  critical: 'Critical',
  success: 'Locked'
};

export function AgentStream({ events, isReasoning = false }: { events: BlackboardEvent[]; isReasoning?: boolean }) {
  const ordered = [...events].reverse();

  return (
    <section className="panel rail-panel stream-panel motion-panel-left" data-cursor-label="STREAM">
      <div className="panel-head">
        <span>Agent Stream</span>
        <span className={isReasoning ? 'tag live-tag reasoning-chip' : 'tag live-tag'}>
          {isReasoning ? 'THINKING' : 'LIVE'}
        </span>
      </div>
      <p className="panel-subhead">
        Firestore blackboard writes rendered as a live command feed. Gemini entries are AI-generated.
      </p>

      <div className="stream-list" aria-live="polite">
        {isReasoning ? (
          <article className="stream-entry agent-gemini severity-warning" data-cursor-label="GEMINI">
            <div className="stream-row">
              <strong>[GEMINI]</strong>
              <span>Reasoning</span>
            </div>
            <p>Generating futures. Reconvening council. Awaiting judge synthesis.</p>
            <span className="stream-meta">now // live reasoning</span>
          </article>
        ) : null}

        {ordered.map((event) => {
          const agentName = event.agent.toUpperCase();
          const isGemini = agentName === 'GEMINI';
          const isMongo = agentName === 'MONGODB';
          return (
            <article
              key={event.id}
              className={`stream-entry severity-${event.severity} ${isGemini ? 'agent-gemini' : ''} ${isMongo ? 'agent-mongodb' : ''}`}
              data-agent={agentName}
              data-cursor-label={isGemini ? 'GEMINI' : isMongo ? 'MONGODB' : 'TRACE'}
            >
              <div className="stream-row">
                <strong>[{event.agent}]</strong>
                <span>{isGemini ? 'AI Generated' : severityLabel[event.severity]}</span>
              </div>
              <p>{event.message}</p>
              <span className="stream-meta">
                {event.timestamp} IST // {event.phase}
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
