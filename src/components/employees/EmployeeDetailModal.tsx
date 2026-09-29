import React from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Employee, Asset } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import {
  User,
  Mail,
  Building,
  MapPin,
  Laptop,
  KeyRound,
  History,
  Phone,
  Calendar,
  ArrowRight,
  Plus,
  RefreshCw,
} from 'lucide-react';

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
  onEditEmployee: (employee: Employee) => void;
  onAssignAssetToEmployee: (employee: Employee) => void;
  onReassignAsset: (asset: Asset) => void;
  onReturnAsset: (asset: Asset) => void;
}

export const EmployeeDetailModal: React.FC<EmployeeDetailModalProps> = ({
  isOpen,
  onClose,
  employee,
  onEditEmployee,
  onAssignAssetToEmployee,
  onReassignAsset,
  onReturnAsset,
}) => {
  const { assets, assignments, licenses, revokeLicenseSeat } = useApp();

  if (!employee) return null;

  // Assets currently assigned to this employee
  const currentAssets = assets.filter(
    a => a.assignedToEmployeeId === employee.id && a.status === 'Assigned'
  );

  // Licenses currently assigned to this employee
  const currentLicenses = licenses.filter(lic =>
    lic.assignedEmployeeIds.includes(employee.id)
  );

  // Past assignments for this employee
  const employeeHistory = assignments.filter(as => as.employeeId === employee.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${employee.name} · ${employee.id}`}
      subtitle={`${employee.designation} — ${employee.department}`}
      maxWidth="3xl"
    >
      <div className="space-y-6 text-xs text-slate-700">
        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-12 h-12 rounded-xl text-white font-bold flex items-center justify-center text-base shadow-xs ${
                employee.avatarBg || 'bg-blue-600'
              }`}
            >
              {employee.name
                .split(' ')
                .map(n => n[0])
                .slice(0, 2)
                .join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">{employee.name}</h3>
                <StatusBadge type="employee" value={employee.status} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{employee.designation}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {employee.status !== 'Inactive' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAssignAssetToEmployee(employee);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Assign Equipment</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onEditEmployee(employee);
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <span className="text-[11px] text-slate-400 block mb-0.5">Email</span>
            <span className="font-medium text-slate-800 break-all">{employee.email}</span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <span className="text-[11px] text-slate-400 block mb-0.5">Department</span>
            <span className="font-medium text-slate-800">{employee.department}</span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <span className="text-[11px] text-slate-400 block mb-0.5">Location</span>
            <span className="font-medium text-slate-800">{employee.location}</span>
          </div>

          <div className="p-3 bg-white border border-slate-200 rounded-lg">
            <span className="text-[11px] text-slate-400 block mb-0.5">Join Date</span>
            <span className="font-medium text-slate-800 tabular-nums">
              {formatDate(employee.joinDate)}
            </span>
          </div>
        </div>

        {/* Currently Assigned Hardware Assets */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Laptop className="w-4 h-4 text-blue-600" />
              <span>Assigned Hardware ({currentAssets.length})</span>
            </h4>
          </div>

          {currentAssets.length === 0 ? (
            <div className="p-4 text-center bg-slate-50 border border-slate-200 rounded-lg text-slate-500">
              No hardware assets currently assigned to this employee.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 bg-white">
              {currentAssets.map(asset => (
                <div
                  key={asset.id}
                  className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-semibold text-blue-600">{asset.id}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-semibold text-slate-900">{asset.name}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {asset.category} · Serial: <span className="font-mono">{asset.serialNumber}</span>
                      {asset.specifications?.ram && ` · ${asset.specifications.ram}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onReassignAsset(asset);
                      }}
                      className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded font-medium transition-colors"
                    >
                      Reassign
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onReturnAsset(asset);
                      }}
                      className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded font-medium transition-colors"
                    >
                      Return
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Software Licenses */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-purple-600" />
              <span>Software Subscriptions & Licenses ({currentLicenses.length})</span>
            </h4>
          </div>

          {currentLicenses.length === 0 ? (
            <div className="p-4 text-center bg-slate-50 border border-slate-200 rounded-lg text-slate-500">
              No software seats allocated.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 bg-white">
              {currentLicenses.map(lic => (
                <div
                  key={lic.id}
                  className="p-3 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold text-slate-900">{lic.softwareName}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {lic.vendor} · Exp: {formatDate(lic.expirationDate)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => revokeLicenseSeat(lic.id, employee.id)}
                    className="px-2.5 py-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  >
                    Revoke Seat
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assignment History */}
        <div>
          <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 mb-2">
            <History className="w-4 h-4 text-slate-500" />
            <span>Personnel Asset Audit Trail ({employeeHistory.length})</span>
          </h4>

          {employeeHistory.length === 0 ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 italic">
              No historical assignments recorded.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 bg-white">
              {employeeHistory.map(asg => {
                const asset = assets.find(a => a.id === asg.assetId);
                return (
                  <div key={asg.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-medium text-slate-800">{asg.assetId}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-semibold text-slate-900">
                          {asset?.name || 'Equipment'}
                        </span>
                      </div>
                      <span
                        className={`font-medium ${
                          asg.status === 'Active' ? 'text-emerald-600' : 'text-slate-500'
                        }`}
                      >
                        {asg.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Assigned: {formatDate(asg.assignedDate)}
                      {asg.actualReturnDate && ` — Returned: ${formatDate(asg.actualReturnDate)}`}
                      {asg.returnNotes && ` (${asg.returnNotes})`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
