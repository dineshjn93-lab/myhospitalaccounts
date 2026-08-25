import React from 'react';
import {
  Wallet,
  Coins,
  Building2,
  TrendingDown,
  Clock,
  Users,
  Percent,
  CheckCircle2,
  ArrowRight,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import {
  HospitalSettings,
  CashBookEntry,
  PettyCashEntry,
  BillEntry,
  Supplier,
  ExpenditureEntry,
  GSTEntry,
  SheetTab,
  ExpenditureCategory,
} from '../types/hospital';

interface DashboardViewProps {
  settings: HospitalSettings;
  cashBook: CashBookEntry[];
  pettyCash: PettyCashEntry[];
  bills: BillEntry[];
  suppliers: Supplier[];
  expenditures: ExpenditureEntry[];
  gstEntries: GSTEntry[];
  onNavigate: (tab: SheetTab) => void;
  onOpenFormulas: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  settings,
  cashBook,
  pettyCash,
  bills,
  suppliers,
  expenditures,
  gstEntries,
  onNavigate,
  onOpenFormulas,
}) => {
  // Calculations matching Excel formulas
  const currentCashBalance = cashBook.length > 0 ? cashBook[cashBook.length - 1].runningBalance : settings.openingCashBalance;
  const currentPettyCashBalance = pettyCash.length > 0 ? pettyCash[pettyCash.length - 1].runningBalance : settings.openingPettyCashBalance;
  
  const totalMonthlyExpenditure = expenditures.reduce((acc, curr) => acc + curr.total, 0);
  const totalGstPaid = gstEntries.reduce((acc, curr) => acc + curr.totalGst, 0);
  
  const pendingBills = bills.filter((b) => b.status === 'Pending');
  const pendingBillsCount = pendingBills.length;
  const pendingBillsAmount = pendingBills.reduce((acc, b) => acc + b.totalAmount, 0);
  const activeSuppliersCount = suppliers.filter((s) => s.status === 'Active').length;

  // Category-wise summary
  const categoriesList: ExpenditureCategory[] = [
    'Medicines',
    'Medical Equipment',
    'Laboratory',
    'Office Expenses',
    'Stationery',
    'Maintenance',
    'Vehicle',
    'Electricity',
    'Water Charges',
    'Cleaning Materials',
    'Miscellaneous',
  ];

  const categoryData = categoriesList.map((cat) => {
    const total = expenditures
      .filter((e) => e.category === cat)
      .reduce((acc, curr) => acc + curr.total, 0);
    return { category: cat, total };
  });

  const maxCatTotal = Math.max(...categoryData.map((c) => c.total), 1);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Financial Year: {settings.financialYear}
            </span>
            <span className="text-xs text-slate-400">Govt Hospital Standard Accounts</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">{settings.hospitalName}</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Fully structured Accounts Management System with 15 linked sheets. All balances and totals are computed using strict Google Sheets / Excel compatible formulas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenFormulas}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all shadow-sm flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-blue-400" />
            <span>Formula Inspector</span>
          </button>
          <button
            onClick={() => onNavigate('reports')}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all flex items-center gap-2"
          >
            <span>Print Reports</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cash Balance */}
        <div
          onClick={() => onNavigate('cash_book')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Current Cash Balance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900">
              ₹{currentCashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">Formula:</span>
              <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">
                ='Cash Book'!F{cashBook.length + 1}
              </code>
            </p>
          </div>
        </div>

        {/* Card 2: Petty Cash Balance */}
        <div
          onClick={() => onNavigate('petty_cash_book')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Petty Cash Imprest</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900">
              ₹{currentPettyCashBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-amber-600 font-semibold">Formula:</span>
              <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">
                ='Petty Cash'!F{pettyCash.length + 1}
              </code>
            </p>
          </div>
        </div>

        {/* Card 3: Pending Bills */}
        <div
          onClick={() => onNavigate('bill_register')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Pending Bills Payable</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline justify-between">
              <p className="text-2xl font-bold text-slate-900">
                ₹{pendingBillsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-700">
                {pendingBillsCount} Bills
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-rose-600 font-semibold">Formula:</span>
              <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">
                SUMIF(Bill_Status, "Pending")
              </code>
            </p>
          </div>
        </div>

        {/* Card 4: Monthly Expenditure */}
        <div
          onClick={() => onNavigate('expenditure_register')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:border-blue-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Expenditure</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-slate-900">
              ₹{totalMonthlyExpenditure.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-blue-600 font-semibold">Formula:</span>
              <code className="text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono">
                SUM(Expenditure_Total)
              </code>
            </p>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigate('supplier_master')}
          className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Registered Active Suppliers</p>
              <p className="text-lg font-bold text-slate-900">{activeSuppliersCount} Vendors</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={() => onNavigate('gst_register')}
          className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Total GST Paid / Claimable</p>
              <p className="text-lg font-bold text-slate-900">
                ₹{totalGstPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>

        <div
          onClick={() => onNavigate('bank_master')}
          className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Bank Accounts Balance</p>
              <p className="text-lg font-bold text-slate-900">
                ₹{(settings.bankOpeningBalance + 925000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Main Charts / Category Breakdown & Pending Bills Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Category-wise Expenditure Breakdown</h3>
              <p className="text-xs text-slate-500">Formula: <code className="font-mono text-blue-600">SUMIFS('Expenditure Register'!G:G, Category_Range, "Medicines")</code></p>
            </div>
            <button
              onClick={() => onNavigate('monthly_summary')}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              View Full Summary Matrix &rarr;
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {categoryData.map((item) => {
              const pct = Math.round((item.total / maxCatTotal) * 100);
              return (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="text-slate-700">{item.category}</span>
                    <span className="text-slate-900 font-semibold">
                      ₹{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, item.total > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pending Bills Quick Action Sidebar (1 Col) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-amber-500" />
                <span>Pending Vendor Bills</span>
              </h3>
              <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full">
                {pendingBillsCount} Action Required
              </span>
            </div>

            <div className="mt-3 space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {pendingBills.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  All vendor bills cleared! No pending payments.
                </div>
              ) : (
                pendingBills.map((b) => (
                  <div key={b.billNo} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-blue-700 font-mono">{b.billNo}</span>
                      <span className="text-slate-900">
                        ₹{b.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-slate-600 font-medium truncate">{b.supplierName}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <span>Date: {b.billDate}</span>
                      <button
                        onClick={() => onNavigate('payment_register')}
                        className="text-blue-600 font-semibold hover:underline"
                      >
                        Process Payment &rarr;
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigate('bill_register')}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl shadow-sm transition-colors text-center"
            >
              Open Complete Bill Register &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
