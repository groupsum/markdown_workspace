import React from 'react';

interface StatusLedProps {
  status: 'ok' | 'warn' | 'error' | 'offline';
}

export const StatusLed: React.FC<StatusLedProps> = ({ status }) => {
  return (
    <div 
      className={`status-led ${status}`}
      title={`System Status: ${status.toUpperCase()}`}
    />
  );
};