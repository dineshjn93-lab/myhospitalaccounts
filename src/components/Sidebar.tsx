import React from 'react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building,
  Wallet,
  Coins,
  Receipt,
  CreditCard,
  Percent,
  TrendingDown,
  CalendarDays,
  BarChart3,
  Printer,
  FileText,
  Settings as SettingsIcon,
} from 'lucide-react';
import { SheetTab } from '../types/hospital';

interface SidebarProps {
  activeTab: SheetTab;
  onSelectTab: (tab: SheetTab) => void;
  counts: {
    suppliers: number;
    recipients: number;
    pendingBills: number;
    cashBook: number;
    pettyCash: number;
  };
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab, counts }) => {
  const groups = [
    {
      label: 'Main Dashboard',
      items: [
        { id: 'dashboard' as SheetTab, name: '1. Dashboard', icon: LayoutDashboard, badge: null },
      ],
    },
    {
      label: 'Master Directories',
      items: [
        { id: 'supplier_master' as SheetTab, name: '2. Supplier Master', icon: Users, badge: counts.suppliers },
        { id: 'recipient_master' as SheetTab, name: '3. Recipient Master', icon: UserCheck, badge: counts.recipients },
        { id: 'bank_master' as SheetTab, name: '4. Bank Master', icon: Building, badge: null },
      ],
    },
    {
      label: 'Cash & Imprest Books',
      items: [
        { id: 'cash_book' as SheetTab, name: '5. Cash Book', icon: Wallet, badge: counts.cashBook },
        { id: 'petty_cash_book' as SheetTab, name: '6. Petty Cash Book', icon: Coins, badge: counts.pettyCash },
      ],
    },
    {
      label: 'Financial Registers',
      items: [
        {
          id: 'bill_register' as SheetTab,
          name: '7. Bill Register',
          icon: Receipt,
          badge: counts.pendingBills ? `${counts.pendingBills} Pending` : null,
          badgeColor: counts.pendingBills ? 'bg-amber-100 text-amber-800 font-bold border-amber-300' : undefined,
        },
        { id: 'payment_register' as SheetTab, name: '8. Payment Register', icon: CreditCard, badge: null },
        { id: 'gst_register' as SheetTab, name: '9. GST Register', icon: Percent, badge: null },
        { id: 'expenditure_register' as SheetTab, name: '10. Expenditure Register', icon: TrendingDown, badge: null },
      ],
    },
    {
      label: 'Summaries & Audits',
      items: [
        { id: 'monthly_summary' as SheetTab, name: '11. Monthly Summary', icon: CalendarDays, badge: null },
        { id: 'annual_summary' as SheetTab, name: '12. Annual Summary', icon: BarChart3, badge: null },
      ],
    },
    {
      label: 'Printables & Reports',
      items: [
        { id: 'voucher_print' as SheetTab, name: '13. Voucher Print', icon: Printer, badge: 'A4' },
        { id: 'reports' as SheetTab, name: '14. Reports (10 Types)', icon: FileText, badge: 'Print' },
      ],
    },
    {
      label: 'System Setup',
      items: [
        { id: 'settings' as SheetTab, name: '15. Settings & Rules', icon: SettingsIcon, badge: null },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex-shrink-0 flex flex-col h-[calc(100vh-61px)] overflow-y-auto select-none">
      <div className="p-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-800">
        Google Sheets Workbook Structure
      </div>

      <div className="p-2 space-y-4 flex-1">
        {groups.map((group) => (
          <div key={group.label}>
            <div className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white font-semibold shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.badge !== null && item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md border text-center ${
                          item.badgeColor ||
                          (isActive
                            ? 'bg-blue-700 text-blue-100 border-blue-500'
                            : 'bg-slate-800 text-slate-400 border-slate-700')
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-slate-950 border-t border-slate-800 text-center text-[11px] text-slate-400 space-y-1">
        <p className="font-medium text-slate-300">100% Excel / Sheets Formula Powered</p>
        <p className="text-[10px] text-slate-400">Compatible with MS Excel 2016+ & Google Sheets</p>
      </div>
    </aside>
  );
};
