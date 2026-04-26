import React from 'react';
import type { ToastType } from '../../src/features/notifications/toastMessage';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  messages: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ messages, onDismiss }) => {
  return (
    <div className="toast-container">
      {messages.map(msg => (
        <div
          key={msg.id}
          className={`toast-message ${msg.type}`}
        >
          <span>{msg.message}</span>
          <button type="button" aria-label="Dismiss toast" onClick={() => onDismiss(msg.id)} className="toast-close-btn">x</button>
        </div>
      ))}
    </div>
  );
};
