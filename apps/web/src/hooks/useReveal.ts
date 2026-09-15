import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const reduced = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Scroll choreography for a section: children marked [data-reveal] rise and
 * scale in on entry, and the whole block dims as it leaves the viewport.
 */
export function useSectionReveal<T extends HTMLElement>() {
  const scope = useRef<T>(null);

  useGSAP(
    () => {
      if (reduced() || !scope.current) return;
      const targets = scope.current.querySelectorAll('[data-reveal]');
      if (targets.length) {
        gsap.from(targets, {
          y: 46,
          scale: 0.94,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.out',
          stagger: 0.08,
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: scope.current, start: 'top 82%', once: true },
        });
      }
      gsap.to(scope.current, {
        opacity: 0.25,
        ease: 'none',
        scrollTrigger: {
          trigger: scope.current,
          start: 'bottom 62%',
          end: 'bottom 12%',
          scrub: true,
        },
      });
    },
    { scope },
  );

  return scope;
}

/** Word-by-word opacity scrub for a lead paragraph. */
export function useWordScrub<T extends HTMLElement>() {
  const scope = useRef<T>(null);

  useGSAP(
    () => {
      if (reduced() || !scope.current) return;
      const words = scope.current.querySelectorAll('[data-word]');
      if (!words.length) return;
      gsap.fromTo(
        words,
        { opacity: 0.12 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.4,
          scrollTrigger: {
            trigger: scope.current,
            start: 'top 78%',
            end: 'bottom 52%',
            scrub: true,
          },
        },
      );
    },
    { scope },
  );

  return scope;
}

export { gsap, ScrollTrigger, useGSAP };
