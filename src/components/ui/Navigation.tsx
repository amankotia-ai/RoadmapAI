import React from 'react';
import { Coins, Menu, X } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/hooks';

export function Navigation() {
  const location = useLocation();
  const { tokens } = useApp();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { user, isLoading: authLoading } = useAuth();
  
  if (authLoading) {
    return (
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="animate-pulse bg-gray-200 h-8 w-32 rounded my-auto" />
            <div className="flex items-center space-x-4 mx-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse bg-gray-200 h-6 w-16 rounded" />
              ))}
            </div>
            <div className="flex items-center gap-4">
              <div className="animate-pulse bg-gray-200 h-6 w-16 rounded" />
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/">
              <img src="https://i.ibb.co/RcbVmL1/Group-34954.png" alt="Logo" className="h-8" />
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {isMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4 mx-8">
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-lg ${
                location.pathname === '/'
                  ? 'bg-[#E9E9E9] text-gray-900'
                  : 'text-gray-900 hover:text-gray-700'
              } text-sm`}
            >
              Research
            </Link>
            <Link
              to="/history"
              className={`px-3 py-1.5 rounded-lg ${
                location.pathname === '/history'
                  ? 'bg-[#E9E9E9] text-gray-900'
                  : 'text-gray-900 hover:text-gray-700'
              } text-sm`}
            >
              History
            </Link>
            <Link to="/pricing" className={`px-3 py-1.5 rounded-lg ${
              location.pathname === '/pricing'
                ? 'bg-[#E9E9E9] text-gray-900'
                : 'text-gray-900 hover:text-gray-700'
            } text-sm`}>
              Pricing
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-1 px-2 py-1 bg-[#E9E9E9] rounded-full text-gray-600">
              <Coins className="w-3 h-3" />
              <span className="text-xs font-medium">{tokens.balance}</span>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className={`block px-3 py-2 rounded-lg ${
                  location.pathname === '/'
                    ? 'bg-[#E9E9E9] text-gray-900'
                    : 'text-gray-900 hover:text-gray-700'
                } text-sm`}
              >
                Research
              </Link>
              <Link
                to="/history"
                className={`block px-3 py-2 rounded-lg ${
                  location.pathname === '/history'
                    ? 'bg-[#E9E9E9] text-gray-900'
                    : 'text-gray-900 hover:text-gray-700'
                } text-sm`}
              >
                History
              </Link>
              <Link
                to="/pricing"
                className={`block px-3 py-2 rounded-lg ${
                  location.pathname === '/pricing'
                    ? 'bg-[#E9E9E9] text-gray-900'
                    : 'text-gray-900 hover:text-gray-700'
                } text-sm`}
              >
                Pricing
              </Link>
              <div className="flex items-center gap-1 px-3 py-2 bg-[#E9E9E9] rounded-full">
                <Coins className="w-3 h-3" />
                <span className="text-xs font-medium">{tokens.balance} tokens</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}