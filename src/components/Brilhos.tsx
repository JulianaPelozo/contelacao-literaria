import { useEffect } from 'react';

const FORMAS = ['✦', '✧', '⋆', '✦'];

/** Rastro de estrelinhas atrás do cursor do mouse (desligado em telas de toque e com "reduzir movimento"). */
export function Brilhos() {
  useEffect(() => {
    const mm = window.matchMedia;
    if (!mm || mm('(prefers-reduced-motion: reduce)').matches || !mm('(pointer: fine)').matches) return;
    let ultimo = 0;
    let px = 0;
    let py = 0;
    let ativos = 0;

    const mover = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const t = performance.now();
      if (t - ultimo < 40 || Math.hypot(e.clientX - px, e.clientY - py) < 12 || ativos > 24) return;
      ultimo = t;
      px = e.clientX;
      py = e.clientY;

      const s = document.createElement('span');
      s.className = 'brilho';
      s.setAttribute('aria-hidden', 'true');
      s.textContent = FORMAS[Math.floor(Math.random() * FORMAS.length)];
      s.style.left = `${e.clientX + (Math.random() * 14 - 7)}px`;
      s.style.top = `${e.clientY + (Math.random() * 14 - 7)}px`;
      s.style.fontSize = `${8 + Math.random() * 9}px`;
      s.style.setProperty('--dx', `${Math.random() * 24 - 12}px`);
      s.style.setProperty('--giro', `${Math.random() > 0.5 ? 90 : -90}deg`);
      ativos++;
      s.addEventListener('animationend', () => {
        s.remove();
        ativos--;
      });
      document.body.appendChild(s);
    };

    window.addEventListener('pointermove', mover, { passive: true });
    return () => window.removeEventListener('pointermove', mover);
  }, []);
  return null;
}
