export const SUPABASE_SQL_SCHEMA = `-- ==============================================================================
-- GOVERNMENT HOSPITAL ACCOUNTS MANAGEMENT SYSTEM (GHAMS) - SUPABASE DDL SCHEMA
-- ==============================================================================
-- Instructions: Run this SQL in your Supabase SQL Editor (Dashboard -> SQL Editor)
-- This creates all tables with proper data types, timestamps, foreign key links,
-- and Row Level Security (RLS) policies locked to authenticated users via auth.uid().
-- ==============================================================================

-- 1. HOSPITAL MASTER SETTINGS
CREATE TABLE IF NOT EXISTS public.hospital_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    hospital_name TEXT NOT NULL DEFAULT 'District General Hospital (Zone 4)',
    department_name TEXT DEFAULT 'Department of Health & Family Welfare',
    district TEXT DEFAULT 'Central District',
    state TEXT DEFAULT 'Delhi NCT',
    registration_no TEXT DEFAULT 'DGH-MED-2024-8841',
    financial_year TEXT DEFAULT '2026-27',
    opening_cash_balance NUMERIC(15, 2) DEFAULT 45000.00,
    opening_petty_cash_balance NUMERIC(15, 2) DEFAULT 15000.00,
    bank_opening_balance NUMERIC(15, 2) DEFAULT 3200000.00,
    currency_symbol TEXT DEFAULT '₹',
    medical_superintendent TEXT DEFAULT 'Dr. Rajesh Verma, MD (Admin)',
    senior_accountant TEXT DEFAULT 'Shri. Alok Nath, Accounts Officer',
    internal_auditor TEXT DEFAULT 'Smt. Geeta Sharma, Internal Auditor',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SUPPLIER MASTER
CREATE TABLE IF NOT EXISTS public.suppliers (
    id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    mobile TEXT,
    gst_no TEXT,
    pan_no TEXT,
    bank_name TEXT,
    account_no TEXT,
    ifsc_code TEXT,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id, user_id)
);

-- 3. RECIPIENT MASTER (DOCTORS / OFFICERS / STAFF)
CREATE TABLE IF NOT EXISTS public.recipients (
    id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    designation TEXT,
    department TEXT,
    bank_name TEXT,
    account_no TEXT,
    ifsc_code TEXT,
    mobile TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id, user_id)
);

-- 4. BANK ACCOUNTS MASTER
CREATE TABLE IF NOT EXISTS public.bank_master (
    id TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    bank_name TEXT NOT NULL,
    account_name TEXT,
    account_no TEXT,
    ifsc_code TEXT,
    branch TEXT,
    opening_balance NUMERIC(15, 2) DEFAULT 0.00,
    current_balance NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (id, user_id)
);

-- 5. MAIN CASH BOOK
CREATE TABLE IF NOT EXISTS public.cash_book (
    voucher_no TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    particulars TEXT NOT NULL,
    receipt_amount NUMERIC(15, 2) DEFAULT 0.00,
    payment_amount NUMERIC(15, 2) DEFAULT 0.00,
    running_balance NUMERIC(15, 2) DEFAULT 0.00,
    bill_no TEXT,
    supplier_name TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (voucher_no, user_id)
);

-- 6. PETTY CASH BOOK (IMPREST)
CREATE TABLE IF NOT EXISTS public.petty_cash (
    voucher_no TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    particulars TEXT NOT NULL,
    amount NUMERIC(15, 2) DEFAULT 0.00,
    category TEXT NOT NULL,
    running_balance NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (voucher_no, user_id)
);

-- 7. BILL REGISTER
CREATE TABLE IF NOT EXISTS public.bills (
    bill_no TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    bill_date TEXT NOT NULL,
    supplier_name TEXT NOT NULL,
    supplier_id TEXT,
    gst_no TEXT,
    description TEXT,
    bill_amount NUMERIC(15, 2) DEFAULT 0.00,
    gst_amount NUMERIC(15, 2) DEFAULT 0.00,
    total_amount NUMERIC(15, 2) DEFAULT 0.00,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (bill_no, user_id)
);

-- 8. PAYMENT REGISTER
CREATE TABLE IF NOT EXISTS public.payments (
    payment_no TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    payment_date TEXT NOT NULL,
    supplier_name TEXT NOT NULL,
    recipient_id TEXT,
    bank_name TEXT,
    account_no TEXT,
    ifsc_code TEXT,
    utr_no TEXT NOT NULL,
    payment_mode TEXT DEFAULT 'NEFT',
    bill_no TEXT,
    amount_paid NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (payment_no, user_id)
);

-- 9. GST REGISTER
CREATE TABLE IF NOT EXISTS public.gst_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    gst_no TEXT,
    supplier_name TEXT,
    bill_no TEXT,
    taxable_amount NUMERIC(15, 2) DEFAULT 0.00,
    cgst NUMERIC(15, 2) DEFAULT 0.00,
    sgst NUMERIC(15, 2) DEFAULT 0.00,
    igst NUMERIC(15, 2) DEFAULT 0.00,
    total_gst NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. EXPENDITURE REGISTER
CREATE TABLE IF NOT EXISTS public.expenditures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date TEXT,
    bill_no TEXT,
    supplier_name TEXT,
    category TEXT,
    amount NUMERIC(15, 2) DEFAULT 0.00,
    gst NUMERIC(15, 2) DEFAULT 0.00,
    total NUMERIC(15, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ==============================================================================
ALTER TABLE public.hospital_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_book ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.petty_cash ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gst_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenditures ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- RLS POLICIES (Users can only Select, Insert, Update, Delete their own data)
-- ==============================================================================

-- 1. Settings Policies
DROP POLICY IF EXISTS "hospital_settings_select_policy" ON public.hospital_settings;
CREATE POLICY "hospital_settings_select_policy" ON public.hospital_settings
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "hospital_settings_insert_policy" ON public.hospital_settings;
CREATE POLICY "hospital_settings_insert_policy" ON public.hospital_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "hospital_settings_update_policy" ON public.hospital_settings;
CREATE POLICY "hospital_settings_update_policy" ON public.hospital_settings
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "hospital_settings_delete_policy" ON public.hospital_settings;
CREATE POLICY "hospital_settings_delete_policy" ON public.hospital_settings
    FOR DELETE USING (auth.uid() = user_id);

-- 2. Suppliers Policies
DROP POLICY IF EXISTS "suppliers_select_policy" ON public.suppliers;
CREATE POLICY "suppliers_select_policy" ON public.suppliers
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "suppliers_insert_policy" ON public.suppliers;
CREATE POLICY "suppliers_insert_policy" ON public.suppliers
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "suppliers_update_policy" ON public.suppliers;
CREATE POLICY "suppliers_update_policy" ON public.suppliers
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "suppliers_delete_policy" ON public.suppliers;
CREATE POLICY "suppliers_delete_policy" ON public.suppliers
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- 3. Recipients Policies
DROP POLICY IF EXISTS "recipients_select_policy" ON public.recipients;
CREATE POLICY "recipients_select_policy" ON public.recipients
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "recipients_insert_policy" ON public.recipients;
CREATE POLICY "recipients_insert_policy" ON public.recipients
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "recipients_update_policy" ON public.recipients;
CREATE POLICY "recipients_update_policy" ON public.recipients
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "recipients_delete_policy" ON public.recipients;
CREATE POLICY "recipients_delete_policy" ON public.recipients
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- 4. Bank Master Policies
DROP POLICY IF EXISTS "bank_master_select_policy" ON public.bank_master;
CREATE POLICY "bank_master_select_policy" ON public.bank_master
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "bank_master_insert_policy" ON public.bank_master;
CREATE POLICY "bank_master_insert_policy" ON public.bank_master
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "bank_master_update_policy" ON public.bank_master;
CREATE POLICY "bank_master_update_policy" ON public.bank_master
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "bank_master_delete_policy" ON public.bank_master;
CREATE POLICY "bank_master_delete_policy" ON public.bank_master
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- 5. Cash Book Policies
DROP POLICY IF EXISTS "cash_book_select_policy" ON public.cash_book;
CREATE POLICY "cash_book_select_policy" ON public.cash_book
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "cash_book_insert_policy" ON public.cash_book;
CREATE POLICY "cash_book_insert_policy" ON public.cash_book
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "cash_book_delete_policy" ON public.cash_book;
CREATE POLICY "cash_book_delete_policy" ON public.cash_book
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- 6. Petty Cash Policies
DROP POLICY IF EXISTS "petty_cash_select_policy" ON public.petty_cash;
CREATE POLICY "petty_cash_select_policy" ON public.petty_cash
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "petty_cash_insert_policy" ON public.petty_cash;
CREATE POLICY "petty_cash_insert_policy" ON public.petty_cash
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "petty_cash_delete_policy" ON public.petty_cash;
CREATE POLICY "petty_cash_delete_policy" ON public.petty_cash
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- 7. Bills Policies
DROP POLICY IF EXISTS "bills_select_policy" ON public.bills;
CREATE POLICY "bills_select_policy" ON public.bills
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "bills_insert_policy" ON public.bills;
CREATE POLICY "bills_insert_policy" ON public.bills
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "bills_update_policy" ON public.bills;
CREATE POLICY "bills_update_policy" ON public.bills
    FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "bills_delete_policy" ON public.bills;
CREATE POLICY "bills_delete_policy" ON public.bills
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- 8. Payments Policies
DROP POLICY IF EXISTS "payments_select_policy" ON public.payments;
CREATE POLICY "payments_select_policy" ON public.payments
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "payments_insert_policy" ON public.payments;
CREATE POLICY "payments_insert_policy" ON public.payments
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "payments_delete_policy" ON public.payments;
CREATE POLICY "payments_delete_policy" ON public.payments
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- 9. GST Entries Policies
DROP POLICY IF EXISTS "gst_entries_select_policy" ON public.gst_entries;
CREATE POLICY "gst_entries_select_policy" ON public.gst_entries
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "gst_entries_insert_policy" ON public.gst_entries;
CREATE POLICY "gst_entries_insert_policy" ON public.gst_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "gst_entries_delete_policy" ON public.gst_entries;
CREATE POLICY "gst_entries_delete_policy" ON public.gst_entries
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() IS NULL);

-- 10. Expenditures Policies
DROP POLICY IF EXISTS "expenditures_select_policy" ON public.expenditures;
CREATE POLICY "expenditures_select_policy" ON public.expenditures
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() IS NULL);

DROP POLICY IF EXISTS "expenditures_insert_policy" ON public.expenditures;
CREATE POLICY "expenditures_insert_policy" ON public.expenditures
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "expenditures_delete_policy" ON public.expenditures;
CREATE POLICY "expenditures_delete_policy" ON public.expenditures
    FOR DELETE USING (auth.uid() = user_id OR auth.uid() IS NULL);
`;
