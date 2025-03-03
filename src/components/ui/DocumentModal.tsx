import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { getDocumentConfig } from '@/lib/documentTypes';
import { IdeaDocument } from '@/services/types';

interface DocumentModalProps {
  doc: IdeaDocument | null;
  onClose: () => void;
}

export function DocumentModal({ doc, onClose }: DocumentModalProps) {
  // Handle scroll lock
  React.useEffect(() => {
    if (doc && typeof window !== 'undefined') {
      // Save current scroll position and lock scroll
      const scrollY = window.scrollY;
      const body = window.document.querySelector('body');
      if (body) {
        body.style.position = 'fixed';
        body.style.top = `-${scrollY}px`;
        body.style.width = '100%';
      }

      return () => {
        if (body) {
          // Cleanup function to restore scroll
          const scrollY = body.style.top;
          body.style.position = '';
          body.style.top = '';
          body.style.width = '';
          window.scrollTo(0, parseInt(scrollY || '0') * -1);
        }
      };
    }
  }, [doc]);

  // Close on escape key
  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!doc) return null;

  const { icon: Icon, displayName } = getDocumentConfig(doc.document_type);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-hidden"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 text-[#3C3737]" />
              <h2 className="text-xl font-semibold text-gray-900">{displayName}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-5rem)]">
            <div className="prose prose-gray max-w-none">
              <ReactMarkdown
                className="prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6
                  prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-4
                  prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-4
                  prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6
                  prose-ul:list-disc prose-ul:pl-6 prose-li:text-gray-600 prose-li:mb-2"
              >
                {doc.content}
              </ReactMarkdown>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}