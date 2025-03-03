import { useState, useCallback, useEffect } from 'react';
import { SpeechService, SpeechServiceImpl } from '@/services';

export function useSpeech() {
  const [speechService] = useState<SpeechService>(() => new SpeechServiceImpl());
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptCallback, setTranscriptCallback] = useState<((text: string) => void) | null>(null);

  useEffect(() => {
    if (transcriptCallback) {
      const handleTranscript = (text: string) => {
        transcriptCallback(text);
      };

      speechService.onTranscript(handleTranscript);

      return () => {
        // Clean up by setting callback to null when component unmounts
        speechService.onTranscript(() => {});
      };
    }
  }, [speechService, transcriptCallback]);

  const toggleRecording = useCallback(async () => {
    try {
      await speechService.toggleRecording();
      setIsRecording(speechService.isRecording);
    } catch (error) {
      console.error('Speech recognition error:', error);
      setIsRecording(false);
    }
  }, [speechService]);

  const setCallback = useCallback((callback: (text: string) => void) => {
    setTranscriptCallback(() => callback);
  }, []);

  return {
    isRecording,
    toggleRecording,
    setTranscriptCallback: setCallback
  };
}