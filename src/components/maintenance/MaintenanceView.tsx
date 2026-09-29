import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { MaintenanceRecord, Asset } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Pagination } from '../common/Pagination';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csvExport';
import {
  Search,
  Plus,
  Download,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  Edit2,
  Trash2,
  Laptop,
} from 'lucide-react';

interface MaintenanceViewProps {
  onOpenCreateModal: () => void;
  onOpenEditModal: (record: MaintenanceRecord) => void;
  onOpenAssetDetail: (asset: Asset) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  onOpenCreateModal,
  onOpenEditModal,
  onOpenAssetDetail,
}) => {
  const { maintenance, assets, deleteMaintenance } = useApp();

  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [recordToDelete, setRecordToDelete] = useState<MaintenanceRecord | null>(null);

  // Key metrics
  const activeTickets = maintenance.filter(
    m => m.status === 'Reported' || m.status === 'In Progress' || m.status === 'Awaiting Parts'
  );
  const criticalTickets = activeTickets.filter(
    m => m.priority === 'Critical' || m.priority === 'High'
  );
  const totalRepairSpend = maintenance.reduce(
    (sum, m) => sum + (m.actualCost ?? m.estimatedCost),
    0
  );

  const filteredRecords = useMemo(() => {
    return maintenance.filter(rec => {
      const asset = assets.find(a => a.id === rec.assetId);
      const q = searchTerm.toLowerCase().trim();

      const matchesSearch =
        !q ||
        rec.id.toLowerCase().includes(q) ||
        rec.assetId.toLowerCase().includes(q) ||
        rec.issueDescription.toLowerCase().includes(q) ||
        rec.technician.toLowerCase().includes(q) ||
        (asset && asset.name.toLowerCase().includes(q));

      const matchesStatus = selectedStatus === 'All' || rec.status === selectedStatus;
      const matchesPriority = selectedPriority === 'All' || rec.priority === selectedPriority;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [maintenance, searchTerm, selectedStatus, selectedPriority, assets]);

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      return new Date(b.reportedDate).getTime() - new Date(a.reportedDate).getTime();
    });
  }, [filteredRecords]);

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedRecords.slice(start, start + pageSize);
  }, [sortedRecords, currentPage, pageSize]);

  const handleExportCSV = () => {
    exportToCSV('AssetFlow_Maintenance', sortedRecords, [
      { header: 'Maintenance ID', key: 'id' },
      { header: 'Asset ID', key: 'assetId' },
      {
        header: 'Asset Name',
        key: m => assets.find(a => a.id === m.assetId)?.name || 'Unknown',
      },
      { header: 'Issue Description', key: 'issueDescription' },
      { header: 'Status', key: 'status' },
      { header: 'Priority', key: 'priority' },
      { header: 'Assigned Technician', key: 'technician' },
      { header: 'Estimated Cost ($)', key: 'estimatedCost' },
      { header: 'Actual Cost ($)', key: m => m.actualCost ?? '' },
      { header: 'Reported Date', key: 'reportedDate' },
      { header: 'Completed Date', key: 'completedDate' },
      { header: 'Resolution Notes', key: 'resolutionNotes' },
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Hardware Maintenance & Repairs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Diagnose equipment, dispatch certified technicians, track repair costs and resolution
            timelines.
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
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Request</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Active Maintenance Tickets</span>
            <Wrench className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {activeTickets.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Hardware assets currently offline for diagnostics
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Critical / High Urgency</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 tabular-nums">
            {criticalTickets.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Requiring immediate vendor dispatch</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Total Maintenance Expenditure</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {formatCurrency(totalRepairSpend)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Actual & estimated repair invoices</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter by issue, ticket ID, asset ID, or technician..."
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Reported">Reported</option>
              <option value="In Progress">In Progress</option>
              <option value="Awaiting Parts">Awaiting Parts</option>
              <option value="Resolved">Resolved</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={selectedPriority}
              onChange={e => {
                setSelectedPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-600 uppercase tracking-wider select-none">
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Hardware Asset</th>
                <th className="py-3 px-4">Issue Description</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 hidden md:table-cell">Technician</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 hidden lg:table-cell text-right">Cost</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">No maintenance tickets found</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      All company equipment is currently in working condition.
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map(rec => {
                  const asset = assets.find(a => a.id === rec.assetId);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700 whitespace-nowrap">
                        {rec.id}
                      </td>

                      {/* Asset */}
                      <td className="py-3 px-4">
                        {asset ? (
                          <div
                            onClick={() => onOpenAssetDetail(asset)}
                            className="cursor-pointer group"
                          >
                            <span className="font-semibold text-blue-600 group-hover:underline">
                              {asset.name}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono block">
                              {asset.id} · {asset.category}
                            </span>
                          </div>
                        ) : (
                          <span className="font-mono text-slate-700">{rec.assetId}</span>
                        )}
                      </td>

                      {/* Issue */}
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-slate-800 line-clamp-2 leading-relaxed">
                          {rec.issueDescription}
                        </p>
                        <span className="text-[10px] text-slate-400 tabular-nums block mt-0.5">
                          Reported: {formatDate(rec.reportedDate)}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge type="maintenance-priority" value={rec.priority} />
                      </td>

                      {/* Tech */}
                      <td className="py-3 px-4 hidden md:table-cell text-slate-700">
                        {rec.technician}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge type="maintenance-status" value={rec.status} />
                      </td>

                      {/* Cost */}
                      <td className="py-3 px-4 hidden lg:table-cell text-right tabular-nums whitespace-nowrap">
                        {rec.actualCost !== undefined ? (
                          <div>
                            <span className="font-semibold text-slate-900 block">
                              {formatCurrency(rec.actualCost)}
                            </span>
                            <span className="text-[10px] text-slate-400 block">Final Cost</span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-slate-700 block">
                              {formatCurrency(rec.estimatedCost)}
                            </span>
                            <span className="text-[10px] text-slate-400 block">Est. Cost</span>
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenEditModal(rec)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 font-medium text-xs transition-colors shadow-2xs"
                            title="Update ticket or resolve"
                          >
                            <Edit2 className="w-3 h-3 text-slate-500" />
                            <span>Update</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setRecordToDelete(rec)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete record"
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

        <Pagination
          currentPage={currentPage}
          totalItems={sortedRecords.length}
          pageSize={pageSize}
          onPageChange={page => setCurrentPage(page)}
        />
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={Boolean(recordToDelete)}
        onClose={() => setRecordToDelete(null)}
        onConfirm={() => {
          if (recordToDelete) {
            deleteMaintenance(recordToDelete.id);
            setRecordToDelete(null);
          }
        }}
        title={`Delete maintenance ticket ${recordToDelete?.id}?`}
        message="This ticket will be permanently removed from the repair logs."
        confirmLabel="Delete Ticket"
        variant="danger"
      />
    </div>
  );
};
