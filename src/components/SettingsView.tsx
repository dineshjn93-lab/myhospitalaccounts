import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Building,
  Save,
  UserCheck,
  UserPlus,
  CheckCircle2,
  FileSpreadsheet,
  Zap,
  Clock,
  DownloadCloud,
  ExternalLink,
  RefreshCw,
  Check,
  Database,
  Github,
  Globe,
  Layers,
  Key,
} from 'lucide-react';
import { HospitalSettings } from '../types/hospital';
import { AuthService } from '../services/authService';
import {
  AutoSyncConfig,
  getAutoSyncConfig,
  getStoredSpreadsheetInfo,
  getStoredAccessToken,
  OAUTH_CLIENT_ID,
} from '../services/googleSheetsService';
import { SUPABASE_URL } from '../supabaseClient';

interface SettingsViewProps {
  settings: HospitalSettings;
  onUpdateSettings: (newSettings: HospitalSettings) => void;
  autoSyncConfig?: AutoSyncConfig;
  onUpdateAutoSyncConfig?: (cfg: Partial<AutoSyncConfig>) => void;
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'error' | 'disabled';
  lastSyncTime?: string | null;
  onOpenGoogleSheetsModal?: () => void;
  onOpenCloudIntegrationModal?: (tab?: 'supabase' | 'github' | 'netlify' | 'google') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  autoSyncConfig = getAutoSyncConfig(),
  onUpdateAutoSyncConfig,
  syncStatus = 'idle',
  lastSyncTime = null,
  onOpenGoogleSheetsModal,
  onOpenCloudIntegrationModal,
}) => {
  const [savedAlert, setSavedAlert] = useState(false);
  const currentUser = AuthService.getCurrentUser();
  const spreadsheetInfo = getStoredSpreadsheetInfo();
  const hasGoogleToken = !!getStoredAccessToken();

  const handleChange = (key: keyof HospitalSettings, value: any) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const handleManualSave = () => {
    onUpdateSettings(settings);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 3000);
  };

  const formatLastSync = (iso: string | null) => {
    if (!iso) return 'Never synced';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (' + d.toLocaleDateString() + ')';
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-blue-600" />
            <span>15. Hospital Master Settings & Protection Rules</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure hospital profile, opening balances, signatory designations, and formula protection settings
          </p>
        </div>

        <button
          onClick={handleManualSave}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Settings</span>
        </button>
      </div>

      {savedAlert && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-emerald-800 text-xs animate-fadeIn font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Hospital Master Settings saved & updated across all registers, vouchers, and reports successfully!</span>
        </div>
      )}

      {/* Active User Officer Information Banner */}
      {currentUser && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-xl object-cover ring-2 ring-blue-500/40"
              />
            ) : (
              <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm text-sm">
                <UserCheck className="w-6 h-6" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-100">{currentUser.fullName}</span>
                <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50 rounded-full">
                  {currentUser.role}
                </span>
                {currentUser.authProvider === 'google' && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-700/50 rounded-full flex items-center gap-1">
                    Google OAuth
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Official Email: <strong className="text-slate-300">{currentUser.email}</strong> • Username: <strong className="text-slate-300 font-mono">{currentUser.username}</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Google Sheets & Cloud Auto-Sync Configuration Card */}
      <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/40 to-white p-5 rounded-2xl border border-emerald-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-200/70 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Google Sheets Live & Auto-Sync Engine</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    autoSyncConfig.enabled && spreadsheetInfo.spreadsheetId
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {autoSyncConfig.enabled && spreadsheetInfo.spreadsheetId ? 'AUTO-SYNC ACTIVE' : 'PAUSED / INACTIVE'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-600">
                Keep your 15 hospital accounts sheets in Google Drive continuously synchronized with zero manual work.
              </p>
            </div>
          </div>

          {onUpdateAutoSyncConfig && (
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={autoSyncConfig.enabled}
                onChange={(e) => onUpdateAutoSyncConfig({ enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Sync Trigger Option */}
          <div className="bg-white p-3 rounded-xl border border-emerald-200/80 space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-700" />
              <span>Sync Frequency</span>
            </label>
            <select
              value={autoSyncConfig.interval}
              disabled={!autoSyncConfig.enabled || !onUpdateAutoSyncConfig}
              onChange={(e) => onUpdateAutoSyncConfig && onUpdateAutoSyncConfig({ interval: e.target.value as any })}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
            >
              <option value="realtime">Real-time (Auto-sync on edits)</option>
              <option value="1m">Every 1 Minute</option>
              <option value="5m">Every 5 Minutes</option>
              <option value="15m">Every 15 Minutes</option>
              <option value="30m">Every 30 Minutes</option>
            </select>
          </div>

          {/* Startup Auto-Pull Option */}
          <div className="bg-white p-3 rounded-xl border border-emerald-200/80 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                <DownloadCloud className="w-3.5 h-3.5 text-blue-600" />
                <span>Auto-Fetch on Startup</span>
              </label>
              <input
                type="checkbox"
                checked={autoSyncConfig.autoPullOnLoad}
                disabled={!autoSyncConfig.enabled || !onUpdateAutoSyncConfig}
                onChange={(e) => onUpdateAutoSyncConfig && onUpdateAutoSyncConfig({ autoPullOnLoad: e.target.checked })}
                className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer disabled:opacity-50"
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Pulls revisions made by other staff upon opening app.
            </p>
          </div>

          {/* Status & Quick Modal Launcher */}
          <div className="bg-white p-3 rounded-xl border border-emerald-200/80 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-700">Linked Spreadsheet</div>
              <div className="text-[10px] text-slate-500 truncate font-mono mt-0.5">
                {spreadsheetInfo.spreadsheetId || 'No Google Sheet linked'}
              </div>
            </div>
            {onOpenGoogleSheetsModal && (
              <button
                type="button"
                onClick={onOpenGoogleSheetsModal}
                className="mt-2 w-full py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] rounded-lg transition-colors text-center cursor-pointer"
              >
                Manage Sync & Sheets
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cloud Infrastructure & Connectivity Hub (Supabase, GitHub, Netlify, Google OAuth) */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-md space-y-4 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">
                  Cloud Infrastructure & Connected Services
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50">
                  Connected
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Unified configuration for Google OAuth, Supabase PostgreSQL, GitHub CI/CD, and Netlify Hosting.
              </p>
            </div>
          </div>

          {onOpenCloudIntegrationModal && (
            <button
              type="button"
              onClick={() => onOpenCloudIntegrationModal('supabase')}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
            >
              <span>Open Integration Hub</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* Google OAuth Card */}
          <div
            onClick={() => onOpenCloudIntegrationModal && onOpenCloudIntegrationModal('google')}
            className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/80 transition-all cursor-pointer space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-blue-300 text-xs">
                <Key className="w-3.5 h-3.5" />
                <span>Google OAuth</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-[10px] text-slate-400 truncate font-mono">
              {OAUTH_CLIENT_ID.substring(0, 24)}...
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold group-hover:underline">
              Sheets & Auth &rarr;
            </div>
          </div>

          {/* Supabase Card */}
          <div
            onClick={() => onOpenCloudIntegrationModal && onOpenCloudIntegrationModal('supabase')}
            className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/80 transition-all cursor-pointer space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-emerald-300 text-xs">
                <Database className="w-3.5 h-3.5" />
                <span>Supabase DB</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </div>
            <div className="text-[10px] text-slate-400 truncate font-mono">
              {SUPABASE_URL}
            </div>
            <div className="text-[10px] text-emerald-400 font-semibold group-hover:underline">
              SQL Schema & Seed &rarr;
            </div>
          </div>

          {/* GitHub Card */}
          <div
            onClick={() => onOpenCloudIntegrationModal && onOpenCloudIntegrationModal('github')}
            className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/80 transition-all cursor-pointer space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-slate-200 text-xs">
                <Github className="w-3.5 h-3.5" />
                <span>GitHub Repo</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">main</span>
            </div>
            <div className="text-[10px] text-slate-400">
              Vite + React + TS Ready
            </div>
            <div className="text-[10px] text-blue-400 font-semibold group-hover:underline">
              View Git Commands &rarr;
            </div>
          </div>

          {/* Netlify Card */}
          <div
            onClick={() => onOpenCloudIntegrationModal && onOpenCloudIntegrationModal('netlify')}
            className="p-3 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/80 transition-all cursor-pointer space-y-1.5 group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-teal-300 text-xs">
                <Globe className="w-3.5 h-3.5" />
                <span>Netlify Deploy</span>
              </div>
              <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-teal-950 text-teal-300 border border-teal-800">
                netlify.toml
              </span>
            </div>
            <div className="text-[10px] text-slate-400">
              SPA Redirects & Env Vars
            </div>
            <div className="text-[10px] text-teal-400 font-semibold group-hover:underline">
              Deploy Settings &rarr;
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
        {/* Hospital Identity */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-600" />
            <span>Government Hospital Identity & Location</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Hospital Full Name</label>
              <input
                type="text"
                value={settings.hospitalName}
                onChange={(e) => handleChange('hospitalName', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Department / Ministry</label>
              <input
                type="text"
                value={settings.departmentName}
                onChange={(e) => handleChange('departmentName', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">District</label>
              <input
                type="text"
                value={settings.district}
                onChange={(e) => handleChange('district', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">State</label>
              <input
                type="text"
                value={settings.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Registration / DDO Code</label>
              <input
                type="text"
                value={settings.registrationNo}
                onChange={(e) => handleChange('registrationNo', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Financial Year</label>
              <input
                type="text"
                value={settings.financialYear}
                onChange={(e) => handleChange('financialYear', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Opening Balances */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
            Opening Balances (As of 1st April {settings.financialYear.split('-')[0] || '2026'})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Cash in Hand (Opening)</label>
              <input
                type="number"
                value={settings.openingCashBalance}
                onChange={(e) => handleChange('openingCashBalance', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Petty Cash Imprest (Opening)</label>
              <input
                type="number"
                value={settings.openingPettyCashBalance}
                onChange={(e) => handleChange('openingPettyCashBalance', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Bank Balance (Opening)</label>
              <input
                type="number"
                value={settings.bankOpeningBalance}
                onChange={(e) => handleChange('bankOpeningBalance', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-blue-700"
              />
            </div>
          </div>
        </div>

        {/* Signatories */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
            Official Voucher & Report Signatories
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Senior Accountant / Cashier</label>
              <input
                type="text"
                value={settings.seniorAccountant}
                onChange={(e) => handleChange('seniorAccountant', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Internal Auditor</label>
              <input
                type="text"
                value={settings.internalAuditor}
                onChange={(e) => handleChange('internalAuditor', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Medical Superintendent</label>
              <input
                type="text"
                value={settings.medicalSuperintendent}
                onChange={(e) => handleChange('medicalSuperintendent', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Protection & Google Sheets Instructions */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sheet Protection & Google Sheets Export Instructions</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            • <strong>Formula Locking:</strong> In the exported <code>.xlsx</code> file, all formula cells (such as running balance, totals, GST calculations, and XLOOKUP queries) are set as protected/read-only. Data entry cells (particulars, amounts, dates, supplier names) remain editable.
          </p>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            • <strong>Uploading to Google Sheets:</strong> You can either use the built-in <strong>Google Sheets Live & Auto-Sync Engine</strong> (which pushes real-time edits directly to Google Sheets via OAuth), or manually download the <code>.xlsx</code> file using the "Export (.xlsx)" button and upload it to Google Drive.
          </p>
        </div>
      </div>
    </div>
  );
};
