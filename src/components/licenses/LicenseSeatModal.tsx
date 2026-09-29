import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { SoftwareLicense } from '../../types';
import { UserPlus, UserMinus, Search, Users, AlertCircle } from 'lucide-react';

interface LicenseSeatModalProps {
  isOpen: boolean;
  onClose: () => void;
  license: SoftwareLicense | null;
}

export const LicenseSeatModal: React.FC<LicenseSeatModalProps> = ({
  isOpen,
  onClose,
  license,
}) => {
  const { employees, assignLicenseSeat, revokeLicenseSeat } = useApp();

  const [searchEmployee, setSearchEmployee] = useState('');
  const [selectedEmpId, setSelectedEmpId] = useState('');

  if (!license) return null;

  const availableSeats = license.totalSeats - license.assignedSeats;
  const isFull = availableSeats <= 0;

  // Employees who currently have a seat
  const assignedEmployees = employees.filter(e =>
    license.assignedEmployeeIds.includes(e.id)
  );

  // Eligible active employees who don't have a seat yet
  const eligibleEmployees = employees.filter(
    e => e.status !== 'Inactive' && !license.assignedEmployeeIds.includes(e.id)
  );

  const filteredEligible = eligibleEmployees.filter(
    e =>
      e.name.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      e.email.toLowerCase().includes(searchEmployee.toLowerCase()) ||
      e.department.toLowerCase().includes(searchEmployee.toLowerCase())
  );

  const handleAssignSeat = (empId: string) => {
    assignLicenseSeat(license.id, empId);
    setSelectedEmpId('');
  };

  const handleRevokeSeat = (empId: string) => {
    revokeLicenseSeat(license.id, empId);
  };

  const pct = Math.round((license.assignedSeats / license.totalSeats) * 100);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Seat Allocation: ${license.softwareName}`}
      subtitle={`${license.vendor} · ${license.totalSeats} Total Seats`}
      maxWidth="xl"
    >
      <div className="space-y-4 text-xs text-slate-700">
        {/* Capacity Progress Bar */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900">Seat Utilization</span>
            <span className="font-mono text-slate-700 font-semibold tabular-nums">
              {license.assignedSeats} / {license.totalSeats} seats used ({pct}%)
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isFull
                  ? 'bg-rose-500'
                  : pct >= 80
                  ? 'bg-amber-500'
                  : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, pct)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Available Seats:{' '}
              <strong className={isFull ? 'text-rose-600' : 'text-emerald-700'}>
                {availableSeats}
              </strong>
            </span>
            {isFull && (
              <span className="text-rose-600 font-medium flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                All seats allocated
              </span>
            )}
          </div>
        </div>

        {/* Allocate new seat */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-2.5">
          <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
            <UserPlus className="w-4 h-4 text-blue-600" />
            <span>Allocate Seat to Staff Member</span>
          </h4>

          {isFull ? (
            <p className="text-[11px] text-rose-600 bg-rose-50 p-2 rounded border border-rose-200">
              Cannot assign seats. Capacity limit reached. Please increase purchased seat count in
              Edit License.
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={selectedEmpId}
                onChange={e => setSelectedEmpId(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800"
              >
                <option value="">— Select an eligible employee —</option>
                {filteredEligible.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.id} · {emp.department})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => selectedEmpId && handleAssignSeat(selectedEmpId)}
                disabled={!selectedEmpId || isFull}
                className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-xs"
              >
                Allocate
              </button>
            </div>
          )}
        </div>

        {/* Current Seat Holders List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-slate-900 flex items-center gap-1.5 text-xs">
              <Users className="w-4 h-4 text-slate-500" />
              <span>Current Seat Holders ({assignedEmployees.length})</span>
            </h4>
          </div>

          {assignedEmployees.length === 0 ? (
            <p className="p-4 text-center bg-slate-50 border border-slate-200 rounded-lg text-slate-400 italic">
              No employees currently assigned to this software seat.
            </p>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto bg-white">
              {assignedEmployees.map(emp => (
                <div
                  key={emp.id}
                  className="p-2.5 px-3 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-6 h-6 rounded text-white text-[10px] font-bold flex items-center justify-center shrink-0 ${
                        emp.avatarBg || 'bg-blue-600'
                      }`}
                    >
                      {emp.name
                        .split(' ')
                        .map(n => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block leading-tight">
                        {emp.name}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {emp.department} · {emp.email}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRevokeSeat(emp.id)}
                    className="px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 border border-rose-200 rounded transition-colors"
                  >
                    Revoke
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
};
