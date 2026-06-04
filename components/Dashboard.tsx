'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { AgentStream } from '@/components/AgentStream';
import { DebatePanel } from '@/components/DebatePanel';
import { DecisionPanel } from '@/components/DecisionPanel';
import { SimulationPanel } from '@/components/SimulationPanel';
import { TacticalMap } from '@/components/TacticalMap';
import { useBlackboard } from '@/lib/useBlackboard';

export function Dashboard() {
  const rootRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorLabelRef = useRef<HTMLSpanElement>(null);
  const {
    snapshot,
    modeLabel,
    isFirestoreLive,
    isReasoning,
    reasoningLabel,
    triggerMutation,
    approveDecision,
    rejectDecision,
    resetDemo
  } = useBlackboard();

  useEffect(() => {
    const handleHotkeys = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      const isTypingContext =
        tagName === 'input' || tagName === 'textarea' || target?.isContentEditable;

      if (isTypingContext) return;

      switch (event.key.toLowerCase()) {
        case '1':
          triggerMutation('baseline');
          break;
        case '2':
          triggerMutation('windShift');
          break;
        case '3':
          triggerMutation('bridgeCollapse');
          break;
        case '0':
          resetDemo();
          break;
        case 'a':
          approveDecision();
          break;
        case 'r':
          rejectDecision();
          break;
        default:
          return;
      }
    };

    window.addEventListener('keydown', handleHotkeys);
    return () => window.removeEventListener('keydown', handleHotkeys);
  }, [approveDecision, rejectDecision, resetDemo, triggerMutation]);

  useEffect(() => {
    if (!rootRef.current) return;

    const root = rootRef.current;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const cleanupCallbacks: Array<() => void> = [];

    if (hasFinePointer && cursorRef.current && cursorLabelRef.current) {
      const cursor = cursorRef.current;
      const cursorLabel = cursorLabelRef.current;
      const xTo = gsap.quickTo(cursor, 'x', { duration: 0.16, ease: 'power3.out' });
      const yTo = gsap.quickTo(cursor, 'y', { duration: 0.16, ease: 'power3.out' });

      const moveCursor = (event: PointerEvent) => {
        xTo(event.clientX);
        yTo(event.clientY);
        cursor.classList.add('is-visible');
      };

      const cursorEnter = (event: PointerEvent) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>('[data-cursor-label]');
        if (!target || !root.contains(target)) return;
        cursorLabel.textContent = target.dataset.cursorLabel || 'VIEW';
        cursor.classList.add('is-expanded');
      };

      const cursorLeave = (event: PointerEvent) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>('[data-cursor-label]');
        if (!target || !root.contains(target)) return;
        cursor.classList.remove('is-expanded');
      };

      window.addEventListener('pointermove', moveCursor, { passive: true });
      root.addEventListener('pointerover', cursorEnter);
      root.addEventListener('pointerout', cursorLeave);
      cleanupCallbacks.push(() => {
        window.removeEventListener('pointermove', moveCursor);
        root.removeEventListener('pointerover', cursorEnter);
        root.removeEventListener('pointerout', cursorLeave);
      });
    }

    if (prefersReducedMotion) {
      return () => cleanupCallbacks.forEach((callback) => callback());
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const intro = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.8 } });

      intro
        .from('.motion-topbar', { y: -18, opacity: 0 })
        .from('.motion-cinema-copy > *', { y: 24, opacity: 0, stagger: 0.08 }, '-=0.35')
        .from('.motion-orbit', { scale: 0.88, opacity: 0, duration: 0.95 }, '-=0.55')
        .from('.motion-command-chip', { y: 20, opacity: 0, stagger: 0.05 }, '-=0.45')
        .from('.motion-hero-word', { yPercent: 105, opacity: 0, stagger: 0.08, duration: 0.95 }, '-=0.3')
        .from('.motion-hero-copy', { y: 18, opacity: 0 }, '-=0.5')
        .from('.motion-hero-callout', { y: 18, opacity: 0 }, '-=0.5')
        .from('.motion-panel-left', { x: -24, opacity: 0 }, '-=0.55')
        .from('.motion-panel-center', { y: 24, opacity: 0 }, '-=0.6')
        .from('.motion-panel-right', { x: 24, opacity: 0 }, '-=0.6');

      gsap.utils.toArray<HTMLElement>('.motion-reveal').forEach((element, index) => {
        gsap.fromTo(
          element,
          { y: 24, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            delay: (index % 3) * 0.03,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 90%',
              once: true
            }
          }
        );
      });
    }, rootRef);

    return () => {
      cleanupCallbacks.forEach((callback) => callback());
      ctx.revert();
    };
  }, []);

  return (
    <div className="dashboard-shell" ref={rootRef}>
      <div className="cursor-shell" ref={cursorRef} aria-hidden="true">
        <span className="cursor-label" ref={cursorLabelRef}>SCAN</span>
      </div>

      <header className="topbar motion-topbar" data-cursor-label="COMMAND">
        <div className="brand-lockup">
          <span className="micro-label accent-label">Autonomous Crisis System</span>
          <h1>THRESHOLD</h1>
          <p className="brand-subline">Observe. Simulate. Debate. Trigger.</p>
        </div>

        <div className="pitch-line">
          Most teams build chatbots. This builds a cognitive architecture for preemption.
        </div>

        <div className="header-status">
          <div>
            <span className="micro-label">Runtime</span>
            <strong>{modeLabel}</strong>
          </div>
          <div>
            <span className="micro-label">Blackboard</span>
            <strong>{isFirestoreLive ? 'Listening' : 'Simulated'}</strong>
          </div>
          <div>
            <span className="micro-label">Consensus</span>
            <strong>{snapshot.consensus}%</strong>
          </div>
          <div className={isReasoning ? 'reasoning-status is-thinking' : 'reasoning-status'}>
            <span className="micro-label">Reasoning</span>
            <strong>{isReasoning ? 'Thinking' : 'Gemini Live'}</strong>
          </div>
        </div>
      </header>

      {isReasoning ? (
        <section className="reasoning-banner" aria-live="polite">
          <div className="reasoning-loader"><span /><span /><span /></div>
          <div>
            <span className="micro-label">Live reasoning</span>
            <strong>{reasoningLabel}</strong>
            <p>SIMULACRA is generating futures. COUNCIL is reconvening. JUDGE is preparing synthesis.</p>
          </div>
        </section>
      ) : null}

      <section className="cinema-band motion-reveal" data-cursor-label="FORESIGHT">
        <div className="cinema-copy motion-cinema-copy">
          <span className="micro-label accent-label">Prediction theater // live operational model</span>
          <h2>The machine saw it first.</h2>
          <p>
            THRESHOLD turns the command center into a living interface: signals become arguments,
            arguments become branches, and branches collapse into action.
          </p>
        </div>
        <div className="foresight-orb motion-orbit" aria-hidden="true">
          <span className="orb-ring orb-ring-one" />
          <span className="orb-ring orb-ring-two" />
          <span className="orb-ring orb-ring-three" />
          <span className="orb-core">{snapshot.threatIndex.toFixed(1)}</span>
        </div>
        <div className="cinema-readout">
          <span className="micro-label">Forecast lock</span>
          <strong>{snapshot.forecastWindowMin}m</strong>
          <small>{snapshot.triggerState} // {snapshot.consensus}% consensus</small>
        </div>
      </section>

      <section className="command-strip motion-reveal">
        <div className="command-chip motion-command-chip">
          <span className="micro-label">Hotkeys</span>
          <strong>1 / 2 / 3</strong>
          <small>Switch the live crisis variable instantly.</small>
        </div>
        <div className="command-chip motion-command-chip">
          <span className="micro-label">Approve</span>
          <strong>A</strong>
          <small>Lock the selected path.</small>
        </div>
        <div className="command-chip motion-command-chip">
          <span className="micro-label">Reject</span>
          <strong>R</strong>
          <small>Force human override.</small>
        </div>
        <div className="command-chip motion-command-chip">
          <span className="micro-label">Reset</span>
          <strong>0</strong>
          <small>Return to baseline.</small>
        </div>
      </section>

      <section className="marquee-strip motion-reveal" aria-hidden="true">
        <div className="marquee-track">
          <span>THRESHOLD • LIVE BLACKBOARD • AGENT STREAM • SIMULACRA FUTURES • COUNCIL DEBATE • DEPLOYMENT LOGIC • </span>
          <span>THRESHOLD • LIVE BLACKBOARD • AGENT STREAM • SIMULACRA FUTURES • COUNCIL DEBATE • DEPLOYMENT LOGIC • </span>
        </div>
      </section>

      <section className="hero-grid">
        <AgentStream events={snapshot.eventStream} isReasoning={isReasoning} />

        <div className="center-column">
          <div className="hero-copy panel hero-copy-panel motion-panel-center">
            <div className="hero-copy-main">
              <span className="eyebrow">Luxury restraint // tactical futurism // visual-first command layer</span>
              <h2>
                <span className="motion-hero-word">PREEMPT</span>
                <span className="motion-hero-word">BEFORE IMPACT</span>
              </h2>
              <p className="motion-hero-copy">
                SENTINEL observes. SIMULACRA branches futures. COUNCIL debates tradeoffs.
                EXECUTOR moves when the threshold breaks.
              </p>
            </div>

            <div className="hero-callout motion-hero-callout">
              <span className="micro-label">Show, don’t tell</span>
              <strong>Luxury minimal surfaces. Tactical clarity. One visible path to action.</strong>
            </div>

            <div className="command-dock">
              <span className="micro-label">System rhythm</span>
              <div className="command-dock-track">
                <span />
              </div>
              <small>Visible motion where it matters. No lag-heavy pointer effects.</small>
            </div>

            <div className="hero-stats">
              <div>
                <span className="micro-label">Trigger</span>
                <strong>{snapshot.triggerState}</strong>
              </div>
              <div>
                <span className="micro-label">Sector</span>
                <strong>{snapshot.sector}</strong>
              </div>
              <div>
                <span className="micro-label">Mutation</span>
                <strong>{snapshot.activeMutation}</strong>
              </div>
            </div>
          </div>

          <TacticalMap
            snapshot={snapshot}
            onMutation={triggerMutation}
            onReset={resetDemo}
            controlsDisabled={isReasoning}
            isReasoning={isReasoning}
          />
        </div>

        <DecisionPanel snapshot={snapshot} onApprove={approveDecision} onReject={rejectDecision} />
      </section>

      <section className="analysis-grid">
        <SimulationPanel branches={snapshot.branches} isReasoning={isReasoning} />
        <DebatePanel debate={snapshot.debate} isReasoning={isReasoning} />
      </section>

      <section className="architecture-strip panel motion-reveal">
        <div className="architecture-card motion-reveal">
          <span className="micro-label">01 // Architecture</span>
          <strong>Central Firestore blackboard</strong>
          <p>Agents never call each other directly. They write and react to shared state.</p>
        </div>
        <div className="architecture-card motion-reveal">
          <span className="micro-label">02 // Motion Logic</span>
          <strong>Smooth, visible, light</strong>
          <p>Big transitions are now concentrated in reveal moments, not continuous input tracking.</p>
        </div>
        <div className="architecture-card motion-reveal">
          <span className="micro-label">03 // Pitch Move</span>
          <strong>Change a variable live</strong>
          <p>Hit Wind Shift or Bridge Collapse and let the council re-debate in front of judges.</p>
        </div>
      </section>
    </div>
  );
}
