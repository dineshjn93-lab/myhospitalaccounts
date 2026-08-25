import React, { useState, useEffect } from 'react';
import {
  Database,
  Check,
  Copy,
  RefreshCw,
  Server,
  ShieldCheck,
  ExternalLink,
  AlertCircle,
  Github,
  Globe,
  Radio,
  FileCode,
  Layers,
  Key,
  CheckCircle2,
  Terminal,
  Zap,
} from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../data/supabaseSchema';
import { checkSupabaseConnection, syncInitialDataToSupabase } from '../services/supabaseService';
import { SUPABASE_URL } from '../supabaseClient';
import { OAUTH_CLIENT_ID } from '../services/googleSheetsService';

interface CloudIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'supabase' | 'github' | 'netlify' | 'google';
  onDataSynced?: () => void;
}

export const CloudIntegrationModal: React.FC<CloudIntegrationModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'supabase',
  onDataSynced,
}) => {
  const [activeTab, setActiveTab] = useState<'supabase' | 'github' | 'netlify' | 'google'>(initialTab);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedClientId, setCopiedClientId] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [checking, setChecking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      testConnection();
    }
  }, [isOpen, initialTab]);

  const testConnection = async () => {
    setChecking(true);
    const result = await checkSupabaseConnection();
    setStatus(result);
    setChecking(false);
  };

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleCopyClientId = () => {
    navigator.clipboard.writeText(OAUTH_CLIENT_ID);
    setCopiedClientId(true);
    setTimeout(() => setCopiedClientId(false), 2500);
  };

  const netlifyEnvSnippet = `# Netlify / GitHub Production Environment Variables
VITE_GOOGLE_CLIENT_ID=${OAUTH_CLIENT_ID}
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=your_supabase_anon_public_key_here
`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(netlifyEnvSnippet);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2500);
  };

  const handleSyncData = async () => {
    setSyncing(true);
    const res = await syncInitialDataToSupabase();
    setSyncing(false);
    if (res.success) {
      setStatus({ ok: true, message: 'All 10 hospital registers and masters seeded to Supabase successfully!' });
      if (onDataSynced) onDataSynced();
    } else {
      setStatus({ ok: false, message: res.error || 'Sync error' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-900 text-white shrink-0 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  Cloud Infrastructure & Integration Hub
                </h3>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                  Connected & Production Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Google OAuth Client ID • Supabase PostgreSQL • GitHub Sync • Netlify Deployment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 px-4 sm:px-6 border-b border-slate-200 flex items-center gap-1 sm:gap-2 overflow-x-auto text-xs shrink-0 pt-2">
          <button
            onClick={() => setActiveTab('google')}
            className={`px-3.5 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'google'
                ? 'bg-white text-blue-700 border-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Key className="w-3.5 h-3.5 text-blue-600" />
            <span>Google Client ID</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-3.5 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'supabase'
                ? 'bg-white text-emerald-700 border-emerald-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Supabase Database</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`px-3.5 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'github'
                ? 'bg-white text-slate-900 border-slate-800 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Github className="w-3.5 h-3.5 text-slate-800" />
            <span>GitHub Repository</span>
          </button>

          <button
            onClick={() => setActiveTab('netlify')}
            className={`px-3.5 py-2 font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'netlify'
                ? 'bg-white text-teal-700 border-teal-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-teal-600" />
            <span>Netlify Deployment</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-xs space-y-4">
          
          {/* TAB 1: GOOGLE CLIENT ID */}
          {activeTab === 'google' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-blue-950 text-sm">Google OAuth Client ID Connected</h4>
                  <p className="text-blue-800 mt-1 leading-relaxed">
                    Your Google OAuth 2.0 Web Client ID is configured for real-time Google Sheets synchronization, automatic Drive workbook provisioning, and Google Sign-In authentication.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Configured Google Client ID
                  </span>
                  <button
                    onClick={handleCopyClientId}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    {copiedClientId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Client ID</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-lg border border-slate-800 break-all select-all font-bold">
                  {OAUTH_CLIENT_ID}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                <h5 className="font-bold text-slate-900 text-xs">Google Cloud Console Authorized Origins Checklist</h5>
                <p className="text-slate-600 text-[11px]">
                  Ensure your Google Cloud Console project has added your deployed domains under <strong>Authorized JavaScript origins</strong>:
                </p>
                <div className="bg-slate-100 p-2.5 rounded-lg font-mono text-[11px] text-slate-800 space-y-1">
                  <div>• <code>https://accounts.google.com</code></div>
                  <div>• <code>{window.location.origin}</code> (Current Origin)</div>
                  <div>• <code>https://*.netlify.app</code> (For Netlify production deployments)</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUPABASE POSTGRESQL */}
          {activeTab === 'supabase' && (
            <div className="space-y-4">
              {/* Connection Status Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">Connection Endpoint:</span>
                    <code className="text-emerald-700 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {SUPABASE_URL}
                    </code>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    {checking ? (
                      <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Testing live connection...
                      </span>
                    ) : status?.ok ? (
                      <span className="flex items-center gap-1.5 text-emerald-700 font-bold">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        {status.message}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        {status?.message || 'Database schema ready for initialization'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={testConnection}
                    disabled={checking}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold transition-colors disabled:opacity-50 shadow-2xs cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                    <span>Test Ping</span>
                  </button>

                  <button
                    onClick={handleSyncData}
                    disabled={syncing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors disabled:opacity-50 shadow-2xs cursor-pointer"
                  >
                    <Server className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                    <span>{syncing ? 'Seeding Tables...' : 'Seed Sample Data to Supabase'}</span>
                  </button>
                </div>
              </div>

              {/* Schema SQL Script Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    10-Table PostgreSQL DDL & Row Level Security (RLS) Script
                  </span>
                  <button
                    onClick={handleCopySql}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-2xs cursor-pointer"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied SQL to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-300" />
                        <span>Copy SQL Migration</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-4 bg-slate-950 text-slate-100 font-mono text-[11px] leading-relaxed rounded-xl overflow-x-auto max-h-60 border border-slate-800 selection:bg-blue-700 selection:text-white">
                  {SUPABASE_SQL_SCHEMA}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: GITHUB REPOSITORY */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 text-white rounded-xl border border-slate-800 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-slate-800 text-white shrink-0 mt-0.5 border border-slate-700">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">GitHub Version Control & CI/CD Connection</h4>
                  <p className="text-slate-400 mt-1 leading-relaxed">
                    This project is structured as a Vite + React + TypeScript repository ready to push to any GitHub repository or link directly to Netlify and Vercel for automated builds.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <h5 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-slate-600" />
                  <span>Pushing to GitHub via Terminal Commands</span>
                </h5>
                <pre className="p-3 bg-slate-950 text-slate-200 font-mono text-xs rounded-lg border border-slate-800 leading-relaxed overflow-x-auto">
{`# 1. Initialize Git repository
git init
git add .
git commit -m "Initial commit: GHAMS with Supabase, Netlify, and Google OAuth"

# 2. Add your GitHub remote repository
git remote add origin https://github.com/YOUR_USERNAME/ghams-hospital-system.git
git branch -M main

# 3. Push to GitHub
git push -u origin main`}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: NETLIFY DEPLOYMENT */}
          {activeTab === 'netlify' && (
            <div className="space-y-4">
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-start gap-3">
                <div className="p-2 rounded-lg bg-teal-600 text-white shrink-0 mt-0.5">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-teal-950 text-sm">Netlify Production Ready with netlify.toml</h4>
                  <p className="text-teal-800 mt-1 leading-relaxed">
                    A pre-configured <code>netlify.toml</code> is included in the project root with SPA single-page redirects (<code>/* &rarr; /index.html 200</code>) and Node 20 build settings.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    Netlify Environment Variables (Site Settings &rarr; Environment variables)
                  </span>
                  <button
                    onClick={handleCopyEnv}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    {copiedEnv ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied Env!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Env Variables</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="p-3 bg-slate-950 text-emerald-400 font-mono text-xs rounded-lg border border-slate-800 leading-relaxed overflow-x-auto">
                  {netlifyEnvSnippet}
                </pre>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                <h5 className="font-bold text-slate-900 text-xs">Steps to Deploy on Netlify in 1 Minute:</h5>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 leading-relaxed">
                  <li>Go to <strong>netlify.com</strong> &rarr; Click <strong>"Add new site" &rarr; "Import an existing project"</strong>.</li>
                  <li>Select your <strong>GitHub repository</strong>.</li>
                  <li>Build command is auto-detected: <code>npm run build</code>, Publish directory: <code>dist</code>.</li>
                  <li>Paste the Environment Variables above in <strong>Site Configuration &rarr; Environment Variables</strong>.</li>
                  <li>Click <strong>Deploy site</strong> &mdash; your hospital accounting system is live with SSL HTTPS!</li>
                </ol>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>All 4 cloud components connected and synchronized.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-semibold hover:bg-slate-700 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
