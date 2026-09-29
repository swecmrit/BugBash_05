import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import {
  LayoutDashboard,
  Laptop,
  Users,
  ArrowLeftRight,
  Wrench,
  KeyRound,
  BarChart3,
  Settings,
  Boxes,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const { activeTab, setActiveTab, metrics, settings } = useApp();

  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ElementType;
    badgeCount?: number;
    badgeVariant?: 'amber' | 'blue' | 'slate';
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'inventory', label: 'Asset Inventory', icon: Laptop, badgeCount: metrics.totalAssets, badgeVariant: 'slate' },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'assignments', label: 'Assignments', icon: ArrowLeftRight },
    {
      id: 'maintenance',
      label: 'Maintenance',
      icon: Wrench,
      badgeCount: metrics.pendingMaintenanceCount > 0 ? metrics.pendingMaintenanceCount : undefined,
      badgeVariant: 'amber',
    },
    {
      id: 'licenses',
      label: 'Software Licenses',
      icon: KeyRound,
      badgeCount: metrics.expiringLicensesCount > 0 ? metrics.expiringLicensesCount : undefined,
      badgeVariant: 'amber',
    },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 ease-in-out md:static ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80 bg-slate-950/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white shrink-0 shadow-xs shadow-blue-500/20">
              <Boxes className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold text-white tracking-tight leading-tight truncate">
                  AssetFlow
                </span>
                <span className="text-[11px] text-slate-400 font-medium tracking-wide truncate">
                  Enterprise IT Portal
                </span>
              </div>
            )}
          </div>

          {/* Collapse Button - Desktop only */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center w-7 h-7 text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Core Modules
            </div>
          )}
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-xs shadow-blue-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                {!isCollapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}

                {!isCollapsed && item.badgeCount !== undefined && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-semibold rounded tabular-nums ${
                      isActive
                        ? 'bg-blue-500 text-white'
                        : item.badgeVariant === 'amber'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info box */}
        {!isCollapsed ? (
          <div className="p-3 m-3 rounded-lg bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[11px] font-medium text-slate-300 truncate">
                {settings.companyName}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Inventory v2.4 · {metrics.totalAssets} Active Assets Tracked
            </p>
          </div>
        ) : (
          <div className="p-3 flex justify-center border-t border-slate-800">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Connected & synced" />
          </div>
        )}
      </aside>
    </>
  );
};
