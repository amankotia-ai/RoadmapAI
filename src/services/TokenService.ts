import { TokenService } from './types';

export class TokenServiceImpl implements TokenService {
  private _tokens: number;

  constructor(initialTokens: number = 5) {
    this._tokens = initialTokens;
  }

  purchaseTokens(amount: number): void {
    this._tokens += amount;
  }

  useTokens(amount: number): boolean {
    if (this._tokens >= amount) {
      this._tokens -= amount;
      return true;
    }
    return false;
  }

  getBalance(): number {
    return this._tokens;
  }

  get tokens(): number {
    return this._tokens;
  }
}