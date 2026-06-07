import { useState, useEffect, RefObject } from "react";

/**
 * Tracks the content-box dimensions of any HTML or SVG element via ResizeObserver.
 * Returns `{ width: 0, height: 0 }` until the ref is attached and the first
 * observation fires.
 */
export const useElementSize = (ref: RefObject<HTMLElement | SVGSVGElement>) => {
  const initialSize = { width: 0, height: 0 }
  const [size, setSize] = useState(initialSize);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return size;
};
