import React, { useState, useEffect } from 'react';
import { Database, Check, Copy, RefreshCw, Server, ShieldCheck, ExternalLink, AlertCircle } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../data/supabaseSchema';
import { checkSupabaseConnection, syncInitialDataToSupabase } from '../services/supabaseService';
import { SUPABASE_URL } from '../supabaseClient';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataSynced?: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose, onDataSynced }) => {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  const testConnection = async () => {
    setChecking(true);
    const result = await checkSupabaseConnection();
    setStatus(result);
    setChecking(false);
  };

  useEffect(() => {
    if (isOpen) {
      testConnection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSyncData = async () => {
    setSyncing(true);
    const res = await syncInitialDataToSupabase();
    setSyncing(false);
    if (res.success) {
      setStatus({ ok: true, message: 'All hospital datasets seeded to Supabase successfully!' });
      if (onDataSynced) onDataSynced();
    } else {
      setStatus({ ok: false, message: res.error || 'Sync error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>Supabase Database Connection & SQL Setup</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-normal bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                  PostgreSQL + RLS
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Live endpoint: <code className="text-emerald-300 font-mono">{SUPABASE_URL}</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Status bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Connection Status:</span>
            {checking ? (
              <span className="flex items-center gap-1.5 text-blue-600 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Testing connection...
              </span>
            ) : status?.ok ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                {status.message}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-700 font-medium bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                {status?.message || 'Ready to configure'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={testConnection}
              disabled={checking}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition-colors disabled:opacity-50 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>

            <button
              onClick={handleSyncData}
              disabled={syncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors disabled:opacity-50 shadow-2xs"
            >
              <Server className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Syncing to Supabase...' : 'Seed Sample Data to Supabase'}</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Quick Setup Instructions */}
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-2">
            <h4 className="font-bold text-blue-950 text-sm flex items-center gap-2">
              <span>Quick 2-Step Supabase Setup</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-blue-900 leading-relaxed">
              <li>
                Click <strong>"Copy SQL Code"</strong> below.
              </li>
              <li>
                Open your <strong>Supabase Dashboard &rarr; SQL Editor &rarr; New query</strong>, paste the code and click <strong>RUN</strong>.
              </li>
              <li>
                All 10 tables and Row Level Security (RLS) policies will be configured instantly with <code>auth.uid()</code> permissions.
              </li>
            </ol>
          </div>

          {/* SQL Viewer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Complete PostgreSQL DDL + RLS Schema Script
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-2xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-300" />
                    <span>Copy SQL Code</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-4 bg-slate-950 text-slate-100 font-mono text-[11px] leading-relaxed rounded-xl overflow-x-auto max-h-72 border border-slate-800 selection:bg-blue-700 selection:text-white">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Supports both authenticated users and anonymous local testing.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
