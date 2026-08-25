import React, { useState, useMemo } from 'react';
import {
  FileText,
  Printer,
  Download,
  Filter,
  Search,
  Plus,
  ArrowUpDown,
  Building2,
  Percent,
  CheckCircle2,
  Calculator,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import {
  HospitalSettings,
  BillEntry,
  Supplier,
  Recipient,
  PaymentEntry,
  PanDeductionRow,
  GstDeductionRow,
} from '../types/hospital';

interface DeductionReportsViewProps {
  settings: HospitalSettings;
  bills: BillEntry[];
  suppliers: Supplier[];
  recipients: Recipient[];
  payments: PaymentEntry[];
}

export const DeductionReportsView: React.FC<DeductionReportsViewProps> = ({
  settings,
  bills,
  suppliers,
  recipients,
  payments,
}) => {
  const [activeTab, setActiveTab] = useState<'pan' | 'gst' | 'combined'>('pan');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [customTdsRate, setCustomTdsRate] = useState<number>(2); // Default 2% TDS
  const [customGstTdsRate, setCustomGstTdsRate] = useState<number>(2); // Default 2% GST TDS (1% CGST + 1% SGST)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Custom manual entries added by user
  const [manualPanEntries, setManualPanEntries] = useState<PanDeductionRow[]>([]);
  const [manualGstEntries, setManualGstEntries] = useState<GstDeductionRow[]>([]);

  // Map of Supplier PAN & GST
  const supplierMap = useMemo(() => {
    const map = new Map<string, { pan: string; gst: string; name: string }>();
    suppliers.forEach((s) => {
      map.set(s.name.toLowerCase().trim(), {
        pan: s.panNo || 'AAAAB1234C',
        gst: s.gstNo || '07AAAAB1234C1Z5',
        name: s.name,
      });
      if (s.id) {
        map.set(s.id.toLowerCase().trim(), {
          pan: s.panNo || 'AAAAB1234C',
          gst: s.gstNo || '07AAAAB1234C1Z5',
          name: s.name,
        });
      }
    });
    return map;
  }, [suppliers]);

  // Derive PAN / IT-TDS Deduction Rows (Template 1)
  const panDeductionData: PanDeductionRow[] = useMemo(() => {
    let list: PanDeductionRow[] = [];
    let sl = 1;

    // 1. From Bills (Firm / Vendor)
    bills.forEach((b) => {
      const supInfo = supplierMap.get(b.supplierName.toLowerCase().trim()) ||
        (b.supplierId ? supplierMap.get(b.supplierId.toLowerCase().trim()) : null);

      const panNo = supInfo?.pan || (b.gstNo ? b.gstNo.substring(2, 12) : 'AABCB9876D');
      const gross = b.totalAmount || (b.billAmount + b.gstAmount);
      const taxable = b.billAmount || 0;
      const tdsRate = customTdsRate;
      const tdsAmt = Math.round((taxable * tdsRate) / 100);
      const net = gross - tdsAmt;

      list.push({
        slNo: sl++,
        name: b.supplierName,
        panNo: panNo.toUpperCase(),
        grossAmount: gross,
        invoiceNo: b.billNo,
        invoiceDate: b.billDate,
        taxableAmount: taxable,
        netAmount: net,
        tdsRate,
        tdsAmount: tdsAmt,
        section: '194C / 194J',
        type: 'Firm / Vendor',
      });
    });

    // 2. From Recipient / Officer Payments
    payments.forEach((p) => {
      if (p.recipientId) {
        const recipient = recipients.find((r) => r.id === p.recipientId);
        const name = recipient ? `${recipient.name} (${recipient.designation})` : p.supplierName;
        const gross = p.amountPaid;
        const taxable = p.amountPaid;
        const tdsRate = 10; // 10% on professional / honorarium
        const tdsAmt = Math.round((taxable * tdsRate) / 100);
        const net = gross - tdsAmt;

        list.push({
          slNo: sl++,
          name: name,
          panNo: 'ABCDE1234F',
          grossAmount: gross,
          invoiceNo: p.paymentNo,
          invoiceDate: p.paymentDate,
          taxableAmount: taxable,
          netAmount: net,
          tdsRate,
          tdsAmount: tdsAmt,
          section: '192 / 194J',
          type: 'Officer / Staff',
        });
      }
    });

    // 3. Manual custom entries
    manualPanEntries.forEach((m) => {
      list.push({
        ...m,
        slNo: sl++,
      });
    });

    // Filtering
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.panNo.toLowerCase().includes(q) ||
          r.invoiceNo.toLowerCase().includes(q)
      );
    }

    if (selectedMonth !== 'all') {
      list = list.filter((r) => r.invoiceDate.startsWith(selectedMonth));
    }

    return list;
  }, [bills, supplierMap, customTdsRate, payments, recipients, manualPanEntries, searchTerm, selectedMonth]);

  // Derive GST Deduction Rows (Template 2)
  const gstDeductionData: GstDeductionRow[] = useMemo(() => {
    let list: GstDeductionRow[] = [];
    let sl = 1;

    bills.forEach((b) => {
      const supInfo = supplierMap.get(b.supplierName.toLowerCase().trim()) ||
        (b.supplierId ? supplierMap.get(b.supplierId.toLowerCase().trim()) : null);

      const gstNo = supInfo?.gst || b.gstNo || '07AABCB9876D1Z2';
      const gross = b.totalAmount || (b.billAmount + b.gstAmount);
      const taxable = b.billAmount || 0;
      const gstTdsRate = customGstTdsRate;
      const gstTdsAmt = Math.round((taxable * gstTdsRate) / 100);
      const net = gross - gstTdsAmt;

      list.push({
        slNo: sl++,
        firmName: b.supplierName,
        gstNo: gstNo.toUpperCase(),
        grossAmount: gross,
        invoiceNo: b.billNo,
        invoiceDate: b.billDate,
        taxableAmount: taxable,
        netAmount: net,
        gstTdsRate,
        gstTdsAmount: gstTdsAmt,
      });
    });

    manualGstEntries.forEach((m) => {
      list.push({
        ...m,
        slNo: sl++,
      });
    });

    // Filtering
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (r) =>
          r.firmName.toLowerCase().includes(q) ||
          r.gstNo.toLowerCase().includes(q) ||
          r.invoiceNo.toLowerCase().includes(q)
      );
    }

    if (selectedMonth !== 'all') {
      list = list.filter((r) => r.invoiceDate.startsWith(selectedMonth));
    }

    return list;
  }, [bills, supplierMap, customGstTdsRate, manualGstEntries, searchTerm, selectedMonth]);

  // Totals for PAN Table
  const panTotals = useMemo(() => {
    return panDeductionData.reduce(
      (acc, curr) => ({
        gross: acc.gross + curr.grossAmount,
        taxable: acc.taxable + curr.taxableAmount,
        tds: acc.tds + (curr.tdsAmount || 0),
        net: acc.net + curr.netAmount,
      }),
      { gross: 0, taxable: 0, tds: 0, net: 0 }
    );
  }, [panDeductionData]);

  // Totals for GST Table
  const gstTotals = useMemo(() => {
    return gstDeductionData.reduce(
      (acc, curr) => ({
        gross: acc.gross + curr.grossAmount,
        taxable: acc.taxable + curr.taxableAmount,
        gstTds: acc.gstTds + (curr.gstTdsAmount || 0),
        net: acc.net + curr.netAmount,
      }),
      { gross: 0, taxable: 0, gstTds: 0, net: 0 }
    );
  }, [gstDeductionData]);

  // CSV Exporter matching exact template headers
  const handleExportCsv = (templateType: 'pan' | 'gst') => {
    let csvContent = '';

    if (templateType === 'pan') {
      // Template 1 Header
      csvContent += 'SL NO,FIRM NAME/ OFFICER/STAFF NAME,PAN NO.,GROSS AMOUNT,INVOICE NO,INVOICE DATE,TAXABLE AMOUNT,NET AMOUNT\n';
      panDeductionData.forEach((row) => {
        const line = [
          row.slNo,
          `"${row.name.replace(/"/g, '""')}"`,
          row.panNo,
          row.grossAmount.toFixed(2),
          row.invoiceNo,
          row.invoiceDate,
          row.taxableAmount.toFixed(2),
          row.netAmount.toFixed(2),
        ].join(',');
        csvContent += line + '\n';
      });
    } else {
      // Template 2 Header
      csvContent += 'SL NO,FIRM NAME,GST NO.,GROSS AMOUNT,INVOICE NO,INVOICE DATE,TAXABLE AMOUNT,NET AMOUNT\n';
      gstDeductionData.forEach((row) => {
        const line = [
          row.slNo,
          `"${row.firmName.replace(/"/g, '""')}"`,
          row.gstNo,
          row.grossAmount.toFixed(2),
          row.invoiceNo,
          row.invoiceDate,
          row.taxableAmount.toFixed(2),
          row.netAmount.toFixed(2),
        ].join(',');
        csvContent += line + '\n';
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `${templateType.toUpperCase()}_Deduction_Report_${settings.financialYear.replace(/\s+/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Overview */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <span>Deduction Reports & Registers</span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  TDS & GST TDS
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Statutory deductions on vendor procurement bills, work contracts, and staff honorariums
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('pan')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'pan'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. PAN / TDS Report
            </button>
            <button
              onClick={() => setActiveTab('gst')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'gst'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. GST Deduction Report
            </button>
            <button
              onClick={() => setActiveTab('combined')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'combined'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. Summary Audit
            </button>
          </div>

          <button
            onClick={() => handleExportCsv(activeTab === 'gst' ? 'gst' : 'pan')}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            title="Download CSV in exact template layout"
          >
            <Download className="w-4 h-4" />
            <span>Export Template CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print A4 Schedule</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Total Gross Amount (Invoices)
          </span>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1">
            ₹{(activeTab === 'gst' ? gstTotals.gross : panTotals.gross).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </div>
          <span className="text-[10px] text-slate-400">Total bill values before deductions</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Taxable Base Amount
          </span>
          <div className="text-xl font-bold font-mono text-blue-700 mt-1">
            ₹{(activeTab === 'gst' ? gstTotals.taxable : panTotals.taxable).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </div>
          <span className="text-[10px] text-slate-400">Net supply value subject to tax</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/50 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
            {activeTab === 'gst' ? `Total GST TDS Deducted (${customGstTdsRate}%)` : `Total TDS Deducted (${customTdsRate}%)`}
          </span>
          <div className="text-xl font-bold font-mono text-amber-950 mt-1">
            ₹{(activeTab === 'gst' ? gstTotals.gstTds : panTotals.tds).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </div>
          <span className="text-[10px] text-amber-700">Deducted at source & held for deposit</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 shadow-2xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
            Net Payable Amount
          </span>
          <div className="text-xl font-bold font-mono text-emerald-950 mt-1">
            ₹{(activeTab === 'gst' ? gstTotals.net : panTotals.net).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </div>
          <span className="text-[10px] text-emerald-700">Net disbursement to vendors/officers</span>
        </div>
      </div>

      {/* Filter and Configuration Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Firm, Staff, PAN, GST, or Invoice No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Invoice Periods</option>
            <option value="2026-04">April 2026</option>
            <option value="2026-05">May 2026</option>
            <option value="2026-06">June 2026</option>
          </select>
        </div>

        {/* Rate Adjusters */}
        <div className="flex items-center gap-4 text-xs">
          {activeTab === 'pan' && (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-600">TDS Rate (%):</span>
              <select
                value={customTdsRate}
                onChange={(e) => setCustomTdsRate(Number(e.target.value))}
                className="bg-white px-2 py-0.5 border border-slate-300 rounded font-mono font-bold text-blue-700"
              >
                <option value={1}>1% (Individual Contractor - 194C)</option>
                <option value={2}>2% (Corporate / Firm - 194C)</option>
                <option value={5}>5% (Rent / Technical)</option>
                <option value={10}>10% (Professional / 194J)</option>
              </select>
            </div>
          )}

          {activeTab === 'gst' && (
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-600">GST TDS Rate (%):</span>
              <select
                value={customGstTdsRate}
                onChange={(e) => setCustomGstTdsRate(Number(e.target.value))}
                className="bg-white px-2 py-0.5 border border-slate-300 rounded font-mono font-bold text-emerald-700"
              >
                <option value={2}>2% (1% CGST + 1% SGST)</option>
                <option value={1}>1% (Single Tax)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Printable Statement / Table Container */}
      <div className="bg-white p-8 rounded-2xl border border-slate-300 shadow-md print:shadow-none print:border-none print:p-0 font-sans text-slate-900">
        {/* Official Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
          <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold">
            {settings.state} • {settings.departmentName}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 uppercase font-serif mt-0.5">
            {settings.hospitalName}
          </h1>
          <p className="text-xs text-slate-600 font-sans mt-0.5">
            {settings.district} • Financial Year: {settings.financialYear} • Registration No: {settings.registrationNo}
          </p>

          <div className="inline-block px-4 py-1 mt-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-sm">
            {activeTab === 'pan'
              ? 'PAN NO. BASED DEDUCTION REPORT (INCOME TAX TDS ON WORKS & STAFF)'
              : activeTab === 'gst'
              ? 'GST NO. BASED DEDUCTION REPORT (GST TDS ON CONTRACT SUPPLIES)'
              : 'CONSOLIDATED DEDUCTION & AUDIT REPORT'}
          </div>
        </div>

        {/* TAB 1: PAN NO. BASED DEDUCTION TABLE (EXACT TEMPLATE 1) */}
        {(activeTab === 'pan' || activeTab === 'combined') && (
          <div className="space-y-4 mb-8">
            {activeTab === 'combined' && (
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1">
                Schedule A: PAN Based Deductions (TDS Register)
              </h3>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-slate-900">
                <thead className="bg-slate-100 font-bold border-b border-slate-900 uppercase">
                  <tr>
                    <th className="p-2 text-center border-r border-slate-900 w-12">SL NO</th>
                    <th className="p-2 text-left border-r border-slate-900">
                      FIRM NAME/ OFFICER/STAFF NAME
                    </th>
                    <th className="p-2 text-center border-r border-slate-900 font-mono">PAN NO.</th>
                    <th className="p-2 text-right border-r border-slate-900">GROSS AMOUNT (₹)</th>
                    <th className="p-2 text-center border-r border-slate-900 font-mono">INVOICE NO</th>
                    <th className="p-2 text-center border-r border-slate-900 font-mono">INVOICE DATE</th>
                    <th className="p-2 text-right border-r border-slate-900">TAXABLE AMOUNT (₹)</th>
                    <th className="p-2 text-right">NET AMOUNT (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 font-sans">
                  {panDeductionData.map((row) => (
                    <tr key={`${row.invoiceNo}-${row.slNo}`} className="hover:bg-slate-50/80">
                      <td className="p-2 text-center border-r border-slate-900 font-mono">{row.slNo}</td>
                      <td className="p-2 border-r border-slate-900 font-semibold">
                        <div>{row.name}</div>
                        {row.type && (
                          <span className="text-[10px] text-slate-500 font-normal">
                            ({row.type} - Sec {row.section})
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-center border-r border-slate-900 font-mono font-bold text-slate-800">
                        {row.panNo}
                      </td>
                      <td className="p-2 text-right border-r border-slate-900 font-mono">
                        ₹{row.grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-center border-r border-slate-900 font-mono font-semibold">
                        {row.invoiceNo}
                      </td>
                      <td className="p-2 text-center border-r border-slate-900 font-mono">{row.invoiceDate}</td>
                      <td className="p-2 text-right border-r border-slate-900 font-mono">
                        ₹{row.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-950">
                        ₹{row.netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}

                  {panDeductionData.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-400">
                        No deduction entries found matching the filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
                {panDeductionData.length > 0 && (
                  <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-900">
                    <tr>
                      <td colSpan={3} className="p-2.5 text-right border-r border-slate-900 uppercase">
                        Total Amount (PAN Schedule):
                      </td>
                      <td className="p-2.5 text-right border-r border-slate-900 font-mono">
                        ₹{panTotals.gross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td colSpan={2} className="p-2.5 text-center border-r border-slate-900 font-mono text-[11px]">
                        TDS Deducted: ₹{panTotals.tds.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-right border-r border-slate-900 font-mono">
                        ₹{panTotals.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-950 text-sm">
                        ₹{panTotals.net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: GST NO. BASED DEDUCTION TABLE (EXACT TEMPLATE 2) */}
        {(activeTab === 'gst' || activeTab === 'combined') && (
          <div className="space-y-4 mb-8">
            {activeTab === 'combined' && (
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 pb-1 pt-4">
                Schedule B: GST Based Deductions (GST TDS 2% Register)
              </h3>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-slate-900">
                <thead className="bg-slate-100 font-bold border-b border-slate-900 uppercase">
                  <tr>
                    <th className="p-2 text-center border-r border-slate-900 w-12">SL NO</th>
                    <th className="p-2 text-left border-r border-slate-900">FIRM NAME</th>
                    <th className="p-2 text-center border-r border-slate-900 font-mono">GST NO.</th>
                    <th className="p-2 text-right border-r border-slate-900">GROSS AMOUNT (₹)</th>
                    <th className="p-2 text-center border-r border-slate-900 font-mono">INVOICE NO</th>
                    <th className="p-2 text-center border-r border-slate-900 font-mono">INVOICE DATE</th>
                    <th className="p-2 text-right border-r border-slate-900">TAXABLE AMOUNT (₹)</th>
                    <th className="p-2 text-right">NET AMOUNT (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300 font-sans">
                  {gstDeductionData.map((row) => (
                    <tr key={`${row.invoiceNo}-${row.slNo}`} className="hover:bg-slate-50/80">
                      <td className="p-2 text-center border-r border-slate-900 font-mono">{row.slNo}</td>
                      <td className="p-2 border-r border-slate-900 font-semibold">{row.firmName}</td>
                      <td className="p-2 text-center border-r border-slate-900 font-mono font-bold text-slate-800">
                        {row.gstNo}
                      </td>
                      <td className="p-2 text-right border-r border-slate-900 font-mono">
                        ₹{row.grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-center border-r border-slate-900 font-mono font-semibold">
                        {row.invoiceNo}
                      </td>
                      <td className="p-2 text-center border-r border-slate-900 font-mono">{row.invoiceDate}</td>
                      <td className="p-2 text-right border-r border-slate-900 font-mono">
                        ₹{row.taxableAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-right font-mono font-bold text-emerald-950">
                        ₹{row.netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}

                  {gstDeductionData.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-6 text-center text-slate-400">
                        No GST deduction records found matching the filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
                {gstDeductionData.length > 0 && (
                  <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-900">
                    <tr>
                      <td colSpan={3} className="p-2.5 text-right border-r border-slate-900 uppercase">
                        Total Amount (GST Schedule):
                      </td>
                      <td className="p-2.5 text-right border-r border-slate-900 font-mono">
                        ₹{gstTotals.gross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td colSpan={2} className="p-2.5 text-center border-r border-slate-900 font-mono text-[11px]">
                        GST TDS Deducted (2%): ₹
                        {gstTotals.gstTds.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-right border-r border-slate-900 font-mono">
                        ₹{gstTotals.taxable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2.5 text-right font-mono font-bold text-emerald-950 text-sm">
                        ₹{gstTotals.net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>
        )}

        {/* Certificate / Declarations */}
        <div className="mt-8 p-4 bg-slate-50 border border-slate-300 rounded text-xs space-y-2">
          <p className="font-bold text-slate-900">Official Government Accounts Certificate:</p>
          <p className="text-slate-600 leading-relaxed">
            Certified that the above deductions under Income Tax Act, 1961 (TDS) and GST Act, 2017 (GST-TDS under Section 51) have been made from bills passed for payment during the period. The net amounts have been disbursed via Treasury / PFMS / NEFT and the deducted taxes have been credited to the appropriate Government Account.
          </p>
        </div>

        {/* Official Signatures Section */}
        <div className="mt-12 pt-6 border-t border-slate-400 grid grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="h-10 border-b border-dashed border-slate-400"></div>
            <p className="font-bold text-slate-900 mt-2">{settings.seniorAccountant}</p>
            <p className="text-[10px] text-slate-500">Senior Accountant / DDO</p>
          </div>
          <div>
            <div className="h-10 border-b border-dashed border-slate-400"></div>
            <p className="font-bold text-slate-900 mt-2">{settings.internalAuditor}</p>
            <p className="text-[10px] text-slate-500">Internal Auditor / Verification</p>
          </div>
          <div>
            <div className="h-10 border-b border-dashed border-slate-400"></div>
            <p className="font-bold text-slate-900 mt-2">{settings.medicalSuperintendent}</p>
            <p className="text-[10px] text-slate-500">Medical Superintendent & Drawing Officer</p>
          </div>
        </div>
      </div>
    </div>
  );
};
