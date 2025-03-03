import { NavItem } from './types';

export interface NavigationService {
  activeNav: NavItem;
  setActiveNav: (nav: NavItem) => void;
  isValidNav: (nav: string) => boolean;
}

export class NavigationServiceImpl implements NavigationService {
  private _activeNav: NavItem = 'chat';

  setActiveNav(nav: NavItem): void {
    if (this.isValidNav(nav)) {
      this._activeNav = nav;
    }
  }

  isValidNav(nav: string): nav is NavItem {
    return ['chat', 'search', 'files', 'history', 'settings'].includes(nav);
  }

  get activeNav(): NavItem {
    return this._activeNav;
  }
}