import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { ToastContainer } from './components/common/ToastContainer';

// Views
import { OverviewView } from './components/dashboard/OverviewView';
import { AssetInventoryView } from './components/assets/AssetInventoryView';
import { EmployeeDirectoryView } from './components/employees/EmployeeDirectoryView';
import { AssignmentsView } from './components/assignments/AssignmentsView';
import { MaintenanceView } from './components/maintenance/MaintenanceView';
import { LicensesView } from './components/licenses/LicensesView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

// Modals
import { AssetModal } from './components/assets/AssetModal';
import { AssetDetailModal } from './components/assets/AssetDetailModal';
import { EmployeeModal } from './components/employees/EmployeeModal';
import { EmployeeDetailModal } from './components/employees/EmployeeDetailModal';
import { AssignmentModal } from './components/assignments/AssignmentModal';
import { ReturnAssetModal } from './components/assignments/ReturnAssetModal';
import { ReassignAssetModal } from './components/assignments/ReassignAssetModal';
import { MaintenanceModal } from './components/maintenance/MaintenanceModal';
import { LicenseModal } from './components/licenses/LicenseModal';
import { LicenseSeatModal } from './components/licenses/LicenseSeatModal';
import { ConfirmDialog } from './components/common/ConfirmDialog';

import { Asset, Employee, MaintenanceRecord, SoftwareLicense } from './types';

