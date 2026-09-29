import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Asset, MaintenancePriority } from '../../types';

interface ReturnAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
}

export const ReturnAssetModal: React.FC<ReturnAssetModalProps> = ({
  isOpen,
  onClose,
  asset,
}) => {
  const { assignments, employees, returnAsset, settings } = useApp();

  const [returnCondition, setReturnCondition] = useState('Good / Functional');
  const [returnNotes, setReturnNotes] = useState('');
  const [transitionTo, setTransitionTo] = useState<'Available' | 'In Maintenance'>('Available');

  // Maintenance fields if marked for maintenance
  const [issue, setIssue] = useState('');
  const [priority, setPriority] = useState<MaintenancePriority>('Medium');
  const [technician, setTechnician] = useState(settings.technicians[0] || 'Internal IT Tech');
  const [estimatedCost, setEstimatedCost] = useState(150);
  const [error, setError] = useState('');

  // Find active assignment for this asset
  const activeAssignment = asset
    ? assignments.find(as => as.assetId === asset.id && as.status === 'Active')
    : null;

  const employee = activeAssignment
    ? employees.find(e => e.id === activeAssignment.employeeId)
    : null;

  useEffect(() => {
    if (!isOpen) return;
    setReturnCondition('Good / Functional');
    setReturnNotes('');
    setTransitionTo('Available');
    setIssue('');
    setPriority('Medium');
    setTechnician(settings.technicians[0] || 'Internal IT Tech');
    setEstimatedCost(150);
    setError('');
  }, [isOpen, asset]);

  if (!asset || !activeAssignment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transitionTo === 'In Maintenance' && !issue.trim()) {
      setError('Please provide a description of the issue requiring maintenance.');
      return;
    }

    const res = returnAsset(activeAssignment.id, {
      returnCondition,
      returnNotes: returnNotes.trim() || undefined,
      transitionTo,
      maintenanceDetails:
        transitionTo === 'In Maintenance'
          ? {
              issue: issue.trim(),
              priority,
              technician,
              estimatedCost: Number(estimatedCost) || 0,
            }
          : undefined,
    });

    if (res.success) {
      onClose();
    } else {
      setError(res.error || 'Failed to process return.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Process Return: ${asset.id}`}
      subtitle={`Checking in ${asset.name} from ${employee?.name || activeAssignment.employeeId}`}
      maxWidth="lg"
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
            <span className="font-medium text-slate-800">{employee?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Assigned On:</span>
            <span className="font-mono text-slate-700">{activeAssignment.assignedDate}</span>
          </div>
        </div>

        {/* Condition upon check-in */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Condition Upon Return <span className="text-rose-500">*</span>
          </label>
          <select
            value={returnCondition}
            onChange={e => {
              const val = e.target.value;
              setReturnCondition(val);
              if (val.includes('Damaged') || val.includes('Defective') || val.includes('Hardware')) {
                setTransitionTo('In Maintenance');
                if (!issue) setIssue(`Returned with issues: ${val}`);
              }
            }}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
          >
            <option value="Good / Functional (Clean)">Good / Functional (Clean)</option>
            <option value="Normal Wear & Tear">Normal Wear & Tear</option>
            <option value="Damaged Keyboard / Trackpad">Damaged Keyboard / Trackpad</option>
            <option value="Screen Defect / Dead Pixels / Cracked Glass">
              Screen Defect / Dead Pixels / Cracked Glass
            </option>
            <option value="Battery Swollen / Overheating Warning">
              Battery Swollen / Overheating Warning
            </option>
            <option value="Hardware / Motherboard Issue">Hardware / Motherboard Issue</option>
          </select>
        </div>

        {/* Post-return destination state */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Post-Return Asset Status <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setTransitionTo('Available')}
              className={`p-3 text-left border rounded-lg transition-colors ${
                transitionTo === 'Available'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-1 ring-blue-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="font-semibold text-xs mb-0.5">Return to Available Stock</div>
              <div className="text-[11px] text-slate-500">
                Equipment is verified working and ready for immediate reassignment.
              </div>
            </button>

            <button
              type="button"
              onClick={() => setTransitionTo('In Maintenance')}
              className={`p-3 text-left border rounded-lg transition-colors ${
                transitionTo === 'In Maintenance'
                  ? 'border-amber-600 bg-amber-50/50 text-amber-900 ring-1 ring-amber-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="font-semibold text-xs mb-0.5">Route to Maintenance</div>
              <div className="text-[11px] text-slate-500">
                Lock asset against checkout and open a diagnostic / repair ticket.
              </div>
            </button>
          </div>
        </div>

        {/* If Maintenance is selected, collect ticket details */}
        {transitionTo === 'In Maintenance' && (
          <div className="p-3.5 bg-amber-50/60 border border-amber-200 rounded-lg space-y-3">
            <span className="font-semibold text-amber-900 text-xs block">
              Automated Maintenance Ticket Details
            </span>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Issue Description <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={issue}
                onChange={e => setIssue(e.target.value)}
                placeholder="e.g. Swollen battery causing casing deformation"
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as MaintenancePriority)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Assigned Technician
                </label>
                <select
                  value={technician}
                  onChange={e => setTechnician(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs"
                >
                  {settings.technicians.map(t => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">
                  Est. Repair Cost ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={estimatedCost}
                  onChange={e => setEstimatedCost(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Check-in notes */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">Check-in Notes</label>
          <textarea
            rows={2}
            value={returnNotes}
            onChange={e => setReturnNotes(e.target.value)}
            placeholder="Returned accessories, sanitized disk, physical condition..."
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-xs"
          >
            Confirm Return
          </button>
        </div>
      </form>
    </Modal>
  );
};
