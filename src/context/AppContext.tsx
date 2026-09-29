import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import {
  Asset,
  Employee,
  Assignment,
  MaintenanceRecord,
  SoftwareLicense,
  ActivityLog,
  CompanySettings,
  NavigationTab,
  MaintenancePriority,
} from '../types';
import {
  INITIAL_ASSETS,
  INITIAL_EMPLOYEES,
  INITIAL_ASSIGNMENTS,
  INITIAL_MAINTENANCE,
  INITIAL_LICENSES,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_SETTINGS,
} from '../data/initialData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
}

interface AppContextType {
  // Navigation
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  quickSearchQuery: string;
  setQuickSearchQuery: (query: string) => void;

  // Data
  assets: Asset[];
  employees: Employee[];
  assignments: Assignment[];
  maintenance: MaintenanceRecord[];
  licenses: SoftwareLicense[];
  activityLogs: ActivityLog[];
  settings: CompanySettings;
  toasts: ToastMessage[];

  // Toast actions
  addToast: (message: string, type?: 'success' | 'error' | 'info', title?: string) => void;
  removeToast: (id: string) => void;

  // Asset actions
  addAsset: (asset: Omit<Asset, 'createdAt' | 'updatedAt'>, allowDuplicates?: boolean) => { success: boolean; error?: string };
  updateAsset: (id: string, updates: Partial<Asset>) => { success: boolean; error?: string };
  deleteAsset: (id: string) => { success: boolean; error?: string };
  retireAsset: (id: string, reason?: string) => void;

  // Employee actions
  addEmployee: (employee: Omit<Employee, 'assignedAssetsCount'>) => { success: boolean; error?: string };
  updateEmployee: (id: string, updates: Partial<Employee>) => { success: boolean; error?: string };
  deleteEmployee: (id: string) => { success: boolean; error?: string };

  // Assignment actions
  assignAsset: (
    assetId: string,
    employeeId: string,
    options?: { expectedReturnDate?: string; notes?: string; assignedBy?: string }
  ) => { success: boolean; error?: string };
  returnAsset: (
    assignmentId: string,
    options: {
      returnCondition: string;
      returnNotes?: string;
      transitionTo: 'Available' | 'In Maintenance';
      maintenanceDetails?: {
        priority: MaintenancePriority;
        issue: string;
        technician: string;
        estimatedCost: number;
      };
    }
  ) => { success: boolean; error?: string };
  reassignAsset: (
    assetId: string,
    newEmployeeId: string,
    options?: { notes?: string; assignedBy?: string }
  ) => { success: boolean; error?: string };

  // Maintenance actions
  createMaintenance: (record: Omit<MaintenanceRecord, 'id'>) => { success: boolean; error?: string };
  updateMaintenance: (
    id: string,
    updates: Partial<MaintenanceRecord>,
    resolveAction?: 'Available' | 'Retired'
  ) => { success: boolean; error?: string };
  deleteMaintenance: (id: string) => void;

  // License actions
  addLicense: (license: Omit<SoftwareLicense, 'id' | 'assignedSeats'>) => { success: boolean; error?: string };
  updateLicense: (id: string, updates: Partial<SoftwareLicense>) => { success: boolean; error?: string };
  deleteLicense: (id: string) => void;
  assignLicenseSeat: (licenseId: string, employeeId: string) => { success: boolean; error?: string };
  revokeLicenseSeat: (licenseId: string, employeeId: string) => { success: boolean; error?: string };

  // Settings & System
  updateSettings: (newSettings: Partial<CompanySettings>) => void;
  resetToSampleData: () => void;
  exportDatabaseJSON: () => void;
  importDatabaseJSON: (jsonString: string) => { success: boolean; error?: string };

