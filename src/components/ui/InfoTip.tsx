import React, { useEffect, useId, useRef, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import { GLOSSARY, GlossaryKey } from '../../data/glossary';

interface InfoTipProps {
  term: GlossaryKey;
  className?: string;
}

interface Placement {
  top: number;
  left: number;
  width: number;
  above: boolean;
}

/**
 * Petite bulle « ? » qui explique un terme en langage courant.
 * S'ouvre au survol, au focus clavier et au toucher (un 2e toucher la ferme) ; Échap la ferme.
 */
export const InfoTip: React.FC<InfoTipProps> = ({ term, className = '' }) => {
  const entry = GLOSSARY[term];
  const id = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [placement, setPlacement] = useState<Placement>({ top: 0, left: 0, width: 288, above: true });

  const place = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const width = Math.min(288, window.innerWidth - 24);
    const left = Math.min(Math.max(12, rect.left + rect.width / 2 - width / 2), window.innerWidth - width - 12);
    const above = rect.top > 200;
    setPlacement({ top: above ? rect.top - 8 : rect.bottom + 8, left, width, above });
  };

  const show = () => {
    place();
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    setPinned(false);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onPointer = (e: MouseEvent | TouchEvent) => {
      if (!buttonRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('touchstart', onPointer);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('touchstart', onPointer);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  return (
    <span className={`inline-flex align-middle ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-label={`Qu'est-ce que c'est : ${entry.title} ?`}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onMouseEnter={show}
        onMouseLeave={() => !pinned && setOpen(false)}
        onFocus={show}
        onBlur={close}
        onClick={(e) => {
          e.stopPropagation();
          if (pinned) {
            close();
          } else {
            show();
            setPinned(true);
          }
        }}
        className="p-0.5 -m-0.5 rounded-full text-slate-400 hover:text-sky-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
      >
        <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
      {open && (
        <span
          role="tooltip"
          id={id}
          style={{
            position: 'fixed',
            top: placement.top,
            left: placement.left,
            width: placement.width,
            transform: placement.above ? 'translateY(-100%)' : undefined
          }}
          className="z-[60] block bg-slate-800 border border-slate-600 rounded-xl px-3.5 py-3 shadow-2xl text-left normal-case tracking-normal font-normal pointer-events-none"
        >
          <span className="block text-sm font-semibold text-white mb-1">{entry.title}</span>
          <span className="block text-sm leading-snug text-slate-200">{entry.text}</span>
        </span>
      )}
    </span>
  );
};
