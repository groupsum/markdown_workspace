import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FileNode } from '../../types';
import { FileText, Folder, Command, ArrowRight } from 'lucide-react';

export interface CommandPaletteActionItem {
  readonly id: string;
  readonly label: string;
  readonly action: () => void | Promise<void>;
  readonly icon?: React.ReactNode;
  readonly keywords?: readonly string[];
}

interface CommandPaletteProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly files: FileNode[];
  readonly onSelectFile: (id: string) => void;
  readonly commands?: readonly CommandPaletteActionItem[];
  readonly actions?: readonly CommandPaletteActionItem[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  files,
  onSelectFile,
  commands,
  actions,
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

  const registeredCommands = commands ?? actions ?? [];

  const filteredFiles = useMemo(
    () => files.filter((file) => file.name.toLowerCase().includes(query.toLowerCase())),
    [files, query],
  );

  const filteredCommands = useMemo(
    () => registeredCommands.filter((command) => {
      const haystack = [command.label, ...(command.keywords ?? [])].join(' ').toLowerCase();
      return haystack.includes(query.toLowerCase());
    }),
    [query, registeredCommands],
  );

  const combinedItems = [
    ...filteredCommands.map((command) => ({ type: 'command' as const, data: command })),
    ...filteredFiles.map((file) => ({ type: 'file' as const, data: file })),
  ];

  if (!isOpen) return null;

  const execute = (item: (typeof combinedItems)[number] | undefined) => {
    if (!item) return;
    if (item.type === 'command') {
      void item.data.action();
    } else {
      onSelectFile(item.data.id);
    }
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, combinedItems.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      execute(combinedItems[activeIndex]);
    } else if (event.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="cmd-backdrop" onClick={onClose}>
      <div className="cmd-palette" onClick={(event) => event.stopPropagation()}>
        <div className="cmd-header">
          <div className="cmd-search-icon"><Command size={16} /></div>
          <input
            ref={inputRef}
            className="cmd-input"
            placeholder="Type a command or search files..."
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          <div className="cmd-badge">ESC</div>
        </div>

        <div className="cmd-list">
          {combinedItems.length === 0 && <div className="cmd-empty">NO RESULTS</div>}
          {combinedItems.map((item, index) => (
            <div
              key={`${item.type}-${item.data.id}`}
              className={`cmd-item ${item.type === 'command' ? 'action' : ''} ${index === activeIndex ? 'active' : ''}`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => execute(item)}
            >
              {item.type === 'command' ? (
                <>
                  <span className="cmd-icon-wrapper">{item.data.icon || <ArrowRight size={14} />}</span>
                  <span className="cmd-item-text">{item.data.label}</span>
                  <span className="cmd-item-type">CMD</span>
                </>
              ) : (
                <>
                  <span className="cmd-item-icon">{item.data.type === 'folder' ? <Folder size={14} /> : <FileText size={14} />}</span>
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
