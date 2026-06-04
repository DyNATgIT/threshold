import { DebateMessage } from '@/types';

export function DebatePanel({ debate, isReasoning = false }: { debate: DebateMessage[]; isReasoning?: boolean }) {
  return (
    <section className="panel content-panel debate-panel motion-reveal" data-cursor-label="COUNCIL">
      <div className="panel-head">
        <span>Council Debate</span>
        <span className={isReasoning ? 'tag reasoning-chip' : 'tag'}>
          {isReasoning ? 'Reconvening' : 'Gemini Council + Judge'}
        </span>
      </div>
      <p className="panel-subhead">
        Three value systems debate the active crisis, then Gemini synthesizes a judge decision.
      </p>

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
