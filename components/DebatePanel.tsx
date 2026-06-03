import { DebateMessage } from '@/types';

export function DebatePanel({ debate }: { debate: DebateMessage[] }) {
  return (
    <section className="panel content-panel debate-panel motion-reveal" data-cursor-label="COUNCIL">
      <div className="panel-head">
        <span>Council Debate</span>
        <span className="tag">Council of Three + Judge</span>
      </div>
      <p className="panel-subhead">The money shot: three distinct value systems, one final synthesis.</p>

      <div className="debate-list">
        {debate.map((message) => (
          <article key={message.id} className={`debate-bubble tone-${message.tone} motion-reveal`} data-cursor-label="ARGUE">
            <div className="bubble-head">
              <strong>{message.agent}</strong>
              <span>{message.role}</span>
            </div>
            <p>{message.content}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
