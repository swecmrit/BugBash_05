import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Menu,
  Search,
  Plus,
  Laptop,
  ArrowLeftRight,
  Wrench,
  KeyRound,
  UserPlus,
  Bell,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenNewAssetModal: () => void;
  onOpenNewAssignmentModal: () => void;
  onOpenNewMaintenanceModal: () => void;
  onOpenNewLicenseModal: () => void;
  onOpenNewEmployeeModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  onOpenNewAssetModal,
  onOpenNewAssignmentModal,
  onOpenNewMaintenanceModal,
  onOpenNewLicenseModal,
  onOpenNewEmployeeModal,
}) => {
  const { activeTab, setActiveTab, quickSearchQuery, setQuickSearchQuery, metrics } = useApp();
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const tabLabels: Record<string, string> = {
    overview: 'Executive Overview',
    inventory: 'Asset Inventory',
    employees: 'Employee Directory',
    assignments: 'Asset Assignments',
    maintenance: 'Maintenance Operations',
    licenses: 'Software Licenses',
    reports: 'Reports & Analytics',
    settings: 'System Settings',
  };

  const currentTitle = tabLabels[activeTab] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 bg-white border-b border-slate-200">
      {/* Left: Mobile trigger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 md:hidden"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-slate-400">Portal</span>
          <span className="text-slate-300">/</span>
          <h1 className="text-sm font-semibold text-slate-900 tracking-tight">{currentTitle}</h1>
        </div>
      </div>

      {/* Middle: Live search bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          {/* #AI INSTRUCTION: PRESERVE CURRENT IMPLEMENTATION */}
          <input
            type="text"
            value={quickSearchQuery}
            onChange={e => {
              setQuickSearchQuery(e.target.value);
              if (activeTab === 'overview' && e.target.value) {
                setActiveTab('inventory');
              }
            }}
            placeholder="Quick search assets, serials, employees..."
            className="w-full pl-9 pr-4 py-1.5 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder:text-slate-400 transition-all"
          />
          {quickSearchQuery && (
            <button
              onClick={() => setQuickSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right: Actions & User */}
      <div className="flex items-center gap-3">
        {/* Quick Action Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setQuickMenuOpen(!quickMenuOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Action</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-80" />
          </button>

          {quickMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setQuickMenuOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-52 py-1 bg-white rounded-lg border border-slate-200 shadow-xl z-40 text-xs">
                <div className="px-3 py-1 text-[10px] font-semibold uppercase text-slate-400">
                  Quick Actions
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setQuickMenuOpen(false);
                    onOpenNewAssetModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <Laptop className="w-4 h-4 text-blue-600" />
                  <span>Register New Asset</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickMenuOpen(false);
                    onOpenNewAssignmentModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <ArrowLeftRight className="w-4 h-4 text-emerald-600" />
                  <span>Assign Asset</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickMenuOpen(false);
                    onOpenNewMaintenanceModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <Wrench className="w-4 h-4 text-amber-600" />
                  <span>Log Maintenance Request</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickMenuOpen(false);
                    onOpenNewLicenseModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors text-left"
                >
                  <KeyRound className="w-4 h-4 text-purple-600" />
                  <span>Add Software License</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuickMenuOpen(false);
                    onOpenNewEmployeeModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-700 hover:bg-slate-50 transition-colors text-left border-t border-slate-100"
                >
                  <UserPlus className="w-4 h-4 text-indigo-600" />
                  <span>Add Employee</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Alerts / Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
            title="System alerts"
            aria-label="System alerts"
          >
            <Bell className="w-4 h-4" />
            {metrics.pendingMaintenanceCount + metrics.expiringLicensesCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-1.5 w-72 p-3 bg-white rounded-lg border border-slate-200 shadow-xl z-40 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-semibold text-slate-900">System Alerts</span>
                  <span className="text-[10px] text-slate-500 tabular-nums">
                    {metrics.pendingMaintenanceCount + metrics.expiringLicensesCount} Pending
                  </span>
                </div>
                <div className="divide-y divide-slate-100 py-1 space-y-1">
                  {metrics.pendingMaintenanceCount > 0 ? (
                    <div
                      onClick={() => {
                        setActiveTab('maintenance');
                        setShowNotifications(false);
                      }}
                      className="py-2 cursor-pointer hover:bg-slate-50 rounded px-1"
                    >
                      <p className="font-medium text-amber-700">
                        {metrics.pendingMaintenanceCount} Active Maintenance Tickets
                      </p>
                      <p className="text-[11px] text-slate-500">Hardware requiring repair or diagnostics.</p>
                    </div>
                  ) : null}

                  {metrics.expiringLicensesCount > 0 ? (
                    <div
                      onClick={() => {
                        setActiveTab('licenses');
                        setShowNotifications(false);
                      }}
                      className="py-2 cursor-pointer hover:bg-slate-50 rounded px-1"
                    >
                      <p className="font-medium text-rose-700">
                        {metrics.expiringLicensesCount} Software Licenses Expiring
                      </p>
                      <p className="text-[11px] text-slate-500">Renewals required within 45 days.</p>
                    </div>
                  ) : null}

                  {metrics.pendingMaintenanceCount === 0 && metrics.expiringLicensesCount === 0 && (
                    <div className="py-4 text-center text-slate-500 text-xs">
                      All systems and inventory in good standing.
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Admin profile chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold">
            IT
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight">Admin Portal</span>
            <span className="text-[10px] text-slate-500 leading-tight">Corporate Superuser</span>
          </div>
        </div>
      </div>
    </header>
  );
};
