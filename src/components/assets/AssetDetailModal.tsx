import React from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Asset } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  formatCurrency,
  formatDate,
  getDaysUntil,
} from '../../utils/formatters';
import {
  Laptop,
  Calendar,
  ShieldCheck,
  User,
  Wrench,
  History,
  Tag,
  MapPin,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';

interface AssetDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset | null;
  onEdit: (asset: Asset) => void;
  onAssign: (asset: Asset) => void;
  onReturn: (asset: Asset) => void;
  onRequestMaintenance: (asset: Asset) => void;
  onRetire: (asset: Asset) => void;
}

export const AssetDetailModal: React.FC<AssetDetailModalProps> = ({
  isOpen,
  onClose,
  asset,
  onEdit,
  onAssign,
  onReturn,
  onRequestMaintenance,
  onRetire,
}) => {
  const { employees, assignments, maintenance, setActiveTab } = useApp();

  if (!asset) return null;

  const currentEmployee = asset.assignedToEmployeeId
    ? employees.find(e => e.id === asset.assignedToEmployeeId)
    : null;

  const assetAssignments = assignments.filter(as => as.assetId === asset.id);
  const assetMaintenance = maintenance.filter(m => m.assetId === asset.id);

  const daysToWarranty = asset.warrantyExpiry ? getDaysUntil(asset.warrantyExpiry) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${asset.id} · ${asset.name}`}
      subtitle={`${asset.manufacturer} ${asset.model} · Serial: ${asset.serialNumber}`}
      maxWidth="3xl"
    >
      <div className="space-y-6 text-xs text-slate-700">
        {/* Quick action bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Status:</span>
            <StatusBadge type="asset" value={asset.status} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {asset.status === 'Available' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAssign(asset);
                }}
                className="px-3 py-1.5 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-xs"
              >
                Assign Asset
              </button>
            )}

            {asset.status === 'Assigned' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onReturn(asset);
                }}
                className="px-3 py-1.5 font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                Process Return
              </button>
            )}

            {asset.status !== 'In Maintenance' && asset.status !== 'Retired' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestMaintenance(asset);
                }}
                className="px-3 py-1.5 font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors"
              >
                Request Maintenance
              </button>
            )}

            {asset.status !== 'Retired' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRetire(asset);
                }}
                className="px-3 py-1.5 font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
              >
                Retire
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(asset);
              }}
              className="px-3 py-1.5 font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              Edit Specs
            </button>
          </div>
        </div>

        {/* Core Attributes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-2">
            <span className="font-semibold text-slate-900 block border-b border-slate-100 pb-1.5">
              Equipment Details
            </span>
            <div className="space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Category:</span>
                <span className="font-medium text-slate-800">{asset.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Manufacturer:</span>
                <span className="font-medium text-slate-800">{asset.manufacturer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Model:</span>
                <span className="font-medium text-slate-800">{asset.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Serial No:</span>
                <span className="font-mono font-medium text-slate-900 tabular-nums">
                  {asset.serialNumber}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-2">
            <span className="font-semibold text-slate-900 block border-b border-slate-100 pb-1.5">
              Financials & Warranty
            </span>
            <div className="space-y-1.5 text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Purchase Date:</span>
                <span className="tabular-nums font-medium text-slate-800">
                  {formatDate(asset.purchaseDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Acquisition Cost:</span>
                <span className="font-semibold text-slate-900 tabular-nums">
                  {formatCurrency(asset.purchaseCost)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Warranty Expiry:</span>
                <span className="tabular-nums font-medium text-slate-800">
                  {formatDate(asset.warrantyExpiry)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Warranty Status:</span>
                {daysToWarranty !== null ? (
                  daysToWarranty > 0 ? (
                    <span
                      className={`tabular-nums font-medium ${
                        daysToWarranty < 90 ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {daysToWarranty} days remaining
                    </span>
                  ) : (
                    <span className="font-medium text-rose-600">Expired</span>
                  )
                ) : (
                  <span>—</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-white border border-slate-200 rounded-lg space-y-2">
            <span className="font-semibold text-slate-900 block border-b border-slate-100 pb-1.5">
              Current Allocation
            </span>
            <div className="space-y-1.5 text-slate-600">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Custodian:</span>
                {currentEmployee ? (
                  <span className="font-medium text-blue-600 flex items-center gap-1">
                    <User className="w-3.5 h-3.5" />
                    {currentEmployee.name}
                  </span>
                ) : (
                  <span className="italic text-slate-400">In Storage Stock</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Department:</span>
                <span className="font-medium text-slate-800">{asset.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Facility / Site:</span>
                <span className="font-medium text-slate-800">{asset.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications block */}
        {asset.specifications && Object.values(asset.specifications).some(Boolean) && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-semibold text-slate-900 block mb-2">Technical Specifications</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-600">
              {asset.specifications.processor && (
                <div>
                  <span className="text-slate-400 text-[11px] block">Processor</span>
                  <span className="font-medium text-slate-800">{asset.specifications.processor}</span>
                </div>
              )}
              {asset.specifications.ram && (
                <div>
                  <span className="text-slate-400 text-[11px] block">RAM</span>
                  <span className="font-medium text-slate-800">{asset.specifications.ram}</span>
                </div>
              )}
              {asset.specifications.storage && (
                <div>
                  <span className="text-slate-400 text-[11px] block">Storage</span>
                  <span className="font-medium text-slate-800">{asset.specifications.storage}</span>
                </div>
              )}
              {asset.specifications.os && (
                <div>
                  <span className="text-slate-400 text-[11px] block">OS / Firmware</span>
                  <span className="font-medium text-slate-800">{asset.specifications.os}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Deployment notes */}
        {asset.notes && (
          <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-lg text-slate-700">
            <span className="font-semibold text-amber-900 block mb-1">Deployment & IT Notes</span>
            <p className="leading-relaxed">{asset.notes}</p>
          </div>
        )}

        {/* Assignment History Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
              <History className="w-4 h-4 text-blue-600" />
              <span>Assignment History ({assetAssignments.length})</span>
            </h4>
          </div>

          {assetAssignments.length === 0 ? (
            <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 italic">
              No historical assignments recorded for this asset.
            </p>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
              {assetAssignments.map(asg => {
                const emp = employees.find(e => e.id === asg.employeeId);
                return (
                  <div key={asg.id} className="p-3 flex items-start justify-between gap-4 bg-white">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">
                          {emp ? emp.name : asg.employeeId}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-slate-500 font-mono text-[11px]">{asg.id}</span>
                        <span className="text-slate-400">·</span>
                        <span
                          className={`font-medium text-[11px] ${
                            asg.status === 'Active' ? 'text-emerald-600' : 'text-slate-500'
                          }`}
                        >
                          {asg.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Assigned on {formatDate(asg.assignedDate)}
                        {asg.actualReturnDate && ` — Returned on ${formatDate(asg.actualReturnDate)}`}
                        {asg.assignedBy && ` · Handled by ${asg.assignedBy}`}
                      </div>
                      {asg.returnNotes && (
                        <p className="text-[11px] text-slate-600 mt-1 bg-slate-50 p-1.5 rounded">
                          Return condition: {asg.conditionOnReturn || 'Standard'} · {asg.returnNotes}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Maintenance History Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-amber-600" />
              <span>Maintenance Records ({assetMaintenance.length})</span>
            </h4>
          </div>

          {assetMaintenance.length === 0 ? (
            <p className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-400 italic">
              No repairs or maintenance tickets on record.
            </p>
          ) : (
            <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100">
              {assetMaintenance.map(mnt => (
                <div key={mnt.id} className="p-3 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{mnt.id}</span>
                      <StatusBadge type="maintenance-status" value={mnt.status} />
                      <StatusBadge type="maintenance-priority" value={mnt.priority} />
                    </div>
                    <span className="text-[11px] text-slate-500 tabular-nums">
                      Reported: {formatDate(mnt.reportedDate)}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-normal">{mnt.issueDescription}</p>
                  <div className="mt-1.5 text-[11px] text-slate-500 flex items-center gap-4">
                    <span>Tech: {mnt.technician}</span>
                    <span>Est. Cost: {formatCurrency(mnt.estimatedCost)}</span>
                    {mnt.actualCost !== undefined && (
                      <span className="font-medium text-slate-700">
                        Actual Cost: {formatCurrency(mnt.actualCost)}
                      </span>
                    )}
                  </div>
                  {mnt.resolutionNotes && (
                    <div className="mt-1.5 p-1.5 bg-emerald-50/50 border border-emerald-100 rounded text-[11px] text-emerald-800">
                      Resolution: {mnt.resolutionNotes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
