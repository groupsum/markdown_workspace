
import { useState, DragEvent, MouseEvent } from 'react';
import { FileNode } from '../types';

interface UseFileItemProps {
  node: FileNode;
  allFiles: FileNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (fileId: string, targetFolderId: string | null) => void;
  searchQuery?: string;
}

export const useFileItem = ({
  node,
  allFiles,
  selectedId,
  onSelect,
  onMove,
  searchQuery
}: UseFileItemProps) => {
  const [expanded, setExpanded] = useState(true);
  const [isDragOver, setIsDragOver] = useState(false);

  const children = allFiles.filter(f => f.parentId === node.id);
  const isFolder = node.type === 'folder';
  const isSelected = node.id === selectedId;

  // Search filtering logic
  const isMatch = searchQuery 
    ? node.name.toLowerCase().includes(searchQuery.toLowerCase()) 
    : true;
  
  const hasMatchingChildren = (n: FileNode): boolean => {
    const kids = allFiles.filter(f => f.parentId === n.id);
    return kids.some(k => 
      k.name.toLowerCase().includes(searchQuery?.toLowerCase() || '') || hasMatchingChildren(k)
    );
  };

  const shouldRender = !searchQuery || isMatch || (isFolder && hasMatchingChildren(node));
  const forceExpand = !!searchQuery;
  const isExpanded = isFolder && (expanded || forceExpand);

  const toggleExpand = (e: MouseEvent) => {
    console.log(`[useFileItem] Action: toggleExpand for -> ${node.id} (${node.name})`);
    e.stopPropagation();
    setExpanded(!expanded);
  };

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
    if (isFolder) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (!isDragOver) {
          console.log(`[useFileItem] DragOver folder -> ${node.id}`);
          setIsDragOver(true);
      }
    }
  };

  const handleDragLeave = () => {
    if (isFolder) {
        console.log(`[useFileItem] DragLeave folder -> ${node.id}`);
        setIsDragOver(false);
    }
  };

  const handleDrop = (e: DragEvent) => {
    if (!isFolder) return;
    e.preventDefault();
    e.stopPropagation();
    console.log(`[useFileItem] Drop on folder -> ${node.id}`);
    setIsDragOver(false);
    
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.id && data.id !== node.id) {
         console.log(`[useFileItem] Moving node ${data.id} into ${node.id}`);
         onMove(data.id, node.id);
         setExpanded(true);
      }
    } catch(err) {
      console.error("[useFileItem] Drop failed to parse data", err);
    }
  };

  return {
    isExpanded,
    isDragOver,
    isSelected,
    children,
    shouldRender,
    toggleExpand,
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
