import React, { useState } from 'react';
import { Printer, FileText, Filter, Download } from 'lucide-react';
import {
  HospitalSettings,
  CashBookEntry,
  PettyCashEntry,
  BillEntry,
  PaymentEntry,
  GSTEntry,
  ExpenditureEntry,
  Supplier,
  ExpenditureCategory,
} from '../types/hospital';

interface ReportsViewProps {
  settings: HospitalSettings;
  cashBook: CashBookEntry[];
  pettyCash: PettyCashEntry[];
  bills: BillEntry[];
  payments: PaymentEntry[];
  gstEntries: GSTEntry[];
  expenditures: ExpenditureEntry[];
  suppliers: Supplier[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  settings,
  cashBook,
  pettyCash,
  bills,
  payments,
  gstEntries,
  expenditures,
  suppliers,
}) => {
  const [activeReport, setActiveReport] = useState<number>(1);

  const reportList = [
    { id: 1, name: '1. Daily Cash Book Report', code: 'REP-CB-01' },
    { id: 2, name: '2. Monthly Cash Book Report', code: 'REP-CB-02' },
    { id: 3, name: '3. Petty Cash Summary', code: 'REP-PC-03' },
    { id: 4, name: '4. Supplier-wise Expenditure', code: 'REP-SUP-04' },
    { id: 5, name: '5. Category-wise Expenditure', code: 'REP-CAT-05' },
    { id: 6, name: '6. GST Summary Report', code: 'REP-GST-06' },
    { id: 7, name: '7. Monthly Expenditure Statement', code: 'REP-MES-07' },
    { id: 8, name: '8. Annual Expenditure Statement', code: 'REP-AES-08' },
    { id: 9, name: '9. Bill Pending Report', code: 'REP-BP-09' },
    { id: 10, name: '10. Payment Register Report', code: 'REP-PR-10' },
  ];

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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Toolbar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900">14. Printable Financial Reports & Statements</h2>
          <p className="text-xs text-slate-500">10 Official Government Hospital Report Templates formatted for A4 printing</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={activeReport}
            onChange={(e) => setActiveReport(Number(e.target.value))}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          >
            {reportList.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report A4</span>
          </button>
        </div>
      </div>

      {/* Printable Report Container */}
      <div className="bg-white p-8 rounded-2xl border border-slate-300 shadow-md print:shadow-none print:border-none print:p-0 font-sans text-slate-900">
        {/* Letterhead Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
          <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold">
            {settings.state} • {settings.departmentName}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase font-serif mt-0.5">
            {settings.hospitalName}
          </h1>
          <p className="text-xs text-slate-600 font-sans mt-0.5">
            {settings.district} • Financial Year: {settings.financialYear}
          </p>
          <div className="inline-block px-3 py-0.5 mt-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-sm">
            {reportList.find((r) => r.id === activeReport)?.name.toUpperCase()}
          </div>
        </div>

        {/* REPORT CONTENT CASES */}
        {activeReport === 1 && (
          /* Daily Cash Book */
          <div className="space-y-4">
            <table className="w-full text-xs border-collapse border border-slate-900">
              <thead className="bg-slate-100 font-bold border-b border-slate-900 uppercase">
                <tr>
                  <th className="p-2 text-left border-r border-slate-900">Voucher No</th>
                  <th className="p-2 text-left border-r border-slate-900">Date</th>
                  <th className="p-2 text-left border-r border-slate-900">Particulars</th>
                  <th className="p-2 text-right border-r border-slate-900">Receipt (₹)</th>
                  <th className="p-2 text-right border-r border-slate-900">Payment (₹)</th>
                  <th className="p-2 text-right border-r border-slate-900">Running Balance (₹)</th>
                  <th className="p-2 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {cashBook.map((cb) => (
                  <tr key={cb.voucherNo}>
                    <td className="p-2 border-r border-slate-900 font-mono">{cb.voucherNo}</td>
                    <td className="p-2 border-r border-slate-900 font-mono">{cb.date}</td>
                    <td className="p-2 border-r border-slate-900">{cb.particulars}</td>
                    <td className="p-2 text-right border-r border-slate-900 font-mono">₹{cb.receiptAmount.toLocaleString('en-IN')}</td>
                    <td className="p-2 text-right border-r border-slate-900 font-mono">₹{cb.paymentAmount.toLocaleString('en-IN')}</td>
                    <td className="p-2 text-right border-r border-slate-900 font-mono font-bold">₹{cb.runningBalance.toLocaleString('en-IN')}</td>
                    <td className="p-2">{cb.remarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 2 && (
          /* Monthly Cash Book */
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-300 rounded text-xs font-medium">
              Monthly Summary of Cash Receipts and Disbursements for FY {settings.financialYear}
            </div>
            <table className="w-full text-xs border-collapse border border-slate-900">
              <thead className="bg-slate-100 font-bold border-b border-slate-900 uppercase">
                <tr>
                  <th className="p-2 text-left border-r border-slate-900">Period</th>
                  <th className="p-2 text-right border-r border-slate-900">Opening Balance</th>
                  <th className="p-2 text-right border-r border-slate-900">Total Receipts</th>
                  <th className="p-2 text-right border-r border-slate-900">Total Payments</th>
                  <th className="p-2 text-right">Closing Balance</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-300 font-mono">
                  <td className="p-2 border-r border-slate-900 font-sans font-bold">April 2026</td>
                  <td className="p-2 text-right border-r border-slate-900">₹2,50,000.00</td>
                  <td className="p-2 text-right border-r border-slate-900">₹1,30,900.00</td>
                  <td className="p-2 text-right border-r border-slate-900">₹38,400.00</td>
                  <td className="p-2 text-right font-bold">₹3,42,500.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 3 && (
          /* Petty Cash Summary */
          <div className="space-y-4">
            <table className="w-full text-xs border-collapse border border-slate-900">
              <thead className="bg-slate-100 font-bold border-b border-slate-900 uppercase">
                <tr>
                  <th className="p-2 text-left border-r border-slate-900">Voucher No</th>
                  <th className="p-2 text-left border-r border-slate-900">Date</th>
                  <th className="p-2 text-left border-r border-slate-900">Particulars</th>
                  <th className="p-2 text-left border-r border-slate-900">Category</th>
                  <th className="p-2 text-right border-r border-slate-900">Amount (₹)</th>
                  <th className="p-2 text-right">Balance (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {pettyCash.map((pc) => (
                  <tr key={pc.voucherNo}>
                    <td className="p-2 border-r border-slate-900 font-mono">{pc.voucherNo}</td>
                    <td className="p-2 border-r border-slate-900 font-mono">{pc.date}</td>
                    <td className="p-2 border-r border-slate-900">{pc.particulars}</td>
                    <td className="p-2 border-r border-slate-900 font-medium">{pc.category}</td>
                    <td className="p-2 text-right border-r border-slate-900 font-mono">₹{pc.amount.toLocaleString('en-IN')}</td>
                    <td className="p-2 text-right font-mono font-bold">₹{pc.runningBalance.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 4 && (
          /* Supplier-wise Expenditure */
          <div className="space-y-4">
            <table className="w-full text-xs border-collapse border border-slate-900">
              <thead className="bg-slate-100 font-bold border-b border-slate-900 uppercase">
                <tr>
                  <th className="p-2 text-left border-r border-slate-900">Supplier Name</th>
                  <th className="p-2 text-left border-r border-slate-900">GST Number</th>
                  <th className="p-2 text-right border-r border-slate-900">Taxable Amount</th>
                  <th className="p-2 text-right border-r border-slate-900">GST Amount</th>
                  <th className="p-2 text-right">Total Disbursed (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {suppliers.map((s) => {
                  const supExps = expenditures.filter((e) => e.supplierName === s.name);
                  const totalTaxable = supExps.reduce((acc, curr) => acc + curr.amount, 0);
                  const totalGst = supExps.reduce((acc, curr) => acc + curr.gst, 0);
                  const totalExp = supExps.reduce((acc, curr) => acc + curr.total, 0);
                  return (
                    <tr key={s.id}>
                      <td className="p-2 border-r border-slate-900 font-bold">{s.name}</td>
                      <td className="p-2 border-r border-slate-900 font-mono">{s.gstNo}</td>
                      <td className="p-2 text-right border-r border-slate-900 font-mono">₹{totalTaxable.toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right border-r border-slate-900 font-mono">₹{totalGst.toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right font-mono font-bold">₹{totalExp.toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 5 && (
          /* Category-wise Expenditure */
          <div className="space-y-4">
            <table className="w-full text-xs border-collapse border border-slate-900">
              <thead className="bg-slate-100 font-bold border-b border-slate-900 uppercase">
                <tr>
                  <th className="p-2 text-left border-r border-slate-900">S.No</th>
                  <th className="p-2 text-left border-r border-slate-900">Expenditure Category Head</th>
                  <th className="p-2 text-right border-r border-slate-900">Taxable Expenditure</th>
                  <th className="p-2 text-right border-r border-slate-900">GST Paid</th>
                  <th className="p-2 text-right">Total Expenditure (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {categoriesList.map((cat, idx) => {
                  const catExps = expenditures.filter((e) => e.category === cat);
                  const amt = catExps.reduce((acc, c) => acc + c.amount, 0);
                  const gst = catExps.reduce((acc, c) => acc + c.gst, 0);
                  const tot = catExps.reduce((acc, c) => acc + c.total, 0);
                  return (
                    <tr key={cat}>
                      <td className="p-2 text-center border-r border-slate-900 font-mono">{idx + 1}</td>
                      <td className="p-2 border-r border-slate-900 font-semibold">{cat}</td>
                      <td className="p-2 text-right border-r border-slate-900 font-mono">₹{amt.toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right border-r border-slate-900 font-mono">₹{gst.toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right font-mono font-bold">₹{tot.toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 6 && (
          /* GST Summary */
          <div className="space-y-4">
            <table className="w-full text-xs border-collapse border border-slate-900">
              <thead className="bg-slate-100 font-bold border-b border-slate-900 uppercase">
                <tr>
                  <th className="p-2 text-left border-r border-slate-900">GSTIN</th>
                  <th className="p-2 text-left border-r border-slate-900">Supplier Name</th>
                  <th className="p-2 text-left border-r border-slate-900">Bill No</th>
                  <th className="p-2 text-right border-r border-slate-900">Taxable (₹)</th>
                  <th className="p-2 text-right border-r border-slate-900">CGST (₹)</th>
                  <th className="p-2 text-right border-r border-slate-900">SGST (₹)</th>
                  <th className="p-2 text-right border-r border-slate-900">IGST (₹)</th>
                  <th className="p-2 text-right">Total GST (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-mono">
                {gstEntries.map((g) => (
                  <tr key={g.billNo}>
                    <td className="p-2 border-r border-slate-900">{g.gstNo}</td>
                    <td className="p-2 border-r border-slate-900 font-sans">{g.supplierName}</td>
                    <td className="p-2 border-r border-slate-900">{g.billNo}</td>
                    <td className="p-2 text-right border-r border-slate-900">₹{g.taxableAmount.toLocaleString('en-IN')}</td>
                    <td className="p-2 text-right border-r border-slate-900">₹{g.cgst.toLocaleString('en-IN')}</td>
                    <td className="p-2 text-right border-r border-slate-900">₹{g.sgst.toLocaleString('en-IN')}</td>
                    <td className="p-2 text-right border-r border-slate-900">₹{g.igst.toLocaleString('en-IN')}</td>
                    <td className="p-2 text-right font-bold text-slate-900">₹{g.totalGst.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 7 && (
          /* Monthly Expenditure Statement */
          <div className="space-y-4">
            <p className="text-xs text-slate-600 font-medium">Monthly Category Expenditure Matrix (Apr 2026 - Mar 2027)</p>
            <table className="w-full text-xs border-collapse border border-slate-900">
              <thead className="bg-slate-100 font-bold border-b border-slate-900 uppercase">
                <tr>
                  <th className="p-2 text-left border-r border-slate-900">Category</th>
                  <th className="p-2 text-right border-r border-slate-900">Apr 2026</th>
                  <th className="p-2 text-right border-r border-slate-900">May 2026</th>
                  <th className="p-2 text-right border-r border-slate-900">Jun 2026</th>
                  <th className="p-2 text-right">Total FY 2025-26</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {categoriesList.map((cat) => {
                  const catTot = expenditures
                    .filter((e) => e.category === cat)
                    .reduce((a, b) => a + b.total, 0);
                  return (
                    <tr key={cat}>
                      <td className="p-2 border-r border-slate-900 font-bold">{cat}</td>
                      <td className="p-2 text-right border-r border-slate-900 font-mono">₹{catTot.toLocaleString('en-IN')}</td>
                      <td className="p-2 text-right border-r border-slate-900 font-mono">₹0.00</td>
                      <td className="p-2 text-right border-r border-slate-900 font-mono">₹0.00</td>
                      <td className="p-2 text-right font-mono font-bold">₹{catTot.toLocaleString('en-IN')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 8 && (
          /* Annual Expenditure Statement */
          <div className="space-y-4">
            <table className="w-full text-xs border-collapse border border-slate-900">
              <thead className="bg-slate-100 font-bold border-b border-slate-900 uppercase">
                <tr>
                  <th className="p-2 text-left border-r border-slate-900">Financial Head</th>
                  <th className="p-2 text-right">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300 font-sans">
                <tr>
                  <td className="p-2.5 border-r border-slate-900 font-bold">Total Opening Balances (Cash + Bank + Imprest)</td>
                  <td className="p-2.5 text-right font-mono font-bold text-sm">₹51,25,000.00</td>
                </tr>
                <tr>
                  <td className="p-2.5 border-r border-slate-900">Total User Fee & Grant Collections Received</td>
                  <td className="p-2.5 text-right font-mono">₹1,30,900.00</td>
                </tr>
                <tr>
                  <td className="p-2.5 border-r border-slate-900">Total Net Expenditure Incurred</td>
                  <td className="p-2.5 text-right font-mono">₹5,86,180.00</td>
                </tr>
                <tr>
                  <td className="p-2.5 border-r border-slate-900">Total GST Disbursed</td>
                  <td className="p-2.5 text-right font-mono">₹71,180.00</td>
                </tr>
                <tr className="bg-slate-100 font-bold">
                  <td className="p-2.5 border-r border-slate-900 uppercase">Closing Balance Carried Forward</td>
                  <td className="p-2.5 text-right font-mono text-sm">₹46,69,720.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 9 && (
          /* Bill Pending Report */
          <div className="space-y-4">
            <table className="w-full text-xs border-collapse border border-slate-900">
              <thead className="bg-slate-100 font-bold border-b border-slate-900 uppercase">
                <tr>
                  <th className="p-2 text-left border-r border-slate-900">Bill No</th>
                  <th className="p-2 text-left border-r border-slate-900">Bill Date</th>
                  <th className="p-2 text-left border-r border-slate-900">Supplier Name</th>
                  <th className="p-2 text-left border-r border-slate-900">Description</th>
                  <th className="p-2 text-right border-r border-slate-900">Total Bill Amount (₹)</th>
                  <th className="p-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {bills
                  .filter((b) => b.status === 'Pending')
                  .map((b) => (
                    <tr key={b.billNo}>
                      <td className="p-2 border-r border-slate-900 font-mono font-bold">{b.billNo}</td>
                      <td className="p-2 border-r border-slate-900 font-mono">{b.billDate}</td>
                      <td className="p-2 border-r border-slate-900 font-semibold">{b.supplierName}</td>
                      <td className="p-2 border-r border-slate-900">{b.description}</td>
                      <td className="p-2 text-right border-r border-slate-900 font-mono font-bold text-rose-700">
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="p-2 text-center font-bold text-rose-600 bg-rose-50">UNPAID</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 10 && (
          /* Payment Register Report */
          <div className="space-y-4">
            <table className="w-full text-xs border-collapse border border-slate-900">
              <thead className="bg-slate-100 font-bold border-b border-slate-900 uppercase">
                <tr>
                  <th className="p-2 text-left border-r border-slate-900">Payment No</th>
                  <th className="p-2 text-left border-r border-slate-900">Date</th>
                  <th className="p-2 text-left border-r border-slate-900">Supplier Name</th>
                  <th className="p-2 text-left border-r border-slate-900">Bank & UTR No</th>
                  <th className="p-2 text-center border-r border-slate-900">Mode</th>
                  <th className="p-2 text-right">Amount Paid (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-300">
                {payments.map((p) => (
                  <tr key={p.paymentNo}>
                    <td className="p-2 border-r border-slate-900 font-mono font-bold">{p.paymentNo}</td>
                    <td className="p-2 border-r border-slate-900 font-mono">{p.paymentDate}</td>
                    <td className="p-2 border-r border-slate-900 font-semibold">{p.supplierName}</td>
                    <td className="p-2 border-r border-slate-900 font-mono text-[11px]">
                      {p.bankName} • {p.utrNo}
                    </td>
                    <td className="p-2 text-center border-r border-slate-900 font-bold">{p.paymentMode}</td>
                    <td className="p-2 text-right font-mono font-bold">₹{p.amountPaid.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Official Signatures Section */}
        <div className="mt-12 pt-6 border-t border-slate-400 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="h-10 border-b border-dashed border-slate-400"></div>
            <p className="font-bold text-slate-900 mt-2">{settings.seniorAccountant}</p>
            <p className="text-[10px] text-slate-500">Senior Accountant / Cashier</p>
          </div>
          <div>
            <div className="h-10 border-b border-dashed border-slate-400"></div>
            <p className="font-bold text-slate-900 mt-2">{settings.internalAuditor}</p>
            <p className="text-[10px] text-slate-500">Internal Audit Officer</p>
          </div>
          <div>
            <div className="h-10 border-b border-dashed border-slate-400"></div>
            <p className="font-bold text-slate-900 mt-2">{settings.medicalSuperintendent}</p>
            <p className="text-[10px] text-slate-500">Medical Superintendent</p>
          </div>
        </div>
      </div>
    </div>
  );
};
