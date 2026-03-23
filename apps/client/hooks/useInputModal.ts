
import { useState, useCallback } from 'react';

export const useInputModal = () => {
  const [showInputModal, setShowInputModal] = useState(false);
  const [inputCallback, setInputCallback] = useState<(value: string) => void>(() => {});
  const [inputTitle, setInputTitle] = useState('');
  const [inputPlaceholder, setInputPlaceholder] = useState('');
  const [inputDefaultValue, setInputDefaultValue] = useState('');

  const promptInput = useCallback((title: string, placeholder: string, callback: (val: string) => void, defaultValue = '') => {
      console.log(`[useInputModal] Action: promptInput -> Title: ${title}`);
      setInputTitle(title);
      setInputPlaceholder(placeholder);
      setInputCallback(() => callback);
      setInputDefaultValue(defaultValue);
      setShowInputModal(true);
  }, []);

  const closeInputModal = useCallback(() => {
      console.log("[useInputModal] Action: closeInputModal");
      setShowInputModal(false);
  }, []);

  return {
      showInputModal,
      inputCallback,
      inputTitle,
      inputPlaceholder,
      inputDefaultValue,
      promptInput,
      closeInputModal
  };
};
