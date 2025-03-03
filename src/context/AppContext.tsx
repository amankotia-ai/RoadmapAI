import React, { createContext, useContext, ReactNode } from 'react';
import { useTokens, useAnalysis, useAI, useSpeech } from '@/hooks';

interface AppContextType {
  tokens: {
    balance: number;
    purchase: (amount: number) => void;
    use: (amount: number) => boolean;
  };
  analysis: {
    content: string;
    editHistory: string[];
    updateContent: (content: string) => void;
    addToHistory: (content: string) => void;
  };
  ai: {
    enhance: (text: string) => Promise<AsyncGenerator<string>>;
    analyze: (idea: string, currentAnalysis?: string) => Promise<AsyncGenerator<string>>;
    generate: (idea: string, documentType: string) => Promise<AsyncGenerator<string>>;
  };
  speech: {
    isRecording: boolean;
    toggleRecording: () => void;
    setTranscriptCallback: (callback: (text: string) => void) => void;
  };
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const tokenHook = useTokens();
  const analysisHook = useAnalysis();
  const aiHook = useAI();
  const speechHook = useSpeech();

  const value: AppContextType = {
    tokens: {
      balance: tokenHook.tokens,
      purchase: tokenHook.purchaseTokens,
      use: tokenHook.useTokens,
    },
    analysis: {
      content: analysisHook.content,
      editHistory: analysisHook.editHistory,
      updateContent: analysisHook.updateContent,
      addToHistory: analysisHook.addToHistory,
    },
    ai: {
      enhance: aiHook.enhance,
      analyze: aiHook.analyze,
      generate: aiHook.generate,
    },
    speech: {
      isRecording: speechHook.isRecording,
      toggleRecording: speechHook.toggleRecording,
      setTranscriptCallback: speechHook.setTranscriptCallback,
    },
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}