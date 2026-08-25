import React from 'react';
import { Settings as SettingsIcon, ShieldCheck, Building, Save } from 'lucide-react';
import { HospitalSettings } from '../types/hospital';

interface SettingsViewProps {
  settings: HospitalSettings;
  onUpdateSettings: (newSettings: HospitalSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onUpdateSettings }) => {
  const handleChange = (key: keyof HospitalSettings, value: any) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-blue-600" />
            <span>15. Hospital Master Settings & Protection Rules</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure hospital profile, opening balances, signatory designations, and formula protection settings
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-xs">
        {/* Hospital Identity */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-slate-600" />
            <span>Government Hospital Identity & Location</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Hospital Full Name</label>
              <input
                type="text"
                value={settings.hospitalName}
                onChange={(e) => handleChange('hospitalName', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Department / Ministry Name</label>
              <input
                type="text"
                value={settings.departmentName}
                onChange={(e) => handleChange('departmentName', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">District</label>
              <input
                type="text"
                value={settings.district}
                onChange={(e) => handleChange('district', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Registration Number</label>
              <input
                type="text"
                value={settings.registrationNo}
                onChange={(e) => handleChange('registrationNo', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Financial Year</label>
              <input
                type="text"
                value={settings.financialYear}
                onChange={(e) => handleChange('financialYear', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Opening Balances */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
            Financial Year Opening Balances (INR)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Opening Main Cash Balance</label>
              <input
                type="number"
                value={settings.openingCashBalance}
                onChange={(e) => handleChange('openingCashBalance', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Opening Petty Cash Imprest</label>
              <input
                type="number"
                value={settings.openingPettyCashBalance}
                onChange={(e) => handleChange('openingPettyCashBalance', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Opening Treasury Bank Total</label>
              <input
                type="number"
                value={settings.bankOpeningBalance}
                onChange={(e) => handleChange('bankOpeningBalance', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Signatories */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
            Official Voucher & Report Signatories
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Senior Accountant / Cashier</label>
              <input
                type="text"
                value={settings.seniorAccountant}
                onChange={(e) => handleChange('seniorAccountant', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Internal Auditor</label>
              <input
                type="text"
                value={settings.internalAuditor}
                onChange={(e) => handleChange('internalAuditor', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Medical Superintendent</label>
              <input
                type="text"
                value={settings.medicalSuperintendent}
                onChange={(e) => handleChange('medicalSuperintendent', e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Protection & Google Sheets Instructions */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sheet Protection & Google Sheets Export Instructions</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            • <strong>Formula Locking:</strong> In the exported <code>.xlsx</code> file, all formula cells (such as running balance, totals, GST calculations, and XLOOKUP queries) are set as protected/read-only. Data entry cells (particulars, amounts, dates, supplier names) remain editable.
          </p>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            • <strong>Uploading to Google Sheets:</strong> Simply download the <code>.xlsx</code> file using the "Export to Excel" button, then open Google Drive &rarr; New &rarr; File Upload &rarr; Open with Google Sheets. All 15 sheets and formulas will convert seamlessly.
          </p>
        </div>
      </div>
    </div>
  );
};
