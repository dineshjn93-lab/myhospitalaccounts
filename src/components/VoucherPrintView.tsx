import React, { useState } from 'react';
import { Printer, Building2, CheckCircle2 } from 'lucide-react';
import { HospitalSettings, PaymentEntry } from '../types/hospital';
import { numberToWordsIndian } from '../utils/numberToWords';

interface VoucherPrintViewProps {
  settings: HospitalSettings;
  payments: PaymentEntry[];
}

export const VoucherPrintView: React.FC<VoucherPrintViewProps> = ({ settings, payments }) => {
  const [selectedPaymentIndex, setSelectedPaymentIndex] = useState<number>(0);
  const currentPay = payments[selectedPaymentIndex] || {
    paymentNo: 'PAY-2026-101',
    paymentDate: '2026-04-08',
    supplierName: 'Apex Pharmaceuticals Pvt Ltd',
    recipientId: 'SUP-1001',
    bankName: 'State Bank of India',
    accountNo: '30492817402',
    ifscCode: 'SBIN0001234',
    utrNo: 'NEFT2604081928371',
    paymentMode: 'NEFT',
    billNo: 'BILL-2026-001',
    amountPaid: 207200,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Control Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h2 className="text-base font-bold text-slate-900">13. Voucher Print Template</h2>
          <p className="text-xs text-slate-500">Select payment record to generate official A4 printable voucher</p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPaymentIndex}
            onChange={(e) => setSelectedPaymentIndex(Number(e.target.value))}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {payments.map((p, idx) => (
              <option key={p.paymentNo} value={idx}>
                {p.paymentNo} - {p.supplierName} (₹{p.amountPaid.toLocaleString('en-IN')})
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="px-4 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print A4 Voucher</span>
          </button>
        </div>
      </div>

      {/* A4 Printable Sheet */}
      <div className="bg-white p-8 rounded-2xl border border-slate-300 shadow-md print:shadow-none print:border-none print:p-0 text-slate-900 font-serif">
        {/* Hospital Letterhead Header */}
        <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
          <p className="text-xs uppercase font-sans tracking-widest text-slate-600 font-semibold">
            {settings.state} • {settings.departmentName}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-serif uppercase mt-1">
            {settings.hospitalName}
          </h1>
          <p className="text-xs text-slate-600 font-sans mt-0.5">
            {settings.district} • Registration No: {settings.registrationNo}
          </p>
          <div className="inline-block px-3 py-0.5 mt-2 bg-slate-900 text-white text-xs font-bold font-sans uppercase tracking-widest rounded-sm">
            OFFICIAL PAYMENT VOUCHER
          </div>
        </div>

        {/* Voucher Metadata Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs font-sans mb-6 bg-slate-50 p-4 border border-slate-300 rounded-lg">
          <div>
            <span className="font-bold text-slate-700">Voucher / Payment No:</span>{' '}
            <span className="font-mono text-sm font-bold text-blue-900">{currentPay.paymentNo}</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-700">Voucher Date:</span>{' '}
            <span className="font-mono font-medium">{currentPay.paymentDate}</span>
          </div>
          <div>
            <span className="font-bold text-slate-700">Financial Year:</span>{' '}
            <span>{settings.financialYear}</span>
          </div>
          <div className="text-right">
            <span className="font-bold text-slate-700">Payment Mode:</span>{' '}
            <span className="font-bold text-emerald-800 uppercase">{currentPay.paymentMode}</span>
          </div>
        </div>

        {/* Particulars Table */}
        <div className="border border-slate-900 rounded-lg overflow-hidden mb-6">
          <table className="w-full text-xs font-sans border-collapse">
            <thead className="bg-slate-100 border-b border-slate-900 font-bold uppercase">
              <tr>
                <th className="py-2.5 px-3 text-left border-r border-slate-900 w-12">S.No</th>
                <th className="py-2.5 px-4 text-left border-r border-slate-900">Particulars & Purpose of Disbursement</th>
                <th className="py-2.5 px-4 text-right w-36">Amount (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-300">
              <tr className="min-h-[140px]">
                <td className="py-3 px-3 text-center border-r border-slate-900 font-mono align-top">1</td>
                <td className="py-3 px-4 border-r border-slate-900 space-y-2 align-top">
                  <p className="font-bold text-slate-900 text-sm">Paid To: {currentPay.supplierName}</p>
                  <p className="text-slate-600">
                    Disbursement against Vendor Bill Reference:{' '}
                    <strong className="font-mono text-slate-900">{currentPay.billNo}</strong>
                  </p>
                  <div className="text-[11px] text-slate-500 pt-2 space-y-0.5 border-t border-slate-200">
                    <p>Bank Name: <strong>{currentPay.bankName}</strong></p>
                    <p>Account No: <strong>{currentPay.accountNo}</strong> | IFSC: <strong>{currentPay.ifscCode}</strong></p>
                    <p>UTR / Transaction Ref: <strong>{currentPay.utrNo}</strong></p>
                  </div>
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-sm text-slate-900 align-top">
                  ₹{currentPay.amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
            <tfoot className="bg-slate-100 border-t-2 border-slate-900 font-bold text-xs">
              <tr>
                <td colSpan={2} className="py-2.5 px-4 text-right border-r border-slate-900 uppercase">
                  Total Voucher Disbursement Amount
                </td>
                <td className="py-2.5 px-4 text-right font-mono text-sm text-slate-900">
                  ₹{currentPay.amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Amount in Words Block */}
        <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-sans mb-8">
          <span className="font-bold text-slate-700">Amount in Words:</span>{' '}
          <span className="font-serif font-bold text-slate-900 text-sm italic">
            {numberToWordsIndian(currentPay.amountPaid)}
          </span>
        </div>

        {/* Official Authority Signatures */}
        <div className="mt-12 pt-6 border-t border-slate-400 grid grid-cols-4 gap-4 text-center text-xs font-sans">
          <div className="space-y-8">
            <div className="h-10 border-b border-dashed border-slate-400"></div>
            <div>
              <p className="font-bold text-slate-900">{settings.seniorAccountant}</p>
              <p className="text-[10px] text-slate-500">Prepared By (Sr. Accountant)</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="h-10 border-b border-dashed border-slate-400"></div>
            <div>
              <p className="font-bold text-slate-900">Accounts Officer</p>
              <p className="text-[10px] text-slate-500">Checked & Verified</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="h-10 border-b border-dashed border-slate-400"></div>
            <div>
              <p className="font-bold text-slate-900">{settings.internalAuditor}</p>
              <p className="text-[10px] text-slate-500">Internal Audit Approval</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="h-10 border-b border-dashed border-slate-400"></div>
            <div>
              <p className="font-bold text-slate-900">{settings.medicalSuperintendent}</p>
              <p className="text-[10px] text-slate-500">Medical Superintendent / Disbursing Officer</p>
            </div>
          </div>
        </div>

        {/* Revenue Stamp & Receiver Block */}
        <div className="mt-8 pt-4 flex items-end justify-between text-xs font-sans border-t border-slate-200">
          <div className="text-[10px] text-slate-400">
            System Generated Voucher • Government Hospital Accounts System
          </div>
          <div className="w-28 h-20 border border-slate-300 rounded flex items-center justify-center text-[10px] text-slate-400 text-center font-sans">
            Affix Revenue Stamp If Cash
          </div>
        </div>
      </div>
    </div>
  );
};
