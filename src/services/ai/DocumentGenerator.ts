import { supabase } from '@/lib/supabase';
import { OpenAIService } from './OpenAIService';
import { EmbeddingService } from './EmbeddingService';
import { PromptService } from './PromptService';

export class DocumentGenerator {
  constructor(
    private openAIService: OpenAIService,
    private promptService: PromptService,
    private embeddingService: EmbeddingService
  ) {}

  async* enhance(input: string): AsyncGenerator<string> {
    try {
      const systemPrompt = await this.embeddingService.getContextualPrompt(
        input,
        this.promptService.getPrompt('enhance')
      );

      yield* this.openAIService.createChatCompletion(systemPrompt, input);
    } catch (error) {
      console.error('Enhancement error:', error);
      throw new Error('Failed to enhance text');
    }
  }

  async* analyze(idea: string, currentAnalysis: string = ''): AsyncGenerator<string> {
    try {
      // Add error handling for network issues
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      if (idea.includes('Regarding this part:')) {
        yield* this.handleQuotedAnalysis(idea, currentAnalysis);
      } else {
        const systemPrompt = await this.embeddingService.getContextualPrompt(
          idea,
          this.promptService.getPrompt('analyze')
        );
        yield* this.openAIService.createChatCompletion(systemPrompt, idea, 0.5);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to connect to AI service. Please try again.');
    }
  }

  private async* handleQuotedAnalysis(idea: string, currentAnalysis: string): AsyncGenerator<string> {
    const quoteMatch = idea.match(/Regarding this part: "([^"]+)"/);
    if (!quoteMatch) return;

    const quotedText = quoteMatch[1];
    const afterQuoteMatch = idea.match(/Regarding this part: "[^"]+"\s*\n\n(.*)/s);
    const userPrompt = afterQuoteMatch ? afterQuoteMatch[1] : '';

    const quoteIndex = currentAnalysis.indexOf(quotedText);
    if (quoteIndex === -1) return;

    const beforeQuote = currentAnalysis.substring(0, quoteIndex);
    const afterQuote = currentAnalysis.substring(quoteIndex + quotedText.length);

    const systemPrompt = await this.embeddingService.getContextualPrompt(
      quotedText,
      this.promptService.getPrompt('analyze')
    );

    let revisedText = '';
    for await (const chunk of this.openAIService.createChatCompletion(
      systemPrompt,
      `Original text: "${quotedText}"\n\nContext: This is part of a larger document. Please revise this specific section based on the following request:\n\n${userPrompt}`,
      0.5
    )) {
      revisedText += chunk;
    }

    const cleanedText = revisedText.replace(/^Revised text:\s*/i, '');
    yield beforeQuote + cleanedText + afterQuote;
  }

  async* generate(idea: string, documentType: string): AsyncGenerator<string> {
    try {
      // Add error handling for network issues
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      // Get the latest Analysis content if this is not the initial analysis
      let latestContent = idea;
      if (documentType !== 'Analysis') {
        try {
          const { data: analysisDoc } = await supabase
            .from('documents')
            .select('content')
            .eq('document_type', 'Analysis')
            .eq('idea_id', typeof idea === 'string' ? null : idea.id)
            .single();
          
          if (analysisDoc) {
            latestContent = analysisDoc.content;
          }
        } catch (error) {
          console.warn('Error fetching latest analysis:', error);
        }
      }

      const ideaData = typeof idea === 'string' ? { description: latestContent } : idea;
      const ideaContent = ideaData.description || ideaData.content || '';
      const ideaId = 'id' in ideaData ? ideaData.id : undefined;
      
      const context = await this.getExistingDocuments(ideaId);
      const basePrompt = this.promptService.getDocumentPrompt(documentType);
      
      if (!basePrompt) {
        console.error('Invalid document type:', documentType);
        yield 'Error: Invalid document type. Please try again.';
        return;
      }

      const systemPrompt = await this.embeddingService.getContextualPrompt(
        ideaContent,
        `${basePrompt}\n\nExisting Documentation:\n${context}\n\nOriginal Idea:\n${ideaContent}`,
        documentType
      );

      yield* this.openAIService.createChatCompletion(
        systemPrompt,
        `Generate detailed ${documentType} documentation that is consistent with all existing documentation and the original idea. Ensure all technical decisions and terminology align with previously generated documents.`,
        0.7
      );
    } catch (error) {
      console.error('Document generation error:', error);
      throw new Error('Failed to generate document');
    }
  }

  private async getExistingDocuments(ideaId?: string): Promise<string> {
    if (!ideaId) return '';

    try {
      const { data: existingDocs, error } = await supabase
        .from('documents')
        .select('*')
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return existingDocs
        ? existingDocs
            .map(doc => `${doc.document_type}:\n${doc.content}\n---\n`)
            .join('\n')
        : '';
    } catch (error) {
      console.warn('Error fetching existing documents:', error);
      return '';
    }
  }
}