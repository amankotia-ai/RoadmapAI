import { useState, useRef, useEffect } from 'react';

interface TextSelectionCoords {
  x: number;
  y: number;
}

export function useTextSelection() {
  const [selectedText, setSelectedText] = useState('');
  const [selectionCoords, setSelectionCoords] = useState<TextSelectionCoords | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(selection.toString().trim());
      setSelectionCoords({
        x: rect.left + (rect.width / 2),
        y: rect.top - 10
      });
    } else {
      clearSelection();
    }
  };

  const handleQuoteClick = (onQuote: (text: string) => void) => {
    if (selectedText) {
      onQuote(`Regarding this part: "${selectedText}"\n\n`);
      clearSelection();
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  };

  const clearSelection = () => {
    setSelectedText('');
    setSelectionCoords(null);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (selectionCoords && !(e.target as HTMLElement).closest('.quote-button')) {
        clearSelection();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectionCoords]);

  return {
    selectedText,
    selectionCoords,
    textareaRef,
    handleTextSelection,
    handleQuoteClick,
    clearSelection
  };
}