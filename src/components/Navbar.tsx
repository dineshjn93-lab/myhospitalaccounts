import React from 'react';
import {
  Building2,
  FileSpreadsheet,
  Download,
  RotateCcw,
  BookOpen,
  Printer,
  ShieldCheck,
  Calendar,
  Database,
} from 'lucide-react';
import { HospitalSettings } from '../types/hospital';

interface NavbarProps {
  settings: HospitalSettings;
  onExportExcel: () => void;
  onOpenFormulasGuide: () => void;
  onOpenSupabaseModal: () => void;
  onResetData: () => void;
  onLoadSampleData: () => void;
  onPrint: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onExportExcel,
  onOpenFormulasGuide,
  onOpenSupabaseModal,
  onResetData,
  onLoadSampleData,
  onPrint,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-sm ring-2 ring-blue-400/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-100">
                {settings.hospitalName}
              </h1>
              <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-semibold bg-blue-950 text-blue-300 border border-blue-700/50 rounded-full">
                Govt. Accounts System
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-3">
              <span>{settings.departmentName}</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                FY: <strong className="text-slate-300 font-medium">{settings.financialYear}</strong>
              </span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenSupabaseModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900 border border-emerald-700/60 transition-colors shadow-2xs"
            title="Supabase Database Status & SQL Migration Setup"
          >
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span>Supabase DB & SQL</span>
          </button>

          <button
            onClick={onOpenFormulasGuide}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
            title="View Google Sheets / Excel Formula Architecture"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Formulas Architecture</span>
          </button>

          <button
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
            title="Print Current Active Sheet or Report"
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Print A4</span>
          </button>

          <button
            onClick={onLoadSampleData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-colors"
            title="Reload realistic sample hospital accounts data"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Sample Data</span>
          </button>

          <button
            onClick={onExportExcel}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all focus:ring-2 focus:ring-emerald-400"
            title="Download complete 15-sheet Excel workbook (.xlsx) with embedded formulas"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-100" />
            <span>Export to Excel (.xlsx)</span>
            <Download className="w-3.5 h-3.5 text-emerald-200 ml-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
