import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  placeholder?: string;
  defaultValue?: string;
}

export const InputModal: React.FC<InputModalProps> = ({ isOpen, onClose, onSubmit, title, placeholder, defaultValue = '' }) => {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, defaultValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <form 
        onSubmit={handleSubmit}
        className="modal-base input-modal"
      >
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button type="button" onClick={onClose} className="modal-close"><X size={14}/></button>
        </div>
        <div className="modal-content">
            <input
                ref={inputRef}
                value={value}
                onChange={e => setValue(e.target.value)}
                className="modal-input"
                placeholder={placeholder}
            />
        </div>
        <div className="modal-footer">
            <button type="button" onClick={onClose} className="modal-btn">CANCEL</button>
            <button type="submit" className="modal-btn modal-btn-primary">CONFIRM</button>
        </div>
      </form>
    </div>
  );
};