// Google Sheets & Drive API integration for GHAMS
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

declare global {
  interface Window {
    google?: any;
  }
}

// OAuth Client ID
export const OAUTH_CLIENT_ID =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) ||
  "1073410467538-96vk7nra9dkuumii5je8nqp7qchb8vf6.apps.googleusercontent.com";
export const SHEETS_SCOPES = "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file";

const STORAGE_KEY_TOKEN = "ghams_google_access_token";
const STORAGE_KEY_EXPIRES = "ghams_google_token_expires";
const STORAGE_KEY_SPREADSHEET_ID = "ghams_google_spreadsheet_id";
const STORAGE_KEY_SPREADSHEET_URL = "ghams_google_spreadsheet_url";
const STORAGE_KEY_AUTO_SYNC = "ghams_google_auto_sync_enabled";
const STORAGE_KEY_AUTO_SYNC_INTERVAL = "ghams_google_auto_sync_interval";
const STORAGE_KEY_AUTO_PULL_ON_LOAD = "ghams_google_auto_pull_on_load";
const STORAGE_KEY_LAST_SYNC_TIME = "ghams_google_last_sync_time";

export interface AutoSyncConfig {
  enabled: boolean;
  interval: 'realtime' | '1m' | '5m' | '15m' | '30m';
  autoPullOnLoad: boolean;
  lastSyncTime: string | null;
}

let tokenClient: any = null;

// Retrieve auto-sync configuration
export function getAutoSyncConfig(): AutoSyncConfig {
  const enabledStored = localStorage.getItem(STORAGE_KEY_AUTO_SYNC);
  const intervalStored = localStorage.getItem(STORAGE_KEY_AUTO_SYNC_INTERVAL);
  const pullStored = localStorage.getItem(STORAGE_KEY_AUTO_PULL_ON_LOAD);
  const lastTime = localStorage.getItem(STORAGE_KEY_LAST_SYNC_TIME);

  return {
    enabled: enabledStored !== null ? enabledStored === 'true' : true,
    interval: (intervalStored as any) || 'realtime',
    autoPullOnLoad: pullStored !== null ? pullStored === 'true' : true,
    lastSyncTime: lastTime || null,
  };
}

export function saveAutoSyncConfig(config: Partial<AutoSyncConfig>): AutoSyncConfig {
  const current = getAutoSyncConfig();
  const updated: AutoSyncConfig = { ...current, ...config };

  localStorage.setItem(STORAGE_KEY_AUTO_SYNC, String(updated.enabled));
  localStorage.setItem(STORAGE_KEY_AUTO_SYNC_INTERVAL, updated.interval);
  localStorage.setItem(STORAGE_KEY_AUTO_PULL_ON_LOAD, String(updated.autoPullOnLoad));
  if (updated.lastSyncTime) {
    localStorage.setItem(STORAGE_KEY_LAST_SYNC_TIME, updated.lastSyncTime);
  }

  return updated;
}

export function recordLastSyncTime(timestamp: string = new Date().toISOString()): void {
  localStorage.setItem(STORAGE_KEY_LAST_SYNC_TIME, timestamp);
}

// Retrieve existing valid token from storage
export function getStoredAccessToken(): string | null {
  const token = localStorage.getItem(STORAGE_KEY_TOKEN);
  const expiresAt = localStorage.getItem(STORAGE_KEY_EXPIRES);
  if (!token || !expiresAt) return null;
  if (Date.now() > Number(expiresAt)) {
    localStorage.removeItem(STORAGE_KEY_TOKEN);
    localStorage.removeItem(STORAGE_KEY_EXPIRES);
    return null;
  }
  return token;
}

export function getStoredSpreadsheetInfo(): { spreadsheetId: string | null; spreadsheetUrl: string | null } {
  return {
    spreadsheetId: localStorage.getItem(STORAGE_KEY_SPREADSHEET_ID),
    spreadsheetUrl: localStorage.getItem(STORAGE_KEY_SPREADSHEET_URL),
  };
}

