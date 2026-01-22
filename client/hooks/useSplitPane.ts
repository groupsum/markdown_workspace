
import { useState, useEffect, useRef } from 'react';

export const useSplitPane = () => {
  const [splitPos, setSplitPos] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
      console.log("[useSplitPane] Drag initiation");
      setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = Math.max(20, Math.min(80, (x / rect.width) * 100));
      // Excessive logging during drag could lag, but adding a summary log
      setSplitPos(percentage);
    };
    
    const handleMouseUp = () => {
        if (isDragging) {
            console.log(`[useSplitPane] Drag completed at ${splitPos}%`);
            setIsDragging(false);
        }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, splitPos]);

  return { splitPos, isDragging, containerRef, handleMouseDown };
};
