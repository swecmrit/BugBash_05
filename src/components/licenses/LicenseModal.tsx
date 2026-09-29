import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { SoftwareLicense, LicenseType, LicenseStatus } from '../../types';

interface LicenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  licenseToEdit?: SoftwareLicense | null;
}

export const LicenseModal: React.FC<LicenseModalProps> = ({
  isOpen,
  onClose,
  licenseToEdit,
}) => {
  const { addLicense, updateLicense, licenses } = useApp();

  const isEditing = Boolean(licenseToEdit);

  const [softwareName, setSoftwareName] = useState('');
  const [vendor, setVendor] = useState('');
  const [licenseKey, setLicenseKey] = useState('');
  const [licenseType, setLicenseType] = useState<LicenseType>('Annual');
  const [totalSeats, setTotalSeats] = useState<number | ''>(25);
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [expirationDate, setExpirationDate] = useState('');
  const [renewalCost, setRenewalCost] = useState<number | ''>(5000);
  const [status, setStatus] = useState<LicenseStatus>('Active');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    if (licenseToEdit) {
      setSoftwareName(licenseToEdit.softwareName);
      setVendor(licenseToEdit.vendor);
      setLicenseKey(licenseToEdit.licenseKey);
      setLicenseType(licenseToEdit.licenseType);
      setTotalSeats(licenseToEdit.totalSeats);
      setPurchaseDate(licenseToEdit.purchaseDate);
      setExpirationDate(licenseToEdit.expirationDate);
      setRenewalCost(licenseToEdit.renewalCost);
      setStatus(licenseToEdit.status);
      setErrors({});
    } else {
      setSoftwareName('');
      setVendor('');
      setLicenseKey(`LIC-KEY-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
      setLicenseType('Annual');
      setTotalSeats(25);
      const today = new Date();
      setPurchaseDate(today.toISOString().slice(0, 10));
      const exp = new Date(today);
      exp.setFullYear(exp.getFullYear() + 1);
      setExpirationDate(exp.toISOString().slice(0, 10));
      setRenewalCost(4800);
      setStatus('Active');
      setErrors({});
    }
  }, [licenseToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!softwareName.trim()) newErrors.softwareName = 'Software name is required.';
    if (!vendor.trim()) newErrors.vendor = 'Vendor name is required.';
    if (!licenseKey.trim()) newErrors.licenseKey = 'License key or subscription ID is required.';
    if (totalSeats === '' || isNaN(Number(totalSeats)) || Number(totalSeats) <= 0) {
      newErrors.totalSeats = 'Must have at least 1 total seat.';
    }
    if (isEditing && licenseToEdit && Number(totalSeats) < licenseToEdit.assignedSeats) {
      newErrors.totalSeats = `Cannot reduce total seats below current assigned seats (${licenseToEdit.assignedSeats}).`;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Auto calculate status based on expiry
    let computedStatus: LicenseStatus = status;
    if (expirationDate) {
      const exp = new Date(expirationDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffDays = (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays < 0) {
        computedStatus = 'Expired';
      } else if (diffDays <= 45) {
        computedStatus = 'Expiring Soon';
      } else {
        computedStatus = 'Active';
      }
    }

    if (isEditing && licenseToEdit) {
      const res = updateLicense(licenseToEdit.id, {
        softwareName: softwareName.trim(),
        vendor: vendor.trim(),
        licenseKey: licenseKey.trim(),
        licenseType,
        totalSeats: Number(totalSeats),
        purchaseDate,
        expirationDate,
        renewalCost: Number(renewalCost) || 0,
        status: computedStatus,
      });
      if (res.success) onClose();
    } else {
      const res = addLicense({
        softwareName: softwareName.trim(),
        vendor: vendor.trim(),
        licenseKey: licenseKey.trim(),
        licenseType,
        totalSeats: Number(totalSeats),
        purchaseDate,
        expirationDate,
        renewalCost: Number(renewalCost) || 0,
        status: computedStatus,
        assignedEmployeeIds: [],
      });
      if (res.success) onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit License: ${licenseToEdit?.softwareName}` : 'Add Software Subscription / License'}
      subtitle={
        isEditing
          ? 'Modify subscription seats, vendor details, and renewal pricing.'
          : 'Register corporate SaaS, desktop licenses, or developer toolkits.'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Name & Vendor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Software Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={softwareName}
              onChange={e => setSoftwareName(e.target.value)}
              placeholder="e.g. JetBrains All Products Pack"
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.softwareName ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {errors.softwareName && (
              <p className="text-rose-600 text-[11px] mt-1">{errors.softwareName}</p>
            )}
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Vendor / Publisher <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={vendor}
              onChange={e => setVendor(e.target.value)}
              placeholder="e.g. JetBrains s.r.o., Adobe, Microsoft"
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.vendor ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {errors.vendor && <p className="text-rose-600 text-[11px] mt-1">{errors.vendor}</p>}
          </div>
        </div>

        {/* License Key & Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block font-medium text-slate-700 mb-1">
              License Key / Sub Identifier <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={licenseKey}
              onChange={e => setLicenseKey(e.target.value)}
              placeholder="e.g. JB-ALL-CORP-48190"
              className={`w-full px-3 py-2 border rounded-lg font-mono uppercase ${
                errors.licenseKey ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {errors.licenseKey && (
              <p className="text-rose-600 text-[11px] mt-1">{errors.licenseKey}</p>
            )}
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Billing Cadence</label>
            <select
              value={licenseType}
              onChange={e => setLicenseType(e.target.value as LicenseType)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="Annual">Annual Subscription</option>
              <option value="Monthly">Monthly Subscription</option>
              <option value="Perpetual">Perpetual License</option>
            </select>
          </div>
        </div>

        {/* Seats, Cost */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Total Purchased Seats <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={totalSeats}
              onChange={e => setTotalSeats(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="25"
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.totalSeats ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {errors.totalSeats && (
              <p className="text-rose-600 text-[11px] mt-1">{errors.totalSeats}</p>
            )}
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Renewal Cost ($)</label>
            <input
              type="number"
              min="0"
              value={renewalCost}
              onChange={e => setRenewalCost(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="4800"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Purchase / Start Date</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={e => setPurchaseDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Renewal / Expiration Date
            </label>
            <input
              type="date"
              value={expirationDate}
              onChange={e => setExpirationDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-xs"
          >
            {isEditing ? 'Save License' : 'Register License'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
