import { useState, useCallback, useEffect } from 'react';
import { PromptService, PromptServiceImpl } from '@/services/PromptService';
import { PromptCard, Idea, IdeaDocument } from '@/services/types';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { useRef } from 'react';

export function usePrompts(ideaId?: string) {
  const [promptService] = useState<PromptService>(() => new PromptServiceImpl());
  const [prompts, setPrompts] = useState<PromptCard[]>(promptService.getPrompts());
  const [completedPrompts, setCompletedPrompts] = useState<string[]>(promptService.getCompletedPrompts());
  const retryCount = useRef(0);
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  const fetchWithRetry = async (operation: () => Promise<any>, operationName: string) => {
    while (retryCount.current < maxRetries) {
      try {
        const result = await operation();
        retryCount.current = 0; // Reset counter on success
        return result;
      } catch (error) {
        retryCount.current++;
        console.warn(`${operationName} attempt ${retryCount.current} failed:`, error);
        
        if (retryCount.current === maxRetries) {
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount.current));
      }
    }
  };
  const [currentIdea, setCurrentIdea] = useState<Idea | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [documents, setDocuments] = useState<IdeaDocument[]>([]);
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user's ideas
  useEffect(() => {
    if (user) {
      let isMounted = true;
      const fetchIdeas = async () => {
        setIsLoading(true);
        setError(null);
        let retryCount = 0;
        const maxRetries = 3;
        const retryDelay = 1000;

        try {
          while (retryCount < maxRetries) {
            try {
              // Check if component is still mounted
              if (!isMounted) return;

              const { data: userIdeas, error: ideasError } = await supabase
                .from('ideas')
                .select('*, documents(*)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

              if (ideasError) throw ideasError;
              if (isMounted) setIdeas(userIdeas || []);
              break;
            } catch (err) {
              retryCount++;
              if (retryCount === maxRetries) throw err;
              // Exponential backoff
              await new Promise(resolve => 
                setTimeout(resolve, 
                  Math.min(Math.pow(2, retryCount) * retryDelay, 10000)
                )
              );
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Failed to connect to the database. Please check your internet connection and try again.';
          setError(new Error(errorMessage));
          if (isMounted) {
            console.error('Error fetching ideas:', error);
            setIdeas([]);
          }
        } finally {
          if (isMounted) setIsLoading(false);
        }
      };

      fetchIdeas();
      return () => { isMounted = false; };
    } else {
      if (user === null) setIdeas([]);
      setIsLoading(false);
    }
  }, [user]);

  // Load documents when completedPrompts changes
  useEffect(() => {
    if (currentIdea) {
      fetchDocuments(currentIdea.id);
    }
  }, [completedPrompts]);

  const fetchDocuments = async (ideaId: string) => {
    try {
      const { data: docs, error: docsError } = await fetchWithRetry(
        async () => supabase
          .from('documents')
          .select('*')
          .eq('idea_id', ideaId),
        'Fetch documents'
      );

      if (docsError) throw docsError;
      setDocuments(docs || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (ideaId) {
      fetchIdeaAndDocuments(ideaId);
    }
  }, [ideaId]);

  const fetchIdeaAndDocuments = async (id: string) => {
    try {
      // Fetch idea
      const { data: idea, error: ideaError } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', id)
        .single();

      if (ideaError) throw ideaError;

      // Fetch documents
      const { data: docs, error: docsError } = await supabase
        .from('documents')
        .select('*')
        .eq('idea_id', id);

      if (docsError) throw docsError;

      setCurrentIdea(idea);
      setDocuments(docs);

      // Update completed prompts based on existing documents
      const completedTypes = docs.map(doc => doc.document_type);
      setCompletedPrompts(completedTypes);

      // Update prompts with content
      const updatedPrompts = promptService.getPrompts().map(prompt => ({
        ...prompt,
        content: docs.find(doc => doc.document_type === prompt.title)?.content
      }));
      setPrompts(updatedPrompts);
    } catch (error) {
      console.error('Error fetching idea and documents:', error);
    }
  };

  const markComplete = useCallback((title: string) => {
    promptService.markPromptComplete(title);
    setPrompts(promptService.getPrompts());
    setCompletedPrompts(promptService.getCompletedPrompts());
  }, [promptService]);

  const saveDocument = async (ideaId: string, documentType: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .upsert({
          idea_id: ideaId,
          document_type: documentType,
          content
        }, {
          onConflict: 'idea_id,document_type'
        })
        .select()
        .single();

      if (error) throw error;

      // Update local state
      await fetchDocuments(ideaId);

      return data;
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  };

  return {
    prompts,
    completedPrompts,
    ideas,
    isLoading,
    error,
    markComplete,
    currentIdea,
    documents,
    saveDocument,
    isComplete: useCallback((title: string) => 
      promptService.isPromptComplete(title), [promptService])
  };
}