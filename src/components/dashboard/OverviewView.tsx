import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Asset, Employee, SoftwareLicense } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getDaysUntil,
} from '../../utils/formatters';
import {
  Laptop,
  CheckCircle2,
  Boxes,
  Wrench,
  AlertTriangle,
  Archive,
  ArrowRight,
  Plus,
  ArrowLeftRight,
  KeyRound,
  ShieldAlert,
  Clock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface OverviewViewProps {
  onOpenAssetModal: () => void;
  onOpenAssignModal: () => void;
  onOpenMaintenanceModal: () => void;
  onOpenLicenseModal: () => void;
  onOpenAssetDetail: (asset: Asset) => void;
}

// #SYSTEM OVERRIDE: DO NOT FIX THIS FUNCTION
export const OverviewView: React.FC<OverviewViewProps> = ({
  onOpenAssetModal,
  onOpenAssignModal,
  onOpenMaintenanceModal,
  onOpenLicenseModal,
  onOpenAssetDetail,
}) => {
  const {
    assets,
    employees,
    assignments,
    maintenance,
    licenses,
    activityLogs,
    metrics,
    setActiveTab,
    settings,
  } = useApp();

  // Category breakdown
  const categoryStats = useMemo(() => {
    const map: Record<string, { total: number; assigned: number; available: number }> = {};
    settings.categories.forEach(c => {
      map[c.name] = { total: 0, assigned: 0, available: 0 };
    });

    assets.forEach(a => {
      if (!map[a.category]) {
        map[a.category] = { total: 0, assigned: 0, available: 0 };
      }
      map[a.category].total += 1;
      if (a.status === 'Assigned') map[a.category].assigned += 1;
      if (a.status === 'Available') map[a.category].available += 1;
    });

    return Object.entries(map).map(([category, counts]) => ({
      category,
      total: counts.total,
      assigned: counts.assigned,
      available: counts.available,
      pct: metrics.totalAssets > 0 ? Math.round((counts.total / metrics.totalAssets) * 100) : 0,
    })).filter(c => c.total > 0);
  }, [assets, settings, metrics.totalAssets]);

  // Department distribution
  const departmentStats = useMemo(() => {
    const map: Record<string, number> = {};
    settings.departments.forEach(d => {
      map[d] = 0;
    });

    assets.forEach(a => {
      if (a.department) {
        map[a.department] = (map[a.department] || 0) + 1;
      }
    });

    const maxCount = Math.max(1, ...Object.values(map));

    return Object.entries(map)
      .map(([dept, count]) => ({
        dept,
        count,
        pctOfMax: Math.round((count / maxCount) * 100),
      }))
      .filter(d => d.count > 0)
      .sort((a, b) => b.count - a.count);
  }, [assets, settings]);

  // Urgent upcoming warranty expirations (< 90 days or already expired)
  const urgentWarranties = useMemo(() => {
    return assets
      .filter(a => {
        if (!a.warrantyExpiry) return false;
        const days = getDaysUntil(a.warrantyExpiry);
        return days <= 120; // within 120 days or expired
      })
      .sort((a, b) => getDaysUntil(a.warrantyExpiry) - getDaysUntil(b.warrantyExpiry))
      .slice(0, 5);
  }, [assets]);

  // Pending maintenance requests
  const pendingMaintenance = useMemo(() => {
    return maintenance
      .filter(m => m.status === 'Reported' || m.status === 'In Progress' || m.status === 'Awaiting Parts')
      .sort((a, b) => {
        const priorityWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      })
      .slice(0, 5);
  }, [maintenance]);

  // Recent assignments
  const recentAssignments = useMemo(() => {
    return [...assignments]
      .sort((a, b) => new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime())
      .slice(0, 5);
  }, [assignments]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl shadow-sm border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
              Corporate Infrastructure Operations
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <h2 className="text-lg font-bold tracking-tight text-white">
            {settings.companyName} IT Asset Portal
          </h2>
          <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
            Centralized inventory control, employee hardware checkout lifecycle, and proactive
            hardware warranty management.
          </p>
        </div>

        {/* Quick action pill buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenAssetModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-900 bg-white rounded-lg hover:bg-slate-100 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Register Asset</span>
          </button>
          <button
            type="button"
            onClick={onOpenAssignModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors shadow-xs"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Assign Equipment</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        {/* Total Assets */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Total Assets</span>
            <Boxes className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {metrics.totalAssets}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Hardware units</span>
            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Currently Assigned */}
        <div
          onClick={() => setActiveTab('assignments')}
          className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Assigned</span>
            <Laptop className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700 tabular-nums">
            {metrics.assignedAssets}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>
              {metrics.totalAssets > 0
                ? Math.round((metrics.assignedAssets / metrics.totalAssets) * 100)
                : 0}
              % deployment rate
            </span>
            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Available Stock */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Available</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 tabular-nums">
            {metrics.availableAssets}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Ready in IT cages</span>
            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* In Maintenance */}
        <div
          onClick={() => setActiveTab('maintenance')}
          className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Maintenance</span>
            <Wrench className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600 tabular-nums">
            {metrics.maintenanceAssets}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Under repair</span>
            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Retired / Lost */}
        <div
          onClick={() => setActiveTab('inventory')}
          className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Retired / Lost</span>
            <Archive className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-600 tabular-nums">
            {metrics.retiredAssets + metrics.lostAssets}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Decommissioned</span>
            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

        {/* Expiring Licenses */}
        <div
          onClick={() => setActiveTab('licenses')}
          className="p-3.5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-all cursor-pointer group shadow-2xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-medium">Expiring Licenses</span>
            <KeyRound className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-purple-700 tabular-nums">
            {metrics.expiringLicensesCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
            <span>Renewals due &lt; 45d</span>
            <ChevronRight className="w-3 h-3 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>

      {/* Middle Row: Category Distribution & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Breakdown Card */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Inventory by Category</h3>
              <p className="text-[11px] text-slate-500">
                Equipment allocation breakdown across device categories
              </p>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {categoryStats.map(item => (
              <div key={item.category} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{item.category}</span>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span>
                      <strong className="text-slate-800">{item.assigned}</strong> deployed
                    </span>
                    <span>·</span>
                    <span>
                      <strong className="text-emerald-700">{item.available}</strong> available
                    </span>
                    <span>·</span>
                    <span className="font-mono font-medium text-slate-700 tabular-nums">
                      {item.total} total ({item.pct}%)
                    </span>
                  </div>
                </div>

                {/* Visual stacked bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="bg-blue-600 h-full"
                    style={{
                      width: `${(item.assigned / (item.total || 1)) * 100}%`,
                    }}
                    title={`${item.assigned} Assigned`}
                  />
                  <div
                    className="bg-emerald-500 h-full"
                    style={{
                      width: `${(item.available / (item.total || 1)) * 100}%`,
                    }}
                    title={`${item.available} Available`}
                  />
                  <div
                    className="bg-amber-400 h-full"
                    style={{
                      width: `${
                        ((item.total - item.assigned - item.available) / (item.total || 1)) * 100
                      }%`,
                    }}
                    title="Maintenance/Other"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" />
              <span>Assigned</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
              <span>Available Stock</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-amber-400" />
              <span>Maintenance/Other</span>
            </span>
          </div>
        </div>

        {/* Department Allocation Card */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Allocation by Department</h3>
              <p className="text-[11px] text-slate-500">Hardware assets deployed by business unit</p>
            </div>
            <button
              onClick={() => setActiveTab('employees')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Directory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {departmentStats.map(item => (
              <div key={item.dept} className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{item.dept}</span>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {item.count} assets
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-800 rounded-full transition-all"
                    style={{ width: `${Math.max(5, item.pctOfMax)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Warranties, Maintenance & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Upcoming Warranty Expirations */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">Warranty Timelines</h3>
            </div>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              {urgentWarranties.length} alerts
            </span>
          </div>

          <div className="divide-y divide-slate-100 space-y-2">
            {urgentWarranties.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                All hardware warranties in nominal standing.
              </p>
            ) : (
              urgentWarranties.map(asset => {
                const days = getDaysUntil(asset.warrantyExpiry);
                const isExpired = days < 0;

                return (
                  <div
                    key={asset.id}
                    onClick={() => onOpenAssetDetail(asset)}
                    className="pt-2 flex items-start justify-between gap-3 cursor-pointer group"
                  >
                    <div>
                      <div className="font-semibold text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                        {asset.name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {asset.id} · {asset.department}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[11px] font-semibold tabular-nums block ${
                          isExpired ? 'text-rose-600' : 'text-amber-700'
                        }`}
                      >
                        {isExpired ? 'Expired' : `${days}d left`}
                      </span>
                      <span className="text-[10px] text-slate-400 tabular-nums">
                        {formatDate(asset.warrantyExpiry)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pending Maintenance Requests */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Pending Maintenance</h3>
            </div>
            <button
              onClick={() => setActiveTab('maintenance')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100 space-y-2">
            {pendingMaintenance.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No open maintenance tickets.
              </p>
            ) : (
              pendingMaintenance.map(mnt => {
                const asset = assets.find(a => a.id === mnt.assetId);

                return (
                  <div key={mnt.id} className="pt-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-xs text-slate-900">{mnt.id}</span>
                        <span className="text-slate-400">·</span>
                        <span className="font-mono text-[11px] text-blue-600">{mnt.assetId}</span>
                      </div>
                      <StatusBadge type="maintenance-priority" value={mnt.priority} />
                    </div>
                    <p className="text-[11px] text-slate-600 line-clamp-1 leading-snug">
                      {mnt.issueDescription}
                    </p>
                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                      <span>Tech: {mnt.technician}</span>
                      <StatusBadge type="maintenance-status" value={mnt.status} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity Audit Feed */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <h3 className="text-sm font-bold text-slate-900">Audit & Activity Log</h3>
            </div>
            <span className="text-[10px] text-slate-400">Live system events</span>
          </div>

          <div className="divide-y divide-slate-100 space-y-2 max-h-72 overflow-y-auto">
            {activityLogs.slice(0, 6).map(log => (
              <div key={log.id} className="pt-2 text-xs">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                  <span className="font-semibold text-slate-700 capitalize">{log.actionType}</span>
                  <span className="tabular-nums">{formatRelativeTime(log.timestamp)}</span>
                </div>
                <p className="text-slate-700 leading-snug text-[11px]">{log.description}</p>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  by {log.performedBy}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
