"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

/**
 * Is this element anywhere near the viewport?
 *
 * Used to switch ambient animation off while nobody can see it. That is worth
 * more than it sounds: a landing page is mostly read below the fold, so the
 * hero's globe, sweep, particles and seasonal clock were spending the majority
 * of every session animating at full cost behind the reader's back - and it is
 * the same main thread they are scrolling with.
 *
 * `rootMargin` keeps the element live for a band beyond the viewport edge, so
 * nothing is caught mid-restart at the moment it scrolls back into view.
 */
export function useInViewport(
  ref: RefObject<Element | null>,
  { rootMargin = "200px" }: { rootMargin?: string } = {},
) {
  // TRUE, not false. This is the value the server renders and the value the
  // first client render has to agree with, and it is also what a browser
  // without IntersectionObserver keeps forever - so the failure mode is "the
  // animations simply never pause", never "the page arrives frozen".
  const [inViewport, setInViewport] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => setInViewport(entry.isIntersecting),
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inViewport;
}

/**
 * Wraps a block in a `data-active` flag that CSS pauses animations from.
 *
 * The point of the wrapper is that its children stay SERVER components - the
 * marquee ships no client JavaScript of its own, and does not need to start,
 * just to be observed. The pause rules themselves live in globals.css next to
 * the keyframes they switch off.
 */
export function PauseOffscreen({
  children,
  className,
  rootMargin,
}: {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const active = useInViewport(ref, { rootMargin });

  return (
    <div ref={ref} className={className} data-active={active}>
      {children}
    </div>
  );
}
