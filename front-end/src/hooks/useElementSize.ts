import { useState, useEffect, RefObject } from "react";

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
