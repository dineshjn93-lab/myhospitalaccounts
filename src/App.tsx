import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { SheetTable, ColumnDef } from './components/SheetTable';
import { VoucherPrintView } from './components/VoucherPrintView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { FormulasGuideModal } from './components/FormulasGuideModal';
import { SupabaseModal } from './components/SupabaseModal';

import {
  SheetTab,
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
  ExpenditureCategory,
} from './types/hospital';

import {
  initialHospitalSettings,
  initialSuppliers,
  initialRecipients,
  initialBankMaster,
  initialCashBook,
  initialPettyCash,
  initialBillRegister,
  initialPaymentRegister,
  initialGSTRegister,
  initialExpenditureRegister,
} from './data/initialData';

import { exportHospitalWorkbookToExcel } from './utils/excelExporter';
import {
  loadAllHospitalData,
  saveHospitalSettings,
  insertSupplier,
  deleteSupplier,
  insertRecipient,
  deleteRecipient,
  insertBankMaster,
  deleteBankMaster,
  insertCashBook,
  deleteCashBook,
  insertPettyCash,
  deletePettyCash,
  insertBill,
  deleteBill,
  insertPayment,
  deletePayment,
  insertGSTEntry,
  deleteGSTEntry,
  insertExpenditure,
  deleteExpenditure,
} from './services/supabaseService';

