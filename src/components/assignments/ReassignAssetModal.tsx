import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Asset } from '../../types';

interface ReassignAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}

export const ReassignAssetModal: React.FC<ReassignAssetModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  const { employees, reassignAsset } = useApp();

  const [newEmployeeId, setNewEmployeeId] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const currentEmployee = asset?.assignedToEmployeeId
    ? employees.find(e => e.id === asset.assignedToEmployeeId)
    : null;

  // Active employees excluding the current custodian
  const eligibleEmployees = employees.filter(
    e => e.status !== 'Inactive' && e.id !== asset?.assignedToEmployeeId
  );

  useEffect(() => {
    if (!isOpen) return;
    if (eligibleEmployees.length > 0) {
      setNewEmployeeId(eligibleEmployees[0].id);
    }
    setNotes('');
    setError('');
  }, [isOpen, asset]);

  if (!asset) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeId) {
      setError('Please select a recipient employee.');
      return;
    }

    const res = reassignAsset(asset.id, newEmployeeId, {
      notes: notes.trim() || undefined,
    });

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to reassign asset.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reassign Asset: ${asset.id}`}
      subtitle={`Transfer ${asset.name} from current custodian to a new team member.`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
            {error}
          </div>
        )}

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Asset:</span>
            <span className="font-semibold text-slate-900">
              {asset.id} · {asset.name}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Current Custodian:</span>
            <span className="font-semibold text-slate-900">
              {currentEmployee?.name || 'Unassigned'}
            </span>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">
            New Custodian (Active Employee) <span className="text-rose-500">*</span>
          </label>
          {eligibleEmployees.length === 0 ? (
            <p className="p-2.5 bg-amber-50 text-amber-800 rounded">
              No eligible active employees found for reassignment.
            </p>
          ) : (
            <select
              value={newEmployeeId}
              onChange={e => setNewEmployeeId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-slate-800"
            >
              {eligibleEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.id} · {emp.department} · {emp.location})
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Transfer Audit Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Reason for transfer (role change, project transition, relocation)..."
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
          />
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
            disabled={eligibleEmployees.length === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium shadow-xs"
          >
            Confirm Reassignment
          </button>
        </div>
      </form>
    </Modal>
  );
};
