import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, Sparkles, RefreshCw, Coins } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onEnhance: () => void;
  isAnalyzing: boolean;
  isEnhancing: boolean;
  tokens: number;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  onEnhance,
  isAnalyzing,
  isEnhancing,
  tokens
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
      // Reset height after submission
      if (textareaRef.current) {
        textareaRef.current.style.height = '24px';
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      // Set initial height when empty
      if (!value) {
        textarea.style.height = '24px';
      } else {
        // Adjust height based on content
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
      }
    }
  }, [value]);

  return (
    <div className="relative w-full">
      <div className="flex flex-col gap-4">
        <motion.div
          className="flex flex-col bg-white rounded-3xl border border-gray-200 w-full overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-start gap-4 p-4">
          <textarea
            ref={textareaRef}
            value={value}
            onKeyDown={handleKeyDown}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Message SaaS Research AI..."
            rows={1}
            className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-400 resize-none min-h-[24px] max-h-[120px] py-1 mr-2"
            style={{
              lineHeight: '24px',
            }}
          />
          </div>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-50 rounded-full text-gray-600">
                <Coins className="w-3 h-3" />
                <span className="text-xs font-medium">{tokens}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
            <button
              onClick={onEnhance}
              disabled={isEnhancing || !value.trim() || isAnalyzing}
              className={`flex items-center gap-2 h-10 px-4 text-sm font-medium rounded-lg transition-colors ${
                isEnhancing || !value.trim() || isAnalyzing
                  ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Enhance Prompt</span>
            </button>
            <button 
              onClick={onSubmit}
              disabled={isAnalyzing || !value.trim() || isEnhancing}
              className={`h-10 w-10 flex items-center justify-center rounded-full transition-colors ${
                isAnalyzing || isEnhancing
                  ? 'bg-[#3C3737]/75 cursor-not-allowed' 
                  : value.trim()
                    ? 'bg-[#3C3737] hover:bg-[#3C3737]/90'
                    : 'bg-[#3C3737]/75 cursor-not-allowed'
              } text-white`}
            >
              {(isAnalyzing || isEnhancing) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}