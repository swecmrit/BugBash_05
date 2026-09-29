import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { MaintenanceRecord, MaintenancePriority, MaintenanceStatus, Asset } from '../../types';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordToEdit?: MaintenanceRecord | null;
  preselectedAsset?: Asset | null;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  onClose,
  recordToEdit,
  preselectedAsset,
}) => {
  const { assets, settings, createMaintenance, updateMaintenance } = useApp();

  const isEditing = Boolean(recordToEdit);

  const [assetId, setAssetId] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [reportedDate, setReportedDate] = useState(new Date().toISOString().slice(0, 10));
  const [priority, setPriority] = useState<MaintenancePriority>('Medium');
  const [technician, setTechnician] = useState(settings.technicians[0] || 'Internal IT Tech');
  const [estimatedCost, setEstimatedCost] = useState<number | ''>(150);
  const [actualCost, setActualCost] = useState<number | ''>('');
  const [status, setStatus] = useState<MaintenanceStatus>('Reported');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolveAction, setResolveAction] = useState<'Available' | 'Retired'>('Available');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Non-retired assets
  const eligibleAssets = useMemo(() => assets.filter(a => a.status !== 'Retired'), [assets]);

  useEffect(() => {
    if (!isOpen) return;

    if (recordToEdit) {
      setAssetId(recordToEdit.assetId);
      setIssueDescription(recordToEdit.issueDescription);
      setReportedDate(recordToEdit.reportedDate);
      setPriority(recordToEdit.priority);
      setTechnician(recordToEdit.technician);
      setEstimatedCost(recordToEdit.estimatedCost);
      setActualCost(recordToEdit.actualCost ?? '');
      setStatus(recordToEdit.status);
      setResolutionNotes(recordToEdit.resolutionNotes || '');
      setResolveAction('Available');
      setErrors({});
    } else {
      if (preselectedAsset) {
        setAssetId(preselectedAsset.id);
      } else if (eligibleAssets.length > 0) {
        setAssetId(eligibleAssets[0].id);
      }
      setIssueDescription('');
      setReportedDate(new Date().toISOString().slice(0, 10));
      setPriority('Medium');
      setTechnician(settings.technicians[0] || 'Internal IT Tech');
      setEstimatedCost(150);
      setActualCost('');
      setStatus('Reported');
      setResolutionNotes('');
      setResolveAction('Available');
      setErrors({});
    }
  }, [recordToEdit, preselectedAsset, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!assetId) newErrors.assetId = 'Hardware asset is required.';
    if (!issueDescription.trim()) newErrors.issueDescription = 'Issue description is required.';
    if (estimatedCost === '' || isNaN(Number(estimatedCost)) || Number(estimatedCost) < 0) {
      newErrors.estimatedCost = 'Valid estimated cost is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (isEditing && recordToEdit) {
      const updates: Partial<MaintenanceRecord> = {
        issueDescription: issueDescription.trim(),
        priority,
        technician,
        estimatedCost: Number(estimatedCost),
        actualCost: actualCost === '' ? undefined : Number(actualCost),
        status,
        resolutionNotes: resolutionNotes.trim() || undefined,
      };
      const res = updateMaintenance(recordToEdit.id, updates, resolveAction);
      if (res.success) onClose();
    } else {
      const payload = {
        assetId,
        issueDescription: issueDescription.trim(),
        reportedDate,
        priority,
        technician,
        estimatedCost: Number(estimatedCost),
        status,
        resolutionNotes: resolutionNotes.trim() || undefined,
      };
      const res = createMaintenance(payload);
      if (res.success) onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Maintenance Ticket: ${recordToEdit?.id}` : 'Log Maintenance Request'}
      subtitle={
        isEditing
          ? 'Update repair progress, log actual expenses, and record resolution details.'
          : 'Report hardware faults, order repairs, and lock asset in maintenance status.'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Asset Selection */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Target Hardware Asset <span className="text-rose-500">*</span>
          </label>
          <select
            value={assetId}
            disabled={isEditing}
            onChange={e => setAssetId(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg ${
              errors.assetId ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
            } ${isEditing ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white font-medium'}`}
          >
            {eligibleAssets.map(a => (
              <option key={a.id} value={a.id}>
                {a.id} — {a.name} ({a.category} · Status: {a.status})
              </option>
            ))}
          </select>
          {errors.assetId && <p className="text-rose-600 text-[11px] mt-1">{errors.assetId}</p>}
        </div>

        {/* Issue Description */}
        <div>
          <label className="block font-medium text-slate-700 mb-1">
            Issue Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            rows={2}
            value={issueDescription}
            onChange={e => setIssueDescription(e.target.value)}
            placeholder="Detailed symptoms, error diagnostics, physical damage or failure mode..."
            className={`w-full px-3 py-2 border rounded-lg bg-white ${
              errors.issueDescription ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
            }`}
          />
          {errors.issueDescription && (
            <p className="text-rose-600 text-[11px] mt-1">{errors.issueDescription}</p>
          )}
        </div>

        {/* Priority & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Priority Level</label>
            <select
              value={priority}
              onChange={e => setPriority(e.target.value as MaintenancePriority)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="Low">Low (Non-urgent / Routine)</option>
              <option value="Medium">Medium (Affects single user)</option>
              <option value="High">High (Urgent hardware failure)</option>
              <option value="Critical">Critical (Infrastructure / Security)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Maintenance Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as MaintenanceStatus)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="Reported">Reported</option>
              <option value="In Progress">In Progress</option>
              <option value="Awaiting Parts">Awaiting Parts</option>
              <option value="Resolved">Resolved (Complete)</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Technician & Costs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Assigned Technician</label>
            <select
              value={technician}
              onChange={e => setTechnician(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              {settings.technicians.map(t => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Est. Cost ($) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              value={estimatedCost}
              onChange={e => setEstimatedCost(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="150"
              className={`w-full px-3 py-2 border rounded-lg bg-white ${
                errors.estimatedCost ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Actual Final Cost ($)</label>
            <input
              type="number"
              min="0"
              value={actualCost}
              onChange={e => setActualCost(e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0 (e.g. warranty)"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            />
          </div>
        </div>

        {/* Resolution Notes & Post-Resolution Asset Status */}
        {status === 'Resolved' && (
          <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-lg space-y-3">
            <span className="font-semibold text-emerald-900 text-xs block">
              Resolution & Post-Repair Asset Routing
            </span>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Post-Repair Asset Condition
              </label>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="resolveAction"
                    value="Available"
                    checked={resolveAction === 'Available'}
                    onChange={() => setResolveAction('Available')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-800">Return to Available Inventory</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="resolveAction"
                    value="Retired"
                    checked={resolveAction === 'Retired'}
                    onChange={() => setResolveAction('Retired')}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span className="text-slate-800">Decommission / Retire (Beyond repair)</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">
                Resolution Notes
              </label>
              <textarea
                rows={2}
                value={resolutionNotes}
                onChange={e => setResolutionNotes(e.target.value)}
                placeholder="Diagnostic findings, replaced components, vendor work order #..."
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded bg-white text-xs"
              />
            </div>
          </div>
        )}

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
            {isEditing ? 'Save Updates' : 'Log Maintenance Ticket'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
