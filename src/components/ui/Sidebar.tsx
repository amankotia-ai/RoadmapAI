import React from 'react';
import { motion } from 'framer-motion';
import { Bot, Search, FolderOpen, Clock, Settings } from 'lucide-react';
import { NavItem } from '@/services/types';

interface SidebarProps {
  activeNav: NavItem;
  onNavChange: (nav: NavItem) => void;
}

export function Sidebar({ activeNav, onNavChange }: SidebarProps) {
  const navItems = [
    { id: 'chat' as NavItem, icon: Bot },
    { id: 'search' as NavItem, icon: Search },
    { id: 'files' as NavItem, icon: FolderOpen },
    { id: 'history' as NavItem, icon: Clock },
    { id: 'settings' as NavItem, icon: Settings },
  ];

  return (
    <motion.div 
      initial={{ x: 0 }}
      animate={{ x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="w-16 bg-white border-r flex flex-col items-center py-4 space-y-4"
    >
      {navItems.map(({ id, icon: Icon }) => (
        <button 
          key={id}
          onClick={() => onNavChange(id)}
          className={`p-2 rounded-lg transition-colors ${
            activeNav === id ? 'bg-gray-100' : 'hover:bg-gray-100'
          }`}
        >
          <Icon className={`w-6 h-6 ${
            activeNav === id ? 'text-indigo-600' : 'text-gray-700'
          }`} />
        </button>
      ))}
    </motion.div>
  );
}