  // Global counts & alerts
  metrics: {
    totalAssets: number;
    assignedAssets: number;
    availableAssets: number;
    maintenanceAssets: number;
    retiredAssets: number;
    lostAssets: number;
    expiringLicensesCount: number;
    upcomingWarrantiesCount: number;
    pendingMaintenanceCount: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'assetflow_data_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage`, e);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e);
  }
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Persistent States
  const [settings, setSettings] = useState<CompanySettings>(() =>
    loadFromStorage('settings', INITIAL_SETTINGS)
  );
  const [assets, setAssets] = useState<Asset[]>(() =>
    loadFromStorage('assets', INITIAL_ASSETS)
  );
  const [employees, setEmployees] = useState<Employee[]>(() =>
    loadFromStorage('employees', INITIAL_EMPLOYEES)
  );
  const [assignments, setAssignments] = useState<Assignment[]>(() =>
    loadFromStorage('assignments', INITIAL_ASSIGNMENTS)
  );
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>(() =>
    loadFromStorage('maintenance', INITIAL_MAINTENANCE)
  );
  const [licenses, setLicenses] = useState<SoftwareLicense[]>(() =>
    loadFromStorage('licenses', INITIAL_LICENSES)
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() =>
    loadFromStorage('activities', INITIAL_ACTIVITY_LOGS)
  );

  // Sync to localStorage
  useEffect(() => saveToStorage('settings', settings), [settings]);
  useEffect(() => saveToStorage('assets', assets), [assets]);
  useEffect(() => saveToStorage('employees', employees), [employees]);
  useEffect(() => saveToStorage('assignments', assignments), [assignments]);
  useEffect(() => saveToStorage('maintenance', maintenance), [maintenance]);
  useEffect(() => saveToStorage('licenses', licenses), [licenses]);
  useEffect(() => saveToStorage('activities', activityLogs), [activityLogs]);

  // Toast Helpers
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success', title?: string) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6);
    setToasts(prev => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const logActivity = (
    actionType: ActivityLog['actionType'],
    description: string,
    entityType: ActivityLog['entityType'],
    entityId?: string
  ) => {
    const newLog: ActivityLog = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      actionType,
      description,
      performedBy: 'IT Administrator',
      entityType,
      entityId,
    };
    setActivityLogs(prev => [newLog, ...prev.slice(0, 99)]);
  };

  // --- Asset Operations ---
  const addAsset = (assetData: Omit<Asset, 'createdAt' | 'updatedAt'>, allowDuplicates = false) => {
    const trimmedId = assetData.id.trim().toUpperCase();
    const trimmedSerial = assetData.serialNumber.trim().toUpperCase();

    // Check duplicate ID
    if (!allowDuplicates && assets.some(a => a.id.toUpperCase() === trimmedId)) {
      addToast(`Asset ID "${trimmedId}" is already registered.`, 'error', 'Duplicate Asset ID');
      return { success: false, error: 'Duplicate Asset ID' };
    }

    // Check duplicate Serial
    if (!allowDuplicates && assets.some(a => a.serialNumber.toUpperCase() === trimmedSerial)) {
      addToast(`Serial Number "${trimmedSerial}" already exists on another asset.`, 'error', 'Duplicate Serial Number');
      return { success: false, error: 'Duplicate Serial Number' };
    }

    const now = new Date().toISOString();
    const newAsset: Asset = {
      ...assetData,
      id: trimmedId,
      serialNumber: trimmedSerial,
      createdAt: now,
      updatedAt: now,
    };

    setAssets(prev => [newAsset, ...prev]);

    // If an employee was assigned on registration
    if (newAsset.assignedToEmployeeId && newAsset.status === 'Assigned') {
      const emp = employees.find(e => e.id === newAsset.assignedToEmployeeId);
      const newAssignment: Assignment = {
        id: `ASG-${Date.now().toString().slice(-4)}`,
        assetId: newAsset.id,
        employeeId: newAsset.assignedToEmployeeId,
        assignedDate: newAsset.purchaseDate || now.slice(0, 10),
        status: 'Active',
        conditionOnCheckout: 'Brand New (On Registration)',
        assignedBy: 'IT Administrator',
      };
      setAssignments(prev => [newAssignment, ...prev]);
      logActivity('assign', `Assigned newly registered asset ${newAsset.id} (${newAsset.name}) to ${emp?.name || newAsset.assignedToEmployeeId}.`, 'asset', newAsset.id);
    } else {
      logActivity('create', `Registered new asset ${newAsset.id} - ${newAsset.name}.`, 'asset', newAsset.id);
    }

    addToast(`Asset ${newAsset.id} (${newAsset.name}) successfully registered.`, 'success', 'Asset Created');
    return { success: true };
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    // Check serial uniqueness if changing serial
    if (updates.serialNumber) {
      const trimmedSerial = updates.serialNumber.trim().toUpperCase();
      if (assets.some(a => a.id !== id && a.serialNumber.toUpperCase() === trimmedSerial)) {
        addToast(`Serial Number "${trimmedSerial}" is already used by another asset.`, 'error', 'Serial Conflict');
        return { success: false, error: 'Serial Conflict' };
      }
      updates.serialNumber = trimmedSerial;
    }

    setAssets(prev =>
      prev.map(asset => {
        if (asset.id === id) {
          return {
            ...asset,
            ...updates,
            updatedAt: new Date().toISOString(),
          };
        }
        return asset;
      })
    );

    logActivity('update', `Updated details for asset ${id}.`, 'asset', id);
    addToast(`Asset ${id} updated successfully.`, 'success', 'Asset Updated');
    return { success: true };
  };