export function saveSpreadsheetInfo(id: string, url: string) {
  localStorage.setItem(STORAGE_KEY_SPREADSHEET_ID, id);
  localStorage.setItem(STORAGE_KEY_SPREADSHEET_URL, url);
}

export function clearGoogleSession() {
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem(STORAGE_KEY_EXPIRES);
}

// Request Google OAuth Token
export function requestGoogleAccessToken(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error("Google Identity Services script not loaded. Please refresh or check connection."));
      return;
    }

    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: OAUTH_CLIENT_ID,
      scope: SHEETS_SCOPES,
      callback: (tokenResponse: any) => {
        if (tokenResponse.error) {
          reject(new Error(tokenResponse.error_description || tokenResponse.error));
          return;
        }
        const token = tokenResponse.access_token;
        const expiresInSec = Number(tokenResponse.expires_in) || 3500;
        localStorage.setItem(STORAGE_KEY_TOKEN, token);
        localStorage.setItem(STORAGE_KEY_EXPIRES, String(Date.now() + expiresInSec * 1000));
        resolve(token);
      },
    });

    tokenClient.requestAccessToken({ prompt: "consent" });
  });
}

// Fetch Google User Profile using Access Token
export async function fetchGoogleUserProfile(token: string): Promise<{
  email: string;
  name: string;
  picture?: string;
  id?: string;
}> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    throw new Error('Failed to fetch Google profile information.');
  }
  return res.json();
}

// Standard Sheets API Helper
async function sheetsFetch(url: string, token: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));
    throw new Error(errorBody?.error?.message || `Google API Error: ${res.statusText} (${res.status})`);
  }
  return res.json();
}

