import { supabase } from '@/lib/supabase';
import { OpenAIService } from './OpenAIService';

export class EmbeddingService {
  constructor(private openAIService: OpenAIService) {}

  async getEmbedding(text: string, documentType?: string): Promise<number[]> {
    const inputText = documentType ? `${documentType}: ${text}` : text;
    return this.openAIService.createEmbedding(inputText);
  }

  async getSimilarDocuments(
    embedding: number[],
    threshold = 0.8,
    limit = 5
  ) {
    const { data: documents, error } = await supabase.rpc(
      'match_documents',
      {
        query_embedding: embedding,
        match_threshold: threshold,
        match_count: limit
      }
    );

    if (error) {
      console.error('Error fetching similar documents:', error);
      return [];
    }

    return documents;
  }

  async getContextualPrompt(
    query: string,
    systemPrompt: string,
    documentType?: string
  ): Promise<string> {
    try {
      const embedding = await this.getEmbedding(query, documentType);
      const similarDocs = await this.getSimilarDocuments(embedding);
      
      if (similarDocs.length === 0) {
        return systemPrompt;
      }

      const context = similarDocs
        .map(doc => doc.content)
        .join('\n\n');

      const sourceInfo = similarDocs
        .map(doc => `Source: ${doc.metadata?.title || 'Documentation'} (Similarity: ${(doc.similarity * 100).toFixed(1)}%)`)
        .join('\n');

      return `${systemPrompt}\n\nRelevant context from documentation:\n${context}\n\n${sourceInfo}\n\nUse this context to inform and enhance your response while maintaining the requested format and structure.`;
    } catch (error) {
      console.error('Error getting contextual prompt:', error);
      return systemPrompt;
    }
  }
}