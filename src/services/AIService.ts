import { AIService as AIServiceInterface } from './types';
import { OpenAIService, EmbeddingService, PromptService, DocumentGenerator } from './ai';

export class AIServiceImpl implements AIServiceInterface {
  private openAIService: OpenAIService;
  private embeddingService: EmbeddingService;
  private promptService: PromptService;
  private documentGenerator: DocumentGenerator;

  constructor() {
    this.openAIService = new OpenAIService();
    this.promptService = new PromptService();
    this.embeddingService = new EmbeddingService(this.openAIService);
    this.documentGenerator = new DocumentGenerator(
      this.openAIService,
      this.promptService,
      this.embeddingService
    );
  }

  async* enhance(input: string): AsyncGenerator<string> {
    yield* this.documentGenerator.enhance(input);
  }

  async* analyze(idea: string, currentAnalysis: string = ''): AsyncGenerator<string> {
    yield* this.documentGenerator.analyze(idea, currentAnalysis);
  }

  async* generate(idea: string, documentType: string): AsyncGenerator<string> {
    yield* this.documentGenerator.generate(idea, documentType);
  }
}