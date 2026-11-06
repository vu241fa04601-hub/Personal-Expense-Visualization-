import { User } from '../types/expense.js';
import { LogOut } from 'lucide-react';

interface TopBarProps {
  currentUser: User | null;
  onLogout: () => void;
  onLogExpenseClick: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentUser,
  onLogout,
  onLogExpenseClick,
}) => {
  const userInitials = currentUser?.name
    ? currentUser.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        <a
          href="#overview"
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600 rounded"
        >
          Ledgerline
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <a
            href="#overview"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Overview
          </a>
          <a
            href="#categories"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Categories
          </a>
          <a
            href="#visual-summary"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Daily Trend
          </a>
          <a
            href="#ledger"
            className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Ledger
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 bg-slate-50/50">
              <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-mono text-[10px] font-semibold flex items-center justify-center">
                {userInitials}
              </span>
              <span className="font-medium max-w-[120px] truncate">
                {currentUser.name}
              </span>
              <button
                type="button"
                onClick={onLogout}
                title="Sign out"
                data-testid="logout-btn"
                aria-label="Sign out of account"
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={onLogExpenseClick}
            className="px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Log Expense
          </button>

          {currentUser && (
            <button
              type="button"
              onClick={onLogout}
              title="Sign out"
              aria-label="Sign out of account (mobile)"
              className="sm:hidden p-2 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg cursor-pointer"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

