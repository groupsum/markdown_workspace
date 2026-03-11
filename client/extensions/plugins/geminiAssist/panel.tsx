import React, { useState } from 'react';
import { Send, X } from 'lucide-react';
import type { AssistantMessage, ExtensionPanelProps } from '../types';

export const GeminiAssistPanel: React.FC<ExtensionPanelProps> = ({ isOpen, onClose, onToast, service }) => {
  const [prompt, setPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [history, setHistory] = useState<AssistantMessage[]>([]);

  if (!isOpen) {
    return null;
  }

  const submitPrompt = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || isSending) return;

    const userMessage: AssistantMessage = { role: 'user', content: trimmed, createdAt: Date.now() };
    const nextHistory = [...history, userMessage];
    setHistory(nextHistory);
    setPrompt('');
    setIsSending(true);

    try {
      const response = await service.sendPrompt(trimmed, nextHistory);
      setHistory((prev) => [...prev, { role: 'assistant', content: response, createdAt: Date.now() }]);
      onToast('GEMINI RESPONSE READY', 'success');
    } catch {
      onToast('GEMINI SERVICE ERROR', 'warning');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="modal-overlay extension-panel-overlay extension-panel-overlay--gemini" role="dialog" aria-modal="true" aria-label={service.panelTitle}>
      <div className="extension-panel-surface extension-panel-surface--gemini">
        <header className="extension-panel-header">
          <h3>{service.panelTitle}</h3>
          <button className="panel-icon-btn" onClick={onClose} aria-label="Close Gemini assistant panel">
            <X size={16} />
          </button>
        </header>
        <div className="extension-panel-body">
          <div className="extension-thread" aria-live="polite">
            {history.length === 0 ? <p className="extension-empty">No messages yet. Interact with Gemini background service.</p> : null}
            {history.map((message, index) => (
              <article key={`${message.createdAt}-${index}`} className={`extension-message extension-message--${message.role}`}>
                <strong>{message.role === 'user' ? 'YOU' : 'GEMINI'}</strong>
                <p>{message.content}</p>
              </article>
            ))}
          </div>
          <div className="extension-input-row">
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Message Gemini service..." rows={3} />
            <button className="extension-send-btn" onClick={() => void submitPrompt()} disabled={isSending || !prompt.trim()}>
              <Send size={14} /> {isSending ? 'SENDING...' : 'SEND'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
