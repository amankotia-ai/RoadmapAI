import { AnalysisService } from './types';

export class AnalysisServiceImpl implements AnalysisService {
  private _content: string;
  private _documentType: string;
  private _editHistory: string[];
  private _editHistoryTitles: string[];
  private _editHistoryTimestamps: number[];

  constructor() {
    this._content = '';
    this._documentType = '';
    this._editHistory = [];
    this._editHistoryTitles = [];
    this._editHistoryTimestamps = [];
  }

  updateContent(content: string, documentType?: string): void {
    this._content = content;
    if (documentType) {
      this._documentType = documentType.trim();
    }
    this.addToHistory(content, this._documentType || 'AI Analysis');
  }

  addToHistory(content: string, title: string = 'AI Analysis'): void {
    this._editHistory.push(content);
    this._editHistoryTitles.push(title);
    this._editHistoryTimestamps.push(Date.now());
  }

  getLatestContent(): string {
    return this._content;
  }

  getHistory(): string[] {
    return [...this._editHistory];
  }

  get content(): string {
    return this._content;
  }
  
  get documentType(): string {
    return this._documentType;
  }

  get editHistory(): string[] {
    return [...this._editHistory];
  }
  
  get editHistoryTitles(): string[] {
    return [...this._editHistoryTitles];
  }
  
  get editHistoryTimestamps(): number[] {
    return [...this._editHistoryTimestamps];
  }
}