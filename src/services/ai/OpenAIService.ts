import OpenAI from 'openai';

export class OpenAIService {
  private openai: OpenAI;
  private embeddingModel = 'text-embedding-3-small';
  private chatModel = 'gpt-4o-2024-08-06';
  private maxRetries = 5;
  private initialRetryDelay = 1000; // 1 second
  private maxRetryDelay = 10000; // 10 seconds

  constructor() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  async createEmbedding(text: string): Promise<number[]> {
    let retries = 0;
    while (retries < this.maxRetries) {
      const delay = Math.min(
        this.initialRetryDelay * Math.pow(2, retries),
        this.maxRetryDelay
      );

      try {
        const response = await this.openai.embeddings.create({
          model: this.embeddingModel,
          input: text,
          encoding_format: 'float'
        });
        return response.data[0].embedding;
      } catch (error) {
        console.warn(`Embedding attempt ${retries + 1} failed:`, error);
        retries++;
        
        if (retries === this.maxRetries) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('OpenAI API error after max retries:', errorMessage);
          throw new Error(
            'Failed to process request after multiple attempts. ' +
            'Please check your internet connection and try again.'
          );
        }
        
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Maximum retries exceeded');
  }

  async* createChatCompletion(
    systemPrompt: string,
    userPrompt: string,
    temperature: number = 0.7,
    retryCount = 0
  ): AsyncGenerator<string> {
    const delay = Math.min(
      this.initialRetryDelay * Math.pow(2, retryCount),
      this.maxRetryDelay
    );

    try {
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      if (retryCount > 0) {
        console.log(`Attempt ${retryCount + 1} of ${this.maxRetries}...`);
      }

      const stream = await this.openai.chat.completions.create({
        model: this.chatModel,
        temperature,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        stream: true,
        max_tokens: 2000
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        yield content;
      }
    } catch (error) {
      console.error('OpenAI API error:', error);
      
      // Handle specific error types
      const isRetryableError = error instanceof Error && (
        error.message.includes('network') ||
        error.message.includes('timeout') ||
        error.message.includes('rate limit') ||
        error.message.includes('internal_error')
      );

      if (isRetryableError && retryCount < this.maxRetries) {
        console.warn(
          `Retryable error occurred (attempt ${retryCount + 1}):`, 
          error instanceof Error ? error.message : 'Unknown error'
        );
        console.log(`Retrying in ${delay}ms...`);

        await new Promise(resolve => setTimeout(resolve, delay));
        yield* this.createChatCompletion(
          systemPrompt,
          userPrompt,
          temperature,
          retryCount + 1
        );
        return;
      }

      // If we've exhausted retries or hit a non-retryable error
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Final error after retries or non-retryable error:', errorMessage);

      throw new Error(
        retryCount >= this.maxRetries
          ? 'Failed to generate content after multiple attempts. Please try again later.'
          : `An error occurred: ${errorMessage}. Please try again.`
      );
    }
  }

  private isNetworkError(error: unknown): boolean {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('network') ||
        message.includes('timeout') ||
        message.includes('connection') ||
        message.includes('offline')
      );
    }
    return false;
  }

  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    retryCount: number = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (this.isNetworkError(error) && retryCount < this.maxRetries) {
        const delay = Math.min(
          this.initialRetryDelay * Math.pow(2, retryCount),
          this.maxRetryDelay
        );
        
        console.warn(
          `Network error occurred (attempt ${retryCount + 1}):`,
          error instanceof Error ? error.message : 'Unknown error'
        );
        console.log(`Retrying in ${delay}ms...`);

        await new Promise(resolve => setTimeout(resolve, delay));
        return this.retryWithBackoff(operation, retryCount + 1);
      }
      
      throw error;
    }
  }
}