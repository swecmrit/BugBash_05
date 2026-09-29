import { AssetStatus, EmployeeStatus, MaintenancePriority, MaintenanceStatus, LicenseStatus } from '../types';

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function getDaysUntil(targetDateStr: string): number {
  const target = new Date(targetDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(dateString);
}

export function getAssetStatusStyle(status: AssetStatus): { text: string; bg: string; dot: string } {
  switch (status) {
    case 'Available':
      return { text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200/80', dot: 'bg-emerald-500' };
    case 'Assigned':
      return { text: 'text-blue-700', bg: 'bg-blue-50 border-blue-200/80', dot: 'bg-blue-500' };
    case 'In Maintenance':
      return { text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200/80', dot: 'bg-amber-500' };
    case 'Retired':
      return { text: 'text-slate-600', bg: 'bg-slate-100 border-slate-200', dot: 'bg-slate-400' };
    case 'Lost/Stolen':
      return { text: 'text-rose-700', bg: 'bg-rose-50 border-rose-200/80', dot: 'bg-rose-500' };
    default:
      return { text: 'text-slate-700', bg: 'bg-slate-50 border-slate-200', dot: 'bg-slate-400' };
  }
}

export function getEmployeeStatusStyle(status: EmployeeStatus): { text: string; bg: string; dot: string } {
  switch (status) {
    case 'Active':
      return { text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200/80', dot: 'bg-emerald-500' };
    case 'On Leave':
      return { text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200/80', dot: 'bg-amber-500' };
    case 'Inactive':
      return { text: 'text-slate-600', bg: 'bg-slate-100 border-slate-200', dot: 'bg-slate-400' };
    default:
      return { text: 'text-slate-700', bg: 'bg-slate-50 border-slate-200', dot: 'bg-slate-400' };
  }
}

export function getMaintenancePriorityStyle(priority: MaintenancePriority): { text: string; bg: string } {
  switch (priority) {
    case 'Critical':
      return { text: 'text-rose-700 font-semibold', bg: 'bg-rose-50 border-rose-200' };
    case 'High':
      return { text: 'text-orange-700 font-medium', bg: 'bg-orange-50 border-orange-200' };
    case 'Medium':
      return { text: 'text-blue-700 font-medium', bg: 'bg-blue-50 border-blue-200' };
    case 'Low':
      return { text: 'text-slate-600 font-medium', bg: 'bg-slate-100 border-slate-200' };
  }
}

export function getMaintenanceStatusStyle(status: MaintenanceStatus): { text: string; bg: string; dot: string } {
  switch (status) {
    case 'Reported':
      return { text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500' };
    case 'In Progress':
      return { text: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500' };
    case 'Awaiting Parts':
      return { text: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', dot: 'bg-purple-500' };
    case 'Resolved':
      return { text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' };
    case 'Cancelled':
      return { text: 'text-slate-600', bg: 'bg-slate-100 border-slate-200', dot: 'bg-slate-400' };
  }
}

export function getLicenseStatusStyle(status: LicenseStatus): { text: string; bg: string; dot: string } {
  switch (status) {
    case 'Active':
      return { text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' };
    case 'Expiring Soon':
      return { text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', dot: 'bg-amber-500' };
    case 'Expired':
      return { text: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', dot: 'bg-rose-500' };
  }
}
