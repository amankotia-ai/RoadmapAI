import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface TokenAlertProps {
  requiredTokens: number;
  onClose: () => void;
  onPurchase: () => void;
}

export function TokenAlert({ requiredTokens, onClose, onPurchase }: TokenAlertProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -20 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertCircle className="w-6 h-6 text-amber-500" />
          <h3 className="text-lg font-semibold text-gray-900">Insufficient Tokens</h3>
        </div>
        <p className="text-gray-600 mb-6">
          You need {requiredTokens} tokens to use this feature. Would you like to purchase more tokens?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onPurchase}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Purchase Tokens
          </button>
        </div>
      </motion.div>
    </div>
  );
}