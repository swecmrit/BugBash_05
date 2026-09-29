import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SoftwareLicense } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatDate, formatCurrency, getDaysUntil } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csvExport';
import {
  Search,
  Plus,
  Download,
  KeyRound,
  Users,
  AlertTriangle,
  Clock,
  Edit2,
  Trash2,
  Calendar,
  Layers,
} from 'lucide-react';

interface LicensesViewProps {
  onOpenLicenseModal: (license?: SoftwareLicense) => void;
  onOpenSeatModal: (license: SoftwareLicense) => void;
}

export const LicensesView: React.FC<LicensesViewProps> = ({
  onOpenLicenseModal,
  onOpenSeatModal,
}) => {
  const { licenses, deleteLicense } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [licenseToDelete, setLicenseToDelete] = useState<SoftwareLicense | null>(null);

  // Summary Metrics
  const totalSpend = licenses.reduce((sum, l) => sum + l.renewalCost, 0);
  const expiringCount = licenses.filter(l => {
    const days = getDaysUntil(l.expirationDate);
    return days <= 45 && days >= 0;
  }).length;
  const expiredCount = licenses.filter(l => getDaysUntil(l.expirationDate) < 0).length;

  const filteredLicenses = useMemo(() => {
    return licenses.filter(lic => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        lic.softwareName.toLowerCase().includes(q) ||
        lic.vendor.toLowerCase().includes(q) ||
        lic.licenseKey.toLowerCase().includes(q);

      const days = getDaysUntil(lic.expirationDate);
      let matchesStatus = true;
      if (statusFilter === 'Active') {
        matchesStatus = days > 45;
      } else if (statusFilter === 'Expiring Soon') {
        matchesStatus = days <= 45 && days >= 0;
      } else if (statusFilter === 'Expired') {
        matchesStatus = days < 0;
      }

      return matchesSearch && matchesStatus;
    });
  }, [licenses, searchTerm, statusFilter]);

  const handleExportCSV = () => {
    exportToCSV('AssetFlow_Software_Licenses', filteredLicenses, [
      { header: 'License ID', key: 'id' },
      { header: 'Software Name', key: 'softwareName' },
      { header: 'Vendor', key: 'vendor' },
      { header: 'License Key', key: 'licenseKey' },
      { header: 'Billing Cadence', key: 'licenseType' },
      { header: 'Total Seats', key: 'totalSeats' },
      { header: 'Assigned Seats', key: 'assignedSeats' },
      { header: 'Available Seats', key: l => l.totalSeats - l.assignedSeats },
      {
        header: 'Seat Utilization (%)',
        key: l => Math.round((l.assignedSeats / l.totalSeats) * 100),
      },
      { header: 'Renewal Cost ($)', key: 'renewalCost' },
      { header: 'Purchase Date', key: 'purchaseDate' },
      { header: 'Expiration Date', key: 'expirationDate' },
      { header: 'Status', key: 'status' },
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Software Licenses & Subscriptions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage company SaaS subscriptions, allocated seats, renewals, and enterprise contracts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenLicenseModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add License</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Software Portfolio</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">{licenses.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">Active subscriptions & perpetual tools</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Expiring / Attention Required</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600 tabular-nums">
            {expiringCount + expiredCount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {expiringCount} expiring soon · {expiredCount} lapsed
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Annual License Spend</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {formatCurrency(totalSpend)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Total recurring subscription budget</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search software by name, vendor, license key..."
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
            >
              <option value="All">All Licenses</option>
              <option value="Active">Active (Healthy)</option>
              <option value="Expiring Soon">Expiring Soon (&lt; 45 Days)</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Licenses Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-600 uppercase tracking-wider select-none">
                <th className="py-3 px-4">Software Application</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4 hidden md:table-cell">Key / Identifier</th>
                <th className="py-3 px-4">Seat Utilization</th>
                <th className="py-3 px-4 hidden lg:table-cell text-right">Renewal Cost</th>
                <th className="py-3 px-4">Expiration</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLicenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <KeyRound className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">No matching software licenses</p>
                  </td>
                </tr>
              ) : (
                filteredLicenses.map(lic => {
                  const daysToExpiry = getDaysUntil(lic.expirationDate);
                  const utilPct = Math.round((lic.assignedSeats / lic.totalSeats) * 100);
                  const availableSeats = lic.totalSeats - lic.assignedSeats;

                  let statusVariant: 'Active' | 'Expiring Soon' | 'Expired' = 'Active';
                  if (daysToExpiry < 0) statusVariant = 'Expired';
                  else if (daysToExpiry <= 45) statusVariant = 'Expiring Soon';

                  return (
                    <tr key={lic.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 leading-tight">
                          {lic.softwareName}
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono block mt-0.5">
                          {lic.id} · {lic.licenseType}
                        </span>
                      </td>

                      {/* Vendor */}
                      <td className="py-3 px-4 text-slate-700 font-medium">{lic.vendor}</td>

                      {/* License Key */}
                      <td className="py-3 px-4 hidden md:table-cell font-mono text-[11px] text-slate-500">
                        {lic.licenseKey}
                      </td>

                      {/* Seat Utilization Bar */}
                      <td className="py-3 px-4 min-w-[180px]">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-semibold text-slate-800 tabular-nums">
                            {lic.assignedSeats} / {lic.totalSeats} seats
                          </span>
                          <span
                            className={`font-semibold tabular-nums ${
                              utilPct >= 100
                                ? 'text-rose-600'
                                : utilPct >= 80
                                ? 'text-amber-600'
                                : 'text-slate-600'
                            }`}
                          >
                            {utilPct}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              utilPct >= 100
                                ? 'bg-rose-500'
                                : utilPct >= 80
                                ? 'bg-amber-500'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(100, utilPct)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {availableSeats} seats available
                        </span>
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-4 hidden lg:table-cell text-right tabular-nums font-semibold text-slate-900 whitespace-nowrap">
                        {formatCurrency(lic.renewalCost)}
                      </td>

                      {/* Expiration date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="tabular-nums text-slate-800 block">
                          {formatDate(lic.expirationDate)}
                        </span>
                        <StatusBadge type="license" value={statusVariant} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenSeatModal(lic)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 font-medium text-xs transition-colors shadow-2xs"
                            title="Manage seat allocation"
                          >
                            <Users className="w-3.5 h-3.5 text-blue-600" />
                            <span>Seats ({lic.assignedSeats})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenLicenseModal(lic)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit license"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setLicenseToDelete(lic)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete license"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={Boolean(licenseToDelete)}
        onClose={() => setLicenseToDelete(null)}
        onConfirm={() => {
          if (licenseToDelete) {
            deleteLicense(licenseToDelete.id);
            setLicenseToDelete(null);
          }
        }}
        title={`Delete license ${licenseToDelete?.softwareName}?`}
        message="This will remove the software subscription and revoke all recorded seat assignments."
        confirmLabel="Delete License"
        variant="danger"
      />
    </div>
  );
};
