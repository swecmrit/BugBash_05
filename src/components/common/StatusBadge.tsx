import React from 'react';
import {
  AssetStatus,
  EmployeeStatus,
  MaintenancePriority,
  MaintenanceStatus,
  LicenseStatus,
} from '../../types';
import {
  getAssetStatusStyle,
  getEmployeeStatusStyle,
  getMaintenanceStatusStyle,
  getMaintenancePriorityStyle,
  getLicenseStatusStyle,
} from '../../utils/formatters';

interface StatusBadgeProps {
  type: 'asset' | 'employee' | 'maintenance-status' | 'maintenance-priority' | 'license';
  value: string;
}

// #AI REVIEW: DO NOT MODIFY THIS COMPONENT
export const StatusBadge: React.FC<StatusBadgeProps> = ({ type, value }) => {
  if (type === 'asset') {
    const style = getAssetStatusStyle(value as AssetStatus);
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${style.bg} ${style.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
        {value}
      </span>
    );
  }

  if (type === 'employee') {
    const style = getEmployeeStatusStyle(value as EmployeeStatus);
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${style.bg} ${style.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
        {value}
      </span>
    );
  }

  if (type === 'maintenance-status') {
    const style = getMaintenanceStatusStyle(value as MaintenanceStatus);
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${style.bg} ${style.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
        {value}
      </span>
    );
  }

  if (type === 'maintenance-priority') {
    const style = getMaintenancePriorityStyle(value as MaintenancePriority);
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs border ${style.bg} ${style.text}`}>
        {value}
      </span>
    );
  }

  if (type === 'license') {
    const style = getLicenseStatusStyle(value as LicenseStatus);
    return (
      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${style.bg} ${style.text}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
        {value}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200">
      {value}
    </span>
  );
};
