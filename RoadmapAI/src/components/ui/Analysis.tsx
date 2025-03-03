import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Download, Edit2, Save, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AnalysisState, SelectionCoords } from '@/services/types';
import { getDocumentConfig } from '@/lib/documentTypes';

interface AnalysisProps {
  state: AnalysisState;
  isAnalyzing: boolean;
  isGenerating: boolean;
  selectedText: string;
  selectionCoords: SelectionCoords | null;
  onQuoteClick: () => void;
  onTextSelection: () => void;
  editHistory: string[];
}

export function Analysis({
  state,
  isAnalyzing,
  isGenerating,
  selectedText,
  selectionCoords,
  onQuoteClick,
  onTextSelection
}: AnalysisProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedContent, setEditedContent] = React.useState('');
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Update edited content when main content changes
  React.useEffect(() => {
    setEditedContent(state.content);
  }, [state.content]);

  // Auto-adjust textarea height
  React.useEffect(() => {
    if (textareaRef.current && isEditing) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editedContent, isEditing]);

  const handleDownload = () => {
    const { displayName } = getDocumentConfig(state.documentType);
    const blob = new Blob([state.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${displayName.toLowerCase().replace(/\s+/g, '-')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(state.content);
  };

  const handleSave = () => {
    state.updateContent(editedContent);
    if (state.documentType === 'Analysis') {
     const updateAnalysis = async (content: string) => {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { data: ideas } = await supabase
          .from('ideas')
          .select('id')
          .eq('user_id', userData.user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (ideas && ideas.length > 0) {
         const { error } = await supabase
            .from('documents')
            .upsert({
              idea_id: ideas[0].id,
              document_type: 'Analysis',
             content: content
            }, {
              onConflict: 'idea_id,document_type'
            });
         
         if (error) {
           console.error('Error updating analysis:', error);
         }
        }
      };
     updateAnalysis(editedContent);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(state.content);
  };

  if (!state.content && !isAnalyzing) return null;

  const { icon: Icon, displayName } = getDocumentConfig(state.documentType);

  return (
    <motion.div
      className="w-full max-w-3xl mx-auto mb-24 min-h-[200px]"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full bg-white rounded-2xl p-8"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-indigo-600" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-gray-900">
              {isAnalyzing ? 'Analyzing...' : displayName}
              {isGenerating && 
                <span className="text-sm text-gray-500 ml-2">(Generating...)</span>
              }
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={handleDownload}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Download as Markdown"
                  disabled={!state.content}
                >
                  <Download className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={handleEdit}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Edit content"
                  disabled={!state.content}
                >
                  <Edit2 className="w-4 h-4 text-gray-500" />
                </button>
              </>
            )}
            {isEditing && (
              <>
                <button
                  onClick={handleSave}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Save changes"
                >
                  <Save className="w-4 h-4 text-green-500" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Cancel editing"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </>
            )}
          </div>
        </div>
        {state.content && (
          <div className="prose prose-lg prose-gray max-w-none">
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full min-h-[300px] p-4 border border-gray-200 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            ) : (
              <div onMouseUp={onTextSelection}>
                <ReactMarkdown
                  className="prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6
                    prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-4
                    prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-4
                    prose-p:text-gray-600 prose-p:leading-relaxed prose-p:mb-6
                    prose-ul:list-disc prose-ul:pl-6 prose-li:text-gray-600 prose-li:mb-2"
                >
                  {state.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </motion.div>
      
      {/* Floating Quote Button */}
      {selectionCoords && (
        <div
          className="quote-button fixed z-50 transform -translate-x-1/2 bg-white shadow-lg rounded-lg border border-gray-200 cursor-pointer transition-all hover:shadow-xl"
          style={{
            left: selectionCoords.x,
            top: Math.max(0, selectionCoords.y - 45)
          }}
        >
          <button
            onClick={onQuoteClick}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
          >
            <Quote className="w-4 h-4" />
            <span>Quote</span>
          </button>
        </div>
      )}
    </motion.div>
  );
}