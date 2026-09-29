import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useApp } from '../../context/AppContext';
import { Employee, EmployeeStatus } from '../../types';

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeToEdit?: Employee | null;
}

export const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  employeeToEdit,
}) => {
  const { addEmployee, updateEmployee, employees, settings } = useApp();

  const isEditing = Boolean(employeeToEdit);

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState(settings.departments[0] || 'Engineering');
  const [designation, setDesignation] = useState('');
  const [location, setLocation] = useState(settings.locations[0] || 'San Francisco HQ');
  const [status, setStatus] = useState<EmployeeStatus>('Active');
  const [phone, setPhone] = useState('');
  const [joinDate, setJoinDate] = useState(new Date().toISOString().slice(0, 10));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;

    if (employeeToEdit) {
      setId(employeeToEdit.id);
      setName(employeeToEdit.name);
      setEmail(employeeToEdit.email);
      setDepartment(employeeToEdit.department);
      setDesignation(employeeToEdit.designation);
      setLocation(employeeToEdit.location);
      setStatus(employeeToEdit.status);
      setPhone(employeeToEdit.phone || '');
      setJoinDate(employeeToEdit.joinDate);
      setErrors({});
    } else {
      // Suggest next employee ID
      const maxNum = employees.reduce((max, emp) => {
        const match = emp.id.match(/EMP-(\d+)/);
        if (match) {
          const num = parseInt(match[1], 10);
          return num > max ? num : max;
        }
        return max;
      }, 110);
      setId(`EMP-${maxNum + 1}`);
      setName('');
      setEmail('');
      setDepartment(settings.departments[0] || 'Engineering');
      setDesignation('');
      setLocation(settings.locations[0] || 'San Francisco HQ');
      setStatus('Active');
      setPhone('');
      setJoinDate(new Date().toISOString().slice(0, 10));
      setErrors({});
    }
  }, [employeeToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!id.trim()) newErrors.id = 'Employee ID is required.';
    if (!name.trim()) newErrors.name = 'Full Name is required.';
    if (!email.trim() || !email.includes('@')) newErrors.email = 'Valid corporate email is required.';
    if (!designation.trim()) newErrors.designation = 'Designation/Title is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      id: id.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      department,
      designation: designation.trim(),
      location,
      status,
      phone: phone.trim() || undefined,
      joinDate,
      avatarBg: employeeToEdit?.avatarBg || 'bg-blue-600',
    };

    if (isEditing && employeeToEdit) {
      const res = updateEmployee(employeeToEdit.id, payload);
      if (res.success) onClose();
    } else {
      const res = addEmployee(payload);
      if (res.success) onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit Employee: ${employeeToEdit?.name}` : 'Add New Employee'}
      subtitle={
        isEditing
          ? 'Update personnel details, department, or active employment status.'
          : 'Register a staff member to enable IT hardware and license allocations.'
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* ID & Full Name */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Employee ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={id}
              disabled={isEditing}
              onChange={e => setId(e.target.value)}
              placeholder="EMP-111"
              className={`w-full px-3 py-2 border rounded-lg font-mono uppercase ${
                errors.id ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              } ${isEditing ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : 'bg-white'}`}
            />
            {errors.id && <p className="text-rose-600 text-[11px] mt-1">{errors.id}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="block font-medium text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Sarah Jenkins"
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.name ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {errors.name && <p className="text-rose-600 text-[11px] mt-1">{errors.name}</p>}
          </div>
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Work Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="s.jenkins@acrotech.io"
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.email ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {errors.email && <p className="text-rose-600 text-[11px] mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Direct Phone</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+1 (415) 555-0199"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            />
          </div>
        </div>

        {/* Designation & Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Job Title / Designation <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={designation}
              onChange={e => setDesignation(e.target.value)}
              placeholder="e.g. Senior DevOps Engineer"
              className={`w-full px-3 py-2 border rounded-lg ${
                errors.designation ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
              }`}
            />
            {errors.designation && (
              <p className="text-rose-600 text-[11px] mt-1">{errors.designation}</p>
            )}
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Department</label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              {settings.departments.map(d => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location, Status & Start Date */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Work Location</label>
            <select
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              {settings.locations.map(loc => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Employment Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as EmployeeStatus)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive (Disabled)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Start Date</label>
            <input
              type="date"
              value={joinDate}
              onChange={e => setJoinDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            />
          </div>
        </div>

        {status === 'Inactive' && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[11px] leading-relaxed">
            Note: Marking an employee Inactive prevents any new IT asset allocations or software
            seat assignments to this individual.
          </div>
        )}

        {/* Actions */}
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
            {isEditing ? 'Save Profile' : 'Register Employee'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