// 1. Create a complete Government Hospital Accounts Workbook in Google Sheets
export async function createHospitalSpreadsheet(
  token: string,
  data: {
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
  }
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const title = `GHAMS - ${data.settings.hospitalName || 'District General Hospital'} (${data.settings.financialYear || '2026-27'})`;

  // Create spreadsheet with structured sheet tabs
  const payload = {
    properties: {
      title,
    },
    sheets: [
      { properties: { title: "Hospital Settings" } },
      { properties: { title: "1. Supplier Master" } },
      { properties: { title: "2. Recipient Master" } },
      { properties: { title: "3. Bank Master" } },
      { properties: { title: "4. Main Cash Book" } },
      { properties: { title: "5. Petty Cash Book" } },
      { properties: { title: "6. Bill Register" } },
      { properties: { title: "7. Payment Register" } },
      { properties: { title: "8. GST Register" } },
      { properties: { title: "9. Expenditure Register" } },
      { properties: { title: "10. PAN Deduction Report" } },
      { properties: { title: "11. GST Deduction Report" } },
    ],
  };

  const created = await sheetsFetch("https://sheets.googleapis.com/v4/spreadsheets", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const spreadsheetId = created.spreadsheetId;
  const spreadsheetUrl = created.spreadsheetUrl;

  saveSpreadsheetInfo(spreadsheetId, spreadsheetUrl);

  // Sync initial full dataset to newly created sheets
  await pushAllDataToSpreadsheet(token, spreadsheetId, data);

  return { spreadsheetId, spreadsheetUrl };
}

// 2. Push full application dataset to Google Sheets
export async function pushAllDataToSpreadsheet(
  token: string,
  spreadsheetId: string,
  data: {
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
  }
) {
  const valueRanges: any[] = [];

  // Settings
  valueRanges.push({
    range: "'Hospital Settings'!A1:B13",
    values: [
      ["Parameter / Field", "Configured Value"],
      ["Hospital Name", data.settings.hospitalName],
      ["Department Name", data.settings.departmentName],
      ["District", data.settings.district],
      ["State", data.settings.state],
      ["Registration No", data.settings.registrationNo],
      ["Financial Year", data.settings.financialYear],
      ["Opening Cash Balance", data.settings.openingCashBalance],
      ["Opening Petty Cash Balance", data.settings.openingPettyCashBalance],
      ["Bank Opening Balance", data.settings.bankOpeningBalance],
      ["Currency Symbol", data.settings.currencySymbol || "₹"],
      ["Medical Superintendent", data.settings.medicalSuperintendent],
      ["Senior Accounts Officer", data.settings.seniorAccountant],
      ["Internal Auditor", data.settings.internalAuditor],
    ],
  });

  // 1. Supplier Master
  const supplierRows = [
    ["Supplier ID", "Supplier / Firm Name", "Address", "Contact Mobile", "GSTIN No", "PAN No", "Bank Name", "Account Number", "IFSC Code", "Status"],
    ...data.suppliers.map((s) => [
      s.id,
      s.name,
      s.address,
      s.mobile,
      s.gstNo,
      s.panNo,
      s.bankName,
      s.accountNo,
      s.ifscCode,
      s.status,
    ]),
  ];
  valueRanges.push({ range: "'1. Supplier Master'!A1:J" + (supplierRows.length + 5), values: supplierRows });

  // 2. Recipient Master
  const recipientRows = [
    ["Recipient ID", "Officer / Doctor Name", "Designation", "Department", "Bank Name", "Account Number", "IFSC Code", "Contact Mobile"],
    ...data.recipients.map((r) => [
      r.id,
      r.name,
      r.designation,
      r.department,
      r.bankName,
      r.accountNo,
      r.ifscCode,
      r.mobile,
    ]),
  ];
  valueRanges.push({ range: "'2. Recipient Master'!A1:H" + (recipientRows.length + 5), values: recipientRows });

  // 3. Bank Master
  const bankRows = [
    ["Account ID", "Bank Name", "Account Holder Name", "Account Number", "IFSC Code", "Branch", "Opening Balance", "Current Balance"],
    ...data.banks.map((b) => [
      b.id,
      b.bankName,
      b.accountName,
      b.accountNo,
      b.ifscCode,
      b.branch,
      b.openingBalance,
      b.currentBalance,
    ]),
  ];
  valueRanges.push({ range: "'3. Bank Master'!A1:H" + (bankRows.length + 5), values: bankRows });

  // 4. Main Cash Book
  const cashRows = [
    ["Voucher No", "Date", "Particulars / Details", "Receipt Amount", "Payment Amount", "Running Balance", "Bill Ref", "Supplier Name", "Remarks"],
    ...data.cashBook.map((c) => [
      c.voucherNo,
      c.date,
      c.particulars,
      c.receiptAmount,
      c.paymentAmount,
      c.runningBalance,
      c.billNo || "",
      c.supplierName || "",
      c.remarks || "",
    ]),
  ];
  valueRanges.push({ range: "'4. Main Cash Book'!A1:I" + (cashRows.length + 5), values: cashRows });

  // 5. Petty Cash Book
  const pettyRows = [
    ["Voucher No", "Date", "Particulars / Expense Head", "Amount", "Budget Category", "Running Balance"],
    ...data.pettyCash.map((p) => [
      p.voucherNo,
      p.date,
      p.particulars,
      p.amount,
      p.category,
      p.runningBalance,
    ]),
  ];
  valueRanges.push({ range: "'5. Petty Cash Book'!A1:F" + (pettyRows.length + 5), values: pettyRows });

  // 6. Bill Register
  const billRows = [
    ["Bill No", "Bill Date", "Supplier / Vendor Name", "Supplier ID", "GSTIN No", "Description of Supply", "Bill Amount", "GST Amount", "Total Amount", "Payment Status"],
    ...data.bills.map((b) => [
      b.billNo,
      b.billDate,
      b.supplierName,
      b.supplierId || "",
      b.gstNo || "",
      b.description,
      b.billAmount,
      b.gstAmount,
      b.totalAmount,
      b.status,
    ]),
  ];
  valueRanges.push({ range: "'6. Bill Register'!A1:J" + (billRows.length + 5), values: billRows });

  // 7. Payment Register
  const paymentRows = [
    ["Payment No", "Payment Date", "Beneficiary / Supplier Name", "Recipient ID", "Bank Name", "Account Number", "IFSC Code", "UTR / Reference No", "Payment Mode", "Bill No", "Amount Paid"],
    ...data.payments.map((p) => [
      p.paymentNo,
      p.paymentDate,
      p.supplierName,
      p.recipientId || "",
      p.bankName,
      p.accountNo,
      p.ifscCode,
      p.utrNo,
      p.paymentMode,
      p.billNo || "",
      p.amountPaid,
    ]),
  ];
  valueRanges.push({ range: "'7. Payment Register'!A1:K" + (paymentRows.length + 5), values: paymentRows });

  // 8. GST Register
  const gstRows = [
    ["GSTIN No", "Supplier Name", "Bill Ref", "Taxable Amount", "CGST", "SGST", "IGST", "Total GST Amount"],
    ...data.gstEntries.map((g) => [
      g.gstNo,
      g.supplierName,
      g.billNo,
      g.taxableAmount,
      g.cgst,
      g.sgst,
      g.igst,
      g.totalGst,
    ]),
  ];
  valueRanges.push({ range: "'8. GST Register'!A1:H" + (gstRows.length + 5), values: gstRows });

  // 9. Expenditure Register
  const expRows = [
    ["Date", "Bill Ref", "Supplier Name", "Expense Category", "Base Amount", "GST", "Total Expenditure"],
    ...data.expenditures.map((e) => [
      e.date,
      e.billNo,
      e.supplierName,
      e.category,
      e.amount,
      e.gst,
      e.total,
    ]),
  ];
  valueRanges.push({ range: "'9. Expenditure Register'!A1:G" + (expRows.length + 5), values: expRows });

  // 10. PAN Deduction Report (Template 1)
  const panRows = [
    ["SL NO", "FIRM NAME/ OFFICER/STAFF NAME", "PAN NO.", "GROSS AMOUNT", "INVOICE NO", "INVOICE DATE", "TAXABLE AMOUNT", "NET AMOUNT"],
    ...data.bills.map((b, idx) => {
      const sup = data.suppliers.find((s) => s.name === b.supplierName || s.id === b.supplierId);
      const pan = sup?.panNo || (b.gstNo ? b.gstNo.substring(2, 12) : "AABCB9876D");
      const gross = b.totalAmount || (b.billAmount + b.gstAmount);
      const taxable = b.billAmount || 0;
      const tds = Math.round((taxable * 2) / 100);
      const net = gross - tds;
      return [idx + 1, b.supplierName, pan, gross, b.billNo, b.billDate, taxable, net];
    }),
  ];
  valueRanges.push({ range: "'10. PAN Deduction Report'!A1:H" + (panRows.length + 5), values: panRows });

  // 11. GST Deduction Report (Template 2)
  const gstDedRows = [
    ["SL NO", "FIRM NAME", "GST NO.", "GROSS AMOUNT", "INVOICE NO", "INVOICE DATE", "TAXABLE AMOUNT", "NET AMOUNT"],
    ...data.bills.map((b, idx) => {
      const sup = data.suppliers.find((s) => s.name === b.supplierName || s.id === b.supplierId);
      const gst = sup?.gstNo || b.gstNo || "07AABCB9876D1Z2";
      const gross = b.totalAmount || (b.billAmount + b.gstAmount);
      const taxable = b.billAmount || 0;
      const gstTds = Math.round((taxable * 2) / 100);
      const net = gross - gstTds;
      return [idx + 1, b.supplierName, gst, gross, b.billNo, b.billDate, taxable, net];
    }),
  ];
  valueRanges.push({ range: "'11. GST Deduction Report'!A1:H" + (gstDedRows.length + 5), values: gstDedRows });

  // Execute batch update values
  await sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`,
    token,
    {
      method: "POST",
      body: JSON.stringify({
        valueInputOption: "USER_ENTERED",
        data: valueRanges,
      }),
    }
  );

  recordLastSyncTime();
}

// 3. Append a single row to a specific Sheet in Google Sheets
export async function appendRowToGoogleSheet(
  token: string,
  spreadsheetId: string,
  sheetName: string,
  rowValues: any[]
) {
  return sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}:append?valueInputOption=USER_ENTERED`,
    token,
    {
      method: "POST",
      body: JSON.stringify({
        values: [rowValues],
      }),
    }
  );
}

