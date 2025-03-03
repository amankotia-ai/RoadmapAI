import { PromptCard } from './types';
export interface PromptService {
  getPrompts: () => PromptCard[];
  isPromptComplete: (title: string) => boolean;
  markPromptComplete: (title: string) => void;
  getCompletedPrompts: () => string[];
}

export class PromptServiceImpl implements PromptService {
  private completedPrompts: Set<string> = new Set();
  private readonly prompts: PromptCard[] = [
    {
      title: "Analysis",
      isComplete: false,
      requiredPrompts: []
    },
    {
      title: "PRD",
      isComplete: false,
      credits: 1,
      requiredPrompts: []
    },
    {
      title: "Implementation Flow",
      isComplete: false,
      credits: 1,
      requiredPrompts: []
    },
    {
      title: "Front End",
      isComplete: false,
      credits: 1,
      requiredPrompts: []
    },
    {
      title: "Back End",
      isComplete: false,
      credits: 1,
      requiredPrompts: []
    },
    {
      title: "API Guide",
      isComplete: false,
      credits: 1,
      requiredPrompts: []
    },
    {
      title: "Prompts",
      isComplete: false,
      credits: 2,
      requiredPrompts: ["PRD", "Front End", "Back End"]
    }
  ];

  getPrompts(): PromptCard[] {
    return this.prompts.map(prompt => ({
      ...prompt,
      isComplete: this.completedPrompts.has(prompt.title),
      isAvailable: this.isPromptAvailable(prompt)
    }));
  }

  private isPromptAvailable(prompt: PromptCard): boolean {
    if (!prompt.requiredPrompts?.length) return true;
    return prompt.requiredPrompts.every(required => this.completedPrompts.has(required));
  }

  isPromptComplete(title: string): boolean {
    return this.completedPrompts.has(title);
  }

  markPromptComplete(title: string): void {
    this.completedPrompts.add(title);
  }

  getCompletedPrompts(): string[] {
    return Array.from(this.completedPrompts);
  }
}