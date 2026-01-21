import React from 'react';
import { FileNode } from '../../../../types';
import { FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { useFileItem } from '../../../../hooks/useFileItem';
import { useFileTreeDnD } from '../../../../hooks/useFileTreeDnD';

interface FileTreeProps {
  files: FileNode[];
  activeId: string | null;
  selectedId: string | null; // Visual selection in tree
  onSelect: (id: string) => void;
  onMove: (fileId: string, targetFolderId: string | null) => void;
  searchQuery?: string;
}

const FileItem: React.FC<{ 
  node: FileNode; 
  depth: number; 
  selectedId: string | null; 
  onSelect: (id: string) => void;
  onMove: (fileId: string, targetFolderId: string | null) => void;
  allFiles: FileNode[];
  searchQuery?: string;
}> = (props) => {
  const { node, depth, allFiles, selectedId, onSelect, onMove, searchQuery } = props;
  
  const {
    isExpanded,
    isDragOver,
    isSelected,
    children,
    shouldRender,
    toggleExpand,
    selectNode,
    dnd
  } = useFileItem({
    node,
    allFiles,
    selectedId,
    onSelect,
    onMove,
    searchQuery
  });

  if (!shouldRender) return null;

  return (
    <div>
      <div 
        {...dnd}
        onClick={selectNode}
        className={`file-tree-item ${isSelected ? 'selected' : ''} ${node.type === 'folder' ? 'folder' : ''}`}
        style={{ 
            paddingLeft: `calc(var(--file-indent-base) + ${depth} * var(--file-indent-unit))`,
            backgroundColor: isDragOver ? 'var(--c-explorer-drag-bg)' : undefined
        }}
      >
        <span 
          className="file-tree-icon"
          onClick={node.type === 'folder' ? toggleExpand : undefined}
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
              selectedId={selectedId}
              onSelect={onSelect}
              onMove={onMove}
              allFiles={allFiles}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileTree: React.FC<FileTreeProps> = ({ files, selectedId, onSelect, onMove, searchQuery }) => {
  const roots = files.filter(f => f.parentId === null);
  const { isDragOverRoot, handleRootDragOver, handleRootDragLeave, handleRootDrop } = useFileTreeDnD(onMove);

  return (
    <div 
      className="file-tree-container"
      style={{ backgroundColor: isDragOverRoot ? 'var(--c-explorer-drag-bg)' : 'transparent' }}
      onDragOver={handleRootDragOver}
      onDragLeave={handleRootDragLeave}
      onDrop={handleRootDrop}
    >
      {roots.map(node => (
        <FileItem 
          key={node.id} 
          node={node} 
          depth={0} 
          selectedId={selectedId}
          onSelect={onSelect}
          onMove={onMove}
          allFiles={files}
          searchQuery={searchQuery}
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