import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Asset, AssetStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Pagination } from '../common/Pagination';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { formatDate, formatCurrency, getDaysUntil } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csvExport';
import {
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit2,
  Trash2,
  ArrowUpDown,
  MoreVertical,
  Laptop,
  ArrowLeftRight,
  Wrench,
  Archive,
  RefreshCw,
} from 'lucide-react';

interface AssetInventoryViewProps {
  onOpenAssetModal: (asset?: Asset) => void;
  onOpenDetailModal: (asset: Asset) => void;
  onOpenAssignModal: (asset: Asset) => void;
  onOpenReturnModal: (asset: Asset) => void;
  onOpenMaintenanceModal: (asset: Asset) => void;
}

type SortField = 'id' | 'name' | 'category' | 'purchaseCost' | 'purchaseDate' | 'warrantyExpiry' | 'status';

export const AssetInventoryView: React.FC<AssetInventoryViewProps> = ({
  onOpenAssetModal,
  onOpenDetailModal,
  onOpenAssignModal,
  onOpenReturnModal,
  onOpenMaintenanceModal,
}) => {
  const { assets, employees, settings, deleteAsset, retireAsset, quickSearchQuery, setQuickSearchQuery } = useApp();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState(quickSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortAsc, setSortAsc] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals for confirm
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [assetToRetire, setAssetToRetire] = useState<Asset | null>(null);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  // Synchronize quickSearchQuery from header
  React.useEffect(() => {
    if (quickSearchQuery !== searchTerm) {
      setSearchTerm(quickSearchQuery);
    }
  }, [quickSearchQuery]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Filtered & Sorted Assets
  // #AGENT IGNORE THIS FUNCTION
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      // Search check
      const query = searchTerm;
      const matchesSearch =
        !query ||
        asset.id.includes(query) ||
        asset.name.includes(query) ||
        asset.serialNumber.includes(query) ||
        asset.manufacturer.includes(query) ||
        asset.model.includes(query);

      // Category check
      const matchesCategory = selectedCategory === 'All' || asset.category === selectedCategory;

      // Status check
      const matchesStatus = selectedStatus === 'All' || asset.status === selectedStatus;

      // Department check
      const matchesDept = selectedDepartment === 'All' || asset.department === selectedDepartment;

      // Location check
      const matchesLoc = selectedLocation === 'All' || asset.location === selectedLocation;

      return matchesSearch && matchesCategory && matchesStatus && matchesDept && matchesLoc;
    });
  }, [assets, searchTerm, selectedCategory, selectedStatus, selectedDepartment, selectedLocation]);

  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'purchaseCost':
          comparison = a.purchaseCost - b.purchaseCost;
          break;
        case 'purchaseDate':
          comparison = new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
          break;
        case 'warrantyExpiry':
          comparison = new Date(a.warrantyExpiry || 0).getTime() - new Date(b.warrantyExpiry || 0).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [filteredAssets, sortField, sortAsc]);

  // Paginated assets
  const paginatedAssets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedAssets.slice(start, start + pageSize);
  }, [sortedAssets, currentPage, pageSize]);

  // Handle Export CSV
  const handleExportCSV = () => {
    exportToCSV('AssetFlow_Inventory', sortedAssets, [
      { header: 'Asset ID', key: 'id' },
      { header: 'Asset Name', key: 'name' },
      { header: 'Category', key: 'category' },
      { header: 'Manufacturer', key: 'manufacturer' },
      { header: 'Model', key: 'model' },
      { header: 'Serial Number', key: 'serialNumber' },
      { header: 'Status', key: 'status' },
      {
        header: 'Assigned Employee',
        key: a => {
          if (!a.assignedToEmployeeId) return 'Unassigned';
          const emp = employees.find(e => e.id === a.assignedToEmployeeId);
          return emp ? `${emp.name} (${emp.id})` : a.assignedToEmployeeId;
        },
      },
      { header: 'Department', key: 'department' },
      { header: 'Location', key: 'location' },
      { header: 'Purchase Cost (USD)', key: 'purchaseCost' },
      { header: 'Purchase Date', key: 'purchaseDate' },
      { header: 'Warranty Expiration', key: 'warrantyExpiry' },
    ]);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setQuickSearchQuery('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSelectedDepartment('All');
    setSelectedLocation('All');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">IT Hardware Inventory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage company assets, lifecycle status, specifications, and hardware custodianship.
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
            onClick={() => onOpenAssetModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Register Asset</span>
          </button>
        </div>
      </div>

      {/* Search & Multi-Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter by name, asset ID, serial number, manufacturer..."
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Quick clear button if filters active */}
          {(searchTerm ||
            selectedCategory !== 'All' ||
            selectedStatus !== 'All' ||
            selectedDepartment !== 'All' ||
            selectedLocation !== 'All') && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Dropdown Filters Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={e => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
            >
              <option value="All">All Categories</option>
              {settings.categories.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Assigned">Assigned</option>
              <option value="In Maintenance">In Maintenance</option>
              <option value="Retired">Retired</option>
              <option value="Lost/Stolen">Lost/Stolen</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Department</label>
            <select
              value={selectedDepartment}
              onChange={e => {
                setSelectedDepartment(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
            >
              <option value="All">All Departments</option>
              {settings.departments.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-500 mb-1">Location</label>
            <select
              value={selectedLocation}
              onChange={e => {
                setSelectedLocation(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md bg-white text-slate-700"
            >
              <option value="All">All Locations</option>
              {settings.locations.map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-[11px] font-semibold text-slate-600 uppercase tracking-wider select-none">
                <th
                  onClick={() => handleSort('id')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Asset ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Asset Name & Model</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('category')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 hidden md:table-cell"
                >
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 hidden lg:table-cell">Serial Number</th>
                <th className="py-3 px-4">Custodian / Dept</th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('warrantyExpiry')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 hidden xl:table-cell"
                >
                  <div className="flex items-center gap-1">
                    <span>Warranty</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('purchaseCost')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 text-right hidden sm:table-cell"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Cost</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedAssets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <Laptop className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">No matching assets found</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Adjust your search filters or register a new asset into company inventory.
                    </p>
                    <button
                      type="button"
                      onClick={() => onOpenAssetModal()}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Register Asset</span>
                    </button>
                  </td>
                </tr>
              ) : (
                paginatedAssets.map(asset => {
                  const assignedEmp = asset.assignedToEmployeeId
                    ? employees.find(e => e.id === asset.assignedToEmployeeId)
                    : null;
                  const daysToWarranty = asset.warrantyExpiry ? getDaysUntil(asset.warrantyExpiry) : null;

                  return (
                    <tr
                      key={asset.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onOpenDetailModal(asset)}
                    >
                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-semibold text-blue-600 whitespace-nowrap">
                        {asset.id}
                      </td>

                      {/* Name & Model */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">
                          {asset.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                          {asset.manufacturer} · {asset.model}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 hidden md:table-cell text-slate-600 whitespace-nowrap">
                        {asset.category}
                      </td>

                      {/* Serial */}
                      <td className="py-3 px-4 hidden lg:table-cell font-mono text-[11px] text-slate-500 tabular-nums">
                        {asset.serialNumber}
                      </td>

                      {/* Assigned Employee & Dept */}
                      <td className="py-3 px-4">
                        {assignedEmp ? (
                          <div>
                            <span className="font-medium text-slate-900 hover:underline block">
                              {assignedEmp.name}
                            </span>
                            <span className="text-[11px] text-slate-500 block">
                              {asset.department}
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-slate-400 italic">Unassigned</span>
                            <span className="text-[11px] text-slate-500 block">
                              {asset.location}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge type="asset" value={asset.status} />
                      </td>

                      {/* Warranty */}
                      <td className="py-3 px-4 hidden xl:table-cell whitespace-nowrap">
                        <span className="tabular-nums text-slate-700 block">
                          {formatDate(asset.warrantyExpiry)}
                        </span>
                        {daysToWarranty !== null && (
                          <span
                            className={`text-[10px] tabular-nums block ${
                              daysToWarranty < 0
                                ? 'text-rose-600 font-medium'
                                : daysToWarranty <= 60
                                ? 'text-amber-600 font-medium'
                                : 'text-slate-400'
                            }`}
                          >
                            {daysToWarranty < 0 ? 'Expired' : `${daysToWarranty}d left`}
                          </span>
                        )}
                      </td>

                      {/* Purchase Cost */}
                      <td className="py-3 px-4 hidden sm:table-cell text-right font-medium text-slate-900 tabular-nums whitespace-nowrap">
                        {formatCurrency(asset.purchaseCost)}
                      </td>

                      {/* Row Actions */}
                      <td
                        className="py-3 px-4 text-right whitespace-nowrap"
                        onClick={e => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenDetailModal(asset)}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                            title="View complete details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenAssetModal(asset)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Quick action: Assign if Available */}
                          {asset.status === 'Available' && (
                            <button
                              type="button"
                              onClick={() => onOpenAssignModal(asset)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                              title="Assign to employee"
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Quick action: Return if Assigned */}
                          {asset.status === 'Assigned' && (
                            <button
                              type="button"
                              onClick={() => onOpenReturnModal(asset)}
                              className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-slate-100 rounded-md transition-colors"
                              title="Process asset return"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Quick action: Maintenance */}
                          {asset.status !== 'In Maintenance' && asset.status !== 'Retired' && (
                            <button
                              type="button"
                              onClick={() => onOpenMaintenanceModal(asset)}
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                              title="Request maintenance"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Retire / Delete */}
                          <button
                            type="button"
                            onClick={() => setAssetToDelete(asset)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete asset"
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

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalItems={sortedAssets.length}
          pageSize={pageSize}
          onPageChange={page => setCurrentPage(page)}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(assetToDelete)}
        onClose={() => setAssetToDelete(null)}
        onConfirm={() => {
          if (assetToDelete) {
            deleteAsset(assetToDelete.id);
            setAssetToDelete(null);
          }
        }}
        title={`Permanently delete asset ${assetToDelete?.id}?`}
        message={`This will permanently remove ${assetToDelete?.name} (${assetToDelete?.id}) and close any active allocations. This action cannot be undone.`}
        confirmLabel="Delete Asset"
        variant="danger"
      />
    </div>
  );
};
