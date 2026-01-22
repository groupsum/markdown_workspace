
import { DragEvent, MouseEvent, useState } from 'react';
import { FileNode } from '../types';

interface UseFileItemProps {
  node: FileNode;
  allFiles: FileNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (fileId: string, targetFolderId: string | null) => void;
}

export const useFileItem = ({
  node,
  allFiles,
  selectedId,
  onSelect,
  onMove
}: UseFileItemProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const children = allFiles.filter(f => f.parentId === node.id);
  const isSelected = node.id === selectedId;

  const selectNode = (e: MouseEvent) => {
    console.log(`[useFileItem] Action: selectNode -> ${node.id} (${node.name})`);
    e.stopPropagation();
    onSelect(node.id);
  };

  // DnD Handlers
  const handleDragStart = (e: DragEvent) => {
    console.log(`[useFileItem] DragStart -> ${node.id}`);
    e.dataTransfer.setData('application/json', JSON.stringify({ id: node.id }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent) => {
    if (node.type === 'folder') {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (!isDragOver) {
          console.log(`[useFileItem] DragOver folder -> ${node.id}`);
          setIsDragOver(true);
      }
    }
  };

  const handleDragLeave = () => {
    if (node.type === 'folder') {
        console.log(`[useFileItem] DragLeave folder -> ${node.id}`);
        setIsDragOver(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    if (node.type !== 'folder') return;
    e.preventDefault();
    e.stopPropagation();
    console.log(`[useFileItem] Drop on folder -> ${node.id}`);
    setIsDragOver(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.id && data.id !== node.id) {
         console.log(`[useFileItem] Moving node ${data.id} into ${node.id}`);
         onMove(data.id, node.id);
      }
    } catch(err) {
      console.error("[useFileItem] Drop failed to parse data", err);
    }
  };

  return {
    isDragOver,
    isSelected,
    children,
    selectNode,
    dnd: {
      draggable: true,
      onDragStart: handleDragStart,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop
    }
  };
};
