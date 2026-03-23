
import { useState, DragEvent } from 'react';

export const useFileTreeDnD = (onMove: (fileId: string, targetFolderId: string | null) => void) => {
  const [isDragOverRoot, setIsDragOverRoot] = useState(false);

  const handleRootDragOver = (e: DragEvent) => {
    e.preventDefault();
    if (!isDragOverRoot) {
        console.log("[useFileTreeDnD] DragOver file tree root area");
        setIsDragOverRoot(true);
    }
  };

  const handleRootDragLeave = () => {
      console.log("[useFileTreeDnD] DragLeave file tree root area");
      setIsDragOverRoot(false);
  };

  const handleRootDrop = (e: DragEvent) => {
    e.preventDefault();
    console.log("[useFileTreeDnD] Drop on file tree root area");
    setIsDragOverRoot(false);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.id) {
        console.log(`[useFileTreeDnD] Moving node ${data.id} to root`);
        onMove(data.id, null);
      }
    } catch(err) {
        console.error("[useFileTreeDnD] Failed to parse drop data", err);
    }
  };

  return {
    isDragOverRoot,
    handleRootDragOver,
    handleRootDragLeave,
    handleRootDrop
  };
};
