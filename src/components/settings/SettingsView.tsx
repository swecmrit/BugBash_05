import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmDialog } from '../common/ConfirmDialog';
import {
  Building2,
  MapPin,
  FolderTree,
  Wrench,
  Database,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  Check,
  Shield,
  Layers,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToSampleData,
    exportDatabaseJSON,
    importDatabaseJSON,
    assets,
    employees,
  } = useApp();

  // Company info form states
  const [companyName, setCompanyName] = useState(settings.companyName);
  const [organizationDomain, setOrganizationDomain] = useState(settings.organizationDomain);
  const [itAdminContact, setItAdminContact] = useState(settings.itAdminContact);
  const [primaryCurrency, setPrimaryCurrency] = useState(settings.primaryCurrency);
  const [fiscalYearStart, setFiscalYearStart] = useState(settings.fiscalYearStart);

  // New item inputs
  const [newDept, setNewDept] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newTech, setNewTech] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatMonths, setNewCatMonths] = useState(36);

  // Reset confirm dialog
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveCompanyInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName,
      organizationDomain,
      itAdminContact,
      primaryCurrency,
      fiscalYearStart,
    });
  };

  const handleAddDepartment = () => {
    if (!newDept.trim()) return;
    if (settings.departments.includes(newDept.trim())) return;
    updateSettings({
      departments: [...settings.departments, newDept.trim()],
    });
    setNewDept('');
  };

  const handleRemoveDepartment = (dept: string) => {
    updateSettings({
      departments: settings.departments.filter(d => d !== dept),
    });
  };

  const handleAddLocation = () => {
    if (!newLocation.trim()) return;
    if (settings.locations.includes(newLocation.trim())) return;
    updateSettings({
      locations: [...settings.locations, newLocation.trim()],
    });
    setNewLocation('');
  };

  const handleRemoveLocation = (loc: string) => {
    updateSettings({
      locations: settings.locations.filter(l => l !== loc),
    });
  };

  const handleAddTechnician = () => {
    if (!newTech.trim()) return;
    if (settings.technicians.includes(newTech.trim())) return;
    updateSettings({
      technicians: [...settings.technicians, newTech.trim()],
    });
    setNewTech('');
  };

  const handleRemoveTechnician = (tech: string) => {
    updateSettings({
      technicians: settings.technicians.filter(t => t !== tech),
    });
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const id = `cat-${Date.now().toString().slice(-4)}`;
    updateSettings({
      categories: [
        ...settings.categories,
        {
          id,
          name: newCatName.trim(),
          iconName: 'Laptop',
          defaultLifespanMonths: Number(newCatMonths) || 36,
        },
      ],
    });
    setNewCatName('');
    setNewCatMonths(36);
  };

  const handleRemoveCategory = (id: string) => {
    updateSettings({
      categories: settings.categories.filter(c => c.id !== id),
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        importDatabaseJSON(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">System Configuration</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage organization taxonomy, hardware categories, locations, and data backups.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Profile Settings */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Building2 className="w-4 h-4 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">Company Information</h3>
          </div>

          <form onSubmit={handleSaveCompanyInfo} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Primary Email Domain
                </label>
                <input
                  type="text"
                  value={organizationDomain}
                  onChange={e => setOrganizationDomain(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  IT Support Helpdesk Email
                </label>
                <input
                  type="email"
                  value={itAdminContact}
                  onChange={e => setItAdminContact(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Currency Format</label>
                <select
                  value={primaryCurrency}
                  onChange={e => setPrimaryCurrency(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="USD">USD ($ - United States Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="CAD">CAD ($ - Canadian Dollar)</option>
                  <option value="AUD">AUD ($ - Australian Dollar)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Fiscal Year Start</label>
                <select
                  value={fiscalYearStart}
                  onChange={e => setFiscalYearStart(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                >
                  <option value="January">January</option>
                  <option value="April">April</option>
                  <option value="July">July</option>
                  <option value="October">October</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
              >
                Save Organization Info
              </button>
            </div>
          </form>
        </div>

        {/* Database & Persistence Controls */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Database className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Storage & Data Management</h3>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            AssetFlow stores all records directly within your browser&apos;s isolated persistent
            localStorage. You can export complete snapshots for offsite archival, or restore seed
            samples.
          </p>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs">
            <div className="flex items-center justify-between font-medium">
              <span className="text-slate-600">Total Hardware Assets:</span>
              <span className="font-bold text-slate-900 tabular-nums">{assets.length} items</span>
            </div>
            <div className="flex items-center justify-between font-medium">
              <span className="text-slate-600">Personnel Records:</span>
              <span className="font-bold text-slate-900 tabular-nums">
                {employees.length} employees
              </span>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={exportDatabaseJSON}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>Export System JSON</span>
              </button>

              <label className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                <span>Import Backup</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileInput}
                  className="hidden"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Default Enterprise Seed Data</span>
            </button>
          </div>
        </div>

        {/* Department Configuration */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Departments</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold tabular-nums">
              {settings.departments.length} units
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newDept}
              onChange={e => setNewDept(e.target.value)}
              placeholder="e.g. Data & Analytics"
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
            />
            <button
              type="button"
              onClick={handleAddDepartment}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto text-xs">
            {settings.departments.map(dept => {
              const staffCount = employees.filter(e => e.department === dept).length;
              return (
                <div key={dept} className="p-2.5 px-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-900">{dept}</span>
                    <span className="text-[11px] text-slate-400 block">{staffCount} staff</span>
                  </div>
                  {settings.departments.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDepartment(dept)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Office Locations Configuration */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Office Facilities & Hubs</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold tabular-nums">
              {settings.locations.length} locations
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newLocation}
              onChange={e => setNewLocation(e.target.value)}
              placeholder="e.g. Austin Regional Office"
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
            />
            <button
              type="button"
              onClick={handleAddLocation}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto text-xs">
            {settings.locations.map(loc => (
              <div key={loc} className="p-2.5 px-3 flex items-center justify-between">
                <span className="font-semibold text-slate-900">{loc}</span>
                {settings.locations.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveLocation(loc)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Asset Categories Configuration */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-sm">Equipment Categories</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold tabular-nums">
              {settings.categories.length} categories
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              placeholder="Category name..."
              className="sm:col-span-2 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
            />
            <button
              type="button"
              onClick={handleAddCategory}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Category
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto text-xs">
            {settings.categories.map(cat => (
              <div key={cat.id} className="p-2.5 px-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-900">{cat.name}</span>
                  <span className="text-[10px] text-slate-400 block">
                    Default lifespan: {cat.defaultLifespanMonths} months
                  </span>
                </div>
                {settings.categories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(cat.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Technicians Configuration */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-sm">Authorized Technicians & Vendors</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold tabular-nums">
              {settings.technicians.length} techs
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTech}
              onChange={e => setNewTech(e.target.value)}
              placeholder="e.g. Cisco SmartNet Support"
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white"
            />
            <button
              type="button"
              onClick={handleAddTechnician}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto text-xs">
            {settings.technicians.map(t => (
              <div key={t} className="p-2.5 px-3 flex items-center justify-between">
                <span className="font-semibold text-slate-900">{t}</span>
                {settings.technicians.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTechnician(t)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirm Reset Dialog */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={resetToSampleData}
        title="Reset Entire System to Sample Enterprise Data?"
        message="This will overwrite all assets, personnel, software licenses, and repair records with the pristine initial corporate dataset. Any custom records created during this session will be replaced."
        confirmLabel="Yes, Reset Data"
        variant="danger"
      />
    </div>
  );
};
