import { useState, useCallback } from 'react';
import { AIService, AIServiceImpl } from '@/services';

export function useAI() {
  const [aiService] = useState<AIService>(() => new AIServiceImpl());

  return {
    enhance: useCallback((text: string) => aiService.enhance(text), [aiService]),
    analyze: useCallback((idea: string, currentAnalysis?: string) => 
      aiService.analyze(idea, currentAnalysis), [aiService]),
    generate: useCallback((idea: string, documentType: string) => 
      aiService.generate(idea, documentType), [aiService])
  };
}