import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { PromptCard, Idea } from '@/services/types';
import { supabase } from '@/lib/supabase';

export function useAIInteraction() {
  const { ai, analysis } = useApp();
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const analysisRef = useRef<HTMLDivElement>(null);
  const [currentIdea, setCurrentIdea] = useState<Idea | null>(null);
  const latestAnalysisRef = useRef<string>('');

  const enhance = async (inputValue: string, onUpdate: (value: string) => void) => {
    if (!inputValue.trim() || isEnhancing) return;
    
    setIsEnhancing(true);
    let enhancedText = '';
    
    try {
      for await (const chunk of ai.enhance(inputValue)) {
        enhancedText += chunk;
        onUpdate(enhancedText);
      }
    } catch (error) {
      console.error('Error enhancing text:', error);
      onUpdate(prev => prev + '\n\nError: Failed to connect to OpenAI API. Please check your internet connection and try again.');
    } finally {
      setIsEnhancing(false);
    }
  };

  const analyze = async (input: string, completedPrompts: string[], onComplete: () => void, saveDocument?: (ideaId: string, documentType: string, content: string) => Promise<void>) => {
    if (!input.trim() || isAnalyzing) return;
    
    // Set analyzing state
    setIsAnalyzing(true);
    analysis.updateContent('', 'Analysis');
    
    let accumulatedText = '';
    let idea: Idea | null = null;

    try {
      // If this is the initial analysis, create it in the database
      if (!completedPrompts.includes('Analysis')) {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const { data: newIdea, error: ideaError } = await supabase
            .from('ideas')
            .insert({
              title: input.split('\n')[0] || 'Untitled Idea',
              description: input,
              user_id: userData.user.id,
              is_public: false
            })
            .select()
            .single();

          if (ideaError) throw ideaError;
          idea = newIdea;
          setCurrentIdea(newIdea);
        }
      }

      let isQuotedEdit = input.includes('Regarding this part:');
      for await (const chunk of ai.analyze(input, analysis.content)) {
        if (isQuotedEdit) {
          analysis.updateContent(chunk, 'Analysis');
        } else {
          accumulatedText += chunk;
          analysis.updateContent(accumulatedText, 'Analysis');
          latestAnalysisRef.current = accumulatedText;
        }
        
        if (analysisRef.current) {
          analysisRef.current.scrollTop = analysisRef.current.scrollHeight;
        }
      }

      // Save the analysis as a document if it's the initial idea
      if (idea && saveDocument) {
        await saveDocument(idea.id, 'Analysis', accumulatedText);
        // Mark Analysis as completed after saving
        onComplete();
      } else if (currentIdea && saveDocument) {
        await saveDocument(currentIdea.id, 'Analysis', accumulatedText);
        // Mark Analysis as completed after saving
        onComplete();
        // Ensure we clear analyzing state
        setIsAnalyzing(false);
      }
    } catch (error) {
      console.error('Error analyzing idea:', error);
      analysis.updateContent('Error: Failed to connect to OpenAI API. Please check your internet connection and try again.');
      setIsAnalyzing(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generate = async (
    prompt: PromptCard,
    _initialIdea: string,
    completedPrompts: string[],
    onComplete: (title: string) => void,
    saveDocument?: (ideaId: string, documentType: string, content: string) => Promise<void>
  ) => {
    if (isGenerating || completedPrompts.includes(prompt.title)) return;

    setIsGenerating(true);
    analysis.updateContent('', prompt.title); // Set the document type immediately
    let accumulatedText = '';

    try {
      // First try to get the latest analysis from our ref
      let latestAnalysisContent = latestAnalysisRef.current;
      
      // If not available, fetch from database
      if (!latestAnalysisContent && currentIdea) {
        const { data: analysisDoc } = await supabase
          .from('documents')
          .select('content')
          .eq('idea_id', currentIdea.id)
          .eq('document_type', 'Analysis')
          .single();
        
        if (analysisDoc) {
          latestAnalysisContent = analysisDoc.content;
          latestAnalysisRef.current = analysisDoc.content;
        }
      }

      // Pass the latest analysis content to the generator
      const ideaContext = currentIdea 
        ? { ...currentIdea, description: latestAnalysisContent || latestAnalysisRef.current || currentIdea.description }
        : { description: latestAnalysisContent || latestAnalysisRef.current || _initialIdea };
      
      for await (const chunk of ai.generate(ideaContext, prompt.title)) {
        accumulatedText += chunk;
        analysis.updateContent(accumulatedText, prompt.title); // Maintain document type while updating content
        
        if (analysisRef.current) {
          analysisRef.current.scrollTop = analysisRef.current.scrollHeight;
        }
      }
      
      // Save the generated document
      if (currentIdea && saveDocument) {
        await saveDocument(currentIdea.id, prompt.title, accumulatedText);
      }
      
      // Update analysis content with the saved document
      onComplete(prompt.title);
      analysis.updateContent(accumulatedText, prompt.title);
      
    } catch (error) {
      console.error('Error generating document:', error);
      analysis.updateContent('Error: Failed to connect to OpenAI API. Please check your internet connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isEnhancing,
    isAnalyzing,
    isGenerating,
    analysisRef,
    enhance,
    analyze,
    generate
  };
}