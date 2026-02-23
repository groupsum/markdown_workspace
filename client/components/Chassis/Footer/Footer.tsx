import React from 'react';
import { Wifi, WifiOff } from 'lucide-react';

interface FooterProps {
    cursorLine: number;
    cursorCol: number;
    shellVersion: string;
    buildId: string;
    online?: boolean;
    isInstalled?: boolean;
    updateAvailable?: boolean;
    className?: string;
}

export const Footer: React.FC<FooterProps> = ({ 
  cursorLine, 
  cursorCol, 
  shellVersion,
  buildId,
  online = true,
  isInstalled = false,
  updateAvailable = false,
  className = "" 
}) => {
    const shellLabel = isInstalled ? 'PWA' : 'BROWSER';
    const runtimeLabel = `${shellLabel}: v${shellVersion}:${buildId}`;

    return (
        <footer className={`status-bar ${className}`}>
            <div className="status-left">
                <div className="status-item status-item--cursor">
                    <span className="status-kv">LN {cursorLine}</span>
                    <span className="status-kv"> COL {cursorCol}</span>
                </div>
                <div className="status-sep"></div>
                <div className="status-item status-item--optional" title="Encoding">
                    <span className="status-label">ENC:</span>
                    <span className="status-text-bold">UTF-8</span>
                </div>
            </div>

            <div className="status-right">
                <div className="status-item status-item--optional">
                    <span className="status-label">AUTO-SAVE:</span>
                    <span className="status-text-bold status-text--on">ON</span>
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
                <div className="status-item" title="Runtime shell">
                    <span className="status-text-bold">{runtimeLabel}</span>
                </div>
                {updateAvailable && (
                  <>
                    <div className="status-sep"></div>
                    <div className="status-item" title="Application update status">
                      <span className="status-text-bold status-text--warn">UPDATE_READY</span>
                    </div>
                  </>
                )}
            </div>
        </footer>
    );
};
