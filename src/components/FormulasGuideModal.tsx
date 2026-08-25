import React from 'react';
import { X, BookOpen, CheckCircle2, Code2, ShieldAlert } from 'lucide-react';

interface FormulasGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FormulasGuideModal: React.FC<FormulasGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const formulaItems = [
    {
      name: 'XLOOKUP & VLOOKUP',
      sheet: 'Bill Register & Payment Register',
      formula: `=IFERROR(XLOOKUP(C2, 'Supplier Master'!B:B, 'Supplier Master'!A:A), "SUP-1001")`,
      purpose: 'Automatically populates Supplier ID, GST Number, Bank Name, Account Number, and IFSC Code when selecting Supplier Name.',
    },
    {
      name: 'Running Balance Formula',
      sheet: 'Cash Book & Petty Cash Book',
      formula: `=IF(ROW()=2, Receipt-Payment, F1 + Receipt - Payment)`,
      purpose: 'Computes cumulative live balance for each cash/petty cash transaction row dynamically.',
    },
    {
      name: 'SUMIFS',
      sheet: 'Monthly Summary, Annual Summary & GST Register',
      formula: `=SUMIFS('Expenditure Register'!G:G, 'Expenditure Register'!D:D, "Medicines")`,
      purpose: 'Sums up total expenses filtered by specific Expenditure Head, Supplier, or Date Range.',
    },
    {
      name: 'COUNTIFS & Pending Bill Tracker',
      sheet: 'Dashboard & Reports',
      formula: `=COUNTIF('Bill Register'!J:J, "Pending")`,
      purpose: 'Counts total unpaid vendor bills and calculates total pending liability amount.',
    },
    {
      name: 'Duplicate Detection Warning',
      sheet: 'Bill Register & Supplier Master',
      formula: `=IF(COUNTIF(A:A, A2)>1, "⚠️ DUPLICATE BILL NO", "VALID")`,
      purpose: 'Highlights accidental duplicate bill numbers or duplicate GSTIN entries in red.',
    },
    {
      name: 'ARRAYFORMULA & SORT & UNIQUE',
      sheet: 'Master Directories & Settings',
      formula: `=SORT(UNIQUE('Supplier Master'!B2:B))`,
      purpose: 'Generates dynamic, deduplicated dropdown lists for clean data validation in Google Sheets.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold">Google Sheets & Excel Formula Architecture</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">100% Formula Driven • Zero Hardcoded Calculations</p>
              <p className="mt-0.5 text-[11px] text-blue-800">
                When you click "Export to Excel (.xlsx)", these exact formulas are written into the Excel file. They recompute dynamically when opened in Microsoft Excel or imported into Google Sheets!
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {formulaItems.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">{item.name}</span>
                  <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-200 text-slate-700 rounded-md">
                    Sheet: {item.sheet}
                  </span>
                </div>

                <div className="p-2 bg-slate-900 text-blue-300 font-mono text-[11px] rounded-lg overflow-x-auto flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <code>{item.formula}</code>
                </div>

                <p className="text-[11px] text-slate-600">{item.purpose}</p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-sm transition-colors"
            >
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
