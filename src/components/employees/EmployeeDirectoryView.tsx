import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Pagination } from '../common/Pagination';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { exportToCSV } from '../../utils/csvExport';
import {
  Search,
  Plus,
  Download,
  Eye,
  Edit2,
  Trash2,
  Users,
  Laptop,
  ArrowUpDown,
  Mail,
  MapPin,
  Building,
} from 'lucide-react';

interface EmployeeDirectoryViewProps {
  onOpenEmployeeModal: (employee?: Employee) => void;
  onOpenDetailModal: (employee: Employee) => void;
  onAssignToEmployee: (employee: Employee) => void;
}

type SortField = 'id' | 'name' | 'department' | 'designation' | 'assignedAssetsCount' | 'status';

export const EmployeeDirectoryView: React.FC<EmployeeDirectoryViewProps> = ({
  onOpenEmployeeModal,
  onOpenDetailModal,
  onAssignToEmployee,
}) => {
  const { employees, deleteEmployee, settings, assets } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');

  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Compute live assigned assets count from current assets state
  const employeesWithCounts = useMemo(() => {
    return employees.map(emp => ({
      ...emp,
      assignedAssetsCount: assets.filter(
        a => a.assignedToEmployeeId === emp.id && a.status === 'Assigned'
      ).length,
    }));
  }, [employees, assets]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filteredEmployees = useMemo(() => {
    return employeesWithCounts.filter(emp => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.id.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q) ||
        emp.designation.toLowerCase().includes(q);

      const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
      const matchesStatus = selectedStatus === 'All' || emp.status === selectedStatus;
      const matchesLoc = selectedLocation === 'All' || emp.location === selectedLocation;

      return matchesSearch && matchesDept && matchesStatus && matchesLoc;
    });
  }, [employeesWithCounts, searchTerm, selectedDept, selectedStatus, selectedLocation]);

  const sortedEmployees = useMemo(() => {
    return [...filteredEmployees].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'id':
          comparison = a.id.localeCompare(b.id);
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'department':
          comparison = a.department.localeCompare(b.department);
          break;
        case 'designation':
          comparison = a.designation.localeCompare(b.designation);
          break;
        case 'assignedAssetsCount':
          comparison = a.assignedAssetsCount - b.assignedAssetsCount;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortAsc ? comparison : -comparison;
    });
  }, [filteredEmployees, sortField, sortAsc]);

  const paginatedEmployees = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedEmployees.slice(start, start + pageSize);
  }, [sortedEmployees, currentPage, pageSize]);

  const handleExportCSV = () => {
    exportToCSV('AssetFlow_Employees', sortedEmployees, [
      { header: 'Employee ID', key: 'id' },
      { header: 'Full Name', key: 'name' },
      { header: 'Email', key: 'email' },
      { header: 'Department', key: 'department' },
      { header: 'Designation', key: 'designation' },
      { header: 'Office Location', key: 'location' },
      { header: 'Employment Status', key: 'status' },
      { header: 'Assigned Assets Count', key: 'assignedAssetsCount' },
      { header: 'Join Date', key: 'joinDate' },
    ]);
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Employee Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal corporate staff members, hardware custody, and workplace assignments.
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
            onClick={() => onOpenEmployeeModal()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Filter Row */}
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
              placeholder="Search by name, employee ID, title, email..."
              className="w-full pl-9 pr-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedDept}
              onChange={e => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
            >
              <option value="All">All Departments</option>
              {settings.departments.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
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
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Staff Member</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('department')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 hidden md:table-cell"
                >
                  <div className="flex items-center gap-1">
                    <span>Department</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('designation')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 hidden lg:table-cell"
                >
                  <div className="flex items-center gap-1">
                    <span>Designation</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 hidden xl:table-cell">Office Location</th>
                <th
                  onClick={() => handleSort('assignedAssetsCount')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900 text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Assigned Assets</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('status')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedEmployees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-700">No employees match filters</p>
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map(emp => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    onClick={() => onOpenDetailModal(emp)}
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-slate-600 whitespace-nowrap">
                      {emp.id}
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-md text-white text-[11px] font-bold flex items-center justify-center shrink-0 ${
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
                          <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors block">
                            {emp.name}
                          </span>
                          <span className="text-[11px] text-slate-500 block truncate max-w-xs">
                            {emp.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 hidden md:table-cell text-slate-700">
                      {emp.department}
                    </td>

                    <td className="py-3 px-4 hidden lg:table-cell text-slate-600">
                      {emp.designation}
                    </td>

                    <td className="py-3 px-4 hidden xl:table-cell text-slate-600">
                      {emp.location}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums ${
                          emp.assignedAssetsCount > 0
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {emp.assignedAssetsCount}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge type="employee" value={emp.status} />
                    </td>

                    <td
                      className="py-3 px-4 text-right whitespace-nowrap"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onOpenDetailModal(emp)}
                          className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
                          title="View profile & allocation"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenEmployeeModal(emp)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit employee"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {emp.status !== 'Inactive' && (
                          <button
                            type="button"
                            onClick={() => onAssignToEmployee(emp)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            title="Assign asset"
                          >
                            <Laptop className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setEmployeeToDelete(emp)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete employee"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalItems={sortedEmployees.length}
          pageSize={pageSize}
          onPageChange={page => setCurrentPage(page)}
        />
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(employeeToDelete)}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={() => {
          if (employeeToDelete) {
            deleteEmployee(employeeToDelete.id);
            setEmployeeToDelete(null);
          }
        }}
        title={`Remove ${employeeToDelete?.name}?`}
        message={`Are you sure you want to remove ${employeeToDelete?.name} (${employeeToDelete?.id}) from the employee directory?`}
        confirmLabel="Remove Employee"
        variant="danger"
      />
    </div>
  );
};