// 4. Fetch all data from linked Google Spreadsheet
export async function pullAllDataFromSpreadsheet(token: string, spreadsheetId: string) {
  const ranges = [
    "'Hospital Settings'!A1:B15",
    "'1. Supplier Master'!A2:J100",
    "'2. Recipient Master'!A2:H100",
    "'3. Bank Master'!A2:H100",
    "'4. Main Cash Book'!A2:I100",
    "'5. Petty Cash Book'!A2:F100",
    "'6. Bill Register'!A2:J100",
    "'7. Payment Register'!A2:K100",
    "'8. GST Register'!A2:H100",
    "'9. Expenditure Register'!A2:G100",
  ];

  const rangesQuery = ranges.map((r) => `ranges=${encodeURIComponent(r)}`).join("&");
  const result = await sheetsFetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${rangesQuery}`,
    token
  );

  const valueRanges = result.valueRanges || [];

  // Parse Suppliers
  const rawSuppliers = valueRanges[1]?.values || [];
  const parsedSuppliers: Supplier[] = rawSuppliers.map((row: any[], index: number) => ({
    id: row[0] || `SUP-${1001 + index}`,
    name: row[1] || `Vendor ${index + 1}`,
    address: row[2] || '',
    mobile: row[3] || '',
    gstNo: row[4] || '',
    panNo: row[5] || '',
    bankName: row[6] || '',
    accountNo: row[7] || '',
    ifscCode: row[8] || '',
    status: (row[9] as 'Active' | 'Inactive') || 'Active',
  }));

  // Parse Recipients
  const rawRecipients = valueRanges[2]?.values || [];
  const parsedRecipients: Recipient[] = rawRecipients.map((row: any[], index: number) => ({
    id: row[0] || `REC-${2001 + index}`,
    name: row[1] || `Officer ${index + 1}`,
    designation: row[2] || '',
    department: row[3] || '',
    bankName: row[4] || '',
    accountNo: row[5] || '',
    ifscCode: row[6] || '',
    mobile: row[7] || '',
  }));

  // Parse Banks
  const rawBanks = valueRanges[3]?.values || [];
  const parsedBanks: BankMasterItem[] = rawBanks.map((row: any[], index: number) => ({
    id: row[0] || `BANK-0${index + 1}`,
    bankName: row[1] || 'State Bank of India',
    accountName: row[2] || '',
    accountNo: row[3] || '',
    ifscCode: row[4] || '',
    branch: row[5] || '',
    openingBalance: Number(String(row[6]).replace(/[^0-9.-]+/g, '')) || 0,
    currentBalance: Number(String(row[7]).replace(/[^0-9.-]+/g, '')) || 0,
  }));

  // Parse Cash Book
  const rawCash = valueRanges[4]?.values || [];
  const parsedCash: CashBookEntry[] = rawCash.map((row: any[]) => ({
    voucherNo: row[0] || '',
    date: row[1] || '',
    particulars: row[2] || '',
    receiptAmount: Number(String(row[3]).replace(/[^0-9.-]+/g, '')) || 0,
    paymentAmount: Number(String(row[4]).replace(/[^0-9.-]+/g, '')) || 0,
    runningBalance: Number(String(row[5]).replace(/[^0-9.-]+/g, '')) || 0,
    billNo: row[6] || '',
    supplierName: row[7] || '',
    remarks: row[8] || '',
  }));

  // Parse Petty Cash
  const rawPetty = valueRanges[5]?.values || [];
  const parsedPetty: PettyCashEntry[] = rawPetty.map((row: any[]) => ({
    voucherNo: row[0] || '',
    date: row[1] || '',
    particulars: row[2] || '',
    amount: Number(String(row[3]).replace(/[^0-9.-]+/g, '')) || 0,
    category: row[4] || 'Miscellaneous',
    runningBalance: Number(String(row[5]).replace(/[^0-9.-]+/g, '')) || 0,
  }));

  // Parse Bills
  const rawBills = valueRanges[6]?.values || [];
  const parsedBills: BillEntry[] = rawBills.map((row: any[]) => ({
    billNo: row[0] || '',
    billDate: row[1] || '',
    supplierName: row[2] || '',
    supplierId: row[3] || '',
    gstNo: row[4] || '',
    description: row[5] || '',
    billAmount: Number(String(row[6]).replace(/[^0-9.-]+/g, '')) || 0,
    gstAmount: Number(String(row[7]).replace(/[^0-9.-]+/g, '')) || 0,
    totalAmount: Number(String(row[8]).replace(/[^0-9.-]+/g, '')) || 0,
    status: (row[9] as 'Pending' | 'Paid' | 'Partially Paid' | 'Cancelled') || 'Pending',
  }));

  // Parse Payments
  const rawPayments = valueRanges[7]?.values || [];
  const parsedPayments: PaymentEntry[] = rawPayments.map((row: any[]) => ({
    paymentNo: row[0] || '',
    paymentDate: row[1] || '',
    supplierName: row[2] || '',
    recipientId: row[3] || '',
    bankName: row[4] || '',
    accountNo: row[5] || '',
    ifscCode: row[6] || '',
    utrNo: row[7] || '',
    paymentMode: (row[8] as any) || 'NEFT',
    billNo: row[9] || '',
    amountPaid: Number(String(row[10]).replace(/[^0-9.-]+/g, '')) || 0,
  }));

  // Parse GST
  const rawGST = valueRanges[8]?.values || [];
  const parsedGST: GSTEntry[] = rawGST.map((row: any[]) => ({
    gstNo: row[0] || '',
    supplierName: row[1] || '',
    billNo: row[2] || '',
    taxableAmount: Number(String(row[3]).replace(/[^0-9.-]+/g, '')) || 0,
    cgst: Number(String(row[4]).replace(/[^0-9.-]+/g, '')) || 0,
    sgst: Number(String(row[5]).replace(/[^0-9.-]+/g, '')) || 0,
    igst: Number(String(row[6]).replace(/[^0-9.-]+/g, '')) || 0,
    totalGst: Number(String(row[7]).replace(/[^0-9.-]+/g, '')) || 0,
  }));

  // Parse Expenditures
  const rawExp = valueRanges[9]?.values || [];
  const parsedExp: ExpenditureEntry[] = rawExp.map((row: any[]) => ({
    date: row[0] || '',
    billNo: row[1] || '',
    supplierName: row[2] || '',
    category: row[3] || 'Medicines',
    amount: Number(String(row[4]).replace(/[^0-9.-]+/g, '')) || 0,
    gst: Number(String(row[5]).replace(/[^0-9.-]+/g, '')) || 0,
    total: Number(String(row[6]).replace(/[^0-9.-]+/g, '')) || 0,
  }));

  recordLastSyncTime();

  return {
    suppliers: parsedSuppliers.length ? parsedSuppliers : null,
    recipients: parsedRecipients.length ? parsedRecipients : null,
    banks: parsedBanks.length ? parsedBanks : null,
    cashBook: parsedCash.length ? parsedCash : null,
    pettyCash: parsedPetty.length ? parsedPetty : null,
    bills: parsedBills.length ? parsedBills : null,
    payments: parsedPayments.length ? parsedPayments : null,
    gstEntries: parsedGST.length ? parsedGST : null,
    expenditures: parsedExp.length ? parsedExp : null,
  };
}
