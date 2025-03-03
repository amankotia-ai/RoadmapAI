import { useState, useCallback } from 'react';
import { TokenService, TokenServiceImpl } from '@/services';

export function useTokens(initialTokens: number = 5) {
  const [tokenService] = useState<TokenService>(() => new TokenServiceImpl(initialTokens));
  const [tokens, setTokens] = useState(tokenService.tokens);

  const purchaseTokens = useCallback((amount: number) => {
    tokenService.purchaseTokens(amount);
    setTokens(tokenService.tokens);
  }, [tokenService]);

  const useTokens = useCallback((amount: number) => {
    const success = tokenService.useTokens(amount);
    if (success) {
      setTokens(tokenService.tokens);
    }
    return success;
  }, [tokenService]);

  return {
    tokens,
    purchaseTokens,
    useTokens,
    getBalance: useCallback(() => tokenService.getBalance(), [tokenService])
  };
}