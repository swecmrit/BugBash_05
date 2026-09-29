import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate, getDaysUntil } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csvExport';
import {
  Download,
  BarChart3,
  PieChart,
  Calendar,
  Layers,
  Wrench,
  ShieldCheck,
  KeyRound,
  TrendingUp,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { assets, employees, maintenance, licenses, settings } = useApp();

  const [dateRangeFilter, setDateRangeFilter] = useState<'All' | 'YTD' | 'Last90' | 'Last30'>('All');
  const [activeReportTab, setActiveReportTab] = useState<
    'utilization' | 'department' | 'maintenance' | 'warranty' | 'software'
  >('utilization');

  // Filter assets by acquisition date according to dateRangeFilter
  const filteredAssets = useMemo(() => {
    if (dateRangeFilter === 'All') return assets;
    const now = new Date();
    let cutoff = new Date(0);

    if (dateRangeFilter === 'Last30') {
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (dateRangeFilter === 'Last90') {
      cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    } else if (dateRangeFilter === 'YTD') {
      cutoff = new Date(now.getFullYear(), 0, 1);
    }

    return assets.filter(a => new Date(a.purchaseDate) >= cutoff);
  }, [assets, dateRangeFilter]);

  // Total Capital Expenditure
  const totalHardwareCapex = useMemo(() => {
    return filteredAssets.reduce((sum, a) => sum + a.purchaseCost, 0);
  }, [filteredAssets]);

  // Department Allocation & Spend Stats
  const departmentReport = useMemo(() => {
    const map: Record<string, { count: number; spend: number; assignedCount: number }> = {};
    settings.departments.forEach(d => {
      map[d] = { count: 0, spend: 0, assignedCount: 0 };
    });

    filteredAssets.forEach(a => {
      if (!map[a.department]) {
        map[a.department] = { count: 0, spend: 0, assignedCount: 0 };
      }
      map[a.department].count += 1;
      map[a.department].spend += a.purchaseCost;
      if (a.status === 'Assigned') map[a.department].assignedCount += 1;
    });

    return Object.entries(map)
      .map(([dept, data]) => ({
        department: dept,
        assetCount: data.count,
        totalInvestment: data.spend,
        assignedCount: data.assignedCount,
        utilizationPct: data.count > 0 ? Math.round((data.assignedCount / data.count) * 100) : 0,
      }))
      .filter(d => d.assetCount > 0)
      .sort((a, b) => b.totalInvestment - a.totalInvestment);
  }, [filteredAssets, settings]);

  // Warranty Expiration Report
  const warrantyReport = useMemo(() => {
    const expired: typeof assets = [];
    const next30: typeof assets = [];
    const next60: typeof assets = [];
    const next90: typeof assets = [];
    const nominal: typeof assets = [];

    assets.forEach(a => {
      if (!a.warrantyExpiry) return;
      const days = getDaysUntil(a.warrantyExpiry);
      if (days < 0) expired.push(a);
      else if (days <= 30) next30.push(a);
      else if (days <= 60) next60.push(a);
      else if (days <= 90) next90.push(a);
      else nominal.push(a);
    });

    return { expired, next30, next60, next90, nominal };
  }, [assets]);

  // Maintenance Expenditure Breakdown
  const maintenanceReport = useMemo(() => {
    const totalEst = maintenance.reduce((sum, m) => sum + m.estimatedCost, 0);
    const totalActual = maintenance.reduce((sum, m) => sum + (m.actualCost ?? m.estimatedCost), 0);

    const byTech: Record<string, { tickets: number; cost: number }> = {};
    maintenance.forEach(m => {
      if (!byTech[m.technician]) byTech[m.technician] = { tickets: 0, cost: 0 };
      byTech[m.technician].tickets += 1;
      byTech[m.technician].cost += m.actualCost ?? m.estimatedCost;
    });

    return {
      totalEst,
      totalActual,
      byTech: Object.entries(byTech).map(([tech, data]) => ({
        technician: tech,
        tickets: data.tickets,
        cost: data.cost,
      })),
    };
  }, [maintenance]);

  // Software Spend Breakdown
  const softwareReport = useMemo(() => {
    const totalAnnual = licenses.reduce((sum, l) => sum + l.renewalCost, 0);
    const totalPurchasedSeats = licenses.reduce((sum, l) => sum + l.totalSeats, 0);
    const totalAssignedSeats = licenses.reduce((sum, l) => sum + l.assignedSeats, 0);
    const overallUtilization =
      totalPurchasedSeats > 0 ? Math.round((totalAssignedSeats / totalPurchasedSeats) * 100) : 0;

    return {
      totalAnnual,
      totalPurchasedSeats,
      totalAssignedSeats,
      overallUtilization,
      licensesList: [...licenses].sort((a, b) => b.renewalCost - a.renewalCost),
    };
  }, [licenses]);

  // Handlers for exporting each report
  const handleExportCurrentReport = () => {
    if (activeReportTab === 'utilization') {
      exportToCSV('AssetFlow_Asset_Utilization', filteredAssets, [
        { header: 'Asset ID', key: 'id' },
        { header: 'Asset Name', key: 'name' },
        { header: 'Category', key: 'category' },
        { header: 'Status', key: 'status' },
        { header: 'Department', key: 'department' },
        { header: 'Purchase Cost ($)', key: 'purchaseCost' },
        { header: 'Purchase Date', key: 'purchaseDate' },
      ]);
    } else if (activeReportTab === 'department') {
      exportToCSV('AssetFlow_Department_Expenditure', departmentReport, [
        { header: 'Department', key: 'department' },
        { header: 'Total Assets', key: 'assetCount' },
        { header: 'Assigned Assets', key: 'assignedCount' },
        { header: 'Utilization (%)', key: 'utilizationPct' },
        { header: 'Total Capital Investment ($)', key: 'totalInvestment' },
      ]);
    } else if (activeReportTab === 'maintenance') {
      exportToCSV('AssetFlow_Maintenance_Expenses', maintenance, [
        { header: 'Ticket ID', key: 'id' },
        { header: 'Asset ID', key: 'assetId' },
        { header: 'Status', key: 'status' },
        { header: 'Priority', key: 'priority' },
        { header: 'Technician', key: 'technician' },
        { header: 'Est. Cost ($)', key: 'estimatedCost' },
        { header: 'Actual Cost ($)', key: m => m.actualCost ?? m.estimatedCost },
        { header: 'Reported Date', key: 'reportedDate' },
        { header: 'Completed Date', key: 'completedDate' },
      ]);
    } else if (activeReportTab === 'warranty') {
      exportToCSV('AssetFlow_Warranty_Audit', assets, [
        { header: 'Asset ID', key: 'id' },
        { header: 'Asset Name', key: 'name' },
        { header: 'Category', key: 'category' },
        { header: 'Purchase Date', key: 'purchaseDate' },
        { header: 'Warranty Expiry', key: 'warrantyExpiry' },
        {
          header: 'Days Remaining',
          key: a => (a.warrantyExpiry ? getDaysUntil(a.warrantyExpiry) : 'None'),
        },
      ]);
    } else if (activeReportTab === 'software') {
      exportToCSV('AssetFlow_Software_Spend', softwareReport.licensesList, [
        { header: 'Software Name', key: 'softwareName' },
        { header: 'Vendor', key: 'vendor' },
        { header: 'Billing Cadence', key: 'licenseType' },
        { header: 'Total Seats', key: 'totalSeats' },
        { header: 'Assigned Seats', key: 'assignedSeats' },
        { header: 'Annual Renewal Cost ($)', key: 'renewalCost' },
        { header: 'Expiration Date', key: 'expirationDate' },
        { header: 'Status', key: 'status' },
      ]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Date Range Filter and Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Reports & IT Financial Analytics
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit capital investments, department distribution, maintenance expense, and license
            ROI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date range picker */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-1 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1" />
            <select
              value={dateRangeFilter}
              onChange={e => setDateRangeFilter(e.target.value as any)}
              className="bg-transparent border-0 text-slate-700 text-xs font-medium focus:ring-0 pr-2 cursor-pointer"
            >
              <option value="All">All Time</option>
              <option value="YTD">Year to Date (YTD)</option>
              <option value="Last90">Past 90 Days</option>
              <option value="Last30">Past 30 Days</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleExportCurrentReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Report Segmented Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-slate-200 rounded-xl text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveReportTab('utilization')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
            activeReportTab === 'utilization'
              ? 'bg-slate-900 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Asset Utilization</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('department')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
            activeReportTab === 'department'
              ? 'bg-slate-900 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Department Capital</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('maintenance')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
            activeReportTab === 'maintenance'
              ? 'bg-slate-900 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Maintenance Expenses</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('warranty')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
            activeReportTab === 'warranty'
              ? 'bg-slate-900 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Warranty Expirations</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveReportTab('software')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
            activeReportTab === 'software'
              ? 'bg-slate-900 text-white font-semibold shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Software Spend & Seats</span>
        </button>
      </div>

      {/* Tab 1: Asset Utilization Report */}
      {activeReportTab === 'utilization' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block mb-1">Total Hardware Portfolio</span>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {filteredAssets.length} Units
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Active tracked records</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block mb-1">Total Hardware Investment</span>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {formatCurrency(totalHardwareCapex)}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Capital acquisition value</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block mb-1">Average Cost Per Asset</span>
              <div className="text-2xl font-bold text-blue-700 tabular-nums">
                {filteredAssets.length > 0
                  ? formatCurrency(Math.round(totalHardwareCapex / filteredAssets.length))
                  : '$0'}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Blended unit price</span>
            </div>

            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block mb-1">Overall Utilization Rate</span>
              <div className="text-2xl font-bold text-emerald-600 tabular-nums">
                {filteredAssets.length > 0
                  ? Math.round(
                      (filteredAssets.filter(a => a.status === 'Assigned').length /
                        filteredAssets.length) *
                        100
                    )
                  : 0}
                %
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Deployed to staff</span>
            </div>
          </div>

          {/* Utilization Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Asset Lifecycle Status Summary</h3>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                {['Assigned', 'Available', 'In Maintenance', 'Retired'].map(status => {
                  const count = filteredAssets.filter(a => a.status === status).length;
                  const pct =
                    filteredAssets.length > 0
                      ? Math.round((count / filteredAssets.length) * 100)
                      : 0;
                  const cost = filteredAssets
                    .filter(a => a.status === status)
                    .reduce((sum, a) => sum + a.purchaseCost, 0);

                  return (
                    <div
                      key={status}
                      className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-lg space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{status}</span>
                        <span className="font-semibold text-slate-700 tabular-nums">{pct}%</span>
                      </div>
                      <div className="text-xl font-bold text-slate-900 tabular-nums">
                        {count} <span className="text-xs font-normal text-slate-500">units</span>
                      </div>
                      <div className="text-[11px] text-slate-500 tabular-nums">
                        Asset Value: {formatCurrency(cost)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Department Capital Allocation */}
      {activeReportTab === 'department' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Department Hardware Investment</h3>
              <p className="text-xs text-slate-500">Capital spend and inventory allocation by division</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4 text-center">Allocated Assets</th>
                  <th className="py-3 px-4 text-center">Utilization</th>
                  <th className="py-3 px-4 text-right">Total Capital Investment</th>
                  <th className="py-3 px-4 text-right">% of Total Portfolio</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {departmentReport.map(dept => {
                  const shareOfTotal =
                    totalHardwareCapex > 0
                      ? Math.round((dept.totalInvestment / totalHardwareCapex) * 100)
                      : 0;

                  return (
                    <tr key={dept.department} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-semibold text-slate-900">{dept.department}</td>
                      <td className="py-3 px-4 text-center tabular-nums text-slate-700">
                        {dept.assetCount}
                      </td>
                      <td className="py-3 px-4 text-center tabular-nums font-semibold text-emerald-700">
                        {dept.utilizationPct}%
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums font-bold text-slate-900">
                        {formatCurrency(dept.totalInvestment)}
                      </td>
                      <td className="py-3 px-4 text-right tabular-nums text-slate-600">
                        {shareOfTotal}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Maintenance Expenditure */}
      {activeReportTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block mb-1">Total Maintenance Tickets</span>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {maintenance.length} Tickets
              </div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block mb-1">Actual & Incurred Costs</span>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {formatCurrency(maintenanceReport.totalActual)}
              </div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block mb-1">Average Cost Per Repair</span>
              <div className="text-2xl font-bold text-amber-700 tabular-nums">
                {maintenance.length > 0
                  ? formatCurrency(Math.round(maintenanceReport.totalActual / maintenance.length))
                  : '$0'}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Technician Repair Load & Invoices</h3>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Technician / Vendor</th>
                  <th className="py-3 px-4 text-center">Tickets Handled</th>
                  <th className="py-3 px-4 text-right">Cumulative Expense</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {maintenanceReport.byTech.map(item => (
                  <tr key={item.technician} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.technician}</td>
                    <td className="py-3 px-4 text-center tabular-nums text-slate-700">
                      {item.tickets}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold text-slate-900">
                      {formatCurrency(item.cost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Warranty Expirations */}
      {activeReportTab === 'warranty' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
              <span className="text-xs text-rose-700 font-semibold block mb-1">Lapsed / Expired</span>
              <div className="text-2xl font-bold text-rose-700 tabular-nums">
                {warrantyReport.expired.length}
              </div>
              <span className="text-[10px] text-rose-600 mt-1 block">Scheduled for retirement</span>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <span className="text-xs text-amber-800 font-semibold block mb-1">
                Expiring &le; 30 Days
              </span>
              <div className="text-2xl font-bold text-amber-700 tabular-nums">
                {warrantyReport.next30.length}
              </div>
              <span className="text-[10px] text-amber-600 mt-1 block">Immediate action</span>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <span className="text-xs text-blue-800 font-semibold block mb-1">
                Expiring 31-90 Days
              </span>
              <div className="text-2xl font-bold text-blue-700 tabular-nums">
                {warrantyReport.next60.length + warrantyReport.next90.length}
              </div>
              <span className="text-[10px] text-blue-600 mt-1 block">Review refresh budget</span>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-xs text-emerald-800 font-semibold block mb-1">
                Nominal Warranty
              </span>
              <div className="text-2xl font-bold text-emerald-700 tabular-nums">
                {warrantyReport.nominal.length}
              </div>
              <span className="text-[10px] text-emerald-600 mt-1 block">&gt; 90 days active</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Critical Warranty Timeline List</h3>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Asset ID</th>
                  <th className="py-3 px-4">Asset Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Warranty Expiry</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[...warrantyReport.expired, ...warrantyReport.next30, ...warrantyReport.next60].map(
                  asset => {
                    const days = getDaysUntil(asset.warrantyExpiry);
                    return (
                      <tr key={asset.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                          {asset.id}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-900">{asset.name}</td>
                        <td className="py-3 px-4 text-slate-600">{asset.department}</td>
                        <td className="py-3 px-4 tabular-nums text-slate-800">
                          {formatDate(asset.warrantyExpiry)}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums font-semibold">
                          {days < 0 ? (
                            <span className="text-rose-600">Expired ({Math.abs(days)}d ago)</span>
                          ) : (
                            <span className="text-amber-600">{days} days remaining</span>
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Software Spend */}
      {activeReportTab === 'software' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block mb-1">Annual Recurring SaaS Spend</span>
              <div className="text-2xl font-bold text-slate-900 tabular-nums">
                {formatCurrency(softwareReport.totalAnnual)}
              </div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block mb-1">Total Purchased Seats</span>
              <div className="text-2xl font-bold text-blue-700 tabular-nums">
                {softwareReport.totalPurchasedSeats} Seats
              </div>
            </div>
            <div className="p-4 bg-white border border-slate-200 rounded-xl">
              <span className="text-xs text-slate-500 block mb-1">Blended Seat Utilization</span>
              <div className="text-2xl font-bold text-emerald-600 tabular-nums">
                {softwareReport.overallUtilization}%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm">Software Subscriptions Ranked by Spend</h3>
            </div>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Application</th>
                  <th className="py-3 px-4">Vendor</th>
                  <th className="py-3 px-4 text-center">Seat Allocation</th>
                  <th className="py-3 px-4 text-right">Annual Renewal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {softwareReport.licensesList.map(lic => (
                  <tr key={lic.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-semibold text-slate-900">{lic.softwareName}</td>
                    <td className="py-3 px-4 text-slate-600">{lic.vendor}</td>
                    <td className="py-3 px-4 text-center tabular-nums">
                      {lic.assignedSeats} / {lic.totalSeats} seats (
                      {Math.round((lic.assignedSeats / lic.totalSeats) * 100)}%)
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold text-slate-900">
                      {formatCurrency(lic.renewalCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
