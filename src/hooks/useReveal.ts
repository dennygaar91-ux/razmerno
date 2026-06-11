import { useEffect, useState } from "react";

/**
 * Подсвечивает элементы с классом .reveal когда они появляются в viewport.
 * Срабатывает один раз (threshold 0.15).
 */
export function useReveal(rootSelector?: string) {
  useEffect(() => {
    const root = rootSelector ? document.querySelector(rootSelector) : null;
    const elements = (root ?? document).querySelectorAll<HTMLElement>(".reveal");
    if (elements.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [rootSelector]);
}

/** Простой count-up эффект для числа. */
export function useCountUp(target: number, duration = 600) {
  const [value, setValue] = useState(target);
  useEffect(() => {
    const start = value;
    const delta = target - start;
    if (Math.abs(delta) < 1) {
      setValue(target);
      return;
    }
    const startedAt = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - startedAt) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(start + delta * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);
  return value;
}
