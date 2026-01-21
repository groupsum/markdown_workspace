import React from 'react';
import { Database, Wifi, WifiOff } from 'lucide-react';

interface FooterProps {
    cursorLine: number;
    cursorCol: number;
    unsaved: boolean;
    version: string;
    online?: boolean;
    className?: string;
}

export const Footer: React.FC<FooterProps> = ({ 
  cursorLine, 
  cursorCol, 
  unsaved, 
  version, 
  online = true,
  className = "" 
}) => {
    return (
        <footer className={`status-bar ${className}`}>
            <div className="status-left">
                <div className="status-item" title="Storage Status">
                    <Database size={12} className="status-item__icon" />
                    <span className="status-text-bold">IDB: PERSISTENT</span>
                </div>
                <div className="status-sep"></div>
                <div className="status-item status-item--cursor">
                    <span className="status-kv">LN {cursorLine}</span>
                    <span className="status-kv"> COL {cursorCol}</span>
                </div>
                <div className="status-sep"></div>
                <div className="status-item">
                    <span className="status-label">ENC:</span>
                    <span className="status-text-bold">UTF-8</span>
                </div>
                <div className="status-sep"></div>
                <div className="status-item">
                    <span className="status-label">AUTO-SAVE:</span>
                    <span className="status-text-bold">ON</span>
                </div>
            </div>

            <div className="status-right">
                <div className="status-item">
                    <span className={`status-text-bold ${unsaved ? 'status-text--warn' : 'status-text--on'}`}>
                        {unsaved ? 'UNWRITTEN' : 'SAVED'}
                    </span>
                </div>
                <div className="status-sep"></div>
                <div className="status-item">
                    {online ? (
                      <div className="status-online">
                        <Wifi size={12} />
                        <span className="status-text-bold">ONLINE</span>
                      </div>
                    ) : (
                      <div className="status-offline">
                        <WifiOff size={12} />
                        <span className="status-text-bold">OFFLINE</span>
                      </div>
                    )}
                </div>
                <div className="status-sep"></div>
                <div className="status-item">
                    <span className="status-label">PWA:</span>
                    <span className="status-text-bold status-text--on">
                        v{version}
                    </span>
                </div>
                <div className="status-sep"></div>
                <div className="status-item" title="Sync Status">
                    <div className="status-dot"></div>
                    <span className="status-text-bold">SYNCED</span>
                </div>
            </div>
        </footer>
    );
};
