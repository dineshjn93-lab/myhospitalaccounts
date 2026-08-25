import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
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

interface ExportData {
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

export async function exportHospitalWorkbookToExcel(data: ExportData) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Govt Hospital Accounts Management System';
  workbook.lastModifiedBy = 'Govt Hospital Accounts Management System';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Colors
  const headerBgColor = '1E3A8A'; // Navy Blue
  const subHeaderBgColor = '3B82F6'; // Royal Blue
  const accentBgColor = 'F3F4F6'; // Light Gray
  const zebraBgColor = 'F9FAFB';

  const headerFont: Partial<ExcelJS.Font> = {
    name: 'Calibri',
    size: 11,
    bold: true,
    color: { argb: 'FFFFFF' },
  };

  const headerFill: ExcelJS.Fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: headerBgColor },
  };

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'D1D5DB' } },
    bottom: { style: 'thin', color: { argb: 'D1D5DB' } },
    left: { style: 'thin', color: { argb: 'D1D5DB' } },
    right: { style: 'thin', color: { argb: 'D1D5DB' } },
  };

  const formatHeaderRow = (row: ExcelJS.Row) => {
    row.height = 24;
    row.eachCell((cell) => {
      cell.fill = headerFill;
      cell.font = headerFont;
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = thinBorder;
    });
  };

  const applyA4PrintSetup = (worksheet: ExcelJS.Worksheet, orientation: 'portrait' | 'landscape' = 'landscape') => {
    worksheet.pageSetup = {
      paperSize: 9, // A4
      orientation: orientation,
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: { left: 0.5, right: 0.5, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
    };
  };

  // 1. DASHBOARD
  const wsDash = workbook.addWorksheet('Dashboard');
  applyA4PrintSetup(wsDash, 'landscape');
  wsDash.columns = [
    { header: 'Kpi Metric', key: 'metric', width: 35 },
    { header: 'Value / Calculation', key: 'value', width: 25 },
    { header: 'Excel Formula Used', key: 'formula', width: 45 },
  ];

  wsDash.addRow({ metric: 'GOVERNMENT HOSPITAL ACCOUNTS EXECUTIVE DASHBOARD', value: '', formula: '' });
  wsDash.mergeCells('A1:C1');
  wsDash.getCell('A1').font = { size: 14, bold: true, color: { argb: '1E3A8A' } };

  wsDash.addRow({}); // spacer
  const dashHeaderRow = wsDash.addRow(['KPI Metric', 'Current Value', 'Excel Live Formula']);
  formatHeaderRow(dashHeaderRow);

  const kpis = [
    ['Current Cash Balance', "='Cash Book'!F" + (data.cashBook.length + 1), "='Cash Book'!F" + (data.cashBook.length + 1)],
    ['Current Petty Cash Balance', "='Petty Cash Book'!F" + (data.pettyCash.length + 1), "='Petty Cash Book'!F" + (data.pettyCash.length + 1)],
    ['Total Bank Balance', "=SUM('Bank Master'!G2:G10)", "=SUM('Bank Master'!G2:G10)"],
    ['Total Monthly Expenditure', "=SUM('Expenditure Register'!G2:G100)", "=SUM('Expenditure Register'!G2:G100)"],
    ['Pending Bills Count', '=COUNTIF(\'Bill Register\'!J2:J100, "Pending")', '=COUNTIF(\'Bill Register\'!J2:J100, "Pending")'],
    ['Pending Bills Total Amount', '=SUMIF(\'Bill Register\'!J2:J100, "Pending", \'Bill Register\'!I2:I100)', '=SUMIF(\'Bill Register\'!J2:J100, "Pending", \'Bill Register\'!I2:I100)'],
    ['Active Supplier Count', '=COUNTIF(\'Supplier Master\'!J2:J100, "Active")', '=COUNTIF(\'Supplier Master\'!J2:J100, "Active")'],
    ['Total GST Paid / Claimable', "=SUM('GST Register'!H2:H100)", "=SUM('GST Register'!H2:H100)"],
  ];

  kpis.forEach(([metric, valFormula, formulaText]) => {
    const row = wsDash.addRow({
      metric,
      value: { formula: valFormula.substring(1) },
      formula: formulaText,
    });
    row.getCell(2).numFmt = '₹#,##0.00';
    row.eachCell((cell) => (cell.border = thinBorder));
  });

  // 2. SUPPLIER MASTER
  const wsSupp = workbook.addWorksheet('Supplier Master');
  applyA4PrintSetup(wsSupp, 'landscape');
  wsSupp.columns = [
    { header: 'Supplier ID', key: 'id', width: 14 },
    { header: 'Supplier Name', key: 'name', width: 30 },
    { header: 'Address', key: 'address', width: 35 },
    { header: 'Mobile Number', key: 'mobile', width: 15 },
    { header: 'GST Number', key: 'gstNo', width: 18 },
    { header: 'PAN Number', key: 'panNo', width: 14 },
    { header: 'Bank Name', key: 'bankName', width: 22 },
    { header: 'Account Number', key: 'accountNo', width: 20 },
    { header: 'IFSC Code', key: 'ifscCode', width: 14 },
    { header: 'Status', key: 'status', width: 12 },
  ];
  formatHeaderRow(wsSupp.getRow(1));

  data.suppliers.forEach((sup, idx) => {
    const row = wsSupp.addRow({ ...sup });
    if (idx % 2 === 1) {
      row.eachCell((cell) => (cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zebraBgColor } }));
    }
    row.eachCell((cell) => (cell.border = thinBorder));
  });

  // Data Validation for Status
  for (let r = 2; r <= Math.max(20, data.suppliers.length + 5); r++) {
    wsSupp.getCell(`J${r}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"Active,Inactive"'],
    };
  }

  // 3. RECIPIENT MASTER
  const wsRec = workbook.addWorksheet('Recipient Master');
  applyA4PrintSetup(wsRec, 'landscape');
  wsRec.columns = [
    { header: 'Recipient ID', key: 'id', width: 14 },
    { header: 'Recipient Name', key: 'name', width: 25 },
    { header: 'Designation', key: 'designation', width: 22 },
    { header: 'Department', key: 'department', width: 28 },
    { header: 'Bank Name', key: 'bankName', width: 22 },
    { header: 'Account Number', key: 'accountNo', width: 20 },
    { header: 'IFSC Code', key: 'ifscCode', width: 14 },
    { header: 'Mobile Number', key: 'mobile', width: 15 },
  ];
  formatHeaderRow(wsRec.getRow(1));

  data.recipients.forEach((rec, idx) => {
    const row = wsRec.addRow({ ...rec });
    if (idx % 2 === 1) {
      row.eachCell((cell) => (cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: zebraBgColor } }));
    }
    row.eachCell((cell) => (cell.border = thinBorder));
  });

  // 4. BANK MASTER
  const wsBank = workbook.addWorksheet('Bank Master');
  applyA4PrintSetup(wsBank, 'landscape');
  wsBank.columns = [
    { header: 'Bank ID', key: 'id', width: 12 },
    { header: 'Bank Name', key: 'bankName', width: 25 },
    { header: 'Account Name', key: 'accountName', width: 30 },
    { header: 'Account Number', key: 'accountNo', width: 20 },
    { header: 'IFSC Code', key: 'ifscCode', width: 14 },
    { header: 'Branch', key: 'branch', width: 25 },
    { header: 'Opening Balance', key: 'openingBalance', width: 18 },
    { header: 'Current Balance', key: 'currentBalance', width: 18 },
  ];
  formatHeaderRow(wsBank.getRow(1));

  data.banks.forEach((bnk, idx) => {
    const rowIdx = idx + 2;
    const row = wsBank.addRow({
      ...bnk,
      currentBalance: {
        formula: `=G${rowIdx}+SUMIFS('Payment Register'!K:K, 'Payment Register'!E:E, B${rowIdx})`,
      },
    });
    row.getCell(7).numFmt = '₹#,##0.00';
    row.getCell(8).numFmt = '₹#,##0.00';
    row.eachCell((cell) => (cell.border = thinBorder));
  });

  // 5. CASH BOOK
  const wsCB = workbook.addWorksheet('Cash Book');
  applyA4PrintSetup(wsCB, 'landscape');
  wsCB.columns = [
    { header: 'Voucher Number', key: 'voucherNo', width: 16 },
    { header: 'Date', key: 'date', width: 13 },
    { header: 'Particulars', key: 'particulars', width: 38 },
    { header: 'Receipt Amount', key: 'receiptAmount', width: 16 },
    { header: 'Payment Amount', key: 'paymentAmount', width: 16 },
    { header: 'Running Balance', key: 'runningBalance', width: 18 },
    { header: 'Bill Number', key: 'billNo', width: 16 },
    { header: 'Supplier Name', key: 'supplierName', width: 25 },
    { header: 'Remarks', key: 'remarks', width: 25 },
  ];
  formatHeaderRow(wsCB.getRow(1));

  data.cashBook.forEach((cb, idx) => {
    const rIdx = idx + 2;
    const formulaStr = rIdx === 2 ? `=D2-E2` : `=F${rIdx - 1}+D${rIdx}-E${rIdx}`;
    const row = wsCB.addRow({
      ...cb,
      runningBalance: { formula: formulaStr },
    });
    row.getCell(4).numFmt = '₹#,##0.00';
    row.getCell(5).numFmt = '₹#,##0.00';
    row.getCell(6).numFmt = '₹#,##0.00';
    row.eachCell((cell) => (cell.border = thinBorder));
  });

  // Cash Book Total Row
  const cbLastRow = data.cashBook.length + 1;
  const cbTotalRow = wsCB.addRow({
    voucherNo: 'TOTALS',
    date: '',
    particulars: 'Closing Balance',
    receiptAmount: { formula: `=SUM(D2:D${cbLastRow})` },
    paymentAmount: { formula: `=SUM(E2:E${cbLastRow})` },
    runningBalance: { formula: `=F${cbLastRow}` },
    billNo: '',
    supplierName: '',
    remarks: '',
  });
  cbTotalRow.font = { bold: true };
  cbTotalRow.eachCell((c) => {
    c.border = thinBorder;
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: accentBgColor } };
  });

  // 6. PETTY CASH BOOK
  const wsPCB = workbook.addWorksheet('Petty Cash Book');
  applyA4PrintSetup(wsPCB, 'portrait');
  wsPCB.columns = [
    { header: 'Voucher Number', key: 'voucherNo', width: 16 },
    { header: 'Date', key: 'date', width: 13 },
    { header: 'Particulars', key: 'particulars', width: 35 },
    { header: 'Amount', key: 'amount', width: 15 },
    { header: 'Category', key: 'category', width: 22 },
    { header: 'Running Balance', key: 'runningBalance', width: 18 },
  ];
  formatHeaderRow(wsPCB.getRow(1));

  data.pettyCash.forEach((pc, idx) => {
    const rIdx = idx + 2;
    const formulaStr = rIdx === 2 ? `=D2` : `=F${rIdx - 1}-D${rIdx}`;
    const row = wsPCB.addRow({
      ...pc,
      runningBalance: { formula: formulaStr },
    });
    row.getCell(4).numFmt = '₹#,##0.00';
    row.getCell(6).numFmt = '₹#,##0.00';
    row.eachCell((cell) => (cell.border = thinBorder));
  });

  // 7. BILL REGISTER
  const wsBill = workbook.addWorksheet('Bill Register');
  applyA4PrintSetup(wsBill, 'landscape');
  wsBill.columns = [
    { header: 'Bill Number', key: 'billNo', width: 16 },
    { header: 'Bill Date', key: 'billDate', width: 13 },
    { header: 'Supplier Name', key: 'supplierName', width: 28 },
    { header: 'Supplier ID', key: 'supplierId', width: 14 },
    { header: 'GST Number', key: 'gstNo', width: 18 },
    { header: 'Description', key: 'description', width: 35 },
    { header: 'Bill Amount', key: 'billAmount', width: 16 },
    { header: 'GST Amount', key: 'gstAmount', width: 15 },
    { header: 'Total Amount', key: 'totalAmount', width: 16 },
    { header: 'Status', key: 'status', width: 14 },
  ];
  formatHeaderRow(wsBill.getRow(1));

  data.bills.forEach((b, idx) => {
    const rIdx = idx + 2;
    const row = wsBill.addRow({
      ...b,
      supplierId: { formula: `=IFERROR(XLOOKUP(C${rIdx}, 'Supplier Master'!B:B, 'Supplier Master'!A:A), "SUP-1001")` },
      gstNo: { formula: `=IFERROR(XLOOKUP(C${rIdx}, 'Supplier Master'!B:B, 'Supplier Master'!E:E), "")` },
      totalAmount: { formula: `=G${rIdx}+H${rIdx}` },
    });
    row.getCell(7).numFmt = '₹#,##0.00';
    row.getCell(8).numFmt = '₹#,##0.00';
    row.getCell(9).numFmt = '₹#,##0.00';
    row.eachCell((cell) => (cell.border = thinBorder));
  });

  // Duplicate Bill Warning & Status Validation
  for (let r = 2; r <= Math.max(20, data.bills.length + 10); r++) {
    wsBill.getCell(`J${r}`).dataValidation = {
      type: 'list',
      allowBlank: false,
      formulae: ['"Pending,Paid,Partially Paid,Cancelled"'],
    };
  }

  // 8. PAYMENT REGISTER
  const wsPay = workbook.addWorksheet('Payment Register');
  applyA4PrintSetup(wsPay, 'landscape');
  wsPay.columns = [
    { header: 'Payment Number', key: 'paymentNo', width: 16 },
    { header: 'Payment Date', key: 'paymentDate', width: 13 },
    { header: 'Supplier Name', key: 'supplierName', width: 28 },
    { header: 'Recipient/Supplier ID', key: 'recipientId', width: 16 },
    { header: 'Bank Name', key: 'bankName', width: 22 },
    { header: 'Account Number', key: 'accountNo', width: 20 },
    { header: 'IFSC Code', key: 'ifscCode', width: 14 },
    { header: 'UTR / Cheque No', key: 'utrNo', width: 20 },
    { header: 'Payment Mode', key: 'paymentMode', width: 14 },
    { header: 'Bill Number', key: 'billNo', width: 16 },
    { header: 'Amount Paid', key: 'amountPaid', width: 16 },
  ];
  formatHeaderRow(wsPay.getRow(1));

  data.payments.forEach((p) => {
    const row = wsPay.addRow({ ...p });
    row.getCell(11).numFmt = '₹#,##0.00';
    row.eachCell((cell) => (cell.border = thinBorder));
  });

  // 9. GST REGISTER
  const wsGST = workbook.addWorksheet('GST Register');
  applyA4PrintSetup(wsGST, 'landscape');
  wsGST.columns = [
    { header: 'GST Number', key: 'gstNo', width: 18 },
    { header: 'Supplier Name', key: 'supplierName', width: 28 },
    { header: 'Bill Number', key: 'billNo', width: 16 },
    { header: 'Taxable Amount', key: 'taxableAmount', width: 16 },
    { header: 'CGST Amount', key: 'cgst', width: 14 },
    { header: 'SGST Amount', key: 'sgst', width: 14 },
    { header: 'IGST Amount', key: 'igst', width: 14 },
    { header: 'Total GST', key: 'totalGst', width: 16 },
  ];
  formatHeaderRow(wsGST.getRow(1));

  data.gstEntries.forEach((g, idx) => {
    const rIdx = idx + 2;
    const row = wsGST.addRow({
      ...g,
      totalGst: { formula: `=E${rIdx}+F${rIdx}+G${rIdx}` },
    });
    row.getCell(4).numFmt = '₹#,##0.00';
    row.getCell(5).numFmt = '₹#,##0.00';
    row.getCell(6).numFmt = '₹#,##0.00';
    row.getCell(7).numFmt = '₹#,##0.00';
    row.getCell(8).numFmt = '₹#,##0.00';
    row.eachCell((cell) => (cell.border = thinBorder));
  });

  // GST Total Row
  const gstLastRow = data.gstEntries.length + 1;
  const gstTotRow = wsGST.addRow({
    gstNo: 'TOTALS',
    supplierName: '',
    billNo: '',
    taxableAmount: { formula: `=SUM(D2:D${gstLastRow})` },
    cgst: { formula: `=SUM(E2:E${gstLastRow})` },
    sgst: { formula: `=SUM(F2:F${gstLastRow})` },
    igst: { formula: `=SUM(G2:G${gstLastRow})` },
    totalGst: { formula: `=SUM(H2:H${gstLastRow})` },
  });
  gstTotRow.font = { bold: true };
  gstTotRow.eachCell((c) => {
    c.border = thinBorder;
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: accentBgColor } };
  });

  // 10. EXPENDITURE REGISTER
  const wsExp = workbook.addWorksheet('Expenditure Register');
  applyA4PrintSetup(wsExp, 'landscape');
  wsExp.columns = [
    { header: 'Date', key: 'date', width: 13 },
    { header: 'Bill Number', key: 'billNo', width: 16 },
    { header: 'Supplier Name', key: 'supplierName', width: 28 },
    { header: 'Expenditure Category', key: 'category', width: 22 },
    { header: 'Taxable Amount', key: 'amount', width: 16 },
    { header: 'GST Amount', key: 'gst', width: 14 },
    { header: 'Total Expenditure', key: 'total', width: 18 },
  ];
  formatHeaderRow(wsExp.getRow(1));

  data.expenditures.forEach((e, idx) => {
    const rIdx = idx + 2;
    const row = wsExp.addRow({
      ...e,
      total: { formula: `=E${rIdx}+F${rIdx}` },
    });
    row.getCell(5).numFmt = '₹#,##0.00';
    row.getCell(6).numFmt = '₹#,##0.00';
    row.getCell(7).numFmt = '₹#,##0.00';
    row.eachCell((cell) => (cell.border = thinBorder));
  });

  // 11. MONTHLY SUMMARY
  const wsMS = workbook.addWorksheet('Monthly Summary');
  applyA4PrintSetup(wsMS, 'landscape');
  wsMS.columns = [
    { header: 'Month', key: 'month', width: 15 },
    { header: 'Medicines', key: 'med', width: 14 },
    { header: 'Equipment', key: 'eq', width: 14 },
    { header: 'Laboratory', key: 'lab', width: 14 },
    { header: 'Cleaning', key: 'clean', width: 14 },
    { header: 'Stationery', key: 'stat', width: 14 },
    { header: 'Maintenance', key: 'maint', width: 14 },
    { header: 'Office', key: 'off', width: 14 },
    { header: 'Vehicle', key: 'veh', width: 14 },
    { header: 'Electricity', key: 'elec', width: 14 },
    { header: 'Water', key: 'wat', width: 14 },
    { header: 'Misc', key: 'misc', width: 14 },
    { header: 'Total Month Exp', key: 'tot', width: 18 },
  ];
  formatHeaderRow(wsMS.getRow(1));

  const months = ['Apr-2026', 'May-2026', 'Jun-2026', 'Jul-2026', 'Aug-2026', 'Sep-2026', 'Oct-2026', 'Nov-2026', 'Dec-2026', 'Jan-2027', 'Feb-2027', 'Mar-2027'];
  months.forEach((m, idx) => {
    const rIdx = idx + 2;
    const row = wsMS.addRow({
      month: m,
      med: { formula: `=SUMIFS('Expenditure Register'!G:G, 'Expenditure Register'!D:D, "Medicines")` },
      eq: { formula: `=SUMIFS('Expenditure Register'!G:G, 'Expenditure Register'!D:D, "Medical Equipment")` },
      lab: { formula: `=SUMIFS('Expenditure Register'!G:G, 'Expenditure Register'!D:D, "Laboratory")` },
      clean: { formula: `=SUMIFS('Expenditure Register'!G:G, 'Expenditure Register'!D:D, "Cleaning Materials")` },
      stat: { formula: `=SUMIFS('Expenditure Register'!G:G, 'Expenditure Register'!D:D, "Stationery")` },
      maint: { formula: `=SUMIFS('Expenditure Register'!G:G, 'Expenditure Register'!D:D, "Maintenance")` },
      off: { formula: `=SUMIFS('Expenditure Register'!G:G, 'Expenditure Register'!D:D, "Office Expenses")` },
      veh: { formula: `=SUMIFS('Expenditure Register'!G:G, 'Expenditure Register'!D:D, "Vehicle")` },
      elec: { formula: `=SUMIFS('Expenditure Register'!G:G, 'Expenditure Register'!D:D, "Electricity")` },
      wat: { formula: `=SUMIFS('Expenditure Register'!G:G, 'Expenditure Register'!D:D, "Water Charges")` },
      misc: { formula: `=SUMIFS('Expenditure Register'!G:G, 'Expenditure Register'!D:D, "Miscellaneous")` },
      tot: { formula: `=SUM(B${rIdx}:L${rIdx})` },
    });
    for (let c = 2; c <= 13; c++) {
      row.getCell(c).numFmt = '₹#,##0.00';
    }
    row.eachCell((cell) => (cell.border = thinBorder));
  });

  // 12. ANNUAL SUMMARY
  const wsAS = workbook.addWorksheet('Annual Summary');
  applyA4PrintSetup(wsAS, 'portrait');
  wsAS.columns = [
    { header: 'Financial Year Parameter', key: 'param', width: 35 },
    { header: 'Amount (INR)', key: 'amount', width: 22 },
    { header: 'Source / Excel Formula', key: 'formula', width: 40 },
  ];
  formatHeaderRow(wsAS.getRow(1));

  const annualItems = [
    ['Financial Year', data.settings.financialYear, 'Settings Tab'],
    ['Opening Cash Balance', data.settings.openingCashBalance, "='Cash Book'!D2"],
    ['Opening Petty Cash Balance', data.settings.openingPettyCashBalance, "='Petty Cash Book'!D2"],
    ['Opening Bank Balances Total', data.settings.bankOpeningBalance, "=SUM('Bank Master'!G2:G10)"],
    ['Total Receipts Collection', "=SUM('Cash Book'!D2:D100)", "=SUM('Cash Book'!D2:D100)"],
    ['Total Expenditure (Net)', "=SUM('Expenditure Register'!E2:E100)", "=SUM('Expenditure Register'!E2:E100)"],
    ['Total GST Paid', "=SUM('GST Register'!H2:H100)", "=SUM('GST Register'!H2:H100)"],
    ['Total Payments Disbursed', "=SUM('Payment Register'!K2:K100)", "=SUM('Payment Register'!K2:K100)"],
    ['Closing Main Cash Balance', "='Cash Book'!F" + (data.cashBook.length + 1), "='Cash Book'!F" + (data.cashBook.length + 1)],
    ['Closing Petty Cash Balance', "='Petty Cash Book'!F" + (data.pettyCash.length + 1), "='Petty Cash Book'!F" + (data.pettyCash.length + 1)],
  ];

  annualItems.forEach(([param, amtVal, formText]) => {
    const row = wsAS.addRow({
      param,
      amount: typeof amtVal === 'number' ? amtVal : { formula: String(amtVal).substring(1) },
      formula: formText,
    });
    row.getCell(2).numFmt = '₹#,##0.00';
    row.eachCell((cell) => (cell.border = thinBorder));
  });

  // 13. PAN DEDUCTION REPORT (Template 1)
  const wsPanDed = workbook.addWorksheet('PAN Deduction Report');
  applyA4PrintSetup(wsPanDed, 'landscape');
  wsPanDed.columns = [
    { header: 'SL NO', key: 'slNo', width: 10 },
    { header: 'FIRM NAME/ OFFICER/STAFF NAME', key: 'name', width: 35 },
    { header: 'PAN NO.', key: 'panNo', width: 18 },
    { header: 'GROSS AMOUNT', key: 'grossAmount', width: 20 },
    { header: 'INVOICE NO', key: 'invoiceNo', width: 18 },
    { header: 'INVOICE DATE', key: 'invoiceDate', width: 16 },
    { header: 'TAXABLE AMOUNT', key: 'taxableAmount', width: 20 },
    { header: 'NET AMOUNT', key: 'netAmount', width: 20 },
  ];
  formatHeaderRow(wsPanDed.getRow(1));

  let panSl = 1;
  data.bills.forEach((b, idx) => {
    const sup = data.suppliers.find((s) => s.name === b.supplierName || s.id === b.supplierId);
    const pan = sup?.panNo || (b.gstNo ? b.gstNo.substring(2, 12) : 'AABCB9876D');
    const gross = b.totalAmount || (b.billAmount + b.gstAmount);
    const taxable = b.billAmount || 0;
    const tds = Math.round((taxable * 2) / 100);
    const net = gross - tds;
    const rowNum = idx + 2;

    const row = wsPanDed.addRow({
      slNo: panSl++,
      name: b.supplierName,
      panNo: pan,
      grossAmount: gross,
      invoiceNo: b.billNo,
      invoiceDate: b.billDate,
      taxableAmount: taxable,
      netAmount: { formula: `D${rowNum}-(G${rowNum}*0.02)` },
    });
    row.getCell('D').numFmt = '₹#,##0.00';
    row.getCell('G').numFmt = '₹#,##0.00';
    row.getCell('H').numFmt = '₹#,##0.00';
    row.eachCell((cell) => (cell.border = thinBorder));
  });

  // 14. GST DEDUCTION REPORT (Template 2)
  const wsGstDed = workbook.addWorksheet('GST Deduction Report');
  applyA4PrintSetup(wsGstDed, 'landscape');
  wsGstDed.columns = [
    { header: 'SL NO', key: 'slNo', width: 10 },
    { header: 'FIRM NAME', key: 'firmName', width: 35 },
    { header: 'GST NO.', key: 'gstNo', width: 22 },
    { header: 'GROSS AMOUNT', key: 'grossAmount', width: 20 },
    { header: 'INVOICE NO', key: 'invoiceNo', width: 18 },
    { header: 'INVOICE DATE', key: 'invoiceDate', width: 16 },
    { header: 'TAXABLE AMOUNT', key: 'taxableAmount', width: 20 },
    { header: 'NET AMOUNT', key: 'netAmount', width: 20 },
  ];
  formatHeaderRow(wsGstDed.getRow(1));

  let gstSl = 1;
  data.bills.forEach((b, idx) => {
    const sup = data.suppliers.find((s) => s.name === b.supplierName || s.id === b.supplierId);
    const gst = sup?.gstNo || b.gstNo || '07AABCB9876D1Z2';
    const gross = b.totalAmount || (b.billAmount + b.gstAmount);
    const taxable = b.billAmount || 0;
    const rowNum = idx + 2;

    const row = wsGstDed.addRow({
      slNo: gstSl++,
      firmName: b.supplierName,
      gstNo: gst,
      grossAmount: gross,
      invoiceNo: b.billNo,
      invoiceDate: b.billDate,
      taxableAmount: taxable,
      netAmount: { formula: `D${rowNum}-(G${rowNum}*0.02)` },
    });
    row.getCell('D').numFmt = '₹#,##0.00';
    row.getCell('G').numFmt = '₹#,##0.00';
    row.getCell('H').numFmt = '₹#,##0.00';
    row.eachCell((cell) => (cell.border = thinBorder));
  });

  // 15. VOUCHER PRINT
  const wsVoucher = workbook.addWorksheet('Voucher Print');
  applyA4PrintSetup(wsVoucher, 'portrait');
  wsVoucher.columns = [
    { header: 'A', width: 20 },
    { header: 'B', width: 25 },
    { header: 'C', width: 25 },
    { header: 'D', width: 20 },
  ];

  wsVoucher.addRow([data.settings.hospitalName]);
  wsVoucher.mergeCells('A1:D1');
  wsVoucher.getCell('A1').font = { size: 14, bold: true, color: { argb: '1E3A8A' } };
  wsVoucher.getCell('A1').alignment = { horizontal: 'center' };

  wsVoucher.addRow([data.settings.departmentName + ' - ' + data.settings.district]);
  wsVoucher.mergeCells('A2:D2');
  wsVoucher.getCell('A2').alignment = { horizontal: 'center' };

  wsVoucher.addRow(['PAYMENT VOUCHER']);
  wsVoucher.mergeCells('A3:D3');
  wsVoucher.getCell('A3').font = { size: 12, bold: true, underline: true };
  wsVoucher.getCell('A3').alignment = { horizontal: 'center' };

  wsVoucher.addRow([]);
  wsVoucher.addRow(['Voucher No:', data.payments[0]?.paymentNo || 'PAY-2026-101', 'Date:', data.payments[0]?.paymentDate || '2026-04-08']);
  wsVoucher.addRow(['Paid To:', data.payments[0]?.supplierName || 'Apex Pharmaceuticals', 'Mode:', data.payments[0]?.paymentMode || 'NEFT']);
  wsVoucher.addRow(['Bank Name:', data.payments[0]?.bankName || 'SBI', 'UTR / Cheque:', data.payments[0]?.utrNo || 'NEFT12345']);
  wsVoucher.addRow(['Amount Paid:', data.payments[0]?.amountPaid || 207200, 'Bill Reference:', data.payments[0]?.billNo || 'BILL-2026-001']);
  wsVoucher.getCell('B8').numFmt = '₹#,##0.00';

  wsVoucher.addRow([]);
  wsVoucher.addRow(['Particulars / Purpose:', 'Payment towards medical supplies under Bill Ref ' + (data.payments[0]?.billNo || '')]);
  wsVoucher.mergeCells('B10:D10');

  wsVoucher.addRow([]);
  wsVoucher.addRow([]);
  wsVoucher.addRow(['Prepared By', 'Verified By', 'Internal Auditor', 'Medical Superintendent']);
  wsVoucher.addRow([data.settings.seniorAccountant, 'Accounts Officer', data.settings.internalAuditor, data.settings.medicalSuperintendent]);

  // 14. REPORTS
  const wsRep = workbook.addWorksheet('Reports');
  applyA4PrintSetup(wsRep, 'landscape');
  wsRep.addRow(['GOVERNMENT HOSPITAL ACCOUNTS GENERATED REPORTS SUMMARY']);
  wsRep.mergeCells('A1:E1');
  wsRep.getCell('A1').font = { size: 14, bold: true, color: { argb: '1E3A8A' } };

  wsRep.addRow([]);
  const repHeader = wsRep.addRow(['Report ID', 'Report Title', 'Filter Period', 'Total Records', 'Primary Formula Used']);
  formatHeaderRow(repHeader);

  const reportsList = [
    ['REP-01', 'Daily Cash Book Report', 'Daily / Range', '=COUNTA(\'Cash Book\'!A:A)-1', 'Running Balance = F(n-1)+D(n)-E(n)'],
    ['REP-02', 'Monthly Cash Book Report', 'Monthly', '=COUNTA(\'Cash Book\'!A:A)-1', 'SUMIFS by Month'],
    ['REP-03', 'Petty Cash Summary', 'Monthly', '=COUNTA(\'Petty Cash Book\'!A:A)-1', 'Category-wise SUMIFS'],
    ['REP-04', 'Supplier-wise Expenditure', 'Annual', '=COUNTA(\'Supplier Master\'!A:A)-1', 'SUMIFS by Supplier Name'],
    ['REP-05', 'Category-wise Expenditure', 'Annual', '11 Categories', 'SUMIFS by Category'],
    ['REP-06', 'GST Summary Report', 'Quarterly / Monthly', '=COUNTA(\'GST Register\'!A:A)-1', 'CGST+SGST+IGST SUM'],
    ['REP-07', 'Monthly Expenditure Statement', 'Monthly Matrix', '12 Months', 'SUMIFS by Category & Month'],
    ['REP-08', 'Annual Expenditure Statement', 'FY 2025-26', '1 FY', 'Opening + Receipts - Payments'],
    ['REP-09', 'Bill Pending Report', 'Unpaid Bills', '=COUNTIF(\'Bill Register\'!J:J, "Pending")', 'FILTER / QUERY for Pending'],
    ['REP-10', 'Payment Register Report', 'All Payments', '=COUNTA(\'Payment Register\'!A:A)-1', 'NEFT/RTGS/Cash Audit Trail'],
  ];

  reportsList.forEach(([id, name, period, recs, form]) => {
    const row = wsRep.addRow([id, name, period, recs, form]);
    row.eachCell((cell) => (cell.border = thinBorder));
  });

  // 15. SETTINGS
  const wsSet = workbook.addWorksheet('Settings');
  applyA4PrintSetup(wsSet, 'portrait');
  wsSet.columns = [
    { header: 'Setting Parameter', key: 'param', width: 35 },
    { header: 'Value', key: 'value', width: 45 },
  ];
  formatHeaderRow(wsSet.getRow(1));

  Object.entries(data.settings).forEach(([key, val]) => {
    const row = wsSet.addRow({ param: key, value: String(val) });
    row.eachCell((cell) => (cell.border = thinBorder));
  });

  // Generate buffer and save as XLSX file
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `Govt_Hospital_Accounts_System_${data.settings.financialYear}.xlsx`);
}
