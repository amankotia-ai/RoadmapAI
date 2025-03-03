import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

export interface DocumentMetadata {
  title: string;
  documentType: string;
  category?: string;
  author?: string;
  version?: string;
}

export class VectorStorageService {
  private openai: OpenAI;
  private embeddingModel = 'text-embedding-3-small';

  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  private async getEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: this.embeddingModel,
      input: text,
      encoding_format: 'float'
    });
    return response.data[0].embedding;
  }

  async uploadDocument(
    content: string,
    metadata: DocumentMetadata
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Generate embedding for the document
      const embedding = await this.getEmbedding(content);

      // Upload to Supabase
      const { error } = await supabase
        .from('document_embeddings')
        .insert({
          content,
          embedding,
          metadata
        });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error uploading document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload document'
      };
    }
  }

  async uploadBatch(
    documents: Array<{ content: string; metadata: DocumentMetadata }>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Process documents in parallel with a limit of 5 concurrent requests
      const batchSize = 5;
      const results = [];
      
      for (let i = 0; i < documents.length; i += batchSize) {
        const batch = documents.slice(i, i + batchSize);
        const batchPromises = batch.map(async (doc) => {
          const embedding = await this.getEmbedding(doc.content);
          return {
            content: doc.content,
            embedding,
            metadata: doc.metadata
          };
        });

        const processedBatch = await Promise.all(batchPromises);
        
        const { error } = await supabase
          .from('document_embeddings')
          .insert(processedBatch);

        if (error) throw error;
        
        results.push(...processedBatch);
      }

      return { success: true };
    } catch (error) {
      console.error('Error uploading batch:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload batch'
      };
    }
  }

  async searchSimilar(
    query: string,
    threshold = 0.8,
    limit = 5
  ): Promise<Array<{ content: string; metadata: DocumentMetadata; similarity: number }>> {
    try {
      const embedding = await this.getEmbedding(query);
      
      const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: threshold,
        match_count: limit
      });

      if (error) throw error;

      return data.map(doc => ({
        content: doc.content,
        metadata: doc.metadata as DocumentMetadata,
        similarity: doc.similarity
      }));
    } catch (error) {
      console.error('Error searching documents:', error);
      return [];
    }
  }
}

// Example usage:
/*
const vectorStorage = new VectorStorageService();

// Upload a single document
await vectorStorage.uploadDocument(
  "Detailed guide on creating PRDs...",
  {
    title: "PRD Best Practices",
    documentType: "PRD",
    category: "Documentation",
    version: "1.0"
  }
);

// Upload multiple documents
await vectorStorage.uploadBatch([
  {
    content: "Frontend architecture best practices...",
    metadata: {
      title: "Frontend Architecture Guide",
      documentType: "Front End",
      category: "Technical"
    }
  },
  {
    content: "Backend implementation patterns...",
    metadata: {
      title: "Backend Development Guide",
      documentType: "Back End",
      category: "Technical"
    }
  }
]);

// Search for similar documents
const results = await vectorStorage.searchSimilar("frontend component architecture");
*/