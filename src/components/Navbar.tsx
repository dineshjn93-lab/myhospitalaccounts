import React from 'react';
import {
  Building2,
  FileSpreadsheet,
  Download,
  RotateCcw,
  BookOpen,
  Printer,
  Calendar,
  RefreshCw,
  CheckCircle2,
  Zap,
  Layers,
} from 'lucide-react';
import { HospitalSettings, AppUser } from '../types/hospital';
import { UserMenu } from './UserMenu';

interface NavbarProps {
  settings: HospitalSettings;
  currentUser: AppUser | null;
  autoSyncEnabled?: boolean;
  syncStatus?: 'idle' | 'syncing' | 'synced' | 'error' | 'disabled';
  lastSyncTime?: string | null;
  hasLinkedSheet?: boolean;
  onExportExcel: () => void;
  onOpenFormulasGuide: () => void;
  onOpenGoogleSheetsModal: () => void;
  onOpenCloudIntegrationModal?: (tab?: 'supabase' | 'github' | 'netlify' | 'google') => void;
  onResetData: () => void;
  onLoadSampleData: () => void;
  onPrint: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onLogout: () => void;
  onSwitchUser: (user: AppUser) => void;
  onOpenSettingsTab: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  currentUser,
  autoSyncEnabled = true,
  syncStatus = 'idle',
  lastSyncTime = null,
  hasLinkedSheet = false,
  onExportExcel,
  onOpenFormulasGuide,
  onOpenGoogleSheetsModal,
  onOpenCloudIntegrationModal,
  onResetData,
  onLoadSampleData,
  onPrint,
  onOpenAuth,
  onLogout,
  onSwitchUser,
  onOpenSettingsTab,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-emerald-400/30 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-100 line-clamp-1">
                {settings.hospitalName}
              </h1>
              {hasLinkedSheet && autoSyncEnabled ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/50 rounded-full shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Auto-Sync ON</span>
                </span>
              ) : hasLinkedSheet ? (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-amber-950 text-amber-300 border border-amber-700/50 rounded-full shrink-0">
                  <span>Manual Sync</span>
                </span>
              ) : null}
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="truncate max-w-[220px]">{settings.departmentName}</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                FY: <strong className="text-slate-300 font-medium">{settings.financialYear}</strong>
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls & User Account Menu */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenGoogleSheetsModal}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-xs transition-all cursor-pointer ${
              syncStatus === 'syncing'
                ? 'bg-blue-600 hover:bg-blue-500 text-white'
                : hasLinkedSheet && autoSyncEnabled
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-1 ring-emerald-400/40'
                : 'bg-emerald-700 hover:bg-emerald-600 text-white'
            }`}
            title={
              hasLinkedSheet
                ? `Google Sheets Linked • Auto-Sync: ${autoSyncEnabled ? 'Active' : 'Disabled'}${lastSyncTime ? ` • Last synced: ${new Date(lastSyncTime).toLocaleTimeString()}` : ''}`
                : 'Connect with Google Sheets in Google Drive'
            }
          >
            {syncStatus === 'syncing' ? (
              <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
            ) : (
              <FileSpreadsheet className="w-3.5 h-3.5 text-white" />
            )}
            <span className="hidden sm:inline">
              {syncStatus === 'syncing'
                ? 'Syncing...'
                : hasLinkedSheet && autoSyncEnabled
                ? 'Sheets (Auto)'
                : 'Google Sheets'}
            </span>
          </button>

          <button
            onClick={onOpenFormulasGuide}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            title="View Google Sheets / Excel Formula Architecture"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>Formulas</span>
          </button>

          <button
            onClick={onPrint}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors cursor-pointer"
            title="Print Current Active Sheet or Report"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span>Print A4</span>
          </button>

          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 shadow-sm transition-all cursor-pointer"
            title="Download complete 15-sheet Excel workbook (.xlsx) with embedded formulas"
          >
            <Download className="w-3.5 h-3.5 text-slate-300" />
            <span className="hidden sm:inline">Export (.xlsx)</span>
          </button>

          {onOpenCloudIntegrationModal && (
            <button
              onClick={() => onOpenCloudIntegrationModal('supabase')}
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
              title="Cloud Infrastructure & Integrations (Supabase, GitHub, Netlify, Google OAuth)"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Cloud Hub</span>
            </button>
          )}

          {/* User Profile / Account Switcher & Sign In / Sign Up Trigger */}
          <div className="pl-1 border-l border-slate-700">
            <UserMenu
              currentUser={currentUser}
              onOpenAuth={onOpenAuth}
              onLogout={onLogout}
              onSwitchUser={onSwitchUser}
              onOpenSettingsTab={onOpenSettingsTab}
            />
          </div>
        </div>
      </div>
    </header>
  );
};


