import React from 'react';
import { Analysis, AuthModal, ChatInput, TokenAlert, PromptCards, PageTransition, Navigation, Footer } from './components/ui';
import { useApp } from './context/AppContext';
import { useAuth, useNavigation, usePrompts, useAIInteraction, useTextSelection } from './hooks';
import { Keyboard } from 'lucide-react';
import { PromptCard, IdeaDocument } from './services/types';
import { AnimatePresence, motion, AnimatePresenceProps } from 'framer-motion';

function App() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { tokens, analysis, speech } = useApp();
  const { activeNav, setActiveNav } = useNavigation();
  const { prompts, completedPrompts, markComplete, documents, saveDocument } = usePrompts();
  const [isChatVisible, setIsChatVisible] = React.useState(true);

  const handleTranscript = React.useCallback((text: string) => {
    console.log('Received transcript:', text);
    setInputValue(text);
  }, []);

  // Handle keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsChatVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    speech.setTranscriptCallback(handleTranscript);
  }, [speech, handleTranscript]);

  const { 
    isEnhancing, 
    isAnalyzing, 
    isGenerating, 
    analysisRef,
    enhance,
    analyze,
    generate 
  } = useAIInteraction();
  
  const [tokenAlert, setTokenAlert] = React.useState<TokenAlert>({ show: false, requiredTokens: 0 });
  const [initialIdea, setInitialIdea] = React.useState('');
  const [inputValue, setInputValue] = React.useState('');
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const [isChatStarted, setIsChatStarted] = React.useState(false);
  const [currentGeneratingPrompt, setCurrentGeneratingPrompt] = React.useState<string>();

  // Focus search input when opened
  React.useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const {
    selectedText,
    selectionCoords,
    textareaRef,
    handleTextSelection,
    handleQuoteClick,
  } = useTextSelection();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow default behavior for Shift+Enter (line break)
        return;
      }
      // Prevent default Enter behavior and submit
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle token purchase
  const handleTokenPurchase = () => {
    tokens.purchase(5);
    setTokenAlert({ show: false, requiredTokens: 0 });
  };

  const handleEnhanceWithAI = async () => {
    await enhance(inputValue, setInputValue);
  };

  const handleSubmit = async () => {
    const currentInput = inputValue.trim();
    
    setInputValue('');
    setIsChatVisible(false);
    
    setIsChatStarted(true);
    setCurrentGeneratingPrompt('Analysis');

    await analyze(currentInput, completedPrompts, () => {
      setCurrentGeneratingPrompt(undefined);
      if (!completedPrompts.includes('Analysis')) {
        setInitialIdea(currentInput);
        markComplete('Analysis');
      }
    }, saveDocument);
  };

  const handlePromptCardClick = async (prompt: PromptCard, isCompleted: boolean) => {
    // If the prompt is already completed, show its content
    if (isCompleted) {
      const document = documents?.find(doc => doc.document_type === prompt.title) || 
        documents?.find(doc => doc.document_type === 'Analysis' && prompt.title === 'Analysis');
      if (document) {
        // Clear current content first
        analysis.updateContent('', '');
        // Set the new content after a brief delay to ensure state update
        setTimeout(() => {
          analysis.updateContent(document.content, prompt.title);
        }, 0);
        setIsChatStarted(true);
        return;
      }
    }

    // Check if we have an idea first (except for the Idea prompt itself)
    if (prompt.title !== 'Analysis' && !completedPrompts.includes('Analysis')) {
      alert('Please share your idea first before generating documentation.');
      return;
    }

    // Check if user has enough tokens
    if (prompt.credits && tokens < prompt.credits) {
      setTokenAlert({ show: true, requiredTokens: prompt.credits });
      return;
    }
    
    if (isGenerating) return;
    
    // Deduct tokens if the prompt requires them
    if (prompt.credits) {
      tokens.use(prompt.credits);
    }

    setIsChatStarted(true);
    setCurrentGeneratingPrompt(prompt.title);

    // Use the initial idea as context for document generation
    const ideaContext = prompt.title === 'Analysis' ? inputValue : initialIdea;
    
    try {
      await generate(prompt, initialIdea, completedPrompts, markComplete, saveDocument);
    } finally {
      setCurrentGeneratingPrompt(undefined);
    }
  };

  // Automatically adjust textarea height
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

  return (
    <>
    {!isAuthLoading && !user && (
      <AnimatePresence>
        <AuthModal onSuccess={() => {}} />
      </AnimatePresence>
    )}
    <motion.div 
      className="min-h-screen bg-[#F9F9F9]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Navigation */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 30 }}
      >
        <Navigation />
      </motion.div>

      {/* Prompt Cards */}
      <PromptCards
        prompts={prompts}
        completedPrompts={completedPrompts}
        documents={documents}
        isGenerating={isGenerating}
        inputValue={inputValue}
        currentGeneratingPrompt={currentGeneratingPrompt}
        analysis={analysis}
        onPromptClick={handlePromptCardClick}
        isChatStarted={isChatStarted}
      />

      {tokenAlert.show && (
        <TokenAlert
          requiredTokens={tokenAlert.requiredTokens}
          onClose={() => setTokenAlert({ show: false, requiredTokens: 0 })}
          onPurchase={handleTokenPurchase}
        />
      )}

      <PageTransition>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex flex-col pb-[120px]">
        {!isChatStarted && (
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-16 flex flex-col items-center justify-center min-h-[50vh]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
          >
            <h1 className="text-5xl font-bold mb-6 tracking-tight">What are we building today?</h1>
            <p className="text-sm text-gray-900">
              Get AI-powered architecture plans, documentation, and UI designs in minutes
            </p>
          </motion.div>
        )}
        
        {(analysis.content || isAnalyzing) && (
          <Analysis
            state={analysis}
            isAnalyzing={isAnalyzing}
            isGenerating={isGenerating}
            selectedText={selectedText}
            selectionCoords={selectionCoords}
            onQuoteClick={() => handleQuoteClick(setInputValue)}
            onTextSelection={handleTextSelection}
            editHistory={analysis.editHistory}
          />
        )}

        <AnimatePresence mode="wait">
          {isChatVisible && (
            <motion.div 
              className="fixed bottom-0 left-0 right-0 bg-[#F9F9F9] pb-6 pt-4"
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <ChatInput
                  value={inputValue}
                  onChange={setInputValue}
                  onSubmit={handleSubmit}
                  onEnhance={handleEnhanceWithAI}
                  isAnalyzing={isAnalyzing}
                  isEnhancing={isEnhancing}
                  tokens={tokens.balance}
                  isRecording={speech.isRecording}
                  onToggleRecording={speech.toggleRecording}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {!isChatVisible && (
          <motion.div
            className="fixed bottom-6 left-0 right-0 flex justify-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <button
              onClick={() => setIsChatVisible(true)}
              className="bg-[#E9E9E9] text-gray-900 text-sm px-4 py-2 rounded-lg shadow hover:bg-[#E9E9E9]/90 transition-colors flex items-center gap-2"
            >
              <Keyboard className="w-4 h-4" />
              <kbd className="px-2 py-1 bg-black/10 rounded text-xs">⌘K</kbd>
            </button>
          </motion.div>
        )}
        </main>
      </PageTransition>
    </motion.div>
    <Footer />
    </>
  );
}

export default App;