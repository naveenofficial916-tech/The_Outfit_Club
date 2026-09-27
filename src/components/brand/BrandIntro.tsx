/**
 * THE OUTFIT CLUB — CINEMATIC BRAND INTRO
 *
 * Sequence:
 *   1. Black screen
 *   2. Letters of "THE OUTFIT CLUB" fall from above, one by one
 *   3. Each letter impacts with a squash + recoil bounce
 *   4. Dust puff + shockwave flash at each impact
 *   5. Gold baseline draws in after last letter settles
 *   6. TOC royal emblem rises with shimmer sweep
 *   7. Smooth fade-out to homepage
 *
 * Session guard: plays once per browser session (sessionStorage).
 * Replay: dispatch window event 'replay-brand-intro'.
 * Accessibility: prefers-reduced-motion collapses the animation.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import './BrandIntro.css';

// ─── Brand copy ────────────────────────────────────────────────────────────────
const BRAND_WORDS = ['THE', 'OUTFIT', 'CLUB'] as const;

// ─── Build a flat letter list with global index ────────────────────────────────
interface LetterMeta {
  char:        string;
  wordIndex:   number;
  charIndex:   number;
  globalIndex: number;
}

const LETTERS: LetterMeta[] = (() => {
  const list: LetterMeta[] = [];
  let gi = 0;
  BRAND_WORDS.forEach((word, wi) => {
    [...word].forEach((char, ci) => {
      list.push({ char, wordIndex: wi, charIndex: ci, globalIndex: gi++ });
    });
  });
  return list;
})();

const LETTER_COUNT = LETTERS.length; // 13

// ─── Timing constants ─────────────────────────────────────────────────────────
// First letter drops at 250 ms, each subsequent letter 110 ms after the previous.
const DROP_START_MS  = 250;
const STAGGER_MS     = 110;
const DROP_ANIM_MS   = 650;  // animation-duration in CSS

// When does the last letter START dropping?
const LAST_DROP_START = DROP_START_MS + (LETTER_COUNT - 1) * STAGGER_MS;

// When does the last letter FINISH its impact animation?
const LAST_SETTLE_MS = LAST_DROP_START + DROP_ANIM_MS; // ≈ 1 700 ms

// Gold baseline appears just as the last letter settles
const BASELINE_DELAY_MS = LAST_SETTLE_MS + 80;

// Emblem mounts 200 ms after baseline
const EMBLEM_MOUNT_MS = BASELINE_DELAY_MS + 200;

// Auto-dismiss: emblem holds for 1 300 ms then fades
const AUTO_DISMISS_MS = EMBLEM_MOUNT_MS + 1300;

// Helper: inline CSS var name for drop-delay on each letter
const dropDelay  = (gi: number) => `${DROP_START_MS + gi * STAGGER_MS}ms`;
const dustDelay  = (gi: number) => `${DROP_START_MS + gi * STAGGER_MS + Math.round(DROP_ANIM_MS * 0.74)}ms`;
const shockDelay = (gi: number) => `${DROP_START_MS + gi * STAGGER_MS + Math.round(DROP_ANIM_MS * 0.75)}ms`;

// ─── Component ────────────────────────────────────────────────────────────────
interface BrandIntroProps {
  onComplete?: () => void;
  forcePlay?:  boolean;
}

export const BrandIntro: React.FC<BrandIntroProps> = ({
  onComplete,
  forcePlay = false,
}) => {
  const [shouldRender, setShouldRender] = useState<boolean>(() => {
    if (forcePlay) return true;
    if (typeof window === 'undefined') return false;
    return !sessionStorage.getItem('toc_intro_seen');
  });

  const [isDismissing, setIsDismissing] = useState(false);
  const [showEmblem,   setShowEmblem]   = useState(false);

  // All scheduled timers — cleared on skip / unmount
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(fn, ms);
    timers.current.push(t);
  };

  // ── Replay listener ─────────────────────────────────────────────────────────
  useEffect(() => {
    const replay = () => {
      sessionStorage.removeItem('toc_intro_seen');
      setIsDismissing(false);
      setShowEmblem(false);
      setShouldRender(true);
    };
    window.addEventListener('replay-brand-intro', replay);
    return () => window.removeEventListener('replay-brand-intro', replay);
  }, []);

  // ── Dismiss handler ─────────────────────────────────────────────────────────
  const dismiss = useCallback(() => {
    clearTimers();
    setIsDismissing(true);
    sessionStorage.setItem('toc_intro_seen', 'true');
    later(() => {
      setShouldRender(false);
      setShowEmblem(false);
      onComplete?.();
    }, 750);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onComplete]);

  // ── Main orchestration ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!shouldRender) return;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      // Skip animation, show everything immediately then dismiss
      setShowEmblem(true);
      later(dismiss, 900);
      return clearTimers;
    }

    // Schedule emblem mount
    later(() => setShowEmblem(true), EMBLEM_MOUNT_MS);

    // Schedule auto-dismiss
    later(dismiss, AUTO_DISMISS_MS);

    // ESC / Enter skip
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') dismiss();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      clearTimers();
      window.removeEventListener('keydown', onKey);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldRender]);

  if (!shouldRender) return null;

  return (
    <div
      className={`ci-overlay${isDismissing ? ' ci-overlay--out' : ''}`}
      role="region"
      aria-label="The Outfit Club brand intro"
      onClick={dismiss}
    >
      {/* Subtle ambient glow */}
      <div className="ci-ambient" aria-hidden="true" />

      {/* Skip */}
      <button
        type="button"
        className="ci-skip"
        onClick={(e) => { e.stopPropagation(); dismiss(); }}
        aria-label="Skip intro"
      >
        <span>Skip</span>
        <span className="ci-skip__kbd">[ESC]</span>
      </button>

      {/* Stage */}
      <div className="ci-stage" aria-hidden="true">

        {/* ── Wordmark ── */}
        <div className="ci-wordmark">
          {BRAND_WORDS.map((word, wi) => (
            <React.Fragment key={wi}>
              <span className="ci-word">
                {[...word].map((char, ci) => {
                  const { globalIndex: gi } = LETTERS.find(
                    l => l.wordIndex === wi && l.charIndex === ci
                  )!;
                  return (
                    <span
                      key={ci}
                      className="ci-letter"
                      style={{
                        '--drop-delay':  dropDelay(gi),
                        '--dust-delay':  dustDelay(gi),
                        '--shock-delay': shockDelay(gi),
                      } as React.CSSProperties}
                    >
                      <span className="ci-letter__char">{char}</span>

                      {/* Dust cloud — spreads left and right on impact */}
                      <span className="ci-dust" aria-hidden="true">
                        <span className="ci-dust__left"  />
                        <span className="ci-dust__right" />
                      </span>

                      {/* Gold shockwave line */}
                      <span className="ci-shockwave" aria-hidden="true" />
                    </span>
                  );
                })}
              </span>

              {/* Space between words */}
              {wi < BRAND_WORDS.length - 1 && (
                <span className="ci-word-gap" aria-hidden="true" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Gold baseline — draws in after last letter settles */}
        <div
          className="ci-baseline"
          style={{
            '--baseline-delay': `${BASELINE_DELAY_MS}ms`,
          } as React.CSSProperties}
          aria-hidden="true"
        />

        {/* ── TOC Emblem — mounted after last letter (React state) ── */}
        {showEmblem && (
          <div className="ci-emblem-wrap">
            <div className="ci-emblem-inner">
              <img
                src="/assets/brand/toc-emblem-gold.jpg"
                alt="The Outfit Club Royal Emblem"
                className="ci-emblem-img"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const svg = e.currentTarget.parentElement?.querySelector<HTMLElement>('.ci-emblem-svg');
                  if (svg) svg.style.display = 'block';
                }}
              />

              {/* SVG fallback (shown if image fails to load) */}
              <svg
                className="ci-emblem-svg"
                viewBox="0 0 100 100"
                style={{ display: 'none' }}
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="ciEmblemGold" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%"   stopColor="#FCEBA6" />
                    <stop offset="40%"  stopColor="#D4AF37" />
                    <stop offset="70%"  stopColor="#AA771C" />
                    <stop offset="100%" stopColor="#E5C158" />
                  </linearGradient>
                </defs>
                {/* Crown */}
                <path d="M25 35 C35 32, 65 32, 75 35 L73 40 C65 37, 35 37, 27 40 Z" fill="url(#ciEmblemGold)" />
                <path d="M47 35 L50 20 L53 35 Z"                                     fill="url(#ciEmblemGold)" />
                <circle cx="50" cy="18" r="2.5"                                       fill="url(#ciEmblemGold)" />
                <path d="M36 35 L37 25 L42 35 Z"                                     fill="url(#ciEmblemGold)" />
                <path d="M64 35 L63 25 L58 35 Z"                                     fill="url(#ciEmblemGold)" />
                {/* TOC monogram */}
                <path d="M28 44 L72 44 L70 48 L53 48 L53 82 L47 82 L47 48 L30 48 Z" fill="url(#ciEmblemGold)" />
                <ellipse cx="50" cy="63" rx="16" ry="18" fill="none" stroke="url(#ciEmblemGold)" strokeWidth="4.5" />
                <path
                  d="M62 52 C56 48, 42 48, 36 56 C30 64, 32 72, 40 77 C46 80, 58 80, 64 73"
                  fill="none" stroke="url(#ciEmblemGold)" strokeWidth="4" strokeLinecap="round"
                />
              </svg>

              {/* Metallic shimmer sweep */}
              <div className="ci-emblem-shimmer" aria-hidden="true" />
            </div>

            <div className="ci-tagline">WEAR YOUR STORY</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandIntro;
