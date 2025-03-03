// Common Types
export interface AnalysisState {
  content: string;
  documentType: string;
  editHistory: string[];
  editHistoryTitles: string[];
  editHistoryTimestamps: number[];
}

export type NavItem = 'chat' | 'search' | 'files' | 'history' | 'settings';

export interface PromptCard {
  title: string;
  icon: string;
  isComplete?: boolean;
  isAvailable?: boolean;
  credits?: number;
  id?: string;
  content?: string;
  requiredPrompts?: string[];
}

export interface TokenAlert {
  show: boolean;
  requiredTokens: number;
}

export interface EditedContent {
  text: string;
  selection: { start: number; end: number } | null;
}

export interface SelectionCoords {
  x: number;
  y: number;
}

export interface TokenService {
  tokens: number;
  purchaseTokens: (amount: number) => void;
  useTokens: (amount: number) => boolean;
  getBalance: () => number;
}

export interface AnalysisService {
  content: string;
  documentType: string;
  editHistory: string[];
  updateContent: (content: string, documentType?: string) => void;
  addToHistory: (content: string) => void;
  getLatestContent: () => string;
  getHistory: () => string[];
}

export interface IdeaDocument {
  id: string;
  idea_id: string;
  document_type: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Idea {
  id: string;
  title: string;
  description: string;
  user_id: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  documents?: IdeaDocument[];
}

export interface AIService {
  enhance: (text: string) => Promise<AsyncGenerator<string>>;
  analyze: (idea: string, currentAnalysis?: string) => Promise<AsyncGenerator<string>>;
  generate: (idea: string, documentType: string) => Promise<AsyncGenerator<string>>;
}

export interface SpeechService {
  isRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  toggleRecording: () => void;
  onTranscript: (callback: (text: string) => void) => void;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
  interval: 'monthly' | 'yearly';
}

export interface PaymentService {
  createOrder: (amount: number, currency: string) => Promise<{ id: string }>;
  verifyPayment: (paymentId: string, orderId: string, signature: string) => Promise<boolean>;
  createSubscription: (planId: string) => Promise<{ id: string }>;
  cancelSubscription: (subscriptionId: string) => Promise<boolean>;
}