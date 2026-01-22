import React, { useState, useEffect, useRef } from 'react';
import { FileNode } from '../../types';
import { FileText, Folder, Command, ArrowRight } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileNode[];
  onSelectFile: (id: string) => void;
  actions: { id: string; label: string; action: () => void; icon?: React.ReactNode }[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, onClose, files, onSelectFile, actions 
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter
  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));
  const filteredActions = actions.filter(a => a.label.toLowerCase().includes(query.toLowerCase()));

  const combinedItems = [
    ...filteredActions.map(a => ({ type: 'action' as const, data: a })),
    ...filteredFiles.map(f => ({ type: 'file' as const, data: f }))
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, combinedItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      execute(combinedItems[activeIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const execute = (item: typeof combinedItems[0]) => {
    if (!item) return;
    if (item.type === 'action') {
      item.data.action();
    } else {
      onSelectFile(item.data.id);
    }
    onClose();
  };

  return (
    <div className="cmd-backdrop" onClick={onClose}>
      <div 
        className="cmd-palette"
        onClick={e => e.stopPropagation()}
      >
        <div className="cmd-header">
          <div className="cmd-search-icon">
            <Command size={16} />
          </div>
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder="Type a command or search files..."
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIndex(0); }}
            onKeyDown={handleKeyDown}
          />
          <div className="cmd-badge">ESC</div>
        </div>

        <div className="cmd-list">
           {combinedItems.length === 0 && (
             <div className="cmd-empty">NO RESULTS</div>
           )}
           {combinedItems.map((item, idx) => (
             <div
               key={`${item.type}-${item.type === 'action' ? item.data.id : item.data.id}`}
               className={`cmd-item ${item.type === 'action' ? 'action' : ''} ${idx === activeIndex ? 'active' : ''}`}
               onMouseEnter={() => setActiveIndex(idx)}
               onClick={() => execute(item)}
             >
               {item.type === 'action' ? (
                 <>
                    <span className="cmd-icon-wrapper">{item.data.icon || <ArrowRight size={14}/>}</span>
                    <span className="cmd-item-text">{item.data.label}</span>
                    <span className="cmd-item-type">CMD</span>
                 </>
               ) : (
                 <>
                    <span className="cmd-item-icon">
                        {item.data.type === 'folder' ? <Folder size={14} /> : <FileText size={14} />}
                    </span>
                    <span className="cmd-item-text">{item.data.name}</span>
                    <span className="cmd-item-type">FILE</span>
                 </>
               )}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};