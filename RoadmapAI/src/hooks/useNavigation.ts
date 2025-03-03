import { useState, useCallback } from 'react';
import { NavigationService, NavigationServiceImpl } from '@/services/NavigationService';
import { NavItem } from '@/services/types';

export function useNavigation() {
  const [navigationService] = useState<NavigationService>(() => new NavigationServiceImpl());
  const [activeNav, setActiveNav] = useState<NavItem>(navigationService.activeNav);

  const updateNav = useCallback((nav: NavItem) => {
    navigationService.setActiveNav(nav);
    setActiveNav(nav);
  }, [navigationService]);

  return {
    activeNav,
    setActiveNav: updateNav
  };
}