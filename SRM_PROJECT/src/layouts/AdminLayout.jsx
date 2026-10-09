import {
  BarChart3,
  ClipboardList,
  FileText,
  GitCompare,
  LayoutDashboard,
  ListChecks,
  Package,
  PackageOpen,
  PieChart,
  ScrollText,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Users,
  UserCog,
  ReceiptText,
  Award,
  Bell,
} from 'lucide-react';
import { Outlet, Navigate } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout.jsx';

const adminItems = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  {
    section: 'Procurement Flow',
    items: [
      { label: '1. RFQs (Sourcing)', to: '/admin/rfqs', icon: FileText },
      { label: '2. Bid Matrix', to: '/admin/bids', icon: GitCompare },
      { label: '3. Purchase Orders', to: '/admin/orders', icon: ShoppingCart },
      { label: '4. Receipts & Reviews', to: '/admin/receipts-reviews', icon: PackageOpen },
      { label: '5. Invoices & Billing', to: '/admin/invoices', icon: ReceiptText },
    ],
  },
  {
    section: 'Management',
    items: [
      { label: 'Supplier Hub', to: '/admin/suppliers', icon: Users },
      { label: 'Notifications', to: '/admin/notifications', icon: Bell },
      { label: 'Audit Logs', to: '/admin/audit-logs', icon: ScrollText },
    ],
  },
];

export function AdminLayout() {
  const storedUser = sessionStorage.getItem('srm_user');
  const user = storedUser ? JSON.parse(storedUser) : null;

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout items={adminItems} title="SRM Portal" subtitle="Admin Console">
      <Outlet />
    </DashboardLayout>
  );
}