  const deleteAsset = (id: string) => {
    const target = assets.find(a => a.id === id);
    if (!target) return { success: false, error: 'Asset not found' };

    // Close any active assignments
    setAssignments(prev =>
      prev.map(asg => {
        if (asg.assetId === id && asg.status === 'Active') {
          return {
            ...asg,
            status: 'Returned',
            actualReturnDate: new Date().toISOString().slice(0, 10),
            returnNotes: 'Asset was deleted from inventory',
          };
        }
        return asg;
      })
    );

    setAssets(prev => prev.filter(a => a.id !== id));
    logActivity('delete', `Deleted asset ${id} (${target.name}) from inventory.`, 'asset', id);
    addToast(`Asset ${id} permanently removed.`, 'info', 'Asset Deleted');
    return { success: true };
  };

  const retireAsset = (id: string, reason = 'End of useful lifecycle') => {
    const target = assets.find(a => a.id === id);
    if (!target) return;

    // Close active assignments
    if (target.assignedToEmployeeId) {
      setAssignments(prev =>
        prev.map(asg => {
          if (asg.assetId === id && asg.status === 'Active') {
            return {
              ...asg,
              status: 'Returned',
              actualReturnDate: new Date().toISOString().slice(0, 10),
              returnNotes: `Asset retired: ${reason}`,
            };
          }
          return asg;
        })
      );
    }

    setAssets(prev =>
      prev.map(a =>
        a.id === id
          ? {
              ...a,
              status: 'Retired',
              assignedToEmployeeId: null,
              notes: `${a.notes ? a.notes + ' | ' : ''}Retired: ${reason}`,
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    );

    logActivity('update', `Retired asset ${id} (${target.name}). Reason: ${reason}`, 'asset', id);
    addToast(`Asset ${id} transitioned to Retired status.`, 'info', 'Asset Retired');
  };

  // --- Employee Operations ---
  const addEmployee = (employeeData: Omit<Employee, 'assignedAssetsCount'>) => {
    const trimmedId = employeeData.id.trim().toUpperCase();
    const trimmedEmail = employeeData.email.trim().toLowerCase();

    if (employees.some(e => e.id.toUpperCase() === trimmedId)) {
      addToast(`Employee ID "${trimmedId}" already exists.`, 'error', 'Duplicate Employee ID');
      return { success: false, error: 'Duplicate Employee ID' };
    }
    if (employees.some(e => e.email.toLowerCase() === trimmedEmail)) {
      addToast(`Email address "${trimmedEmail}" is already registered to another employee.`, 'error', 'Duplicate Email');
      return { success: false, error: 'Duplicate Email' };
    }

    const newEmp: Employee = {
      ...employeeData,
      id: trimmedId,
      email: trimmedEmail,
      assignedAssetsCount: 0,
    };

    setEmployees(prev => [newEmp, ...prev]);
    logActivity('create', `Added new employee ${newEmp.name} (${newEmp.id}) to ${newEmp.department}.`, 'employee', newEmp.id);
    addToast(`Employee ${newEmp.name} registered.`, 'success', 'Employee Added');
    return { success: true };
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    if (updates.email) {
      const emailLower = updates.email.trim().toLowerCase();
      if (employees.some(e => e.id !== id && e.email.toLowerCase() === emailLower)) {
        addToast(`Email "${emailLower}" is already in use by another employee.`, 'error', 'Email Conflict');
        return { success: false, error: 'Email Conflict' };
      }
      updates.email = emailLower;
    }

    setEmployees(prev =>
      prev.map(emp => (emp.id === id ? { ...emp, ...updates } : emp))
    );

    logActivity('update', `Updated employee record for ${id}.`, 'employee', id);
    addToast(`Employee profile updated.`, 'success', 'Profile Updated');
    return { success: true };
  };

  const deleteEmployee = (id: string) => {
    const emp = employees.find(e => e.id === id);
    if (!emp) return { success: false, error: 'Employee not found' };

    setEmployees(prev => prev.filter(e => e.id !== id));
    logActivity('delete', `Deleted employee record ${id} (${emp.name}).`, 'employee', id);
    addToast(`Employee ${emp.name} removed from directory.`, 'info', 'Employee Removed');
    return { success: true };
  };

  // --- Assignment Operations ---
  const assignAsset = (
    assetId: string,
    employeeId: string,
    options?: { expectedReturnDate?: string; notes?: string; assignedBy?: string }
  ) => {
    const asset = assets.find(a => a.id === assetId);
    const employee = employees.find(e => e.id === employeeId);

    if (!asset) {
      addToast('Asset not found.', 'error');
      return { success: false, error: 'Asset not found' };
    }
    if (!employee) {
      addToast('Employee not found.', 'error');
      return { success: false, error: 'Employee not found' };
    }
    if (employee.status === 'Inactive') {
      addToast(`Cannot assign asset to inactive employee (${employee.name}).`, 'error', 'Employee Inactive');
      return { success: false, error: 'Employee Inactive' };
    }
    if (asset.status !== 'Available') {
      addToast(
        `Asset ${asset.id} cannot be assigned because its current status is "${asset.status}". Only Available assets can be checked out.`,
        'error',
        'Asset Unavailable'
      );
      return { success: false, error: 'Asset not available' };
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const newAssignment: Assignment = {
      id: `ASG-${Date.now().toString().slice(-4)}`,
      assetId: asset.id,
      employeeId: employee.id,
      assignedDate: todayStr,
      expectedReturnDate: options?.expectedReturnDate,
      status: 'Active',
      conditionOnCheckout: 'Good / Checked by IT',
      checkoutNotes: options?.notes,
      assignedBy: options?.assignedBy || 'IT Administrator',
    };

    // Update assignment list
    setAssignments(prev => [newAssignment, ...prev]);

    // Update asset
    setAssets(prev =>
      prev.map(a =>
        a.id === assetId
          ? {
              ...a,
              status: 'Assigned',
              assignedToEmployeeId: employee.id,
              department: employee.department,
              location: employee.location,
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    );

    logActivity('assign', `Assigned ${asset.name} (${asset.id}) to ${employee.name} (${employee.department}).`, 'assignment', newAssignment.id);
    addToast(`${asset.name} successfully assigned to ${employee.name}.`, 'success', 'Asset Checked Out');
    return { success: true };
  };

  const returnAsset = (
    assignmentId: string,
    options: {
      returnCondition: string;
      returnNotes?: string;
      transitionTo: 'Available' | 'In Maintenance';
      maintenanceDetails?: {
        priority: MaintenancePriority;
        issue: string;
        technician: string;
        estimatedCost: number;
      };
    }
  ) => {
    const assignment = assignments.find(as => as.id === assignmentId);
    if (!assignment) {
      addToast('Assignment record not found.', 'error');
      return { success: false, error: 'Assignment not found' };
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const asset = assets.find(a => a.id === assignment.assetId);
    const employee = employees.find(e => e.id === assignment.employeeId);

    // Update assignment to returned
    setAssignments(prev =>
      prev.map(as =>
        as.id === assignmentId
          ? {
              ...as,
              status: 'Returned',
              actualReturnDate: todayStr,
              conditionOnReturn: options.returnCondition,
              returnNotes: options.returnNotes,
            }
          : as
      )
    );

    // Handle Asset Transition
    if (options.transitionTo === 'In Maintenance') {
      const maintenanceId = `MNT-${Date.now().toString().slice(-4)}`;
      const newMnt: MaintenanceRecord = {
        id: maintenanceId,
        assetId: assignment.assetId,
        issueDescription: options.maintenanceDetails?.issue || `Asset returned with issues: ${options.returnCondition}`,
        reportedDate: todayStr,
        priority: options.maintenanceDetails?.priority || 'Medium',
        technician: options.maintenanceDetails?.technician || 'Internal IT Tech',
        estimatedCost: options.maintenanceDetails?.estimatedCost || 100,
        status: 'Reported',
        resolutionNotes: options.returnNotes,
      };
      setMaintenance(prev => [newMnt, ...prev]);

      setAssets(prev =>
        prev.map(a =>
          a.id === assignment.assetId
            ? {
                ...a,
                status: 'In Maintenance',
                assignedToEmployeeId: null,
                updatedAt: new Date().toISOString(),
              }
            : a
        )
      );

      logActivity(
        'return',
        `Returned ${asset?.name || assignment.assetId} from ${employee?.name || assignment.employeeId}. Flagged for Maintenance (${maintenanceId}).`,
        'assignment',
        assignment.id
      );
      addToast(`Asset returned and routed directly to Maintenance.`, 'info', 'Returned to Maintenance');
    } else {
      setAssets(prev =>
        prev.map(a =>
          a.id === assignment.assetId
            ? {
                ...a,
                status: 'Available',
                assignedToEmployeeId: null,
                updatedAt: new Date().toISOString(),
              }
            : a
        )
      );

      logActivity(
        'return',
        `Processed return for ${asset?.name || assignment.assetId} from ${employee?.name || assignment.employeeId}. Asset is now Available in inventory.`,
        'assignment',
        assignment.id
      );
      addToast(`Asset returned to Available inventory stock.`, 'success', 'Asset Checked In');
    }

    return { success: true };
  };

  const reassignAsset = (
    assetId: string,
    newEmployeeId: string,
    options?: { notes?: string; assignedBy?: string }
  ) => {
    const asset = assets.find(a => a.id === assetId);
    const newEmployee = employees.find(e => e.id === newEmployeeId);

    if (!asset) return { success: false, error: 'Asset not found' };
    if (!newEmployee) return { success: false, error: 'New employee not found' };
    if (newEmployee.status === 'Inactive') {
      addToast(`Cannot reassign to inactive employee ${newEmployee.name}.`, 'error');
      return { success: false, error: 'Employee is inactive' };
    }

    const previousEmployeeId = asset.assignedToEmployeeId;
    const previousEmployee = employees.find(e => e.id === previousEmployeeId);
    const todayStr = new Date().toISOString().slice(0, 10);

    // Close current assignment
    setAssignments(prev =>
      prev.map(as => {
        if (as.assetId === assetId && as.status === 'Active') {
          return {
            ...as,
            status: 'Transferred',
            actualReturnDate: todayStr,
            returnNotes: `Transferred directly to ${newEmployee.name} (${newEmployee.id})`,
          };
        }
        return as;
      })
    );

    // Create new assignment
    const newAssignmentId = `ASG-${Date.now().toString().slice(-4)}`;
    const newAssignment: Assignment = {
      id: newAssignmentId,
      assetId,
      employeeId: newEmployeeId,
      assignedDate: todayStr,
      status: 'Active',
      conditionOnCheckout: 'Good (Direct Reassignment)',
      checkoutNotes: options?.notes || `Reassigned from ${previousEmployee?.name || previousEmployeeId}`,
      assignedBy: options?.assignedBy || 'IT Administrator',
    };

    setAssignments(prev => [newAssignment, ...prev]);

    // Update asset
    setAssets(prev =>
      prev.map(a =>
        a.id === assetId
          ? {
              ...a,
              assignedToEmployeeId: newEmployeeId,
              department: newEmployee.department,
              location: newEmployee.location,
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    );

    logActivity(
      'assign',
      `Reassigned ${asset.name} (${asset.id}) from ${previousEmployee?.name || 'Unassigned'} to ${newEmployee.name}.`,
      'assignment',
      newAssignmentId
    );
    addToast(`Asset ${asset.id} transferred to ${newEmployee.name}.`, 'success', 'Asset Reassigned');
    return { success: true };
  };

  // --- Maintenance Operations ---
  const createMaintenance = (data: Omit<MaintenanceRecord, 'id'>) => {
    const asset = assets.find(a => a.id === data.assetId);
    if (!asset) return { success: false, error: 'Asset not found' };

    const newId = `MNT-${Date.now().toString().slice(-4)}`;
    const newMnt: MaintenanceRecord = {
      ...data,
      id: newId,
    };

    setMaintenance(prev => [newMnt, ...prev]);

    // Update asset to In Maintenance
    setAssets(prev =>
      prev.map(a =>
        a.id === data.assetId
          ? {
              ...a,
              status: 'In Maintenance',
              updatedAt: new Date().toISOString(),
            }
          : a
      )
    );

    logActivity(
      'maintenance',
      `Created maintenance ticket ${newId} for ${asset.name} (${asset.id}): "${data.issueDescription}"`,
      'maintenance',
      newId
    );
    addToast(`Maintenance ticket ${newId} opened for ${asset.name}.`, 'success', 'Ticket Created');
    return { success: true };
  };

  const updateMaintenance = (
    id: string,
    updates: Partial<MaintenanceRecord>,
    resolveAction: 'Available' | 'Retired' = 'Available'
  ) => {
    const target = maintenance.find(m => m.id === id);
    if (!target) return { success: false, error: 'Record not found' };

    const isNowResolved = updates.status === 'Resolved' && target.status !== 'Resolved';
    const isNowCancelled = updates.status === 'Cancelled' && target.status !== 'Cancelled';

    const updatedRecord: MaintenanceRecord = {
      ...target,
      ...updates,
      completedDate: isNowResolved ? (updates.completedDate || new Date().toISOString().slice(0, 10)) : target.completedDate,
    };

    setMaintenance(prev => prev.map(m => (m.id === id ? updatedRecord : m)));

    // If resolved or cancelled, release asset from In Maintenance
    if (isNowResolved) {
      setAssets(prev =>
        prev.map(a => {
          if (a.id === target.assetId) {
            return {
              ...a,
              status: resolveAction === 'Retired' ? 'Retired' : 'Available',
              assignedToEmployeeId: resolveAction === 'Retired' ? null : a.assignedToEmployeeId,
              updatedAt: new Date().toISOString(),
            };
          }
          return a;
        })
      );
      logActivity('maintenance', `Resolved maintenance ticket ${id} for asset ${target.assetId}. Asset status set to ${resolveAction}.`, 'maintenance', id);
      addToast(`Ticket ${id} resolved. Asset is now ${resolveAction}.`, 'success', 'Ticket Resolved');
    } else if (isNowCancelled) {
      setAssets(prev =>
        prev.map(a =>
          a.id === target.assetId
            ? { ...a, status: 'Available', updatedAt: new Date().toISOString() }
            : a
        )
      );
      logActivity('maintenance', `Cancelled maintenance ticket ${id}. Asset returned to Available.`, 'maintenance', id);
      addToast(`Ticket ${id} cancelled.`, 'info', 'Ticket Cancelled');
    } else {
      logActivity('maintenance', `Updated maintenance ticket ${id} to ${updates.status || target.status}.`, 'maintenance', id);
      addToast(`Ticket ${id} updated.`, 'success', 'Ticket Updated');
    }

    return { success: true };
  };

  const deleteMaintenance = (id: string) => {
    setMaintenance(prev => prev.filter(m => m.id !== id));
    addToast(`Maintenance ticket ${id} deleted.`, 'info');
  };

  // --- License Operations ---
  const addLicense = (licenseData: Omit<SoftwareLicense, 'id' | 'assignedSeats'>) => {
    const newId = `LIC-${Date.now().toString().slice(-4)}`;
    const newLic: SoftwareLicense = {
      ...licenseData,
      id: newId,
      assignedSeats: licenseData.assignedEmployeeIds ? licenseData.assignedEmployeeIds.length : 0,
      assignedEmployeeIds: licenseData.assignedEmployeeIds || [],
    };

    setLicenses(prev => [newLic, ...prev]);
    logActivity('license', `Added software license ${newLic.softwareName} (${newLic.vendor}) with ${newLic.totalSeats} seats.`, 'license', newId);
    addToast(`License for ${newLic.softwareName} registered.`, 'success', 'License Added');
    return { success: true };
  };

  const updateLicense = (id: string, updates: Partial<SoftwareLicense>) => {
    setLicenses(prev =>
      prev.map(lic => {
        if (lic.id === id) {
          const totalSeats = updates.totalSeats ?? lic.totalSeats;
          const assignedIds = updates.assignedEmployeeIds ?? lic.assignedEmployeeIds;
          return {
            ...lic,
            ...updates,
            totalSeats,
            assignedEmployeeIds: assignedIds,
            assignedSeats: assignedIds.length,
          };
        }
        return lic;
      })
    );
    logActivity('license', `Updated software license ${id}.`, 'license', id);
    addToast('License details updated.', 'success');
    return { success: true };
  };

  const deleteLicense = (id: string) => {
    const lic = licenses.find(l => l.id === id);
    setLicenses(prev => prev.filter(l => l.id !== id));
    logActivity('license', `Deleted software license ${id} (${lic?.softwareName}).`, 'license', id);
    addToast(`License ${lic?.softwareName || id} removed.`, 'info');
  };

  const assignLicenseSeat = (licenseId: string, employeeId: string) => {
    const lic = licenses.find(l => l.id === licenseId);
    const emp = employees.find(e => e.id === employeeId);

    if (!lic) return { success: false, error: 'License not found' };
    if (!emp) return { success: false, error: 'Employee not found' };

    if (lic.assignedEmployeeIds.includes(employeeId)) {
      addToast(`${emp.name} already holds a seat for ${lic.softwareName}.`, 'info', 'Already Assigned');
      return { success: false, error: 'Already assigned' };
    }

    if (lic.assignedSeats >= lic.totalSeats) {
      addToast(
        `All ${lic.totalSeats} seats for ${lic.softwareName} are currently allocated. Please upgrade license seat count to add more users.`,
        'error',
        'Seat Limit Reached'
      );
      return { success: false, error: 'Seat limit reached' };
    }

    setLicenses(prev =>
      prev.map(l =>
        l.id === licenseId
          ? {
              ...l,
              assignedEmployeeIds: [...l.assignedEmployeeIds, employeeId],
              assignedSeats: l.assignedSeats + 1,
            }
          : l
      )
    );

    logActivity('license', `Allocated ${lic.softwareName} seat to ${emp.name} (${emp.id}).`, 'license', licenseId);
    addToast(`Seat allocated to ${emp.name}.`, 'success', 'License Assigned');
    return { success: true };
  };

  const revokeLicenseSeat = (licenseId: string, employeeId: string) => {
    const lic = licenses.find(l => l.id === licenseId);
    const emp = employees.find(e => e.id === employeeId);

    if (!lic) return { success: false, error: 'License not found' };

    setLicenses(prev =>
      prev.map(l =>
        l.id === licenseId
          ? {
              ...l,
              assignedEmployeeIds: l.assignedEmployeeIds.filter(id => id !== employeeId),
              assignedSeats: Math.max(0, l.assignedSeats - 1),
            }
          : l
      )
    );

    logActivity('license', `Revoked ${lic.softwareName} license seat from ${emp?.name || employeeId}.`, 'license', licenseId);
    addToast(`Seat revoked for ${emp?.name || employeeId}.`, 'info', 'Seat Revoked');
    return { success: true };
  };

  // --- Settings & Data Backup ---
  const updateSettings = (newSettings: Partial<CompanySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    logActivity('setting', 'Updated corporate configuration and system settings.', 'setting');
    addToast('System settings saved successfully.', 'success', 'Settings Saved');
  };

  const resetToSampleData = () => {
    setSettings(INITIAL_SETTINGS);
    setAssets(INITIAL_ASSETS);
    setEmployees(INITIAL_EMPLOYEES);
    setAssignments(INITIAL_ASSIGNMENTS);
    setMaintenance(INITIAL_MAINTENANCE);
    setLicenses(INITIAL_LICENSES);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    localStorage.clear();
    addToast('System restored to enterprise initial seed data.', 'info', 'Data Reset');
  };

  const exportDatabaseJSON = () => {
    const payload = {
      exportDate: new Date().toISOString(),
      version: '1.0.0',
      settings,
      assets,
      employees,
      assignments,
      maintenance,
      licenses,
      activityLogs,
    };
    const jsonStr = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AssetFlow_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Full system backup JSON downloaded.', 'success', 'Backup Exported');
  };

  const importDatabaseJSON = (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      if (!data.assets || !data.employees) {
        addToast('Invalid backup file structure.', 'error', 'Import Failed');
        return { success: false, error: 'Invalid structure' };
      }
      if (data.settings) setSettings(data.settings);
      if (data.assets) setAssets(data.assets);
      if (data.employees) setEmployees(data.employees);
      if (data.assignments) setAssignments(data.assignments);
      if (data.maintenance) setMaintenance(data.maintenance);
      if (data.licenses) setLicenses(data.licenses);
      if (data.activityLogs) setActivityLogs(data.activityLogs);

      addToast('Backup restored successfully.', 'success', 'Data Imported');
      return { success: true };
    } catch (e: any) {
      addToast(`Failed to parse JSON file: ${e.message}`, 'error', 'Import Failed');
      return { success: false, error: e.message };
    }
  };

  // --- Metrics Calculations ---
  const metrics = useMemo(() => {
    const totalAssets = assets.length;
    const assignedAssets = assets.filter(a => a.status === 'Assigned').length;
    const availableAssets = assets.filter(a => a.status === 'Available').length;
    const maintenanceAssets = assets.filter(a => a.status === 'In Maintenance').length;
    const retiredAssets = assets.filter(a => a.status === 'Retired').length;
    const lostAssets = assets.filter(a => a.status === 'Lost/Stolen').length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Expiring licenses (< 45 days)
    const expiringLicensesCount = licenses.filter(l => {
      const exp = new Date(l.expirationDate);
      const diffDays = (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 45 && diffDays >= 0;
    }).length;

    // Upcoming warranty expirations (< 90 days)
    const upcomingWarrantiesCount = assets.filter(a => {
      if (!a.warrantyExpiry) return false;
      const w = new Date(a.warrantyExpiry);
      const diffDays = (w.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diffDays <= 90 && diffDays >= 0;
    }).length;

    const pendingMaintenanceCount = maintenance.filter(
      m => m.status === 'Reported' || m.status === 'In Progress' || m.status === 'Awaiting Parts'
    ).length;

    return {
      totalAssets,
      assignedAssets,
      availableAssets,
      maintenanceAssets,
      retiredAssets,
      lostAssets,
      expiringLicensesCount,
      upcomingWarrantiesCount,
      pendingMaintenanceCount,
    };
  }, [assets, licenses, maintenance]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        quickSearchQuery,
        setQuickSearchQuery,
        assets,
        employees,
        assignments,
        maintenance,
        licenses,
        activityLogs,
        settings,
        toasts,
        addToast,
        removeToast,
        addAsset,
        updateAsset,
        deleteAsset,
        retireAsset,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        assignAsset,
        returnAsset,
        reassignAsset,
        createMaintenance,
        updateMaintenance,
        deleteMaintenance,
        addLicense,
        updateLicense,
        deleteLicense,
        assignLicenseSeat,
        revokeLicenseSeat,
        updateSettings,
        resetToSampleData,
        exportDatabaseJSON,
        importDatabaseJSON,
        metrics,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