export default function App() {
  const [activeTab, setActiveTab] = useState<SheetTab>('dashboard');
  const [isFormulasGuideOpen, setIsFormulasGuideOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Core Data States
  const [settings, setSettings] = useState<HospitalSettings>(initialHospitalSettings);
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
  const [recipients, setRecipients] = useState<Recipient[]>(initialRecipients);
  const [banks, setBanks] = useState<BankMasterItem[]>(initialBankMaster);
  const [cashBook, setCashBook] = useState<CashBookEntry[]>(initialCashBook);
  const [pettyCash, setPettyCash] = useState<PettyCashEntry[]>(initialPettyCash);
  const [bills, setBills] = useState<BillEntry[]>(initialBillRegister);
  const [payments, setPayments] = useState<PaymentEntry[]>(initialPaymentRegister);
  const [gstEntries, setGstEntries] = useState<GSTEntry[]>(initialGSTRegister);
  const [expenditures, setExpenditures] = useState<ExpenditureEntry[]>(initialExpenditureRegister);

  // Fetch initial data from Supabase on mount
  const refreshFromSupabase = async () => {
    try {
      const data = await loadAllHospitalData();
      if (data.settings) setSettings(data.settings);
      if (data.suppliers?.length) setSuppliers(data.suppliers);
      if (data.recipients?.length) setRecipients(data.recipients);
      if (data.banks?.length) setBanks(data.banks);
      if (data.cashBook?.length) setCashBook(data.cashBook);
      if (data.pettyCash?.length) setPettyCash(data.pettyCash);
      if (data.bills?.length) setBills(data.bills);
      if (data.payments?.length) setPayments(data.payments);
      if (data.gstEntries?.length) setGstEntries(data.gstEntries);
      if (data.expenditures?.length) setExpenditures(data.expenditures);
    } catch (e) {
      console.warn('Supabase data loading fallback to local state:', e);
    }
  };

  useEffect(() => {
    refreshFromSupabase();
  }, []);

  // Reload / Reset handlers
  const handleLoadSampleData = () => {
    setSettings(initialHospitalSettings);
    setSuppliers(initialSuppliers);
    setRecipients(initialRecipients);
    setBanks(initialBankMaster);
    setCashBook(initialCashBook);
    setPettyCash(initialPettyCash);
    setBills(initialBillRegister);
    setPayments(initialPaymentRegister);
    setGstEntries(initialGSTRegister);
    setExpenditures(initialExpenditureRegister);
  };

  const handleResetData = () => {
    setCashBook([]);
    setPettyCash([]);
    setBills([]);
    setPayments([]);
    setGstEntries([]);
    setExpenditures([]);
  };

  const handleExportExcel = async () => {
    await exportHospitalWorkbookToExcel({
      settings,
      suppliers,
      recipients,
      banks,
      cashBook,
      pettyCash,
      bills,
      payments,
      gstEntries,
      expenditures,
    });
  };

  const handleUpdateSettings = (newSettings: HospitalSettings) => {
    setSettings(newSettings);
    saveHospitalSettings(newSettings);
  };

  // Add Supplier with Supabase
  const handleAddSupplier = (newSup: Supplier) => {
    setSuppliers((prev) => [newSup, ...prev]);
    insertSupplier(newSup);
  };

  const handleDeleteSupplier = (idx: number) => {
    const item = suppliers[idx];
    setSuppliers((prev) => prev.filter((_, i) => i !== idx));
    if (item?.id) deleteSupplier(item.id);
  };

  // Add Recipient with Supabase
  const handleAddRecipient = (newRec: Recipient) => {
    setRecipients((prev) => [newRec, ...prev]);
    insertRecipient(newRec);
  };

  const handleDeleteRecipient = (idx: number) => {
    const item = recipients[idx];
    setRecipients((prev) => prev.filter((_, i) => i !== idx));
    if (item?.id) deleteRecipient(item.id);
  };

  // Add Bank with Supabase
  const handleAddBank = (newBnk: BankMasterItem) => {
    setBanks((prev) => [newBnk, ...prev]);
    insertBankMaster(newBnk);
  };

  const handleDeleteBank = (idx: number) => {
    const item = banks[idx];
    setBanks((prev) => prev.filter((_, i) => i !== idx));
    if (item?.id) deleteBankMaster(item.id);
  };

  // Add Bill Helper (Auto syncs with GST, Expenditure, and Supabase)
  const handleAddBill = (newBill: BillEntry) => {
    const computedTotal = (newBill.billAmount || 0) + (newBill.gstAmount || 0);
    const billToAdd: BillEntry = {
      ...newBill,
      totalAmount: computedTotal,
      status: newBill.status || 'Pending',
    };

    setBills((prev) => [billToAdd, ...prev]);
    insertBill(billToAdd);

    // Sync GST Entry
    if (newBill.gstAmount && newBill.gstAmount > 0) {
      const halfGst = newBill.gstAmount / 2;
      const newGst: GSTEntry = {
        gstNo: newBill.gstNo || '07AAACA1234A1Z5',
        supplierName: newBill.supplierName,
        billNo: newBill.billNo,
        taxableAmount: newBill.billAmount,
        cgst: halfGst,
        sgst: halfGst,
        igst: 0,
        totalGst: newBill.gstAmount,
      };
      setGstEntries((prev) => [newGst, ...prev]);
      insertGSTEntry(newGst);
    }

    // Sync Expenditure Entry
    const newExp: ExpenditureEntry = {
      date: newBill.billDate,
      billNo: newBill.billNo,
      supplierName: newBill.supplierName,
      category: 'Medicines',
      amount: newBill.billAmount,
      gst: newBill.gstAmount || 0,
      total: computedTotal,
    };
    setExpenditures((prev) => [newExp, ...prev]);
    insertExpenditure(newExp);
  };

  const handleDeleteBill = (idx: number) => {
    const item = bills[idx];
    setBills((prev) => prev.filter((_, i) => i !== idx));
    if (item?.billNo) deleteBill(item.billNo);
  };

  // Add Payment Helper (Updates Bill Status to Paid + writes to Supabase)
  const handleAddPayment = (newPay: PaymentEntry) => {
    setPayments((prev) => [newPay, ...prev]);
    insertPayment(newPay);

    // Update Bill Status if bill match
    if (newPay.billNo) {
      setBills((prev) =>
        prev.map((b) => (b.billNo === newPay.billNo ? { ...b, status: 'Paid' } : b))
      );
    }
  };

  const handleDeletePayment = (idx: number) => {
    const item = payments[idx];
    setPayments((prev) => prev.filter((_, i) => i !== idx));
    if (item?.paymentNo) deletePayment(item.paymentNo);
  };

  // Add Cash Book Helper
  const handleAddCashBook = (entry: CashBookEntry) => {
    const prevBalance =
      cashBook.length > 0 ? cashBook[cashBook.length - 1].runningBalance : settings.openingCashBalance;
    const newBal = prevBalance + (entry.receiptAmount || 0) - (entry.paymentAmount || 0);
    const fullEntry: CashBookEntry = {
      ...entry,
      runningBalance: newBal,
    };
    setCashBook((prev) => [...prev, fullEntry]);
    insertCashBook(fullEntry);
  };

  const handleDeleteCashBook = (idx: number) => {
    const item = cashBook[idx];
    setCashBook((prev) => prev.filter((_, i) => i !== idx));
    if (item?.voucherNo) deleteCashBook(item.voucherNo);
  };

  // Add Petty Cash Helper
  const handleAddPettyCash = (entry: PettyCashEntry) => {
    const prevBal =
      pettyCash.length > 0
        ? pettyCash[pettyCash.length - 1].runningBalance
        : settings.openingPettyCashBalance;
    const newBal = prevBal - (entry.amount || 0);
    const fullEntry: PettyCashEntry = {
      ...entry,
      runningBalance: newBal,
    };
    setPettyCash((prev) => [...prev, fullEntry]);
    insertPettyCash(fullEntry);
  };

  const handleDeletePettyCash = (idx: number) => {
    const item = pettyCash[idx];
    setPettyCash((prev) => prev.filter((_, i) => i !== idx));
    if (item?.voucherNo) deletePettyCash(item.voucherNo);
  };

  // Add GST Helper
  const handleAddGST = (newGst: GSTEntry) => {
    setGstEntries((prev) => [newGst, ...prev]);
    insertGSTEntry(newGst);
  };

  const handleDeleteGST = (idx: number) => {
    const item = gstEntries[idx];
    setGstEntries((prev) => prev.filter((_, i) => i !== idx));
    if (item?.billNo) deleteGSTEntry(item.billNo);
  };

  // Add Expenditure Helper
  const handleAddExpenditure = (newExp: ExpenditureEntry) => {
    setExpenditures((prev) => [newExp, ...prev]);
    insertExpenditure(newExp);
  };

  const handleDeleteExpenditure = (idx: number) => {
    const item = expenditures[idx];
    setExpenditures((prev) => prev.filter((_, i) => i !== idx));
    if (item?.billNo) deleteExpenditure(item.billNo);
  };

  // Category Options
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

  // Supplier Columns Definition
  const supplierCols: ColumnDef<Supplier>[] = [
    { key: 'id', header: 'Supplier ID', type: 'text', required: true, width: '110px' },
    { key: 'name', header: 'Supplier Name', type: 'text', required: true, width: '220px' },
    { key: 'gstNo', header: 'GST Number', type: 'text', required: true, width: '160px' },
    { key: 'panNo', header: 'PAN Number', type: 'text', width: '130px' },
    { key: 'mobile', header: 'Mobile No', type: 'text', width: '120px' },
    { key: 'bankName', header: 'Bank Name', type: 'text', width: '180px' },
    { key: 'accountNo', header: 'Account Number', type: 'text', width: '160px' },
    { key: 'ifscCode', header: 'IFSC Code', type: 'text', width: '120px' },
    {
      key: 'status',
      header: 'Status',
      type: 'select',
      options: ['Active', 'Inactive'],
      width: '100px',
      render: (r) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            r.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
          }`}
        >
          {r.status}
        </span>
      ),
    },
  ];

  // Recipient Columns
  const recipientCols: ColumnDef<Recipient>[] = [
    { key: 'id', header: 'Recipient ID', type: 'text', required: true },
    { key: 'name', header: 'Recipient Name', type: 'text', required: true },
    { key: 'designation', header: 'Designation', type: 'text' },
    { key: 'department', header: 'Department', type: 'text' },
    { key: 'bankName', header: 'Bank Name', type: 'text' },
    { key: 'accountNo', header: 'Account Number', type: 'text' },
    { key: 'ifscCode', header: 'IFSC Code', type: 'text' },
    { key: 'mobile', header: 'Mobile Number', type: 'text' },
  ];

  // Bank Master Columns
  const bankCols: ColumnDef<BankMasterItem>[] = [
    { key: 'id', header: 'Bank ID', type: 'text' },
    { key: 'bankName', header: 'Bank Name', type: 'text' },
    { key: 'accountName', header: 'Account Name', type: 'text' },
    { key: 'accountNo', header: 'Account Number', type: 'text' },
    { key: 'ifscCode', header: 'IFSC Code', type: 'text' },
    { key: 'openingBalance', header: 'Opening Balance', type: 'currency' },
    { key: 'currentBalance', header: 'Current Balance', type: 'currency' },
  ];

  // Cash Book Columns
  const cashBookCols: ColumnDef<CashBookEntry>[] = [
    { key: 'voucherNo', header: 'Voucher No', type: 'text', required: true },
    { key: 'date', header: 'Date', type: 'date', required: true },
    { key: 'particulars', header: 'Particulars', type: 'text', required: true },
    { key: 'receiptAmount', header: 'Receipt (₹)', type: 'currency' },
    { key: 'paymentAmount', header: 'Payment (₹)', type: 'currency' },
    { key: 'runningBalance', header: 'Running Balance', type: 'currency' },
    { key: 'billNo', header: 'Bill No', type: 'text' },
    { key: 'supplierName', header: 'Supplier / Payee', type: 'text' },
    { key: 'remarks', header: 'Remarks', type: 'text' },
  ];

  // Petty Cash Columns
  const pettyCashCols: ColumnDef<PettyCashEntry>[] = [
    { key: 'voucherNo', header: 'Voucher No', type: 'text', required: true },
    { key: 'date', header: 'Date', type: 'date', required: true },
    { key: 'particulars', header: 'Particulars', type: 'text', required: true },
    { key: 'category', header: 'Category', type: 'select', options: categoriesList, required: true },
    { key: 'amount', header: 'Amount (₹)', type: 'currency', required: true },
    { key: 'runningBalance', header: 'Running Balance', type: 'currency' },
  ];

  // Bill Register Columns
  const billCols: ColumnDef<BillEntry>[] = [
    { key: 'billNo', header: 'Bill Number', type: 'text', required: true },
    { key: 'billDate', header: 'Bill Date', type: 'date', required: true },
    {
      key: 'supplierName',
      header: 'Supplier Name',
      type: 'select',
      options: suppliers.map((s) => s.name),
      required: true,
    },
    { key: 'supplierId', header: 'Supplier ID (Formula)', type: 'formula' },
    { key: 'gstNo', header: 'GSTIN (Formula)', type: 'formula' },
    { key: 'description', header: 'Particulars / Items', type: 'text' },
    { key: 'billAmount', header: 'Taxable Amount (₹)', type: 'currency', required: true },
    { key: 'gstAmount', header: 'GST Amount (₹)', type: 'currency' },
    { key: 'totalAmount', header: 'Total Amount (₹)', type: 'currency' },
    {
      key: 'status',
      header: 'Status',
      type: 'select',
      options: ['Pending', 'Paid', 'Partially Paid', 'Cancelled'],
      render: (r) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            r.status === 'Paid'
              ? 'bg-emerald-100 text-emerald-800'
              : r.status === 'Pending'
              ? 'bg-rose-100 text-rose-800 font-bold'
              : 'bg-amber-100 text-amber-800'
          }`}
        >
          {r.status}
        </span>
      ),
    },
  ];

  // Payment Register Columns
  const paymentCols: ColumnDef<PaymentEntry>[] = [
    { key: 'paymentNo', header: 'Payment No', type: 'text', required: true },
    { key: 'paymentDate', header: 'Payment Date', type: 'date', required: true },
    {
      key: 'supplierName',
      header: 'Supplier Name',
      type: 'select',
      options: suppliers.map((s) => s.name),
      required: true,
    },
    {
      key: 'bankName',
      header: 'Bank Name',
      type: 'select',
      options: banks.map((b) => b.bankName),
    },
    { key: 'accountNo', header: 'Account No', type: 'text' },
    { key: 'ifscCode', header: 'IFSC Code', type: 'text' },
    { key: 'utrNo', header: 'UTR / Cheque No', type: 'text', required: true },
    {
      key: 'paymentMode',
      header: 'Mode',
      type: 'select',
      options: ['NEFT', 'RTGS', 'IMPS', 'Cheque', 'Cash'],
      required: true,
    },
    {
      key: 'billNo',
      header: 'Bill Ref',
      type: 'select',
      options: bills.map((b) => b.billNo),
    },
    { key: 'amountPaid', header: 'Amount Paid (₹)', type: 'currency', required: true },
  ];

  // GST Register Columns
  const gstCols: ColumnDef<GSTEntry>[] = [
    { key: 'gstNo', header: 'GSTIN', type: 'text' },
    { key: 'supplierName', header: 'Supplier Name', type: 'text' },
    { key: 'billNo', header: 'Bill Number', type: 'text' },
    { key: 'taxableAmount', header: 'Taxable Amount (₹)', type: 'currency' },
    { key: 'cgst', header: 'CGST Amount (₹)', type: 'currency' },
    { key: 'sgst', header: 'SGST Amount (₹)', type: 'currency' },
    { key: 'igst', header: 'IGST Amount (₹)', type: 'currency' },
    { key: 'totalGst', header: 'Total GST (Formula)', type: 'formula' },
  ];

  // Expenditure Register Columns
  const expenditureCols: ColumnDef<ExpenditureEntry>[] = [
    { key: 'date', header: 'Date', type: 'date' },
    { key: 'billNo', header: 'Bill Number', type: 'text' },
    { key: 'supplierName', header: 'Supplier Name', type: 'text' },
    {
      key: 'category',
      header: 'Category Head',
      type: 'select',
      options: categoriesList,
      required: true,
    },
    { key: 'amount', header: 'Taxable Amount (₹)', type: 'currency' },
    { key: 'gst', header: 'GST Amount (₹)', type: 'currency' },
    { key: 'total', header: 'Total (Formula)', type: 'formula' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Top Header Navbar */}
      <Navbar
        settings={settings}
        onExportExcel={handleExportExcel}
        onOpenFormulasGuide={() => setIsFormulasGuideOpen(false) || setIsFormulasGuideOpen(true)}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
        onResetData={handleResetData}
        onLoadSampleData={handleLoadSampleData}
        onPrint={() => window.print()}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Sheet Selector */}
        <div className="print:hidden">
          <Sidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            counts={{
              suppliers: suppliers.length,
              recipients: recipients.length,
              pendingBills: bills.filter((b) => b.status === 'Pending').length,
              cashBook: cashBook.length,
              pettyCash: pettyCash.length,
            }}
          />
        </div>

        {/* Central Content Canvas */}
        <main className="flex-1 overflow-y-auto bg-slate-100">
          {activeTab === 'dashboard' && (
            <DashboardView
              settings={settings}
              cashBook={cashBook}
              pettyCash={pettyCash}
              bills={bills}
              suppliers={suppliers}
              expenditures={expenditures}
              gstEntries={gstEntries}
              onNavigate={setActiveTab}
              onOpenFormulas={() => setIsFormulasGuideOpen(true)}
            />
          )}

          {activeTab === 'supplier_master' && (
            <SheetTable
              title="2. Supplier Master Sheet"
              description="Master record of approved vendors, GSTIN, PAN, and Bank details for automatic lookups"
              columns={supplierCols}
              data={suppliers}
              duplicateCheckKey="gstNo"
              onAddRow={handleAddSupplier}
              onDeleteRow={handleDeleteSupplier}
              newRowDefaults={{ id: `SUP-${1000 + suppliers.length + 1}`, status: 'Active' }}
            />
          )}

          {activeTab === 'recipient_master' && (
            <SheetTable
              title="3. Recipient Master Sheet"
              description="Hospital staff, doctors, and officers directory for direct disbursements"
              columns={recipientCols}
              data={recipients}
              onAddRow={handleAddRecipient}
              onDeleteRow={handleDeleteRecipient}
              newRowDefaults={{ id: `REC-${2000 + recipients.length + 1}` }}
            />
          )}

          {activeTab === 'bank_master' && (
            <SheetTable
              title="4. Bank Master Sheet"
              description="Treasury accounts, Rogi Kalyan Samiti (RKS), and NHM grant bank balances"
              columns={bankCols}
              data={banks}
              onAddRow={handleAddBank}
              onDeleteRow={handleDeleteBank}
            />
          )}

          {activeTab === 'cash_book' && (
            <SheetTable
              title="5. Main Cash Book Sheet"
              description="Daily cash receipts (OPD fees, collections) and payments with automatic running balance formula"
              columns={cashBookCols}
              data={cashBook}
              onAddRow={handleAddCashBook}
              onDeleteRow={handleDeleteCashBook}
              newRowDefaults={{ voucherNo: `CBV-2026-00${cashBook.length + 1}`, date: new Date().toISOString().split('T')[0] }}
            />
          )}

          {activeTab === 'petty_cash_book' && (
            <SheetTable
              title="6. Petty Cash Imprest Book Sheet"
              description="Day-to-day minor hospital expenses tracking with automatic imprest balance calculation"
              columns={pettyCashCols}
              data={pettyCash}
              onAddRow={handleAddPettyCash}
              onDeleteRow={handleDeletePettyCash}
              newRowDefaults={{ voucherNo: `PCV-2026-00${pettyCash.length + 1}`, date: new Date().toISOString().split('T')[0] }}
            />
          )}

          {activeTab === 'bill_register' && (
            <SheetTable
              title="7. Vendor Bill Register Sheet"
              description="Track vendor invoice details, taxable amounts, GST, and unpaid liability status with duplicate warnings"
              columns={billCols}
              data={bills}
              duplicateCheckKey="billNo"
              onAddRow={handleAddBill}
              onDeleteRow={handleDeleteBill}
              newRowDefaults={{
                billNo: `BILL-2026-00${bills.length + 1}`,
                billDate: new Date().toISOString().split('T')[0],
                status: 'Pending',
              }}
            />
          )}

          {activeTab === 'payment_register' && (
            <SheetTable
              title="8. Payment Register Sheet"
              description="NEFT / RTGS / Cheque bank payment disbursement log linking vendor bills with UTR reference"
              columns={paymentCols}
              data={payments}
              onAddRow={handleAddPayment}
              onDeleteRow={handleDeletePayment}
              newRowDefaults={{
                paymentNo: `PAY-2026-10${payments.length + 1}`,
                paymentDate: new Date().toISOString().split('T')[0],
                paymentMode: 'NEFT',
              }}
            />
          )}

          {activeTab === 'gst_register' && (
            <SheetTable
              title="9. GST Register Sheet"
              description="Breakdown of CGST, SGST, and IGST for all hospital procurements and tax return filing"
              columns={gstCols}
              data={gstEntries}
              onAddRow={handleAddGST}
              onDeleteRow={handleDeleteGST}
            />
          )}

          {activeTab === 'expenditure_register' && (
            <SheetTable
              title="10. Expenditure Register Sheet"
              description="Categorized expenditure log (Medicines, Equipment, Lab, Cleaning, Maintenance, Stationery, etc.)"
              columns={expenditureCols}
              data={expenditures}
              onAddRow={handleAddExpenditure}
              onDeleteRow={handleDeleteExpenditure}
            />
          )}

          {activeTab === 'monthly_summary' && (
            <div className="p-6 max-w-7xl mx-auto space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">11. Monthly Summary Matrix</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Formula-calculated monthly category expenditure summary table using <code className="font-mono text-blue-600">SUMIFS</code>
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto p-4">
                <table className="w-full text-xs text-left border-collapse border border-slate-200">
                  <thead className="bg-slate-900 text-white font-bold">
                    <tr>
                      <th className="p-2 border border-slate-700">Month</th>
                      <th className="p-2 border border-slate-700 text-right">Medicines</th>
                      <th className="p-2 border border-slate-700 text-right">Equipment</th>
                      <th className="p-2 border border-slate-700 text-right">Laboratory</th>
                      <th className="p-2 border border-slate-700 text-right">Cleaning</th>
                      <th className="p-2 border border-slate-700 text-right">Stationery</th>
                      <th className="p-2 border border-slate-700 text-right">Maintenance</th>
                      <th className="p-2 border border-slate-700 text-right font-bold">Total Exp (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    {['Apr-2026', 'May-2026', 'Jun-2026', 'Jul-2026', 'Aug-2026', 'Sep-2026'].map((m) => {
                      const medExp = expenditures
                        .filter((e) => e.category === 'Medicines')
                        .reduce((a, b) => a + b.total, 0);
                      const eqExp = expenditures
                        .filter((e) => e.category === 'Medical Equipment')
                        .reduce((a, b) => a + b.total, 0);
                      const labExp = expenditures
                        .filter((e) => e.category === 'Laboratory')
                        .reduce((a, b) => a + b.total, 0);
                      const cleanExp = expenditures
                        .filter((e) => e.category === 'Cleaning Materials')
                        .reduce((a, b) => a + b.total, 0);
                      const statExp = expenditures
                        .filter((e) => e.category === 'Stationery')
                        .reduce((a, b) => a + b.total, 0);
                      const maintExp = expenditures
                        .filter((e) => e.category === 'Maintenance')
                        .reduce((a, b) => a + b.total, 0);

                      const totalM = medExp + eqExp + labExp + cleanExp + statExp + maintExp;

                      return (
                        <tr key={m} className="hover:bg-slate-50">
                          <td className="p-2 border font-sans font-bold">{m}</td>
                          <td className="p-2 border text-right">₹{medExp.toLocaleString('en-IN')}</td>
                          <td className="p-2 border text-right">₹{eqExp.toLocaleString('en-IN')}</td>
                          <td className="p-2 border text-right">₹{labExp.toLocaleString('en-IN')}</td>
                          <td className="p-2 border text-right">₹{cleanExp.toLocaleString('en-IN')}</td>
                          <td className="p-2 border text-right">₹{statExp.toLocaleString('en-IN')}</td>
                          <td className="p-2 border text-right">₹{maintExp.toLocaleString('en-IN')}</td>
                          <td className="p-2 border text-right font-bold text-blue-900 bg-blue-50/50">
                            ₹{totalM.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'annual_summary' && (
            <div className="p-6 max-w-4xl mx-auto space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">12. Annual Financial Summary</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Overall Financial Year audit statement for hospital grants and user collections
                </p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3 text-xs">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-slate-700">Financial Year:</span>
                  <span className="font-bold text-slate-900">{settings.financialYear}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-slate-700">Opening Cash Balance:</span>
                  <span className="font-mono">₹{settings.openingCashBalance.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-slate-700">Opening Bank Balance:</span>
                  <span className="font-mono">₹{settings.bankOpeningBalance.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-slate-700">Total Expenditure Disbursed:</span>
                  <span className="font-mono text-rose-700 font-bold">
                    ₹{expenditures.reduce((a, b) => a + b.total, 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-slate-700">Total GST Paid:</span>
                  <span className="font-mono text-purple-700 font-bold">
                    ₹{gstEntries.reduce((a, b) => a + b.totalGst, 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'voucher_print' && (
            <VoucherPrintView settings={settings} payments={payments} />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              settings={settings}
              cashBook={cashBook}
              pettyCash={pettyCash}
              bills={bills}
              payments={payments}
              gstEntries={gstEntries}
              expenditures={expenditures}
              suppliers={suppliers}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView settings={settings} onUpdateSettings={handleUpdateSettings} />
          )}
        </main>
      </div>

      {/* Supabase Database & SQL Setup Modal */}
      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        onDataSynced={refreshFromSupabase}
      />

      {/* Formula Architecture Inspector Modal */}
      <FormulasGuideModal
        isOpen={isFormulasGuideOpen}
        onClose={() => setIsFormulasGuideOpen(false)}
      />
    </div>
  );
}
