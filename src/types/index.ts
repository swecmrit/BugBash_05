export type AssetStatus = 'Available' | 'Assigned' | 'In Maintenance' | 'Retired' | 'Lost/Stolen';

export type EmployeeStatus = 'Active' | 'Inactive' | 'On Leave';

export type AssignmentStatus = 'Active' | 'Returned' | 'Transferred';

export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export type MaintenanceStatus = 'Reported' | 'In Progress' | 'Awaiting Parts' | 'Resolved' | 'Cancelled';

export type LicenseType = 'Perpetual' | 'Monthly' | 'Annual';

export type LicenseStatus = 'Active' | 'Expiring Soon' | 'Expired';

export interface AssetSpecifications {
  processor?: string;
  ram?: string;
  storage?: string;
  screenSize?: string;
  os?: string;
}

export interface Asset {
  id: string; // e.g. "AST-1001"
  name: string;
  category: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  purchaseDate: string;
  purchaseCost: number;
  warrantyExpiry: string;
  assignedToEmployeeId?: string | null;
  department: string;
  location: string;
  status: AssetStatus;
  notes?: string;
  specifications?: AssetSpecifications;
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string; // e.g. "EMP-101"
  name: string;
  email: string;
  department: string;
  designation: string;
  location: string;
  status: EmployeeStatus;
  phone?: string;
  joinDate: string;
  assignedAssetsCount: number;
  avatarBg?: string;
}

export interface Assignment {
  id: string; // e.g. "ASG-801"
  assetId: string;
  employeeId: string;
  assignedDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  status: AssignmentStatus;
  conditionOnCheckout: string;
  conditionOnReturn?: string;
  checkoutNotes?: string;
  returnNotes?: string;
  assignedBy: string;
}

export interface MaintenanceRecord {
  id: string; // e.g. "MNT-301"
  assetId: string;
  issueDescription: string;
  reportedDate: string;
  completedDate?: string;
  priority: MaintenancePriority;
  technician: string;
  estimatedCost: number;
  actualCost?: number;
  status: MaintenanceStatus;
  resolutionNotes?: string;
}

export interface SoftwareLicense {
  id: string; // e.g. "LIC-401"
  softwareName: string;
  vendor: string;
  licenseKey: string;
  licenseType: LicenseType;
  totalSeats: number;
  assignedSeats: number;
  purchaseDate: string;
  expirationDate: string;
  renewalCost: number;
  status: LicenseStatus;
  assignedEmployeeIds: string[];
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  actionType: 'create' | 'update' | 'delete' | 'assign' | 'return' | 'maintenance' | 'license' | 'setting';
  description: string;
  performedBy: string;
  entityType: 'asset' | 'employee' | 'assignment' | 'maintenance' | 'license' | 'setting';
  entityId?: string;
}

export interface CategoryConfig {
  id: string;
  name: string;
  iconName: string;
  defaultLifespanMonths: number;
}

export interface CompanySettings {
  companyName: string;
  organizationDomain: string;
  itAdminContact: string;
  primaryCurrency: string;
  fiscalYearStart: string;
  departments: string[];
  locations: string[];
  categories: CategoryConfig[];
  technicians: string[];
}

export type NavigationTab = 
  | 'overview' 
  | 'inventory' 
  | 'employees' 
  | 'assignments' 
  | 'maintenance' 
  | 'licenses' 
  | 'reports' 
  | 'settings';