const MainLayout: React.FC = () => {
  const { activeTab, retireAsset } = useApp();

  // Layout states
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Asset Modals
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [assetToEdit, setAssetToEdit] = useState<Asset | null>(null);
  const [assetDetailModalOpen, setAssetDetailModalOpen] = useState(false);
  const [selectedAssetForDetail, setSelectedAssetForDetail] = useState<Asset | null>(null);

  // Employee Modals
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [employeeDetailModalOpen, setEmployeeDetailModalOpen] = useState(false);
  const [selectedEmployeeForDetail, setSelectedEmployeeForDetail] = useState<Employee | null>(null);

  // Assignment Modals
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [preselectedAssetForAssign, setPreselectedAssetForAssign] = useState<Asset | null>(null);
  const [preselectedEmployeeForAssign, setPreselectedEmployeeForAssign] = useState<Employee | null>(null);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [assetToReturn, setAssetToReturn] = useState<Asset | null>(null);
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [assetToReassign, setAssetToReassign] = useState<Asset | null>(null);

  // Maintenance Modals
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [maintenanceRecordToEdit, setMaintenanceRecordToEdit] = useState<MaintenanceRecord | null>(null);
  const [assetForMaintenance, setAssetForMaintenance] = useState<Asset | null>(null);

  // License Modals
  const [licenseModalOpen, setLicenseModalOpen] = useState(false);
  const [licenseToEdit, setLicenseToEdit] = useState<SoftwareLicense | null>(null);
  const [licenseSeatModalOpen, setLicenseSeatModalOpen] = useState(false);
  const [selectedLicenseForSeats, setSelectedLicenseForSeats] = useState<SoftwareLicense | null>(null);

  // Retire Asset Confirmation Modal
  const [assetToRetire, setAssetToRetire] = useState<Asset | null>(null);

  // Handlers for Asset Detail cross-navigation
  const handleOpenAssetDetail = (asset: Asset) => {
    setSelectedAssetForDetail(asset);
    setAssetDetailModalOpen(true);
  };

  const handleOpenEmployeeDetail = (employee: Employee) => {
    setSelectedEmployeeForDetail(employee);
    setEmployeeDetailModalOpen(true);
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* Persistent Left Sidebar */}
      <Sidebar
        isCollapsed={sidebarCollapsed}
        setIsCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenNewAssetModal={() => {
            setAssetToEdit(null);
            setAssetModalOpen(true);
          }}
          onOpenNewAssignmentModal={() => {
            setPreselectedAssetForAssign(null);
            setPreselectedEmployeeForAssign(null);
            setAssignmentModalOpen(true);
          }}
          onOpenNewMaintenanceModal={() => {
            setMaintenanceRecordToEdit(null);
            setAssetForMaintenance(null);
            setMaintenanceModalOpen(true);
          }}
          onOpenNewLicenseModal={() => {
            setLicenseToEdit(null);
            setLicenseModalOpen(true);
          }}
          onOpenNewEmployeeModal={() => {
            setEmployeeToEdit(null);
            setEmployeeModalOpen(true);
          }}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'overview' && (
              <OverviewView
                onOpenAssetModal={() => {
                  setAssetToEdit(null);
                  setAssetModalOpen(true);
                }}
                onOpenAssignModal={() => {
                  setPreselectedAssetForAssign(null);
                  setPreselectedEmployeeForAssign(null);
                  setAssignmentModalOpen(true);
                }}
                onOpenMaintenanceModal={() => {
                  setMaintenanceRecordToEdit(null);
                  setAssetForMaintenance(null);
                  setMaintenanceModalOpen(true);
                }}
                onOpenLicenseModal={() => {
                  setLicenseToEdit(null);
                  setLicenseModalOpen(true);
                }}
                onOpenAssetDetail={handleOpenAssetDetail}
              />
            )}

            {activeTab === 'inventory' && (
              <AssetInventoryView
                onOpenAssetModal={asset => {
                  setAssetToEdit(asset || null);
                  setAssetModalOpen(true);
                }}
                onOpenDetailModal={handleOpenAssetDetail}
                onOpenAssignModal={asset => {
                  setPreselectedAssetForAssign(asset);
                  setPreselectedEmployeeForAssign(null);
                  setAssignmentModalOpen(true);
                }}
                onOpenReturnModal={asset => {
                  setAssetToReturn(asset);
                  setReturnModalOpen(true);
                }}
                onOpenMaintenanceModal={asset => {
                  setMaintenanceRecordToEdit(null);
                  setAssetForMaintenance(asset);
                  setMaintenanceModalOpen(true);
                }}
              />
            )}

            {activeTab === 'employees' && (
              <EmployeeDirectoryView
                onOpenEmployeeModal={emp => {
                  setEmployeeToEdit(emp || null);
                  setEmployeeModalOpen(true);
                }}
                onOpenDetailModal={handleOpenEmployeeDetail}
                onAssignToEmployee={emp => {
                  setPreselectedEmployeeForAssign(emp);
                  setPreselectedAssetForAssign(null);
                  setAssignmentModalOpen(true);
                }}
              />
            )}

            {activeTab === 'assignments' && (
              <AssignmentsView
                onOpenAssignModal={() => {
                  setPreselectedAssetForAssign(null);
                  setPreselectedEmployeeForAssign(null);
                  setAssignmentModalOpen(true);
                }}
                onOpenReturnModal={asset => {
                  setAssetToReturn(asset);
                  setReturnModalOpen(true);
                }}
                onOpenReassignModal={asset => {
                  setAssetToReassign(asset);
                  setReassignModalOpen(true);
                }}
                onOpenAssetDetail={handleOpenAssetDetail}
              />
            )}

            {activeTab === 'maintenance' && (
              <MaintenanceView
                onOpenCreateModal={() => {
                  setMaintenanceRecordToEdit(null);
                  setAssetForMaintenance(null);
                  setMaintenanceModalOpen(true);
                }}
                onOpenEditModal={record => {
                  setMaintenanceRecordToEdit(record);
                  setAssetForMaintenance(null);
                  setMaintenanceModalOpen(true);
                }}
                onOpenAssetDetail={handleOpenAssetDetail}
              />
            )}

            {activeTab === 'licenses' && (
              <LicensesView
                onOpenLicenseModal={lic => {
                  setLicenseToEdit(lic || null);
                  setLicenseModalOpen(true);
                }}
                onOpenSeatModal={lic => {
                  setSelectedLicenseForSeats(lic);
                  setLicenseSeatModalOpen(true);
                }}
              />
            )}

            {activeTab === 'reports' && <ReportsView />}

            {activeTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />

      {/* Modals */}
      {/* 1. Asset Modal */}
      {assetModalOpen && (
        <AssetModal
          isOpen={assetModalOpen}
          onClose={() => setAssetModalOpen(false)}
          assetToEdit={assetToEdit}
        />
      )}

      {/* 2. Asset Detail Modal */}
      {assetDetailModalOpen && (
        <AssetDetailModal
          isOpen={assetDetailModalOpen}
          onClose={() => setAssetDetailModalOpen(false)}
          asset={selectedAssetForDetail}
          onEdit={asset => {
            setAssetToEdit(asset);
            setAssetModalOpen(true);
          }}
          onAssign={asset => {
            setPreselectedAssetForAssign(asset);
            setPreselectedEmployeeForAssign(null);
            setAssignmentModalOpen(true);
          }}
          onReturn={asset => {
            setAssetToReturn(asset);
            setReturnModalOpen(true);
          }}
          onRequestMaintenance={asset => {
            setMaintenanceRecordToEdit(null);
            setAssetForMaintenance(asset);
            setMaintenanceModalOpen(true);
          }}
          onRetire={asset => {
            setAssetToRetire(asset);
          }}
        />
      )}

      {/* 3. Employee Modal */}
      {employeeModalOpen && (
        <EmployeeModal
          isOpen={employeeModalOpen}
          onClose={() => setEmployeeModalOpen(false)}
          employeeToEdit={employeeToEdit}
        />
      )}

      {/* 4. Employee Detail Modal */}
      {employeeDetailModalOpen && (
        <EmployeeDetailModal
          isOpen={employeeDetailModalOpen}
          onClose={() => setEmployeeDetailModalOpen(false)}
          employee={selectedEmployeeForDetail}
          onEditEmployee={emp => {
            setEmployeeToEdit(emp);
            setEmployeeModalOpen(true);
          }}
          onAssignAssetToEmployee={emp => {
            setPreselectedEmployeeForAssign(emp);
            setPreselectedAssetForAssign(null);
            setAssignmentModalOpen(true);
          }}
          onReassignAsset={asset => {
            setAssetToReassign(asset);
            setReassignModalOpen(true);
          }}
          onReturnAsset={asset => {
            setAssetToReturn(asset);
            setReturnModalOpen(true);
          }}
        />
      )}

      {/* 5. Assignment Modal */}
      {assignmentModalOpen && (
        <AssignmentModal
          isOpen={assignmentModalOpen}
          onClose={() => setAssignmentModalOpen(false)}
          preselectedAsset={preselectedAssetForAssign}
          preselectedEmployee={preselectedEmployeeForAssign}
        />
      )}

      {/* 6. Return Asset Modal */}
      {returnModalOpen && (
        <ReturnAssetModal
          isOpen={returnModalOpen}
          onClose={() => setReturnModalOpen(false)}
          asset={assetToReturn}
        />
      )}

      {/* 7. Reassign Asset Modal */}
      {reassignModalOpen && (
        <ReassignAssetModal
          isOpen={reassignModalOpen}
          onClose={() => setReassignModalOpen(false)}
          asset={assetToReassign}
        />
      )}

      {/* 8. Maintenance Modal */}
      {maintenanceModalOpen && (
        <MaintenanceModal
          isOpen={maintenanceModalOpen}
          onClose={() => setMaintenanceModalOpen(false)}
          recordToEdit={maintenanceRecordToEdit}
          preselectedAsset={assetForMaintenance}
        />
      )}

      {/* 9. License Modal */}
      {licenseModalOpen && (
        <LicenseModal
          isOpen={licenseModalOpen}
          onClose={() => setLicenseModalOpen(false)}
          licenseToEdit={licenseToEdit}
        />
      )}

      {/* 10. License Seat Modal */}
      {licenseSeatModalOpen && (
        <LicenseSeatModal
          isOpen={licenseSeatModalOpen}
          onClose={() => setLicenseSeatModalOpen(false)}
          license={selectedLicenseForSeats}
        />
      )}

      {/* 11. Retire Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(assetToRetire)}
        onClose={() => setAssetToRetire(null)}
        onConfirm={() => {
          if (assetToRetire) {
            retireAsset(assetToRetire.id, 'Decommissioned by Administrator');
            setAssetToRetire(null);
          }
        }}
        title={`Retire Asset: ${assetToRetire?.id}?`}
        message={`This will transition ${assetToRetire?.name} to Retired status, remove it from active custodian checkout, and log a decommissioning event.`}
        confirmLabel="Decommission Asset"
        variant="warning"
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
