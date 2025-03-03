import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks';

interface HeaderProps {
  isChatStarted: boolean;
  userName?: string;
}

export function Header({ isChatStarted, userName = 'John' }: HeaderProps) {
  const { signOut } = useAuth();

  if (isChatStarted) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20, height: 0 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 30,
          height: {
            duration: 0.3,
            ease: "anticipate"
          }
        }}
        className="p-6 flex-shrink-0 overflow-hidden"
      >
        <div className="absolute top-6 right-6">
          <button
            onClick={signOut}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: 0.1
          }}
          className="text-4xl font-semibold"
        >
          Hi there, <span className="text-purple-600">{userName}</span>
        </motion.h1>
        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: 0.15
          }}
          className="text-3xl mt-2"
        >
          What <span className="text-purple-600">would</span> <span className="text-indigo-600">like to know</span>?
        </motion.h2>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 30,
            delay: 0.2
          }}
          className="text-gray-600 mt-2"
        >
          Use one of the most common prompts below or use your own to begin
        </motion.p>
      </motion.div>
    </AnimatePresence>
  );
}