import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FileNode } from '../../../../types';
import { FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { useFileItem } from '../../../../hooks/useFileItem';
import { useFileTreeDnD } from '../../../../hooks/useFileTreeDnD';

interface FileTreeProps {
  files: FileNode[];
  activeId: string | null;
  selectedId: string | null; // Visual selection in tree
  onSelect: (id: string) => void;
  onHighlight?: (id: string) => void;
  onMove: (fileId: string, targetFolderId: string | null) => void;
  searchQuery?: string;
}

const FileItem: React.FC<{ 
  node: FileNode; 
  depth: number; 
  activeId: string | null;
  selectedId: string | null; 
  onSelect: (id: string) => void;
  onMove: (fileId: string, targetFolderId: string | null) => void;
  allFiles: FileNode[];
  expansionMap: Map<string, boolean>;
  visibilityMap: Map<string, boolean>;
  onToggleExpand: (id: string) => void;
  registerItem: (id: string, element: HTMLDivElement | null) => void;
}> = (props) => {
  const { node, depth, activeId, allFiles, selectedId, onSelect, onMove, expansionMap, visibilityMap, onToggleExpand, registerItem } = props;
  
  const {
    isDragOver,
    isSelected,
    children,
    selectNode,
    dnd
  } = useFileItem({
    node,
    allFiles,
    selectedId,
    onSelect,
    onMove
  });

  const isExpanded = expansionMap.get(node.id) || false;
  const isVisible = visibilityMap.get(node.id) || false;
  const isActive = node.id === activeId;

  if (!isVisible) return null;

  const handleToggleExpand = (e: React.MouseEvent) => {
    if (node.type !== 'folder') return;
    e.stopPropagation();
    onToggleExpand(node.id);
  };

  return (
    <div>
      <div 
        {...dnd}
        onClick={selectNode}
        onDoubleClick={() => {
          if (node.type === 'folder') {
            onToggleExpand(node.id);
          }
        }}
        ref={(element) => registerItem(node.id, element)}
        className={`file-tree-item ${isSelected ? 'selected' : ''} ${isActive ? 'is-active' : ''} ${node.type === 'folder' ? 'folder' : ''}`}
        style={{ 
            paddingLeft: `calc(var(--file-indent-base) + ${depth} * var(--file-indent-unit))`,
            backgroundColor: isDragOver ? 'var(--c-explorer-drag-bg)' : undefined
        }}
        id={`file-tree-item-${node.id}`}
        role="treeitem"
        aria-selected={isSelected}
        aria-expanded={node.type === 'folder' ? isExpanded : undefined}
      >
        <span 
          className="file-tree-icon"
          onClick={handleToggleExpand}
        >
          {node.type === 'folder' ? (
            isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
          ) : (
            <FileText size={12} />
          )}
        </span>
        <span className="file-tree-text">{node.name}</span>
      </div>
      
      {isExpanded && (
        <div>
          {children.map(child => (
            <FileItem 
              key={child.id} 
              node={child} 
              depth={depth + 1} 
              activeId={activeId}
              selectedId={selectedId}
              onSelect={onSelect}
              onMove={onMove}
              allFiles={allFiles}
              expansionMap={expansionMap}
              visibilityMap={visibilityMap}
              onToggleExpand={onToggleExpand}
              registerItem={registerItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileTree: React.FC<FileTreeProps> = ({ files, activeId, selectedId, onSelect, onHighlight, onMove, searchQuery }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const roots = files.filter(f => f.parentId === null);
  const { isDragOverRoot, handleRootDragOver, handleRootDragLeave, handleRootDrop } = useFileTreeDnD(onMove);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLDivElement | null>());
  const normalizedQuery = (searchQuery || '').trim().toLowerCase();

  useEffect(() => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      files.filter(file => file.type === 'folder').forEach(file => {
        if (!next.has(file.id)) {
          next.add(file.id);
        }
      });
      return next;
    });
  }, [files]);

  const { visibilityMap, expansionMap, visibleNodes } = useMemo(() => {
    const visibilityMap = new Map<string, boolean>();
    const expansionMap = new Map<string, boolean>();
    const childrenMap = new Map<string | null, FileNode[]>();

    files.forEach(file => {
      const list = childrenMap.get(file.parentId) || [];
      list.push(file);
      childrenMap.set(file.parentId, list);
    });

    const matchesQuery = (node: FileNode) =>
      !normalizedQuery || node.name.toLowerCase().includes(normalizedQuery);

    const descendantCache = new Map<string, boolean>();
    const hasMatchingDescendant = (node: FileNode): boolean => {
      if (descendantCache.has(node.id)) {
        return descendantCache.get(node.id) || false;
      }
      const children = childrenMap.get(node.id) || [];
      const result = children.some(child => matchesQuery(child) || hasMatchingDescendant(child));
      descendantCache.set(node.id, result);
      return result;
    };

    const isVisible = (node: FileNode) => {
      const visible = !normalizedQuery || matchesQuery(node) || (node.type === 'folder' && hasMatchingDescendant(node));
      visibilityMap.set(node.id, visible);
      return visible;
    };

    const shouldExpand = (node: FileNode) => {
      const expanded = node.type === 'folder' && (normalizedQuery ? true : expandedIds.has(node.id));
      expansionMap.set(node.id, expanded);
      return expanded;
    };

    const visibleNodes: { node: FileNode; depth: number }[] = [];
    const walk = (nodes: FileNode[], depth: number) => {
      nodes.forEach(node => {
        if (!isVisible(node)) return;
        visibleNodes.push({ node, depth });
        if (node.type === 'folder' && shouldExpand(node)) {
          walk(childrenMap.get(node.id) || [], depth + 1);
        }
      });
    };

    walk(childrenMap.get(null) || [], 0);

    return {
      visibilityMap,
      expansionMap,
      visibleNodes
    };
  }, [files, expandedIds, normalizedQuery]);

  const registerItem = (id: string, element: HTMLDivElement | null) => {
    itemRefs.current.set(id, element);
  };

  const focusSelection = (id: string) => {
    const element = itemRefs.current.get(id);
    if (element) {
      element.scrollIntoView({ block: 'nearest' });
    }
  };

  useEffect(() => {
    if (selectedId) {
      focusSelection(selectedId);
    }
  }, [selectedId]);

  const setHighlight = (id: string) => {
    if (onHighlight) {
      onHighlight(id);
    } else {
      onSelect(id);
    }
  };

  const toggleExpand = (id: string) => {
    if (normalizedQuery) return;
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandNode = (id: string) => {
    if (normalizedQuery) return;
    setExpandedIds(prev => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const collapseNode = (id: string) => {
    if (normalizedQuery) return;
    setExpandedIds(prev => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const key = event.key;
    if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'Enter', ' '].includes(key)) {
      return;
    }
    if (visibleNodes.length === 0) return;

    event.preventDefault();
    const currentIndex = Math.max(visibleNodes.findIndex(item => item.node.id === selectedId), 0);
    const current = visibleNodes[currentIndex];

    const moveToIndex = (index: number) => {
      const target = visibleNodes[index];
      if (target) {
        setHighlight(target.node.id);
      }
    };

    if (key === 'ArrowDown') {
      moveToIndex(Math.min(currentIndex + 1, visibleNodes.length - 1));
      return;
    }

    if (key === 'ArrowUp') {
      moveToIndex(Math.max(currentIndex - 1, 0));
      return;
    }

    if (key === 'Home') {
      moveToIndex(0);
      return;
    }

    if (key === 'End') {
      moveToIndex(visibleNodes.length - 1);
      return;
    }

    if (!current) return;

    if (key === 'ArrowRight') {
      if (current.node.type === 'folder') {
        const expanded = expansionMap.get(current.node.id);
        if (!expanded) {
          expandNode(current.node.id);
        } else {
          const next = visibleNodes[currentIndex + 1];
          if (next && next.depth > current.depth) {
            moveToIndex(currentIndex + 1);
          }
        }
      }
      return;
    }

    if (key === 'ArrowLeft') {
      if (current.node.type === 'folder' && expansionMap.get(current.node.id)) {
        collapseNode(current.node.id);
        return;
      }
      for (let i = currentIndex - 1; i >= 0; i -= 1) {
        if (visibleNodes[i].depth < current.depth) {
          moveToIndex(i);
          break;
        }
      }
      return;
    }

    if (key === 'Enter' || key === ' ') {
      if (current.node.type === 'folder') {
        toggleExpand(current.node.id);
      } else {
        onSelect(current.node.id);
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="file-tree-container"
      style={{ backgroundColor: isDragOverRoot ? 'var(--c-explorer-drag-bg)' : 'transparent' }}
      onDragOver={handleRootDragOver}
      onDragLeave={handleRootDragLeave}
      onDrop={handleRootDrop}
      role="tree"
      tabIndex={0}
      aria-activedescendant={selectedId ? `file-tree-item-${selectedId}` : undefined}
      onKeyDown={handleKeyDown}
      onFocus={() => {
        if (!selectedId && visibleNodes[0]) {
          setHighlight(visibleNodes[0].node.id);
        }
      }}
    >
      {roots.map(node => (
        <FileItem 
          key={node.id} 
          node={node} 
          depth={0} 
          activeId={activeId}
          selectedId={selectedId}
          onSelect={onSelect}
          onMove={onMove}
          allFiles={files}
          expansionMap={expansionMap}
          visibilityMap={visibilityMap}
          onToggleExpand={toggleExpand}
          registerItem={registerItem}
        />
      ))}
      {files.length === 0 && (
        <div className="file-tree-empty">
          EMPTY_SYSTEM
        </div>
      )}
      <div className="file-tree-buffer"></div>
    </div>
  );
};
