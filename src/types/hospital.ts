export interface HospitalSettings {
  hospitalName: string;
  departmentName: string;
  district: string;
  state: string;
  registrationNo: string;
  financialYear: string;
  openingCashBalance: number;
  openingPettyCashBalance: number;
  bankOpeningBalance: number;
  currencySymbol: string;
  medicalSuperintendent: string;
  seniorAccountant: string;
  internalAuditor: string;
}

export interface Supplier {
  id: string; // Auto-generated e.g. SUP-1001
  name: string;
  address: string;
  mobile: string;
  gstNo: string;
  panNo: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  status: 'Active' | 'Inactive';
}

export interface Recipient {
  id: string; // e.g. REC-2001
  name: string;
  designation: string;
  department: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  mobile: string;
}

export interface BankMasterItem {
  id: string; // e.g. BNK-01
  bankName: string;
  accountName: string;
  accountNo: string;
  ifscCode: string;
  branch: string;
  openingBalance: number;
  currentBalance: number;
}

export interface CashBookEntry {
  voucherNo: string; // e.g. CBV-2026-001
  date: string;
  particulars: string;
  receiptAmount: number;
  paymentAmount: number;
  runningBalance: number;
  billNo: string;
  supplierName: string;
  remarks: string;
}

export interface PettyCashEntry {
  voucherNo: string; // e.g. PCV-2026-001
  date: string;
  particulars: string;
  amount: number;
  category: ExpenditureCategory;
  runningBalance: number;
}

export interface BillEntry {
  billNo: string;
  billDate: string;
  supplierName: string;
  supplierId: string;
  gstNo: string;
  description: string;
  billAmount: number; // Taxable
  gstAmount: number;
  totalAmount: number;
  status: 'Pending' | 'Paid' | 'Partially Paid' | 'Cancelled';
}

export interface PaymentEntry {
  paymentNo: string;
  paymentDate: string;
  supplierName: string;
  recipientId: string;
  bankName: string;
  accountNo: string;
  ifscCode: string;
  utrNo: string;
  paymentMode: 'Cash' | 'Cheque' | 'NEFT' | 'RTGS' | 'IMPS';
  billNo: string;
  amountPaid: number;
}

export interface GSTEntry {
  gstNo: string;
  supplierName: string;
  billNo: string;
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
}

export type ExpenditureCategory =
  | 'Medicines'
  | 'Medical Equipment'
  | 'Laboratory'
  | 'Office Expenses'
  | 'Stationery'
  | 'Maintenance'
  | 'Vehicle'
  | 'Electricity'
  | 'Water Charges'
  | 'Cleaning Materials'
  | 'Miscellaneous';

export interface ExpenditureEntry {
  date: string;
  billNo: string;
  supplierName: string;
  category: ExpenditureCategory;
  amount: number;
  gst: number;
  total: number;
}

export interface MonthlySummaryRow {
  month: string;
  medicines: number;
  equipment: number;
  laboratory: number;
  office: number;
  stationery: number;
  maintenance: number;
  vehicle: number;
  electricity: number;
  water: number;
  cleaning: number;
  miscellaneous: number;
  totalExpenditure: number;
}

export interface AnnualSummaryItem {
  financialYear: string;
  openingBalanceTotal: number;
  totalReceipts: number;
  totalExpenditure: number;
  gstPaid: number;
  closingBalanceTotal: number;
  pendingBillsCount: number;
  pendingBillsAmount: number;
}

export interface PanDeductionRow {
  slNo: number;
  name: string; // FIRM NAME/ OFFICER/STAFF NAME
  panNo: string; // PAN NO.
  grossAmount: number; // GROSS AMOUNT
  invoiceNo: string; // INVOICE NO
  invoiceDate: string; // INVOICE DATE
  taxableAmount: number; // TAXABLE AMOUNT
  netAmount: number; // NET AMOUNT
  tdsRate?: number; // e.g. 2% or 10%
  tdsAmount?: number;
  section?: string; // e.g. 194C / 194J / 192
  type?: 'Firm / Vendor' | 'Officer / Staff';
}

export interface GstDeductionRow {
  slNo: number;
  firmName: string; // FIRM NAME
  gstNo: string; // GST NO.
  grossAmount: number; // GROSS AMOUNT
  invoiceNo: string; // INVOICE NO
  invoiceDate: string; // INVOICE DATE
  taxableAmount: number; // TAXABLE AMOUNT
  netAmount: number; // NET AMOUNT
  gstTdsRate?: number; // e.g. 2% (1% CGST + 1% SGST)
  gstTdsAmount?: number;
}

export type SheetTab =
  | 'dashboard'
  | 'supplier_master'
  | 'recipient_master'
  | 'bank_master'
  | 'cash_book'
  | 'petty_cash_book'
  | 'bill_register'
  | 'payment_register'
  | 'gst_register'
  | 'expenditure_register'
  | 'deduction_reports'
  | 'monthly_summary'
  | 'annual_summary'
  | 'voucher_print'
  | 'reports'
  | 'settings';

