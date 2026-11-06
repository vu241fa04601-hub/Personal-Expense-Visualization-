import React, { useState } from 'react';
import { Database, RefreshCw, CheckCircle2, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { DatabaseStatus } from '../server/db.js';

interface MongoStatusCardProps {
  status: DatabaseStatus | null;
  loading: boolean;
  onRefresh: () => void;
}

export const MongoStatusCard: React.FC<MongoStatusCardProps> = ({
  status,
  loading,
  onRefresh,
}) => {
  const [showConfig, setShowConfig] = useState(false);

  const isConnected = status?.connected === true;
  const isConfigured = status?.uriConfigured === true;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`p-2 rounded-lg shrink-0 ${
              isConnected
                ? 'bg-emerald-50 text-emerald-600'
                : isConfigured
                ? 'bg-amber-50 text-amber-600'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Database className="w-5 h-5" aria-hidden="true" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-sm font-semibold text-slate-900">
                MongoDB Connection
              </h3>
              {isConnected ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                  Connected
                </span>
              ) : isConfigured ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                  Connection Pending
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                  <Info className="w-3.5 h-3.5" aria-hidden="true" />
                  Memory Fallback Active
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-0.5">
              {isConnected
                ? `Active MongoDB database "${status?.databaseName || 'expense_board'}" (${status?.count ?? 0} documents in expenses collection)`
                : isConfigured
                ? status?.error || 'Attempting to establish connection with remote MongoDB instance...'
                : 'Ready for MongoDB Atlas or remote cluster. Currently using live in-memory storage.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh database status"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setShowConfig((prev) => !prev)}
            aria-expanded={showConfig}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
          >
            <span>Connection Guide</span>
            {showConfig ? (
              <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {showConfig && (
        <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 space-y-3">
          <div>
            <p className="font-semibold text-slate-800 mb-1">
              Connecting your MongoDB database:
            </p>
            <p>
              To persist data in your MongoDB Atlas cluster or self-hosted MongoDB instance, configure the following environment variable in <code className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-800 font-mono">.env</code>:
            </p>
          </div>

          <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] overflow-x-auto space-y-1">
            <p className="text-slate-400"># In .env</p>
            <p>MONGODB_URI="mongodb+srv://&lt;username&gt;:&lt;password&gt;@&lt;cluster&gt;.mongodb.net/?retryWrites=true&w=majority"</p>
            <p>MONGODB_DB_NAME="expense_board"</p>
          </div>

          <div className="space-y-1 text-slate-500">
            <p>· <strong>Target collection:</strong> <code className="font-mono text-slate-700">expenses</code></p>
            <p>· <strong>Auto-indexing:</strong> <code className="font-mono text-slate-700">&#123; id: 1 &#125;</code> and <code className="font-mono text-slate-700">&#123; date: -1 &#125;</code> are automatically provisioned upon connect.</p>
            <p>· <strong>Fallback behavior:</strong> If MongoDB is temporarily unreachable, the app operates without crashing using server-backed in-memory persistence.</p>
          </div>
        </div>
      )}
    </div>
  );
};
