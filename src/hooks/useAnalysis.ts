import { useState, useCallback } from 'react';
import { AnalysisService, AnalysisServiceImpl } from '@/services';

export function useAnalysis() {
  const [analysisService] = useState<AnalysisService>(() => new AnalysisServiceImpl());
  const [content, setContent] = useState(analysisService.content);
  const [editHistory, setEditHistory] = useState(analysisService.editHistory);

  const updateContent = useCallback((newContent: string) => {
    analysisService.updateContent(newContent);
    setContent(newContent);
    setEditHistory(analysisService.editHistory);
  }, [analysisService]);

  const addToHistory = useCallback((historyItem: string) => {
    analysisService.addToHistory(historyItem);
    setEditHistory(analysisService.editHistory);
  }, [analysisService]);

  return {
    content,
    editHistory,
    updateContent,
    addToHistory,
    getLatestContent: useCallback(() => analysisService.getLatestContent(), [analysisService]),
    getHistory: useCallback(() => analysisService.getHistory(), [analysisService])
  };
}