import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  UploadCloud,
  DownloadCloud,
  LogOut,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import {
  getStoredAccessToken,
  getStoredSpreadsheetInfo,
  requestGoogleAccessToken,
  createHospitalSpreadsheet,
  pushAllDataToSpreadsheet,
  pullAllDataFromSpreadsheet,
  clearGoogleSession,
  saveSpreadsheetInfo,
} from '../services/googleSheetsService';
import {
  HospitalSettings,
  Supplier,
  Recipient,
  BankMasterItem,
  CashBookEntry,
  PettyCashEntry,
  BillEntry,
  PaymentEntry,
  GSTEntry,
  ExpenditureEntry,
} from '../types/hospital';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitalData: {
    settings: HospitalSettings;
    suppliers: Supplier[];
    recipients: Recipient[];
    banks: BankMasterItem[];
    cashBook: CashBookEntry[];
    pettyCash: PettyCashEntry[];
    bills: BillEntry[];
    payments: PaymentEntry[];
    gstEntries: GSTEntry[];
    expenditures: ExpenditureEntry[];
  };
  onDataImported: (data: any) => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  hospitalData,
  onDataImported,
}) => {
  const [token, setToken] = useState<string | null>(getStoredAccessToken());
  const [spreadsheetId, setSpreadsheetId] = useState<string>('');
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>('');
  const [customSpreadsheetIdInput, setCustomSpreadsheetIdInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setToken(getStoredAccessToken());
      const info = getStoredSpreadsheetInfo();
      if (info.spreadsheetId) setSpreadsheetId(info.spreadsheetId);
      if (info.spreadsheetUrl) setSpreadsheetUrl(info.spreadsheetUrl);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConnectGoogle = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const accessToken = await requestGoogleAccessToken();
      setToken(accessToken);
      setStatusMessage({ type: 'success', text: 'Connected to Google Account successfully!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to authenticate with Google' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = () => {
    clearGoogleSession();
    setToken(null);
    setStatusMessage({ type: 'info', text: 'Google session disconnected.' });
  };

  const handleCreateNewSpreadsheet = async () => {
    if (!token) {
      await handleConnectGoogle();
    }
    const currentToken = getStoredAccessToken() || token;
    if (!currentToken) return;

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Creating multi-tab hospital workbook in Google Drive...' });
    try {
      const res = await createHospitalSpreadsheet(currentToken, hospitalData);
      setSpreadsheetId(res.spreadsheetId);
      setSpreadsheetUrl(res.spreadsheetUrl);
      setStatusMessage({
        type: 'success',
        text: 'Hospital Accounts Workbook created in Google Sheets! Auto-sync is now active.',
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to create Google Spreadsheet.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePushData = async () => {
    const currentToken = getStoredAccessToken() || token;
    if (!currentToken) {
      setStatusMessage({ type: 'error', text: 'Please connect Google account first.' });
      return;
    }
    if (!spreadsheetId) {
      setStatusMessage({ type: 'error', text: 'No Google Spreadsheet linked yet.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Syncing all records & tables to Google Sheets...' });
    try {
      await pushAllDataToSpreadsheet(currentToken, spreadsheetId, hospitalData);
      setStatusMessage({
        type: 'success',
        text: 'All hospital accounts data pushed to Google Sheets successfully!',
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to update Google Sheets.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePullData = async () => {
    const currentToken = getStoredAccessToken() || token;
    if (!currentToken) {
      setStatusMessage({ type: 'error', text: 'Please connect Google account first.' });
      return;
    }
    if (!spreadsheetId) {
      setStatusMessage({ type: 'error', text: 'No Google Spreadsheet linked yet.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage({ type: 'info', text: 'Reading data from Google Sheets...' });
    try {
      const pulled = await pullAllDataFromSpreadsheet(currentToken, spreadsheetId);
      onDataImported(pulled);
      setStatusMessage({
        type: 'success',
        text: 'Synced latest data from Google Sheets into your app!',
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err?.message || 'Failed to read from Google Sheets.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkExistingSheet = () => {
    if (!customSpreadsheetIdInput.trim()) return;
    let extractedId = customSpreadsheetIdInput.trim();
    // Handle full Google Sheets URL pasting
    const match = extractedId.match(/\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      extractedId = match[1];
    }
    const constructedUrl = `https://docs.google.com/spreadsheets/d/${extractedId}/edit`;
    setSpreadsheetId(extractedId);
    setSpreadsheetUrl(constructedUrl);
    saveSpreadsheetInfo(extractedId, constructedUrl);
    setStatusMessage({ type: 'success', text: `Linked Google Spreadsheet ID: ${extractedId}` });
    setCustomSpreadsheetIdInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-600/30 text-emerald-300 border border-emerald-500/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>Google Sheets Live Sync</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-normal bg-emerald-900 text-emerald-200 border border-emerald-700/50">
                  Google Drive + Sheets API v4
                </span>
              </h3>
              <p className="text-xs text-emerald-300/80">
                Direct two-way synchronization without Supabase or third-party databases
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-emerald-900 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl flex items-start gap-2.5 text-xs font-medium border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-50 text-rose-900 border-rose-200'
                  : 'bg-blue-50 text-blue-900 border-blue-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : statusMessage.type === 'error' ? (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              ) : (
                <RefreshCw className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 animate-spin" />
              )}
              <div className="flex-1">{statusMessage.text}</div>
            </div>
          )}

          {/* Connection Status Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${token ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-slate-300'}`} />
              <div>
                <div className="font-semibold text-slate-800 text-sm">
                  {token ? 'Google Account Connected' : 'Not Connected to Google'}
                </div>
                <div className="text-slate-500 text-[11px]">
                  {token ? 'Authorized for Google Sheets & Drive scopes' : 'Sign in with your Google account to enable auto-sync'}
                </div>
              </div>
            </div>

            {token ? (
              <button
                onClick={handleDisconnect}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            ) : (
              <button
                onClick={handleConnectGoogle}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-xs transition-colors"
              >
                <span>Sign in with Google</span>
              </button>
            )}
          </div>

          {/* Linked Spreadsheet Info */}
          {spreadsheetId && (
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Linked Google Spreadsheet</span>
                </div>
                {spreadsheetUrl && (
                  <a
                    href={spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 font-semibold underline text-xs"
                  >
                    <span>Open in Google Sheets</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <div className="font-mono text-[11px] bg-white p-2 rounded-lg border border-emerald-200/80 text-emerald-950 break-all select-all">
                {spreadsheetId}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleCreateNewSpreadsheet}
              disabled={isLoading}
              className="flex flex-col items-start p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/50 transition-colors text-left group"
            >
              <div className="p-2 rounded-lg bg-emerald-600 text-white mb-2 shadow-2xs group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-800 text-sm">Create New Hospital Workbook</span>
              <span className="text-slate-500 text-[11px] mt-0.5">
                Creates a new 10-tab structured spreadsheet in your Google Drive and syncs all current data.
              </span>
            </button>

            <button
              onClick={handlePushData}
              disabled={isLoading || !spreadsheetId}
              className="flex flex-col items-start p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left disabled:opacity-50 group"
            >
              <div className="p-2 rounded-lg bg-blue-600 text-white mb-2 shadow-2xs group-hover:scale-105 transition-transform">
                <UploadCloud className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-800 text-sm">Push Local Changes to Sheets</span>
              <span className="text-slate-500 text-[11px] mt-0.5">
                Overwrites and updates all 10 tabs in your linked Google Sheet with your latest in-app state.
              </span>
            </button>

            <button
              onClick={handlePullData}
              disabled={isLoading || !spreadsheetId}
              className="flex flex-col items-start p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left disabled:opacity-50 group sm:col-span-2"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-600 text-white shadow-2xs group-hover:scale-105 transition-transform">
                  <DownloadCloud className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-slate-800 text-sm block">Pull Latest Data from Google Sheets</span>
                  <span className="text-slate-500 text-[11px] mt-0.5 block">
                    Reads rows directly from your Google Sheet and updates all tables inside this web application.
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Link Existing Spreadsheet */}
          <div className="pt-2 border-t border-slate-200 space-y-2">
            <label className="font-semibold text-slate-700 block">
              Or Link an Existing Google Sheet by ID or URL:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Paste Spreadsheet ID or full Google Sheets URL..."
                value={customSpreadsheetIdInput}
                onChange={(e) => setCustomSpreadsheetIdInput(e.target.value)}
                className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleLinkExistingSheet}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg text-xs transition-colors shrink-0"
              >
                Link Sheet
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            {spreadsheetId ? 'Auto-sync active with linked Google Sheet.' : 'Connect to Google Drive to begin syncing.'}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
