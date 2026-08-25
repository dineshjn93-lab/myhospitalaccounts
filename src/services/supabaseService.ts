import { supabase } from '../supabaseClient';
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
} from '../data/initialData';

// Helper to get current authenticated user ID if any
export async function getAuthUserId(): Promise<string | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch {
    return null;
  }
}

// Check whether Supabase is reachable & schema exists
export async function checkSupabaseConnection(): Promise<{ ok: boolean; message: string; tableCount?: number }> {
  try {
    const { error } = await supabase.from('hospital_settings').select('id').limit(1);
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "public.hospital_settings" does not exist') || error.code === '42P01') {
        return { ok: false, message: 'Database tables not yet created. Please run the SQL migration in Supabase SQL Editor.' };
      }
      return { ok: false, message: error.message };
    }
    return { ok: true, message: 'Connected to Supabase successfully' };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Network / connection error' };
  }
}

// ==========================================
// 1. HOSPITAL SETTINGS
// ==========================================
export async function fetchHospitalSettings(): Promise<HospitalSettings | null> {
  try {
    const { data, error } = await supabase
      .from('hospital_settings')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      hospitalName: data.hospital_name || initialHospitalSettings.hospitalName,
      departmentName: data.department_name || initialHospitalSettings.departmentName,
      district: data.district || initialHospitalSettings.district,
      state: data.state || initialHospitalSettings.state,
      registrationNo: data.registration_no || initialHospitalSettings.registrationNo,
      financialYear: data.financial_year || initialHospitalSettings.financialYear,
      openingCashBalance: Number(data.opening_cash_balance) || 0,
      openingPettyCashBalance: Number(data.opening_petty_cash_balance) || 0,
      bankOpeningBalance: Number(data.bank_opening_balance) || 0,
      currencySymbol: data.currency_symbol || '₹',
      medicalSuperintendent: data.medical_superintendent || initialHospitalSettings.medicalSuperintendent,
      seniorAccountant: data.senior_accountant || initialHospitalSettings.seniorAccountant,
      internalAuditor: data.internal_auditor || initialHospitalSettings.internalAuditor,
    };
  } catch {
    return null;
  }
}

export async function saveHospitalSettings(settings: HospitalSettings): Promise<boolean> {
  try {
    const userId = await getAuthUserId();
    const payload = {
      user_id: userId,
      hospital_name: settings.hospitalName,
      department_name: settings.departmentName,
      district: settings.district,
      state: settings.state,
      registration_no: settings.registrationNo,
      financial_year: settings.financialYear,
      opening_cash_balance: settings.openingCashBalance,
      opening_petty_cash_balance: settings.openingPettyCashBalance,
      bank_opening_balance: settings.bankOpeningBalance,
      currency_symbol: settings.currencySymbol || '₹',
      medical_superintendent: settings.medicalSuperintendent,
      seniorAccountant: settings.seniorAccountant,
      internal_auditor: settings.internalAuditor,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('hospital_settings').upsert(payload);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// 2. SUPPLIERS
// ==========================================
export async function fetchSuppliers(): Promise<Supplier[]> {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return initialSuppliers;

    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      address: d.address || '',
      mobile: d.mobile || '',
      gstNo: d.gst_no || '',
      panNo: d.pan_no || '',
      bankName: d.bank_name || '',
      accountNo: d.account_no || '',
      ifscCode: d.ifsc_code || '',
      status: (d.status as 'Active' | 'Inactive') || 'Active',
    }));
  } catch {
    return initialSuppliers;
  }
}

export async function insertSupplier(supplier: Supplier): Promise<boolean> {
  try {
    const userId = await getAuthUserId();
    const { error } = await supabase.from('suppliers').insert({
      id: supplier.id,
      user_id: userId,
      name: supplier.name,
      address: supplier.address,
      mobile: supplier.mobile,
      gst_no: supplier.gstNo,
      pan_no: supplier.panNo,
      bank_name: supplier.bankName,
      account_no: supplier.accountNo,
      ifsc_code: supplier.ifscCode,
      status: supplier.status || 'Active',
    });
    return !error;
  } catch {
    return false;
  }
}

