import React from 'react';
import { useClientI18n } from '../../../../src/features/i18n/useClientI18n';

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
}) => {
  const { t } = useClientI18n();
  return (
  <div className="modal-overlay">
    <div className="modal-base modal-base--table-builder">
      <div className="modal-header">
        <span className="modal-title">{t('core.table-builder.title', 'INSERT_TABLE_NxM')}</span>
        <button type="button" onClick={onClose} className="modal-close">X</button>
      </div>
      <div className="settings-pane">
        <div className="settings-card settings-card-stack">
          <div className="settings-grid-2">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{t('core.table-builder.rows', 'ROWS')}</span>
              <input className="modal-input !text-xs !py-3" type="number" min={1} max={12} value={rows} onChange={(event) => onRowsChange(Number(event.target.value) || 1)} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-[var(--fg-muted)] uppercase">{t('core.table-builder.columns', 'COLUMNS')}</span>
              <input className="modal-input !text-xs !py-3" type="number" min={1} max={8} value={columns} onChange={(event) => onColumnsChange(Number(event.target.value) || 1)} />
            </label>
          </div>
          <div className="settings-action-row">
            <button type="button" className="modal-btn" onClick={onClose}>{t('core.common.cancel', 'CANCEL')}</button>
            <button type="button" className="modal-btn modal-btn-primary" onClick={onInsert}>{t('core.table-builder.insert', 'INSERT_NxM')}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
