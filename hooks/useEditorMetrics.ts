
import { useState, useLayoutEffect, RefObject } from 'react';
import { ViewMode } from '../types';

export const useEditorMetrics = (
    textareaRef: RefObject<HTMLTextAreaElement | null>, 
    ghostRef: RefObject<HTMLDivElement | null>,
    content: string,
    splitPos: number,
    viewMode: ViewMode
) => {
  const [lineHeights, setLineHeights] = useState<number[]>([]);

  useLayoutEffect(() => {
    if (!textareaRef.current || !ghostRef.current) return;
    
    console.log("[useEditorMetrics] LayoutEffect: Recalculating metrics...");

    // Force ghost width to match textarea client width (minus padding if handled in CSS, but here ghost matches class)
    const width = textareaRef.current.clientWidth;
    ghostRef.current.style.width = `calc(${width}px - 2 * var(--editor-padding))`; // Adjust for padding since width is clientWidth (includes padding)

    const lines = content.split('\n');
    
    // We update the ghost content
    ghostRef.current.innerHTML = '';
    lines.forEach(line => {
      const lineDiv = document.createElement('div');
      lineDiv.textContent = line || '\u200B'; // Zero width space to ensure empty lines have height
      ghostRef.current?.appendChild(lineDiv);
    });

    // Measure
    const heights = Array.from(ghostRef.current.children).map(c => (c as HTMLElement).clientHeight);
    console.log(`[useEditorMetrics] Measured ${heights.length} lines.`);
    setLineHeights(heights);

  }, [content, splitPos, viewMode, textareaRef, ghostRef]);

  return { lineHeights };
};
