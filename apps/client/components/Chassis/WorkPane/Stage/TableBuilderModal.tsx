import React from 'react';

interface TableBuilderModalProps {
  readonly rows: number;
  readonly columns: number;
  readonly onRowsChange: (value: number) => void;
  readonly onColumnsChange: (value: number) => void;
  readonly onClose: () => void;
  readonly onInsert: () => void;
}

export const TableBuilderModal: React.FC<TableBuilderModalProps> = ({
  rows,
  columns,
  onRowsChange,
  onColumnsChange,
  onClose,
  onInsert,
}) => (
  <div className="modal-overlay">
    <div className="modal-base modal-base--table-builder">
      <div className="modal-header">
        <span className="modal-title">INSERT_TABLE_NxM</span>
        <button type="button" onClick={onClose} className="modal-close">X</button>
      </div>
      <div className="settings-pane">
        <div className="settings-card settings-card-stack">
          <div className="settings-grid-2">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">ROWS</span>
              <input className="modal-input !text-xs !py-3" type="number" min={1} max={12} value={rows} onChange={(event) => onRowsChange(Number(event.target.value) || 1)} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">COLUMNS</span>
              <input className="modal-input !text-xs !py-3" type="number" min={1} max={8} value={columns} onChange={(event) => onColumnsChange(Number(event.target.value) || 1)} />
            </label>
          </div>
          <div className="settings-action-row">
            <button type="button" className="modal-btn" onClick={onClose}>CANCEL</button>
            <button type="button" className="modal-btn modal-btn-primary" onClick={onInsert}>INSERT_NxM</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);