export async function updateSupplier(supplier: Supplier): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('suppliers')
      .update({
        name: supplier.name,
        address: supplier.address,
        mobile: supplier.mobile,
        gst_no: supplier.gstNo,
        pan_no: supplier.panNo,
        bank_name: supplier.bankName,
        account_no: supplier.accountNo,
        ifsc_code: supplier.ifscCode,
        status: supplier.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', supplier.id);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteSupplier(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// 3. RECIPIENTS
// ==========================================
export async function fetchRecipients(): Promise<Recipient[]> {
  try {
    const { data, error } = await supabase
      .from('recipients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return initialRecipients;

    return data.map((d: any) => ({
      id: d.id,
      name: d.name,
      designation: d.designation || '',
      department: d.department || '',
      bankName: d.bank_name || '',
      accountNo: d.account_no || '',
      ifscCode: d.ifsc_code || '',
      mobile: d.mobile || '',
    }));
  } catch {
    return initialRecipients;
  }
}

export async function insertRecipient(recipient: Recipient): Promise<boolean> {
  try {
    const userId = await getAuthUserId();
    const { error } = await supabase.from('recipients').insert({
      id: recipient.id,
      user_id: userId,
      name: recipient.name,
      designation: recipient.designation,
      department: recipient.department,
      bank_name: recipient.bankName,
      account_no: recipient.accountNo,
      ifsc_code: recipient.ifscCode,
      mobile: recipient.mobile,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function deleteRecipient(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('recipients').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// 4. BANK MASTER
// ==========================================
export async function fetchBankMaster(): Promise<BankMasterItem[]> {
  try {
    const { data, error } = await supabase
      .from('bank_master')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) return initialBankMaster;

    return data.map((d: any) => ({
      id: d.id,
      bankName: d.bank_name,
      accountName: d.account_name || '',
      accountNo: d.account_no || '',
      ifscCode: d.ifsc_code || '',
      branch: d.branch || '',
      openingBalance: Number(d.opening_balance) || 0,
      currentBalance: Number(d.current_balance) || 0,
    }));
  } catch {
    return initialBankMaster;
  }
}

export async function insertBankMaster(bank: BankMasterItem): Promise<boolean> {
  try {
    const userId = await getAuthUserId();
    const { error } = await supabase.from('bank_master').insert({
      id: bank.id,
      user_id: userId,
      bank_name: bank.bankName,
      account_name: bank.accountName,
      account_no: bank.accountNo,
      ifsc_code: bank.ifscCode,
      branch: bank.branch,
      opening_balance: bank.openingBalance,
      current_balance: bank.currentBalance,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function deleteBankMaster(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('bank_master').delete().eq('id', id);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// 5. CASH BOOK
// ==========================================
export async function fetchCashBook(): Promise<CashBookEntry[]> {
  try {
    const { data, error } = await supabase
      .from('cash_book')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) return initialCashBook;

    return data.map((d: any) => ({
      voucherNo: d.voucher_no,
      date: d.date,
      particulars: d.particulars,
      receiptAmount: Number(d.receipt_amount) || 0,
      paymentAmount: Number(d.payment_amount) || 0,
      runningBalance: Number(d.running_balance) || 0,
      billNo: d.bill_no || '',
      supplierName: d.supplier_name || '',
      remarks: d.remarks || '',
    }));
  } catch {
    return initialCashBook;
  }
}

export async function insertCashBook(entry: CashBookEntry): Promise<boolean> {
  try {
    const userId = await getAuthUserId();
    const { error } = await supabase.from('cash_book').insert({
      voucher_no: entry.voucherNo,
      user_id: userId,
      date: entry.date,
      particulars: entry.particulars,
      receipt_amount: entry.receiptAmount || 0,
      payment_amount: entry.paymentAmount || 0,
      running_balance: entry.runningBalance || 0,
      bill_no: entry.billNo,
      supplier_name: entry.supplierName,
      remarks: entry.remarks,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function deleteCashBook(voucherNo: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('cash_book').delete().eq('voucher_no', voucherNo);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// 6. PETTY CASH
// ==========================================
export async function fetchPettyCash(): Promise<PettyCashEntry[]> {
  try {
    const { data, error } = await supabase
      .from('petty_cash')
      .select('*')
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) return initialPettyCash;

    return data.map((d: any) => ({
      voucherNo: d.voucher_no,
      date: d.date,
      particulars: d.particulars,
      amount: Number(d.amount) || 0,
      category: d.category,
      runningBalance: Number(d.running_balance) || 0,
    }));
  } catch {
    return initialPettyCash;
  }
}

export async function insertPettyCash(entry: PettyCashEntry): Promise<boolean> {
  try {
    const userId = await getAuthUserId();
    const { error } = await supabase.from('petty_cash').insert({
      voucher_no: entry.voucherNo,
      user_id: userId,
      date: entry.date,
      particulars: entry.particulars,
      amount: entry.amount || 0,
      category: entry.category,
      running_balance: entry.runningBalance || 0,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function deletePettyCash(voucherNo: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('petty_cash').delete().eq('voucher_no', voucherNo);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// 7. BILL REGISTER
// ==========================================
export async function fetchBills(): Promise<BillEntry[]> {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return initialBillRegister;

    return data.map((d: any) => ({
      billNo: d.bill_no,
      billDate: d.bill_date,
      supplierName: d.supplier_name,
      supplierId: d.supplier_id || '',
      gstNo: d.gst_no || '',
      description: d.description || '',
      billAmount: Number(d.bill_amount) || 0,
      gstAmount: Number(d.gst_amount) || 0,
      totalAmount: Number(d.total_amount) || 0,
      status: (d.status as 'Pending' | 'Paid' | 'Partially Paid' | 'Cancelled') || 'Pending',
    }));
  } catch {
    return initialBillRegister;
  }
}

export async function insertBill(bill: BillEntry): Promise<boolean> {
  try {
    const userId = await getAuthUserId();
    const { error } = await supabase.from('bills').insert({
      bill_no: bill.billNo,
      user_id: userId,
      bill_date: bill.billDate,
      supplier_name: bill.supplierName,
      supplier_id: bill.supplierId,
      gst_no: bill.gstNo,
      description: bill.description,
      bill_amount: bill.billAmount || 0,
      gst_amount: bill.gstAmount || 0,
      total_amount: bill.totalAmount || 0,
      status: bill.status || 'Pending',
    });
    return !error;
  } catch {
    return false;
  }
}

export async function updateBillStatus(billNo: string, status: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('bills').update({ status }).eq('bill_no', billNo);
    return !error;
  } catch {
    return false;
  }
}

export async function deleteBill(billNo: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('bills').delete().eq('bill_no', billNo);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// 8. PAYMENT REGISTER
// ==========================================
export async function fetchPayments(): Promise<PaymentEntry[]> {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return initialPaymentRegister;

    return data.map((d: any) => ({
      paymentNo: d.payment_no,
      paymentDate: d.payment_date,
      supplierName: d.supplier_name,
      recipientId: d.recipient_id || '',
      bankName: d.bank_name || '',
      accountNo: d.account_no || '',
      ifscCode: d.ifsc_code || '',
      utrNo: d.utr_no,
      paymentMode: (d.payment_mode as 'Cash' | 'Cheque' | 'NEFT' | 'RTGS' | 'IMPS') || 'NEFT',
      billNo: d.bill_no || '',
      amountPaid: Number(d.amount_paid) || 0,
    }));
  } catch {
    return initialPaymentRegister;
  }
}

export async function insertPayment(payment: PaymentEntry): Promise<boolean> {
  try {
    const userId = await getAuthUserId();
    const { error } = await supabase.from('payments').insert({
      payment_no: payment.paymentNo,
      user_id: userId,
      payment_date: payment.paymentDate,
      supplier_name: payment.supplierName,
      recipient_id: payment.recipientId,
      bank_name: payment.bankName,
      account_no: payment.accountNo,
      ifsc_code: payment.ifscCode,
      utr_no: payment.utrNo,
      payment_mode: payment.paymentMode || 'NEFT',
      bill_no: payment.billNo,
      amount_paid: payment.amountPaid || 0,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function deletePayment(paymentNo: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('payments').delete().eq('payment_no', paymentNo);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// 9. GST REGISTER
// ==========================================
export async function fetchGSTEntries(): Promise<GSTEntry[]> {
  try {
    const { data, error } = await supabase
      .from('gst_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return initialGSTRegister;

    return data.map((d: any) => ({
      gstNo: d.gst_no || '',
      supplierName: d.supplier_name || '',
      billNo: d.bill_no || '',
      taxableAmount: Number(d.taxable_amount) || 0,
      cgst: Number(d.cgst) || 0,
      sgst: Number(d.sgst) || 0,
      igst: Number(d.igst) || 0,
      totalGst: Number(d.total_gst) || 0,
    }));
  } catch {
    return initialGSTRegister;
  }
}

export async function insertGSTEntry(entry: GSTEntry): Promise<boolean> {
  try {
    const userId = await getAuthUserId();
    const { error } = await supabase.from('gst_entries').insert({
      user_id: userId,
      gst_no: entry.gstNo,
      supplier_name: entry.supplierName,
      bill_no: entry.billNo,
      taxable_amount: entry.taxableAmount || 0,
      cgst: entry.cgst || 0,
      sgst: entry.sgst || 0,
      igst: entry.igst || 0,
      total_gst: entry.totalGst || 0,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function deleteGSTEntry(billNo: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('gst_entries').delete().eq('bill_no', billNo);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// 10. EXPENDITURE REGISTER
// ==========================================
export async function fetchExpenditures(): Promise<ExpenditureEntry[]> {
  try {
    const { data, error } = await supabase
      .from('expenditures')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) return initialExpenditureRegister;

    return data.map((d: any) => ({
      date: d.date || '',
      billNo: d.bill_no || '',
      supplierName: d.supplier_name || '',
      category: d.category,
      amount: Number(d.amount) || 0,
      gst: Number(d.gst) || 0,
      total: Number(d.total) || 0,
    }));
  } catch {
    return initialExpenditureRegister;
  }
}

export async function insertExpenditure(entry: ExpenditureEntry): Promise<boolean> {
  try {
    const userId = await getAuthUserId();
    const { error } = await supabase.from('expenditures').insert({
      user_id: userId,
      date: entry.date,
      bill_no: entry.billNo,
      supplier_name: entry.supplierName,
      category: entry.category,
      amount: entry.amount || 0,
      gst: entry.gst || 0,
      total: entry.total || 0,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function deleteExpenditure(billNo: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('expenditures').delete().eq('bill_no', billNo);
    return !error;
  } catch {
    return false;
  }
}

// ==========================================
// BULK DATA LOADER & SEEDER
// ==========================================
export async function loadAllHospitalData() {
  const [
    fetchedSettings,
    fetchedSuppliers,
    fetchedRecipients,
    fetchedBanks,
    fetchedCashBook,
    fetchedPettyCash,
    fetchedBills,
    fetchedPayments,
    fetchedGST,
    fetchedExp,
  ] = await Promise.all([
    fetchHospitalSettings(),
    fetchSuppliers(),
    fetchRecipients(),
    fetchBankMaster(),
    fetchCashBook(),
    fetchPettyCash(),
    fetchBills(),
    fetchPayments(),
    fetchGSTEntries(),
    fetchExpenditures(),
  ]);

  return {
    settings: fetchedSettings || initialHospitalSettings,
    suppliers: fetchedSuppliers,
    recipients: fetchedRecipients,
    banks: fetchedBanks,
    cashBook: fetchedCashBook,
    pettyCash: fetchedPettyCash,
    bills: fetchedBills,
    payments: fetchedPayments,
    gstEntries: fetchedGST,
    expenditures: fetchedExp,
  };
}

// Bulk sync sample initial data to Supabase
export async function syncInitialDataToSupabase(): Promise<{ success: boolean; error?: string }> {
  try {
    const userId = await getAuthUserId();

    // 1. Settings
    await supabase.from('hospital_settings').upsert({
      user_id: userId,
      hospital_name: initialHospitalSettings.hospitalName,
      department_name: initialHospitalSettings.departmentName,
      district: initialHospitalSettings.district,
      state: initialHospitalSettings.state,
      registration_no: initialHospitalSettings.registrationNo,
      financial_year: initialHospitalSettings.financialYear,
      opening_cash_balance: initialHospitalSettings.openingCashBalance,
      opening_petty_cash_balance: initialHospitalSettings.openingPettyCashBalance,
      bank_opening_balance: initialHospitalSettings.bankOpeningBalance,
      currency_symbol: '₹',
      medical_superintendent: initialHospitalSettings.medicalSuperintendent,
      senior_accountant: initialHospitalSettings.seniorAccountant,
      internal_auditor: initialHospitalSettings.internalAuditor,
    });

    // 2. Suppliers
    const suppliersPayload = initialSuppliers.map((s) => ({
      id: s.id,
      user_id: userId,
      name: s.name,
      address: s.address,
      mobile: s.mobile,
      gst_no: s.gstNo,
      pan_no: s.panNo,
      bank_name: s.bankName,
      account_no: s.accountNo,
      ifsc_code: s.ifscCode,
      status: s.status,
    }));
    await supabase.from('suppliers').upsert(suppliersPayload);

    // 3. Recipients
    const recipientsPayload = initialRecipients.map((r) => ({
      id: r.id,
      user_id: userId,
      name: r.name,
      designation: r.designation,
      department: r.department,
      bank_name: r.bankName,
      account_no: r.accountNo,
      ifsc_code: r.ifscCode,
      mobile: r.mobile,
    }));
    await supabase.from('recipients').upsert(recipientsPayload);

    // 4. Banks
    const banksPayload = initialBankMaster.map((b) => ({
      id: b.id,
      user_id: userId,
      bank_name: b.bankName,
      account_name: b.accountName,
      account_no: b.accountNo,
      ifsc_code: b.ifscCode,
      branch: b.branch,
      opening_balance: b.openingBalance,
      current_balance: b.currentBalance,
    }));
    await supabase.from('bank_master').upsert(banksPayload);

    // 5. Cash Book
    const cashPayload = initialCashBook.map((c) => ({
      voucher_no: c.voucherNo,
      user_id: userId,
      date: c.date,
      particulars: c.particulars,
      receipt_amount: c.receiptAmount,
      payment_amount: c.paymentAmount,
      running_balance: c.runningBalance,
      bill_no: c.billNo,
      supplier_name: c.supplierName,
      remarks: c.remarks,
    }));
    await supabase.from('cash_book').upsert(cashPayload);

    // 6. Petty Cash
    const pettyPayload = initialPettyCash.map((p) => ({
      voucher_no: p.voucherNo,
      user_id: userId,
      date: p.date,
      particulars: p.particulars,
      amount: p.amount,
      category: p.category,
      running_balance: p.runningBalance,
    }));
    await supabase.from('petty_cash').upsert(pettyPayload);

    // 7. Bills
    const billsPayload = initialBillRegister.map((b) => ({
      bill_no: b.billNo,
      user_id: userId,
      bill_date: b.billDate,
      supplier_name: b.supplierName,
      supplier_id: b.supplierId,
      gst_no: b.gstNo,
      description: b.description,
      bill_amount: b.billAmount,
      gst_amount: b.gstAmount,
      total_amount: b.totalAmount,
      status: b.status,
    }));
    await supabase.from('bills').upsert(billsPayload);

    // 8. Payments
    const paymentsPayload = initialPaymentRegister.map((p) => ({
      payment_no: p.paymentNo,
      user_id: userId,
      payment_date: p.paymentDate,
      supplier_name: p.supplierName,
      recipient_id: p.recipientId,
      bank_name: p.bankName,
      account_no: p.accountNo,
      ifsc_code: p.ifscCode,
      utr_no: p.utrNo,
      payment_mode: p.paymentMode,
      bill_no: p.billNo,
      amount_paid: p.amountPaid,
    }));
    await supabase.from('payments').upsert(paymentsPayload);

    // 9. GST
    const gstPayload = initialGSTRegister.map((g) => ({
      user_id: userId,
      gst_no: g.gstNo,
      supplier_name: g.supplierName,
      bill_no: g.billNo,
      taxable_amount: g.taxableAmount,
      cgst: g.cgst,
      sgst: g.sgst,
      igst: g.igst,
      total_gst: g.totalGst,
    }));
    await supabase.from('gst_entries').insert(gstPayload);

    // 10. Expenditures
    const expPayload = initialExpenditureRegister.map((e) => ({
      user_id: userId,
      date: e.date,
      bill_no: e.billNo,
      supplier_name: e.supplierName,
      category: e.category,
      amount: e.amount,
      gst: e.gst,
      total: e.total,
    }));
    await supabase.from('expenditures').insert(expPayload);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to sync data to Supabase' };
  }
}
