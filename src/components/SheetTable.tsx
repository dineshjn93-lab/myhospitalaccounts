import React, { useState } from 'react';
import {
  Search,
  Plus,
  Trash2,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  X,
  Filter,
} from 'lucide-react';

export interface ColumnDef<T> {
  key: keyof T | string;
  header: string;
  type?: 'text' | 'number' | 'date' | 'select' | 'formula' | 'currency';
  options?: string[]; // for select dropdown
  required?: boolean;
  formulaDescription?: string;
  readOnly?: boolean;
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

interface SheetTableProps<T extends Record<string, any>> {
  title: string;
  description: string;
  columns: ColumnDef<T>[];
  data: T[];
  onAddRow?: (newRow: T) => void;
  onDeleteRow?: (index: number) => void;
  onUpdateRow?: (index: number, updatedRow: T) => void;
  duplicateCheckKey?: keyof T;
  newRowDefaults?: Partial<T>;
  customFormFields?: (formData: any, setFormData: React.Dispatch<React.SetStateAction<any>>) => React.ReactNode;
  summaryRow?: React.ReactNode;
}

export function SheetTable<T extends Record<string, any>>({
  title,
  description,
  columns,
  data,
  onAddRow,
  onDeleteRow,
  onUpdateRow,
  duplicateCheckKey,
  newRowDefaults = {},
  customFormFields,
  summaryRow,
}: SheetTableProps<T>) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>(newRowDefaults);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Search filtering
  const filteredData = data.filter((row) =>
    Object.values(row).some((val) =>
      String(val || '')
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  );

  // Check for duplicates in current dataset
  const getDuplicateCount = (val: string) => {
    if (!duplicateCheckKey || !val) return 0;
    return data.filter((item) => String(item[duplicateCheckKey]).toLowerCase() === String(val).toLowerCase()).length;
  };

  const handleInputChange = (key: string, value: any) => {
    const updated = { ...formData, [key]: value };
    setFormData(updated);

    if (duplicateCheckKey && key === duplicateCheckKey) {
      const dupCount = getDuplicateCount(value);
      if (dupCount > 0) {
        setDuplicateWarning(`⚠️ Duplicate value detected! '${value}' already exists in ${String(duplicateCheckKey)}.`);
      } else {
        setDuplicateWarning(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddRow) {
      onAddRow(formData);
    }
    setIsModalOpen(false);
    setFormData(newRowDefaults);
    setDuplicateWarning(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {data.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sheet data..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 sm:w-64"
            />
          </div>

          {/* Add Row Button */}
          {onAddRow && (
            <button
              onClick={() => {
                setFormData(newRowDefaults);
                setDuplicateWarning(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-all focus:ring-2 focus:ring-blue-400"
            >
              <Plus className="w-4 h-4" />
              <span>Add Entry</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid Sheet Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-900 text-slate-100 sticky top-0 z-10 select-none">
              <tr>
                <th className="py-2.5 px-3 w-10 text-center font-bold text-slate-400 border-r border-slate-800">
                  #
                </th>
                {columns.map((col) => (
                  <th
                    key={String(col.key)}
                    className="py-2.5 px-3.5 font-bold tracking-tight border-r border-slate-800 whitespace-nowrap"
                    style={{ width: col.width }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span>{col.header}</span>
                      {col.type === 'formula' && (
                        <span className="text-[9px] px-1 bg-blue-900 text-blue-200 rounded font-mono">
                          fx
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                {onDeleteRow && <th className="py-2.5 px-3 text-center w-12 font-bold">Action</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="py-12 text-center text-slate-400 text-xs">
                    No matching sheet records found.
                  </td>
                </tr>
              ) : (
                filteredData.map((row, rowIdx) => {
                  const isDup =
                    duplicateCheckKey &&
                    getDuplicateCount(String(row[duplicateCheckKey])) > 1;

                  return (
                    <tr
                      key={rowIdx}
                      className={`hover:bg-blue-50/40 transition-colors ${
                        isDup ? 'bg-rose-50/60 font-medium' : rowIdx % 2 === 1 ? 'bg-slate-50/50' : ''
                      }`}
                    >
                      <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px] border-r border-slate-200">
                        {rowIdx + 1}
                      </td>

                      {columns.map((col) => {
                        const cellVal = row[col.key as keyof T];

                        if (col.render) {
                          return (
                            <td key={String(col.key)} className="py-2 px-3.5 border-r border-slate-200">
                              {col.render(row, rowIdx)}
                            </td>
                          );
                        }

                        let formattedVal: React.ReactNode = cellVal;
                        if (col.type === 'currency' && typeof cellVal === 'number') {
                          formattedVal = `₹${cellVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
                        }

                        return (
                          <td
                            key={String(col.key)}
                            className={`py-2 px-3.5 border-r border-slate-200 whitespace-nowrap ${
                              col.type === 'currency' || col.type === 'number'
                                ? 'text-right font-mono text-slate-800'
                                : 'text-slate-700'
                            }`}
                          >
                            {col.type === 'formula' ? (
                              <span className="font-mono text-blue-700 bg-blue-50/80 px-1.5 py-0.5 rounded text-[11px] border border-blue-100">
                                {formattedVal}
                              </span>
                            ) : (
                              formattedVal
                            )}
                          </td>
                        );
                      })}

                      {onDeleteRow && (
                        <td className="py-2 px-3 text-center">
                          <button
                            onClick={() => onDeleteRow(data.indexOf(row))}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete row"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Summary / Totals Row */}
            {summaryRow && <tfoot className="bg-slate-100 border-t-2 border-slate-300 font-bold sticky bottom-0">{summaryRow}</tfoot>}
          </table>
        </div>
      </div>

      {/* Add New Record Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold">Add Entry into {title}</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {duplicateWarning && (
                <div className="p-3 bg-amber-50 border border-amber-300 text-amber-800 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>{duplicateWarning}</span>
                </div>
              )}

              {customFormFields
                ? customFormFields(formData, setFormData)
                : columns
                    .filter((c) => c.type !== 'formula' && !c.readOnly)
                    .map((col) => (
                      <div key={String(col.key)} className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                          <span>{col.header}</span>
                          {col.required && <span className="text-rose-500 text-[10px]">*Required</span>}
                        </label>

                        {col.type === 'select' && col.options ? (
                          <select
                            value={formData[col.key] || ''}
                            onChange={(e) => handleInputChange(String(col.key), e.target.value)}
                            required={col.required}
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">-- Select {col.header} --</option>
                            {col.options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type={col.type === 'number' || col.type === 'currency' ? 'number' : col.type === 'date' ? 'date' : 'text'}
                            step={col.type === 'number' || col.type === 'currency' ? 'any' : undefined}
                            value={formData[col.key] ?? ''}
                            onChange={(e) =>
                              handleInputChange(
                                String(col.key),
                                col.type === 'number' || col.type === 'currency' ? parseFloat(e.target.value) || 0 : e.target.value
                              )
                            }
                            required={col.required}
                            placeholder={`Enter ${col.header}...`}
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        )}
                      </div>
                    ))}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-sm transition-colors"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
