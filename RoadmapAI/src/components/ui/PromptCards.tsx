import React from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { CheckCircle2, Sparkles, FileText, GitBranch, Palette, Layout, Database, Code, PenTool, Wrench, TestTube2, GitMerge } from 'lucide-react';
import { PromptCard, IdeaDocument } from '@/services/types';

const iconComponents = {
  sparkles: Sparkles,
  'file-text': FileText,
  'git-branch': GitBranch,
  palette: Palette,
  layout: Layout,
  database: Database,
  code: Code,
  'pen-tool': PenTool,
  wrench: Wrench,
  'test-tube-2': TestTube2,
  'git-merge': GitMerge,
} as const;

interface PromptCardsProps {
  prompts: PromptCard[];
  completedPrompts: string[];
  isGenerating: boolean;
  documents: IdeaDocument[];
  inputValue: string;
  currentGeneratingPrompt?: string;
  analysis: {
    documentType: string;
  };
  onPromptClick: (prompt: PromptCard, isCompleted: boolean) => void;
  isChatStarted: boolean;
}

export function PromptCards({ 
  prompts,
  completedPrompts, 
  isGenerating, 
  documents,
  inputValue, 
  currentGeneratingPrompt,
  analysis,
  onPromptClick,
  isChatStarted
}: PromptCardsProps) {
  return (
    <LayoutGroup>
      <div className="border-b sticky top-0 backdrop-blur-sm bg-[#F9F9F9]/80 z-10"
        style={{ display: isChatStarted ? 'block' : 'none' }}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start md:justify-center space-x-4 md:space-x-8 h-16 overflow-x-auto scrollbar-hide">
            {prompts.map((prompt, index) => (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ 
                  opacity: 1,
                  y: 0,
                  scale: prompt.isAvailable === false ? 0.95 : 1
                }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: [0.23, 1, 0.32, 1]
                }}
                disabled={isGenerating || (!inputValue.trim() && prompt.title === 'Idea') || prompt.isAvailable === false}
                onClick={() => {
                  if (prompt.isAvailable === false) {
                    const required = prompt.requiredPrompts?.join(', ');
                    alert(`Please complete ${required} first before generating ${prompt.title}`);
                    return;
                  }
                  onPromptClick(prompt, completedPrompts.includes(prompt.title));
                  if (completedPrompts.includes(prompt.title)) {
                    const index = completedPrompts.indexOf(prompt.title);
                    const sectionId = `section-${index}`;
                    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                key={index}
                className={`text-sm font-medium transition-colors whitespace-nowrap
                ${isGenerating ? 'cursor-wait' : 'cursor-pointer'} px-2 py-1
                ${(!inputValue.trim() && prompt.title === 'Idea') ? 'opacity-50 cursor-not-allowed' : ''}
                ${prompt.isAvailable === false ? 'opacity-50 cursor-not-allowed' : ''}
                ${completedPrompts.includes(prompt.title)
                  ? 'text-[#403B3B] font-semibold' 
                  : 'text-gray-900 hover:text-gray-700'}`}
                title={completedPrompts.includes(prompt.title) ? 'Click to view generated content' : undefined}
              >
                <div className="relative">
                  <div className="flex items-center gap-2 py-1">
                  <span className="truncate">{prompt.title}</span>
                  {completedPrompts.includes(prompt.title) && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </motion.div>
                  )}
                  </div>
                  {((isGenerating && currentGeneratingPrompt === prompt.title) || 
                    (prompt.title === 'Analysis' && currentGeneratingPrompt === 'Analysis') ||
                    (completedPrompts.includes(prompt.title) && analysis.documentType === prompt.title)) && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#403B3B]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ 
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </LayoutGroup>
  );
}